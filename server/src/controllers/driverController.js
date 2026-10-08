const DriverProfile = require("../models/DriverProfile");
const User = require("../models/User");
const mockStore = require("../store/mockStore");
const { isMongoConnected } = require("../config/db");
const {
  haversineDistance,
  knn,
  greedyDriverMatching,
  locationCoordinates,
  rankDrivers
} = require("../algorithms");

// Get Nearby Drivers using Haversine, KNN, and Greedy Matching algorithms
const getNearbyDrivers = async (req, res) => {
  try {
    const {
      pickup = "Sambhram Institute of Technology",
      vehicleType = "Bike",
      pinkRide = false,
      k = 3,
      lat,
      lng
    } = req.query;

    const isPinkRide = pinkRide === "true" || pinkRide === true;

    // Resolve pickup coordinates
    let pickupCoords = locationCoordinates[pickup];
    if (lat && lng) {
      pickupCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
    if (!pickupCoords) {
      pickupCoords = locationCoordinates["Sambhram Institute of Technology"];
    }

    // Retrieve drivers from MongoDB or mockStore
    let allDrivers = [];
    if (isMongoConnected()) {
      allDrivers = await DriverProfile.find({
        availability: "Available",
        verificationStatus: "verified"
      }).lean();
    }

    if (!allDrivers || allDrivers.length === 0) {
      allDrivers = mockStore.getDrivers();
    }

    // Filter available drivers by vehicle and Pink Ride rules
    let candidatePool = allDrivers.filter(driver => {
      // Must be available
      const isAvailable = driver.availability === "Available";
      if (!isAvailable) return false;

      // Vehicle type filter
      if (vehicleType && driver.vehicleType && driver.vehicleType.toLowerCase() !== vehicleType.toLowerCase()) {
        return false;
      }

      // CRITICAL PINK RIDE RULE:
      // If Pink Ride is requested, strictly allow only female riders!
      if (isPinkRide) {
        const isFemale = driver.gender === "female" || driver.pinkRideEligible === true;
        if (!isFemale) return false;
      }

      return true;
    });

    if (candidatePool.length === 0) {
      return res.status(200).json({
        success: true,
        message: isPinkRide
          ? "No verified female riders are currently available for Pink Ride in this area."
          : "No riders are currently available nearby.",
        drivers: [],
        recommendedDriver: null,
        algorithmData: {
          knnNeighbors: [],
          matchingFormula: "Score = (1/(Distance+0.1))*0.50 + (Rating/5)*0.35 + (1/(ETA+1))*0.15"
        }
      });
    }

    // Algorithm 1: Calculate precise Haversine distance for each rider to the pickup location
    const driversWithDistance = candidatePool.map(driver => {
      const driverLat = driver.latitude || 13.0805;
      const driverLng = driver.longitude || 77.5458;
      
      const distance = haversineDistance(
        pickupCoords.lat,
        pickupCoords.lng,
        driverLat,
        driverLng
      );

      // Estimate ETA based on average campus traffic speed (~25 km/h for bike, 20 km/h for car)
      const speedKmPerMin = driver.vehicleType === "Bike" ? 0.4 : 0.35;
      const eta = Math.max(2, Math.round(distance / speedKmPerMin));

      return {
        ...driver,
        id: driver._id?.toString() || driver.id,
        _id: driver._id?.toString() || driver.id,
        distanceKm: distance,
        distance: distance,
        etaMinutes: eta,
        eta: eta,
        isAvailable: true,
        isActive: true
      };
    });

    // Algorithm 2: K-Nearest Neighbors (KNN) to isolate top K candidates
    const knnCandidates = knn(
      driversWithDistance,
      { distanceKm: 0, minimumRating: 4.8, maximumEta: 5 },
      parseInt(k, 10) || 4
    );

    // Algorithm 3: Greedy Driver Matching to calculate multi-factor score and select best candidate
    const greedyResult = greedyDriverMatching(knnCandidates.length > 0 ? knnCandidates : driversWithDistance, {
      vehicleType,
      pinkRide: isPinkRide
    });

    return res.status(200).json({
      success: true,
      pickup,
      pickupCoordinates: pickupCoords,
      drivers: greedyResult.candidates || driversWithDistance,
      recommendedDriver: greedyResult.driver,
      algorithmData: {
        knnNeighbors: knnCandidates.map(c => ({
          name: c.name,
          distance: c.distanceKm,
          rating: c.rating,
          eta: c.etaMinutes,
          knnScore: c.knnScore
        })),
        greedySelectionScore: greedyResult.matchingScore,
        formula: "Score = (1/(Distance+0.1))*0.50 + (Rating/5)*0.35 + (1/(ETA+1))*0.15"
      }
    });
  } catch (error) {
    console.error("Error fetching nearby drivers:", error);
    return res.status(500).json({ success: false, message: "Error matching nearby drivers." });
  }
};

// Get Driver Profile
const getDriverProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    let profile = null;

    if (isMongoConnected()) {
      profile = await DriverProfile.findOne({ userId });
    }
    if (!profile) {
      profile = mockStore.getDriverByUserId(userId);
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: "Driver profile not found." });
    }

    return res.json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error fetching driver profile." });
  }
};

// Create or update driver registration & vehicle verification
const registerDriverProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      vehicleType,
      vehicleNumber,
      vehicleModel,
      rcNumber,
      rcDocument,
      identityDocument
    } = req.body;

    if (!vehicleType || !vehicleNumber) {
      return res.status(400).json({ success: false, message: "Vehicle type and number are required." });
    }

    // Look up user info for gender and name
    let user = null;
    if (isMongoConnected()) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = mockStore.findUserById(userId);
    }

    const isFemale = user?.gender === "female";
    const profileData = {
      userId,
      name: user?.name || "Campus Rider",
      phone: user?.phone || "9876543210",
      email: user?.email || "driver@campusride.demo",
      usn: user?.usn || "1ST23CS000",
      gender: user?.gender || "female",
      vehicleType,
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      vehicleModel: vehicleModel || (vehicleType === "Bike" ? "TVS Jupiter" : "Maruti Swift"),
      rcNumber: rcNumber || "RC-" + Math.floor(1000 + Math.random() * 9000),
      rcDocument: rcDocument || "uploaded",
      identityDocument: identityDocument || "uploaded",
      faceVerificationStatus: "verified",
      verificationStatus: "verified", // Realistic demo auto-verification
      pinkRideEligible: isFemale,
      rating: 4.8,
      completedRides: 12,
      availability: "Available",
      latitude: 13.0805,
      longitude: 77.5458,
      currentLocationName: "Sambhram Institute of Technology"
    };

    let savedProfile = null;
    if (isMongoConnected()) {
      savedProfile = await DriverProfile.findOneAndUpdate(
        { userId },
        profileData,
        { new: true, upsert: true }
      );
      // Switch user's primary role to driver
      await User.findByIdAndUpdate(userId, { role: "driver" });
    }

    // Also update mockStore
    savedProfile = mockStore.upsertDriverProfile({
      ...profileData,
      _id: savedProfile?._id?.toString() || "d_" + userId
    });

    return res.status(200).json({
      success: true,
      message: "Driver documents verified & profile registered successfully.",
      profile: savedProfile
    });
  } catch (error) {
    console.error("Register driver error:", error);
    return res.status(500).json({ success: false, message: "Server error registering driver." });
  }
};

// Toggle Driver Availability (Available <-> Offline)
const updateAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { availability } = req.body;

    if (!["Available", "Offline", "On Ride"].includes(availability)) {
      return res.status(400).json({ success: false, message: "Invalid availability status." });
    }

    let updated = null;
    if (isMongoConnected()) {
      updated = await DriverProfile.findOneAndUpdate(
        { userId },
        { availability },
        { new: true }
      );
    }

    const mockProfile = mockStore.getDriverByUserId(userId);
    if (mockProfile) {
      mockProfile.availability = availability;
      updated = mockProfile;
    }

    return res.json({
      success: true,
      message: `Driver status updated to ${availability}.`,
      availability
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update availability." });
  }
};

module.exports = {
  getNearbyDrivers,
  getDriverProfile,
  registerDriverProfile,
  updateAvailability
};

const Ride = require("../models/Ride");
const DriverProfile = require("../models/DriverProfile");
const User = require("../models/User");
const Feedback = require("../models/Feedback");
const mockStore = require("../store/mockStore");
const { isMongoConnected } = require("../config/db");
const {
  haversineDistance,
  knn,
  greedyDriverMatching,
  dijkstra,
  aStar,
  campusGraph,
  locationCoordinates,
  generateRidePIN,
  verifyRidePIN,
  updateDriverRatingWithBayesianWeight,
  RideTransaction
} = require("../algorithms");

// Helper to access socket.io if attached to app
const getIO = (req) => req.app.get("io");

// 1. Create and Book a Ride
const createRide = async (req, res) => {
  try {
    const passengerId = req.user.id;
    const {
      pickup,
      destination,
      vehicleType = "Bike",
      pinkRide = false,
      selectedDriverId,
      pickupCoords: customPickupCoords,
      destinationCoords: customDestCoords
    } = req.body;

    if (!pickup || !destination) {
      return res.status(400).json({ success: false, message: "Pickup and destination locations are required." });
    }

    // CAMPUS LOCATION RULE:
    // At least ONE of the two ride locations must be: Sambhram Institute of Technology
    const CAMPUS_NAME = "Sambhram Institute of Technology";
    const isCampusPickup = pickup.toLowerCase().includes("sambhram");
    const isCampusDestination = destination.toLowerCase().includes("sambhram");

    if (!isCampusPickup && !isCampusDestination) {
      return res.status(400).json({
        success: false,
        message: `CampusRide Policy: At least one location (Pickup or Destination) must be ${CAMPUS_NAME}.`
      });
    }

    if (pickup.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Pickup and destination cannot be identical."
      });
    }

    // Resolve GPS Coordinates
    const pickupCoords = customPickupCoords || locationCoordinates[pickup] || locationCoordinates[CAMPUS_NAME];
    const destinationCoords = customDestCoords || locationCoordinates[destination] || {
      lat: 13.0760,
      lng: 77.5580
    };

    // Algorithm 1: Haversine distance
    let distance = haversineDistance(
      pickupCoords.lat,
      pickupCoords.lng,
      destinationCoords.lat,
      destinationCoords.lng
    );

    // Fallback minimum distance
    if (!distance || distance < 0.5) distance = 1.8;

    // Route calculation using Dijkstra / A*
    let routeInfo = dijkstra(campusGraph, pickup, destination);
    if (!routeInfo || !routeInfo.success) {
      routeInfo = aStar(campusGraph, pickup, destination);
    }
    const routePath = routeInfo?.success ? routeInfo.path : [pickup, destination];

    // Fare calculation
    // Bike: Distance * ₹5 (minimum ₹20)
    // Car: Distance * ₹10 (minimum ₹40)
    const ratePerKm = vehicleType === "Car" ? 10 : 5;
    const baseFare = distance * ratePerKm;
    const minFare = vehicleType === "Car" ? 40 : 20;
    const fare = Math.round(Math.max(minFare, baseFare));

    // Estimated arrival duration
    const speed = vehicleType === "Car" ? 0.35 : 0.45;
    const eta = Math.max(3, Math.round(distance / speed));

    // Algorithm 8: Generate 4-digit Ride PIN & SHA-256 Hash
    const { pin, pinHash } = generateRidePIN();

    // Driver Selection / Matching
    let assignedDriver = null;

    // Check if passenger picked a specific driver
    if (selectedDriverId) {
      if (isMongoConnected()) {
        assignedDriver = await DriverProfile.findById(selectedDriverId);
      }
      if (!assignedDriver) {
        assignedDriver = mockStore.getDriverById(selectedDriverId);
      }
    }

    // Otherwise use Algorithm 2 (KNN) + Algorithm 3 (Greedy Driver Matching)
    if (!assignedDriver) {
      let drivers = [];
      if (isMongoConnected()) {
        drivers = await DriverProfile.find({ availability: "Available" }).lean();
      }
      if (!drivers || drivers.length === 0) {
        drivers = mockStore.getDrivers();
      }

      // Filter available & pink ride suitability
      const availableCandidates = drivers.filter(d => {
        if (d.availability !== "Available") return false;
        if (vehicleType && d.vehicleType && d.vehicleType.toLowerCase() !== vehicleType.toLowerCase()) return false;
        if (pinkRide && !d.pinkRideEligible && d.gender !== "female") return false;
        return true;
      });

      if (availableCandidates.length === 0) {
        return res.status(400).json({
          success: false,
          message: pinkRide
            ? "No verified female riders are currently available for Pink Ride."
            : "No riders are currently available. Please try again shortly."
        });
      }

      // Compute distances for candidates
      const candidatesWithDist = availableCandidates.map(d => {
        const dLat = d.latitude || 13.0805;
        const dLng = d.longitude || 77.5458;
        const distToPickup = haversineDistance(pickupCoords.lat, pickupCoords.lng, dLat, dLng);
        return {
          ...d,
          distanceKm: distToPickup,
          distance: distToPickup,
          etaMinutes: Math.max(2, Math.round(distToPickup / 0.4)),
          isActive: true,
          isAvailable: true
        };
      });

      // KNN
      const topK = knn(candidatesWithDist, { distanceKm: 0, minimumRating: 4.5, maximumEta: 5 }, 3);

      // Greedy Matching
      const matchResult = greedyDriverMatching(topK.length > 0 ? topK : candidatesWithDist, {
        vehicleType,
        pinkRide
      });

      assignedDriver = matchResult.driver;
    }

    if (!assignedDriver) {
      return res.status(400).json({ success: false, message: "Unable to match a driver at this time." });
    }

    const driverIdStr = assignedDriver._id?.toString() || assignedDriver.id;

    // Create Ride in MongoDB or mockStore
    let ride = null;
    const rideData = {
      passengerId,
      driverId: driverIdStr,
      pickup,
      destination,
      pickupCoordinates: pickupCoords,
      destinationCoordinates: destinationCoords,
      distance,
      vehicleType,
      pinkRide,
      fare,
      eta,
      otp: pin,
      otpHash: pinHash,
      status: "DRIVER_ASSIGNED",
      paymentStatus: "Pending",
      paymentMethod: "UPI",
      routePath,
      driverDetails: {
        id: driverIdStr,
        name: assignedDriver.name,
        phone: assignedDriver.phone,
        usn: assignedDriver.usn,
        gender: assignedDriver.gender,
        vehicleType: assignedDriver.vehicleType,
        vehicleNumber: assignedDriver.vehicleNumber,
        vehicleModel: assignedDriver.vehicleModel,
        rating: assignedDriver.rating,
        completedRides: assignedDriver.completedRides,
        profileImage: assignedDriver.profileImage
      }
    };

    if (isMongoConnected()) {
      ride = await Ride.create(rideData);
      // Mark driver On Ride
      await DriverProfile.findByIdAndUpdate(driverIdStr, { availability: "On Ride" });
    }

    // Mirror in mockStore
    const mockRide = mockStore.createRide({
      ...rideData,
      _id: ride?._id?.toString() || "r_" + Date.now(),
      id: ride?._id?.toString() || "r_" + Date.now()
    });
    mockStore.updateDriverAvailability(driverIdStr, "On Ride");

    const finalRide = ride ? ride.toObject() : mockRide;
    finalRide.driverDetails = rideData.driverDetails;

    // Socket.io Real-time dispatch for 2-device demo
    const io = getIO(req);
    if (io) {
      // Notify driver in real time
      io.emit("incoming_ride_request", {
        driverId: driverIdStr,
        ride: finalRide
      });

      // Notify passenger
      io.emit(`ride_update_${finalRide._id || finalRide.id}`, finalRide);
    }

    return res.status(201).json({
      success: true,
      message: "Ride booked successfully! Captain is on the way.",
      ride: finalRide
    });
  } catch (error) {
    console.error("Create ride error:", error);
    return res.status(500).json({ success: false, message: "Server error creating ride." });
  }
};

// 2. Get Ride by ID
const getRideById = async (req, res) => {
  try {
    const { id } = req.params;
    let ride = null;

    if (isMongoConnected()) {
      ride = await Ride.findById(id).lean();
    }
    if (!ride) {
      ride = mockStore.getRideById(id);
    }

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found." });
    }

    // Populate driver info if needed
    if (!ride.driverDetails && ride.driverId) {
      let driver = null;
      if (isMongoConnected()) {
        driver = await DriverProfile.findById(ride.driverId).lean();
      }
      if (!driver) {
        driver = mockStore.getDriverById(ride.driverId);
      }
      if (driver) {
        ride.driverDetails = {
          name: driver.name,
          phone: driver.phone,
          usn: driver.usn,
          vehicleType: driver.vehicleType,
          vehicleNumber: driver.vehicleNumber,
          vehicleModel: driver.vehicleModel,
          rating: driver.rating,
          profileImage: driver.profileImage
        };
      }
    }

    return res.json({ success: true, ride });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve ride details." });
  }
};

// 3. Update Ride Status (DRIVER_ARRIVING, RIDE_STARTED, RIDE_COMPLETED, CANCELLED)
const updateRideStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, enteredPin, paymentStatus, paymentMethod } = req.body;

    let ride = null;
    if (isMongoConnected()) {
      ride = await Ride.findById(id);
    }
    if (!ride) {
      ride = mockStore.getRideById(id);
    }

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found." });
    }

    const updates = {};

    // Starting ride requires SHA-256 OTP verification!
    if (status === "RIDE_STARTED") {
      if (!enteredPin) {
        return res.status(400).json({
          success: false,
          message: "Passenger Ride PIN is required to start the ride."
        });
      }

      const isValidPin = verifyRidePIN(enteredPin, ride.otpHash) || String(enteredPin) === String(ride.otp);
      if (!isValidPin) {
        return res.status(400).json({
          success: false,
          message: "Incorrect PIN. SHA-256 verification failed. Please ask passenger for the 4-digit PIN."
        });
      }

      updates.status = "RIDE_STARTED";
    } else if (status === "RIDE_COMPLETED") {
      updates.status = "RIDE_COMPLETED";
      updates.completedAt = new Date();
      if (paymentStatus) updates.paymentStatus = paymentStatus;
      if (paymentMethod) updates.paymentMethod = paymentMethod;

      // Reset driver to Available
      const driverIdStr = ride.driverId?.toString() || ride.driverId;
      if (driverIdStr) {
        if (isMongoConnected()) {
          await DriverProfile.findByIdAndUpdate(driverIdStr, {
            availability: "Available",
            $inc: { completedRides: 1 }
          });
        }
        const mockDriver = mockStore.getDriverById(driverIdStr);
        if (mockDriver) {
          mockDriver.availability = "Available";
          mockDriver.completedRides = (mockDriver.completedRides || 0) + 1;
        }
      }
    } else if (status === "CANCELLED") {
      updates.status = "CANCELLED";
      const driverIdStr = ride.driverId?.toString() || ride.driverId;
      if (driverIdStr) {
        if (isMongoConnected()) {
          await DriverProfile.findByIdAndUpdate(driverIdStr, { availability: "Available" });
        }
        mockStore.updateDriverAvailability(driverIdStr, "Available");
      }
    } else if (status) {
      updates.status = status;
    }

    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (paymentMethod) updates.paymentMethod = paymentMethod;

    let updatedRide = null;
    if (isMongoConnected()) {
      updatedRide = await Ride.findByIdAndUpdate(id, updates, { new: true }).lean();
    }
    const mockUpdated = mockStore.updateRide(id, updates);
    if (!updatedRide) {
      updatedRide = mockUpdated;
    }

    // Socket.io Real-Time Broadcast
    const io = getIO(req);
    if (io) {
      io.emit(`ride_update_${id}`, updatedRide);
      io.emit("ride_status_broadcast", { rideId: id, status: updatedRide.status });
    }

    return res.json({
      success: true,
      message: `Ride status updated to ${updatedRide.status}.`,
      ride: updatedRide
    });
  } catch (error) {
    console.error("Update ride status error:", error);
    return res.status(500).json({ success: false, message: "Error updating ride status." });
  }
};

// 4. Submit Ride Feedback & Recalculate Driver Rating using Algorithm 7
const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const passengerId = req.user.id;
    const { rating, comment } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5 stars." });
    }

    let ride = null;
    if (isMongoConnected()) {
      ride = await Ride.findById(id);
    }
    if (!ride) {
      ride = mockStore.getRideById(id);
    }

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found." });
    }

    const driverIdStr = ride.driverId?.toString() || ride.driverId;

    // Get current driver profile
    let driver = null;
    if (isMongoConnected()) {
      driver = await DriverProfile.findById(driverIdStr);
    }
    if (!driver) {
      driver = mockStore.getDriverById(driverIdStr);
    }

    const currentRating = driver?.rating || 4.8;
    const completedRides = driver?.completedRides || 10;

    // Algorithm 7: Bayesian Weighted Average Rating Update
    const ratingUpdate = updateDriverRatingWithBayesianWeight(
      currentRating,
      completedRides,
      numRating
    );

    // Save feedback & update driver rating
    if (isMongoConnected()) {
      await Feedback.create({
        rideId: id,
        passengerId,
        driverId: driverIdStr,
        rating: numRating,
        comment: comment || ""
      });

      await Ride.findByIdAndUpdate(id, {
        rating: numRating,
        feedbackComment: comment || ""
      });

      if (driver) {
        await DriverProfile.findByIdAndUpdate(driverIdStr, {
          rating: ratingUpdate.weightedRating
        });
      }
    }

    // Mirror to mockStore
    mockStore.addFeedback({
      rideId: id,
      passengerId,
      driverId: driverIdStr,
      rating: numRating,
      comment: comment || ""
    });
    mockStore.updateRide(id, {
      rating: numRating,
      feedbackComment: comment || ""
    });
    if (driver) {
      driver.rating = ratingUpdate.weightedRating;
    }

    return res.json({
      success: true,
      message: "Thank you for your rating! Driver rating updated using Weighted Average algorithm.",
      ratingStats: {
        driverName: driver?.name,
        newWeightedRating: ratingUpdate.weightedRating,
        rawAverage: ratingUpdate.rawAverage,
        totalRides: ratingUpdate.totalRides
      }
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit feedback." });
  }
};

// 5. Ride History
const getRideHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    let rides = [];

    if (isMongoConnected()) {
      // Find driver profile for user if any
      const driver = await DriverProfile.findOne({ userId });
      const query = {
        $or: [
          { passengerId: userId },
          ...(driver ? [{ driverId: driver._id }] : [])
        ]
      };
      rides = await Ride.find(query).sort({ createdAt: -1 }).lean();
    }

    if (!rides || rides.length === 0) {
      rides = mockStore.getRidesByUserId(userId);
      if (rides.length === 0) {
        // Return demo history for preview
        rides = mockStore.rides;
      }
    }

    return res.json({ success: true, count: rides.length, rides });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch ride history." });
  }
};

module.exports = {
  createRide,
  getRideById,
  updateRideStatus,
  submitFeedback,
  getRideHistory
};

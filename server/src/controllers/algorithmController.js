const {
  haversineDistance,
  knn,
  greedyDriverMatching,
  dijkstra,
  campusGraph,
  aStar,
  locationCoordinates,
  KalmanFilter,
  smoothGPS,
  weightedAverage,
  updateDriverRatingWithBayesianWeight,
  rankDrivers,
  sha256,
  generateRidePIN,
  verifyRidePIN,
  RideTransaction
} = require("../algorithms");
const mockStore = require("../store/mockStore");

// Algorithm 1: Haversine Distance
const testHaversine = (req, res) => {
  try {
    const { lat1, lon1, lat2, lon2, loc1, loc2 } = req.body;

    let c1 = { lat: lat1, lng: lon1 };
    let c2 = { lat: lat2, lng: lon2 };

    if (loc1 && locationCoordinates[loc1]) c1 = locationCoordinates[loc1];
    if (loc2 && locationCoordinates[loc2]) c2 = locationCoordinates[loc2];

    if (c1.lat === undefined || c1.lng === undefined || c2.lat === undefined || c2.lng === undefined) {
      return res.status(400).json({ success: false, message: "Valid coordinates or location names required." });
    }

    const distance = haversineDistance(c1.lat, c1.lng, c2.lat, c2.lng);

    return res.json({
      success: true,
      algorithm: "Haversine Distance (Algorithm 1)",
      formula: "d = 2R × atan2(√a, √(1−a)), where a = sin²(Δφ/2) + cos φ1 × cos φ2 × sin²(Δλ/2)",
      pointA: c1,
      pointB: c2,
      distanceKm: distance,
      calculatedFare: {
        bikeFare: Math.round(Math.max(20, distance * 5)),
        carFare: Math.round(Math.max(40, distance * 10))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Algorithm 2: KNN
const testKNN = (req, res) => {
  try {
    const { k = 3, targetDistance = 0, minRating = 4.7, maxEta = 4, customDrivers } = req.body;
    const pool = customDrivers || mockStore.getDrivers();

    const candidates = knn(
      pool,
      { distanceKm: targetDistance, minimumRating: minRating, maximumEta: maxEta },
      Number(k)
    );

    return res.json({
      success: true,
      algorithm: "K-Nearest Neighbors (KNN - Algorithm 2)",
      k: Number(k),
      inputRequest: { targetDistance, minRating, maxEta },
      totalCandidatesEvaluated: pool.length,
      nearestNeighbors: candidates
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Algorithm 3: Greedy Driver Matching
const testGreedy = (req, res) => {
  try {
    const { vehicleType = "Bike", pinkRide = false, customDrivers } = req.body;
    const pool = customDrivers || mockStore.getDrivers();

    const result = greedyDriverMatching(pool, { vehicleType, pinkRide });

    return res.json({
      success: true,
      algorithm: "Greedy Driver Matching (Algorithm 3)",
      scoringFormula: "Score = (1/(Distance + 0.1)) * 0.50 + (Rating / 5) * 0.35 + (1 / (ETA + 1)) * 0.15",
      matchedDriver: result.driver,
      matchingScore: result.matchingScore,
      rankedCandidates: result.candidates
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Algorithm 4: Dijkstra
const testDijkstra = (req, res) => {
  try {
    const { start = "Sambhram Institute of Technology", destination = "BEL Circle" } = req.body;
    const result = dijkstra(campusGraph, start, destination);

    return res.json({
      success: true,
      algorithm: "Dijkstra's Algorithm (Algorithm 4)",
      purpose: "Finds minimum-distance path on campus road network graph",
      start,
      destination,
      shortestPath: result.path,
      totalDistanceKm: result.distance,
      graph: campusGraph
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Algorithm 5: A* Search
const testAStar = (req, res) => {
  try {
    const { start = "Sambhram Institute of Technology", destination = "Nelamangala" } = req.body;
    const result = aStar(campusGraph, start, destination);

    return res.json({
      success: true,
      algorithm: "A* (A-Star) Search Algorithm (Algorithm 5)",
      purpose: "Optimized path search with Euclidean/Haversine heuristic h(n)",
      start,
      destination,
      optimizedPath: result.path,
      totalDistanceKm: result.distance
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Algorithm 6: Kalman Filter GPS Smoothing
const testKalman = (req, res) => {
  try {
    const { points } = req.body;
    const sampleGPS = points || [
      { latitude: 13.0805, longitude: 77.5458 },
      { latitude: 13.0812, longitude: 77.5467 }, // noise spike
      { latitude: 13.0806, longitude: 77.5459 },
      { latitude: 13.0807, longitude: 77.5461 },
      { latitude: 13.0819, longitude: 77.5475 }, // noise spike
      { latitude: 13.0809, longitude: 77.5463 }
    ];

    const smoothed = smoothGPS(sampleGPS);

    return res.json({
      success: true,
      algorithm: "1D Kalman Filter for GPS Smoothing (Algorithm 6)",
      rawPoints: sampleGPS,
      smoothedPoints: smoothed,
      improvement: "Reduced sensor variance and jitter before driver distance evaluation"
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Algorithm 7: Weighted Average Rating
const testWeightedAverage = (req, res) => {
  try {
    const { currentRating = 4.8, completedRides = 20, newRating = 5, customRatings } = req.body;

    if (customRatings) {
      const basicResult = weightedAverage(customRatings);
      return res.json({
        success: true,
        algorithm: "Weighted Average Rating (Algorithm 7)",
        ratingsData: customRatings,
        weightedRating: basicResult
      });
    }

    const bayesian = updateDriverRatingWithBayesianWeight(currentRating, completedRides, newRating);

    return res.json({
      success: true,
      algorithm: "Bayesian Weighted Average Rating (Algorithm 7)",
      formula: "WR = (v / (v + m)) * R + (m / (v + m)) * C (m=5, C=4.5)",
      input: { currentRating, completedRides, newRating },
      result: bayesian,
      explanation: "Prevents a single 5-star review from outranking seasoned drivers with dozens of rides"
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Algorithm 8: SHA-256
const testSha256 = (req, res) => {
  try {
    const { text, verifyPin, hashToVerify } = req.body;

    if (verifyPin && hashToVerify) {
      const isValid = verifyRidePIN(verifyPin, hashToVerify);
      return res.json({
        success: true,
        algorithm: "SHA-256 PIN Verification (Algorithm 8)",
        enteredPin: verifyPin,
        storedHash: hashToVerify,
        verified: isValid
      });
    }

    const dataToHash = text || "CampusRide_PIN_3060";
    const hashed = sha256(dataToHash);
    const generatedPinExample = generateRidePIN();

    return res.json({
      success: true,
      algorithm: "SHA-256 Cryptographic Hash (Algorithm 8)",
      input: dataToHash,
      sha256Hash: hashed,
      generatedPinExample
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ACID Transaction Test
const testACID = async (req, res) => {
  try {
    const { userId = "DEMO_STUDENT", balance = 300, fare = 50 } = req.body;
    const tx = new RideTransaction();
    tx.addWallet(userId, balance);

    const result = await tx.bookRide(userId, "CR_DRIVER_01", fare);

    return res.json({
      success: true,
      algorithm: "Simulated ACID Transaction Manager",
      testOutcome: result,
      properties: {
        Atomicity: "Rollback on failure; full commit on success",
        Consistency: "Enforces positive fare and sufficient wallet funds",
        Isolation: "Per-transaction state logs and snapshot isolation",
        Durability: "Logs commit state securely"
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  testHaversine,
  testKNN,
  testGreedy,
  testDijkstra,
  testAStar,
  testKalman,
  testWeightedAverage,
  testSha256,
  testACID
};

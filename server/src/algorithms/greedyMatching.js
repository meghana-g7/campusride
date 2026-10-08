/**
 * CampusRide
 * Greedy Driver Matching Algorithm - Algorithm 3
 *
 * Purpose:
 * Immediately selects the optimal available driver from candidate drivers
 * based on current ride conditions using a multi-factor greedy scoring heuristic.
 *
 * Factors:
 * - Distance Proximity (Weight: 50% - 55%): Smaller distance is better
 * - Driver Rating (Weight: 30% - 35%): Higher rating is better
 * - ETA (Weight: 15%): Lower ETA is better
 *
 * Formula:
 * distanceScore = 1 / (distance + 0.1)
 * ratingScore   = rating / 5
 * etaScore      = 1 / (eta + 1)
 * Score         = (distanceScore * 0.50) + (ratingScore * 0.35) + (etaScore * 0.15)
 */

function greedyDriverMatching(drivers, rideRequest = {}) {
  if (!Array.isArray(drivers)) {
    throw new Error("Drivers must be an array.");
  }

  const availableDrivers = drivers.filter(driver => {
    const isAvail = driver.isActive !== false &&
      (driver.isAvailable === true || driver.available === true || driver.availability === "Available");
    
    // If pinkRide is requested, filter strictly for eligible female drivers
    if (rideRequest.pinkRide && !driver.pinkRideEligible && driver.gender !== "female") {
      return false;
    }

    // Vehicle type match if requested
    if (rideRequest.vehicleType && driver.vehicleType && driver.vehicleType.toLowerCase() !== rideRequest.vehicleType.toLowerCase()) {
      return false;
    }

    return isAvail;
  });

  if (availableDrivers.length === 0) {
    return {
      success: false,
      message: rideRequest.pinkRide
        ? "No verified female riders currently available for Pink Ride."
        : "No drivers are currently available.",
      driver: null
    };
  }

  let bestDriver = null;
  let bestScore = -Infinity;
  const scoredDrivers = [];

  for (const driver of availableDrivers) {
    const distance = Number(driver.distanceKm ?? driver.distance ?? 1.0);
    const rating = Number(driver.rating ?? 4.5);
    const eta = Number(driver.etaMinutes ?? driver.eta ?? 5);

    if (
      !Number.isFinite(distance) ||
      !Number.isFinite(rating) ||
      !Number.isFinite(eta)
    ) {
      continue;
    }

    // Higher score = better driver
    const distanceScore = 1 / Math.max(distance, 0.1);
    const ratingScore = Math.min(Math.max(rating, 1), 5) / 5;
    const etaScore = 1 / Math.max(eta, 1);

    const score =
      distanceScore * 0.50 +
      ratingScore * 0.35 +
      etaScore * 0.15;

    const scored = {
      ...driver,
      distanceKm: distance,
      distance: distance,
      rating,
      etaMinutes: eta,
      eta: eta,
      matchingScore: Math.round(score * 10000) / 10000
    };

    scoredDrivers.push(scored);

    if (score > bestScore) {
      bestScore = score;
      bestDriver = scored;
    }
  }

  if (!bestDriver) {
    return {
      success: false,
      message: "No valid driver found matching criteria.",
      driver: null,
      candidates: []
    };
  }

  // Sort candidates by score descending
  scoredDrivers.sort((a, b) => b.matchingScore - a.matchingScore);

  return {
    success: true,
    message: "Driver successfully matched.",
    driver: bestDriver,
    matchingScore: bestScore,
    candidates: scoredDrivers
  };
}

module.exports = {
  greedyDriverMatching
};

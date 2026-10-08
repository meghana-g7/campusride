/**
 * CampusRide
 * K-Nearest Neighbors (KNN) - Algorithm 2
 *
 * Purpose:
 * Finds the K most suitable nearby drivers based on multi-dimensional feature distance:
 * - Proximity / Distance (km)
 * - Driver Rating
 * - Estimated Time of Arrival (ETA)
 *
 * Input:
 * - drivers: Array of available driver objects
 * - request: { distanceKm: number, minimumRating: number, maximumEta: number }
 * - k: Number of nearest neighbors to return (default: 3)
 *
 * Output:
 * - Array of K nearest and most suitable driver candidates sorted by knnScore
 */

function calculateDriverDistance(driver, request) {
  const targetDistance = request?.distanceKm !== undefined ? request.distanceKm : 0;
  const minRating = request?.minimumRating !== undefined ? request.minimumRating : 4.5;
  const maxEta = request?.maximumEta !== undefined ? request.maximumEta : 5;

  const driverDistance = Number(driver.distanceKm ?? driver.distance ?? 0);
  const driverRating = Number(driver.rating ?? 4.5);
  const driverEta = Number(driver.etaMinutes ?? driver.eta ?? 5);

  const distanceDifference = driverDistance - targetDistance;
  const ratingDifference = driverRating - minRating;
  const etaDifference = driverEta - maxEta;

  // Normalized suitability distance score (lower is closer/better)
  const score =
    Math.abs(distanceDifference) * 0.6 +
    Math.abs(ratingDifference) * 0.2 +
    Math.abs(etaDifference) * 0.2;

  return Math.round(score * 1000) / 1000;
}

function knn(drivers, request = {}, k = 3) {
  if (!Array.isArray(drivers)) {
    throw new Error("Drivers must be provided as an array.");
  }

  if (drivers.length === 0) {
    return [];
  }

  // Filter available and active drivers
  const candidates = drivers
    .filter(driver => {
      const isAvail = driver.isAvailable === true || driver.available === true || driver.availability === "Available";
      const isActive = driver.isActive !== false;
      return isAvail && isActive;
    })
    .map(driver => ({
      ...driver,
      distanceKm: Number(driver.distanceKm ?? driver.distance ?? 0),
      rating: Number(driver.rating ?? 4.5),
      etaMinutes: Number(driver.etaMinutes ?? driver.eta ?? 5),
      knnScore: calculateDriverDistance(driver, request)
    }));

  candidates.sort((a, b) => a.knnScore - b.knnScore);

  return candidates.slice(0, k);
}

module.exports = {
  knn,
  calculateDriverDistance
};

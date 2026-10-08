/**
 * CampusRide
 * Haversine Distance Algorithm (Algorithm 1)
 *
 * Purpose:
 * Calculates the great-circle distance between two geographical points
 * on Earth using their latitude and longitude coordinates.
 *
 * Used for:
 * - Rider proximity calculation
 * - Pickup to Destination ride distance
 * - Fare calculation (Bike: Distance * 5, Car: Distance * 10)
 */

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lon1 === undefined ||
    lat2 === undefined || lon2 === undefined
  ) {
    throw new Error("All coordinates (lat1, lon1, lat2, lon2) are required.");
  }

  const R = 6371; // Earth's mean radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

module.exports = {
  haversineDistance
};

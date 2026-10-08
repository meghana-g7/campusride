/**
 * CampusRide
 * 1D Kalman Filter for GPS Smoothing - Algorithm 6
 *
 * Purpose:
 * Filters out raw GPS sensor jitter and measurement noise before
 * computing rider distance, proximity, or route positioning.
 */

class KalmanFilter {
  constructor(processNoise = 0.01, measurementNoise = 1.0) {
    this.processNoise = processNoise;
    this.measurementNoise = measurementNoise;
    this.estimate = 0;
    this.error = 1.0;
    this.initialized = false;
  }

  update(measurement) {
    if (!this.initialized) {
      this.estimate = measurement;
      this.initialized = true;
      return this.estimate;
    }

    // Prediction phase
    const predictedEstimate = this.estimate;
    const predictedError = this.error + this.processNoise;

    // Kalman Gain calculation
    const kalmanGain =
      predictedError / (predictedError + this.measurementNoise);

    // Measurement Update phase
    this.estimate =
      predictedEstimate + kalmanGain * (measurement - predictedEstimate);
    this.error = (1 - kalmanGain) * predictedError;

    return this.estimate;
  }
}

// GPS coordinate series smoothing
function smoothGPS(points) {
  if (!Array.isArray(points)) return [];
  const latitudeFilter = new KalmanFilter(0.0001, 0.001);
  const longitudeFilter = new KalmanFilter(0.0001, 0.001);

  return points.map(point => ({
    latitude: Math.round(latitudeFilter.update(point.latitude || point.lat) * 1000000) / 1000000,
    longitude: Math.round(longitudeFilter.update(point.longitude || point.lng) * 1000000) / 1000000,
    timestamp: point.timestamp || Date.now()
  }));
}

module.exports = {
  KalmanFilter,
  smoothGPS
};

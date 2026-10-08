/**
 * CampusRide
 * Weighted Average Rating Algorithm - Algorithm 7
 *
 * Purpose:
 * Computes a weighted credibility rating for drivers.
 * Bayesian / Credibility-weighted formula ensures that a rider with only 1 five-star review
 * cannot unfairly outrank an experienced rider with dozens or hundreds of verified reviews.
 *
 * Factors:
 * - Driver's previous average rating
 * - Total number of completed rides (experience weight C)
 * - Prior campus global benchmark (e.g. M = 4.5, C = 5)
 * - Weight of recent feedback
 */

const CAMPUS_BENCHMARK_RATING = 4.5;
const MINIMUM_RIDES_CREDIBILITY = 5;

// Basic weighted average over weighted feedback items
function weightedAverage(ratings) {
  if (!ratings || ratings.length === 0) {
    return CAMPUS_BENCHMARK_RATING;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  ratings.forEach(item => {
    const rating = Number(item.rating);
    const weight = Number(item.weight ?? 1);
    if (!isNaN(rating) && !isNaN(weight) && weight > 0) {
      weightedSum += rating * weight;
      totalWeight += weight;
    }
  });

  if (totalWeight === 0) {
    return CAMPUS_BENCHMARK_RATING;
  }

  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Bayesian Weighted Rating calculation when a new rating arrives:
 * Formula:
 * WR = (v / (v + m)) * R + (m / (v + m)) * C
 * where:
 * R = average rating of the driver
 * v = number of completed rides/ratings for the driver
 * m = minimum ratings required for credibility (e.g. 5)
 * C = mean campus rating benchmark (e.g. 4.5)
 */
function updateDriverRatingWithBayesianWeight(currentRating, completedRides, newRating) {
  const v = Math.max(0, Number(completedRides) || 0);
  const prevR = Number(currentRating) || CAMPUS_BENCHMARK_RATING;
  const newR = Number(newRating) || 5;

  // New cumulative rating
  const updatedTotalRides = v + 1;
  const newUnweightedAvg = ((prevR * v) + newR) / updatedTotalRides;

  const m = MINIMUM_RIDES_CREDIBILITY;
  const C = CAMPUS_BENCHMARK_RATING;

  // Weighted score
  const bayesianScore = (updatedTotalRides / (updatedTotalRides + m)) * newUnweightedAvg + (m / (updatedTotalRides + m)) * C;

  return {
    rawAverage: Math.round(newUnweightedAvg * 100) / 100,
    weightedRating: Math.round(bayesianScore * 100) / 100,
    totalRides: updatedTotalRides
  };
}

// Driver ranking
function rankDrivers(drivers) {
  return [...drivers]
    .map(driver => {
      const rides = Number(driver.completedRides || driver.ratings?.length || 1);
      const raw = Number(driver.rating || 4.5);
      const m = MINIMUM_RIDES_CREDIBILITY;
      const C = CAMPUS_BENCHMARK_RATING;
      const weightedRating = (rides / (rides + m)) * raw + (m / (rides + m)) * C;
      return {
        ...driver,
        weightedRating: Math.round(weightedRating * 100) / 100
      };
    })
    .sort((a, b) => b.weightedRating - a.weightedRating);
}

module.exports = {
  weightedAverage,
  updateDriverRatingWithBayesianWeight,
  rankDrivers,
  CAMPUS_BENCHMARK_RATING
};

export function normalizeScore(scores, maxPossible) {
  const normalized = {}; // `normalized` will store the final percentage scores for each major.

  // `allMax` collects all individual maximum possible scores for each major.
  const allMax = Object.keys(maxPossible).map((k) => maxPossible[k] || 0);
  
  // `globalMax` is the single highest possible score among all majors.
  // This value is used as a common denominator to normalize all major scores,
  // making percentages comparable across different majors.
  // We use `Math.max(..., 1)` to prevent division by zero if all maxPossible scores are 0.
  const globalMax = Math.max(...allMax, 1);

  // Iterate through each major's raw score to calculate its normalized percentage.
  Object.keys(scores).forEach((k) => {
    // Calculate the percentage: (major's raw score / global maximum possible score) * 100.
    // This makes each major's percentage relative to the highest potential score in the entire system.
    const value = (scores[k] / globalMax) * 100;
    
    // Ensure the normalized score is clamped between 0 and 100.
    normalized[k] = Math.max(0, Math.min(100, Number(value)));
  });

  // Returns an object where keys are major IDs and values are their normalized percentage scores.
  return normalized;
}

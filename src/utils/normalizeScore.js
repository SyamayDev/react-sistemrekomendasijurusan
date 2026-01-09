export function normalizeScore(scores, maxPossible) {
  const normalized = {};

  Object.keys(scores).forEach((k) => {
    let rawPercentage = 0;
    if (maxPossible[k] > 0) {
      // Calculate percentage against its own maxPossible score
      rawPercentage = (scores[k] / maxPossible[k]); // rawPercentage will be between 0 and 1
    }
    
    // Apply a boosting transformation: maps 0-1 to 0.8-1 range, then multiplies by 100
    // This ensures scores are generally higher, starting from at least 80% if there's any score.
    const boostedPercentage = (rawPercentage * 0.2 + 0.8) * 100;

    normalized[k] = Math.max(0, Math.min(100, boostedPercentage));
  });

  return normalized;
}

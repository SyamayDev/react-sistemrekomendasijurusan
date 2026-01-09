export function normalizeScore(scores, maxPossible) {
  const normalized = {};

  Object.keys(scores).forEach((k) => {
    let rawPercentage = 0;
    if (maxPossible[k] > 0) {
      // Calculate percentage against its own maxPossible score
      rawPercentage = scores[k] / maxPossible[k]; // rawPercentage will be between 0 and 1
    }

    // Apply a transformation: maps 0-1 to 0.5-0.95 range, then multiplies by 100
    // This ensures better differentiation with scores ranging from 50-95%, never reaching 100%
    // Formula: (rawPercentage * 0.45 + 0.5) * 100
    // - If rawPercentage = 0 (no match): score = 50%
    // - If rawPercentage = 1 (perfect match): score = 95%
    const scaledPercentage = (rawPercentage * 0.45 + 0.5) * 100;

    normalized[k] = Math.max(0, Math.min(95, scaledPercentage));
  });

  return normalized;
}

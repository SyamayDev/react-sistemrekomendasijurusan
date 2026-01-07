export function normalizeScore(scores, maxPossible) {
  const normalized = {};
  // Use a global maximum possible to make percentages comparable across majors
  const allMax = Object.keys(maxPossible).map((k) => maxPossible[k] || 0);
  const globalMax = Math.max(...allMax, 1);
  Object.keys(scores).forEach((k) => {
    const value = (scores[k] / globalMax) * 100;
    normalized[k] = Math.max(0, Math.min(100, Number(value)));
  });
  return normalized;
}

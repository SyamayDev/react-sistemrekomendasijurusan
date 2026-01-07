export function rankMajors(normalized, majors) {
  const list = majors.map((m) => ({ ...m, score: normalized[m.id] || 0 }));
  list.sort((a, b) => b.score - a.score);
  return list;
}

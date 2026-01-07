import insights from "../data/insights.json";

export function generateInsight(majorName) {
  return insights[majorName] || "Insight tidak tersedia untuk jurusan ini.";
}

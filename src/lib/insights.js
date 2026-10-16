/** Long-form "why it fits" copy per major (32 KB), loaded only where shown. */
import insights from "../data/insights.json";

export const insightFor = (major) => insights[major.nama_jurusan] || major.deskripsi;

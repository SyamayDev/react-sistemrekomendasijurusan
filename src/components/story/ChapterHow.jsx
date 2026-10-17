/**
 * Chapter 3 — how it works, as a visual process rather than three cards:
 * answers stream into RAJU → an interest profile forms → 150 majors light up
 * by match on a data wall → one result steps forward, with its reasons.
 */
import { Chapter, HudTag, Kicker } from "./parts.jsx";

const STEPS = [
  {
    title: "Jawab 20 pertanyaan",
    body: "Seputar minat, kepribadian, dan gaya kerjamu. Santai saja — tidak ada jawaban benar atau salah. Sekitar 4 menit.",
    meta: "Tahap 1 · Jawaban",
  },
  {
    title: "Profil minatmu terbentuk",
    body: "Setiap jawaban menambah bobot pada enam tipe RIASEC, membentuk “bentuk” minat yang khas milikmu.",
    meta: "Tahap 2 · Profil RIASEC",
  },
  {
    title: "Dicocokkan dengan 150 jurusan",
    body: "Jawabanmu menjadi bukti untuk atau melawan tiap jurusan, lalu dipadukan dengan kemiripan profil. Semuanya dihitung di perangkatmu.",
    meta: "Tahap 3 · Pencocokan",
  },
  {
    title: "Hasil, lengkap dengan alasannya",
    body: "Kamu mendapat persentase kecocokan, alasan yang diambil dari jawabanmu sendiri, dan jurusan alternatif untuk didiskusikan.",
    meta: "Tahap 4 · Rekomendasi",
  },
];

/** Fallback flow diagram (no WebGL): the active stage lights up. */
function FlowArt() {
  const nodes = ["Jawaban", "Profil", "Cocokkan", "Hasil"];
  return (
    <svg viewBox="0 0 320 300" className="h-full max-h-[24rem] w-auto max-w-full" aria-hidden="true">
      <path d="M60 60 C 200 60, 120 150, 260 150 S 120 240, 60 240" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="5 7" />
      {[
        [60, 60],
        [260, 150],
        [160, 196],
        [60, 240],
      ].map(([x, y], i) => (
        <g key={i} data-node={i}>
          <circle cx={x} cy={y} r="30" fill="var(--sun)" />
          <text x={x} y={y + 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#1a1405">
            {i + 1}
          </text>
          <text x={x} y={y + 52} textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
            {nodes[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function ChapterHow() {
  return (
    <Chapter index={3} id="cara-kerja" h="400svh" steps={4} labelledBy="cara-kerja-title">
      <div className="container-x relative grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] items-end pb-[var(--stage-pb)] pt-[calc(var(--header-h)+1rem)] lg:grid-cols-[minmax(0,34rem)_1fr] lg:grid-rows-1 lg:items-center lg:pb-0">
        <div data-panel className="relative z-10 row-start-2 lg:row-start-1">
          <Kicker n={3}>Cara kerja</Kicker>
          <h2 id="cara-kerja-title" className="display mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)]">
            <span className="mask-line" style={{ "--o": 0.35 }}>
              <span>Dari jawabanmu,</span>
            </span>{" "}
            <span className="mask-line" style={{ "--o": 0.42 }}>
              <span className="accent-word">jadi peta jurusan.</span>
            </span>
          </h2>
          <div className="step-dots enter-fx mt-7 flex max-w-xs gap-1.5" aria-hidden="true" style={{ "--o": 0.5 }}>
            {STEPS.map((s) => (
              <span key={s.title} />
            ))}
          </div>
          <ol className="steps enter-fx mt-5" style={{ "--o": 0.5 }}>
            {STEPS.map((s, i) => (
              <li key={s.title} data-i={i}>
                <p className="hud-label text-ink-soft">{s.meta}</p>
                <h3 className="mt-3 flex items-baseline gap-4 text-2xl font-bold sm:text-3xl">
                  <span aria-hidden="true" className="font-mono text-base text-sun-ink dark:text-sun">
                    {String(i + 1).padStart(2, "0")}
                  </span>{" "}
                  {s.title}
                </h3>
                <p className="mt-3 max-w-md text-lg leading-relaxed text-ink-muted max-lg:text-base">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="fallback-art pointer-events-none row-start-1 flex min-h-0 items-center self-stretch overflow-hidden justify-center text-ink lg:col-start-2">
          <FlowArt />
        </div>
      </div>
      <HudTag k="demo-top" side="right">
        Contoh hasil · #1 paling cocok
      </HudTag>
    </Chapter>
  );
}

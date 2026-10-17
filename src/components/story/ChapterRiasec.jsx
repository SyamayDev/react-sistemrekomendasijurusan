/**
 * Chapter 2 — "Kenali dirimu". Six RIASEC orbs gather around RAJU; scrolling
 * steps through them one by one (RAJU turns to look at each), then they link
 * into a hexagon with a sample interest "shape".
 */
import { Chapter, HudTag, Kicker } from "./parts.jsx";
import { RIASEC } from "../../lib/riasec.js";

const ORB_COLOR = { R: "#ff9f6b", I: "#5b8cff", A: "#ff8fd8", S: "#2fd3a0", E: "#ffc53d", C: "#b48cff" };
const DETAIL = {
  R: { contoh: "merakit, memperbaiki, bertani, berolahraga", bidang: "teknik, vokasi, pertanian, kelautan" },
  I: { contoh: "eksperimen sains, coding, teka-teki, riset kecil", bidang: "sains, kedokteran, statistika, informatika" },
  A: { contoh: "menggambar, menulis, musik, desain, membuat video", bidang: "seni & desain, sastra, film, komunikasi" },
  S: { contoh: "jadi relawan, mengajari teman, mendengarkan curhat", bidang: "pendidikan, kesehatan, psikologi, sosial" },
  E: { contoh: "OSIS, berjualan, debat, mengatur acara", bidang: "bisnis, manajemen, hukum, politik" },
  C: { contoh: "menyusun jadwal, mencatat keuangan, merapikan arsip", bidang: "akuntansi, administrasi, perpajakan, perpustakaan" },
};
const SIDE = ["right", "right", "right", "left", "left", "left"];

/** Fallback hexagon (no WebGL): nodes highlight with the active step. */
function HexArt() {
  const pts = RIASEC.map((_, k) => {
    const a = -Math.PI / 2 + (k / 6) * Math.PI * 2;
    return [150 + Math.cos(a) * 112, 150 + Math.sin(a) * 112];
  });
  return (
    <svg viewBox="0 0 300 300" className="h-full max-h-[26rem] w-auto max-w-full" aria-hidden="true">
      <polygon points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
      {RIASEC.map((d, k) => (
        <g key={d.key} data-node={k}>
          <circle cx={pts[k][0]} cy={pts[k][1]} r="26" fill={ORB_COLOR[d.key]} />
          <text x={pts[k][0]} y={pts[k][1] + 7} textAnchor="middle" fontSize="20" fontWeight="800" fill="#0b1235">
            {d.key}
          </text>
        </g>
      ))}
      <text x="150" y="156" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor" opacity="0.6">
        RIASEC
      </text>
    </svg>
  );
}

export default function ChapterRiasec() {
  return (
    <Chapter index={2} id="kenali-dirimu" h="430svh" steps={6} labelledBy="riasec-title">
      <div className="container-x relative grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] items-end pb-[var(--stage-pb)] pt-[calc(var(--header-h)+1rem)] lg:grid-cols-[minmax(0,36rem)_1fr] lg:grid-rows-1 lg:items-center lg:pb-0">
        <div data-panel className="relative z-10 row-start-2 lg:row-start-1">
          <Kicker n={2}>Kenali dirimu</Kicker>
          <h2 id="riasec-title" className="display mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)]">
            <span className="mask-line" style={{ "--o": 0.35 }}>
              <span>Enam arah minat.</span>
            </span>{" "}
            <span className="mask-line" style={{ "--o": 0.42 }}>
              <span className="accent-word">Satu peta milikmu.</span>
            </span>
          </h2>
          <p className="enter-fx mt-4 max-w-lg text-ink-muted max-lg:text-sm" style={{ "--o": 0.5 }}>
            SI-RAJU memakai model RIASEC dari psikolog John L. Holland. Setiap orang punya campuran keenamnya — tidak ada tipe
            yang lebih baik dari yang lain.
          </p>
          <div className="step-dots enter-fx mt-6 flex max-sm:mt-4 max-w-xs gap-1.5" aria-hidden="true" style={{ "--o": 0.55 }}>
            {RIASEC.map((d) => (
              <span key={d.key} />
            ))}
          </div>
          <ol className="steps enter-fx mt-5 max-sm:mt-3" style={{ "--o": 0.55 }}>
            {RIASEC.map((d, k) => (
              <li key={d.key} data-i={k} className="rounded-3xl border border-line/70 bg-surface/70 p-4 backdrop-blur-md sm:p-6">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-full font-display text-lg font-extrabold text-night-900"
                    style={{ background: ORB_COLOR[d.key] }}
                  >
                    {d.key}
                  </span>
                  <h3 className="text-lg font-bold sm:text-xl">
                    {d.nama} <span className="hud-label align-middle text-ink-soft">{d.holland}</span>
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:mt-3 sm:text-base">{d.deskripsi}</p>
                <dl className="mt-2 grid gap-1 text-sm max-sm:text-[0.8rem] sm:mt-3">
                  <div className="flex gap-2">
                    <dt className="font-semibold text-ink">Contoh:</dt>
                    <dd className="text-ink-muted">{DETAIL[d.key].contoh}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold text-ink">Sering di:</dt>
                    <dd className="text-ink-muted">{DETAIL[d.key].bidang}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </div>
        <div className="fallback-art pointer-events-none row-start-1 flex min-h-0 items-center self-stretch overflow-hidden justify-center text-ink lg:col-start-2">
          <HexArt />
        </div>
      </div>
      {RIASEC.map((d, k) => (
        <HudTag key={d.key} k={`orb-${d.key}`} side={SIDE[k]} i={k}>
          {d.key} · {d.nama}
        </HudTag>
      ))}
    </Chapter>
  );
}

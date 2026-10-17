/**
 * Chapter 5 — why SI-RAJU. Only claims the code backs up; each reason lights
 * up in turn as the chapter scrolls (editorial list, not a card grid).
 */
import { Chapter, Kicker } from "./parts.jsx";
import { TOTAL_MAJORS } from "../../lib/categories.js";
import rajuThinking from "../../assets/raju/raju-thinking.webp";

const REASONS = [
  { t: "Gratis, tanpa akun", d: "Tidak perlu daftar, tidak ada iklan. Ulangi tesnya kapan saja." },
  { t: "Dihitung di perangkatmu", d: "Jawaban tes diproses di browser dan tidak dikirim ke server SI-RAJU." },
  { t: "Ada alasannya", d: "Setiap persentase dijelaskan dari jawabanmu sendiri — bukan ramalan." },
  { t: `${TOTAL_MAJORS} halaman jurusan`, d: "Isi jurusan, karakter yang cocok, dan jurusan serumpun untuk dibandingkan." },
  {
    t: "Asisten AI, kalau perlu",
    d: "Tanya soal jurusan ke SI-RAJU AI. Pesan yang kamu ketik dikirim ke layanan Google Gemini untuk dijawab; hasil tesmu hanya ikut bila kamu memintanya.",
  },
];

export default function ChapterWhy() {
  return (
    <Chapter index={5} id="kenapa" h="230svh" labelledBy="kenapa-title">
      <div className="container-x relative grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] items-end pb-[var(--stage-pb)] pt-[calc(var(--header-h)+1rem)] lg:grid-cols-[minmax(0,40rem)_1fr] lg:grid-rows-1 lg:items-center lg:pb-0">
        <div data-panel className="relative z-10 row-start-2 lg:row-start-1">
          <Kicker n={5}>Kenapa SI-RAJU</Kicker>
          <h2 id="kenapa-title" className="display mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)] max-sm:mt-3">
            <span className="mask-line" style={{ "--o": 0.35 }}>
              <span>Dibuat serius.</span>
            </span>{" "}
            <span className="mask-line" style={{ "--o": 0.42 }}>
              <span className="accent-word">Terasa ringan.</span>
            </span>
          </h2>
          <ol className="mt-7 max-sm:mt-4 divide-y divide-line/70 border-y border-line/70">
            {REASONS.map((r, i) => (
              <li key={r.t} className="reason grid grid-cols-[2.5rem_1fr] gap-x-3 py-2 sm:py-4" style={{ "--i": i }}>
                <span className="hud-label pt-1 text-sun-ink dark:text-sun">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-base font-bold sm:text-xl">{r.t}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-muted sm:text-base">{r.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="fallback-art pointer-events-none row-start-1 flex min-h-0 items-center self-stretch overflow-hidden justify-center max-lg:hidden lg:col-start-2 lg:justify-end">
          <img src={rajuThinking} alt="" width="560" height="560" loading="lazy" decoding="async" className="h-auto max-h-[60svh] w-auto" />
        </div>
      </div>
    </Chapter>
  );
}

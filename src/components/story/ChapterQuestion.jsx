/**
 * Chapter 1 — the problem. A statement lights up word by word as you scroll
 * while the major tiles tumble around RAJU (confusion); then the tiles
 * settle into orbits as the answer appears (clarity).
 */
import { Chapter, Kicker, ScrubText } from "./parts.jsx";
import { TOTAL_MAJORS } from "../../lib/categories.js";
import rajuCurious from "../../assets/raju/raju-curious.webp";

export default function ChapterQuestion() {
  return (
    <Chapter index={1} id="pertanyaan" h="240svh" labelledBy="pertanyaan-title">
      <div className="container-x relative grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] items-end pb-[var(--stage-pb)] pt-[calc(var(--header-h)+1rem)] lg:grid-cols-[minmax(0,40rem)_1fr] lg:grid-rows-1 lg:items-center lg:pb-0">
        <div data-panel className="swap-wrap relative z-10 row-start-2 lg:row-start-1">
          <div className="swap-a">
            <Kicker n={1}>Sebelum memilih</Kicker>
            <h2 id="pertanyaan-title" className="display mt-6 text-[clamp(2.1rem,4.8vw,3.9rem)] leading-[1.05]">
              <ScrubText text={`Ada ${TOTAL_MAJORS} jurusan, ribuan kampus, dan satu pertanyaan yang terus muncul: aku cocoknya di mana?`} />
            </h2>
          </div>
          <div className="swap-b">
            <p className="hud-label text-ink-muted">Faktanya</p>
            <p className="display mt-4 flex items-baseline gap-1 text-[clamp(4.5rem,11vw,8.5rem)] leading-none">
              87<span className="accent-word">%</span>
            </p>
            <p className="mt-3 max-w-md text-xl font-semibold leading-snug sm:text-2xl">mahasiswa Indonesia merasa salah memilih jurusan.</p>
            <p className="hud-label mt-2 text-ink-soft">Indonesia Career Center Network, 2017</p>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink-muted">
              Bukan karena kurang pintar. Sering karena belum sempat mengenal diri sendiri. Di sinilah RAJU membantu merapikan
              pilihan — satu langkah kecil dulu: kenali minatmu.
            </p>
          </div>
        </div>
        <div className="fallback-art pointer-events-none row-start-1 flex min-h-0 items-center self-stretch overflow-hidden justify-center lg:col-start-2 lg:justify-end">
          <img
            src={rajuCurious}
            alt="RAJU memiringkan kepala dengan penasaran"
            width="720"
            height="720"
            loading="lazy"
            decoding="async"
            className="h-auto max-h-full w-auto lg:max-h-[70svh]"
          />
        </div>
      </div>
    </Chapter>
  );
}

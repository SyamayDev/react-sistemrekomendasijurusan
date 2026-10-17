/**
 * Chapter 6 — the gate. The major tiles and eight field arcs assemble into a
 * portal around RAJU, who turns to the call to action and waves you in.
 */
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Chapter, Kicker } from "./parts.jsx";
import MagneticButton from "../ui/MagneticButton.jsx";
import { rajuFlap } from "../../lib/sceneStore.js";
import { CATEGORIES } from "../../lib/categories.js";
import rajuWave from "../../assets/raju/raju-wave.webp";

const RING = `conic-gradient(${CATEGORIES.map((c, k) => `${c.warna} ${k * 12.5 + 0.6}% ${(k + 1) * 12.5 - 0.6}%, transparent ${(k + 1) * 12.5 - 0.6}% ${(k + 1) * 12.5 + 0.6}%`).join(", ")})`;

export default function ChapterPortal() {
  return (
    <Chapter index={6} id="gerbang" h="210svh" scrim="right" labelledBy="gerbang-title">
      <div className="container-x relative grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] items-end pb-[var(--stage-pb)] pt-[calc(var(--header-h)+1rem)] lg:grid-cols-[1fr_minmax(0,36rem)] lg:grid-rows-1 lg:items-center lg:pb-0">
        <div data-panel className="relative z-10 row-start-2 lg:col-start-2 lg:row-start-1">
          <Kicker n={6}>Gerbang</Kicker>
          <h2 id="gerbang-title" className="display mt-5 text-[clamp(2.6rem,min(5vw,7.6svh),4.75rem)]">
            <span className="mask-line" style={{ "--o": 0.35 }}>
              <span>Mulai dari</span>
            </span>{" "}
            <span className="mask-line" style={{ "--o": 0.42 }}>
              <span className="accent-word">rasa penasaran.</span>
            </span>
          </h2>
          <p className="enter-fx mt-4 max-w-lg text-lg text-ink-muted max-sm:text-base" style={{ "--o": 0.5 }}>
            Empat menit, dua puluh pertanyaan, satu peta jurusan yang bisa kamu diskusikan bersama guru BK dan orang tua.
          </p>
          <div className="enter-fx mt-7 flex flex-wrap items-center gap-3" style={{ "--o": 0.55 }}>
            <MagneticButton to="/tes/" onPointerEnter={rajuFlap} onFocus={rajuFlap}>
              Mulai Eksplorasi <ArrowRight size={20} aria-hidden="true" />
            </MagneticButton>
            <Link to="/jurusan/" className="btn btn-lg btn-ghost">
              Jelajahi katalog jurusan
            </Link>
          </div>
        </div>
        {/* Fallback portal + RAJU (no WebGL). */}
        <div className="fallback-art pointer-events-none row-start-1 flex h-full min-h-0 items-center justify-center lg:col-start-1" aria-hidden="true">
          <div className="relative aspect-square h-full max-h-[34rem] max-w-full">
            <div
              className="absolute inset-0 rounded-full opacity-90"
              style={{ background: RING, mask: "radial-gradient(closest-side, transparent 82%, #000 84%, #000 97%, transparent 99%)" }}
            />
            <div className="absolute inset-[16%] rounded-full bg-[radial-gradient(circle,rgb(255_211_107/0.35),transparent_65%)]" />
            <img src={rajuWave} alt="" width="720" height="720" loading="lazy" decoding="async" className="absolute inset-[14%] h-auto w-[72%]" />
          </div>
        </div>
      </div>
    </Chapter>
  );
}

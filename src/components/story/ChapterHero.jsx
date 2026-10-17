/**
 * Chapter 0 — cinematic hero. Typography reveals on load (CSS only, so it
 * paints before hydration); RAJU materialises in 3D on the right, and the
 * scene starts moving as soon as you scroll.
 */
import { ArrowDown, ArrowRight } from "lucide-react";
import { Chapter, HudTag } from "./parts.jsx";
import MagneticButton from "../ui/MagneticButton.jsx";
import { rajuFlap } from "../../lib/sceneStore.js";
import rajuHero from "../../assets/raju/raju-hero.webp";
import rajuHeroSmall from "../../assets/raju/raju-hero-560.webp";

const FACTS = ["20 pertanyaan", "±4 menit", "150 jurusan", "Gratis, tanpa akun"];

export default function ChapterHero() {
  return (
    <Chapter index={0} id="mulai" h="165svh" labelledBy="hero-title">
      <div className="container-x relative grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] items-end pb-[var(--stage-pb)] pt-[calc(var(--header-h)+1rem)] lg:grid-cols-[minmax(0,44rem)_1fr] lg:grid-rows-1 lg:items-center lg:pb-0">
        <div data-panel className="hero-out relative z-10 row-start-2 lg:row-start-1">
          <p className="hud-label fade-up flex items-center gap-2.5 text-ink-muted" style={{ "--i": 0 }}>
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-sun motion-safe:animate-[pulse-ring_2s_ease-out_infinite]" />
              <span className="relative inline-flex size-2 rounded-full bg-sun" />
            </span>
            Tes minat bakat<span className="max-sm:hidden"> · Rekomendasi jurusan</span>
          </p>
          <h1 id="hero-title" className="display mt-5 text-[clamp(2.75rem,min(7.4vw,9.8svh),6rem)]">
            <span className="intro-line">
              <span style={{ "--i": 0 }}>Masa depanmu</span>
            </span>{" "}
            <span className="intro-line">
              <span style={{ "--i": 1 }}>bukan pilihan</span>
            </span>{" "}
            <span className="intro-line">
              <span style={{ "--i": 2 }} className="accent-word">
                acak.
              </span>
            </span>
          </h1>
          <p className="fade-up mt-6 max-w-xl text-base leading-relaxed text-ink-muted max-sm:mt-4 sm:text-xl [@media(max-height:820px)]:mt-4 [@media(max-height:820px)]:text-lg" style={{ "--i": 3 }}>
            Kenali minatmu lewat 20 pertanyaan santai. SI-RAJU mencocokkannya dengan 150 jurusan kuliah
            <span className="max-sm:hidden"> memakai model minat karier RIASEC</span> — lengkap dengan alasan kenapa jurusan itu
            cocok untukmu.
          </p>
          <div className="fade-up mt-8 flex flex-wrap items-center gap-3 max-sm:mt-6 max-sm:gap-1" style={{ "--i": 4 }}>
            <MagneticButton to="/tes/" onPointerEnter={rajuFlap} onFocus={rajuFlap} className="max-sm:min-h-12 max-sm:px-4">
              Mulai Eksplorasi <ArrowRight size={20} aria-hidden="true" className="transition-transform group-hover/mag:translate-x-1" />
            </MagneticButton>
            <a
              href="#cara-kerja"
              className="btn btn-lg btn-ghost max-sm:min-h-12 max-sm:border-transparent max-sm:bg-transparent max-sm:px-2 max-sm:underline max-sm:decoration-line max-sm:underline-offset-4"
            >
              <span className="sm:hidden">Cara kerjanya</span>
              <span className="max-sm:hidden">Lihat cara kerjanya</span>
            </a>
          </div>
          <ul className="hud-label fade-up mt-9 flex flex-wrap max-sm:hidden gap-x-5 gap-y-2 text-ink-soft" style={{ "--i": 5 }}>
            {FACTS.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1 rounded-full bg-sun" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Poster rendered from the same 3D model — shown until/instead of the live world. */}
        <div className="fallback-art pointer-events-none row-start-1 flex min-h-0 items-center self-stretch overflow-hidden justify-center lg:col-start-2 lg:justify-end">
          <img
            src={rajuHero}
            srcSet={`${rajuHeroSmall} 560w, ${rajuHero} 860w`}
            sizes="(min-width: 1024px) 78vh, 320px"
            alt="RAJU, burung hantu bertoga maskot SI-RAJU, berdiri di atas tumpukan buku"
            width="860"
            height="860"
            fetchPriority="high"
            className="fade-up float-y h-auto max-h-full w-auto max-w-full lg:max-h-[78svh]"
            style={{ "--i": 2 }}
          />
        </div>
      </div>

      <HudTag k="raju" side="right">
        RAJU · pemandumu
      </HudTag>

      <a
        href="#pertanyaan"
        className="hud-label fade-up absolute bottom-6 right-[clamp(1rem,4vw,2rem)] hidden items-center gap-3 text-ink-soft transition-colors hover:text-ink md:flex"
        style={{ "--i": 7 }}
      >
        Gulir untuk menjelajah
        <span className="relative h-9 w-px overflow-hidden bg-current/30">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-sun motion-safe:animate-[scroll-cue_1.8s_ease-in-out_infinite]" />
        </span>
        <ArrowDown size={14} aria-hidden="true" />
      </a>
    </Chapter>
  );
}

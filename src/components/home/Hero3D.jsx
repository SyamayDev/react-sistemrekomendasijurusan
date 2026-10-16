/**
 * Hero3D — the first impression. Text, stat and owl are server-rendered and
 * animated with CSS so they appear on first paint (fast LCP, works pre-JS).
 * After hydration the hero drives the WebGL universe behind it: mouse
 * parallax, scroll fly-through, and pausing the render loop off-screen.
 */
import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Check } from "lucide-react";
import OwlMascot from "../ui/OwlMascot.jsx";
import MagneticButton from "../ui/MagneticButton.jsx";
import { setScene } from "../../lib/sceneStore.js";
import { prefersReducedMotion } from "../../lib/device.js";
import { TOTAL_MAJORS } from "../../lib/categories.js";

const HEADLINE = ["Temukan", "jurusan", "kuliah", "yang", "benar-benar", "kamu", "banget."];
const TRUST = ["Gratis, tanpa daftar", "±4 menit", `${TOTAL_MAJORS} jurusan`, "Hasil langsung + alasannya"];
const HOOTS = [
  "Hu-hu! Aku Raju, pemandu jurusanmu 🦉",
  "Burung hantu bisa melihat dalam gelap. Aku bantu kamu melihat masa depanmu.",
  `Aku sudah mempelajari ${TOTAL_MAJORS} jurusan. Yuk, cari yang paling pas!`,
  "Tidak ada jawaban salah. Jawab saja sejujurnya ✨",
  "Psst… geser kursormu, aku memperhatikan 👀",
];

export default function Hero3D() {
  const ref = useRef(null);
  const layers = useRef(null);
  const [hoot, setHoot] = useState(null);

  // Pause the WebGL loop when the hero leaves the viewport.
  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => setScene({ heroInView: e.isIntersecting }), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scroll → camera fly-through; pointer → gentle layer parallax.
  useEffect(() => {
    const el = ref.current;
    const lay = layers.current;
    const reduce = prefersReducedMotion();
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const p = Math.min(1, Math.max(0, window.scrollY / el.offsetHeight));
        setScene({ heroScroll: p });
        if (!reduce) lay.style.setProperty("--scroll", p.toFixed(3));
      });
    };
    const onMove = (e) => {
      if (reduce) return;
      lay.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      lay.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const sayHi = () => setHoot((h) => HOOTS[(HOOTS.indexOf(h) + 1) % HOOTS.length]);

  return (
    <section
      id="hero"
      ref={ref}
      data-theme="dark"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh items-center overflow-hidden pt-(--header-h) text-ink"
    >
      {/* Subtle vignette so text always sits on calm darkness. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_20%_45%,rgb(4_8_23/0.55),transparent_70%)]" />

      <div
        ref={layers}
        className="container-x grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8"
        style={{ "--px": 0, "--py": 0, "--scroll": 0 }}
      >
        <div className="[transform:translate3d(calc(var(--px)*-6px),calc(var(--py)*-6px+var(--scroll)*-60px),0)] [opacity:calc(1-var(--scroll)*1.2)]">
          <p className="fade-up chip !border-white/10 !bg-white/5 !text-ink-muted backdrop-blur" style={{ "--i": 0 }}>
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-[pulse-ring_2s_ease-out_infinite] rounded-full bg-sun" />
              <span className="relative inline-flex size-2 rounded-full bg-sun" />
            </span>
            Tes minat bakat jurusan kuliah · Gratis
          </p>

          <h1 id="hero-title" className="display mt-6 text-[clamp(2.5rem,5.6vw,4.6rem)] text-white">
            {HEADLINE.map((w, i) => (
              <Fragment key={w}>
                <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span className={`rise ${w === "benar-benar" ? "text-gradient-sun" : ""}`} style={{ "--i": i }}>
                    {w}
                  </span>
                </span>
                {i < HEADLINE.length - 1 && " "}
              </Fragment>
            ))}
          </h1>

          <p className="fade-up mt-6 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl" style={{ "--i": 3 }}>
            Jawab 20 pertanyaan santai tentang minat, kepribadian, dan gaya kerjamu. SI-RAJU mencocokkannya dengan {TOTAL_MAJORS}{" "}
            jurusan memakai model minat karier <strong className="font-semibold text-white">RIASEC</strong> — lengkap dengan
            alasan kenapa jurusan itu cocok untukmu.
          </p>

          <div className="fade-up mt-9 flex flex-wrap items-center gap-4" style={{ "--i": 4 }}>
            <MagneticButton to="/tes/" aria-label="Isi tes sekarang, gratis">
              ISI TES SEKARANG <ArrowRight size={20} aria-hidden="true" className="transition-transform group-hover/mag:translate-x-1" />
            </MagneticButton>
            <a href="#cara-kerja" className="btn btn-lg btn-ghost !border-white/15 !bg-white/5 !text-white hover:!bg-white/10">
              Lihat cara kerjanya <ArrowDown size={18} aria-hidden="true" />
            </a>
          </div>

          <ul className="fade-up mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted" style={{ "--i": 5 }}>
            {TRUST.map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <Check size={16} aria-hidden="true" className="text-sun" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto grid aspect-square w-full max-w-[26rem] place-items-center [transform:translate3d(calc(var(--px)*10px),calc(var(--py)*10px+var(--scroll)*-120px),0)]">
          {/* Orbit rings */}
          <div aria-hidden="true" className="absolute inset-[-8%] rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute inset-[6%] rounded-full border border-dashed border-white/10 motion-safe:animate-[spin_60s_linear_infinite]" />
          <div aria-hidden="true" className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgb(255_197_61/0.22),transparent_65%)] blur-2xl" />

          <button
            type="button"
            onClick={sayHi}
            aria-label="Sapa Raju, maskot SI-RAJU"
            className="fade-up float-y relative block w-[62%] translate-x-[12%] rounded-4xl"
            style={{ "--i": 2 }}
          >
            <OwlMascot className="h-auto w-full drop-shadow-[0_30px_40px_rgb(0_0_0/0.45)]" />
          </button>
          <p
            role="status"
            className={`absolute left-1/2 top-0 w-max max-w-[16rem] -translate-x-1/2 -translate-y-6 rounded-2xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-night-900 shadow-lift transition-all duration-500 ease-out-back after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-white sm:max-w-xs ${
              hoot ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0"
            }`}
          >
            {hoot}
          </p>

          {/* The 87% stat: CSS counter animates from first paint; real text for SEO/AT. */}
          <figure
            className="fade-up glass absolute bottom-[4%] left-0 w-[12.5rem] rounded-3xl p-4 shadow-lift sm:-left-6"
            style={{ "--i": 6 }}
          >
            <p className="flex items-baseline gap-0.5 text-5xl font-extrabold tracking-tight text-white">
              <span aria-hidden="true" className="count-87 tabular-nums [text-shadow:0_0_28px_rgb(255_197_61/0.55)]" />
              <span aria-hidden="true" className="text-sun">%</span>
              <span className="sr-only">87%</span>
            </p>
            <figcaption className="mt-1 text-[0.8rem] leading-snug text-ink-muted">
              mahasiswa Indonesia merasa salah memilih jurusan.
              <span className="mt-1 block text-[0.7rem] text-ink-soft">Indonesia Career Center Network, 2017</span>
            </figcaption>
          </figure>
        </div>
      </div>

      <a
        href="#cara-kerja"
        aria-label="Gulir ke cara kerja"
        className="fade-up absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-white [@media(min-height:1000px)]:md:flex"
        style={{ "--i": 8 }}
      >
        Gulir
        <span className="h-10 w-px overflow-hidden bg-white/15">
          <span className="block h-1/2 w-full bg-sun motion-safe:animate-[float-y_1.8s_ease-in-out_infinite]" />
        </span>
      </a>
    </section>
  );
}

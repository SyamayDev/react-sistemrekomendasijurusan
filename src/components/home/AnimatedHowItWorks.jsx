/**
 * Three steps, revealed with a soft scale + fade + slight 3D tilt, joined by
 * a connector that draws itself as you scroll (scroll progress → smoothed in
 * rAF → stroke-dashoffset). Horizontal on desktop, vertical on mobile.
 */
import { useEffect, useRef } from "react";
import { Compass, ListChecks, Sparkles } from "lucide-react";
import { prefersReducedMotion } from "../../lib/device.js";
import Reveal from "../ui/Reveal.jsx";
import { TOTAL_MAJORS } from "../../lib/categories.js";

const STEPS = [
  {
    Icon: ListChecks,
    title: "Jawab 20 pertanyaan",
    body: "Seputar minat, kepribadian, dan gaya kerjamu. Santai saja — tidak ada jawaban benar atau salah.",
    meta: "±4 menit",
  },
  {
    Icon: Sparkles,
    title: "Dianalisis model RIASEC",
    body: `Jawabanmu dibentuk jadi profil minat, lalu dicocokkan dengan ${TOTAL_MAJORS} jurusan — langsung di perangkatmu.`,
    meta: "Privat & instan",
  },
  {
    Icon: Compass,
    title: "Dapatkan peta jurusanmu",
    body: "Persentase kecocokan, alasan yang bisa kamu pahami, plus jurusan alternatif untuk didiskusikan.",
    meta: "Bisa dibagikan",
  },
];

export default function AnimatedHowItWorks() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const paths = el.querySelectorAll("[data-draw]");
    const paint = (v) => paths.forEach((p) => (p.style.strokeDashoffset = String(1 - v)));
    if (prefersReducedMotion()) return paint(1);
    let current = 0;
    let target = 0;
    let raf = 0;
    const tick = () => {
      current += (target - current) * 0.12;
      paint(current);
      raf = Math.abs(target - current) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const measure = () => {
      // 0 when the steps' top hits 75% of the viewport, 1 when their bottom reaches 55%.
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      target = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height + vh * 0.2)));
      if (!raf) raf = requestAnimationFrame(tick);
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section id="cara-kerja" aria-labelledby="cara-kerja-title" className="relative bg-bg py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Cara kerja</p>
          <h2 id="cara-kerja-title" className="display mt-3 text-[clamp(2rem,4.5vw,3.25rem)]">
            Dari bingung jadi yakin, <span className="text-gradient-brand">dalam tiga langkah.</span>
          </h2>
        </Reveal>

        <div ref={ref} className="relative mt-16 sm:mt-20">
          {/* Desktop connector */}
          <svg
            aria-hidden="true"
            className="absolute left-0 top-10 hidden h-24 w-full lg:block"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M200 40 C 350 -10, 450 90, 600 40 S 850 -10, 1000 40"
              stroke="var(--line)"
              strokeWidth="2"
              strokeDasharray="6 8"
              vectorEffect="non-scaling-stroke"
            />
            <path
              data-draw
              d="M200 40 C 350 -10, 450 90, 600 40 S 850 -10, 1000 40"
              stroke="url(#hiw-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
            />
            <defs>
              <linearGradient id="hiw-grad" x1="0" x2="1">
                <stop offset="0" stopColor="#8CA2FF" />
                <stop offset="0.6" stopColor="#B48CFF" />
                <stop offset="1" stopColor="#FFC53D" />
              </linearGradient>
            </defs>
          </svg>
          {/* Mobile connector */}
          <svg
            aria-hidden="true"
            className="absolute bottom-16 left-[2.25rem] top-16 w-1 lg:hidden"
            viewBox="0 0 4 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <path d="M2 0 V100" stroke="var(--line)" strokeWidth="2" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
            <path
              data-draw
              d="M2 0 V100"
              stroke="#FFC53D"
              strokeWidth="3"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
            />
          </svg>

          <ol className="relative grid gap-8 lg:grid-cols-3 lg:gap-10">
            {STEPS.map(({ Icon, title, body, meta }, i) => (
              <Reveal
                as="li"
                key={title}
                delay={i * 140}
                className="reveal-tilt relative flex gap-5 lg:flex-col lg:items-center lg:text-center"
              >
                <div className="relative shrink-0">
                  <span aria-hidden="true" className="absolute inset-0 rounded-full bg-sun/30 blur-xl" />
                  <div
                    className="float-y relative grid size-[4.5rem] place-items-center rounded-full border border-line bg-surface text-primary shadow-lift lg:size-20"
                    style={{ animationDelay: `${i * -2}s` }}
                  >
                    <Icon size={30} strokeWidth={1.7} aria-hidden="true" />
                    <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-sun text-xs font-extrabold text-on-sun shadow-soft">
                      {i + 1}
                    </span>
                  </div>
                </div>
                <div className="card flex-1 p-6 lg:mt-6 lg:w-full">
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-ink-muted">{body}</p>
                  <p className="mt-4 inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{meta}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

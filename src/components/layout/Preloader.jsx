/**
 * "Memuat Semesta RAJU" — the home page's loader screen. It covers the page
 * from the very first paint (html[data-load3d], set by the inline head script)
 * until the 3D world has drawn, so the scroll story always opens with RAJU
 * alive instead of a static or half-built scene. Progress is real: two
 * downloads counted in bytes, then the build, lighting and shader steps
 * (lib/loader3d.js). Escape hatches: start the test right away, or continue
 * without 3D.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import OwlMascot from "../ui/OwlMascot.jsx";
import { scene, subscribeScene } from "../../lib/sceneStore.js";
import { IDLE_LOAD, LOAD_STEPS, attachLoader, detachLoader, skipLoad } from "../../lib/loader3d.js";
import { CATEGORIES } from "../../lib/categories.js";

const R = 88;
const C = 2 * Math.PI * R;
const SEG = C / CATEGORIES.length;
const GAP = 7;

/** Counts the shown percentage smoothly towards the real one. */
function useEased(target) {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const next = current.current + (target - current.current) * 0.16;
      current.current = Math.abs(target - next) < 0.002 ? target : next;
      setValue(current.current);
      if (current.current !== target) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

/** Eight rumpun-coloured arcs that light up one after another — the portal, being built. */
function Ring({ value }) {
  return (
    <svg viewBox="0 0 200 200" className="size-52 sm:size-60" aria-hidden="true">
      {CATEGORIES.map((c, i) => {
        const fill = Math.min(1, Math.max(0, value * CATEGORIES.length - i));
        const rotate = (i * 360) / CATEGORIES.length - 90;
        return (
          <g key={c.id} transform={`rotate(${rotate} 100 100)`}>
            <circle cx="100" cy="100" r={R} fill="none" stroke={c.warna} strokeOpacity="0.16" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${SEG - GAP} ${C}`} />
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={c.warna}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${(SEG - GAP) * fill} ${C}`}
              style={{ filter: fill > 0 ? `drop-shadow(0 0 6px ${c.warna})` : undefined }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function Preloader() {
  const load = useSyncExternalStore(subscribeScene, () => scene.load, () => IDLE_LOAD);
  const shown = useEased(load.pct);
  const pct = Math.round(shown * 100);
  const readyCount = load.steps.filter((f) => f >= 1).length;
  const currentIndex = load.steps.findIndex((f) => f < 1);
  const failed = load.state === "failed";

  useEffect(() => {
    attachLoader();
    return detachLoader;
  }, []);

  const skip = (e) => {
    e.preventDefault();
    skipLoad();
  };

  return (
    <div className="preloader" data-state={load.state}>
      <div className="stars-layer pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="absolute left-0 top-0 flex h-[var(--header-h)] items-center px-[clamp(1rem,4vw,2rem)]">
        <span className="flex items-center gap-2.5 font-extrabold tracking-tight">
          <OwlMascot interactive={false} className="h-9 w-auto" />
          <span className="text-[1.15rem]">
            SI<span className="text-sun-ink dark:text-sun">-</span>RAJU
          </span>
        </span>
      </div>

      <div className="relative flex w-full max-w-md flex-col items-center px-6 text-center">
        <div className="relative grid place-items-center">
          <Ring value={shown} />
          <div className="absolute inset-0 grid place-items-center">
            <p className="display flex items-start text-[clamp(3.2rem,9vw,4.4rem)] tabular-nums" aria-hidden="true">
              {pct}
              <span className="ml-1 mt-2 text-[0.38em] text-ink-muted">%</span>
            </p>
          </div>
        </div>

        <p className="display mt-7 text-[clamp(1.5rem,4vw,2rem)]">{failed ? "Semesta 3D belum bisa dimuat" : "Memuat Semesta RAJU"}</p>
        <p className="mt-2 text-sm text-ink-muted" role="status" aria-live="polite">
          {failed
            ? "Koneksi atau perangkatmu sedang lambat. Coba lagi, atau lanjutkan tanpa 3D — semua fitur tetap bisa dipakai."
            : load.state === "done"
              ? "Semesta siap. Selamat menjelajah!"
              : `${currentIndex < 0 ? "Membuka gerbang semesta" : LOAD_STEPS[currentIndex].label} · ${readyCount} / ${LOAD_STEPS.length} siap`}
        </p>

        <div
          role="progressbar"
          aria-label="Memuat semesta 3D"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="sr-only"
        />

        <ol className="mt-6 grid w-full gap-2 text-left text-sm" aria-label="Aset yang disiapkan">
          {LOAD_STEPS.map((s, i) => {
            const f = load.steps[i];
            const done = f >= 1;
            const active = !done && i === currentIndex && !failed;
            return (
              <li key={s.id} className={`flex items-center gap-3 transition-opacity duration-300 ${done || active ? "opacity-100" : "opacity-45"}`}>
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                    done ? "border-transparent bg-sun text-on-sun" : active ? "border-sun" : "border-line"
                  }`}
                  aria-hidden="true"
                >
                  {done ? <Check size={12} strokeWidth={3} /> : active ? <span className="size-1.5 rounded-full bg-sun motion-safe:animate-pulse" /> : null}
                </span>
                <span className="flex-1">{s.label}</span>
                <span className="hud-label tabular-nums text-ink-soft">{done ? "siap" : `${Math.round(f * 100)}%`}</span>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {failed ? (
            <>
              <button type="button" className="btn btn-sun" onClick={() => window.location.reload()}>
                <RotateCcw size={16} aria-hidden="true" /> Coba lagi
              </button>
              <a href="?3d=off" onClick={skip} className="btn btn-ghost">
                Lanjut tanpa 3D
              </a>
            </>
          ) : (
            <>
              <Link to="/tes/" className="btn btn-ghost">
                Langsung mulai tes <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a href="?3d=off" onClick={skip} className="text-sm font-semibold text-ink-muted underline-offset-4 hover:text-ink hover:underline">
                Lewati 3D
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

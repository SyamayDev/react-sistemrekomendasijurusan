/**
 * Chapter 4 — "Semesta Jurusan". The 150 tiles gather around eight field
 * planets. Choosing a field (chips here, or the floating planet labels)
 * flies the camera to that planet, lights its majors, and lists the real
 * majors from majors.json (lazy-loaded) with links to their pages.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { Chapter, HudTag, Kicker } from "./parts.jsx";
import CategoryIcon from "../ui/CategoryIcon.jsx";
import { CATEGORIES, TOTAL_MAJORS } from "../../lib/categories.js";
import { setScene } from "../../lib/sceneStore.js";

const loadMajors = () => import("../../lib/majors.js");

/** Fallback orbit (no WebGL): eight coloured planets on a ring. */
function OrbitArt({ selected }) {
  return (
    <div className="relative mx-auto aspect-square h-full max-h-[24rem] max-w-full" aria-hidden="true">
      <div className="absolute inset-[8%] rounded-full border border-dashed border-current opacity-25" />
      {CATEGORIES.map((c, k) => {
        const a = (k / CATEGORIES.length) * Math.PI * 2 - Math.PI / 2;
        const size = 26 + Math.sqrt(c.jumlah) * 3.2;
        return (
          <span
            key={c.id}
            className="absolute rounded-full transition-transform duration-500"
            style={{
              width: size,
              height: size,
              left: `calc(50% + ${Math.cos(a) * 42}% - ${size / 2}px)`,
              top: `calc(50% + ${Math.sin(a) * 42}% - ${size / 2}px)`,
              background: c.warna,
              transform: selected === k ? "scale(1.35)" : selected >= 0 ? "scale(0.8)" : "none",
              boxShadow: selected === k ? `0 0 30px ${c.warna}` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

export default function ChapterUniverse() {
  const [selected, setSelected] = useState(-1);
  const [data, setData] = useState(null);

  useEffect(() => {
    setScene({ selectedRumpun: selected });
  }, [selected]);
  useEffect(() => () => setScene({ selectedRumpun: -1 }), []);

  const choose = (k) => {
    setSelected((cur) => (cur === k ? -1 : k));
    if (!data) loadMajors().then(setData);
  };
  const cat = selected >= 0 ? CATEGORIES[selected] : null;
  const list = cat && data ? data.MAJORS.filter((m) => m.kategori === cat.id).sort((a, b) => a.nama_jurusan.localeCompare(b.nama_jurusan, "id")) : [];

  return (
    <Chapter index={4} id="semesta" h="260svh" labelledBy="semesta-title">
      <div className="container-x relative grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] items-end pb-[var(--stage-pb)] pt-[calc(var(--header-h)+1rem)] lg:grid-cols-[minmax(0,32rem)_1fr] lg:grid-rows-1 lg:items-center lg:pb-0">
        <div data-panel className="relative z-10 row-start-2 min-w-0 lg:row-start-1">
          <Kicker n={4}>Semesta jurusan</Kicker>
          <h2 id="semesta-title" className="display mt-5 text-[clamp(2.1rem,min(4.4vw,6svh),3.6rem)]">
            <span className="mask-line" style={{ "--o": 0.35 }}>
              <span>{TOTAL_MAJORS} jurusan,</span>
            </span>{" "}
            <span className="mask-line" style={{ "--o": 0.42 }}>
              <span className="accent-word">8 planet rumpun.</span>
            </span>
          </h2>
          <p className={`enter-fx mt-3 max-w-md text-ink-muted max-lg:text-sm ${cat ? "max-lg:hidden" : ""}`} style={{ "--o": 0.5 }}>
            Pilih satu rumpun untuk terbang ke planetnya dan melihat jurusan apa saja di dalamnya.
          </p>
          <div role="group" aria-label="Pilih rumpun jurusan" className="enter-fx mt-5 grid grid-cols-2 gap-2 max-lg:flex max-lg:overflow-x-auto max-lg:pb-1 max-lg:[scrollbar-width:none]" style={{ "--o": 0.55 }}>
            {CATEGORIES.map((c, k) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={selected === k}
                aria-controls="semesta-panel"
                onClick={() => choose(k)}
                onPointerEnter={() => !data && loadMajors()}
                className={`flex min-h-11 shrink-0 lg:min-h-10 items-center gap-2.5 rounded-2xl border px-3 text-left text-sm font-semibold transition-all ${
                  selected === k ? "border-transparent bg-ink text-bg" : "border-line bg-surface/70 text-ink backdrop-blur hover:border-primary/40"
                }`}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg text-night-900" style={{ background: c.warna }}>
                  <CategoryIcon name={c.ikon} size={15} />
                </span>
                <span className="flex-1">{c.nama}</span>
                <span className="text-xs opacity-70">{c.jumlah}</span>
              </button>
            ))}
          </div>
          <div id="semesta-panel" aria-live="polite" className="enter-fx mt-3 rounded-3xl border border-line/70 bg-surface/80 p-4 backdrop-blur-md" style={{ "--o": 0.6 }}>
            {!cat ? (
              <p className="text-sm text-ink-muted">Belum ada rumpun dipilih. Ketuk salah satu di atas{" "}<span className="max-lg:hidden">atau label planetnya</span>.</p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{cat.nama}</p>
                    <p className="text-sm text-ink-muted">{cat.deskripsi}</p>
                  </div>
                  <Link to={`/jurusan/?rumpun=${encodeURIComponent(cat.id)}`} className="hud-label inline-flex shrink-0 items-center gap-1 text-primary hover:underline">
                    Katalog <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                </div>
                <ul className="mt-3 grid max-h-[16svh] grid-cols-1 gap-x-4 overflow-y-auto pr-1 text-sm sm:grid-cols-2 lg:max-h-[20svh]">
                  {list.length === 0
                    ? Array.from({ length: 6 }, (_, i) => <li key={i} className="skeleton my-1 h-5" />)
                    : list.map((m) => (
                        <li key={m.id}>
                          <Link to={`/jurusan/${m.slug}/`} className="flex min-h-9 items-center text-ink-muted hover:text-primary">
                            {m.nama_jurusan}
                          </Link>
                        </li>
                      ))}
                </ul>
              </>
            )}
          </div>
        </div>
        <div className="fallback-art pointer-events-none row-start-1 flex min-h-0 items-center self-stretch overflow-hidden justify-center text-ink lg:col-start-2">
          <OrbitArt selected={selected} />
        </div>
      </div>
      {CATEGORIES.map((c, k) => (
        <HudTag key={c.id} k={`planet-${c.id}`} side="below" onClick={() => choose(k)}>
          {c.id}
        </HudTag>
      ))}
    </Chapter>
  );
}

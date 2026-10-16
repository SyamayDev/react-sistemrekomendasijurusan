/**
 * "Semesta Jurusan" — the eight fields as tilting cards. Each card is a real
 * link into the catalogue (good for SEO and for curious students).
 */
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import Reveal from "../ui/Reveal.jsx";
import TiltCard from "../ui/TiltCard.jsx";
import CategoryIcon from "../ui/CategoryIcon.jsx";
import { CATEGORIES, TOTAL_MAJORS } from "../../lib/categories.js";

export default function CategoryExplorer() {
  return (
    <section aria-labelledby="semesta-title" className="relative overflow-hidden bg-bg-soft py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">Semesta jurusan</p>
            <h2 id="semesta-title" className="display mt-3 text-[clamp(2rem,4.5vw,3.25rem)]">
              {TOTAL_MAJORS} jurusan, 8 rumpun.{" "}
              <span className="text-ink-soft">Mana bintangmu?</span>
            </h2>
          </div>
          <Link to="/jurusan/" className="btn btn-ghost">
            Lihat semua jurusan <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </Reveal>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Reveal as="li" key={c.id} delay={(i % 4) * 80}>
              <TiltCard className="h-full rounded-3xl">
                <Link
                  to={`/jurusan/?rumpun=${encodeURIComponent(c.id)}`}
                  className="card group relative flex h-full flex-col overflow-hidden p-6 transition-shadow duration-500 hover:shadow-lift"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -right-10 -top-10 size-40 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                    style={{ background: c.warna }}
                  />
                  <span className="flex items-center justify-between">
                    <span
                      className="grid size-12 place-items-center rounded-2xl text-night-900 transition-transform duration-500 ease-out-back group-hover:-rotate-6 group-hover:scale-110"
                      style={{ background: c.warna }}
                    >
                      <CategoryIcon name={c.ikon} size={22} />
                    </span>
                    <span className="text-sm font-bold text-ink-soft">
                      <span className="text-2xl font-extrabold text-ink">{c.jumlah}</span> jurusan
                    </span>
                  </span>
                  <span className="mt-6 text-lg font-bold">{c.nama}</span>
                  <span className="mt-1.5 text-sm text-ink-muted">{c.deskripsi}</span>
                  <span className="mt-5 flex flex-wrap gap-1.5">
                    {c.contoh.map((n) => (
                      <span key={n} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted">
                        {n}
                      </span>
                    ))}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-bold text-primary">
                    Jelajahi {c.nama}
                    <ArrowUpRight size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Catalogue of all majors, grouped by field. Fully prerendered (150 internal
 * links = great for SEO); search and field filters enhance it after hydration
 * and the field filter is shareable via ?rumpun=.
 */
import { useDeferredValue, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowRight, Search, X } from "lucide-react";
import CategoryIcon from "../components/ui/CategoryIcon.jsx";
import { MAJORS } from "../lib/majors.js";
import { CATEGORIES } from "../lib/categories.js";
import { useSeo, ldBreadcrumbs } from "../lib/seo.jsx";
import { useHydrated } from "../lib/useHydrated.js";

export default function Majors() {
  useSeo({
    title: "Daftar 150 Jurusan Kuliah & Karakter yang Cocok",
    path: "/jurusan/",
    description:
      "Jelajahi 150 jurusan kuliah di 8 rumpun — STEM, kesehatan, bisnis, sosial, humaniora, seni, pendidikan, dan vokasi — lengkap dengan deskripsi dan karakter siswa yang cocok.",
    jsonLd: [ldBreadcrumbs([{ name: "Beranda", path: "/" }, { name: "Jurusan", path: "/jurusan/" }])],
  });

  const hydrated = useHydrated();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());
  const rumpun = (hydrated && params.get("rumpun")) || "Semua";

  const setRumpun = (id) => {
    const next = new URLSearchParams(params);
    if (id === "Semua") next.delete("rumpun");
    else next.set("rumpun", id);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const groups = useMemo(
    () =>
      CATEGORIES.filter((c) => rumpun === "Semua" || c.id === rumpun)
        .map((c) => ({
          ...c,
          items: MAJORS.filter(
            (m) =>
              m.kategori === c.id &&
              (!q || m.nama_jurusan.toLowerCase().includes(q) || m.karakter_cocok.some((k) => k.includes(q)) || m.deskripsi.toLowerCase().includes(q))
          ).sort((a, b) => a.nama_jurusan.localeCompare(b.nama_jurusan, "id")),
        }))
        .filter((g) => g.items.length),
    [rumpun, q]
  );
  const count = groups.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="pb-24 pt-[calc(var(--header-h)+2.5rem)] sm:pt-[calc(var(--header-h)+4rem)]">
      <div className="container-x">
        <nav aria-label="Breadcrumb" className="fade-up text-sm text-ink-soft">
          <ol className="flex gap-2">
            <li>
              <Link to="/" className="hover:text-primary">
                Beranda
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-ink-muted">
              Jurusan
            </li>
          </ol>
        </nav>
        <h1 className="display fade-up mt-4 max-w-3xl text-[clamp(2.3rem,6vw,4rem)]" style={{ "--i": 1 }}>
          Jelajahi <span className="text-gradient-brand">{MAJORS.length} jurusan</span> kuliah
        </h1>
        <p className="fade-up mt-4 max-w-2xl text-lg text-ink-muted" style={{ "--i": 2 }}>
          Kenali isi tiap jurusan dan karakter siswa yang biasanya betah di sana. Masih bingung memilih? Biarkan tes minat bakat
          SI-RAJU yang mengurutkannya untukmu.
        </p>

        <div className="sticky top-[calc(var(--header-h)+0.5rem)] z-20 mt-10">
          <div className="glass rounded-3xl !bg-surface/90 p-3 shadow-soft">
            <label className="relative block">
              <span className="sr-only">Cari jurusan atau karakter</span>
              <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari jurusan atau karakter, mis. “kreatif”"
                className="h-12 w-full rounded-2xl border border-line bg-surface pl-11 pr-11 text-ink placeholder:text-ink-soft focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian" className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-ink-soft hover:bg-surface-2">
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </label>
            <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="group" aria-label="Filter rumpun">
              {[{ id: "Semua", nama: "Semua", jumlah: MAJORS.length }, ...CATEGORIES].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={rumpun === c.id}
                  onClick={() => setRumpun(c.id)}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all ${
                    rumpun === c.id ? "border-transparent bg-ink text-bg" : "border-line bg-surface text-ink-muted hover:text-ink"
                  }`}
                >
                  {c.warna && <span className="size-2 rounded-full" style={{ background: c.warna }} aria-hidden="true" />}
                  {c.nama}
                  <span className="text-xs">{c.jumlah}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-ink-soft" aria-live="polite">
          {count} jurusan ditemukan
        </p>

        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`rumpun-${g.id}`} className="mt-12">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl text-night-900" style={{ background: g.warna }}>
                <CategoryIcon name={g.ikon} size={20} />
              </span>
              <div>
                <h2 id={`rumpun-${g.id}`} className="text-2xl font-bold">
                  {g.nama}
                </h2>
                <p className="text-sm text-ink-soft">{g.deskripsi}</p>
              </div>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((m) => (
                // 150 of these: a semantic class (see .major-card in index.css) keeps the HTML light.
                <li key={m.id} className="major-li">
                  <Link to={`/jurusan/${m.slug}/`} className="major-card">
                    <h3>{m.nama_jurusan}</h3>
                    <p>{m.deskripsi}</p>
                    <span>{m.karakter_cocok.slice(0, 3).join(" · ")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {count === 0 && (
          <p className="mt-16 text-center text-ink-muted">
            Tidak ada jurusan yang cocok dengan “{query}”. Coba kata lain, atau{" "}
            <button type="button" className="font-semibold text-primary underline" onClick={() => setQuery("")}>
              hapus pencarian
            </button>
            .
          </p>
        )}

        <div className="card mt-20 flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-bold">Terlalu banyak pilihan?</h2>
            <p className="mt-2 text-ink-muted">Tes 4 menit akan mengurutkan {MAJORS.length} jurusan ini sesuai minat dan karaktermu.</p>
          </div>
          <Link to="/tes/" className="btn btn-sun btn-lg shrink-0">
            Mulai tes gratis <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

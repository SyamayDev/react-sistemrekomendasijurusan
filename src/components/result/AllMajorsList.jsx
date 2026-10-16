/** Every major, ranked — searchable and filterable by field. */
import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router";
import { Search } from "lucide-react";
import { CATEGORIES, CATEGORY_BY_ID } from "../../lib/categories.js";
import { MAJOR_BY_ID, matchLabel } from "../../lib/majors.js";

export default function AllMajorsList({ ranked }) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("Semua");
  const [expanded, setExpanded] = useState(false);
  const q = useDeferredValue(query.trim().toLowerCase());

  const list = useMemo(
    () =>
      ranked
        .map((m, i) => ({ ...m, rank: i + 1 }))
        .filter((m) => (field === "Semua" || m.kategori === field) && (!q || m.nama_jurusan.toLowerCase().includes(q))),
    [ranked, field, q]
  );
  const visible = expanded || q || field !== "Semua" ? list : list.slice(0, 10);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Cari jurusan</span>
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari jurusan, mis. Psikologi"
            className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-ink placeholder:text-ink-soft focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
        </label>
        <label className="relative">
          <span className="sr-only">Filter rumpun</span>
          <select
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="h-12 w-full appearance-none rounded-full border border-line bg-surface px-5 pr-10 font-semibold text-ink focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 sm:w-56"
          >
            <option value="Semua">Semua rumpun</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 text-sm text-ink-soft" aria-live="polite">
        Menampilkan {visible.length} dari {list.length} jurusan
      </p>

      <ol className="mt-3 divide-y divide-line">
        {visible.map((m) => {
          const cat = CATEGORY_BY_ID[m.kategori];
          return (
            <li key={m.id}>
              <Link
                to={`/jurusan/${MAJOR_BY_ID[m.id].slug}/`}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-xl px-2 py-3.5 transition-colors hover:bg-surface-2 sm:grid-cols-[3rem_1fr_14rem]"
              >
                <span className="text-sm font-bold tabular-nums text-ink-soft">#{m.rank}</span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink group-hover:text-primary">{m.nama_jurusan}</span>
                  <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <span className="size-2 rounded-full" style={{ background: cat?.warna }} aria-hidden="true" />
                    {cat?.nama} · {matchLabel(m.score)}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="hidden h-2 flex-1 overflow-hidden rounded-full bg-surface-2 sm:block" aria-hidden="true">
                    <span className="block h-full rounded-full" style={{ width: `${m.score}%`, background: cat?.warna }} />
                  </span>
                  <span className="w-11 text-right font-bold tabular-nums text-ink">{m.score}%</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      {!expanded && !q && field === "Semua" && list.length > 10 && (
        <button type="button" onClick={() => setExpanded(true)} className="btn btn-ghost mt-4 w-full">
          Tampilkan semua {list.length} jurusan
        </button>
      )}
    </div>
  );
}

/**
 * One static, indexable page per major (150 in total). If the visitor has a
 * saved result, the page personalises itself after hydration with their
 * match score for this major.
 */
import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import RadarChart from "../components/ui/RadarChart.jsx";
import ProgressRing from "../components/ui/ProgressRing.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import CategoryIcon from "../components/ui/CategoryIcon.jsx";
import NotFound from "./NotFound.jsx";
import { MAJORS, MAJOR_BY_SLUG, matchLabel } from "../lib/majors.js";
import { insightFor } from "../lib/insights.js";
import { getModel } from "../lib/recommender.js";
import { CATEGORY_BY_ID } from "../lib/categories.js";
import { cosine, dominantTypes, majorProfile } from "../lib/riasec.js";
import { useSeo, ldBreadcrumbs } from "../lib/seo.jsx";
import { useStored } from "../lib/useStored.js";
import { KEYS } from "../lib/storage.js";
import MotionProvider from "../components/MotionProvider.jsx";

function clip(text, max) {
  return text.length <= max ? text : `${text.slice(0, text.lastIndexOf(" ", max - 1))}…`;
}

function Personal({ major }) {
  const stored = useStored(KEYS.result);
  const mine = useMemo(() => {
    if (!stored?.answers) return null;
    const model = getModel();
    const r = model.recommend(stored.answers);
    const idx = r.ranked.findIndex((m) => m.id === major.id);
    return { score: r.ranked[idx].score, rank: idx + 1, reasons: model.explain(major.id, stored.answers, 3) };
  }, [stored, major.id]);

  if (!mine) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-bold">Seberapa cocok jurusan ini untukmu?</h2>
        <p className="mt-2 text-sm text-ink-muted">Ikuti tes 4 menit untuk melihat persentase kecocokanmu dengan {major.nama_jurusan}.</p>
        <Link to="/tes/" className="btn btn-sun mt-5 w-full">
          Cek kecocokanku <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    );
  }
  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold">Kecocokanmu</h2>
      <div className="mt-4 flex items-center gap-4">
        <ProgressRing value={mine.score} size={96} stroke={9}>
          <span className="text-xl font-extrabold">{mine.score}%</span>
        </ProgressRing>
        <div>
          <p className="font-bold">{matchLabel(mine.score)}</p>
          <p className="text-sm text-ink-muted">
            Peringkat #{mine.rank} dari {MAJORS.length} di hasil tesmu
          </p>
        </div>
      </div>
      {mine.reasons.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm text-ink-muted">
          {mine.reasons.map((r) => (
            <li key={r.qid} className="flex gap-2">
              <Check size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" /> {r.text}
            </li>
          ))}
        </ul>
      )}
      <Link to="/hasil/" className="btn btn-ghost mt-5 w-full">
        Lihat hasil lengkapku
      </Link>
    </div>
  );
}

function MajorDetailPage() {
  const { slug } = useParams();
  const major = MAJOR_BY_SLUG[slug];
  const profile = useMemo(() => (major ? majorProfile(major) : null), [major]);
  const related = useMemo(() => {
    if (!major) return [];
    return MAJORS.filter((m) => m.id !== major.id && m.kategori === major.kategori)
      .map((m) => ({ ...m, sim: cosine(profile, majorProfile(m)) }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 6);
  }, [major, profile]);

  const cat = major ? CATEGORY_BY_ID[major.kategori] : null;
  const path = `/jurusan/${slug}/`;
  useSeo(
    major
      ? {
          title: `Jurusan ${major.nama_jurusan}: Cocok untuk Siapa?`,
          path,
          type: "article",
          description: clip(
            `${major.deskripsi} Cocok untuk kamu yang ${major.karakter_cocok.slice(0, 3).join(", ")}. Cek kecocokanmu lewat tes minat bakat gratis SI-RAJU.`,
            158
          ),
          jsonLd: [
            ldBreadcrumbs([
              { name: "Beranda", path: "/" },
              { name: "Jurusan", path: "/jurusan/" },
              { name: major.nama_jurusan, path },
            ]),
          ],
        }
      : { title: "Jurusan tidak ditemukan", path, description: "Halaman jurusan tidak ditemukan.", noindex: true }
  );

  if (!major) return <NotFound />;
  const [t1, t2] = dominantTypes(profile);

  return (
    <article className="pb-24 pt-[calc(var(--header-h)+2.5rem)] sm:pt-[calc(var(--header-h)+4rem)]">
      <div className="container-x">
        <nav aria-label="Breadcrumb" className="fade-up text-sm text-ink-soft">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link to="/" className="hover:text-primary">
                Beranda
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/jurusan/" className="hover:text-primary">
                Jurusan
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-ink-muted">
              {major.nama_jurusan}
            </li>
          </ol>
        </nav>

        <header className="mt-6 max-w-3xl">
          <Link
            to={`/jurusan/?rumpun=${encodeURIComponent(major.kategori)}`}
            className="fade-up inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-ink-muted hover:text-ink"
            style={{ "--i": 1 }}
          >
            <span className="grid size-6 place-items-center rounded-full text-night-900" style={{ background: cat.warna }}>
              <CategoryIcon name={cat.ikon} size={14} />
            </span>
            Rumpun {cat.nama}
          </Link>
          <h1 className="display fade-up mt-5 text-[clamp(2.3rem,6vw,4.2rem)]" style={{ "--i": 2 }}>
            Jurusan {major.nama_jurusan}
          </h1>
          <p className="fade-up mt-5 text-xl leading-relaxed text-ink-muted" style={{ "--i": 3 }}>
            {major.deskripsi}
          </p>
        </header>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-8">
            <section aria-labelledby="gambaran" className="card p-6 sm:p-8">
              <h2 id="gambaran" className="text-2xl font-bold">
                Gambaran kecocokan
              </h2>
              <p className="mt-3 leading-relaxed text-ink-muted">{insightFor(major)}</p>
            </section>

            <section aria-labelledby="karakter" className="card p-6 sm:p-8">
              <h2 id="karakter" className="text-2xl font-bold">
                Cocok untuk kamu yang…
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {major.karakter_cocok.map((k) => (
                  <li key={k} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3 font-semibold capitalize">
                    <Check size={18} aria-hidden="true" className="shrink-0 text-primary" /> {k}
                  </li>
                ))}
              </ul>
            </section>

            <Reveal as="section" aria-labelledby="profil-jurusan" className="card p-6 sm:p-8">
              <h2 id="profil-jurusan" className="text-2xl font-bold">
                Profil minat jurusan
              </h2>
              <p className="mt-2 text-ink-muted">
                Menurut model RIASEC, {major.nama_jurusan} paling dekat dengan tipe <strong className="text-ink">{t1.nama}</strong> dan{" "}
                <strong className="text-ink">{t2.nama}</strong>. Arahkan kursor ke label untuk penjelasannya.
              </p>
              <RadarChart
                className="mt-6 pb-14"
                caption={`Profil minat RIASEC jurusan ${major.nama_jurusan}`}
                series={[{ label: major.nama_jurusan, values: profile, color: cat.warna }]}
              />
            </Reveal>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start" aria-label="Kecocokan dan jurusan serumpun">
            <Personal major={major} />
            <nav aria-labelledby="serumpun" className="card p-6">
              <h2 id="serumpun" className="text-lg font-bold">
                Jurusan serumpun
              </h2>
              <ul className="mt-3 divide-y divide-line">
                {related.map((m) => (
                  <li key={m.id}>
                    <Link to={`/jurusan/${m.slug}/`} className="group flex min-h-12 items-center justify-between gap-3 py-2 text-ink-muted hover:text-primary">
                      <span className="font-semibold">{m.nama_jurusan}</span>
                      <ArrowUpRight size={16} aria-hidden="true" className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </article>
  );
}

export default function MajorDetail(props) {
  return (
    <MotionProvider>
      <MajorDetailPage {...props} />
    </MotionProvider>
  );
}

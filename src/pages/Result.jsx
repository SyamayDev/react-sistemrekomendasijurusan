/**
 * Result — the wow moment, used for both "my result" (/hasil/) and a shared
 * link (/hasil/bagikan/?r=…). Data lives only in the browser, so the
 * prerendered HTML is a skeleton and everything renders after hydration.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, m } from "motion/react";
import { ArrowRight, ArrowUpRight, Bot, Sparkles } from "lucide-react";
import ResultReveal from "../components/result/ResultReveal.jsx";
import WhyMatch from "../components/result/WhyMatch.jsx";
import MatchCard from "../components/result/MatchCard.jsx";
import AllMajorsList from "../components/result/AllMajorsList.jsx";
import ShareActions from "../components/result/ShareActions.jsx";
import ProgressRing from "../components/ui/ProgressRing.jsx";
import CountUp from "../components/ui/CountUp.jsx";
import RadarChart from "../components/ui/RadarChart.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import OwlMascot from "../components/ui/OwlMascot.jsx";
import { AccordionItem } from "../components/ui/Accordion.jsx";
import { getModel, questions, majors } from "../lib/recommender.js";
import { MAJOR_BY_ID, matchLabel } from "../lib/majors.js";
import { insightFor } from "../lib/insights.js";
import { decodeAnswers } from "../lib/answerCodec.js";
import { CATEGORY_BY_ID, CATEGORY_IDS } from "../lib/categories.js";
import { dominantTypes, RIASEC } from "../lib/riasec.js";
import { storage, KEYS } from "../lib/storage.js";
import { useStored, notifyStored } from "../lib/useStored.js";
import { useHydrated } from "../lib/useHydrated.js";
import { useSeo } from "../lib/seo.jsx";
import { useSceneMode } from "../lib/useScene.js";
import { setScene } from "../lib/sceneStore.js";
import { openChat, resultContext } from "../lib/chatBridge.js";
import { prefersReducedMotion } from "../lib/device.js";
import owlShrug from "../assets/owl-shrug-sm.webp";
import MotionProvider from "../components/MotionProvider.jsx";

const COMPARE_COLORS = ["#2B48C8", "#B48CFF", "#2FD3A0"];

function EmptyState({ shared }) {
  return (
    <div className="container-x grid min-h-[80svh] place-items-center pt-(--header-h) text-center">
      <div className="max-w-md">
        <OwlMascot mood="thinking" className="mx-auto h-36 w-auto" />
        <h1 className="display mt-6 text-3xl">{shared ? "Link hasil tidak valid" : "Belum ada hasil tes"}</h1>
        <p className="mt-3 text-ink-muted">
          {shared
            ? "Sepertinya link ini rusak atau tidak lengkap. Kamu bisa langsung mencoba tesnya sendiri — cuma 4 menit."
            : "Kerjakan tes minat bakat dulu, nanti peta jurusanmu akan tersimpan di sini."}
        </p>
        <Link to="/tes/" className="btn btn-sun btn-lg mt-8">
          Mulai tes <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="container-x pb-24 pt-[calc(var(--header-h)+3rem)]" role="status">
      <span className="sr-only">Memuat hasil…</span>
      <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr]">
        <div className="skeleton mx-auto size-56 rounded-full" />
        <div className="space-y-4">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-14 w-full max-w-lg" />
          <div className="skeleton h-5 w-full max-w-md" />
        </div>
      </div>
    </div>
  );
}

function ResultPage({ shared = false }) {
  useSceneMode("result");
  useSeo({
    title: shared ? "Hasil Tes Jurusan yang Dibagikan" : "Hasil Tes Minat Bakat Kamu",
    path: shared ? "/hasil/bagikan/" : "/hasil/",
    description: "Peta jurusan kuliah hasil tes minat bakat SI-RAJU: persentase kecocokan, alasan, dan profil minat RIASEC.",
    noindex: true,
  });

  const hydrated = useHydrated();
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const stored = useStored(KEYS.result);
  const fresh = Boolean(location.state?.fresh) && !shared;
  const [revealing, setRevealing] = useState(() => fresh && !prefersReducedMotion());
  const [compare, setCompare] = useState(0);

  const answers = useMemo(() => {
    if (!hydrated) return undefined;
    if (shared) return decodeAnswers(params.get("r"), questions);
    return stored?.answers ?? null;
  }, [hydrated, shared, params, stored]);

  const result = useMemo(() => (answers ? getModel().recommend(answers) : null), [answers]);
  const top = result?.ranked[0];
  const highlight = top ? majors.findIndex((x) => x.id === top.id) : -1;
  const focus = useMemo(() => {
    if (!result) return [];
    const by = Object.fromEntries(result.categories.map((c) => [c.id, c.score]));
    const vals = CATEGORY_IDS.map((id) => by[id] ?? 0);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    return vals.map((v) => (max > min ? Math.pow((v - min) / (max - min), 2) : 0));
  }, [result]);
  const details = useMemo(
    () =>
      result
        ? result.ranked.slice(0, 4).map((mj) => ({ reasons: getModel().explain(mj.id, answers), traits: getModel().sharedTraits(mj.id, answers) }))
        : [],
    [result, answers]
  );

  const steps = useMemo(
    () => [
      `Membaca ${Object.keys(answers || {}).length} jawabanmu…`,
      "Menyusun profil minat RIASEC…",
      `Mencocokkan dengan ${majors.length} jurusan…`,
      "Menemukan bintangmu ✨",
    ],
    [answers]
  );

  const finishReveal = useCallback(() => setRevealing(false), []);

  // Once the content is on screen, light up the student's star.
  const showContent = Boolean(result) && !revealing;
  useEffect(() => {
    if (showContent) setScene({ highlight, focus, energy: 1 });
  }, [showContent, highlight, focus]);

  if (!hydrated || answers === undefined) return <ResultSkeleton />;
  if (!result || Object.keys(answers).length < 5) return <EmptyState shared={shared} />;

  const cat = CATEGORY_BY_ID[top.kategori];
  const [t1, t2] = dominantTypes(result.profile);
  const comparison = result.ranked[compare];
  const retake = () => {
    storage.remove(KEYS.result);
    notifyStored();
    navigate("/tes/");
  };

  return (
    <>
      <AnimatePresence>{revealing && <ResultReveal steps={steps} onDone={finishReveal} highlight={highlight} focus={focus} />}</AnimatePresence>
      {/* Hold the page height during the reveal so the footer doesn't peek through. */}
      {revealing && <div className="min-h-svh" aria-hidden="true" />}

      {showContent && (
        <div className="pb-24 pt-[calc(var(--header-h)+2rem)] sm:pt-[calc(var(--header-h)+3.5rem)]">
          {/* ---------- #1 match ---------- */}
          <section aria-labelledby="hasil-utama" className="container-x">
            <m.div
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="card glass relative overflow-hidden rounded-[2.5rem] p-6 sm:p-12"
            >
              <span aria-hidden="true" className="absolute -right-24 -top-24 size-80 rounded-full opacity-25 blur-3xl" style={{ background: cat?.warna }} />
              <div className="relative grid items-center gap-10 lg:grid-cols-[auto_1fr]">
                <div className="mx-auto">
                  <ProgressRing value={top.score} size={232} stroke={16} delay={0.35} duration={1.8} from={cat?.warna} to="#FFC53D">
                    <span>
                      <span className="block text-6xl font-extrabold tracking-tight [text-shadow:0_0_30px_rgb(255_197_61/0.45)]">
                        <CountUp to={top.score} delay={0.35} duration={1.8} suffix="%" />
                      </span>
                      <span className="mt-1 block text-sm font-bold uppercase tracking-wider text-ink-soft">{matchLabel(top.score)}</span>
                    </span>
                  </ProgressRing>
                </div>
                <div>
                  <p className="eyebrow">
                    <Sparkles size={16} aria-hidden="true" /> {shared ? "Jurusan paling cocok untuk temanmu" : "Jurusan paling cocok untukmu"}
                  </p>
                  <h1 id="hasil-utama" className="display mt-3 text-[clamp(2.3rem,6vw,4.2rem)]">
                    {top.nama_jurusan}
                  </h1>
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-sm font-semibold text-ink-muted">
                    <span className="size-2.5 rounded-full" style={{ background: cat?.warna }} aria-hidden="true" />
                    {cat?.nama}
                  </p>
                  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">{insightFor(top)}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link to={`/jurusan/${MAJOR_BY_ID[top.id].slug}/`} className="btn btn-sun">
                      Pelajari {top.nama_jurusan} <ArrowUpRight size={18} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="relative mt-10 rounded-3xl border border-line bg-surface/60">
                <AccordionItem title="Kenapa jurusan ini cocok untukmu?" defaultOpen headingLevel={2}>
                  <WhyMatch reasons={details[0].reasons} traits={details[0].traits} major={top} profile={result.profile} />
                </AccordionItem>
              </div>
            </m.div>
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6">
              <ShareActions result={result} answers={answers} shared={shared} onRetake={retake} />
            </m.div>
          </section>

          {/* ---------- Profile ---------- */}
          <section aria-labelledby="profil-title" className="container-x mt-20 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal className="card p-6 sm:p-10">
              <p className="eyebrow">Profil minat RIASEC</p>
              <h2 id="profil-title" className="display mt-2 text-3xl">
                Kamu tipe <span className="text-gradient-brand">{t1.nama}–{t2.nama}</span>
              </h2>
              <p className="mt-3 text-ink-muted">
                {t1.deskripsi} {t2.deskripsi}
              </p>
              <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Bandingkan dengan jurusan">
                {result.ranked.slice(0, 3).map((mj, i) => (
                  <button
                    key={mj.id}
                    type="button"
                    aria-pressed={compare === i}
                    onClick={() => setCompare(i)}
                    className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-all ${
                      compare === i ? "border-transparent bg-ink text-bg" : "border-line text-ink-muted hover:text-ink"
                    }`}
                  >
                    #{i + 1} {mj.nama_jurusan}
                  </button>
                ))}
              </div>
              <RadarChart
                key={compare}
                className="mt-8 pb-14"
                caption={`Profil minatmu dibandingkan dengan profil ${comparison.nama_jurusan}`}
                series={[
                  { label: "Profilmu", values: result.profile, color: "#FFB020" },
                  { label: comparison.nama_jurusan, values: comparison.profile, color: COMPARE_COLORS[compare], dashed: true },
                ]}
              />
            </Reveal>

            <Reveal delay={120} className="card p-6 sm:p-10">
              <p className="eyebrow">Rumpun terkuat</p>
              <h2 className="display mt-2 text-3xl">Bidang yang paling memanggilmu</h2>
              <ol className="mt-8 space-y-5">
                {result.categories.map((c, i) => {
                  const meta = CATEGORY_BY_ID[c.id];
                  return (
                    <li key={c.id}>
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span className="flex items-center gap-2 text-ink">
                          <span className="size-2.5 rounded-full" style={{ background: meta.warna }} aria-hidden="true" />
                          {meta.nama}
                        </span>
                        <span className="tabular-nums text-ink-muted">{c.score}%</span>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                        <m.div
                          className="h-full rounded-full"
                          style={{ background: meta.warna }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${c.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.1, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-6 text-sm text-ink-soft">Skor rumpun = rata-rata tiga jurusan teratas di rumpun tersebut.</p>
            </Reveal>
          </section>

          {/* ---------- More matches ---------- */}
          <section aria-labelledby="alternatif-title" className="container-x mt-20">
            <Reveal>
              <p className="eyebrow">Alternatif kuat</p>
              <h2 id="alternatif-title" className="display mt-2 text-3xl sm:text-4xl">
                Bintang lain di dekatmu
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {result.ranked.slice(1, 4).map((mj, i) => (
                <Reveal key={mj.id} delay={i * 110} className="h-full">
                  <MatchCard major={mj} rank={i + 2} reasons={details[i + 1].reasons} traits={details[i + 1].traits} profile={result.profile} delay={0.2} />
                </Reveal>
              ))}
            </div>
          </section>

          {/* ---------- Full ranking ---------- */}
          <section aria-labelledby="semua-title" className="container-x mt-20">
            <Reveal className="card p-6 sm:p-10">
              <p className="eyebrow">Analisis lengkap</p>
              <h2 id="semua-title" className="display mt-2 text-3xl">
                Semua {majors.length} jurusan, diurutkan untukmu
              </h2>
              <div className="mt-8">
                <AllMajorsList ranked={result.ranked} />
              </div>
            </Reveal>
          </section>

          {/* ---------- Guidance ---------- */}
          <section aria-labelledby="catatan-title" className="container-x mt-20">
            <Reveal className="card grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[auto_1fr]">
              <img src={owlShrug} alt="" width="440" height="440" loading="lazy" decoding="async" className="mx-auto w-40" />
              <div>
                <h2 id="catatan-title" className="text-2xl font-bold">
                  Ingat: ini peta, bukan vonis.
                </h2>
                <p className="mt-3 text-ink-muted">
                  Persentase di atas menunjukkan seberapa selaras minat dan karaktermu dengan tiap jurusan menurut model
                  RIASEC. Diskusikan hasilnya dengan guru BK dan orang tua, cek juga nilai rapor, peluang kerja, biaya, dan
                  kampus tujuanmu. Minat bisa tumbuh — ulangi tes beberapa bulan lagi.
                </p>
                <button
                  type="button"
                  onClick={() => openChat({ prompt: "Bagaimana cara memilih antara beberapa jurusan teratasku?", context: resultContext(result) })}
                  className="btn btn-ghost mt-5"
                >
                  <Bot size={18} aria-hidden="true" /> Diskusikan dengan SI-RAJU AI
                </button>
              </div>
            </Reveal>
          </section>

          <p className="sr-only">
            Profil RIASEC: {RIASEC.map((d) => `${d.nama} ${Math.round(result.profile[d.key] * 100)}%`).join(", ")}.
          </p>
        </div>
      )}
    </>
  );
}

export default function Result(props) {
  return (
    <MotionProvider>
      <ResultPage {...props} />
    </MotionProvider>
  );
}

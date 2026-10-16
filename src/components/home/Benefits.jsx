/** Why SI-RAJU — a calm bento grid with one live, animated mini radar. */
import { Bot, Gift, Lock, MessageSquareText, Telescope } from "lucide-react";
import Reveal from "../ui/Reveal.jsx";
import { RIASEC } from "../../lib/riasec.js";

const ITEMS = [
  { Icon: Lock, title: "Privat sejak awal", body: "Semua perhitungan berjalan di perangkatmu. Jawaban tidak pernah dikirim ke server." },
  { Icon: MessageSquareText, title: "Transparan, bukan ramalan", body: "Setiap rekomendasi datang dengan alasan yang diambil dari jawabanmu sendiri." },
  { Icon: Gift, title: "Gratis selamanya", body: "Tanpa daftar akun, tanpa iklan, tanpa batas mengulang tes." },
  { Icon: Bot, title: "Asisten AI 24/7", body: "Masih ragu? Tanyakan prospek kerja, mata kuliah, atau beda jurusan ke SI-RAJU AI." },
];

/** Static demo profile for the illustration (not user data). */
const DEMO = { R: 0.35, I: 0.9, A: 0.62, S: 0.4, E: 0.55, C: 0.7 };

function MiniRadar() {
  const c = 100;
  const r = 70;
  const pt = (i, v) => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return `${c + Math.cos(a) * r * v},${c + Math.sin(a) * r * v}`;
  };
  return (
    <svg viewBox="-24 -6 248 212" className="h-auto w-full max-w-[16rem]" aria-hidden="true">
      {[0.33, 0.66, 1].map((l) => (
        <polygon key={l} points={RIASEC.map((_, i) => pt(i, l)).join(" ")} fill="none" stroke="var(--line)" />
      ))}
      <polygon
        points={RIASEC.map((d, i) => pt(i, DEMO[d.key])).join(" ")}
        className="origin-center animate-[float-y_6s_ease-in-out_infinite]"
        fill="color-mix(in oklab, var(--primary) 22%, transparent)"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {RIASEC.map((d, i) => {
        const [x, y] = pt(i, 1.24).split(",");
        return (
          <text key={d.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="var(--ink-muted)">
            {d.nama}
          </text>
        );
      })}
    </svg>
  );
}

export default function Benefits() {
  return (
    <section aria-labelledby="keunggulan-title" className="bg-bg py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Kenapa SI-RAJU</p>
          <h2 id="keunggulan-title" className="display mt-3 text-[clamp(2rem,4.5vw,3.25rem)]">
            Dibuat serius, terasa santai.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          <Reveal className="card relative overflow-hidden p-8 lg:row-span-2">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Telescope size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-6 text-2xl font-bold">Berbasis teori RIASEC</h3>
            <p className="mt-3 text-ink-muted">
              Model enam tipe minat karier dari psikolog John L. Holland — Praktis, Analitis, Kreatif, Sosial, Pemimpin, dan
              Terstruktur. Profilmu dibandingkan dengan profil setiap jurusan, bukan sekadar dihitung poinnya.
            </p>
            <div className="mt-8 grid place-items-center">
              <MiniRadar />
            </div>
          </Reveal>
          {ITEMS.map(({ Icon, title, body }, i) => (
            <Reveal key={title} delay={(i + 1) * 90} className="card group p-7 transition-shadow duration-500 hover:shadow-lift">
              <span className="grid size-11 place-items-center rounded-2xl bg-sun/20 text-sun-ink transition-transform duration-500 ease-out-back group-hover:scale-110 group-hover:-rotate-6 dark:text-sun">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-ink-muted">{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

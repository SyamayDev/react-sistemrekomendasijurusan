/** "Kenapa jurusan ini cocok?" — the strongest evidence, from the student's own answers. */
import { m } from "motion/react";
import { Fingerprint } from "lucide-react";
import { cosine, RIASEC } from "../../lib/riasec.js";

export default function WhyMatch({ reasons, traits, major, profile }) {
  const shape = Math.round(cosine(profile, major.profile) * 100);
  const majorTop = [...RIASEC].sort((a, b) => major.profile[b.key] - major.profile[a.key]).slice(0, 2);
  return (
    <div className="space-y-5">
      <ol className="space-y-3">
        {reasons.map((r, i) => (
          <m.li
            key={r.qid}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex gap-3"
          >
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-extrabold text-primary">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="leading-snug text-ink">{r.text}</p>
              <div className="mt-2 flex items-center gap-2" aria-hidden="true">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <m.span
                    className="block h-full rounded-full bg-linear-to-r from-primary to-sun"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(r.share * 100)}%` }}
                    transition={{ delay: 0.2 + 0.08 * i, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
                <span className="w-10 text-right text-xs font-semibold tabular-nums text-ink-soft">{Math.round(r.share * 100)}%</span>
              </div>
              <span className="sr-only">Bobot alasan: {Math.round(r.share * 100)} persen</span>
            </div>
          </m.li>
        ))}
      </ol>
      <p className="flex gap-3 rounded-2xl bg-surface-2 p-4 text-sm text-ink-muted">
        <Fingerprint size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
        <span>
          Bentuk profil minatmu <strong className="text-ink">{shape}% selaras</strong> dengan profil jurusan ini, yang
          dominan <strong className="text-ink">{majorTop.map((d) => d.nama).join(" & ")}</strong>.
          {traits.length > 0 && (
            <>
              {" "}
              Karakter yang sama-sama kalian miliki: <strong className="text-ink">{traits.join(", ")}</strong>.
            </>
          )}
        </span>
      </p>
    </div>
  );
}

import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import TiltCard from "../ui/TiltCard.jsx";
import ProgressRing from "../ui/ProgressRing.jsx";
import CountUp from "../ui/CountUp.jsx";
import { AccordionItem } from "../ui/Accordion.jsx";
import WhyMatch from "./WhyMatch.jsx";
import { CATEGORY_BY_ID } from "../../lib/categories.js";
import { MAJOR_BY_ID, matchLabel } from "../../lib/majors.js";

export default function MatchCard({ major, rank, reasons, traits, profile, delay = 0 }) {
  const cat = CATEGORY_BY_ID[major.kategori];
  return (
    <TiltCard max={5} className="card h-full rounded-3xl">
      <article className="flex h-full flex-col p-6">
        <div className="flex items-start gap-4">
          <ProgressRing value={major.score} size={84} stroke={8} delay={delay} from={cat?.warna} to="#FFC53D">
            <span className="text-lg font-extrabold">
              <CountUp to={major.score} delay={delay} suffix="%" />
            </span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              #{rank} · {matchLabel(major.score)}
            </p>
            <h3 className="mt-1 text-xl font-bold leading-tight">{major.nama_jurusan}</h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-muted">
              <span className="size-2 rounded-full" style={{ background: cat?.warna }} aria-hidden="true" />
              {cat?.nama}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-muted">{major.deskripsi}</p>
        <div className="-mx-5 mt-3 border-t border-line pt-1">
          <AccordionItem title="Kenapa jurusan ini cocok?" headingLevel={4}>
            <WhyMatch reasons={reasons} traits={traits} major={major} profile={profile} />
          </AccordionItem>
        </div>
        <Link
          to={`/jurusan/${MAJOR_BY_ID[major.id].slug}/`}
          className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-bold text-primary hover:underline"
        >
          Pelajari {major.nama_jurusan} <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </article>
    </TiltCard>
  );
}

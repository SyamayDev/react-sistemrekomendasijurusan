import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import Logo from "../ui/Logo.jsx";
import { FacebookIcon, GithubIcon, InstagramIcon, YoutubeIcon } from "../ui/BrandIcons.jsx";
import { SITE } from "../../lib/site.js";
import { TOTAL_MAJORS } from "../../lib/categories.js";

const SOCIALS = [
  { href: "https://www.instagram.com/syahrilmaimubdymandai", label: "Instagram", Icon: InstagramIcon },
  { href: "https://www.youtube.com/@channelbelajar25", label: "YouTube", Icon: YoutubeIcon },
  { href: "https://www.facebook.com/pahlawan.senja.146", label: "Facebook", Icon: FacebookIcon },
  { href: "https://github.com/SyamayDev", label: "GitHub", Icon: GithubIcon },
];

const COLUMNS = [
  {
    title: "Jelajahi",
    links: [
      { to: "/tes/", label: "Tes Minat Bakat" },
      { to: "/jurusan/", label: `Katalog ${TOTAL_MAJORS} Jurusan` },
      { to: "/#cara-kerja", label: "Cara Kerja" },
      { to: "/#faq", label: "Pertanyaan Umum" },
    ],
  },
  {
    title: "Referensi",
    links: [
      { href: "https://kemendikdasmen.go.id/", label: "Kemendikdasmen" },
      { href: "https://snpmb.bppp.kemdikbud.go.id", label: "SNPMB" },
      { href: "https://pddikti.kemdiktisaintek.go.id/", label: "PDDikti" },
    ],
  },
  {
    title: "SI-RAJU",
    links: [
      { to: "/tentang/", label: "Tentang Kami" },
      { to: "/privasi/", label: "Kebijakan Privasi" },
      { href: SITE.whatsapp, label: "Hubungi Kami" },
      { href: SITE.github, label: "Kontribusi di GitHub" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="no-print relative border-t border-line bg-surface">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Sistem rekomendasi jurusan kuliah berbasis model minat RIASEC. Membantu siswa SMA/SMK menemukan jurusan yang paling
            sesuai dengan minat, bakat, dan kepribadiannya — gratis, tanpa daftar.
          </p>
          <ul className="mt-6 flex gap-2" aria-label="Media sosial">
            {SOCIALS.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} (tab baru)`}
                  className="grid size-11 place-items-center rounded-full border border-line text-ink-muted transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">{col.title}</h2>
            <ul className="mt-4 grid gap-1">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} className="inline-flex min-h-10 items-center text-sm text-ink-muted transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex min-h-10 items-center gap-1 text-sm text-ink-muted transition-colors hover:text-primary"
                    >
                      {l.label}
                      <ArrowUpRight size={14} aria-hidden="true" className="opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      <span className="sr-only">(tab baru)</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-2 pb-28 pt-6 text-center text-sm text-ink-soft sm:flex-row sm:pb-6 sm:text-left">
          <p>
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> SI-RAJU. Dibuat dengan sepenuh hati untuk siswa Indonesia.
          </p>
          <p>Hasil tes adalah panduan, bukan keputusan mutlak.</p>
        </div>
      </div>
    </footer>
  );
}

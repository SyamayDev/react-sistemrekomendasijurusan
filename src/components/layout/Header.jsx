/**
 * Floating controls instead of a top bar, so the 3D world can use the whole
 * screen: the logo in one small pill on the left, the actions in another on
 * the right (Mulai Tes · tema · layar penuh · Menu). Navigation lives in a
 * full-screen menu — pages, the story's chapters and display settings, each
 * with an icon so it reads at a glance.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import {
  ArrowRight,
  BadgeCheck,
  CircleHelp,
  ClipboardCheck,
  DoorOpen,
  GraduationCap,
  Hexagon,
  House,
  Info,
  Maximize2,
  Menu,
  Moon,
  Orbit,
  ShieldCheck,
  Sparkles,
  Sun,
  Workflow,
  X,
} from "lucide-react";
import Logo from "../ui/Logo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import FullscreenButton from "./FullscreenButton.jsx";
import { toggleTheme, useTheme } from "../../lib/theme.js";
import { toggleFullscreen, useFullscreen } from "../../lib/fullscreen.js";

const PAGES = [
  { to: "/", label: "Beranda", Icon: House, end: true },
  { to: "/tes/", label: "Tes Minat Bakat", Icon: ClipboardCheck },
  { to: "/jurusan/", label: "Jelajahi Jurusan", Icon: GraduationCap },
  { to: "/tentang/", label: "Tentang SI-RAJU", Icon: Info },
  { to: "/privasi/", label: "Privasi", Icon: ShieldCheck },
];
const CHAPTERS = [
  { id: "mulai", label: "Mulai", Icon: Sparkles },
  { id: "pertanyaan", label: "Pertanyaan", Icon: CircleHelp },
  { id: "kenali-dirimu", label: "Kenali dirimu", Icon: Hexagon },
  { id: "cara-kerja", label: "Cara kerja", Icon: Workflow },
  { id: "semesta", label: "Semesta jurusan", Icon: Orbit },
  { id: "kenapa", label: "Kenapa SI-RAJU", Icon: BadgeCheck },
  { id: "gerbang", label: "Gerbang", Icon: DoorOpen },
];

/** A settings row: icon, label and an on/off switch (a real toggle button with aria-pressed). */
function SwitchRow({ Icon, label, on, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-2 text-left text-sm font-semibold hover:bg-surface-2/70"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface/60 text-ink" aria-hidden="true">
        <Icon size={18} />
      </span>
      <span className="flex-1">{label}</span>
      <span aria-hidden="true" className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${on ? "bg-sun" : "bg-line"}`}>
        <span
          className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ease-out-expo ${on ? "translate-x-5" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}

function MenuOverlay({ open, onClose }) {
  const panel = useRef(null);
  const theme = useTheme();
  const fs = useFullscreen();
  const dark = theme === "dark";

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panel.current?.querySelector("a")?.focus();
    // Everything outside the header is out of reach while the menu is open.
    const others = [...document.querySelectorAll("#root > *")].filter((el) => !el.contains(panel.current) && !el.inert);
    others.forEach((el) => (el.inert = true));
    document.documentElement.classList.add("menu-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      others.forEach((el) => (el.inert = false));
      document.documentElement.classList.remove("menu-open");
    };
  }, [open, onClose]);

  return (
    <div
      id="menu-utama"
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      className={`menu-overlay fixed inset-0 -z-10 overflow-y-auto ${open ? "is-open pointer-events-auto" : ""}`}
    >
      <div className="container-x grid min-h-full content-center gap-x-16 gap-y-8 pb-10 pt-[calc(var(--header-h)+1.25rem)] lg:grid-cols-[1.2fr_1fr] lg:gap-y-10">
        <div>
          <nav aria-label="Navigasi utama">
            <p className="hud-label menu-item text-ink-soft" style={{ "--i": 0 }}>
              Halaman
            </p>
            <ul className="mt-3 grid gap-1">
              {PAGES.map(({ to, label, Icon, end }, i) => (
                <li key={to} className="menu-item" style={{ "--i": i + 1 }}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-4 rounded-2xl py-1.5 font-display text-[clamp(1.55rem,5vw,3.2rem)] font-bold leading-[1.1] tracking-tight transition-colors ${
                        isActive ? "text-sun-ink dark:text-sun" : "text-ink hover:text-sun-ink dark:hover:text-sun"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          aria-hidden="true"
                          className={`grid size-10 shrink-0 place-items-center rounded-2xl border transition-colors sm:size-12 ${
                            isActive ? "border-transparent bg-sun text-on-sun" : "border-line bg-surface/60 text-ink group-hover:border-sun/60"
                          }`}
                        >
                          <Icon className="size-5 sm:size-6" />
                        </span>
                        <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">{label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="menu-item mt-7" style={{ "--i": 6 }}>
            <Link to="/tes/" onClick={onClose} className="btn btn-sun btn-lg w-full sm:w-auto">
              Mulai Tes Gratis <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="grid content-start gap-8">
          <section aria-labelledby="menu-bab" className="menu-item" style={{ "--i": 4 }}>
            <p id="menu-bab" className="hud-label text-ink-soft">
              Bab cerita
            </p>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-sm">
              {CHAPTERS.map(({ id, label, Icon }) => (
                <li key={id}>
                  <Link
                    to={`/#${id}`}
                    onClick={onClose}
                    className="flex min-h-11 items-center gap-2.5 rounded-xl px-1.5 font-semibold text-ink-muted transition-colors hover:bg-surface-2/60 hover:text-ink"
                  >
                    <Icon size={17} aria-hidden="true" className="shrink-0 text-sun-ink dark:text-sun" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="menu-tampilan" className="menu-item" style={{ "--i": 5 }}>
            <p id="menu-tampilan" className="hud-label text-ink-soft">
              Tampilan
            </p>
            <div className="mt-2 grid gap-1">
              <SwitchRow Icon={dark ? Moon : Sun} label="Tema gelap" on={dark} onClick={toggleTheme} />
              {fs.available && <SwitchRow Icon={Maximize2} label="Layar penuh" on={fs.active} onClick={toggleFullscreen} />}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const { pathname, hash } = useLocation();
  const [open, setOpen] = useState(false);
  const button = useRef(null);
  const close = useCallback(() => {
    setOpen(false);
    button.current?.focus({ preventScroll: true });
  }, []);

  // Navigating (from inside or outside the menu) closes it.
  const [at, setAt] = useState(pathname + hash);
  if (at !== pathname + hash) {
    setAt(pathname + hash);
    setOpen(false);
  }

  return (
    <header className={`no-print pointer-events-none fixed inset-x-0 top-0 ${open ? "z-70" : "z-50"}`}>
      {/* Content scrolling up fades out under the pills (off over the home story's 3D world). */}
      <div className="top-veil" aria-hidden="true" />
      <div className="container-x flex h-(--header-h) items-center justify-between gap-3">
        <div className="pill pointer-events-auto rounded-full py-1 pl-1.5 pr-4">
          <Logo onClick={() => setOpen(false)} />
        </div>
        <div className="pill pointer-events-auto flex items-center gap-0.5 rounded-full p-1">
          <Link to="/tes/" className="btn btn-sun mr-1 hidden min-h-10! px-4! text-sm sm:inline-flex">
            Mulai Tes <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <FullscreenButton />
          <button
            ref={button}
            type="button"
            className="btn btn-ghost btn-icon gap-2 lg:w-auto lg:px-4"
            aria-expanded={open}
            aria-controls="menu-utama"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => (open ? close() : setOpen(true))}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            <span className="hidden text-sm font-semibold lg:inline" aria-hidden="true">
              {open ? "Tutup" : "Menu"}
            </span>
          </button>
        </div>
      </div>
      <MenuOverlay open={open} onClose={close} />
    </header>
  );
}

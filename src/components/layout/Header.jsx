/**
 * Floating controls instead of a top bar, so the 3D world can use the whole
 * screen: the logo in one small pill on the left, the actions in another on
 * the right (Mulai Tes · 3D · tema · layar penuh · Menu). Navigation lives in
 * a full-screen menu with the site's pages, the story's chapters and the
 * display settings.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "../ui/Logo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import FullscreenButton from "./FullscreenButton.jsx";
import Toggle3D from "./Toggle3D.jsx";
import { toggleTheme, useTheme } from "../../lib/theme.js";
import { toggleFullscreen, useFullscreen } from "../../lib/fullscreen.js";
import { use3DSwitch } from "../../lib/use3DSwitch.js";

const PAGES = [
  { to: "/", label: "Beranda", end: true },
  { to: "/tes/", label: "Tes Minat Bakat" },
  { to: "/jurusan/", label: "Jelajahi Jurusan" },
  { to: "/tentang/", label: "Tentang SI-RAJU" },
  { to: "/privasi/", label: "Privasi" },
];
const CHAPTERS = [
  ["mulai", "Mulai"],
  ["pertanyaan", "Pertanyaan"],
  ["kenali-dirimu", "Kenali dirimu"],
  ["cara-kerja", "Cara kerja"],
  ["semesta", "Semesta jurusan"],
  ["kenapa", "Kenapa SI-RAJU"],
  ["gerbang", "Gerbang"],
];

/** A labelled switch row for the menu's "Tampilan" settings (works on every screen size). */
function SettingRow({ label, value, onClick, pressed }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className="flex min-h-11 w-full items-center justify-between gap-4 rounded-xl px-3 text-left text-sm font-semibold hover:bg-surface-2/70"
    >
      {label}
      <span className="hud-label text-ink-soft">{value}</span>
    </button>
  );
}

function MenuOverlay({ open, onClose }) {
  const panel = useRef(null);
  const theme = useTheme();
  const fs = useFullscreen();
  const d3 = use3DSwitch();

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
      <div className="container-x grid min-h-full content-center gap-x-16 gap-y-10 pb-12 pt-[calc(var(--header-h)+2rem)] lg:grid-cols-[1.25fr_1fr]">
        <nav aria-label="Navigasi utama">
          <p className="hud-label menu-item text-ink-soft" style={{ "--i": 0 }}>
            Halaman
          </p>
          <ol className="mt-4 grid gap-1">
            {PAGES.map((p, i) => (
              <li key={p.to} className="menu-item" style={{ "--i": i + 1 }}>
                <NavLink
                  to={p.to}
                  end={p.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-baseline gap-4 rounded-xl py-1 font-display text-[clamp(2rem,5.5vw,3.6rem)] font-bold leading-[1.05] tracking-tight transition-colors ${
                      isActive ? "text-sun-ink dark:text-sun" : "text-ink hover:text-sun-ink dark:hover:text-sun"
                    }`
                  }
                >
                  <span className="hud-label w-8 shrink-0 text-ink-soft">{String(i + 1).padStart(2, "0")}</span>
                  <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-2">{p.label}</span>
                </NavLink>
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid content-start gap-9">
          <section aria-labelledby="menu-bab" className="menu-item" style={{ "--i": 4 }}>
            <p id="menu-bab" className="hud-label text-ink-soft">
              Bab cerita
            </p>
            <ol className="mt-3 grid grid-cols-2 gap-x-6 gap-y-0.5 text-sm">
              {CHAPTERS.map(([id, name], i) => (
                <li key={id}>
                  <Link to={`/#${id}`} onClick={onClose} className="flex min-h-10 items-center gap-2.5 font-semibold text-ink-muted hover:text-ink">
                    <span className="hud-label text-sun-ink dark:text-sun">{String(i).padStart(2, "0")}</span>
                    {name}
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="menu-tampilan" className="menu-item" style={{ "--i": 5 }}>
            <p id="menu-tampilan" className="hud-label text-ink-soft">
              Tampilan
            </p>
            <div className="mt-2 grid gap-0.5">
              <SettingRow label="Tema" value={theme === "dark" ? "Gelap" : "Terang"} pressed={theme === "dark"} onClick={toggleTheme} />
              {d3.available && <SettingRow label="Dunia 3D" value={d3.on ? "Nyala" : "Mati"} pressed={d3.on} onClick={d3.toggle} />}
              {fs.available && <SettingRow label="Layar penuh" value={fs.active ? "Nyala" : "Mati"} pressed={fs.active} onClick={toggleFullscreen} />}
            </div>
          </section>

          <div className="menu-item" style={{ "--i": 6 }}>
            <Link to="/tes/" onClick={onClose} className="btn btn-sun btn-lg w-full sm:w-auto">
              Mulai Tes Gratis <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
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
          <Toggle3D className="max-md:hidden" />
          <ThemeToggle className="max-md:hidden" />
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

/**
 * Floating header. Over the night hero it borrows dark tokens (data-theme)
 * so text stays legible in both themes; once scrolled it becomes frosted glass.
 */
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "../ui/Logo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const NAV = [
  { to: "/#cara-kerja", label: "Cara Kerja", hash: true },
  { to: "/jurusan/", label: "Jelajahi Jurusan" },
  { to: "/tentang/", label: "Tentang" },
];

export default function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [overHero, setOverHero] = useState(isHome);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      const hero = isHome ? document.getElementById("hero") : null;
      setOverHero(hero ? y < hero.offsetHeight - 72 : false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector("a")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);
  const solid = scrolled || open;

  return (
    <header
      data-theme={overHero && !open ? "dark" : undefined}
      className={`no-print fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-500 ${
        solid
          ? overHero && !open
            ? "border-b border-white/5 bg-night-900/45 backdrop-blur-xl"
            : "glass shadow-soft"
          : "border-b border-transparent"
      }`}
    >
      <div className="container-x flex h-[var(--header-h)] items-center gap-4">
        <Logo onClick={close} />
        <nav aria-label="Navigasi utama" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive && !item.hash ? "bg-primary-soft text-primary" : "text-ink-muted hover:text-ink"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <ThemeToggle />
          <Link to="/tes/" className="btn btn-sun hidden !min-h-[2.75rem] !px-5 text-sm sm:inline-flex">
            Mulai Tes <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-icon md:hidden"
            aria-expanded={open}
            aria-controls="menu-seluler"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <nav
        id="menu-seluler"
        ref={panelRef}
        aria-label="Navigasi seluler"
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out-expo md:hidden ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="container-x pb-6">
            <ul className="grid gap-1 border-t border-line pt-3">
              {[{ to: "/", label: "Beranda" }, ...NAV].map((item, i) => (
                <li
                  key={item.to}
                  className={`transition-all duration-500 ease-out-expo ${open ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"}`}
                  style={{ transitionDelay: open ? `${60 * i}ms` : "0ms" }}
                >
                  <Link
                    to={item.to}
                    onClick={close}
                    className="flex min-h-12 items-center rounded-xl px-3 text-base font-semibold text-ink hover:bg-surface-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/tes/" onClick={close} className="btn btn-sun btn-lg mt-4 w-full">
              Mulai Tes Gratis <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

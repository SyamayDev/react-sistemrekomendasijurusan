import { Moon, Sun } from "lucide-react";
import { toggleTheme, useTheme } from "../../lib/theme.js";

export default function ThemeToggle({ className = "" }) {
  const theme = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn btn-ghost btn-icon relative overflow-hidden ${className}`}
      aria-label={dark ? "Gunakan tema terang" : "Gunakan tema gelap"}
      title={dark ? "Tema terang" : "Tema gelap"}
    >
      <Sun
        size={18}
        aria-hidden="true"
        className={`absolute transition-all duration-500 ease-out-back ${dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`}
      />
      <Moon
        size={18}
        aria-hidden="true"
        className={`absolute transition-all duration-500 ease-out-back ${dark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
      />
    </button>
  );
}

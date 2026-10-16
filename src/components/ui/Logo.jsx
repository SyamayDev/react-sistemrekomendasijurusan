import { Link } from "react-router";
import OwlMascot from "./OwlMascot.jsx";

export default function Logo({ className = "", onClick }) {
  return (
    <Link to="/" onClick={onClick} className={`group inline-flex items-center gap-2.5 rounded-xl ${className}`} aria-label="SI-RAJU — beranda">
      <OwlMascot interactive={false} className="h-9 w-auto transition-transform duration-500 ease-out-back group-hover:-rotate-6 group-hover:scale-110" />
      <span className="text-[1.15rem] font-extrabold tracking-tight text-ink">
        SI<span className="text-sun-ink dark:text-sun">-</span>RAJU
      </span>
    </Link>
  );
}

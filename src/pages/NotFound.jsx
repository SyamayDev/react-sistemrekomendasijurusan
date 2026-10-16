import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import OwlMascot from "../components/ui/OwlMascot.jsx";
import { useSeo } from "../lib/seo.jsx";

export default function NotFound() {
  useSeo({ title: "Halaman Tidak Ditemukan", path: "/404/", description: "Halaman yang kamu cari tidak ditemukan.", noindex: true });
  return (
    <div className="container-x grid min-h-[85svh] place-items-center pt-(--header-h) text-center">
      <div className="max-w-md">
        <OwlMascot mood="thinking" className="fade-up mx-auto h-40 w-auto" />
        <p className="fade-up mt-6 text-sm font-bold uppercase tracking-[0.2em] text-primary" style={{ "--i": 1 }}>
          404
        </p>
        <h1 className="display fade-up mt-2 text-4xl" style={{ "--i": 2 }}>
          Raju juga bingung…
        </h1>
        <p className="fade-up mt-3 text-ink-muted" style={{ "--i": 3 }}>
          Halaman yang kamu cari tidak ada atau sudah dipindahkan. Yuk kembali ke jalur yang benar.
        </p>
        <div className="fade-up mt-8 flex flex-wrap justify-center gap-3" style={{ "--i": 4 }}>
          <Link to="/" className="btn btn-primary">
            Ke beranda
          </Link>
          <Link to="/tes/" className="btn btn-ghost">
            Ikuti tes <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

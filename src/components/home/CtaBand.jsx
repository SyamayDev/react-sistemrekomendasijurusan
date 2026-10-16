import { ArrowRight } from "lucide-react";
import Reveal from "../ui/Reveal.jsx";
import MagneticButton from "../ui/MagneticButton.jsx";
import owlShrug from "../../assets/owl-shrug-sm.webp";

export default function CtaBand() {
  return (
    <section aria-labelledby="cta-title" className="bg-bg py-24 sm:py-28">
      <div className="container-x">
        <Reveal
          data-theme="dark"
          className="relative isolate overflow-hidden rounded-[2.5rem] bg-night-800 px-6 py-14 text-ink sm:px-14 sm:py-16"
        >
          <div aria-hidden="true" className="backdrop-night absolute inset-0 -z-10 opacity-90" />
          <div aria-hidden="true" className="stars-layer absolute inset-0 -z-10 opacity-50" />
          <div className="grid items-center gap-10 md:grid-cols-[1.3fr_0.7fr]">
            <div>
              <h2 id="cta-title" className="display text-[clamp(2rem,4.5vw,3.25rem)] text-white">
                Masih ragu? <span className="text-gradient-sun">Wajar banget.</span>
              </h2>
              <p className="mt-4 max-w-xl text-lg text-ink-muted">
                Hasil SI-RAJU bukan vonis — ini peta awal untuk didiskusikan bersama guru BK, orang tua, atau kakak tingkat.
                Empat menit sekarang bisa menghemat empat tahun nanti.
              </p>
              <div className="mt-8">
                <MagneticButton to="/tes/">
                  Mulai tes gratis <ArrowRight size={20} aria-hidden="true" />
                </MagneticButton>
              </div>
            </div>
            <img
              src={owlShrug}
              alt="Raju si burung hantu mengangkat bahu, ragu memilih jurusan"
              width="440"
              height="440"
              loading="lazy"
              decoding="async"
              className="mx-auto w-48 -rotate-3 drop-shadow-[0_24px_30px_rgb(0_0_0/0.4)] md:w-64"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

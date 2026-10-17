import Reveal from "../ui/Reveal.jsx";
import { AccordionItem } from "../ui/Accordion.jsx";
import { FAQ } from "../../data/faq.js";
import owlAsk from "../../assets/owl-ask-sm.webp";

export default function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="faq-section pb-24 pt-32 sm:pb-32 sm:pt-44">
      <div className="container-x grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="lg:sticky lg:top-28">
          <p className="eyebrow">Pertanyaan umum</p>
          <h2 id="faq-title" className="display mt-3 text-[clamp(2rem,4.5vw,3.25rem)]">
            Ada yang bikin penasaran?
          </h2>
          <p className="mt-4 max-w-md text-ink-muted">
            Kalau jawabannya belum ada di sini, tanyakan langsung ke SI-RAJU AI lewat tombol chat di pojok kanan bawah.
          </p>
          <img
            src={owlAsk}
            alt="Raju si burung hantu mengangkat sayap sambil bertanya"
            width="440"
            height="440"
            loading="lazy"
            decoding="async"
            className="float-y mt-8 hidden w-56 lg:block"
          />
        </Reveal>
        <Reveal className="card divide-y divide-line p-2">
          {FAQ.map((f, i) => (
            <AccordionItem key={f.q} title={f.q} defaultOpen={i === 0}>
              <p className="leading-relaxed">{f.a}</p>
            </AccordionItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

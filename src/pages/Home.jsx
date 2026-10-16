import Hero3D from "../components/home/Hero3D.jsx";
import AnimatedHowItWorks from "../components/home/AnimatedHowItWorks.jsx";
import CategoryExplorer from "../components/home/CategoryExplorer.jsx";
import Benefits from "../components/home/Benefits.jsx";
import FaqSection from "../components/home/FaqSection.jsx";
import CtaBand from "../components/home/CtaBand.jsx";
import { useSeo, ldOrganization, ldWebSite } from "../lib/seo.jsx";
import { useSceneMode } from "../lib/useScene.js";
import { FAQ } from "../data/faq.js";

export default function Home() {
  useSceneMode("hero");
  useSeo({
    path: "/",
    description:
      "Tes minat bakat online gratis untuk siswa SMA/SMK. Temukan jurusan kuliah yang paling cocok dari 150 jurusan berdasarkan model RIASEC — lengkap dengan persentase kecocokan dan alasannya.",
    jsonLd: [
      ldWebSite(),
      ldOrganization(),
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  });

  return (
    <>
      <Hero3D />
      <AnimatedHowItWorks />
      <CategoryExplorer />
      <Benefits />
      <FaqSection />
      <CtaBand />
    </>
  );
}

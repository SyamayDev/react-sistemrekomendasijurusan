/**
 * Home — "Semesta RAJU": a seven-chapter scroll story over a persistent 3D
 * world (see components/three). The scroll controller writes the story
 * progress straight into the scene store and CSS variables, so scrolling
 * never re-renders React.
 */
import { useEffect, useRef } from "react";
import ChapterHero from "../components/story/ChapterHero.jsx";
import ChapterQuestion from "../components/story/ChapterQuestion.jsx";
import ChapterRiasec from "../components/story/ChapterRiasec.jsx";
import ChapterHow from "../components/story/ChapterHow.jsx";
import ChapterUniverse from "../components/story/ChapterUniverse.jsx";
import ChapterWhy from "../components/story/ChapterWhy.jsx";
import ChapterPortal from "../components/story/ChapterPortal.jsx";
import StoryRail from "../components/story/StoryRail.jsx";
import FaqSection from "../components/home/FaqSection.jsx";
import { startStory } from "../lib/scrollStory.js";
import { useSeo, ldOrganization, ldWebSite } from "../lib/seo.jsx";
import { FAQ } from "../data/faq.js";

export default function Home() {
  const story = useRef(null);
  useEffect(() => startStory(story.current), []);

  useSeo({
    path: "/",
    description:
      "Kenali minatmu lewat tes 20 pertanyaan dan temukan rekomendasi dari 150 jurusan kuliah berbasis model RIASEC — gratis, tanpa akun, lengkap dengan alasannya. Dipandu RAJU si burung hantu.",
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
      <div ref={story} className="story">
        <ChapterHero />
        <ChapterQuestion />
        <ChapterRiasec />
        <ChapterHow />
        <ChapterUniverse />
        <ChapterWhy />
        <ChapterPortal />
      </div>
      <StoryRail />
      <FaqSection />
    </>
  );
}

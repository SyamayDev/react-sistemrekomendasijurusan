/**
 * Desktop chapter rail: shows where you are in the story and jumps to any
 * chapter. Real #anchor links, so they work before hydration too; once the
 * app is running they scroll smoothly instead.
 */
import { scrollToChapter } from "../../lib/scrollStory.js";

const CHAPTERS = [
  ["mulai", "Mulai"],
  ["pertanyaan", "Pertanyaan"],
  ["kenali-dirimu", "Kenali dirimu"],
  ["cara-kerja", "Cara kerja"],
  ["semesta", "Semesta"],
  ["kenapa", "Kenapa SI-RAJU"],
  ["gerbang", "Gerbang"],
];

export default function StoryRail() {
  return (
    <nav className="story-rail" aria-label="Bab cerita">
      {CHAPTERS.map(([id, name], i) => (
        <a
          key={id}
          href={`#${id}`}
          data-c={i}
          onClick={(e) => {
            e.preventDefault();
            scrollToChapter(i);
          }}
        >
          <span className="name">
            {String(i).padStart(2, "0")} {name}
          </span>
          <span className="tick" aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}

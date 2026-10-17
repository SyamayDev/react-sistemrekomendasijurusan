/** Desktop chapter rail: shows where you are in the story and jumps to any chapter. */
import { scrollToChapter } from "../../lib/scrollStory.js";

const CHAPTERS = ["Mulai", "Pertanyaan", "Kenali dirimu", "Cara kerja", "Semesta", "Kenapa SI-RAJU", "Gerbang"];

export default function StoryRail() {
  return (
    <nav className="story-rail" aria-label="Bab cerita">
      {CHAPTERS.map((name, i) => (
        <button key={name} type="button" data-c={i} onClick={() => scrollToChapter(i)}>
          <span className="name">
            {String(i).padStart(2, "0")} {name}
          </span>
          <span className="tick" aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}

/**
 * Scroll → story controller for the home page.
 *
 * Each chapter is a tall <section data-chapter> with a sticky stage inside.
 * For chapter i:
 *   entering (its top travels from the viewport bottom to the top) → story i … i+0.25
 *   pinned   (the stage is stuck while the section scrolls)        → story i+0.25 … i+1
 * The controller measures on resize only, does one rAF per scroll, writes the
 * value straight into the scene store (no React renders), and exposes CSS
 * custom properties for DOM choreography:
 *   --enter  0..1 entering progress     --p  0..1 pinned progress
 *   data-step="n" on chapters with data-steps (sticky step-by-step stories)
 *   html[data-story] = index of the chapter in view (for the HUD rail).
 * On the stacked (phone/tablet) layout it also measures where each chapter's
 * text panel starts, so the world can frame its subject in the band above.
 */
import { scene, setScene } from "./sceneStore.js";
import { SETTLE } from "../components/three/world/keys.js";

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
// Layout offset (ignores transforms) of `el` inside a positioned ancestor.
const topWithin = (el, ancestor) => {
  let y = 0;
  for (let n = el; n && n !== ancestor; n = n.offsetParent) y += n.offsetTop;
  return y;
};

export function startStory(root) {
  const sections = [...root.querySelectorAll("[data-chapter]")];
  const stages = sections.map((el) => el.querySelector(".stage"));
  const panels = sections.map((el) => el.querySelector("[data-panel]"));
  let metrics = [];
  let raf = 0;
  let vh = window.innerHeight;
  let lastChapter = -1;

  const measure = () => {
    vh = window.innerHeight;
    metrics = sections.map((el) => {
      const r = el.getBoundingClientRect();
      return { el, top: r.top + window.scrollY, height: el.offsetHeight, steps: Number(el.dataset.steps || 0), lastStep: -1 };
    });
    scene.bandTop = (document.querySelector("header")?.offsetHeight ?? 68) / vh;
    scene.bandBottom = panels.map((p, i) => (p && stages[i] ? topWithin(p, stages[i]) / vh : 1));
  };

  const update = () => {
    raf = 0;
    const y = window.scrollY;
    let story = 0;
    let current = 0;
    metrics.forEach((m, i) => {
      const enter = clamp01((y - (m.top - vh)) / vh);
      const pinSpan = Math.max(1, m.height - vh);
      const p = clamp01((y - m.top) / pinSpan);
      m.el.style.setProperty("--enter", enter.toFixed(4));
      m.el.style.setProperty("--p", p.toFixed(4));
      if (m.steps) {
        const step = Math.min(m.steps - 1, Math.floor(p * m.steps * 0.999));
        if (step !== m.lastStep) {
          m.lastStep = step;
          m.el.dataset.step = String(step);
          scene.steps[i] = step;
        }
      }
      if (y >= m.top - vh) {
        current = i;
        story = i + (enter < 1 ? enter * SETTLE : SETTLE + p * (1 - SETTLE));
      }
    });
    // The very first chapter is already on screen at load.
    if (y < (metrics[0]?.top ?? 0)) story = SETTLE;
    scene.story = story;
    if (current !== lastChapter) {
      lastChapter = current;
      document.documentElement.dataset.story = String(current);
    }
  };

  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  const onResize = () => {
    measure();
    update();
  };

  measure();
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  const ro = new ResizeObserver(onResize);
  ro.observe(root);
  panels.forEach((p) => p && ro.observe(p)); // e.g. the Semesta panel grows when a field is chosen

  // Pause the world when the story is fully scrolled away (FAQ/footer).
  const io = new IntersectionObserver(([e]) => setScene({ inView: e.isIntersecting }), { rootMargin: "0px 0px -15% 0px" });
  io.observe(root);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    ro.disconnect();
    io.disconnect();
    delete document.documentElement.dataset.story;
    scene.story = 0;
    scene.steps = {};
    scene.bandBottom = [];
  };
}

/** Scroll so that chapter `i` is settled (its stage just pinned). */
export function scrollToChapter(i) {
  const el = document.querySelector(`section[data-chapter="${i}"]`);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: i === 0 ? 0 : top, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

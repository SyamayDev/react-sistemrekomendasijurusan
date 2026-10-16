/**
 * Scroll-triggered reveal using one shared IntersectionObserver for the whole
 * app. The hidden state lives in CSS behind `.js`, so without JavaScript the
 * content is simply visible. Never wrap above-the-fold (LCP) content in this.
 */
import { useEffect, useRef } from "react";

let observer;
function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            observer.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
  }
  return observer;
}

export default function Reveal({ as: Tag = "div", delay = 0, className = "", style, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ "--d": delay, ...style }} {...rest}>
      {children}
    </Tag>
  );
}

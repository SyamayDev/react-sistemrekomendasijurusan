/**
 * Scoped animation runtime. Only the lazily-loaded routes that animate wrap
 * themselves in this, so the landing page never downloads motion at all;
 * the heavier feature bundle (layout/gestures) streams in on demand.
 */
import { LazyMotion, MotionConfig } from "motion/react";

const loadFeatures = () => import("../lib/motionFeatures.js").then((r) => r.default);

export default function MotionProvider({ children }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

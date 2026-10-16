/**
 * Lightweight React Three Fiber host. Key performance choices:
 *  • lazy-loaded after first interaction (see Backdrop.jsx)
 *  • frameloop pauses whenever the sky isn't visible (e.g. scrolled past hero)
 *  • no antialias / depth / stencil buffers — points & additive blending don't need them
 *  • DPR capped per device tier and lowered automatically if FPS drops
 */
import { Component, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import Universe from "./Universe.jsx";
import { isSceneActive, subscribeScene } from "../../lib/sceneStore.js";
import { deviceTier } from "../../lib/device.js";

/** If WebGL fails for any reason, quietly keep the CSS sky. */
class SilentBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Background3D() {
  const active = useSyncExternalStore(subscribeScene, isSceneActive, () => false);
  const [tier] = useState(deviceTier);
  const maxDpr = tier === "high" ? 1.75 : 1.35;
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, maxDpr));
  const [ready, setReady] = useState(false);

  return (
    <SilentBoundary>
      <div className={`absolute inset-0 transition-opacity duration-[1800ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}>
        <Canvas
          dpr={dpr}
          frameloop={active ? "always" : "never"}
          camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 80 }}
          gl={{ antialias: false, alpha: true, depth: false, stencil: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            requestAnimationFrame(() => setReady(true));
          }}
          aria-hidden="true"
          tabIndex={-1}
        >
          <PerformanceMonitor
            onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
            onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
          />
          <Universe tier={tier} />
        </Canvas>
      </div>
    </SilentBoundary>
  );
}

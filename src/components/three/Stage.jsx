/**
 * React Three Fiber host for "Semesta RAJU". Lazy-loaded (see Backdrop.jsx).
 *  • frameloop pauses whenever the world is off-screen or the route has no sky
 *  • DPR capped per device tier and lowered automatically if FPS drops
 *  • procedural studio lighting (softbox scene → PMREM), no external HDRs
 *  • if WebGL fails for any reason the CSS sky + posters stay (SilentBoundary)
 */
import { Component, useEffect, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { buildWorld } from "./world/buildWorld.js";
import { bakeEnvironment, compileQuietly } from "./world/environment.js";
import { isSceneActive, setScene, subscribeScene } from "../../lib/sceneStore.js";
import { deviceTier } from "../../lib/device.js";

class SilentBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    setScene({ ready: false });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function World({ tier }) {
  const { gl, scene, camera } = useThree();
  const [world, setWorld] = useState(null);

  // Set-up is spread over several tasks (build → environment → shaders) and
  // shaders compile in parallel (KHR_parallel_shader_compile), so loading the
  // world never freezes scrolling or input. Until it is ready the CSS sky and
  // posters stay visible; if anything fails they simply remain.
  useEffect(() => {
    let alive = true;
    let built = null;
    let env = null;
    const nextTask = () => new Promise((r) => setTimeout(r, 0));
    (async () => {
      await nextTask();
      if (!alive) return;
      built = buildWorld({ tier });
      await nextTask();
      if (!alive) return;
      const baked = await bakeEnvironment(gl);
      if (!alive) return baked.dispose();
      env = baked;
      scene.environment = env.texture;
      scene.environmentIntensity = 0.5;
      await nextTask();
      if (!alive) return;
      await compileQuietly(gl, built.root, camera, scene);
      if (!alive) return;
      scene.add(built.root);
      setWorld(built);
    })().catch(() => {});
    return () => {
      alive = false;
      if (built) {
        scene.remove(built.root);
        built.dispose();
      }
      scene.environment = null;
      env?.dispose();
    };
  }, [gl, scene, camera, tier]);

  useFrame((state, dt) => world?.update(state, dt, state.size));
  return world ? <ReadySignal /> : null;
}

/** Marks the world ready after it has actually drawn a frame. */
function ReadySignal() {
  const [done, setDone] = useState(false);
  useFrame(() => {
    if (!done) {
      setDone(true);
      requestAnimationFrame(() => setScene({ ready: true }));
    }
  });
  return null;
}

export default function Stage() {
  const active = useSyncExternalStore(subscribeScene, isSceneActive, () => false);
  const [tier] = useState(deviceTier);
  const maxDpr = tier === "high" ? 1.75 : 1.4;
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, maxDpr));

  useEffect(() => () => setScene({ ready: false }), []);

  return (
    <SilentBoundary>
      <Canvas
        dpr={dpr}
        frameloop={active ? "always" : "never"}
        camera={{ position: [0.9, 1.9, 9.6], fov: 30, near: 0.1, far: 200 }}
        gl={{ antialias: tier === "high", alpha: false, stencil: false, powerPreference: "high-performance" }}
        aria-hidden="true"
        tabIndex={-1}
      >
        <fogExp2 attach="fog" args={["#0a1033", 0.018]} />
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
        />
        <World tier={tier} />
      </Canvas>
    </SilentBoundary>
  );
}

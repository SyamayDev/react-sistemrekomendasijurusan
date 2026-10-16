import { useEffect } from "react";
import { setScene } from "./sceneStore.js";

const RESET = { mode: "off", highlight: -1, energy: 0, focus: [0, 0, 0, 0, 0, 0, 0, 0], heroScroll: 0 };

/** Puts the background universe into a mode while the calling page is mounted. */
export function useSceneMode(mode) {
  useEffect(() => {
    setScene({ ...RESET, mode });
    return () => setScene(RESET);
  }, [mode]);
}

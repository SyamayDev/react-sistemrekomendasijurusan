/**
 * HUD anchors: DOM labels pinned to 3D objects (orbs, planets, tiles).
 * Components register their label elements by key; the world projects the
 * matching 3D position every frame and writes transform/opacity directly.
 */
export const hudAnchors = new Map();

export function registerHud(key, el) {
  if (el) hudAnchors.set(key, el);
  else hudAnchors.delete(key);
}

/** Ref-callback factory: <div ref={hudRef("orb-R")} /> */
export const hudRef = (key) => (el) => registerHud(key, el);

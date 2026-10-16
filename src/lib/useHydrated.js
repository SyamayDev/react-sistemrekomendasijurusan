import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** false on the server and during hydration, true afterwards. */
export const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

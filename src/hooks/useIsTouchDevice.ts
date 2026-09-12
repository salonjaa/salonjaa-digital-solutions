"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(pointer: coarse)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return null;
}

/**
 * Resolves to `true` on coarse-pointer (touch) devices, `false` otherwise.
 * Renders as `null` until resolved on the client (first paint matches the
 * server), so callers can avoid a hydration flash by rendering nothing
 * until this settles.
 */
export function useIsTouchDevice() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

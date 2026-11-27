"use client";

import { useSyncExternalStore } from "react";
import { REDUCED_MOTION_QUERY } from "./motionQueries";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

const getServerSnapshot = () => false;

/**
 * True when the visitor asked the OS for less motion. Follows live changes;
 * the server render (and hydration) assume full motion.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

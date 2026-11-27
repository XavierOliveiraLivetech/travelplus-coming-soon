"use client";

import { useEffect, useRef } from "react";

/**
 * setTimeout that can be paused and resumed without losing its progress.
 *
 * - `ms: null` means no timer.
 * - A new `key` starts a fresh `ms` countdown (e.g. the next scene).
 * - While `paused`, the timer is cleared and the time left is kept; on resume
 *   it fires after that remaining time, not after a full `ms` again.
 */
export function usePausableTimeout(
  ms: number | null,
  onDone: () => void,
  { paused, key }: { paused: boolean; key: string | number },
) {
  const remaining = useRef<number | null>(null);
  const done = useRef(onDone);

  useEffect(() => {
    done.current = onDone;
  });

  // Declared before the timer effect so it runs first when `key` changes.
  useEffect(() => {
    remaining.current = null;
  }, [key]);

  useEffect(() => {
    if (ms === null || paused) return;
    const wait = remaining.current ?? ms;
    const startedAt = performance.now();
    let fired = false;
    const id = window.setTimeout(() => {
      fired = true;
      remaining.current = null;
      done.current();
    }, wait);
    return () => {
      window.clearTimeout(id);
      if (!fired) {
        remaining.current = Math.max(0, wait - (performance.now() - startedAt));
      }
    };
  }, [ms, paused, key]);
}

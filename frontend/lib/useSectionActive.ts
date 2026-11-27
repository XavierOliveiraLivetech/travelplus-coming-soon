"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * True while the element is really on screen for the visitor.
 *
 * Besides plain intersection it waits for the element to be shown:
 * - inside a scroll reveal (`data-reveal`), until it is no longer pending;
 * - inside a `data-reveal-gate` (the "Como funciona" cards the plane
 *   uncovers), until the gate is marked `data-revealed="true"`.
 * So demos never run while their card is still invisible. Scroll reveals
 * are one-shot; after the first fade-in, only intersection (and gates)
 * can turn a demo off and on again.
 *
 * Use the false → true flip to restart an animation from its first frame.
 */
export function useSectionActive(
  ref: RefObject<HTMLElement | null>,
  threshold = 0.5,
) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = el.closest<HTMLElement>("[data-reveal]");
    const gate = el.closest<HTMLElement>("[data-reveal-gate]");

    let intersecting = false;
    let current = false;

    const sync = () => {
      const next =
        intersecting &&
        !reveal?.hasAttribute("data-reveal-pending") &&
        (!gate || gate.dataset.revealed === "true");
      if (next === current) return;
      current = next;
      setActive(next);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        intersecting = Boolean(entry?.isIntersecting);
        sync();
      },
      { threshold },
    );
    io.observe(el);

    const mo = new MutationObserver(sync);
    if (reveal) {
      mo.observe(reveal, {
        attributes: true,
        attributeFilter: ["data-reveal-pending"],
      });
    }
    if (gate) {
      mo.observe(gate, { attributes: true, attributeFilter: ["data-revealed"] });
    }

    sync();
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [ref, threshold]);

  return active;
}

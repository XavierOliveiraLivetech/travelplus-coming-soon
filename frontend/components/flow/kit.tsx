"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { withBasePath as assetPath } from "@/lib/basePath";
import type { CssVars } from "@/lib/cssVars";
import { cx } from "@/lib/cx";
import styles from "./FlowDemo.module.css";

/**
 * Building blocks shared by every platform demo (orçamento, pesquisa,
 * operadores, proposta): operator logos, the animated cursor, typed text and
 * form fields. They all animate through FlowDemo.module.css, keyed off the
 * shell's `.running .sceneActive` classes.
 */

export { styles as flowStyles };

/** Logos live in /public/operators/<id>.png. */
export const OPERATORS = [
  { id: "newblue", name: "Newblue" },
  { id: "solferias", name: "Solférias" },
  { id: "soltropico", name: "Soltrópico" },
  { id: "viajartours", name: "Viajar Tours" },
  { id: "soltour", name: "Soltour" },
  { id: "travelplan", name: "Travelplan" },
  { id: "tui", name: "TUI" },
] as const;

export type OperatorId = (typeof OPERATORS)[number]["id"];

export const OP_BY_ID = Object.fromEntries(OPERATORS.map((op) => [op.id, op])) as Record<
  OperatorId,
  (typeof OPERATORS)[number]
>;

/** Gap between one field finishing and the next one starting. */
export const FIELD_GAP = 140;

/**
 * Per-keystroke delays (ms) for a string, with a little human rhythm:
 * a varied base cadence, a short hesitation after spaces / separators.
 * Deterministic so server and client render the same markup.
 */
export function keystrokes(text: string) {
  const chars = [...text];
  const delays: number[] = [];
  let t = 0;
  chars.forEach((ch, i) => {
    delays.push(t);
    const base = 30 + ((i * 37 + ch.charCodeAt(0) * 13) % 24); // 30–53ms
    const pause = /[\s/·]/.test(ch) ? 55 : 0;
    t += base + pause;
  });
  return { chars, delays, total: t };
}

/** How long a value takes to type, so fields can be chained back to back. */
export function typingMs(text: string) {
  return keystrokes(text).total;
}

/** Timing vars for the field that wraps a <Typed>, so it looks focused while typing. */
export function focusVars(text: string, at: number): CssVars {
  // Ends right as the next field starts (FIELD_GAP later), so only one looks focused.
  return {
    "--focus-at": `${at - 120}ms`,
    "--focus-dur": `${typingMs(text) + 120 + FIELD_GAP}ms`,
  };
}

/** Operator logo; falls back to the operator name if the file is missing. */
export function OperatorLogo({ id, className }: { id: OperatorId; className?: string }) {
  const op = OP_BY_ID[id];
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The 404 can happen before hydration, when onError isn't attached yet.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <span className={cx(styles.opLogo, className)} data-op={id}>
      {failed ? (
        <span className={styles.opLogoText}>{op.name}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={assetPath(`/operators/${id}.png`)}
          alt=""
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

/** Pointer that glides onto its parent element and "clicks" it. */
export function Cursor({
  at,
  from = "2.5rem, 2rem",
  chain = false,
}: {
  at: number;
  from?: string;
  /** Clicks its parent, then moves down by `--hop` and clicks again. */
  chain?: boolean;
}) {
  return (
    <span
      className={cx(styles.cursor, chain && styles.cursorChain)}
      style={{ "--at": `${at}ms`, "--from": from } as CssVars}
    />
  );
}

/**
 * Text typed one keystroke at a time: each character pops in on its own beat
 * and a caret rides on the last typed character (blinking at the start and
 * for a moment after the last one, then gone).
 */
export function Typed({ text, at }: { text: string; at: number }) {
  const { chars, delays, total } = keystrokes(text);
  return (
    <span className={styles.typed} style={{ "--at": `${at}ms` } as CssVars}>
      {chars.map((ch, i) => (
        <span
          key={i}
          className={cx(styles.char, i === chars.length - 1 && styles.charLast)}
          style={
            {
              "--d": `${delays[i]}ms`,
              "--n": `${(delays[i + 1] ?? total) - delays[i]}ms`,
            } as CssVars
          }
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

export function Field({
  label,
  children,
  icon,
  style,
}: {
  label: string;
  children: ReactNode;
  icon?: ReactNode;
  style?: CssVars;
}) {
  return (
    <span className={styles.field} style={style}>
      <small>{label}</small>
      <span className={styles.fieldValue}>
        {children}
        {icon ?? <LuChevronDown aria-hidden className={styles.fieldIcon} />}
      </span>
    </span>
  );
}

/**
 * For a fixed viewport over a long list (`.resultsViewport` / `.results`):
 * sets `--scroll` on the viewport to how far the list must move so its last
 * row comes into view. The scroll itself is a CSS animation.
 */
export function useListScroll() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const list = listRef.current;
    if (!viewport || !list) return;
    const sync = () => {
      const overflow = Math.max(0, list.scrollHeight - viewport.clientHeight);
      viewport.style.setProperty("--scroll", `${-overflow}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(viewport);
    ro.observe(list);
    return () => ro.disconnect();
  }, []);

  return { viewportRef, listRef };
}

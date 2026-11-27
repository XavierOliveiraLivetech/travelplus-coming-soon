"use client";

import { LuPause, LuPlay } from "react-icons/lu";
import styles from "./MotionToggle.module.css";
import { cx } from "@/lib/cx";

/**
 * Small, quiet pause / play button for looping decorative animations
 * (WCAG 2.2.2 Pause, Stop, Hide). Only render it when the animation can
 * actually run — not for prefers-reduced-motion, where nothing moves.
 *
 * Icon only. Its tooltip (title) and accessible name come from `titles`
 * when given, otherwise from "Pausar / Retomar" + `label`.
 */
export function MotionToggle({
  paused,
  onToggle,
  label,
  titles,
  tone = "light",
  className,
}: {
  paused: boolean;
  onToggle: () => void;
  /** What is animated, e.g. "a demonstração da plataforma". */
  label: string;
  /** Tooltip + name per state, e.g. { running: "Terminar animação", paused: "Iniciar animação" }. */
  titles?: { running: string; paused: string };
  /** "dark" when the button sits on a dark background (light icon). */
  tone?: "light" | "dark";
  className?: string;
}) {
  const name = titles
    ? paused
      ? titles.paused
      : titles.running
    : `${paused ? "Retomar" : "Pausar"} ${label}`;
  const tooltip = titles
    ? name
    : paused
      ? "Retomar animação"
      : "Pausar animação";

  return (
    <button
      type="button"
      className={cx(
        styles.button,
        styles.badge,
        tone === "dark" && styles.onDark,
        className,
      )}
      // The name already says the action when it changes per state.
      aria-pressed={titles ? undefined : paused}
      aria-label={name}
      title={tooltip}
      onClick={onToggle}
    >
      {paused ? <LuPlay aria-hidden /> : <LuPause aria-hidden />}
    </button>
  );
}

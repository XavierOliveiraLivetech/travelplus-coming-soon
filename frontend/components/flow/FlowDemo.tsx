"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { LuCheck } from "react-icons/lu";
import { withBasePath as assetPath } from "@/lib/basePath";
import type { CssVars } from "@/lib/cssVars";
import { cx } from "@/lib/cx";
import { usePausableTimeout } from "@/lib/usePausableTimeout";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useSectionActive } from "@/lib/useSectionActive";
import { MotionToggle } from "../MotionToggle";
import styles from "./FlowDemo.module.css";

const LOGO_SRC = assetPath("/brand/logo-mark.png");

export type FlowScene = {
  key: string;
  /** Stepper label in the app bar. */
  label: string;
  icon: IconType;
  /** How long the scene stays on screen (its CSS timings must fit inside). */
  ms: number;
  View: ComponentType;
};

export type FlowDemoProps = {
  /** Fill a parent frame (e.g. the gallery window) instead of floating as a card. */
  embedded?: boolean;
  /**
   * Called when the demo finishes its last scene. When given, the demo does
   * not loop: it stops on the last scene's final frame and the parent moves
   * on (e.g. the gallery's next slide).
   */
  onCycleComplete?: () => void;
  /**
   * Pause state owned by the parent (e.g. a pause button in the gallery's
   * title bar). When given, the demo renders no pause button of its own.
   */
  paused?: boolean;
  /**
   * Control shown at the right end of the app bar (e.g. the gallery's pause
   * button). Kept at its real size however much the embedded card is scaled.
   */
  barAction?: ReactNode;
};

/**
 * Shell for the animated platform demos: Livetrip app bar + flow stepper,
 * progress segments and one stacked stage where each scene plays in turn.
 *
 * Scenes animate with CSS only. While the demo runs, the card has `.running`
 * (and `data-running`) and the visible scene `.sceneActive` (and
 * `data-active`), so other CSS modules can key animations off
 * `[data-running] [data-active] .thing`. Purely illustrative: hidden from
 * assistive tech (the surrounding copy carries the meaning), except for the
 * optional `barAction` control.
 */
export function FlowDemo({
  scenes,
  reducedScene = 0,
  pauseLabel = "a demonstração da plataforma",
  hideSteps = false,
  hideProgress = false,
  embedded = false,
  onCycleComplete,
  paused: pausedProp,
  barAction,
}: FlowDemoProps & {
  scenes: FlowScene[];
  /** Scene shown, still, when the visitor prefers reduced motion. */
  reducedScene?: number;
  pauseLabel?: string;
  /** Hide the step pills in the app bar (single-scene demos). */
  hideSteps?: boolean;
  /** Hide the progress segments under the app bar. */
  hideProgress?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const [scene, setScene] = useState(0);
  // Bumped on every loop; a single-scene demo remounts its scene with it so
  // its CSS animations play again from the start.
  const [cycle, setCycle] = useState(0);
  // Played through once and stopped on its final frame (see onCycleComplete).
  const [finished, setFinished] = useState(false);
  const [ownPaused, setOwnPaused] = useState(false);
  const controlled = pausedProp !== undefined;
  const paused = controlled ? pausedProp : ownPaused;
  const reduced = usePrefersReducedMotion();

  // Embedded in a fixed frame: lay the card out at its natural height, then
  // scale it so that height matches the frame. The card is widened by 1/fit
  // (so it still fills the frame after scaling), which can change its height,
  // so keep measuring until the value settles.
  useEffect(() => {
    const frame = visualRef.current;
    const card = rootRef.current;
    if (!embedded || !frame || !card) return;
    const measure = () => {
      const frameH = frame.clientHeight;
      const cardH = card.offsetHeight;
      if (frameH <= 0 || cardH <= 0) return;
      const next = Math.min(1, frameH / cardH);
      setFit((prev) => (Math.abs(prev - next) > 0.002 ? next : prev));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    ro.observe(card);
    measure();
    return () => ro.disconnect();
  }, [embedded]);

  // Start from the first scene every time its section becomes the active one
  // (unless the visitor paused it: then it waits exactly where it stopped).
  const inView = useSectionActive(rootRef);
  useEffect(() => {
    if (!paused) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restarts the demo when the section comes into view
      setScene(0);
      setFinished(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  usePausableTimeout(
    inView && !reduced && !finished ? scenes[scene].ms : null,
    () => {
      if (scene === scenes.length - 1) {
        if (onCycleComplete) {
          // Hold the last frame (CSS animations keep their end state) and let
          // the parent move on, instead of replaying from the first scene.
          setFinished(true);
          onCycleComplete();
          return;
        }
        setCycle((c) => c + 1);
      }
      setScene((s) => (s + 1) % scenes.length);
    },
    { paused, key: `${scene}-${inView}-${cycle}` },
  );

  const active = reduced ? reducedScene : scene;
  // A paused demo keeps its running class so its CSS animations hold their
  // frame instead of restarting from 0% (which would blank the scene).
  const running = !reduced && (inView || paused);

  return (
    <div
      ref={visualRef}
      className={cx(styles.visual, embedded && styles.embedded)}
      style={embedded ? ({ "--fit": fit } as CssVars) : undefined}
    >
      <div
        ref={rootRef}
        className={cx(styles.card, running && styles.running, paused && styles.paused)}
        data-running={running || undefined}
      >
        <div className={styles.appBar}>
          {/* Illustration only (the surrounding copy carries the meaning); just
              the bar's control, if any, is exposed to assistive tech. */}
          <span className={styles.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.logo} src={LOGO_SRC} alt="" width={152} height={82} />
          <ol className={styles.stepper} hidden={hideSteps} aria-hidden="true">
            {scenes.map((s, i) => {
              const Icon = s.icon;
              return (
                <li
                  key={s.key}
                  className={cx(
                    styles.step,
                    i === active && styles.stepActive,
                    i < active && styles.stepDone,
                  )}
                >
                  <span className={styles.stepIcon}>{i < active ? <LuCheck /> : <Icon />}</span>
                  <span className={styles.stepLabel}>{s.label}</span>
                </li>
              );
            })}
          </ol>
          {barAction ? <span className={styles.barAction}>{barAction}</span> : null}
        </div>

        {/* One segment per step, coloured once the flow reaches it */}
        <div
          className={styles.progress}
          style={{ "--steps": scenes.length } as CssVars}
          hidden={hideProgress}
          aria-hidden="true"
        >
          {scenes.map((s, i) => (
            <span
              key={s.key}
              className={cx(
                styles.progressSeg,
                i < active && styles.progressDone,
                i === active && styles.progressActive,
              )}
            >
              <i />
            </span>
          ))}
        </div>

        <div className={styles.stage} aria-hidden="true">
          {scenes.map(({ key, View }, i) => (
            <div
              key={scenes.length === 1 ? `${key}-${cycle}` : key}
              className={cx(styles.scene, i === active && styles.sceneActive)}
              data-active={i === active || undefined}
            >
              <View />
            </div>
          ))}
        </div>
      </div>
      {!reduced && !controlled && (
        <MotionToggle
          className={styles.motionToggle}
          paused={paused}
          onToggle={() => setOwnPaused((p) => !p)}
          label={pauseLabel}
          tone={embedded ? "light" : "dark"}
        />
      )}
    </div>
  );
}

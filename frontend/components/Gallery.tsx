"use client";

import {
  fadeUp,
  gallerySlide,
} from "@/lib/motion";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { MotionToggle } from "./MotionToggle";
import type { FlowDemoProps } from "./flow/FlowDemo";
import { OperadoresFlow } from "./flow/OperadoresFlow";
import { PesquisaFlow } from "./flow/PesquisaFlow";
import { PlatformFlow } from "./flow/PlatformFlow";
import { PropostaFlow } from "./flow/PropostaFlow";

type GalleryItem = {
  id: string;
  title: string;
  /** Animated platform demo; the gallery moves on when it finishes a cycle. */
  Flow: ComponentType<FlowDemoProps>;
};

const ITEMS: GalleryItem[] = [
  {
    id: "pesquisa",
    Flow: PesquisaFlow,
    title: "Pesquisa agrupada",
  },
  {
    id: "operadores",
    Flow: OperadoresFlow,
    title: "Operadores integrados",
  },
  {
    id: "proposta",
    Flow: PlatformFlow,
    title: "Orçamento pronto em 3 minutos",
  },
  {
    id: "pdf",
    Flow: PropostaFlow,
    title: "Proposta em PDF",
  },
];

/**
 * Delay between a demo finishing and the next slide. The demo holds its final
 * frame (it never replays), so the gallery moves on straight away.
 */
const GALLERY_POST_SHOWCASE_MS = 0;

const TYPE_MS = 42;
const ERASE_MS = 28;
const HOLD_MS = 180;
const SWIPE_OFFSET_PX = 56;
const SWIPE_VELOCITY = 450;

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function TypewriterCaption({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState(text);
  const displayedRef = useRef(displayed);
  const targetRef = useRef(text);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    displayedRef.current = displayed;
  }, [displayed]);

  useEffect(() => {
    targetRef.current = text;

    const clearTimers = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };

    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(fn, delay);
      timersRef.current.push(id);
    };

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      clearTimers();
      setDisplayed(text);
      return;
    }

    if (displayedRef.current === text) {
      return;
    }

    clearTimers();

    const eraseThenType = () => {
      const current = displayedRef.current;

      if (current.length > 0) {
        setDisplayed(current.slice(0, -1));
        schedule(eraseThenType, ERASE_MS);
        return;
      }

      schedule(() => typeNext(0), HOLD_MS);
    };

    const typeNext = (index: number) => {
      const target = targetRef.current;

      if (index >= target.length) {
        return;
      }

      setDisplayed(target.slice(0, index + 1));
      schedule(() => typeNext(index + 1), TYPE_MS);
    };

    eraseThenType();

    return clearTimers;
  }, [text]);

  return (
    <p className="gallery-title" aria-label={text}>
      <span className="gallery-title-text">{displayed}</span>
    </p>
  );
}

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  // Pause button at the right of the demo's app bar; applies to the demo on screen.
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const [direction, setDirection] = useState(1);
  const showcaseAdvanceTimerRef = useRef<number | null>(null);
  const active = ITEMS[activeIndex];

  const goTo = (nextIndex: number, nextDirection: number) => {
    // A new slide always starts playing (a paused one would hold its first,
    // still-empty frame).
    setPaused(false);
    setDirection(nextDirection);
    setActiveIndex(wrapIndex(nextIndex, ITEMS.length));
  };

  const paginate = (step: number) => {
    goTo(activeIndex + step, step);
  };

  const handleShowcaseFinished = useCallback(() => {
    if (showcaseAdvanceTimerRef.current !== null) {
      window.clearTimeout(showcaseAdvanceTimerRef.current);
    }

    showcaseAdvanceTimerRef.current = window.setTimeout(() => {
      showcaseAdvanceTimerRef.current = null;
      paginate(1);
    }, GALLERY_POST_SHOWCASE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- paginate keyed on activeIndex only
  }, [activeIndex]);

  useEffect(() => {
    if (showcaseAdvanceTimerRef.current !== null) {
      window.clearTimeout(showcaseAdvanceTimerRef.current);
      showcaseAdvanceTimerRef.current = null;
    }
  }, [activeIndex]);

  return (
    <motion.aside
      className="gallery"
      aria-label="Galeria de pré-visualizações"
      variants={fadeUp}
    >
      <div className="gallery-window">

        <figure className="gallery-stage">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={active.id}
              className="gallery-slide"
              custom={direction}
              variants={gallerySlide}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                const { offset, velocity } = info;
                const swipedNext =
                  offset.x < -SWIPE_OFFSET_PX || velocity.x < -SWIPE_VELOCITY;
                const swipedPrev =
                  offset.x > SWIPE_OFFSET_PX || velocity.x > SWIPE_VELOCITY;

                if (swipedNext) {
                  paginate(1);
                } else if (swipedPrev) {
                  paginate(-1);
                }
              }}
            >
              <div className="gallery-flow">
                <active.Flow
                  embedded
                  paused={paused}
                  onCycleComplete={handleShowcaseFinished}
                  barAction={
                    reducedMotion ? undefined : (
                      <MotionToggle
                        className="gallery-window-toggle"
                        paused={paused}
                        onToggle={() => setPaused((p) => !p)}
                        label="a demonstração da plataforma"
                      />
                    )
                  }
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </figure>
      </div>

      <div className="gallery-meta">
        <TypewriterCaption text={active.title} />
        <div
          className="gallery-dots"
          role="tablist"
          aria-label="Navegação da galeria"
        >
          {ITEMS.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                className={`gallery-dot${isActive ? " is-active" : ""}`}
                aria-label={`Ir para ${item.title}`}
                aria-selected={isActive}
                onClick={() => {
                  if (index === activeIndex) {
                    return;
                  }

                  goTo(index, index > activeIndex ? 1 : -1);
                }}
              />
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
}

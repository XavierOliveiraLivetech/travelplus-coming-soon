"use client";

import {
  fadeUp,
  gallerySlide,
} from "@/lib/motion";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ORCAMENTO_VIDEO_SRC,
  PESQUISA_AGRUPADA_VIDEO_SRC,
} from "@/lib/galleryVideos";
import GalleryShowcaseVideo from "./GalleryShowcaseVideo";
import OperadoresPrint from "./OperadoresPrint";
import PropostaPdfPrint from "./PropostaPdfPrint";

type GalleryItem = {
  id: string;
  kind: "operators" | "pesquisa" | "orcamento" | "pdf";
  title: string;
};

const ITEMS: GalleryItem[] = [
  {
    id: "pesquisa",
    kind: "pesquisa",
    title: "Pesquisa agrupada",
  },
  {
    id: "operadores",
    kind: "operators",
    title: "Operadores integrados",
  },
  {
    id: "proposta",
    kind: "orcamento",
    title: "Orçamento pronto em 3 minutos",
  },
  {
    id: "pdf",
    kind: "pdf",
    title: "Proposta em PDF",
  },
];

/** Dwell time for static slides (not pesquisa video / PDF scroll). */
const GALLERY_SLIDE_MS = 5_000;

/** Wait after pesquisa video or PDF pan finishes before auto-advance. */
const GALLERY_POST_SHOWCASE_MS = 1_000;

function isShowcaseSyncedSlide(item: GalleryItem) {
  return (
    item.kind === "pesquisa" || item.kind === "orcamento" || item.kind === "pdf"
  );
}
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
  const [direction, setDirection] = useState(1);
  const showcaseAdvanceTimerRef = useRef<number | null>(null);
  const active = ITEMS[activeIndex];

  const goTo = (nextIndex: number, nextDirection: number) => {
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

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const item = ITEMS[activeIndex];
    if (isShowcaseSyncedSlide(item)) {
      return;
    }

    const timer = window.setTimeout(() => {
      paginate(1);
    }, GALLERY_SLIDE_MS);

    return () => window.clearTimeout(timer);
    // Intentionally keyed only on activeIndex so auto-advance resets on every slide change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <motion.aside
      className="gallery"
      aria-label="Galeria de pré-visualizações"
      variants={fadeUp}
    >
      <div className="gallery-window">
        <div className="gallery-window-chrome" aria-hidden="true">
          <div className="gallery-window-traffic">
            <span className="gallery-window-dot gallery-window-dot--close" />
            <span className="gallery-window-dot gallery-window-dot--minimize" />
            <span className="gallery-window-dot gallery-window-dot--maximize" />
          </div>
        </div>

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
              {active.kind === "operators" ? (
                <div className="gallery-operators">
                  <OperadoresPrint />
                </div>
              ) : active.kind === "pesquisa" ? (
                <div className="gallery-pesquisa">
                  <GalleryShowcaseVideo
                    src={PESQUISA_AGRUPADA_VIDEO_SRC}
                    ariaLabel="Gravação: pesquisa agrupada no Livetrip — Hilton Cabo Verde, regime só alojamento e quartos"
                    onShowcaseFinished={handleShowcaseFinished}
                  />
                </div>
              ) : active.kind === "orcamento" ? (
                <div className="gallery-orcamento">
                  <GalleryShowcaseVideo
                    src={ORCAMENTO_VIDEO_SRC}
                    ariaLabel="Gravação: criar orçamento no Livetrip em poucos minutos"
                    crop="centered"
                    onShowcaseFinished={handleShowcaseFinished}
                  />
                </div>
              ) : (
                <div className="gallery-pdf">
                  <PropostaPdfPrint
                    onShowcaseFinished={handleShowcaseFinished}
                  />
                </div>
              )}
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

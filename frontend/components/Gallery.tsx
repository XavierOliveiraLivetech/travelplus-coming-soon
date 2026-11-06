"use client";

import { withBasePath } from "@/lib/basePath";
import {
  fadeUp,
  gallerySlide,
  operatorGrid,
  operatorPop,
} from "@/lib/motion";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type GalleryImageItem = {
  id: string;
  kind: "image";
  title: string;
  src: string;
  alt: string;
};

type GalleryOperatorsItem = {
  id: string;
  kind: "operators";
  title: string;
};

type GalleryItem = GalleryImageItem | GalleryOperatorsItem;

const OPERATOR_LOGOS = [
  { id: "newblue", src: withBasePath("/Logos/Operadores/newblue.png"), alt: "Newblue" },
  { id: "nortravel", src: withBasePath("/Logos/Operadores/nortravel.png"), alt: "Nortravel" },
  { id: "solferias", src: withBasePath("/Logos/Operadores/solferias.svg"), alt: "Sol Férias" },
  { id: "soltropico", src: withBasePath("/Logos/Operadores/Soltropico.png"), alt: "Soltrópico" },
  { id: "soltour", src: withBasePath("/Logos/Operadores/soltour.png"), alt: "Soltour" },
  { id: "travelplan", src: withBasePath("/Logos/Operadores/travelplan.png"), alt: "Travelplan" },
  { id: "tui", src: withBasePath("/Logos/Operadores/tui.png"), alt: "TUI" },
  { id: "viajartours", src: withBasePath("/Logos/Operadores/viajartours.png"), alt: "Viajar Tours" },
  { id: "w2m", src: withBasePath("/Logos/Operadores/w2m.png"), alt: "W2M" },
] as const;

const ITEMS: GalleryItem[] = [
  {
    id: "pesquisa",
    kind: "image",
    title: "Pesquisa agrupada",
    src: withBasePath("/Img/sneaks/pesquisa.png"),
    alt: "Pré-visualização da pesquisa agrupada",
  },
  {
    id: "operadores",
    kind: "operators",
    title: "Operadores integrados",
  },
  {
    id: "proposta",
    kind: "image",
    title: "Orçamento em 3 minutos",
    src: withBasePath("/Img/sneaks/orcamento.png"),
    alt: "Pré-visualização do orçamento rápido",
  },
  {
    id: "pdf",
    kind: "image",
    title: "Proposta em PDF",
    src: withBasePath("/Img/sneaks/pdf.png"),
    alt: "Pré-visualização da proposta em PDF",
  },
];

const AUTO_ADVANCE_MS = 7500;
const OPERATORS_ADVANCE_MS = 11000;
const TYPE_MS = 42;
const ERASE_MS = 28;
const HOLD_MS = 180;

function TypewriterCaption({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState(text);
  const [isTyping, setIsTyping] = useState(false);
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
      setIsTyping(false);
      return;
    }

    if (displayedRef.current === text) {
      return;
    }

    clearTimers();
    setIsTyping(true);

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
        setIsTyping(false);
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
      <motion.span
        className="gallery-title-caret"
        aria-hidden="true"
        animate={{ opacity: isTyping ? [1, 1] : [1, 0, 1] }}
        transition={
          isTyping
            ? { duration: 0 }
            : { duration: 0.9, repeat: Infinity, ease: "linear" }
        }
      />
    </p>
  );
}

function OperatorsSlide() {
  return (
    <motion.ul
      className="gallery-operators-grid"
      variants={operatorGrid}
      initial="hidden"
      animate="show"
    >
      {OPERATOR_LOGOS.map((logo) => (
        <motion.li
          key={logo.id}
          className="gallery-operator"
          variants={operatorPop}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.src}
            alt={logo.alt}
            className={`gallery-operator-logo${logo.id === "solferias" ? " gallery-operator-logo--solferias" : ""}`}
            loading="lazy"
            decoding="async"
          />
        </motion.li>
      ))}
    </motion.ul>
  );
}

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = ITEMS[activeIndex];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const delay =
      ITEMS[activeIndex]?.kind === "operators"
        ? OPERATORS_ADVANCE_MS
        : AUTO_ADVANCE_MS;

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % ITEMS.length);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  return (
    <motion.aside
      className="gallery"
      aria-label="Galeria de pré-visualizações"
      variants={fadeUp}
    >
      <figure className="gallery-stage">
        <AnimatePresence initial={false}>
          <motion.div
            key={active.id}
            className="gallery-slide"
            variants={gallerySlide}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {active.kind === "operators" ? (
              <div className="gallery-operators">
                <OperatorsSlide />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.src}
                alt={active.alt}
                className="gallery-image"
                loading="eager"
                decoding="async"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </figure>

      <div className="gallery-meta">
        <TypewriterCaption text={active.title} />
      </div>
    </motion.aside>
  );
}

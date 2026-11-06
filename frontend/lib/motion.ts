import type { Transition, Variants } from "motion/react";

export const easeOutExpo: Transition["ease"] = [0.22, 1, 0.36, 1];

export const springSoft: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 24,
  mass: 0.8,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.9, ease: easeOutExpo },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: easeOutExpo },
  },
};

export const pageStagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

/** Lets nested layout wrappers pass stagger down to motion children. */
export const staggerPassThrough: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const gallerySlideEase: Transition["ease"] = [0.33, 0.08, 0.2, 1];

export const gallerySlide: Variants = {
  enter: {
    x: "-28%",
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.95,
      ease: gallerySlideEase,
    },
  },
  exit: {
    x: "28%",
    opacity: 0,
    transition: {
      duration: 0.85,
      ease: gallerySlideEase,
    },
  },
};

export const operatorGrid: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};

export const operatorPop: Variants = {
  hidden: { opacity: 0, scale: 0.35 },
  show: {
    opacity: 1,
    scale: 1,
    transition: springSoft,
  },
};

export const socialStagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const socialItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOutExpo },
  },
};

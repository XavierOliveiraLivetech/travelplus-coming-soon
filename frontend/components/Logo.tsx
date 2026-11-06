"use client";

import { withBasePath } from "@/lib/basePath";
import { motion } from "motion/react";

const LOGO_SRC = withBasePath("/Logos/" + encodeURIComponent("TravelPlus.svg"));
const HOME_HREF = withBasePath("/") || "/";

export default function Logo() {
  return (
    <motion.a
      href={HOME_HREF}
      aria-label="Travel Plus"
      className="brand-logo-link"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_SRC}
        alt="Travel Plus"
        width={152}
        height={82}
        className="brand-logo-image"
      />
    </motion.a>
  );
}

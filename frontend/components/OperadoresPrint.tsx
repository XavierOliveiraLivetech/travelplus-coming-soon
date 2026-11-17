"use client";

import { withBasePath } from "@/lib/basePath";
import { useGalleryStageScale } from "@/lib/galleryStage";
import { operatorGrid, operatorPop } from "@/lib/motion";
import { motion } from "motion/react";
import { useRef } from "react";
import styles from "./OperadoresPrint.module.css";

const OPERATORS = [
  {
    id: "newblue",
    name: "Newblue",
    logo: withBasePath("/sneaks/Operadores/newblue.png"),
  },
  {
    id: "nortravel",
    name: "Nortravel",
    logo: withBasePath("/sneaks/Operadores/nortravel.png"),
  },
  {
    id: "solferias",
    name: "Sol Férias",
    logo: withBasePath("/sneaks/Operadores/solferias.svg"),
  },
  {
    id: "soltropico",
    name: "Soltrópico",
    logo: withBasePath("/sneaks/Operadores/Soltropico.png"),
  },
  {
    id: "viajartours",
    name: "Viajar Tours",
    logo: withBasePath("/sneaks/Operadores/viajartours.png"),
  },
  {
    id: "soltour",
    name: "Soltour",
    logo: withBasePath("/sneaks/Operadores/soltour.png"),
  },
  {
    id: "travelplan",
    name: "Travelplan",
    logo: withBasePath("/sneaks/Operadores/travelplan.png"),
  },
  {
    id: "tui",
    name: "TUI",
    logo: withBasePath("/sneaks/Operadores/tui.png"),
  },
] as const;

export default function OperadoresPrint() {
  const hostRef = useRef<HTMLDivElement>(null);
  const scale = useGalleryStageScale(hostRef);

  return (
    <div
      className={styles.root}
      role="img"
      aria-label="Pré-visualização: operadores integrados — Newblue, Nortravel, Sol Férias, Soltrópico, Viajar Tours, Soltour, Travelplan e TUI"
    >
      <div className={styles.scaleHost} ref={hostRef}>
        <motion.div
          className={styles.sheet}
          style={{ transform: `scale(${scale})` }}
          variants={operatorGrid}
          initial="hidden"
          animate="show"
        >
          <motion.ul className={styles.grid} variants={operatorGrid}>
            {OPERATORS.map((operator) => (
              <motion.li
                key={operator.id}
                className={styles.cell}
                variants={operatorPop}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={operator.logo}
                  alt={operator.name}
                  className={`${styles.logo}${
                    operator.id === "solferias" ? ` ${styles.logoSolferias}` : ""
                  }`}
                  draggable={false}
                />
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </div>
  );
}

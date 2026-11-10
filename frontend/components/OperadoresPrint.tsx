"use client";

import { withBasePath } from "@/lib/basePath";
import { operatorGrid, operatorPop } from "@/lib/motion";
import { motion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import styles from "./OperadoresPrint.module.css";

/** Same design canvas as OrcamentoPrint — fills the 16:9 gallery stage */
const DESIGN_W = 960;
const DESIGN_H = 540;

const OPERATORS = [
  {
    id: "newblue",
    name: "Newblue",
    logo: withBasePath("/Logos/Operadores/newblue.png"),
  },
  {
    id: "nortravel",
    name: "Nortravel",
    logo: withBasePath("/Logos/Operadores/nortravel.png"),
  },
  {
    id: "solferias",
    name: "Sol Férias",
    logo: withBasePath("/Logos/Operadores/solferias.svg"),
  },
  {
    id: "soltropico",
    name: "Soltrópico",
    logo: withBasePath("/Logos/Operadores/Soltropico.png"),
  },
  {
    id: "viajartours",
    name: "Viajar Tours",
    logo: withBasePath("/Logos/Operadores/viajartours.png"),
  },
  {
    id: "soltour",
    name: "Soltour",
    logo: withBasePath("/Logos/Operadores/soltour.png"),
  },
  {
    id: "travelplan",
    name: "Travelplan",
    logo: withBasePath("/Logos/Operadores/travelplan.png"),
  },
  {
    id: "tui",
    name: "TUI",
    logo: withBasePath("/Logos/Operadores/tui.png"),
  },
] as const;

export default function OperadoresPrint() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const update = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width <= 0 || height <= 0) {
        return;
      }
      setScale(Math.min(width / DESIGN_W, height / DESIGN_H));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

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

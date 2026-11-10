"use client";

import { withBasePath } from "@/lib/basePath";
import { operatorGrid, pesquisaAgrupadaReveal } from "@/lib/motion";
import { motion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaChild,
  FaCircleCheck,
  FaCirclePlus,
  FaHouse,
  FaLocationDot,
  FaMugSaucer,
  FaSnowflake,
  FaUmbrellaBeach,
  FaUtensils,
} from "react-icons/fa6";
import { FaTripadvisor } from "react-icons/fa";
import styles from "./PesquisaAgrupadaPrint.module.css";

const DESIGN_W = 960;
const DESIGN_H = 540;

const HOTEL_IMG = withBasePath("/Img/sneaks/hilton-cv.jpg");
const NORTRAVEL = withBasePath("/Logos/Operadores/nortravel.png");
const NEWBLUE = withBasePath("/Logos/Operadores/newblue.png");

const AMENITIES = [
  { id: "praia", icon: FaUmbrellaBeach, label: "Acesso à praia" },
  { id: "ac", icon: FaSnowflake, label: "Ar condicionado" },
  { id: "kids", icon: FaChild, label: "Área de diversão infantil interior" },
  { id: "mar", icon: FaCircleCheck, label: "De frente para o mar" },
] as const;

const OFFERS = [
  {
    id: "bb",
    icon: FaMugSaucer,
    regime: "Alojamento e pequeno-almoço",
    room: "Twin Guest Room",
    price: "1353€",
    total: "2705€ total",
    operator: "Nortravel",
    logo: NORTRAVEL,
    rooms: "930 quartos neste regime",
  },
  {
    id: "ro",
    icon: FaHouse,
    regime: "Só alojamento",
    room: "King Guest Room",
    price: "1468€",
    total: "2935€ total",
    operator: "Newblue",
    logo: NEWBLUE,
    rooms: "50 quartos neste regime",
  },
  {
    id: "hb",
    icon: FaUtensils,
    regime: "Meia pensão",
    room: "King Guest Room",
    price: "1577€",
    total: "3154€ total",
    operator: "Nortravel",
    logo: NORTRAVEL,
    rooms: "816 quartos neste regime",
  },
] as const;

export default function PesquisaAgrupadaPrint() {
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
      aria-label="Pré-visualização: pesquisa agrupada — Hilton Cabo Verde Resort com ofertas de vários operadores"
    >
      <div className={styles.scaleHost} ref={hostRef}>
        <motion.article
          className={styles.sheet}
          style={{ transform: `scale(${scale})` }}
          variants={operatorGrid}
          initial="hidden"
          animate="show"
        >
          <motion.div className={styles.card} variants={pesquisaAgrupadaReveal}>
            <div className={styles.top}>
              <div className={styles.media}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={HOTEL_IMG}
                  alt="Hilton Cabo Verde Resort"
                  className={styles.photo}
                  draggable={false}
                />
                <span className={`${styles.nav} ${styles.navLeft}`} aria-hidden>
                  <FaChevronLeft />
                </span>
                <span className={`${styles.nav} ${styles.navRight}`} aria-hidden>
                  <FaChevronRight />
                </span>
                <span className={styles.counter}>2 / 8</span>
              </div>

              <div className={styles.info}>
                <header className={styles.titleRow}>
                  <h3 className={styles.title}>Hilton Cabo Verde Resort</h3>
                  <span className={styles.stars} aria-label="5 estrelas">
                    ★★★★★
                  </span>
                </header>

                <p className={styles.address}>
                  <FaLocationDot aria-hidden />
                  Av. dos Hoteis
                </p>

                <p className={styles.meta}>
                  <span className={styles.tripadvisor}>
                    <FaTripadvisor aria-hidden />
                    Tripadvisor · 4,2
                  </span>
                  <span>A 2,3 km de Santa Maria</span>
                </p>

                <ul className={styles.amenities}>
                  {AMENITIES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id} className={styles.amenity}>
                        <Icon aria-hidden />
                        {item.label}
                      </li>
                    );
                  })}
                  <li className={styles.more}>Ver mais</li>
                </ul>
              </div>
            </div>

            <ul className={styles.offers}>
              {OFFERS.map((offer) => {
                const Icon = offer.icon;
                return (
                  <motion.li
                    key={offer.id}
                    className={styles.offer}
                    variants={pesquisaAgrupadaReveal}
                  >
                    <p className={styles.regime}>
                      <Icon aria-hidden />
                      {offer.regime}
                    </p>
                    <p className={styles.room}>{offer.room}</p>
                    <div className={styles.priceRow}>
                      <div className={styles.priceBlock}>
                        <strong className={styles.price}>{offer.price}</strong>
                        <span className={styles.perPerson}>por pessoa</span>
                        <span className={styles.total}>{offer.total}</span>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={offer.logo}
                        alt={offer.operator}
                        className={styles.logo}
                        draggable={false}
                      />
                    </div>
                    <span className={styles.reserve}>Reservar</span>
                    <p className={styles.stock}>
                      <FaCirclePlus aria-hidden />
                      {offer.rooms}
                    </p>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </motion.article>
      </div>
    </div>
  );
}

"use client";

import { withBasePath } from "@/lib/basePath";
import { orcamentoPrintReveal, operatorGrid } from "@/lib/motion";
import { motion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import {
  FaBed,
  FaCalendarDays,
  FaGift,
  FaHotel,
  FaPlane,
  FaSuitcase,
  FaUtensils,
} from "react-icons/fa6";
import styles from "./OrcamentoPrint.module.css";

const DESIGN_W = 960;
const DESIGN_H = 540;

const TAP_LOGO = withBasePath("/Img/sneaks/tap-logo.png");
const HOTEL_IMG = withBasePath("/Img/sneaks/hotel-thumb.jpg");

type FlightLeg = {
  direction: "Ida" | "Volta";
  departureTime: string;
  departureCode: string;
  arrivalTime: string;
  arrivalCode: string;
  duration: string;
  baggage: string;
};

const FLIGHTS: FlightLeg[] = [
  {
    direction: "Ida",
    departureTime: "09:40",
    departureCode: "LIS",
    arrivalTime: "12:55",
    arrivalCode: "BVC",
    duration: "4h15min",
    baggage: "1P",
  },
  {
    direction: "Volta",
    departureTime: "14:25",
    departureCode: "BVC",
    arrivalTime: "21:40",
    arrivalCode: "LIS",
    duration: "5h15min",
    baggage: "1P",
  },
];

const HOTEL_FACTS = [
  {
    id: "quarto",
    icon: FaBed,
    label: "Quarto",
    value: "Deluxe, vista piscina · 2 individuais",
  },
  {
    id: "regime",
    icon: FaUtensils,
    label: "Regime",
    value: "Tudo Incluído",
  },
  {
    id: "checkin",
    icon: FaCalendarDays,
    label: "Check-in",
    value: "21/11/2026",
  },
] as const;

const EXTRAS = [
  {
    id: "transfer",
    name: "Transfer aeroporto ↔ hotel",
    price: "Incluído",
    included: true,
  },
  {
    id: "seguro",
    name: "Seguro de viagem",
    price: "48€",
    included: false,
  },
  {
    id: "mala",
    name: "Bagagem de porão extra",
    price: "65€",
    included: false,
  },
] as const;

function FlightTicket({ leg }: { leg: FlightLeg }) {
  return (
    <article
      className={styles.ticketWrap}
      aria-label={`Voo ${leg.direction} ${leg.departureCode}–${leg.arrivalCode}`}
    >
      <div className={styles.ticket}>
        <div className={styles.ticketTop}>
          <div className={styles.ticketRoute}>
            <div className={styles.airline}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TAP_LOGO}
                alt="TAP Air Portugal"
                className={styles.airlineLogo}
                draggable={false}
              />
            </div>

            <div className={styles.routeMain}>
              <div className={styles.endpoint}>
                <span className={styles.endpointTime}>{leg.departureTime}</span>
                <span className={styles.endpointCode}>{leg.departureCode}</span>
              </div>

              <div className={styles.routeMid}>
                <span className={styles.duration}>{leg.duration}</span>
                <div className={styles.routeLine}>
                  <span className={styles.routePlane} aria-hidden>
                    <FaPlane />
                  </span>
                </div>
              </div>

              <div className={`${styles.endpoint} ${styles.endpointArrival}`}>
                <span className={styles.endpointTime}>{leg.arrivalTime}</span>
                <span className={styles.endpointCode}>{leg.arrivalCode}</span>
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.ticketBottom}>
          <span className={styles.pill}>
            <FaSuitcase aria-hidden />
            {leg.baggage}
          </span>
        </footer>
      </div>
    </article>
  );
}

export default function OrcamentoPrint() {
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
      aria-label="Pré-visualização: orçamento pronto em 3 minutos — resumo da viagem com voos, hotel e extras"
    >
      <div className={styles.scaleHost} ref={hostRef}>
        <motion.div
          className={styles.sheet}
          style={{ transform: `scale(${scale})` }}
          variants={operatorGrid}
          initial="hidden"
          animate="show"
        >
          <div className={styles.body}>
            <ol className={styles.timeline}>
              <motion.li
                className={`${styles.stop} ${styles.stopFlights}`}
                variants={orcamentoPrintReveal}
              >
                <header className={styles.stopHeader}>
                  <span className={styles.marker} aria-hidden>
                    <FaPlane />
                  </span>
                  <h3 className={styles.stopTitle}>Voos</h3>
                </header>
                <div className={styles.flightsStack}>
                  {FLIGHTS.map((leg) => (
                    <FlightTicket key={leg.direction} leg={leg} />
                  ))}
                </div>
              </motion.li>

              <motion.li
                className={`${styles.stop} ${styles.stopHotel}`}
                variants={orcamentoPrintReveal}
              >
                <header className={styles.stopHeader}>
                  <span className={styles.marker} aria-hidden>
                    <FaHotel />
                  </span>
                  <h3 className={styles.stopTitle}>Hotel</h3>
                </header>

                <article className={styles.hotelCard}>
                  <div className={styles.hotelMedia}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={HOTEL_IMG}
                      alt="Barceló Marine Boa Vista"
                      className={styles.hotelImage}
                      draggable={false}
                    />
                  </div>

                  <div className={styles.hotelInfo}>
                    <div className={styles.hotelTitleBlock}>
                      <h4 className={styles.hotelName}>
                        Barceló Marine Boa Vista
                      </h4>
                      <span className={styles.stars} aria-label="5 estrelas">
                        ★★★★★
                      </span>
                    </div>

                    <ul className={styles.facts}>
                      {HOTEL_FACTS.map((fact) => {
                        const Icon = fact.icon;
                        return (
                          <li key={fact.id} className={styles.fact}>
                            <span className={styles.factHead}>
                              <Icon className={styles.factIcon} aria-hidden />
                              {fact.label}
                            </span>
                            <span className={styles.factValue}>{fact.value}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </article>
              </motion.li>

              <motion.li
                className={`${styles.stop} ${styles.stopExtras}`}
                variants={orcamentoPrintReveal}
              >
                <header className={styles.stopHeader}>
                  <span className={styles.marker} aria-hidden>
                    <FaGift />
                  </span>
                  <h3 className={styles.stopTitle}>Extras</h3>
                </header>

                <ul className={styles.extrasList}>
                  {EXTRAS.map((extra) => (
                    <li key={extra.id} className={styles.extraRow}>
                      <span className={styles.extraName}>{extra.name}</span>
                      <span
                        className={
                          extra.included
                            ? styles.extraIncluded
                            : styles.extraPrice
                        }
                      >
                        {extra.price}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.li>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

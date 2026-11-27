"use client";

import type { IconType } from "react-icons";
import {
  LuBed,
  LuBedDouble,
  LuBaby,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuCircleCheck,
  LuCirclePlus,
  LuCoffee,
  LuSnowflake,
  LuSoup,
  LuUmbrella,
  LuX,
} from "react-icons/lu";
import { withBasePath as assetPath } from "@/lib/basePath";
import type { CssVars } from "@/lib/cssVars";
import { cx } from "@/lib/cx";
import { FlowDemo, type FlowDemoProps, type FlowScene } from "./FlowDemo";
import { Cursor, type OperatorId, OperatorLogo, flowStyles as f, useListScroll } from "./kit";
import s from "./scenes.module.css";

/**
 * "Pesquisa agrupada" — one page, no navigation: the hotel card with the
 * cheapest room of each regime (board type). The cursor flips the photo,
 * opens the rooms of one regime in a modal (one room per operator), the list
 * scrolls through every operator, the cursor books one room and the booking
 * is confirmed.
 */

const PHOTO_FRONT = assetPath("/flow/hotel-front.jpg?v=2");
const PHOTO_POOL = assetPath("/flow/hotel-pool.jpg?v=2");

const HOTEL = "Hilton Cabo Verde Resort";

const AMENITIES: { label: string; icon: IconType }[] = [
  { label: "Acesso à praia", icon: LuUmbrella },
  { label: "Ar condicionado", icon: LuSnowflake },
  { label: "Área de diversão infantil interior", icon: LuBaby },
  { label: "De frente para o mar", icon: LuCircleCheck },
];

type Regime = {
  label: string;
  icon: IconType;
  room: string;
  price: string;
  op: OperatorId;
  rooms: number;
};

const REGIMES: Regime[] = [
  {
    label: "Outro",
    icon: LuBed,
    room: "Two Double Beds Guest Room",
    price: "1788€",
    op: "travelplan",
    rooms: 5,
  },
  {
    label: "Alojamento e pequeno-almoço",
    icon: LuCoffee,
    room: "Quarto, 2 camas individuais, varanda",
    price: "1900€",
    op: "soltour",
    rooms: 7,
  },
  {
    label: "Meia pensão",
    icon: LuSoup,
    room: "King Accessible Room",
    price: "2150€",
    op: "newblue",
    rooms: 6,
  },
];

/** Regime whose "quartos neste regime" the cursor opens. */
const OPEN = 1;

/** Rooms of the open regime: one per operator, cheapest first. */
const ROOMS: { name: string; op: OperatorId; price: string }[] = [
  { name: REGIMES[OPEN].room, op: "soltour", price: "1900€" },
  { name: "Twin Guest Room", op: "newblue", price: "1934€" },
  { name: "King Guest Room With Terrace", op: "viajartours", price: "1962€" },
  { name: "Quarto Duplo Vista Jardim", op: "solferias", price: "2015€" },
  { name: "Twin Deluxe Room With Pool View", op: "travelplan", price: "2088€" },
  { name: "King Deluxe Room With Pool View", op: "tui", price: "2140€" },
  { name: "Suite Júnior Vista Piscina", op: "soltropico", price: "2296€" },
];

/** Room the cursor books once the list has scrolled to the end. */
const ROOM_PICK = 4;

/*
 * Timeline (ms from the scene start). A <Cursor> clicks ~910ms after its --at
 * (70% of its 1300ms animation).
 */
const PHOTO_CURSOR = 1100;
const PHOTO_CLICK = PHOTO_CURSOR + 910;
const OPEN_CURSOR = 2800;
const OPEN_CLICK = OPEN_CURSOR + 910;
const MODAL_AT = OPEN_CLICK + 200;
const ROWS_AT = MODAL_AT + 300;
const SCROLL_AT = ROWS_AT + 1500;
const PICK_CURSOR = SCROLL_AT + 1900;
const PICK_CLICK = PICK_CURSOR + 910;
const DONE_AT = PICK_CLICK + 500;

function HotelPage() {
  return (
    <>
      <div className={cx(s.hotelBlock, s.rise)} style={{ "--at": "100ms" } as CssVars}>
        <div className={s.hotelCard}>
          <div className={s.photo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTO_FRONT} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PHOTO_POOL}
              alt=""
              className={s.photoNext}
              style={{ "--done": `${PHOTO_CLICK + 60}ms` } as CssVars}
            />
            <span className={s.photoNav}>
              <span className={s.photoArrow}>
                <LuChevronLeft aria-hidden />
              </span>
              <span
                className={cx(s.photoArrow, f.pressable)}
                style={{ "--press": `${PHOTO_CLICK}ms` } as CssVars}
              >
                <LuChevronRight aria-hidden />
                <Cursor at={PHOTO_CURSOR} from="-3.5rem, 2rem" />
              </span>
            </span>
          </div>

          <div className={s.hotelInfo}>
            <span className={s.hotelName}>
              <b>{HOTEL}</b>
              <span className={s.stars}>★★★★★</span>
            </span>
            <span className={s.amenities}>
              {AMENITIES.map((a) => {
                const Icon = a.icon;
                return (
                  <span key={a.label} className={s.amenity}>
                    <Icon aria-hidden />
                    {a.label}
                  </span>
                );
              })}
              <span className={s.moreLink}>Ver mais</span>
            </span>
          </div>
        </div>

        <div className={s.regimeRow}>
          {REGIMES.map((r, i) => {
            const Icon = r.icon;
            const open = i === OPEN;
            return (
              <div
                key={r.label}
                className={cx(s.regime, s.rise)}
                style={{ "--at": `${300 + i * 120}ms` } as CssVars}
              >
                <span className={s.regimeChip}>
                  <span className={s.regimeIcon}>
                    <Icon aria-hidden />
                  </span>
                  <span>{r.label}</span>
                </span>
                <span className={s.regimeRoom}>{r.room}</span>
                <span className={s.regimePrice}>
                  <b>
                    {r.price}
                    <small>/ pessoa</small>
                  </b>
                  <OperatorLogo id={r.op} />
                </span>
                <span className={s.regimeActions}>
                  <span className={cx(f.btnSoft, s.btnWide)}>Reservar</span>
                  <span
                    className={cx(s.regimeFoot, open && s.regimeFootPress)}
                    style={open ? ({ "--press": `${OPEN_CLICK}ms` } as CssVars) : undefined}
                  >
                    <LuCirclePlus aria-hidden />
                    {r.rooms} quartos neste regime
                    {open ? <Cursor at={OPEN_CURSOR} from="-3rem, -3.5rem" /> : null}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function RoomsModal() {
  const { viewportRef, listRef } = useListScroll();

  return (
    <div className={s.backdrop} style={{ "--at": `${MODAL_AT}ms` } as CssVars}>
      <div className={s.modal}>
        <div className={s.modalHead}>
          <b className={s.modalTitle}>{HOTEL}</b>
          <span className={s.closeBtn}>
            <LuX aria-hidden />
          </span>
        </div>

        <div className={s.modalBody}>
          <div
            ref={viewportRef}
            className={s.modalViewport}
            style={{ "--scroll-at": `${SCROLL_AT}ms` } as CssVars}
          >
            <div ref={listRef} className={s.modalList}>
              {ROOMS.map((r, i) => {
                const picked = i === ROOM_PICK;
                return (
                  <div
                    key={r.op}
                    className={cx(s.roomRow, picked ? s.pick : s.rise)}
                    style={
                      {
                        "--at": `${ROWS_AT + i * 80}ms`,
                        "--pick": `${PICK_CLICK + 80}ms`,
                      } as CssVars
                    }
                  >
                    <b className={s.roomName}>{r.name}</b>
                    <OperatorLogo id={r.op} className={s.roomOp} />
                    <b className={s.roomPrice}>{r.price}</b>
                    <span
                      className={cx(f.btnSoft, s.roomBtn, picked && f.pressable)}
                      style={picked ? ({ "--press": `${PICK_CLICK}ms` } as CssVars) : undefined}
                    >
                      Reservar
                      {picked ? <Cursor at={PICK_CURSOR} from="-5rem, -2.5rem" /> : null}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupedSearchScene() {
  return (
    <>
      <HotelPage />
      <RoomsModal />

      {/* Same confirmation as the orçamento / proposta demos */}
      <div className={cx(s.done, s.doneOverModal)} style={{ "--at": `${DONE_AT}ms` } as CssVars}>
        <span className={s.doneIcon}>
          <LuCheck aria-hidden />
        </span>
        <b>Reserva concluída</b>
        <span className={s.doneText}>
          <LuBedDouble aria-hidden />
          {ROOMS[ROOM_PICK].name} reservado com sucesso
        </span>
      </div>
    </>
  );
}

const SCENES: FlowScene[] = [
  { key: "pesquisa", label: "Pesquisa", icon: LuBed, ms: DONE_AT + 2600, View: GroupedSearchScene },
];

export function PesquisaFlow(props: FlowDemoProps) {
  return (
    <FlowDemo
      scenes={SCENES}
      hideSteps
      hideProgress
      pauseLabel="a demonstração da pesquisa agrupada"
      {...props}
    />
  );
}

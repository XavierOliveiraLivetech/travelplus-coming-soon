"use client";

import {
  LuBedDouble,
  LuCheck,
  LuCreditCard,
  LuDownload,
  LuFileText,
  LuMail,
  LuPlane,
  LuPlaneTakeoff,
  LuSave,
  LuShieldCheck,
  LuX,
} from "react-icons/lu";
import { withBasePath as assetPath } from "@/lib/basePath";
import type { CssVars } from "@/lib/cssVars";
import { cx } from "@/lib/cx";
import { FlowDemo, type FlowDemoProps, type FlowScene } from "./FlowDemo";
import { Cursor, flowStyles as f } from "./kit";
import s from "./scenes.module.css";

/**
 * "Proposta em PDF": the "A sua viagem" page (same as the Landing Page's
 * ToolsMerge card) → the cursor clicks "Guardar orçamento" in the
 * "PDF Gerado" box → the "Guardar orçamento" modal opens → the cursor clicks
 * "Enviar por e-mail" → confirmation that the PDF was sent. One scene.
 */

const HOTEL_PHOTO = assetPath("/flow/hotel-front.jpg?v=2");

const ADDONS = [
  { name: "Seguro intermédio", price: "+100€" },
  { name: "Bagagem de porão 23 kg", price: "+50€" },
  { name: "Transfer privado", price: "+60€" },
] as const;

const PRICE_LINES = [
  { label: "Hotel e voos", value: "2042€" },
  { label: "Seguro", value: "+100€" },
  { label: "Extras", value: "+110€" },
] as const;

/** Timeline (ms from the scene start). A cursor click lands ~910ms after `at`. */
const SAVE_CURSOR = 3600;
const SAVE_PRESS = SAVE_CURSOR + 910;
const MODAL_AT = SAVE_PRESS + 250;
const SEND_CURSOR = MODAL_AT + 800;
const SEND_PRESS = SEND_CURSOR + 910;
const DONE_AT = SEND_PRESS + 400;

function SaveModal() {
  return (
    <div className={cx(s.backdrop, s.saveBackdrop)} style={{ "--at": `${MODAL_AT}ms` } as CssVars}>
      <div className={cx(s.modal, s.saveModal)}>
        <span className={s.saveHead}>
          <b className={s.saveTitle}>Guardar orçamento</b>
          <span className={s.saveClose}>
            <LuX aria-hidden />
          </span>
        </span>
        <span className={s.saveText}>Escolha como pretende guardar ou partilhar o orçamento.</span>
        <span className={s.saveBtn}>
          <LuDownload aria-hidden />
          Descarregar PDF
        </span>
        <span
          className={cx(s.saveBtn, f.pressable)}
          style={{ "--press": `${SEND_PRESS}ms` } as CssVars}
        >
          <LuMail aria-hidden />
          Enviar por e-mail
          <Cursor at={SEND_CURSOR} from="-4rem, 3rem" />
        </span>
      </div>
    </div>
  );
}

function TripScene() {
  return (
    <>
      <div className={s.trip}>
        <ol className={s.timeline}>
          <li className={cx(s.tlItem, s.rise)} style={{ "--at": "200ms" } as CssVars}>
            <span className={s.tlIcon}>
              <LuPlaneTakeoff aria-hidden />
            </span>
            <b className={s.tlTitle}>Voo</b>
            <span className={cx(s.tlBox, s.ticket)}>
              <span className={s.ticketMain}>
                <span className={s.ticketEnd}>
                  <b>LIS</b>
                  <small>07:40</small>
                </span>
                <span className={s.ticketPath}>
                  <small>4h25</small>
                  <i>
                    <LuPlane aria-hidden />
                  </i>
                </span>
                <span className={cx(s.ticketEnd, s.ticketEndRight)}>
                  <b>SID</b>
                  <small>11:05</small>
                </span>
              </span>
              <span className={s.ticketFoot}>
                <span className={s.chipSoft}>Bagagem 23 kg</span>
              </span>
            </span>
          </li>

          <li className={cx(s.tlItem, s.rise)} style={{ "--at": "550ms" } as CssVars}>
            <span className={s.tlIcon}>
              <LuBedDouble aria-hidden />
            </span>
            <b className={s.tlTitle}>Hotel</b>
            <span className={cx(s.tlBox, s.stay)}>
              {/* Same photo as the hotel in the pesquisa agrupada demo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={s.stayPhoto} src={HOTEL_PHOTO} alt="" />
              <span className={s.stayInfo}>
                <b>Hilton Cabo Verde Resort</b>
                <span className={s.stayStars}>★★★★★</span>
                <small>Double Deluxe · Tudo incluído</small>
              </span>
            </span>
          </li>

          <li className={cx(s.tlItem, s.rise)} style={{ "--at": "900ms" } as CssVars}>
            <span className={s.tlIcon}>
              <LuShieldCheck aria-hidden />
            </span>
            <b className={s.tlTitle}>Seguro e extras</b>
            <span className={cx(s.tlBox, s.addons)}>
              {ADDONS.map((a) => (
                <span key={a.name} className={s.addon}>
                  <span>{a.name}</span>
                  <b>{a.price}</b>
                </span>
              ))}
            </span>
          </li>
        </ol>

        <div className={s.aside}>
          <div className={cx(s.asideBox, s.priceBox, s.rise)} style={{ "--at": "1250ms" } as CssVars}>
            <b className={s.boxTitle}>Preço da viagem</b>
            {PRICE_LINES.map((line) => (
              <span key={line.label} className={s.priceLine}>
                <span>{line.label}</span>
                <span>{line.value}</span>
              </span>
            ))}
            <span className={s.priceTotal}>
              <span>Total</span>
              <b>2252€</b>
            </span>
          </div>

          <div className={cx(s.asideBox, s.pdfBox, s.rise)} style={{ "--at": "1600ms" } as CssVars}>
            <span className={s.pdfRow}>
              <span className={s.pdfIcon}>
                <LuFileText aria-hidden />
              </span>
              <span className={s.pdfText}>
                <b>PDF Gerado</b>
                <small>Proposta_Sal.pdf · 3 páginas</small>
              </span>
            </span>
            <span className={s.pdfActions}>
              <span
                className={cx(s.softBtn, f.pressable)}
                style={{ "--press": `${SAVE_PRESS}ms` } as CssVars}
              >
                <LuSave aria-hidden />
                Guardar orçamento
                <Cursor at={SAVE_CURSOR} from="-5rem, 4.5rem" />
              </span>
            </span>
          </div>

          <span className={cx(f.btnPrimary, s.payBtn, s.rise)} style={{ "--at": "1950ms" } as CssVars}>
            <LuCreditCard aria-hidden />
            Efetuar pagamento
          </span>
        </div>
      </div>

      <SaveModal />

      {/* Same confirmation as the orçamento demo's "Reserva confirmada" */}
      <div className={cx(s.done, s.doneOverModal)} style={{ "--at": `${DONE_AT}ms` } as CssVars}>
        <span className={s.doneIcon}>
          <LuCheck aria-hidden />
        </span>
        <b>Orçamento enviado</b>
        <span className={s.doneText}>
          <LuFileText aria-hidden />
          PDF enviado por e-mail com sucesso
        </span>
      </div>
    </>
  );
}

const SCENES: FlowScene[] = [
  { key: "trip", label: "Resumo", icon: LuFileText, ms: DONE_AT + 2600, View: TripScene },
];

export function PropostaFlow(props: FlowDemoProps) {
  return (
    <FlowDemo
      scenes={SCENES}
      hideSteps
      pauseLabel="a demonstração da proposta em PDF"
      {...props}
    />
  );
}

"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import {
  LuCalendarDays,
  LuCheck,
  LuCreditCard,
  LuGift,
  LuLayers,
  LuSearch,
  LuShieldCheck,
  LuUser,
  LuUsers,
} from "react-icons/lu";
import type { CssVars } from "@/lib/cssVars";
import { cx } from "@/lib/cx";
import { FlowDemo, type FlowDemoProps, type FlowScene } from "./FlowDemo";
import {
  Cursor,
  FIELD_GAP,
  Field,
  OPERATORS,
  OP_BY_ID,
  type OperatorId,
  OperatorLogo,
  Typed,
  focusVars,
  flowStyles as styles,
  typingMs,
  useListScroll,
} from "./kit";

/**
 * "Orçamento pronto em 3 minutos" (same demo as the Landing Page hero / CTA):
 * search across operators → pick a result → insurance/extras → passengers → payment.
 */

/** One room per operator, cheapest first (like the real results page). */
const RESULTS: {
  title: string;
  op: OperatorId;
  total: string;
}[] = [
  { title: "Deluxe", op: "newblue", total: "2042€" },
  { title: "Standard", op: "soltour", total: "2168€" },
  { title: "Superior", op: "solferias", total: "2258€" },
  { title: "Deluxe", op: "soltropico", total: "2380€" },
  { title: "Duplo", op: "viajartours", total: "2524€" },
  { title: "Vista Mar", op: "tui", total: "2596€" },
  { title: "Suite", op: "travelplan", total: "2690€" },
];

const PICKED = OP_BY_ID[RESULTS[0].op].name;

/** Prices already cover both passengers, so no "/pessoa" maths on screen. */
const INSURANCES = [
  { name: "Básico", price: "+70€" },
  { name: "Médio", price: "+100€" },
  { name: "Total", price: "+200€" },
] as const;

/** Index of the insurance the cursor picks (+100€ for both passengers). */
const INSURANCE_PICK = 1;
const BASE_TOTAL = "2042€";

/**
 * Optional extras the cursor ticks one by one. `check` = when the box turns
 * on. A single cursor ticks them in turn (see EXTRAS_CURSOR and
 * `.cursorChain` — timings must stay in sync).
 */
const EXTRAS = [
  { name: "Transfer privado", price: "+60€", check: 4050 },
  { name: "Mala 23 kg", price: "+50€", check: 5400 },
] as const;

/** The one cursor that ticks both optional extras without leaving. */
const EXTRAS_CURSOR = { at: 3150, from: "9rem, -6rem" };

/** Running total in the header: base → +insurance → +each extra. */
const TOTAL_STEPS = [
  { value: BASE_TOTAL, at: 0 },
  { value: "2142€", at: 2350 },
  { value: "2202€", at: 4150 },
  { value: "2252€", at: 5500 },
] as const;

const FINAL_TOTAL = TOTAL_STEPS[TOTAL_STEPS.length - 1].value;

/** Both travellers get filled in, one after the other (`at` = first keystroke). */
const PASSENGERS = [
  { first: "João", last: "Silva", birth: "01/01/1998", at: 400 },
  { first: "Ana", last: "Gomes", birth: "17/03/1999", at: 2000 },
] as const;

const PASSENGER_FIELDS = [
  { key: "first", label: "Nome" },
  { key: "last", label: "Apelido" },
  { key: "birth", label: "Nascimento" },
] as const;

const PAY_METHODS = ["MB WAY", "Multibanco", "Cartão"] as const;

/** Search bar values: already filled in (only the passenger form is typed). */
const SEARCH_FIELDS: { label: string; text: string; icon?: ReactNode }[] = [
  { label: "Destino", text: "Ilha do Sal" },
  { label: "Partida", text: "Lisboa" },
  {
    label: "Data de ida",
    text: "21/01 · 7 noites",
    icon: <LuCalendarDays aria-hidden className={styles.fieldIcon} />,
  },
  { label: "Passageiros", text: "2 adultos" },
];

/** The cursor heads for "Pesquisar" once the operator logos have popped in. */
const SEARCH_CURSOR = 1200;
const SEARCH_PRESS = SEARCH_CURSOR + 650;

function SearchScene() {
  return (
    <>
      <p className={styles.sceneLabel}>Pesquisa de pacotes</p>
      <div className={styles.searchBar}>
        {SEARCH_FIELDS.map((f) => (
          <Field key={f.label} label={f.label} icon={f.icon}>
            {f.text}
          </Field>
        ))}
      </div>
      <div className={styles.connected}>
        <span className={styles.connectedHead}>
          <small>Operadores</small>
          <span className={styles.chipSuccess}>
            <LuCheck aria-hidden />
            Todos
          </span>
        </span>
        <span className={styles.opChips}>
          {OPERATORS.map((op, i) => (
            <span
              key={op.id}
              className={styles.opChip}
              style={{ "--at": `${250 + i * 110}ms` } as CssVars}
            >
              <OperatorLogo id={op.id} />
            </span>
          ))}
        </span>
      </div>
      <div className={styles.searchFoot}>
        <span
          className={styles.searching}
          style={{ "--at": `${SEARCH_PRESS + 150}ms` } as CssVars}
        >
          <i />A pesquisar em {OPERATORS.length} operadores
        </span>
        <span
          className={`${styles.btnPrimary} ${styles.pressable}`}
          style={{ "--press": `${SEARCH_PRESS}ms` } as CssVars}
        >
          Pesquisar
          <Cursor at={SEARCH_CURSOR} from="3.5rem, 3rem" />
        </span>
      </div>
    </>
  );
}

function ResultsScene() {
  const { viewportRef, listRef } = useListScroll();

  return (
    <>
      <div className={styles.resultsHead}>
        <p className={styles.sceneLabel}>Ilha do Sal · 2 adultos</p>
        <span className={styles.resultsCount}>{RESULTS.length} resultados</span>
      </div>
      <div ref={viewportRef} className={styles.resultsViewport}>
        <div ref={listRef} className={styles.results}>
          {RESULTS.map((r, i) => (
            <div
              key={r.op}
              className={`${styles.resultRow} ${i === 0 ? styles.resultPick : ""}`}
              style={{ "--at": `${900 + i * 110}ms` } as CssVars}
            >
              <span className={styles.resultText}>
                <b>{r.title}</b>
              </span>
              <OperatorLogo id={r.op} className={styles.resultOp} />
              <span className={styles.resultPrice}>
                <b>{r.total}</b>
              </span>
              <span
                className={`${styles.btnSoft} ${i === 0 ? styles.pressable : ""}`}
                style={i === 0 ? ({ "--press": "5050ms" } as CssVars) : undefined}
              >
                Reservar
                {i === 0 ? <Cursor at={4150} from="-4rem, 4.5rem" /> : null}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ExtrasScene() {
  const listRef = useRef<HTMLUListElement>(null);

  // Distance between the two checkboxes, so one cursor can hop from the first to the second.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const sync = () => {
      // offsetTop ignores the scene's slide-in transform, unlike getBoundingClientRect.
      const rows = [...list.querySelectorAll<HTMLElement>(`.${styles.extraBox}`)].map(
        (box) => box.closest("li")?.offsetTop ?? 0,
      );
      if (rows.length < 2) return;
      list.style.setProperty("--hop", `${rows[1] - rows[0]}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(list);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div className={styles.bookingHead}>
        <p className={styles.sceneLabel}>
          {RESULTS[0].title} · {PICKED}
        </p>
        <span className={styles.totalSwap}>
          {TOTAL_STEPS.map((step, i) => (
            <span
              key={step.value}
              className={cx(
                styles.totalStep,
                i === 0 && styles.totalFirst,
                i === TOTAL_STEPS.length - 1 && styles.totalLast,
              )}
              style={
                {
                  "--in": `${step.at}ms`,
                  "--out": `${TOTAL_STEPS[i + 1]?.at ?? 0}ms`,
                } as CssVars
              }
            >
              {step.value}
            </span>
          ))}
        </span>
      </div>

      <div className={styles.block}>
        <span className={styles.blockHead}>
          <span className={styles.panelIcon}>
            <LuShieldCheck aria-hidden />
          </span>
          <span className={styles.panelText}>
            <b>Seguro</b>
          </span>
        </span>
        <div className={styles.insurances}>
          {INSURANCES.map((ins, i) => (
            <span
              key={ins.name}
              className={cx(
                styles.insurance,
                i === INSURANCE_PICK && styles.insurancePick,
              )}
              style={{ "--at": `${300 + i * 120}ms` } as CssVars}
            >
              <b>{ins.name}</b>
              <span className={styles.insurancePrice}>{ins.price}</span>
              <span
                className={cx(
                  styles.insuranceBtn,
                  i === INSURANCE_PICK && styles.pressable,
                )}
                style={
                  i === INSURANCE_PICK ? ({ "--press": "2150ms" } as CssVars) : undefined
                }
              >
                <span className={styles.btnIdle}>Escolher</span>
                {i === INSURANCE_PICK ? (
                  <span className={styles.btnDone}>
                    <LuCheck aria-hidden />
                    Escolhido
                  </span>
                ) : null}
                {i === INSURANCE_PICK ? (
                  <Cursor at={1250} from="3rem, 3.5rem" />
                ) : null}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.block}>
        <span className={styles.blockHead}>
          <span className={styles.panelIcon}>
            <LuGift aria-hidden />
          </span>
          <span className={styles.panelText}>
            <b>Extras</b>
          </span>
        </span>
        <ul ref={listRef} className={styles.extrasList}>
          {EXTRAS.map((ex, i) => (
            <li
              key={ex.name}
              className={cx(styles.extraRow, i === 0 && styles.extraRowLead)}
              style={
                {
                  "--at": `${650 + i * 120}ms`,
                  "--check": `${ex.check}ms`,
                } as CssVars
              }
            >
              <span className={styles.extraBox}>
                <LuCheck aria-hidden />
                {i === 0 ? (
                  <Cursor at={EXTRAS_CURSOR.at} from={EXTRAS_CURSOR.from} chain />
                ) : null}
              </span>
              <span className={styles.extraText}>
                <b>{ex.name}</b>
              </span>
              <span className={styles.extraPrice}>{ex.price}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.sceneFoot}>
        <span
          className={`${styles.btnPrimary} ${styles.pressable}`}
          style={{ "--press": "6700ms" } as CssVars}
        >
          Continuar
          <Cursor at={5850} from="-4rem, -3rem" />
        </span>
      </div>
    </>
  );
}

function PassengersScene() {
  return (
    <>
      <div className={styles.bookingHead}>
        <p className={styles.sceneLabel}>Passageiros</p>
        <span className={styles.bookingTotal}>{FINAL_TOTAL}</span>
      </div>

      {PASSENGERS.map((pax, p) => {
        let at = pax.at;
        return (
        <div key={pax.first} className={styles.block}>
          <span className={styles.blockHead}>
            <span className={styles.panelIcon}>
              <LuUser aria-hidden />
            </span>
            <span className={styles.panelText}>
              <b>Passageiro {p + 1}</b>
            </span>
          </span>
          <div className={styles.passengerFields}>
            {PASSENGER_FIELDS.map((field) => {
              const text = pax[field.key];
              const fieldAt = at;
              at += typingMs(text) + FIELD_GAP;
              return (
                <span
                  key={field.label}
                  className={styles.input}
                  style={focusVars(text, fieldAt)}
                >
                  <small>{field.label}</small>
                  <Typed text={text} at={fieldAt} />
                </span>
              );
            })}
          </div>
        </div>
        );
      })}

      <div className={styles.sceneFoot}>
        <span
          className={`${styles.btnPrimary} ${styles.pressable}`}
          style={{ "--press": "4100ms" } as CssVars}
        >
          Continuar
          <Cursor at={3300} from="-3rem, 2.5rem" />
        </span>
      </div>
    </>
  );
}

function PaymentScene() {
  return (
    <>
      <div className={styles.paySummary} style={{ "--at": "80ms" } as CssVars}>
        <span className={styles.paySummaryHead}>
          <span className={styles.paySummaryTrip}>
            <b>{RESULTS[0].title} · Ilha do Sal</b>
          </span>
          <OperatorLogo id={RESULTS[0].op} className={styles.paySummaryOp} />
        </span>
        <span className={styles.paySummaryLine}>
          <span>Voo + hotel</span>
          <span>{BASE_TOTAL}</span>
        </span>
        <span className={styles.paySummaryLine}>
          <span>Seguro</span>
          <span>+100€</span>
        </span>
        <span className={styles.paySummaryLine}>
          <span>Extras</span>
          <span>+110€</span>
        </span>
      </div>

      <p className={styles.sceneLabel}>Pagamento</p>
      <div className={styles.methods}>
        {PAY_METHODS.map((name, i) => (
          <span
            key={name}
            className={`${styles.method} ${i === 0 ? styles.methodPick : ""}`}
            style={{ "--at": `${100 + i * 140}ms` } as CssVars}
          >
            <span className={styles.radio}>
              {i === 0 ? <Cursor at={500} from="4rem, 3.5rem" /> : null}
            </span>
            {name}
          </span>
        ))}
      </div>

      <div className={styles.payFoot}>
        <span className={styles.payTotal}>
          <small>Total</small>
          <b>{FINAL_TOTAL}</b>
        </span>
        <span
          className={`${styles.btnPrimary} ${styles.pressable}`}
          style={{ "--press": "2700ms" } as CssVars}
        >
          Confirmar
          <Cursor at={1800} from="-6rem, -3.5rem" />
        </span>
      </div>

      <div className={styles.success}>
        <span className={styles.successIcon}>
          <LuCheck aria-hidden />
        </span>
        <b>Reserva confirmada</b>
      </div>
    </>
  );
}

const SCENES: FlowScene[] = [
  { key: "search", label: "Pesquisa", icon: LuSearch, ms: 3400, View: SearchScene },
  { key: "results", label: "Operadores", icon: LuLayers, ms: 6200, View: ResultsScene },
  { key: "extras", label: "Extras", icon: LuShieldCheck, ms: 7800, View: ExtrasScene },
  { key: "passengers", label: "Passageiros", icon: LuUsers, ms: 5000, View: PassengersScene },
  { key: "payment", label: "Pagamento", icon: LuCreditCard, ms: 5600, View: PaymentScene },
];

export function PlatformFlow(props: FlowDemoProps) {
  return <FlowDemo scenes={SCENES} reducedScene={1} {...props} />;
}

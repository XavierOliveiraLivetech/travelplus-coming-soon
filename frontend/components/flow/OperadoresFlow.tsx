"use client";

import { LuLayers } from "react-icons/lu";
import type { CssVars } from "@/lib/cssVars";
import { cx } from "@/lib/cx";
import { FlowDemo, type FlowDemoProps, type FlowScene } from "./FlowDemo";
import { OPERATORS, OperatorLogo, flowStyles as f } from "./kit";
import s from "./scenes.module.css";

/** "Operadores integrados": the operators' logos, popping in one by one. */

function LogosScene() {
  return (
    <>
      <p className={f.sceneLabel}>Operadores integrados</p>
      <div className={s.opGrid}>
        {OPERATORS.map((op, i) => (
          <div
            key={op.id}
            className={cx(s.opTile, s.rise)}
            style={{ "--at": `${150 + i * 140}ms` } as CssVars}
          >
            <OperatorLogo id={op.id} className={s.opTileLogo} />
          </div>
        ))}
      </div>
    </>
  );
}

const SCENES: FlowScene[] = [
  { key: "logos", label: "Operadores", icon: LuLayers, ms: 5000, View: LogosScene },
];

export function OperadoresFlow(props: FlowDemoProps) {
  return (
    <FlowDemo
      scenes={SCENES}
      hideSteps
      pauseLabel="a demonstração dos operadores integrados"
      {...props}
    />
  );
}

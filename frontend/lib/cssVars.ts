import type { CSSProperties } from "react";

/** Inline style that may also set CSS custom properties (`--name`). */
export type CssVars = CSSProperties & Record<`--${string}`, string | number>;

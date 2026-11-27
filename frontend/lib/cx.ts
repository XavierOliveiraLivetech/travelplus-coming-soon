/** Joins the truthy class names: cx(styles.a, on && styles.b) → "a b". */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

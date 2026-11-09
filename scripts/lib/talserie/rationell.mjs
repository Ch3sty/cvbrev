// scripts/lib/talserie/rationell.mjs
// Exakta bråk för talseriernas lösare (TS1). Talen i serierna är små
// heltal (högst fyra tecken), så täljare och nämnare ryms i vanliga tal.

const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

/** Bråket n/d förkortat, nämnaren positiv. Null om d är 0. */
export function q(n, d = 1) {
  if (d === 0) return null;
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}
export const add = (a, b) => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a, b) => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a, b) => q(a.n * b.n, a.d * b.d);
export const div = (a, b) => (b.n === 0 ? null : q(a.n * b.d, a.d * b.n));
export const eq = (a, b) => a.n === b.n && a.d === b.d;
export const arHeltal = (a) => a.d === 1;
export const tal = (a) => a.n / a.d;

// Svensk talform för siffror som ritas i diagrammen: decimalkomma, mellanslag
// som tusentalsavgränsare och mellanslag före enheten ("18,5 %", "1 450 kr").
// Alternativen i frågorna skrivs på samma sätt, så kandidaten ska kunna
// jämföra diagrammet och svaret tecken för tecken.

const TAL = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 });

/** 18.5 -> "18,5", 1450 -> "1 450" (hårt mellanslag). */
export function formatTal(varde: number): string {
  return TAL.format(varde);
}

/** Värdet med enheten efter ett hårt mellanslag. Enheten trimmas (" MSEK" -> "MSEK"). */
export function medEnhet(varde: number, enhet?: string): string {
  const e = (enhet ?? '').trim();
  return e ? `${formatTal(varde)} ${e}` : formatTal(varde);
}

/** Axelns skalsteg: avrundat till heltal eller en decimal, i svensk form. */
export function formatSkalsteg(varde: number, decimaler: number): string {
  return formatTal(Number(varde.toFixed(decimaler)));
}

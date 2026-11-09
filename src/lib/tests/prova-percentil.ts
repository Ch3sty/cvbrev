/**
 * Percentilraden i provet utan konto ("Bland de 30 procent som löser flest").
 *
 * Ägarens beslut 2026-11-09: raden räknas bara på provets egna utfall, med
 * minst 200 avslutade prov och ägaren och testkontona undantagna. Annars
 * döljs den helt. Talet får aldrig vara påhittat. Den gamla trappan
 * (roughPercentile, 75 för fyra rätt och så vidare) är borttagen.
 *
 * Ren funktion, så att regeln går att testa utan databas. Hämtningen ligger i
 * prova-percentil.server.ts.
 */

/** Minsta antal avslutade prov innan raden visas. */
export const PERCENTIL_MIN_PROV = 200

/**
 * Raden visas bara för den som hamnar i övre halvan. "Bland de 85 procent
 * som löser flest" säger inget och läses som ett fel.
 */
export const PERCENTIL_MAX_ANDEL = 50

/**
 * Andelen avslutade prov med lika många rätt eller fler, i procent och
 * avrundad uppåt till närmaste fem. Avrundningen går uppåt eftersom "bland
 * de N procent" är en övre gräns: talet blir aldrig smickrande fel.
 *
 * Null när underlaget är för litet, när resultatet hamnar i nedre halvan
 * eller när indata inte går ihop.
 */
export function andelSomLoserFlest(
  score: number,
  utfall: readonly number[],
  min: number = PERCENTIL_MIN_PROV
): number | null {
  if (!Number.isInteger(score) || score < 0) return null
  const giltiga = utfall.filter((s) => Number.isInteger(s) && s >= 0)
  if (giltiga.length < min) return null
  const minstLika = giltiga.filter((s) => s >= score).length
  if (minstLika === 0) return null
  const andel = Math.ceil(((minstLika / giltiga.length) * 100) / 5) * 5
  const begransad = Math.max(5, Math.min(100, andel))
  return begransad <= PERCENTIL_MAX_ANDEL ? begransad : null
}

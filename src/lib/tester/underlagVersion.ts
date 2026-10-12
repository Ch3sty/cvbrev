/**
 * Underlagsversionen för verbalt och numeriskt (grund och avancerad).
 *
 * Urvalet av texter och underlag räknas om ur sessionens id och poolens
 * storlek, så en större pool skulle byta texter i gamla sessioners
 * genomgång. Därför samma lösning som matrisernas bankversion:
 * - sessioner utan meta.underlag_version (version 1) drar ur de frysta
 *   bankerna (questionBank.json) som förut;
 * - nya sessioner får meta.underlag_version: 2 och drar ur bankerna plus
 *   parti 02 (underlagParti02.json, granskat 2026-10-12).
 * Provet och övningsprovet läser bara de frysta bankerna och påverkas inte.
 * Rättningen hittar alla underlag oavsett version.
 *
 * Filen är ren och får importeras av både server och klient.
 */
export type UnderlagVersion = 1 | 2

/** Versionen nya verbala och numeriska sessioner får. */
export const UNDERLAG_VERSION: UnderlagVersion = 2

export function underlagsVersion(meta: unknown): UnderlagVersion {
  return !!meta && typeof meta === 'object' && (meta as Record<string, unknown>).underlag_version === 2 ? 2 : 1
}

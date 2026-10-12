/**
 * Underlagsversionen för verbalt och numeriskt.
 *
 * Urvalet av texter och underlag räknas om ur sessionens id och poolens
 * storlek, så en större pool skulle byta texter i gamla sessioners
 * genomgång. Därför samma lösning som matrisernas bankversion:
 * - sessioner utan meta.underlag_version (version 1) drar ur de frysta
 *   bankerna (questionBank.json) som förut;
 * - version 2: bankerna plus parti 02 (underlagParti02.json, granskat
 *   2026-10-12), bara grund och avancerad;
 * - version 3: bankerna plus parti 02 plus parti 03 (underlagParti03.json:
 *   verbalt avancerad parti 01, numeriskt avancerad parti 01, och efter
 *   granskningen parti 03 i numeriskt grund och avancerad och verbalt
 *   expert). Gäller också expert, provet och övningsprovet.
 * - version 4: version 3 plus verbalt parti 04 (underlagParti04.json i
 *   verbalTestV1 och verbalTestV2, beställning omgång 3 B2): texter med två
 *   påståenden av samma typ, så att det riktade textpasset blir riktat.
 *   Numeriskt och verbalt expert är oförändrade mot version 3.
 * Rättningen hittar alla underlag oavsett version.
 *
 * Filen är ren och får importeras av både server och klient.
 */
export type UnderlagVersion = 1 | 2 | 3 | 4

/** Versionen nya verbala och numeriska sessioner får. */
export const UNDERLAG_VERSION: UnderlagVersion = 4

export function underlagsVersion(meta: unknown): UnderlagVersion {
  const v = !!meta && typeof meta === 'object' ? (meta as Record<string, unknown>).underlag_version : null
  return v === 2 || v === 3 || v === 4 ? v : 1
}

/** Meta för nya sessioner. */
export const UNDERLAG_META = { underlag_version: UNDERLAG_VERSION } as const

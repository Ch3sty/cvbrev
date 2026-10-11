/**
 * Din utveckling (skiss Provbladet v3, avsnitt 2). Serverfunktionerna ligger
 * i ./data.server.ts och importeras direkt därifrån, aldrig via den här filen.
 */
export { default, default as DinUtveckling, harUtveckling, type DinUtvecklingProps } from './DinUtveckling'
export type { DinUtvecklingData, UtvecklingKurva, UtvecklingTempo, VarDuStarNiva } from './typer'
export { kurvaUrStatus } from './berakna'

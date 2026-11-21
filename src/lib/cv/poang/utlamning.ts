/**
 * Det enda sättet ett sparat analysresultat lämnar servern.
 *
 * Alla vägar (analysjobbets svar, den återupptagna analysen ?job=, Mina CV)
 * går hit, så att gratisnivån ser exakt samma sak oavsett väg: poängen,
 * profilförslaget och det tyngsta fyndet med åtgärd, övriga fynd som rubriker
 * utan åtgärdstext (gateAnalysisResult). Talen räknas med poängmodellen före
 * filtreringen (så att det tyngsta fyndet är det med störst verkligt plus).
 * Poängen och "med våra förslag" är desamma för alla (steg 4, skissen
 * Analys och Ditt CV): de är tal, inte åtgärder. Det gratisnivån inte får är
 * texten bakom de låsta fynden.
 *
 * Klientsäker, men tänkt för servern: filtreringen sker aldrig på klienten.
 */
import { gateAnalysisResult } from '../gateAnalysisResult'
import { poangsattAnalys, type CvRad } from './forslag'
import { antalFynd } from './fynd'

type Obj = Record<string, unknown>

/**
 * fyndAntal: alla fynd, öppna och låsta, räknade som Analys-sidan räknar dem
 * (fynd.ts). Ett tal, ingen åtgärd: flödets "Vi hittade ..." säger samma sak
 * som sidan också för gratisnivån.
 */
export function analysForKlient(result: Obj, cvRad: CvRad | null | undefined, harFullAnalys: boolean): Obj {
  const poangsatt = poangsattAnalys(result, cvRad)
  const fyndAntal = antalFynd(poangsatt)
  if (harFullAnalys) return { ...poangsatt, fyndAntal }
  // gateAnalysisResult släpper igenom poang (hela analysens tal).
  return { ...(gateAnalysisResult(poangsatt, false) as Obj), fyndAntal }
}

/**
 * Det enda sättet ett sparat analysresultat lämnar servern.
 *
 * Alla vägar (analysjobbets svar, den återupptagna analysen ?job=, Mina CV)
 * går hit, så att gratisnivån ser exakt samma sak oavsett väg: poängen,
 * profilförslaget och det tyngsta fyndet med åtgärd, övriga fynd som rubriker
 * utan åtgärdstext (gateAnalysisResult). Talen räknas med poängmodellen före
 * filtreringen (så att det tyngsta fyndet är det med störst verkligt plus)
 * och potentialen räknas om efteråt på det hon faktiskt ser.
 *
 * Klientsäker, men tänkt för servern: filtreringen sker aldrig på klienten.
 */
import { gateAnalysisResult } from '../gateAnalysisResult'
import { medSammanfattning, poangsattAnalys, type CvRad } from './forslag'

type Obj = Record<string, unknown>

export function analysForKlient(result: Obj, cvRad: CvRad | null | undefined, harFullAnalys: boolean): Obj {
  const poangsatt = poangsattAnalys(result, cvRad)
  if (harFullAnalys) return poangsatt
  const filtrerat = gateAnalysisResult(poangsatt, false) as Obj
  return medSammanfattning(filtrerat)
}

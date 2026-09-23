/**
 * Felrekryteringens kostnad, samma antaganden som räkneexemplet i insikten
 * "Vad kostar en felrekrytering?": arbetsgivarkostnad ~1,42x bruttolön, halv
 * produktivitet fram till avslut, produktionsbortfall/teampåverkan och
 * omrekrytering skalade mot lönenivån.
 *
 * Används av kalkylatorn på /rakna-ut/felrekrytering och av MDX-komponenten
 * i insikten, så att båda räknar exakt lika.
 */
import { heltalMellan, type Parametrar, type Sok } from './sok'
import { kr } from './format'
import type { Sammanfattning } from './typer'

export const BAS_LON = 40_000 // referenslönen i artikelns räkneexempel
export const ARBETSGIVARFAKTOR = 1.42
export const DIREKTA_KOSTNADER = 90_000 // annons, tester, ~30 h intern tid
export const BAS_PRODUKTIONSBORTFALL = 150_000 // vid baslön och 10 månader
export const BAS_OMREKRYTERING = 200_000 // vid baslön

export const LON_MIN = 25_000
export const LON_MAX = 90_000
export const MAN_MIN = 4
export const MAN_MAX = 18

export interface FelrekIndata {
  manadslon: number
  manader: number
}

export const FELREK_STANDARD: FelrekIndata = { manadslon: 40_000, manader: 10 }

/** Avrundat till närmaste tusental, som i insikten. */
export function krTusen(n: number): string {
  return kr(Math.round(n / 1000) * 1000)
}

export function lasFelrek(sok: Sok): FelrekIndata {
  const d = { ...FELREK_STANDARD }
  const lon = heltalMellan(sok, 'lon', LON_MIN, LON_MAX)
  if (lon !== null) d.manadslon = lon
  const man = heltalMellan(sok, 'man', MAN_MIN, MAN_MAX)
  if (man !== null) d.manader = man
  return d
}

export function felrekParametrar(d: FelrekIndata): Parametrar {
  return { lon: String(d.manadslon), man: String(d.manader) }
}

export interface FelrekResultat {
  direkta: number
  improduktivLon: number
  produktionsbortfall: number
  omrekrytering: number
  total: number
}

export function beraknaFelrek(d: FelrekIndata): FelrekResultat {
  const lonefaktor = d.manadslon / BAS_LON
  const arbetsgivarkostnad = d.manadslon * ARBETSGIVARFAKTOR
  const improduktivLon = arbetsgivarkostnad * d.manader * 0.5
  const produktionsbortfall = BAS_PRODUKTIONSBORTFALL * lonefaktor * (d.manader / 10)
  const omrekrytering = BAS_OMREKRYTERING * lonefaktor
  const total = DIREKTA_KOSTNADER + improduktivLon + produktionsbortfall + omrekrytering
  return { direkta: DIREKTA_KOSTNADER, improduktivLon, produktionsbortfall, omrekrytering, total }
}

export const FELREK_KALLA = 'Jobbcoachs insikt om felrekryteringens kostnad, med samtliga källor'

export function sammanfattaFelrek(d: FelrekIndata, r: FelrekResultat): Sammanfattning {
  return {
    namn: 'Felrekryteringens kostnad',
    tal: krTusen(r.total),
    enhet: 'för en felrekrytering',
    rad: `${kr(d.manadslon)} i månadslön, avslut efter ${d.manader} månader`,
    kalla: FELREK_KALLA,
  }
}

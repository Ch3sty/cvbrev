/**
 * Konvertering timlön <-> månadslön med schablonen 174 timmar per månad
 * (40-timmarsvecka: 40 x 52 / 12 = 173,33, avrundat till 174 enligt
 * branschpraxis). Timmarna är justerbara för andra tjänstgöringsgrader.
 */
import { hamta, type Parametrar, type Sok } from './sok'
import { decimal, kr } from './format'
import type { Sammanfattning } from './typer'

export type TimlonRiktning = 'tillManad' | 'tillTim'

export interface TimlonIndata {
  riktning: TimlonRiktning
  /** Beloppet som användaren skrev det: "180" eller "180,50". */
  belopp: string
  timmar: string
}

export const TIMLON_STANDARD: TimlonIndata = { riktning: 'tillManad', belopp: '180', timmar: '174' }

/** Förvalt belopp när riktningen byts, samma som förut. */
export const TIMLON_FORVAL: Record<TimlonRiktning, string> = { tillManad: '180', tillTim: '31000' }

const DECIMALTAL = /^\d+([,.]\d{1,2})?$/

export function lasTimlon(sok: Sok): TimlonIndata {
  const d = { ...TIMLON_STANDARD }
  if (hamta(sok, 'riktning') === 'tim') {
    d.riktning = 'tillTim'
    d.belopp = TIMLON_FORVAL.tillTim
  }
  const b = hamta(sok, 'belopp')
  if (b && DECIMALTAL.test(b)) d.belopp = b
  const t = hamta(sok, 'timmar')
  if (t && DECIMALTAL.test(t)) d.timmar = t
  return d
}

/** `belopp` står alltid med: den är nyckeln som gör en delad länk till en delad vy. */
export function timlonParametrar(d: TimlonIndata): Parametrar {
  return {
    riktning: d.riktning === 'tillTim' ? 'tim' : 'manad',
    belopp: d.belopp.replace(/\s/g, '') || '0',
    timmar: d.timmar !== '174' ? d.timmar : null,
  }
}

export interface TimlonResultat {
  beloppNum: number
  timmarNum: number
  resultat: number
  arslon: number
}

export function beraknaTimlon(d: TimlonIndata): TimlonResultat {
  const beloppNum = Math.max(0, parseFloat(d.belopp.replace(/\s/g, '').replace(',', '.')) || 0)
  const timmarNum = Math.max(1, parseFloat(d.timmar.replace(',', '.')) || 174)
  const resultat = d.riktning === 'tillManad' ? beloppNum * timmarNum : beloppNum / timmarNum
  const arslon = d.riktning === 'tillManad' ? resultat * 12 : beloppNum * 12
  return { beloppNum, timmarNum, resultat, arslon }
}

export const TIMLON_KALLA = 'Schablonen 174 timmar i månaden, heltid med 40-timmarsvecka'

export function sammanfattaTimlon(d: TimlonIndata, r: TimlonResultat): Sammanfattning {
  const timmar = decimal(r.timmarNum, r.timmarNum % 1 === 0 ? 0 : 1)
  if (d.riktning === 'tillTim') {
    return {
      namn: 'Månadslön till timlön',
      tal: `${decimal(r.resultat, 2)} kr`,
      enhet: 'i timlön',
      rad: `${kr(r.beloppNum)} i månaden på ${timmar} timmar, ${kr(r.arslon)} om året`,
      kalla: TIMLON_KALLA,
    }
  }
  return {
    namn: 'Timlön till månadslön',
    tal: kr(r.resultat),
    enhet: 'i månadslön',
    rad: `${decimal(r.beloppNum, r.beloppNum % 1 === 0 ? 0 : 2)} kr i timmen på ${timmar} timmar, ${kr(r.arslon)} om året`,
    kalla: TIMLON_KALLA,
  }
}

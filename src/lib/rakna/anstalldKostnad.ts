/**
 * Vad kostar en anställd 2026. Arbetsgivaravgift 31,42 % (20,81 % på lönedelar
 * upp till 25 000 kr/mån för den som fyllt 18 men inte 23 år, ersättningar
 * utbetalda apr 2026-sep 2027). Kollektivavtal tjänstemän (ITP1 enligt
 * Avtalat): ålderspension 4,5 % av lön upp till 52 125 kr/mån (7,5
 * inkomstbasbelopp) och 30 % däröver, försäkringar (TGL, TFA, TRR,
 * sjukförsäkring) schablonerade till 0,4 %, särskild löneskatt 24,26 % på
 * pensionspremier. Semestertillägg 0,43 % per dag enligt semesterlagen.
 */
import { hamta, heltal, type Parametrar, type Sok } from './sok'
import { decimal, kr } from './format'
import type { Sammanfattning } from './typer'

const AGA = 0.3142
const AGA_UNG = 0.2081
const UNG_TAK = 25000
const ITP_GRANS = 52125
const ITP_LAG = 0.045
const ITP_HOG = 0.3
const FORSAKRINGAR = 0.004
const SLP = 0.2426
const TILLAGG_PER_DAG = 0.0043

export interface AnstalldIndata {
  lon: number
  dagar: number
  ung: boolean
  avtal: boolean
}

export const ANSTALLD_STANDARD: AnstalldIndata = { lon: 38000, dagar: 25, ung: false, avtal: true }

export function lasAnstalld(sok: Sok): AnstalldIndata {
  const d = { ...ANSTALLD_STANDARD }
  const lon = heltal(sok, 'lon')
  if (lon !== null) d.lon = lon
  const dagar = heltal(sok, 'dagar')
  if (dagar !== null) d.dagar = dagar
  if (hamta(sok, 'ung') === '1') d.ung = true
  if (hamta(sok, 'avtal') === '0') d.avtal = false
  return d
}

export function anstalldParametrar(d: AnstalldIndata): Parametrar {
  return {
    lon: String(d.lon),
    dagar: d.dagar !== 25 ? String(d.dagar) : null,
    ung: d.ung ? '1' : null,
    avtal: d.avtal ? null : '0',
  }
}

export interface AnstalldResultat {
  semestertillagg: number
  aga: number
  pension: number
  slp: number
  forsakringar: number
  total: number
  /** Totalkostnaden delad med bruttolönen. */
  faktor: number
}

export function beraknaAnstalld(d: AnstalldIndata): AnstalldResultat {
  const lonNum = Math.max(0, d.lon)
  const dagarNum = Math.max(0, d.dagar)
  const semestertillagg = (lonNum * TILLAGG_PER_DAG * dagarNum) / 12
  const lonebas = lonNum + semestertillagg
  const aga = d.ung
    ? Math.min(lonebas, UNG_TAK) * AGA_UNG + Math.max(0, lonebas - UNG_TAK) * AGA
    : lonebas * AGA
  const pension = d.avtal ? Math.min(lonNum, ITP_GRANS) * ITP_LAG + Math.max(0, lonNum - ITP_GRANS) * ITP_HOG : 0
  const slp = pension * SLP
  const forsakringar = d.avtal ? lonNum * FORSAKRINGAR : 0
  const total = lonebas + aga + pension + slp + forsakringar
  return { semestertillagg, aga, pension, slp, forsakringar, total, faktor: lonNum > 0 ? total / lonNum : 0 }
}

export const ANSTALLD_KALLA = 'Skatteverkets arbetsgivaravgifter 2026 och Avtalats premier för ITP1'

export function sammanfattaAnstalld(d: AnstalldIndata, r: AnstalldResultat): Sammanfattning {
  return {
    namn: 'Vad kostar en anställd?',
    tal: kr(r.total),
    enhet: 'i månaden för arbetsgivaren',
    rad: `${kr(d.lon)} i lön, ${decimal(r.faktor, 2)} gånger bruttolönen, ${kr(r.total * 12)} om året`,
    kalla: ANSTALLD_KALLA,
  }
}

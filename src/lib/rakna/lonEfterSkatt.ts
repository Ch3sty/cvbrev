/**
 * Lön efter skatt 2026. Bygger på Skatteverkets skattetabeller för månadslön
 * (kolumn 1 för den som inte fyllt 66, kolumn 3 för den som fyllt 66) och
 * Skatteverkets öppna data över kommunala skattesatser. Tabellnummer = summan
 * av skattesatserna (inkl. begravningsavgift och ev. kyrkoavgift) avrundad
 * till hel procent. Över tabellens tak (80 000 kr) extrapoleras med tabellens
 * toppmarginal. Preliminärskatt enligt tabell, inte slutlig skatt.
 *
 * Tabellerna (122 kB) skickas in som argument: servern importerar dem direkt,
 * klienten laddar dem efter första renderingen.
 */
import kommunerData from '@/data/kommunalskatt-2026.json'
import { hamta, heltal, type Parametrar, type Sok } from './sok'
import { decimal, kr, krTecken, tal } from './format'
import type { Sammanfattning } from './typer'

export type Kommun = { namn: string; summa: number; begr: number; kyrka: number }
export type Tabell = { max: number; rows: [number, number, number][] }
export type Tabeller = Record<string, Tabell>

export const KOMMUNER = kommunerData as Kommun[]

export interface LonIndata {
  lon: number
  kommun: string
  kyrka: boolean
  a66: boolean
  jamfor: boolean
  jlon: number
  jkommun: string
}

export const LON_STANDARD: LonIndata = {
  lon: 35000,
  kommun: 'Stockholm',
  kyrka: false,
  a66: false,
  jamfor: false,
  jlon: 38000,
  jkommun: 'Stockholm',
}

export function hittaKommun(namn: string | null): Kommun | null {
  if (!namn) return null
  return KOMMUNER.find((k) => k.namn.toLowerCase() === namn.toLowerCase()) ?? null
}

export function tabellNr(k: Kommun, medlem: boolean): number {
  const summa = k.summa + k.begr + (medlem ? k.kyrka : 0)
  return Math.min(42, Math.max(29, Math.round(summa)))
}

export function raknaSkatt(lon: number, tabellnr: number, over66: boolean, tabeller: Tabeller): number {
  const tabell = tabeller[String(tabellnr)]
  if (!tabell || lon <= 0) return 0
  const kolIdx = over66 ? 2 : 1
  const rows = tabell.rows
  if (lon > tabell.max) {
    const sista = rows[rows.length - 1]
    const nastSista = rows[rows.length - 2]
    const marginal = (sista[kolIdx] - nastSista[kolIdx]) / (sista[0] - nastSista[0])
    return sista[kolIdx] + Math.round(marginal * (lon - tabell.max))
  }
  let skatt = 0
  for (let i = rows.length - 1; i >= 0; i--) {
    if (lon >= rows[i][0]) {
      skatt = rows[i][kolIdx]
      break
    }
  }
  return skatt
}

export function lasLon(sok: Sok): LonIndata {
  const d = { ...LON_STANDARD }
  const lon = heltal(sok, 'lon')
  if (lon !== null) d.lon = lon
  const k = hittaKommun(hamta(sok, 'kommun'))
  if (k) d.kommun = k.namn
  if (hamta(sok, 'kyrka') === '1') d.kyrka = true
  if (hamta(sok, 'a66') === '1') d.a66 = true
  const jlon = heltal(sok, 'jlon')
  const jk = hittaKommun(hamta(sok, 'jkommun'))
  if (hamta(sok, 'jlon') !== null || jk) d.jamfor = true
  if (jlon !== null) d.jlon = jlon
  if (jk) d.jkommun = jk.namn
  return d
}

export function lonParametrar(d: LonIndata): Parametrar {
  return {
    lon: String(d.lon),
    kommun: d.kommun,
    kyrka: d.kyrka ? '1' : null,
    a66: d.a66 ? '1' : null,
    jlon: d.jamfor ? String(d.jlon) : null,
    jkommun: d.jamfor ? d.jkommun : null,
  }
}

export interface LonResultat {
  tab: number
  skatt: number
  netto: number
  /** Skatteavdraget som andel av lönen, 0 till 1. */
  effektiv: number
  overTak: boolean
  tab2: number
  skatt2: number
  netto2: number
  /** Ny lön efter skatt minus nuvarande, per månad. */
  diff: number
}

export function beraknaLon(d: LonIndata, tabeller: Tabeller): LonResultat {
  const k1 = hittaKommun(d.kommun) ?? hittaKommun('Stockholm')!
  const k2 = hittaKommun(d.jkommun) ?? k1
  const tab = tabellNr(k1, d.kyrka)
  const skatt = raknaSkatt(d.lon, tab, d.a66, tabeller)
  const netto = d.lon - skatt
  const tab2 = tabellNr(k2, d.kyrka)
  const skatt2 = raknaSkatt(d.jlon, tab2, d.a66, tabeller)
  const netto2 = d.jlon - skatt2
  return {
    tab,
    skatt,
    netto,
    effektiv: d.lon > 0 ? skatt / d.lon : 0,
    overTak: d.lon > 80000,
    tab2,
    skatt2,
    netto2,
    diff: netto2 - netto,
  }
}

export const LON_KALLA = 'Skatteverkets skattetabeller för månadslön 2026'

export function sammanfattaLon(d: LonIndata, r: LonResultat): Sammanfattning {
  if (d.jamfor) {
    return {
      namn: 'Lön efter skatt 2026',
      tal: `${krTecken(r.diff)}`,
      enhet: 'i handen per månad med den nya lönen',
      rad: `${kr(d.lon)} i ${d.kommun} mot ${kr(d.jlon)} i ${d.jkommun}, ${krTecken(r.diff * 12)} om året`,
      kalla: `${LON_KALLA}, tabell ${r.tab}${r.tab2 !== r.tab ? ` och ${r.tab2}` : ''}`,
    }
  }
  return {
    namn: 'Lön efter skatt 2026',
    tal: kr(r.netto),
    enhet: 'kvar i handen per månad',
    rad: `${kr(d.lon)} i lön i ${d.kommun}, skatt ${tal(r.skatt)} kr (${decimal(r.effektiv * 100)} procent)`,
    kalla: `${LON_KALLA}, tabell ${r.tab}, kolumn ${d.a66 ? 3 : 1}`,
  }
}

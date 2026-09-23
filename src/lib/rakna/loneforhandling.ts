/**
 * Vad en löneförhandling är värd över tid. Jämför löneutvecklingen med och
 * utan en förhandlad höjning, med samma årliga revision i båda scenarierna.
 * Inga externa antaganden, användaren styr revisionstakten själv.
 */
import { hamta, heltal, type Parametrar, type Sok } from './sok'
import { kr, krTecken } from './format'
import type { Sammanfattning } from './typer'

export interface ForhandlingIndata {
  lon: number
  hojning: number
  /** Årlig revision som användaren skrev den, till exempel "2,5". */
  rev: string
}

export const FORHANDLING_STANDARD: ForhandlingIndata = { lon: 36000, hojning: 2000, rev: '2,5' }

export function ackumulerat(startlon: number, hojning: number, revision: number, ar: number): number {
  let diff = 0
  let utan = startlon
  let med = startlon + hojning
  for (let i = 0; i < ar; i++) {
    diff += (med - utan) * 12
    utan *= 1 + revision
    med *= 1 + revision
  }
  return diff
}

export function lasForhandling(sok: Sok): ForhandlingIndata {
  const d = { ...FORHANDLING_STANDARD }
  const lon = heltal(sok, 'lon')
  if (lon !== null) d.lon = lon
  const h = heltal(sok, 'hojning')
  if (h !== null) d.hojning = h
  const rev = hamta(sok, 'rev')
  if (rev && /^[\d,.]+$/.test(rev)) d.rev = rev
  return d
}

export function forhandlingParametrar(d: ForhandlingIndata): Parametrar {
  return { lon: String(d.lon), hojning: String(d.hojning), rev: d.rev !== '2,5' ? d.rev : null }
}

export function revisionsTal(rev: string): number {
  return Math.max(0, parseFloat(rev.replace(',', '.')) || 0) / 100
}

export interface ForhandlingResultat {
  ar5: number
  ar10: number
  ar20: number
}

export function beraknaForhandling(d: ForhandlingIndata): ForhandlingResultat {
  const r = revisionsTal(d.rev)
  const lon = Math.max(0, d.lon)
  const h = Math.max(0, d.hojning)
  return { ar5: ackumulerat(lon, h, r, 5), ar10: ackumulerat(lon, h, r, 10), ar20: ackumulerat(lon, h, r, 20) }
}

export const FORHANDLING_KALLA = 'Egen beräkning på din lön och revisionstakt, före skatt'

export function sammanfattaForhandling(d: ForhandlingIndata, r: ForhandlingResultat): Sammanfattning {
  return {
    namn: 'Löneförhandlingens värde',
    tal: krTecken(r.ar10),
    enhet: 'mer i lön över tio år',
    rad: `${kr(d.hojning)} mer i månaden på ${kr(d.lon)}, ${d.rev} procent årlig revision`,
    kalla: FORHANDLING_KALLA,
  }
}

/**
 * Uppsägningstid enligt LAS (1982:80). 11 §: minst en månads uppsägningstid
 * för båda parter; vid uppsägning från arbetsgivarens sida har arbetstagaren
 * rätt till 2/3/4/5/6 månader vid 2/4/6/8/10 års sammanlagd anställningstid.
 * Provanställning: kan avbrytas utan uppsägningstid (6 §), arbetsgivaren ska
 * underrätta minst två veckor i förväg (31 §). Kollektivavtal kan avvika.
 *
 * Datumen räknas i UTC så att servern och webbläsaren kommer fram till samma
 * dag oavsett tidszon.
 */
import { hamta, type Parametrar, type Sok } from './sok'
import type { Sammanfattning } from './typer'

export type Uppsagare = 'sjalv' | 'arbetsgivare'

export interface UppsagningIndata {
  vem: Uppsagare
  prov: boolean
  /** ISO-datum, anställningens start. */
  start: string
  /** ISO-datum när uppsägningen lämnas. Tomt betyder i dag. */
  datum: string
}

export const UPPSAGNING_STANDARD: UppsagningIndata = { vem: 'sjalv', prov: false, start: '2020-01-01', datum: '' }

const ISO = /^\d{4}-\d{2}-\d{2}$/

export function idagIso(nu: Date = new Date()): string {
  return nu.toISOString().slice(0, 10)
}

export function lasUppsagning(sok: Sok): UppsagningIndata {
  const d = { ...UPPSAGNING_STANDARD }
  if (hamta(sok, 'vem') === 'ag') d.vem = 'arbetsgivare'
  if (hamta(sok, 'prov') === '1') d.prov = true
  const start = hamta(sok, 'start')
  if (start && ISO.test(start)) d.start = start
  const datum = hamta(sok, 'datum')
  if (datum && ISO.test(datum)) d.datum = datum
  return d
}

/** `vem` står alltid med: den är nyckeln som gör en delad länk till en delad vy. */
export function uppsagningParametrar(d: UppsagningIndata, idag: string): Parametrar {
  return {
    vem: d.vem === 'arbetsgivare' ? 'ag' : 'sjalv',
    prov: d.prov ? '1' : null,
    start: d.prov ? null : d.start,
    datum: d.prov ? null : d.datum || idag,
  }
}

export function lasManader(anstallningsAr: number): number {
  if (anstallningsAr >= 10) return 6
  if (anstallningsAr >= 8) return 5
  if (anstallningsAr >= 6) return 4
  if (anstallningsAr >= 4) return 3
  if (anstallningsAr >= 2) return 2
  return 1
}

const fmtDatum = new Intl.DateTimeFormat('sv-SE', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })

export interface UppsagningResultat {
  giltiga: boolean
  anstallningsAr: number
  manader: number
  /** Sista anställningsdag, formaterad: "23 december 2026". Null vid provanställning. */
  sistaDag: string | null
}

export function beraknaUppsagning(d: UppsagningIndata, idag: string): UppsagningResultat {
  const startD = new Date(d.start)
  const uppsD = new Date(d.datum || idag)
  const giltiga = !Number.isNaN(startD.getTime()) && !Number.isNaN(uppsD.getTime()) && uppsD >= startD
  const anstallningsAr = giltiga ? (uppsD.getTime() - startD.getTime()) / (365.25 * 24 * 3600 * 1000) : 0
  const manader = d.vem === 'arbetsgivare' ? lasManader(anstallningsAr) : 1
  let sistaDag: string | null = null
  if (giltiga && !d.prov) {
    const s = new Date(uppsD)
    s.setUTCMonth(s.getUTCMonth() + manader)
    sistaDag = fmtDatum.format(s)
  }
  return { giltiga, anstallningsAr, manader, sistaDag }
}

export const UPPSAGNING_KALLA = 'Lagen om anställningsskydd (1982:80), 11 §'

export function manaderText(m: number): string {
  return `${m} ${m === 1 ? 'månad' : 'månader'}`
}

export function sammanfattaUppsagning(d: UppsagningIndata, r: UppsagningResultat): Sammanfattning {
  if (d.prov) {
    return {
      namn: 'Uppsägningstid enligt LAS',
      tal: 'Ingen',
      enhet: 'uppsägningstid under provanställning',
      rad: 'Arbetsgivaren ska underrätta två veckor i förväg',
      kalla: 'Lagen om anställningsskydd (1982:80), 6 och 31 §§',
    }
  }
  return {
    namn: 'Uppsägningstid enligt LAS',
    tal: manaderText(r.manader),
    enhet: d.vem === 'arbetsgivare' ? 'uppsägningstid när arbetsgivaren säger upp' : 'uppsägningstid när du säger upp dig',
    rad: r.sistaDag ? `Sista anställningsdag ${r.sistaDag}` : 'Ange giltiga datum',
    kalla: UPPSAGNING_KALLA,
  }
}

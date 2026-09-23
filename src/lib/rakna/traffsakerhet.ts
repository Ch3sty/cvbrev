/**
 * Träffsäkerhetssimulatorn. Validiteter ur Sackett m.fl. (2022), kombinationen
 * ur samma forskargrupps kompositanalyser. Andelen lyckade rekryteringar
 * beräknas med Taylor-Russell-logik: P(lyckad | vald) under bivariat
 * normalfördelning, givet basfrekvens och selektionskvot.
 *
 * Används av kalkylatorn på /rakna-ut/traffsakerhet och av MDX-komponenten i
 * insikten, så att båda räknar exakt lika.
 */
import { hamta, heltalMellan, type Parametrar, type Sok } from './sok'
import type { Sammanfattning } from './typer'

export const METODER = [
  { id: 'ostrukturerad', label: 'Ostrukturerad intervju (magkänsla)', r: 0.19 },
  { id: 'test', label: 'Kognitivt test ensamt', r: 0.31 },
  { id: 'strukturerad', label: 'Strukturerad intervju', r: 0.42 },
  { id: 'kombination', label: 'Strukturerad intervju + test', r: 0.5 },
] as const

export type MetodId = (typeof METODER)[number]['id']

// Φ via Abramowitz-Stegun-approximation av felfunktionen
export function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2)
  const p =
    d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return x >= 0 ? 1 - p : p
}

// Acklams approximation av inversa normalfördelningen
export function normInv(p: number): number {
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924]
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857]
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878]
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742]
  const pl = 0.02425
  if (p < pl) {
    const q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
  if (p <= 1 - pl) {
    const q = p - 0.5
    const r = q * q
    return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  }
  const q = Math.sqrt(-2 * Math.log(1 - p))
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
}

// P(Y > b | X > a) med korrelation r: numerisk integration över x
export function andelLyckade(r: number, basfrekvens: number, selektionskvot: number): number {
  const a = normInv(1 - selektionskvot)
  const b = normInv(1 - basfrekvens)
  const steg = 400
  const bredd = 8
  const h = bredd / steg
  let summa = 0
  for (let i = 0; i <= steg; i++) {
    const x = a + i * h
    const vikt = i === 0 || i === steg ? 1 : i % 2 === 1 ? 4 : 2
    const fi = Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI)
    const villkor = 1 - normCdf((b - r * x) / Math.sqrt(1 - r * r))
    summa += vikt * fi * villkor
  }
  const taljare = (summa * h) / 3
  return Math.min(1, taljare / selektionskvot)
}

export interface TraffIndata {
  metod: MetodId
  /** Procent av kandidaterna som skulle klara rollen. */
  basfrekvens: number
  /** Procent av kandidaterna som anställs. */
  selektionskvot: number
}

export const TRAFF_STANDARD: TraffIndata = { metod: 'kombination', basfrekvens: 50, selektionskvot: 20 }

export const TRAFF_SPANN = {
  basfrekvens: { min: 30, max: 70, steg: 5 },
  selektionskvot: { min: 5, max: 60, steg: 5 },
} as const

export function lasTraff(sok: Sok): TraffIndata {
  const d = { ...TRAFF_STANDARD }
  const m = hamta(sok, 'metod')
  if (m && METODER.some((x) => x.id === m)) d.metod = m as MetodId
  const b = heltalMellan(sok, 'bas', TRAFF_SPANN.basfrekvens.min, TRAFF_SPANN.basfrekvens.max)
  if (b !== null) d.basfrekvens = b
  const k = heltalMellan(sok, 'kvot', TRAFF_SPANN.selektionskvot.min, TRAFF_SPANN.selektionskvot.max)
  if (k !== null) d.selektionskvot = k
  return d
}

/** `metod` står alltid med: den är nyckeln som gör en delad länk till en delad vy. */
export function traffParametrar(d: TraffIndata): Parametrar {
  return { metod: d.metod, bas: String(d.basfrekvens), kvot: String(d.selektionskvot) }
}

export interface TraffResultat {
  resultat: { id: MetodId; label: string; r: number; andel: number }[]
  vald: { id: MetodId; label: string; r: number; andel: number }
  /** Hur många av tio rekryteringar som förväntas lyckas. */
  avTio: number
}

export function beraknaTraff(d: TraffIndata): TraffResultat {
  const resultat = METODER.map((m) => ({
    id: m.id as MetodId,
    label: m.label as string,
    r: m.r as number,
    andel: andelLyckade(m.r, d.basfrekvens / 100, d.selektionskvot / 100),
  }))
  const vald = resultat.find((m) => m.id === d.metod) ?? resultat[3]
  return { resultat, vald, avTio: Math.round(vald.andel * 10) }
}

export const TRAFF_KALLA = 'Validiteter ur Sackett m.fl. (2022), Taylor-Russell-modellen'

export function sammanfattaTraff(d: TraffIndata, r: TraffResultat): Sammanfattning {
  return {
    namn: 'Träffsäkerhetssimulatorn',
    tal: `${r.avTio} av 10`,
    enhet: 'rekryteringar förväntas lyckas',
    rad: `${r.vald.label}, ${Math.round(r.vald.andel * 100)} procent när ni anställer ${d.selektionskvot} procent`,
    kalla: TRAFF_KALLA,
  }
}

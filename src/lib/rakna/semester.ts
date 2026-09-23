/**
 * Semesterersättning och semesterlön enligt semesterlagen (1977:480).
 * Sammalöneregeln (16 a §): ordinarie lön under semestern + semestertillägg
 * 0,43 % av månadslönen per betald semesterdag. Vid slutlön används den
 * etablerade dagslöneberäkningen 4,6 % av månadslönen per dag + tillägget.
 * Procentregeln (16 b §): semesterlön = 12 % av förfallen lön under
 * intjänandeåret. Semesterersättning beräknas enligt samma grunder (28-29 §§).
 */
import { hamta, heltal, type Parametrar, type Sok } from './sok'
import { kr, tal } from './format'
import type { Sammanfattning } from './typer'

export type SemesterLage = 'manadslon' | 'procent'

export interface SemesterIndata {
  lage: SemesterLage
  manadslon: number
  dagar: number
  arslon: number
}

export const SEMESTER_STANDARD: SemesterIndata = { lage: 'manadslon', manadslon: 32000, dagar: 25, arslon: 180000 }

export function lasSemester(sok: Sok): SemesterIndata {
  const d = { ...SEMESTER_STANDARD }
  if (hamta(sok, 'lage') === 'procent') d.lage = 'procent'
  const m = heltal(sok, 'lon')
  if (m !== null) d.manadslon = m
  const dagar = heltal(sok, 'dagar')
  if (dagar !== null) d.dagar = dagar
  const ar = heltal(sok, 'arslon')
  if (ar !== null) d.arslon = ar
  return d
}

/** `lage` står alltid med: den är nyckeln som gör en delad länk till en delad vy. */
export function semesterParametrar(d: SemesterIndata): Parametrar {
  return d.lage === 'procent'
    ? { lage: 'procent', lon: null, dagar: null, arslon: String(d.arslon) }
    : { lage: 'manad', lon: String(d.manadslon), dagar: String(d.dagar), arslon: null }
}

export interface SemesterResultat {
  tillaggPerDag: number
  dagslonPerDag: number
  ersattningPerDag: number
  totaltManadslon: number
  totaltProcent: number
}

export function beraknaSemester(d: SemesterIndata): SemesterResultat {
  const m = Math.max(0, d.manadslon)
  const dagar = Math.max(0, d.dagar)
  const tillaggPerDag = m * 0.0043
  const dagslonPerDag = m * 0.046
  const ersattningPerDag = dagslonPerDag + tillaggPerDag
  return {
    tillaggPerDag,
    dagslonPerDag,
    ersattningPerDag,
    totaltManadslon: ersattningPerDag * dagar,
    totaltProcent: Math.max(0, d.arslon) * 0.12,
  }
}

export function semesterKalla(lage: SemesterLage): string {
  return lage === 'procent' ? 'Semesterlagen (1977:480), procentregeln i 16 b §' : 'Semesterlagen (1977:480), sammalöneregeln i 16 a §'
}

export function sammanfattaSemester(d: SemesterIndata, r: SemesterResultat): Sammanfattning {
  if (d.lage === 'procent') {
    return {
      namn: 'Semesterersättning',
      tal: kr(r.totaltProcent),
      enhet: 'i semesterlön enligt procentregeln',
      rad: `12 procent av ${kr(d.arslon)} i lön under intjänandeåret`,
      kalla: semesterKalla('procent'),
    }
  }
  return {
    namn: 'Semesterersättning',
    tal: kr(r.totaltManadslon),
    enhet: `i semesterersättning för ${tal(d.dagar)} dagar`,
    rad: `${kr(d.manadslon)} i månadslön, ${kr(r.ersattningPerDag)} per sparad dag`,
    kalla: semesterKalla('manadslon'),
  }
}

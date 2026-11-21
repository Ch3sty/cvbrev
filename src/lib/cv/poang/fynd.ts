/**
 * Fynden i en poängsatt analys: det Analys-sidan listar och räknar ("Tre
 * saker drar ner") och det analysflödet räknar ("Vi hittade tre
 * förbättringar"). En lista för båda, så att talen aldrig skiljer sig
 * (efterrättning D 2026-11-21: flödet sa en förbättring för gratisnivån när
 * sidan sa tre).
 *
 *  - profilen, när förslaget höjer poängen
 *  - varje rollförslag som höjer poängen
 *  - kompetensförslagen som ett fynd: de förvalda tillsammans, när de höjer
 *  - siffrorna, när [antal] står kvar i CV:t (plus kan vara noll)
 *
 * Allmänna råd lovar inga poäng och räknas inte. Tar det fulla, poängsatta
 * resultatet (poangsattAnalys), före gratisfiltreringen: låsta fynd räknas.
 * Klientsäker.
 */
import { kanonisktCv } from './kanon'
import { poangMedVal, type Val } from './forslag'
import { platshallareKvar, plusForSiffror } from './siffror'

type Obj = Record<string, unknown>
const arObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)

export type FyndGrund =
  | { typ: 'profil'; nyckel: 'profil'; plus: number }
  | { typ: 'roll'; nyckel: `roll-${number}`; plus: number; i: number }
  | { typ: 'kompetenser'; nyckel: 'kompetenser'; plus: number; forvalda: number[] }
  | { typ: 'siffror'; nyckel: 'siffror'; plus: number }

/** Fynden i byggordning (profil, roller, kompetenser, siffror), osorterade. */
export function fyndIAnalys(full: Obj): FyndGrund[] {
  const ut: FyndGrund[] = []
  const bas = kanonisktCv(full.structuredCV)
  const idag = typeof (full.poang as { idag?: unknown } | null)?.idag === 'number' ? (full.poang as { idag: number }).idag : null

  const profil = arObj(full.profileSummary) ? full.profileSummary : null
  const profilPlus = typeof profil?.plus === 'number' ? profil.plus : 0
  if (profil && profilPlus > 0) ut.push({ typ: 'profil', nyckel: 'profil', plus: profilPlus })

  const roller = Array.isArray(full.roleBasedImprovements) ? (full.roleBasedImprovements as Obj[]) : []
  roller.forEach((r, i) => {
    const plus = typeof r?.plus === 'number' ? r.plus : 0
    if (plus > 0) ut.push({ typ: 'roll', nyckel: `roll-${i}`, plus, i })
  })

  const komp = Array.isArray(full.skillSuggestions) ? (full.skillSuggestions as Obj[]) : []
  const forvalda = komp.flatMap((k, i) => (k?.forvald === true ? [i] : []))
  if (forvalda.length > 0 && idag !== null) {
    const val: Val = { profil: false, roller: [], kompetenser: forvalda }
    const med = poangMedVal(full, val)
    const plus = med ? med.total - idag : 0
    if (plus > 0) ut.push({ typ: 'kompetenser', nyckel: 'kompetenser', plus, forvalda })
  }

  if (bas && platshallareKvar(bas).length > 0) ut.push({ typ: 'siffror', nyckel: 'siffror', plus: plusForSiffror(bas) })
  return ut
}

/** Antalet fynd, samma tal som Analys-sidans rubrik. */
export function antalFynd(full: Obj): number {
  return fyndIAnalys(full).length
}

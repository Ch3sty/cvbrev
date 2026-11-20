// Omgång 3: mätarnas tal och texter (Hem, Tester, Din utveckling). Ren, testas.
// Varje tal kommer ur datan; saknas underlaget blir delen null och ritas som
// "inte mätt än" eller faller bort.

import { ZON_GRANSER, type Dag, type NivaLage, type TempoLage, type TestTypId, type UtvecklingsPunkt, type Zon } from '@/lib/tester/v4/typer'
import { dagarMellan, laggTill } from '@/lib/traning/datum'
import { kortDatumV } from '@/lib/tester/v4/vagen'

/** Provets nivå: proven ligger på avancerad nivå, som börjar på 4,0. */
export const PROVETS_NIVA = ZON_GRANSER.avancerad[0]

export const tal1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',')

export function zonFor(v: number): Zon {
  return v >= ZON_GRANSER.expert[0] ? 'expert' : v >= ZON_GRANSER.avancerad[0] ? 'avancerad' : 'grund'
}

export const ZON_TEXT: Readonly<Record<Zon, string>> = { grund: 'Grund', avancerad: 'Avancerad', expert: 'Expert' }

/** Punkterna som står på nivåaxeln (nivåkoll och träning som räknas), i tidsordning. */
export function nivaPunkter(punkter: readonly UtvecklingsPunkt[], typ: TestTypId): UtvecklingsPunkt[] {
  return punkter
    .filter((p) => p.typ === typ && p.slag !== 'ovningsprov' && p.niva != null && p.raknas)
    .sort((a, b) => (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0))
}

export interface Forandring4v {
  fran: number
  till: number
  skillnad: number
  riktning: 'upp' | 'ned' | 'oforandrad'
}

/** Från första till senaste nivån de senaste 28 dagarna. Null med färre än två punkter. */
export function forandring4v(punkter: readonly UtvecklingsPunkt[], typ: TestTypId, idag: Dag, lage: NivaLage): Forandring4v | null {
  if (lage.status !== 'matt' || lage.niva == null) return null
  const fran = laggTill(idag, -27)
  const pa = nivaPunkter(punkter, typ).filter((p) => p.dag >= fran)
  if (pa.length < 2) return null
  const forsta = pa[0].niva as number
  const till = lage.niva
  const skillnad = Math.round((till - forsta) * 10) / 10
  const riktning = Math.abs(skillnad) < 0.05 ? 'oforandrad' : skillnad > 0 ? 'upp' : 'ned'
  return { fran: forsta, till, skillnad, riktning }
}

/** Minigrafens punkter (x 0..1 över fyra veckor, värdet). */
export function sparPunkter(punkter: readonly UtvecklingsPunkt[], typ: TestTypId, idag: Dag, dagar = 28): { t: number; v: number }[] {
  const fran = laggTill(idag, -(dagar - 1))
  return nivaPunkter(punkter, typ)
    .filter((p) => p.dag >= fran && p.dag <= idag)
    .map((p) => ({ t: dagarMellan(fran, p.dag) / (dagar - 1), v: p.niva as number }))
}

/** Tempot i procent inom tiden, och raden under. Null utan svar. */
export function tempoTal(t: TempoLage | null | undefined): { procent: number; inom: number; over: number; antal: number; tid: string } | null {
  if (!t || t.antal <= 0) return null
  const inom = t.antal - t.over
  return { procent: Math.round((inom / t.antal) * 100), inom, over: t.over, antal: t.antal, tid: tidText(t.budgetS) }
}

const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']
export function tidText(s: number): string {
  if (s >= 60 && s % 60 === 0) {
    const m = s / 60
    return `${ORD[m] ?? m} ${m === 1 ? 'minut' : 'minuter'}`
  }
  return `${s} sekunder`
}

/** Kvar till provets nivå (avancerad), null när nivån redan är där. */
export function kvarTillProvet(v: number): number | null {
  const k = Math.round((PROVETS_NIVA - v) * 10) / 10
  return k > 0 ? k : null
}

/** "Gjort lördag 14 nov" */
export function narText(dag: Dag, idag: Dag): string {
  const n = dagarMellan(dag, idag)
  if (n === 0) return 'i dag'
  if (n === 1) return 'i går'
  return kortDatumV(dag)
}

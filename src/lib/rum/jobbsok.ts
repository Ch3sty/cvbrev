// src/lib/rum/jobbsok.ts
//
// Jobbsökets hem (spec-rummen våg 4, konceptets J1 och J2): spåret per sökt
// tjänst, raderna under Nästa handling och korsreferensen till
// Rekryteringstester. Rena funktioner över summeringens data, så att varje
// tal på skärmen går att spåra till en rad i databasen. Klientsäker.

import { statusProgressStep, type ApplicationEventType } from '@/lib/applications/status'
import { SPAR, SOKT_META, KORS, kortDatum } from './copy'

/** En sökt tjänst som summeringen räknar fram (DashboardSummaryPipelineItem). */
export interface SoktTjanst {
  id: string
  company: string
  jobTitle: string
  status: ApplicationEventType | null
  /** Dagar sedan senaste händelse. */
  days: number
  needsFollowUp: boolean
  /** När ansökan skickades (ISO). Saknas i äldre cachade svar. */
  appliedAt?: string | null
  /** När statusen senast ändrades (ISO). */
  statusAt?: string | null
}

export type Station = 0 | 1 | 2 | 3

export interface SparRad {
  id: string
  namn: string
  station: Station
  /** Inget svar efter gränsen: ihålig kopparring vid Sökt. */
  tyst: boolean
  /** Texten vid stationen ("tyst 16 dagar", "kallad 15 okt"). */
  etikett: string | null
  /** Hur läget läses upp ("Klarna på intervju"). */
  aria: string
}

function datumFor(t: SoktTjanst): string | null {
  const iso = t.statusAt ?? t.appliedAt ?? null
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : kortDatum(d)
}

/** Spårets rad för en sökt tjänst. */
export function sparRad(t: SoktTjanst): SparRad {
  const station = statusProgressStep(t.status) as Station
  const tyst = t.needsFollowUp && station === 0
  const datum = datumFor(t)
  let etikett: string | null = null
  if (tyst) etikett = SPAR.tyst(t.days)
  else if (t.status === 'interview_invited') etikett = datum ? SPAR.kallad(datum) : null
  else if (t.status === 'interview_completed') etikett = SPAR.intervjuGjord
  else if (t.status === 'trial_work_completed') etikett = SPAR.provjobbat
  else if (station === 3) etikett = datum ? SPAR.erbjudande(datum) : null
  else if (station === 1) etikett = datum ? SPAR.svar(datum) : null
  else etikett = datum ? SPAR.sokt(datum) : null
  const laget = tyst ? `sökt och tyst i ${t.days} dagar` : SPAR.laget[station]
  return { id: t.id, namn: t.company, station, tyst, etikett, aria: `${t.company} ${laget}` }
}

/**
 * Spårets rader: de som rört sig längst först, sedan de tysta, sedan resten.
 * Högst `max`; antalet som inte fick plats returneras också.
 */
export function sparRader(tjanster: readonly SoktTjanst[], max = 3): { rader: SparRad[]; ovriga: number } {
  const rader = tjanster.map(sparRad)
  const ordning = [...rader].sort((a, b) => {
    if (a.station !== b.station) return b.station - a.station
    if (a.tyst !== b.tyst) return a.tyst ? -1 : 1
    return 0
  })
  return { rader: ordning.slice(0, max), ovriga: Math.max(0, ordning.length - max) }
}

/** Metaraden för en sökt tjänst i listan på hemmet. */
export function soktMeta(t: SoktTjanst): string {
  const datum = datumFor(t) ?? ''
  if (t.needsFollowUp && statusProgressStep(t.status) === 0) return SOKT_META.tyst(t.days)
  switch (t.status) {
    case 'interview_invited':
      return SOKT_META.kallad(datum)
    case 'interview_completed':
      return SOKT_META.intervjuGjord(datum)
    case 'trial_work_completed':
      return SOKT_META.provjobbat(datum)
    case 'offer_received':
      return SOKT_META.erbjudande(datum)
    case null:
    case 'applied':
    case 'no_response':
      return SOKT_META.sokt(t.days)
    default:
      return SOKT_META.svar(datum)
  }
}

/* ---------------------------------------------------------- korsreferensen */

/** Testträningens läge, som summeringen läser det (null när tabellerna saknas). */
export interface TraningKors {
  /** Senaste nivån (1 till 10, en decimal), null utan mätning. */
  niva: number | null
  /** 'YYYY-MM-DD' i svensk tid, null utan datum. */
  provdatum: string | null
  leverantor: string | null
  testtyper: string[]
}

const LEVERANTOR_NAMN: Record<string, string> = {
  matrigma: 'Matrigma',
  alva: 'Alva Logic',
  shl: 'SHL Verify',
  aon: 'Aon scales ix',
}

function nivaText(n: number): string {
  return n.toFixed(1).replace('.', ',')
}

function dagarMellan(fran: string, till: string): number {
  const [a, b] = [fran, till].map((s) => {
    const [y, m, d] = s.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  })
  return Math.round((b - a) / 86_400_000)
}

export type KorsVariant = 'niva' | 'aldrig_matt'

/**
 * Raden i Jobbsöket som pekar till Rekryteringstester: nivån och dagarna till
 * provet för den som mätt, inbjudan för den som aldrig mätt. Personlighetstestet
 * har ingen nivå; den som bara har det får inbjudan som alla andra.
 */
export function korsreferens(t: TraningKors | null | undefined, idag: string): { variant: KorsVariant; text: string } {
  const typ = t?.testtyper.find((x) => x !== 'personlighet') ?? 'matris'
  if (!t || t.niva === null) return { variant: 'aldrig_matt', text: `${KORS.aldrigMattFraga} ${KORS.aldrigMattTitel}` }
  const delar = [KORS.niva(nivaText(t.niva), KORS.typNiva[typ] ?? KORS.typNiva.matris)]
  if (t.provdatum) {
    const dagar = dagarMellan(idag, t.provdatum)
    if (dagar >= 0) {
      const till = (t.leverantor && LEVERANTOR_NAMN[t.leverantor]) || KORS.typProv[typ] || KORS.provet
      delar.push(KORS.dagarTill(dagar, till))
    }
  }
  return { variant: 'niva', text: delar.join(' ') }
}

/* ------------------------------------------------------------- landningen */

export type Landningsrum = 'tran' | 'cv' | 'brev' | 'jobb'

export const LANDNING_HREF: Record<Landningsrum, string> = {
  tran: '/dashboard/tester',
  cv: '/dashboard/profil/cv',
  brev: '/dashboard/mina-brev',
  jobb: '/dashboard',
}

const RUMMEN_SOM_LANDAR = new Set(['tran', 'cv', 'brev', 'jobb'])

/**
 * Rummet /dashboard öppnar (spec avsnitt 5 och våg 4): det senast besökta,
 * annars ett satt provdatum (Rekryteringstester), annars valet i
 * registreringen (tester och intervju ger Rekryteringstester, cv och brev
 * sitt rum, jobb Jobbsöket), annars Jobbsöket.
 */
export function landningsrum(a: {
  senasteRum: unknown
  harProvdatum: boolean
  intent: string | null | undefined
}): Landningsrum {
  if (typeof a.senasteRum === 'string' && RUMMEN_SOM_LANDAR.has(a.senasteRum)) return a.senasteRum as Landningsrum
  if (a.harProvdatum) return 'tran'
  switch (a.intent) {
    case 'tester':
    case 'intervju':
      return 'tran'
    case 'cv':
      return 'cv'
    case 'brev':
      return 'brev'
    default:
      return 'jobb'
  }
}

/**
 * Är det här en landning på /dashboard, inte ett klick inne i appen?
 * Dörren till Jobbsöket och Översikt i sidomenyn kommer från en annan
 * /dashboard-sida och ska alltid öppna Jobbsöket. En landning har ingen
 * referens, eller en referens utanför inloggat (inloggningen, mejlet,
 * en annan sajt).
 */
export function arLandning(referer: string | null | undefined, host: string | null | undefined): boolean {
  if (!referer) return true
  try {
    const u = new URL(referer)
    if (host && u.host !== host) return true
    return !(u.pathname === '/dashboard' || u.pathname.startsWith('/dashboard/'))
  } catch {
    return true
  }
}

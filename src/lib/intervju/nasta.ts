/**
 * Nästa handling kring intervjuprovet och personlighetsprovet
 * (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 2 och 3, och
 * docs/design/rod-trad-prov-2026-09-24.html, Del B).
 *
 * Klientsäker och ren, så att rangordningen går att testa utan server.
 * Två rangordningar bor här:
 *
 * 1. Hubben Inför intervjun (valjHubbHandling). Specens ordning, läst mot
 *    designfilen som är facit:
 *      inga prov alls                        forstaGang
 *      senaste provet 3 eller lägre          omskrivning, eller lasIgen när dagens kvot är slut
 *                                            (designens mobilskärm: "Läs återkopplingen igen")
 *      kvot finns och en fråga är ogjord     nyFraga, första ogjorda i FRAGOR-ordning
 *      smakprov utan riktig profil           helaTestet
 *      kvoten slut                           lasIgen
 *      annars                                nyFraga, den rekommenderade (lägst bästa nivå)
 *
 * 2. Hemskärmens två steg (hemIntervjuSteg), efter uppföljningen och
 *    AF-rapporten men före de oprövade funktionerna:
 *      interview-rewrite   senaste provet 3 eller lägre och äldre än 24 timmar
 *      personality-full    smakprov finns men ingen riktig profil
 */

import { FRAGA_ORDNING, FRAGOR, type FragaId } from '@/components/artiklar/intervjuprov/fragor'

export interface ProvSammanfattning {
  token: string
  question: FragaId
  level: number
  missingKind: string
  createdAt: string
}

export type HubbHandling =
  | { kind: 'forstaGang' }
  | { kind: 'omskrivning'; prov: ProvSammanfattning }
  | { kind: 'lasIgen'; prov: ProvSammanfattning }
  | { kind: 'nyFraga'; fraga: FragaId }
  | { kind: 'helaTestet' }

export interface HubbUnderlag {
  /** Proven, nyast först. */
  prov: readonly ProvSammanfattning[]
  /** Finns dagens prov kvar (eller utan tak)? */
  kvotKvar: boolean
  harSmakprov: boolean
  harProfil: boolean
}

/** Frågan som rekommenderas: första ogjorda i FRAGOR-ordning, annars lägst bästa nivå. */
export function rekommenderadFraga(prov: readonly ProvSammanfattning[]): FragaId {
  const basta = bastaNivaPerFraga(prov)
  const ogjord = FRAGA_ORDNING.find((f) => basta[f] === undefined)
  if (ogjord) return ogjord
  return [...FRAGA_ORDNING].sort((a, b) => (basta[a] ?? 0) - (basta[b] ?? 0))[0]
}

export function bastaNivaPerFraga(prov: readonly ProvSammanfattning[]): Partial<Record<FragaId, number>> {
  const ut: Partial<Record<FragaId, number>> = {}
  for (const p of prov) ut[p.question] = Math.max(ut[p.question] ?? 0, p.level)
  return ut
}

export function antalPerFraga(prov: readonly ProvSammanfattning[]): Partial<Record<FragaId, number>> {
  const ut: Partial<Record<FragaId, number>> = {}
  for (const p of prov) ut[p.question] = (ut[p.question] ?? 0) + 1
  return ut
}

export function valjHubbHandling(u: HubbUnderlag): HubbHandling {
  const senaste = u.prov[0]
  if (!senaste) return { kind: 'forstaGang' }
  if (senaste.level <= 3) return u.kvotKvar ? { kind: 'omskrivning', prov: senaste } : { kind: 'lasIgen', prov: senaste }
  if (u.kvotKvar) {
    const gjorda = new Set(u.prov.map((p) => p.question))
    const ogjord = FRAGA_ORDNING.find((f) => !gjorda.has(f))
    if (ogjord) return { kind: 'nyFraga', fraga: ogjord }
  }
  if (u.harSmakprov && !u.harProfil) return { kind: 'helaTestet' }
  if (!u.kvotKvar) return { kind: 'lasIgen', prov: senaste }
  return { kind: 'nyFraga', fraga: rekommenderadFraga(u.prov) }
}

/* ------------------------------------------------------ hemskärmen */

export interface IntervjuHem {
  antalProv: number
  senaste: ProvSammanfattning | null
  smakprovToken: string | null
  harProfil: boolean
  /** Bästa nivå per gjord fråga. Valfritt: ett äldre cachat svar kan sakna det. */
  bastaNiva?: Partial<Record<FragaId, number>>
  /** test_type för avklarade kognitiva tester (logic_test_v4_sessions). */
  gjordaTestTyper?: (string | null)[]
}

export type HemIntervjuSteg =
  | { kind: 'interview-rewrite'; prov: ProvSammanfattning }
  | { kind: 'personality-full'; smakprovToken: string }
  | null

const DYGN_MS = 24 * 60 * 60 * 1000

export function hemIntervjuSteg(
  i: IntervjuHem | null | undefined,
  now: number,
  avfardad: (kind: 'interview-rewrite' | 'personality-full') => boolean
): HemIntervjuSteg {
  if (!i) return null
  const s = i.senaste
  if (s && s.level <= 3 && now - new Date(s.createdAt).getTime() > DYGN_MS && !avfardad('interview-rewrite')) {
    return { kind: 'interview-rewrite', prov: s }
  }
  if (i.smakprovToken && !i.harProfil && !avfardad('personality-full')) {
    return { kind: 'personality-full', smakprovToken: i.smakprovToken }
  }
  return null
}

/* ------------------------------------------------------ formuleringar */

/** Det som saknades, i den form meningen behöver: "planen för svagheten". */
export function saknadesFras(missingKind: string, fraga: FragaId): string {
  switch (missingKind) {
    case 'planen':
      return fraga === 'styrkor' ? 'planen för svagheten' : 'planen'
    case 'kopplingen':
      return 'kopplingen till rollen'
    case 'resultatet':
    case 'exemplet':
    case 'jag-formen':
      return missingKind
    default:
      return 'exemplet'
  }
}

const TZ = 'Europe/Stockholm'
const dag = (d: Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(d)

/** "I dag", "I går" eller "23 september", svensk tid. */
export function dagEtikett(iso: string, now: Date = new Date()): string {
  const d = new Date(iso)
  if (dag(d) === dag(now)) return 'I dag'
  if (dag(d) === dag(new Date(now.getTime() - DYGN_MS))) return 'I går'
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: TZ }).format(d)
}

/** Samma som dagEtikett men i löptext: "i dag", "i går", "den 23 september". */
export function nar(iso: string, now: Date = new Date()): string {
  const e = dagEtikett(iso, now)
  if (e === 'I dag') return 'i dag'
  if (e === 'I går') return 'i går'
  return `den ${e}`
}

export function fragaKort(fraga: FragaId): string {
  return FRAGOR[fraga].kort
}

/* ------------------------------------------------------ träningsfokus */

/**
 * Hemskärmen för den som har Träningspaketet (scope tester) men inget CV
 * (ägarens beslut 2026-09-24): träningen är Nästa handling, i Inför intervjuns
 * rangordning, och CV:t blir en sekundär textlänk.
 *
 *   interview-rewrite   senaste provet 3 eller lägre (ingen dygnsgräns, inget tak)
 *   interview-new       första ogjorda intervjufrågan i FRAGOR-ordning
 *   personality-full    smakprov finns men ingen riktig profil
 *   test-next           nästa rekryteringstest på högre nivå
 *   interview-new       annars frågan med lägst bästa nivå, så att ytan aldrig blir tom
 */
export type TraningsHandling =
  | { kind: 'interview-rewrite'; prov: ProvSammanfattning }
  | { kind: 'interview-new'; fraga: FragaId }
  | { kind: 'personality-full'; smakprovToken: string }
  | { kind: 'test-next'; slug: string; forsta: boolean }

/** Kognitiva tester per typ, i nivåordning. Slug och test_type i logic_test_v4_sessions. */
export const TESTSTEGE: ReadonlyArray<ReadonlyArray<{ slug: string; testType: string }>> = [
  [
    { slug: 'matrislogik-grund', testType: 'matrislogik' },
    { slug: 'matrislogik-avancerad', testType: 'matrislogik-avancerad' },
    { slug: 'matrislogik-expert', testType: 'matrislogik-expert' },
  ],
  [
    { slug: 'verbal-resonemang', testType: 'verbal-resonemang' },
    { slug: 'verbal-resonemang-v2', testType: 'verbal-resonemang-v2' },
    { slug: 'verbal-resonemang-expert', testType: 'verbal-resonemang-expert' },
  ],
  [
    { slug: 'numeriskt-test', testType: 'numerical-reasoning' },
    { slug: 'numeriskt-test-v2', testType: 'numerical-reasoning-v2' },
    { slug: 'numeriskt-test-expert', testType: 'numerical-reasoning-expert' },
  ],
]

/**
 * Nästa test på högre nivå: för varje testtyp i ordning, steget efter det
 * högsta avklarade. Inget avklarat alls ger logiktestet på grundnivå.
 * Allt avklarat ger null.
 */
export function nastaTest(gjordaTestTyper: readonly (string | null)[]): { slug: string; forsta: boolean } | null {
  const gjorda = new Set(gjordaTestTyper.map((t) => t ?? 'matrislogik'))
  const nagotGjort = TESTSTEGE.some((stege) => stege.some((s) => gjorda.has(s.testType)))
  if (!nagotGjort) return { slug: TESTSTEGE[0][0].slug, forsta: true }
  for (const stege of TESTSTEGE) {
    let hogsta = -1
    stege.forEach((s, i) => {
      if (gjorda.has(s.testType)) hogsta = i
    })
    if (hogsta >= 0 && hogsta < stege.length - 1) return { slug: stege[hogsta + 1].slug, forsta: false }
  }
  return null
}

export function traningsHandling(i: IntervjuHem | null | undefined): TraningsHandling {
  const s = i?.senaste ?? null
  if (s && s.level <= 3) return { kind: 'interview-rewrite', prov: s }
  const basta: Partial<Record<FragaId, number>> = { ...(i?.bastaNiva ?? {}) }
  if (s) basta[s.question] = Math.max(basta[s.question] ?? 0, s.level)
  const ogjord = FRAGA_ORDNING.find((f) => basta[f] === undefined)
  if (ogjord) return { kind: 'interview-new', fraga: ogjord }
  if (i?.smakprovToken && !i.harProfil) return { kind: 'personality-full', smakprovToken: i.smakprovToken }
  const test = nastaTest(i?.gjordaTestTyper ?? [])
  if (test) return { kind: 'test-next', ...test }
  const lagst = [...FRAGA_ORDNING].sort((a, b) => (basta[a] ?? 0) - (basta[b] ?? 0))[0]
  return { kind: 'interview-new', fraga: lagst }
}

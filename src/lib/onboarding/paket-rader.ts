// src/lib/onboarding/paket-rader.ts
//
// Menyhuvudet och underraderna (docs/design/spec-onboarding-2026-09-22.html,
// sektion 3 och 5, med ägarens beslut 2026-10-11: bara Jobbcoach Premium
// säljs). Menyn säger vad man har, och varje val bär en kort mening om vad
// som ingår ("3 mallar, en nedladdning") eller "Ingår i Premium". Inga spår
// visas för gratiskonton. Befintliga kunder med
// CV-paketet eller Träningspaketet ser sitt paket tills det löpt ut. Talen
// kommer ur scopet och kvottjänsten, aldrig hårdkodade.
//
// Klientsäker: ren data och rena funktioner.

import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { FREE_TIER_JOB_LIMIT } from '@/lib/jobmatching/freeLimit'
import { PLAN_BY_KEY, SALD_PLAN, paketKort, paketNamn as planNamn, prisPeriod, type PlanKey } from '@/lib/plans/plans'
import type { PaywallVariant } from '@/components/paywall/paywall-copy'

/** Samma form som summary.paket i /api/dashboard/summary. */
export interface PaketLage {
  scope: Scope | null
  track: Scope | null
  planKey: PlanKey | null
  fornyasAt: string | null
  dayPassOnly: boolean
  /** Uppsagt i Stripe: gäller till fornyasAt, förnyas inte. Saknas i äldre svar. */
  uppsagd?: boolean
  chatUsed: number
  chatLimit: number | null
  lettersUsed: number
  lettersLimit: number | null
}

const TALORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']
function talOrd(n: number): string {
  return TALORD[n] ?? String(n)
}
function storForst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Namnet i menyn, ur PLANS via plans.ts. Utan paket: "gratisnivån". Allt
 * med scope allt (månad, vecka, kvartal och Dagspasset) heter Premium i
 * appen (copy-premium avsnitt 1); Dagspasset visas aldrig. CV-paketet och
 * Träningspaketet står kvar för befintliga kunder.
 */
export function paketNamn(planKey: PlanKey | null): string {
  if (!planKey) return 'gratisnivån'
  if (PLAN_BY_KEY[planKey].scope === 'allt') return paketKort()
  return planNamn(planKey)
}

function svensktDatum(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }).format(d)
}

function svenskTid(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('sv-SE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Stockholm' }).format(d)
}

export interface MenyHuvud {
  /** "Du har Träningspaketet" */
  rubrik: string
  /** "Förnyas 29 september, 79 kr" */
  under: string
  lank: string
  href: string
}

export function menyHuvud(p: PaketLage): MenyHuvud {
  const href = '/dashboard/profil/prenumeration'
  if (!p.scope || !p.planKey) {
    return {
      rubrik: 'Du är på gratisnivån',
      under: `${paketKort()}, ${prisPeriod(SALD_PLAN)}`,
      lank: 'Vad ingår?',
      href,
    }
  }
  // Befintlig Dagspass-kund: Dagspasset säljs inte och visas inte, men
  // kontot har Premium till tiden går ut.
  if (p.dayPassOnly || p.planKey === 'all_day') {
    const tid = svenskTid(p.fornyasAt)
    return {
      rubrik: `Du har ${paketKort()}`,
      under: tid ? `Gäller till ${tid}` : 'Gäller i 24 timmar',
      lank: 'Vad ingår?',
      href,
    }
  }
  const plan = PLAN_BY_KEY[p.planKey]
  const datum = svensktDatum(p.fornyasAt)
  if (p.uppsagd) {
    return {
      rubrik: `Du har ${paketNamn(p.planKey)}`,
      under: datum ? `Gäller till ${datum}, förnyas inte` : 'Uppsagt, förnyas inte',
      lank: 'Vad ingår?',
      href,
    }
  }
  return {
    rubrik: `Du har ${paketNamn(p.planKey)}`,
    under: datum ? `Förnyas ${datum}, ${plan.amount} kr` : `${plan.amount} kr ${plan.suffix}`,
    lank: 'Vad ingår?',
    href,
  }
}

/** Menyns val som bär en underrad. */
export type MenyVal =
  | 'tester'
  | 'cv'
  | 'analys'
  | 'mallar'
  | 'brev'
  | 'skapa_brev'
  | 'matchning'
  | 'coach'
  | 'linkedin'
  | 'bli_upptackt'
  | 'sokta'

export interface MenyRad {
  text: string
  /** Falskt när valet ska vara grått: funktionen ingår inte i paketet. */
  ingar: boolean
  /** Featuren som spärrar ett grått val, för betalväggen. */
  feature?: Feature
  /** Betalväggens variant för ett grått val. */
  variant?: PaywallVariant
}

/**
 * Underraden för ett grått val: "Ingår i Premium". Rader som nämner
 * LinkedIn skriver fulla namnet, eftersom LinkedIn har en egen Premium
 * (copy-premium krock 2).
 */
function ingarI(val: 'linkedin' | 'annat'): string {
  return val === 'linkedin' ? `LinkedIn-optimeringen ingår i ${planNamn(SALD_PLAN)}` : `Ingår i ${paketKort()}`
}

export function menyRad(val: MenyVal, p: PaketLage): MenyRad {
  const s = p.scope
  switch (val) {
    case 'tester':
      return scopeHasFeature(s, 'tests_above_base')
        ? { text: 'Alla typer, alla nivåer, övningsprov mot klockan', ingar: true }
        : { text: 'Nivåkollen och ett grundpass samma dag', ingar: true }
    case 'cv':
    case 'analys':
      return scopeHasFeature(s, 'cv_analysis_full')
        ? { text: 'Hela analysen, alla fynd och poängen', ingar: true }
        : { text: 'Poäng och tyngsta fyndet', ingar: true }
    case 'mallar':
      return scopeHasFeature(s, 'cv_templates_all')
        ? { text: `Alla ${TEMPLATE_COUNT} mallar, nedladdning utan tak`, ingar: true }
        : { text: `${FREE_TEMPLATE_COUNT} mallar, en nedladdning`, ingar: true }
    case 'brev':
    case 'skapa_brev':
      if (scopeHasFeature(s, 'letter_download')) return { text: 'Personliga brev utan tak, som PDF', ingar: true }
      return {
        text: p.lettersLimit === 1 ? 'Ett personligt brev i veckan att läsa' : `${storForst(talOrd(p.lettersLimit ?? 1))} personliga brev i veckan att läsa`,
        ingar: true,
      }
    case 'matchning':
      return scopeHasFeature(s, 'job_matches_all')
        ? { text: 'Alla träffar per natt, med skälen', ingar: true }
        : { text: `${storForst(talOrd(FREE_TIER_JOB_LIMIT))} träffar per natt`, ingar: true }
    case 'coach': {
      if (scopeHasFeature(s, 'chat_unlimited') || p.chatLimit === null) return { text: 'Utan tak', ingar: true }
      const kvar = Math.max(0, p.chatLimit - p.chatUsed)
      return {
        text: p.chatUsed > 0 ? `${kvar} av ${p.chatLimit} meddelanden kvar` : `${p.chatLimit} meddelanden`,
        ingar: true,
      }
    }
    case 'linkedin':
      return scopeHasFeature(s, 'linkedin')
        ? { text: 'Profil som rekryterare hittar', ingar: true }
        : { text: ingarI('linkedin'), ingar: false, feature: 'linkedin', variant: 'linkedin' }
    case 'bli_upptackt':
      return scopeHasFeature(s, 'bli_upptackt')
        ? { text: 'Rekryterare hittar dig, anonymt', ingar: true }
        : { text: ingarI('annat'), ingar: false, feature: 'bli_upptackt', variant: 'bli-upptackt' }
    case 'sokta':
      return { text: 'Alltid gratis', ingar: true }
  }
}

/** Menyns fotrad för en befintlig spårkund: resten ingår i Premium. */
export function menyFot(p: PaketLage): string | null {
  if (p.planKey !== 'cv_week' && p.planKey !== 'test_week') return null
  const del = p.scope === 'tester' ? 'CV, personliga brev' : 'Testerna'
  return `${del} och allt grått ingår i ${paketKort()}, ${prisPeriod(SALD_PLAN)}.`
}

/* ------------------------------------------ gråade vyer, sektion 3 */

/** Den gråa nivåns etikett i testhubben: "Ingår i Premium" (copy-premium avsnitt 3). */
export function graEtikettTest(_scope?: Scope | null): string {
  return `Ingår i ${paketKort()}`
}

/** Testsidans huvud per paket. */
export function testHuvud(scope: Scope | null): { statusrad: string | null; rubrik: string | null; ingress: string | null } {
  if (scope === 'cv') {
    return {
      statusrad: `Du har ${planNamn('cv_week')}`,
      rubrik: `Grundnivån ingår. Resten ingår i ${paketKort()}.`,
      ingress: null,
    }
  }
  if (!scope) {
    return {
      statusrad: null,
      rubrik: null,
      ingress: `En nivåkoll med genomgång och ett första träningspass ingår gratis. Att träna vidare, övningsprov och det fördjupade personlighetstestet ingår i ${paketKort()}.`,
    }
  }
  return { statusrad: null, rubrik: null, ingress: null }
}

/** Mallsidans huvud per paket. */
export function mallHuvud(scope: Scope | null): { statusrad: string; rubrik: string; not: string } | null {
  if (scopeHasFeature(scope, 'cv_templates_all')) return null
  return {
    statusrad: scope === 'tester' ? `Du har ${planNamn('test_week')}` : 'Du är på gratisnivån',
    rubrik: `${FREE_TEMPLATE_COUNT} mallar ingår. Alla ${TEMPLATE_COUNT} ingår i ${paketKort()}.`,
    not: 'Gråa mallar går att förhandsvisa i full storlek, inte ladda ner.',
  }
}

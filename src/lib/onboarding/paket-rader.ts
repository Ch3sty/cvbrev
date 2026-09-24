// src/lib/onboarding/paket-rader.ts
//
// Menyhuvudet och underraderna (docs/design/spec-onboarding-2026-09-22.html,
// sektion 3 och 5). Menyn säger vilket paket man har, och varje val bär en
// kort mening om vad som ingår ("3 mallar, en nedladdning") eller att det
// inte ingår och i vilket paket det finns. Talen kommer ur scopet och
// kvottjänsten, aldrig hårdkodade.
//
// Klientsäker: ren data och rena funktioner.

import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { FREE_TIER_JOB_LIMIT } from '@/lib/jobmatching/freeLimit'
import { PLAN_BY_KEY, paketNamn as planNamn, paketNamnForScope, prisPeriod, type PlanKey } from '@/lib/plans/plans'
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

/** Namnet i menyn, ur PLANS via plans.ts. Utan paket: "gratisnivån". */
export function paketNamn(planKey: PlanKey | null): string {
  if (!planKey) return 'gratisnivån'
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
      under: `Tre paket, från ${PLAN_BY_KEY.all_day.amount} kr`,
      lank: 'Vad ingår?',
      href,
    }
  }
  if (p.dayPassOnly || p.planKey === 'all_day') {
    const tid = svenskTid(p.fornyasAt)
    return {
      rubrik: `Du har ${PLAN_BY_KEY.all_day.name}`,
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

/** "Ingår inte. Finns i CV-paketet och Hela paketet." */
function ingarInte(paket: 'cv' | 'allt'): string {
  return paket === 'cv'
    ? `Ingår inte. Finns i ${paketNamnForScope('cv')} och ${paketNamnForScope('allt')}.`
    : `Ingår inte. Finns i ${paketNamnForScope('allt')}.`
}

export function menyRad(val: MenyVal, p: PaketLage): MenyRad {
  const s = p.scope
  switch (val) {
    case 'tester':
      return scopeHasFeature(s, 'tests_above_base')
        ? { text: 'Alla typer, alla nivåer, provläge mot klockan', ingar: true }
        : { text: 'Grundnivån, en gång per typ och dygn', ingar: true }
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
        : { text: ingarInte('cv'), ingar: false, feature: 'linkedin', variant: 'linkedin' }
    case 'bli_upptackt':
      return scopeHasFeature(s, 'bli_upptackt')
        ? { text: 'Rekryterare hittar dig, anonymt', ingar: true }
        : { text: ingarInte('allt'), ingar: false, feature: 'bli_upptackt', variant: 'bli-upptackt' }
    case 'sokta':
      return { text: 'Alltid gratis', ingar: true }
  }
}

/** Mellanskillnaden i kronor mot Hela paketet (veckan) för ett spår, annars null. */
export function mellanskillnadKr(planKey: PlanKey | null): number | null {
  if (planKey !== 'cv_week' && planKey !== 'test_week') return null
  return Math.max(0, PLAN_BY_KEY.all_week.amount - PLAN_BY_KEY[planKey].amount)
}

/** Menyns fotrad för en spårkund: "Vill du ha CV-delen också? ..." */
export function menyFot(p: PaketLage): string | null {
  const diff = mellanskillnadKr(p.planKey)
  if (diff === null) return null
  const del = p.scope === 'tester' ? 'CV-delen' : 'testerna'
  return `Vill du ha ${del} också? ${paketNamnForScope('allt')} kostar ${diff} kr till i veckan och öppnar allt grått.`
}

/* ------------------------------------------ gråade vyer, sektion 3 */

/**
 * "Träningspaketet, 79 kr i veckan, eller Hela paketet" på testsidan,
 * "Träningspaketet, 79 kr i veckan" för gratis.
 */
export function graEtikettTest(scope: Scope | null): string {
  const pris = `${planNamn('test_week')}, ${prisPeriod('test_week')}`
  return scope ? `${pris}, eller ${paketNamnForScope('allt')}` : pris
}

/**
 * Fotknapparna: "Byt till Träningspaketet, 79 kr i veckan" och
 * "Eller Hela paketet för 20 kr till i veckan".
 * "Byt", inte "Lägg till": spårbytet går via Stripe-portalen och ersätter
 * prenumerationen. Kassan bär aldrig två paket samtidigt (saas-lead, D2 fråga 2).
 */
export function laggTillKnapp(plan: 'cv_week' | 'test_week'): string {
  return `Byt till ${planNamn(plan)}, ${prisPeriod(plan)}`
}
export function ellerAlltKnapp(fran: PlanKey | null): string | null {
  const diff = mellanskillnadKr(fran)
  return diff === null ? null : `Eller ${paketNamnForScope('allt')} för ${diff} kr till i veckan`
}

/** Testsidans huvud per paket. */
export function testHuvud(scope: Scope | null): { statusrad: string | null; rubrik: string | null; ingress: string | null } {
  if (scope === 'cv') {
    return {
      statusrad: `Du har ${planNamn('cv_week')}`,
      rubrik: `Grundnivån ingår. Resten finns i ${planNamn('test_week')}, ${prisPeriod('test_week')}.`,
      ingress: null,
    }
  }
  if (!scope) {
    return {
      statusrad: null,
      rubrik: null,
      ingress: `Grundnivån i alla fyra typer ingår gratis, en gång per typ och dygn. Nivåerna över, provläget och det fördjupade personlighetstestet finns i ${planNamn('test_week')}, ${prisPeriod('test_week')}.`,
    }
  }
  return { statusrad: null, rubrik: null, ingress: null }
}

/** Mallsidans huvud per paket. */
export function mallHuvud(scope: Scope | null): { statusrad: string; rubrik: string; not: string } | null {
  if (scopeHasFeature(scope, 'cv_templates_all')) return null
  return {
    statusrad: scope === 'tester' ? `Du har ${planNamn('test_week')}` : 'Du är på gratisnivån',
    rubrik: `${FREE_TEMPLATE_COUNT} mallar ingår. Alla ${TEMPLATE_COUNT} finns i ${planNamn('cv_week')}, ${prisPeriod('cv_week')}.`,
    not: 'Gråa mallar går att förhandsvisa i full storlek, inte ladda ned.',
  }
}

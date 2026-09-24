'use client'

/**
 * Typad eventlogg mot PostHog (docs/plan-konvertering.md, C1).
 *
 * capture() är en no-op när PostHog inte hunnit ladda, när skriptet är
 * blockerat eller när koden kör på servern. Inga anrop får kasta: mätning
 * ska aldrig kunna ta ner en sida.
 */

import type { CtaCluster } from '@/lib/cta/clusters'
import type { InstallTrigger, InstallPlatform } from '@/lib/pwa/installPrompt'
import type { PaywallVariant } from '@/components/paywall/paywall-copy'
import type { PlanKey, PlanLength } from '@/lib/plans/plans'
import type { FragaId } from '@/components/artiklar/intervjuprov/fragor'

/** Var i sidan en CTA satt när den visades eller klickades. */
export type CtaPosition = 'inline' | 'final' | 'sticky' | 'hero' | 'sidebar'

/** Varifrån hjälpredan Kom igång öppnades. */
export type KomIgangSurface = 'rad' | 'profilmeny' | 'valkomst'

/** Varför prissidan öppnades. */
export type PricingTrigger = 'quota_lock' | 'nav' | 'cta' | 'paywall'

interface ClusterContext {
  cluster?: CtaCluster
}

/**
 * Intervjuprovet i artiklarna (docs/design/intervjuprov-spec-2026-09-23.md,
 * avsnitt 4): vilken fråga och vilken artikel provet gjordes i.
 */
interface SampleIntervju {
  question?: FragaId
  slug?: string
}

/**
 * Eventnamn till egenskaper. Lägg till nya event här, inte som fria strängar
 * i komponenterna, så att namnen förblir sökbara.
 */
export interface AnalyticsEvents {
  article_viewed: ClusterContext & { slug: string }
  article_cta_shown: ClusterContext & { slug?: string; position: CtaPosition; variant?: string }
  article_cta_clicked: ClusterContext & {
    slug?: string
    position: CtaPosition
    variant?: string
    target: string
  }
  example_viewed: { kind: 'letter' | 'cv'; yrke_slug: string }
  example_cta_clicked: { kind: 'letter' | 'cv'; yrke_slug: string; target: string }
  sample_started: ClusterContext &
    SampleIntervju & { kind: 'letter' | 'cv' | 'test' | 'cv_analysis' | 'interview' | 'personality'; yrke_slug?: string }
  sample_completed: ClusterContext &
    SampleIntervju & {
      kind: 'letter' | 'cv' | 'test' | 'cv_analysis' | 'interview' | 'personality'
      yrke_slug?: string
      /** Millisekunder från start till färdigt resultat. */
      duration_ms?: number
      /** Intervjuprovets nivå, 1 till 5. */
      level?: number
    }
  signup_gate_shown: ClusterContext &
    SampleIntervju & { kind: 'letter' | 'cv' | 'test' | 'cv_analysis' | 'interview' | 'personality' }
  signup_started: ClusterContext & {
    method?: 'password' | 'google'
    source_page?: string
    source_cluster?: string
  }
  signup_completed: ClusterContext & {
    method?: 'password' | 'google'
    source_page?: string
    source_cluster?: string
  }
  draft_claimed: { kind: 'letter' | 'cv' | 'test' | 'interview' | 'personality'; yrke_slug?: string }
  activation_first_doc: { kind: 'letter' | 'cv' }
  /* ---------------------------------------------- jobbmatchningen, våg 1
     docs/plan-jobbmatchning.md avsnitt 3. Målet är andelen träffar som
     leder till brev, alltså match_letter_started delat med match_viewed. */
  match_page_viewed: { has_cv: boolean; has_preferences: boolean }
  match_preferences_saved: {
    /** Var preferenserna ändrades. */
    source: 'profil' | 'matchningar'
    locations: number
    remote: boolean
    extent: 'heltid' | 'deltid' | ''
    /** Bara om lönen är satt, aldrig beloppet. Lön lämnar inte vår sida. */
    has_min_salary: boolean
  }
  match_search_run: {
    /** Antal annonser vi läst igenom. */
    ads_read: number
    /** Antal som passade, alltså träffarna i listan. */
    matches: number
    custom_query: boolean
  }
  match_viewed: { job_id: string; relevance?: number; position?: number }
  match_letter_started: { job_id: string; relevance?: number }
  match_applied: { job_id: string }
  /* ------------------------------------------ Jobbcoach på hemskärmen
     docs/plan-pwa.md avsnitt 6. Talet vi är ute efter är pwa_installed
     delat med pwa_prompt_shown, uppdelat per trigger: då ser vi vilket av
     de fyra ögonblicken som faktiskt förtjänar frågan. pwa_launch mäter det
     som är hela poängen, alltså att ikonen ger återkomster. */
  pwa_prompt_shown: { trigger: InstallTrigger; platform: InstallPlatform }
  pwa_prompt_accepted: { trigger: InstallTrigger; platform: InstallPlatform }
  pwa_prompt_dismissed: { trigger: InstallTrigger; platform: InstallPlatform }
  pwa_installed: Record<string, never>
  pwa_launch: Record<string, never>
  /* ------------------------------------------------------- betalväggarna
     docs/plan-copy-inloggat.md avsnitt 6. Talet vi vill åt är
     paywall_cta_clicked delat med paywall_shown, uppdelat per variant: utan
     det paret går betalväggscopyn inte att mäta, och betalväggarna är fyra
     av sju konverteringspunkter. surface är sidan eller routen händelsen
     inträffade på, plan sätts först när ett produktval faktiskt finns. */
  paywall_shown: {
    /**
     * Betalväggarnas varianter, plus onboardingens två egna ytor. De senare
     * renderas inte av PaywallCard och bor därför inte i paywall-copy.ts,
     * men de ska mätas i samma par som resten (docs/plan-paket-och-onboarding.md).
     */
    variant: PaywallVariant | 'onboarding_paket' | 'fel-spar'
    /** Sidan eller routen kortet visades på. */
    surface: string
    plan?: PlanKey
    /** Funktionen som spärrade. Kopplar betalväggen till feature_blocked. */
    feature?: string
    /** Paketet knappen föreslår, ur suggestPlan. */
    suggestedPlan?: PlanKey
    /** Sant från 2026-09-24: kortet visar pris i knappen och en prisrad. */
    price_shown?: boolean
  }
  paywall_cta_clicked: {
    variant: PaywallVariant | 'onboarding_paket' | 'fel-spar'
    surface: string
    plan?: PlanKey
    /** Ink-knappen eller textlänken under den. */
    cta: 'primary' | 'secondary'
  }
  /* Prissidan finns på två ytor: den publika /priser och den inloggade
     prenumerationsvyn (docs/plan-paket-och-onboarding.md, Fas 2D). surface
     skiljer dem åt, state säger vilket av de tre inloggade tillstånden som
     ritades. trigger står kvar för anroparna som bara har det. */
  pricing_viewed: ClusterContext & {
    trigger: PricingTrigger
    surface?: 'public' | 'account'
    logged_in?: boolean
    scope?: string | null
    track?: string | null
    state?: 'free' | 'track' | 'all'
  }
  /* ------------------------------------------ paket och onboarding
     docs/plan-paket-och-onboarding.md avsnitt 6. Tre mätpunkter: spårval
     till köp, köp till kommit igång inom 24 h, och förnyelse vecka 1 till
     vecka 2. feature_blocked är den viktigaste av alla: den mäter var fel
     spår tar i taket, alltså var uppförsäljningen finns. Dubbelräkning
     förstör den, så den skjuts en gång per montering. */
  track_selected: {
    track: 'cv' | 'tester' | 'allt' | null
    surface: string
    /** Skiljer den som valde spår för att köpa från den som valde gratis. */
    intent?: 'purchase' | 'free'
  }
  track_changed: { from: string | null; to: string | null; surface: string }
  /* Köpsteget (skärm 1.2 i ValjSparClient) och vägen till Stripe. Tratten i
     adminen läser pageview, signup_completed, track_selected,
     purchase_step_viewed, checkout_started och subscription_paid, med plan
     som uppdelning där den finns. consent_checked ligger mellan de två sista
     så att en bortfallen kryssruta går att skilja från en bortfallen kassa. */
  purchase_step_viewed: { plan: PlanKey; surface: string }
  consent_checked: { plan: PlanKey }
  checkout_started: { plan: PlanKey; length: PlanLength }
  /* Välkomstskärmen efter köpet, /dashboard/vecka/start. */
  welcome_viewed: { paket: 'cv' | 'tester' | 'allt'; has_cv: boolean }
  /* Kvitteringarna skjuts från servern (src/lib/analytics/server.ts) när
     brickan faktiskt provas; klienten skjuter bara spårvalet med index 0.
     paket är det köpta paketet, track finns kvar för spårvalet. */
  onboarding_step_completed: {
    paket?: 'cv' | 'tester' | 'allt' | null
    track?: 'cv' | 'tester' | 'allt' | null
    step: string
    index: number
    hours_since_purchase?: number
  }
  onboarding_completed: {
    paket?: 'cv' | 'tester' | 'allt' | null
    track?: 'cv' | 'tester' | 'allt' | null
    hours_since_purchase?: number
  }
  /* Hjälpredan Kom igång (spec-onboarding 2026-09-22): arket öppnat, och
     ett grått val tryckt i meny eller vy. surface säger varifrån arket
     öppnades: raden, profilmenyn eller välkomstskärmens "Visa allt som ingår". */
  komigang_opened: {
    paket: 'cv' | 'tester' | 'allt' | null
    provade: number
    totalt: number
    surface: KomIgangSurface
  }
  gray_option_tapped: { feature: string; scope: string | null; surface: string }
  /* Skjuts från servern vid Stripes invoice.payment_succeeded med
     billing_reason subscription_cycle. cycle är 1 för första förnyelsen. */
  renewal_succeeded: { plan: PlanKey; cycle: number }
  upgrade_shown: { from_scope: string | null; to_scope: string; surface: string }
  feature_blocked: { feature: string; scope: string | null; surface: string }
  /* Prissidan. Spåret väljs först, längden efteråt (ägarens beslut 4), så
     plan_length_changed mäter det andra valet: byter någon längd alls, och
     i så fall till vilken? Jämförelsen och frågorna mäts för att se om
     prissidan behöver mer eller mindre text. */
  plan_length_changed: { plan: PlanKey; surface: string }
  pricing_comparison_viewed: Record<string, never>
  pricing_faq_opened: { question: string }
  /* Uppsägningen. Talet vi följer är cancel_started delat med aktiva, och
     orsakerna ligger kvar i cancel_intents. */
  cancel_started: { plan: PlanKey; surface: string }
  subscription_paid: { plan: string; amount?: number }
  /* ---------------------------------------------- Inför intervjun
     docs/design/rod-trad-prov-spec-2026-09-24.md avsnitt 4. */
  interview_hub_viewed: {
    prov_count: number
    has_profile: 'none' | 'sample' | 'full'
    scope: string | null
    next_action: string
  }
  interview_practice_started: { question: FragaId; surface: 'dashboard' }
  interview_practice_completed: { question: FragaId; level: number; surface: 'dashboard' }
  next_action_shown: { kind: string; surface: 'infor-intervjun' | 'hem' }
}

export type AnalyticsEventName = keyof AnalyticsEvents

/**
 * posthog-js lägger sig på window när init har kört. Vi läser den därifrån i
 * stället för att importera modulen: en statisk import drar in hela
 * biblioteket (379 kB) i den delade runtimen, och då hämtas det på varje
 * publik sidladdning även om ingen händelse någonsin skickas.
 */
type PosthogKlient = {
  __loaded?: boolean
  capture: (event: string, properties?: Record<string, unknown>) => void
  identify: (id: string, properties?: Record<string, unknown>) => void
}

function posthogKlient(): PosthogKlient | null {
  if (typeof window === 'undefined') return null
  const p = (window as unknown as { posthog?: PosthogKlient }).posthog
  // __loaded sätts av posthog-js när init hunnit klart. Saknas den är
  // skriptet blockerat eller ännu inte igång.
  return p?.__loaded ? p : null
}

/**
 * Händelser som inträffade innan klienten hunnit initieras.
 *
 * PostHogIdentify startar init:en först efter LCP, med ett tak på fyra
 * sekunder. Allt som mäts vid montering ligger alltså före klienten, och en
 * tyst no-op skulle tappa just de händelserna. Kön är avsiktligt liten: den
 * håller ett rimligt antal och släpper de äldsta om något skulle spamma.
 */
const KO_TAK = 50
let ko: Array<[string, Record<string, unknown> | undefined]> = []
let tomningSchemalagd = false

function skicka(ph: PosthogKlient, event: string, properties?: Record<string, unknown>): void {
  try {
    ph.capture(event, properties)
  } catch {
    // Mätning får aldrig kasta vidare.
  }
}

function tomKo(): void {
  const ph = posthogKlient()
  if (!ph) {
    // Klienten är fortfarande inte uppe. Titta igen om en stund, så länge
    // det finns något att skicka.
    if (ko.length > 0) setTimeout(tomKo, 1000)
    else tomningSchemalagd = false
    return
  }
  tomningSchemalagd = false
  const väntande = ko
  ko = []
  for (const [event, properties] of väntande) skicka(ph, event, properties)
}

/**
 * Skickar ett event. Köas när PostHog ännu inte hunnit initieras och skickas
 * då så snart klienten finns.
 */
export function capture<E extends AnalyticsEventName>(
  event: E,
  properties?: AnalyticsEvents[E]
): void {
  if (typeof window === 'undefined') return
  const props = properties as Record<string, unknown> | undefined
  const ph = posthogKlient()
  if (ph) {
    skicka(ph, event, props)
    return
  }
  ko.push([event, props])
  if (ko.length > KO_TAK) ko.shift()
  if (!tomningSchemalagd) {
    tomningSchemalagd = true
    setTimeout(tomKo, 1000)
  }
}

/**
 * Kopplar ett registrerat konto till den anonyma sessionen. Anropas av spår B
 * direkt efter lyckad registrering eller inloggning.
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  const ph = posthogKlient()
  if (!ph) return
  try {
    ph.identify(userId, properties)
  } catch {
    // Se ovan.
  }
}

'use client'

/**
 * Typad eventlogg mot PostHog (docs/plan-konvertering.md, C1).
 *
 * capture() är en no-op när PostHog inte hunnit ladda, när skriptet är
 * blockerat eller när koden kör på servern. Inga anrop får kasta: mätning
 * ska aldrig kunna ta ner en sida.
 */

import type { CtaCluster } from '@/lib/cta/clusters'

/** Var i sidan en CTA satt när den visades eller klickades. */
export type CtaPosition = 'inline' | 'final' | 'sticky' | 'hero' | 'sidebar'

/** Varför prissidan öppnades. */
export type PricingTrigger = 'quota_lock' | 'nav' | 'cta' | 'paywall'

interface ClusterContext {
  cluster?: CtaCluster
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
  sample_started: ClusterContext & { kind: 'letter' | 'cv' | 'test' | 'cv_analysis'; yrke_slug?: string }
  sample_completed: ClusterContext & {
    kind: 'letter' | 'cv' | 'test' | 'cv_analysis'
    yrke_slug?: string
    /** Millisekunder från start till färdigt resultat. */
    duration_ms?: number
  }
  signup_gate_shown: ClusterContext & { kind: 'letter' | 'cv' | 'test' | 'cv_analysis' }
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
  draft_claimed: { kind: 'letter' | 'cv' | 'test'; yrke_slug?: string }
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
  pricing_viewed: ClusterContext & { trigger: PricingTrigger }
  trial_started: { source: string }
  subscription_paid: { plan: string; amount?: number }
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
 * Skickar ett event. Tyst no-op när PostHog inte är laddad.
 */
export function capture<E extends AnalyticsEventName>(
  event: E,
  properties?: AnalyticsEvents[E]
): void {
  const ph = posthogKlient()
  if (!ph) return
  try {
    ph.capture(event, properties as Record<string, unknown> | undefined)
  } catch {
    // Mätning får aldrig kasta vidare.
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

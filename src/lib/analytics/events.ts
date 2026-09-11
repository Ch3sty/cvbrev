'use client'

/**
 * Typad eventlogg mot PostHog (docs/plan-konvertering.md, C1).
 *
 * capture() är en no-op när PostHog inte hunnit ladda, när skriptet är
 * blockerat eller när koden kör på servern. Inga anrop får kasta: mätning
 * ska aldrig kunna ta ner en sida.
 */

import posthog from 'posthog-js'
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
  pricing_viewed: ClusterContext & { trigger: PricingTrigger }
  trial_started: { source: string }
  subscription_paid: { plan: string; amount?: number }
}

export type AnalyticsEventName = keyof AnalyticsEvents

function posthogReady(): boolean {
  if (typeof window === 'undefined') return false
  // __loaded sätts av posthog-js när init hunnit klart. Saknas den är
  // skriptet blockerat eller ännu inte igång.
  return Boolean((posthog as unknown as { __loaded?: boolean }).__loaded)
}

/**
 * Skickar ett event. Tyst no-op när PostHog inte är laddad.
 */
export function capture<E extends AnalyticsEventName>(
  event: E,
  properties?: AnalyticsEvents[E]
): void {
  if (!posthogReady()) return
  try {
    posthog.capture(event, properties as Record<string, unknown> | undefined)
  } catch {
    // Mätning får aldrig kasta vidare.
  }
}

/**
 * Kopplar ett registrerat konto till den anonyma sessionen. Anropas av spår B
 * direkt efter lyckad registrering eller inloggning.
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (!posthogReady()) return
  try {
    posthog.identify(userId, properties)
  } catch {
    // Se ovan.
  }
}

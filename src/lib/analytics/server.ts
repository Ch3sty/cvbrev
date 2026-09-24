/**
 * Serverside-mätning mot PostHog (docs/plan-paket-och-onboarding.md
 * avsnitt 6).
 *
 * Fyra händelser kan bara mätas säkert på servern: betalningen och
 * förnyelsen kommer från Stripes webhook, och brickorna i hjälpredan
 * kvitteras i rutterna när handlingen faktiskt sker. Alla fyra går genom den
 * här hjälparen, som är samma fetch-mönster som webhooken hade lokalt:
 * PostHogs /capture/ med projektnyckeln och användar-id som distinct_id, så
 * händelsen landar på samma person som klientens identify.
 *
 * Fire and forget för de flesta anropare: löftet avvisas aldrig och behöver
 * inte väntas in. PostHog får varken fälla ett svar till Stripe (då
 * kommer eventet igen och vi bokför det två gånger) eller fördröja en
 * kvittering. Alla fel fångas och loggas som varning.
 */

import type { AnalyticsEvents } from './events'

/** Händelserna servern får skjuta. Övriga skjuts av klienten. */
export type ServerEventName =
  | 'subscription_paid'
  | 'renewal_succeeded'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  /** Bara från Google-callbacken; lösenordskonton skjuts av RegisterKontoSteg. */
  | 'signup_completed'

export type ServerEventProperties<E extends ServerEventName> = AnalyticsEvents[E] & {
  /** Fria tilläggsfält, till exempel scope och amount_sek på betalningen. */
  [extra: string]: unknown
}

/** Vad ett anrop skickar. Exporterat för testerna. */
export interface CapturePayload {
  api_key: string
  event: string
  distinct_id: string
  properties: Record<string, unknown>
  timestamp: string
}

/** Var PostHog-projektet bor. Klientens publika token räcker för /capture/. */
function konfiguration(): { apiKey: string; host: string } | null {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  if (!apiKey) return null
  const host = (process.env.POSTHOG_HOST ?? process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.posthog.com')
    .replace(/\/$/, '')
  return { apiKey, host }
}

/**
 * Skjuter en händelse från servern. Returnerar löftet för anropet, som
 * aldrig avvisas. Webhooken och rutterna väntar inte på det; Google-callbacken
 * väntar med ett tak (vantaMedTak nedan), eftersom en serverless-funktion
 * annars fryses vid redirecten innan anropet hunnit iväg.
 */
export function captureServer<E extends ServerEventName>(
  event: E,
  distinctId: string,
  properties: ServerEventProperties<E>
): Promise<void> {
  const konf = konfiguration()
  if (!konf) return Promise.resolve()
  if (!distinctId) return Promise.resolve()

  const payload: CapturePayload = {
    api_key: konf.apiKey,
    event,
    distinct_id: distinctId,
    properties: {
      ...properties,
      // Serverhändelser ska gå att skilja från klientens i PostHog, och
      // $lib är fältet PostHog själv använder för det.
      $lib: 'jobbcoach-server',
    },
    timestamp: new Date().toISOString(),
  }

  try {
    return fetch(`${konf.host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(
      () => undefined,
      (error: unknown) => {
        console.warn(`[POSTHOG] ${event} kunde inte skickas:`, (error as Error)?.message ?? error)
      }
    )
  } catch (error: unknown) {
    console.warn(`[POSTHOG] ${event} kastade:`, (error as Error)?.message ?? error)
    return Promise.resolve()
  }
}

/**
 * Väntar in ett löfte högst takMs millisekunder. Svarar sant om löftet hann
 * klart. Används där ett anrop måste hinna iväg före en redirect men aldrig
 * får hålla kvar användaren (Google-callbackens signup_completed, 1,5 s).
 */
export async function vantaMedTak(lofte: Promise<unknown>, takMs = 1500): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | null = null
  const tak = new Promise<boolean>((resolve) => {
    timer = setTimeout(() => resolve(false), takMs)
  })
  try {
    return await Promise.race([lofte.then(() => true, () => true), tak])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/**
 * Timmar sedan en tidpunkt, med en decimal. Null när tidpunkten saknas
 * eller inte går att läsa: en okänd köptid ska inte bli "0 timmar sedan".
 */
export function timmarSedan(iso: string | null | undefined, nu: Date = new Date()): number | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const timmar = (nu.getTime() - d.getTime()) / 3_600_000
  if (!Number.isFinite(timmar) || timmar < 0) return null
  return Math.round(timmar * 10) / 10
}

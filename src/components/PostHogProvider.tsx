'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Initierar PostHog och identifierar inloggade användare.
 *
 * Init:en låg tidigare i instrumentation-client.ts. Next bundlar den filen i
 * huvudentryn (rootMainFiles), så posthog-js hamnade i den delade runtimen
 * och hämtades före hydrering på varje sidladdning, även med dynamisk import
 * och fördröjd init. Mätningen av de publika sidorna visade att de två största
 * JS-filerna före LCP båda var PostHog, 276 kB överfört, på en artikelsida där
 * LCP-elementet är en H1 som redan står i server-HTML.
 *
 * Här är vi en vanlig klientkomponent. Koden hamnar i en egen chunk som
 * hämtas först när webbläsaren är ledig. Autocapture och pageviews fungerar
 * som förut, den första pageview-händelsen skickas när init:en kört.
 */

let initierad = false

function starta(): void {
  if (initierad) return
  initierad = true
  void import('posthog-js').then(({ default: posthog }) => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: '2026-01-30',
      // Ladda inte rrweb-recorder (~52 KiB) och surveys (~32 KiB) vid sidstart.
      // De blockerar initial render utan att användas. Autocapture + pageviews
      // behålls. Vill vi spela in sessioner senare: posthog.startSessionRecording().
      disable_session_recording: true,
      disable_surveys: true,
    })
    // Gör klienten läsbar för src/lib/analytics/events.ts, som medvetet
    // undviker en egen import av samma skäl.
    ;(window as unknown as { posthog?: unknown }).posthog = posthog
  })
}

export default function PostHogIdentify() {
  const { user } = useAuth()

  // Starta när webbläsaren är ledig. Taket gör att händelser inte tappas på
  // en sida som aldrig blir riktigt ledig.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const w = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
        cancelIdleCallback?: (id: number) => void
      }
    // requestIdleCallback utlöses vid huvudtrådens första lucka, och den
    // luckan kommer före LCP på en tung artikelsida. Mätningen visade att
    // posthog-js (173 kB) då hämtades vid 1135 ms och låg före LCP ändå.
    // Vi väntar därför tills sidan har målat sitt största element, och
    // faller tillbaka på en timer om LCP aldrig rapporteras.
    let startad = false
    const kor = () => {
      if (startad) return
      startad = true
      starta()
    }

    let obs: PerformanceObserver | null = null
    try {
      obs = new PerformanceObserver(() => {
        // Ge målningen en tick till innan vi lägger 173 kB på tråden.
        w.setTimeout(kor, 300)
      })
      obs.observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {
      // Webbläsare utan LCP-stöd faller igenom till timern nedan.
    }

    const id = w.setTimeout(kor, 4000)
    return () => {
      obs?.disconnect()
      w.clearTimeout(id)
    }
  }, [])

  useEffect(() => {
    let avbruten = false

    void import('posthog-js').then(({ default: posthog }) => {
      // Init:en kan ännu inte ha kört. Då har vi inget att identifiera mot,
      // och nästa körning av effekten tar det.
      if (avbruten || !posthog.__loaded) return

      if (user) {
        posthog.identify(user.id, {
          email: user.email,
        })
      } else {
        posthog.reset()
      }
    })

    return () => {
      avbruten = true
    }
  }, [user])

  return null
}

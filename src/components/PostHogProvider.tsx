'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { arTestEpost } from '@/lib/admin/undantag'

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
 * hämtas först när besökaren gör något på sidan, eller direkt efter
 * målningen för den som är inloggad. Autocapture och pageviews fungerar som
 * förut, den första pageview-händelsen skickas när init:en kört.
 */

let initierad = false

type Anvandare = { id: string; email?: string | null }

/** Den inloggade användaren som senast sågs, för identify efter init. */
let aktuell: Anvandare | null = null

type Posthog = typeof import('posthog-js').default

function identifiera(posthog: Posthog, user: Anvandare): void {
  // Testkonton markeras som interna redan vid identify, så att adminens
  // HogQL-frågor och dashboarden kan filtrera bort dem
  // (docs/design/spec-admin-tydlighet-2026-09-22.html, princip 6).
  // Adminkonton markeras av MarkeraIntern i adminlayouten.
  posthog.identify(user.id, {
    email: user.email,
    ...(arTestEpost(user.email) ? { is_internal: true } : {}),
  })
}

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
    // Användaren kan ha varit känd innan init:en hann köra.
    if (aktuell) identifiera(posthog, aktuell)
  })
}

export default function PostHogIdentify() {
  const { user } = useAuth()

  // När startar vi? Inloggad: direkt efter att sidan målats, som förut.
  // Besökare på en publik sida: först när hon gör något, alltså scrollar,
  // trycker, klickar eller skriver. posthog-js är den största enskilda
  // filen som laddas efter sidan (173 kB), och en besökare som bara läser
  // rubriken och går betalade den tidigare ändå. Händelser som mäts innan
  // dess ligger i kön i src/lib/analytics/events.ts och skickas vid start.
  // Priset är att en besökare som lämnar utan att röra sidan inte räknas
  // som sidvisning (docs/bygg-noter-paket.md, Efterarbete: avgjort).
  useEffect(() => {
    if (typeof window === 'undefined') return
    let startad = false
    const kor = () => {
      if (startad) return
      startad = true
      stada()
      starta()
    }

    const HANDELSER = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const
    const stada = () => {
      for (const h of HANDELSER) window.removeEventListener(h, kor, true)
      obs?.disconnect()
      if (timer) window.clearTimeout(timer)
    }

    let obs: PerformanceObserver | null = null
    let timer = 0

    if (user) {
      // Inloggad: vänta tills sidan målat sitt största element och ge
      // målningen en tick, med en timer som tak.
      try {
        obs = new PerformanceObserver(() => {
          timer = window.setTimeout(kor, 300)
        })
        obs.observe({ type: 'largest-contentful-paint', buffered: true })
      } catch {
        // Webbläsare utan LCP-stöd faller igenom till timern nedan.
      }
      if (!timer) timer = window.setTimeout(kor, 4000)
    }

    for (const h of HANDELSER) window.addEventListener(h, kor, { capture: true, passive: true, once: true })
    return stada
  }, [user])

  useEffect(() => {
    const forra = aktuell
    aktuell = user ? { id: user.id, email: user.email } : null
    // Innan init finns inget att identifiera mot; starta() tar det.
    if (!initierad) return
    let avbruten = false

    void import('posthog-js').then(({ default: posthog }) => {
      if (avbruten || !posthog.__loaded) return
      if (user) identifiera(posthog, { id: user.id, email: user.email })
      // Bara vid utloggning. En anonym besökare ska behålla sitt id mellan
      // sidorna, annars går tratten från landning till konto inte att följa.
      else if (forra) posthog.reset()
    })

    return () => {
      avbruten = true
    }
  }, [user])

  return null
}

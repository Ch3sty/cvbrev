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
 * hämtas när sidan är färdigladdad och webbläsaren ledig, aldrig i den
 * kritiska vägen. Autocapture och pageviews fungerar som förut, den första
 * pageview-händelsen skickas när init:en kört.
 *
 * Samtycket (src/components/samtycke/CookieBanner.tsx) styr lagringen.
 * Har besökaren tryckt Acceptera sparar PostHog sitt id i cookie och
 * localStorage som förut. Annars körs PostHog med persistence 'memory':
 * inga cookies, ingen localStorage, och id:t lever bara i fliken. Trycker
 * hon Acceptera senare byts lagringen direkt och id:t följer med.
 *
 * Har besökaren tryckt Avvisa startar PostHog inte alls, och trycker hon
 * Avvisa medan PostHog redan kör stängs mätningen av direkt
 * (opt_out_capturing). Ägarens beslut 2026-10-13: Avvisa betyder ingen
 * mätning, inte bara inga cookies.
 */

let initierad = false

type Anvandare = { id: string; email?: string | null }

/** Den inloggade användaren som senast sågs, för identify efter init. */
let aktuell: Anvandare | null = null

type Posthog = typeof import('posthog-js').default

const SAMTYCKE_COOKIE = 'cvBrevCookieConsent'

/** Sant när besökaren har tryckt Avvisa i cookie-raden. */
export function harAvvisat(): boolean {
  if (typeof document === 'undefined') return false
  try {
    return new RegExp(`(?:^|; )${SAMTYCKE_COOKIE}=false(?:;|$)`).test(document.cookie)
  } catch {
    return false
  }
}

/** Sant när besökaren har tryckt Acceptera i cookie-raden. */
export function harAnalysSamtycke(): boolean {
  if (typeof document === 'undefined') return false
  try {
    return new RegExp(`(?:^|; )${SAMTYCKE_COOKIE}=true(?:;|$)`).test(document.cookie)
  } catch {
    return false
  }
}

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

/**
 * Byter till sparat id när besökaren trycker Acceptera och stänger av
 * mätningen när hon trycker Avvisa. Cookie-raden är
 * server-HTML med ett eget skript (inte React), så vi lyssnar på klicket i
 * stället för att ändra raden. Bannerns skript sätter cookien i samma klick.
 */
function lyssnaPaSamtycke(posthog: Posthog): void {
  const vidKlick = (e: Event) => {
    const mal = e.target as Element | null
    const knapp = mal?.closest?.('[data-samtycke]')
    if (!knapp) return
    document.removeEventListener('click', vidKlick, true)
    try {
      if (knapp.getAttribute('data-samtycke') === 'true') posthog.set_config({ persistence: 'localStorage+cookie' })
      else posthog.opt_out_capturing()
    } catch {
      // Mätning får aldrig kasta vidare.
    }
  }
  document.addEventListener('click', vidKlick, true)
}

function starta(): void {
  if (initierad) return
  initierad = true
  // Avvisa betyder ingen mätning alls: posthog-js hämtas inte ens.
  if (harAvvisat()) return
  void import('posthog-js').then(({ default: posthog }) => {
    const samtycke = harAnalysSamtycke()
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: '2026-01-30',
      // Utan samtycke: inga cookies och ingen localStorage (se ovan).
      persistence: samtycke ? 'localStorage+cookie' : 'memory',
      // Ladda inte rrweb-recorder (~52 KiB) och surveys (~32 KiB) vid sidstart.
      // De blockerar initial render utan att användas. Autocapture + pageviews
      // behålls. Vill vi spela in sessioner senare: posthog.startSessionRecording().
      disable_session_recording: true,
      disable_surveys: true,
      // Ofångade fel och avvisade löften som $exception (undersökningen
      // 2026-10-12: registreringarna föll utan att något fel syntes).
      // Felen före init fångas inte, och ett fel i startögonblicket syns
      // i Vercels loggar i stället.
      capture_exceptions: true,
    })
    if (!samtycke) lyssnaPaSamtycke(posthog)
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
  // Besökare på en publik sida: när sidan laddat klart (load) och
  // webbläsaren är ledig, eller tidigare om hon hinner scrolla, trycka eller
  // skriva. Då räknas också den som läser och går utan att röra sidan
  // (ägarens beslut 2026-10-13; mellan 23 september och 13 oktober startade
  // PostHog först vid interaktion och de besökarna syntes inte).
  // posthog-js är den största enskilda filen efter sidan (173 kB), så den
  // hämtas aldrig före load och aldrig före LCP. Händelser som mäts innan
  // dess ligger i kön i src/lib/analytics/events.ts och skickas vid start.
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
    let obs: PerformanceObserver | null = null
    let timer = 0
    let ledig = 0

    const vidLedig = () => {
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opt?: { timeout: number }) => number
      }
      // Safari saknar requestIdleCallback; en kort timer efter load räcker.
      if (w.requestIdleCallback) ledig = w.requestIdleCallback(kor, { timeout: 3000 })
      else timer = window.setTimeout(kor, 1000)
    }

    const stada = () => {
      for (const h of HANDELSER) window.removeEventListener(h, kor, true)
      window.removeEventListener('load', vidLedig)
      obs?.disconnect()
      if (timer) window.clearTimeout(timer)
      const w = window as Window & { cancelIdleCallback?: (id: number) => void }
      if (ledig && w.cancelIdleCallback) w.cancelIdleCallback(ledig)
    }

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
    } else if (document.readyState === 'complete') {
      vidLedig()
    } else {
      window.addEventListener('load', vidLedig, { once: true })
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

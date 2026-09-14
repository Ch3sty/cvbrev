'use client'

/**
 * Registrerar service workern och kopplar webbläsarens installationsevent
 * till vår store (docs/plan-pwa.md, avsnitt 6).
 *
 * Komponenten renderar ingenting. Den ligger i klientlayouten och kör bara
 * på appytorna, alltså under /dashboard. Publika sidor behöver den inte:
 * installationen erbjuds bara den som är inne i tjänsten.
 *
 * Tre saker händer, i den ordningen:
 *
 *   1. Sessionen stämplas direkt. Regeln "inte på första besöket" bygger på
 *      att det finns en stämpel från ett tidigare besök, och den måste alltså
 *      sättas även den gång då frågan inte visas.
 *   2. pwa_launch skickas om sidan öppnades från hemskärmen. Det är hela
 *      poängen med installationen, så det är det talet vi vill följa.
 *   3. Service workern registreras efter load, och beforeinstallprompt fångas
 *      upp. Ingetdera hör till den kritiska vägen, så båda väntar på idle.
 *
 * Prestanda: registreringen sker efter att sidan laddat och sedan på idle.
 * Ingenting här ritar något, så komponenten kan inte orsaka layoutskifte.
 */

import { useEffect } from 'react'
import { capture } from '@/lib/analytics/events'
import {
  arStandalone,
  markeraInstallerad,
  markeraSession,
  requestInstallPrompt,
  taEmotInstallPrompt,
  type BeforeInstallPromptEvent,
  type InstallTrigger,
} from '@/lib/pwa/installPrompt'
import { scheduleIdle } from '@/lib/scheduleIdle'

export default function PwaRegister() {
  useEffect(() => {
    // 1. Stämpla enhetens första session, oavsett allt annat.
    markeraSession()

    // 2. Startades appen från hemskärmen? start_url bär source=pwa, och
    //    display-mode standalone fångar de fall där användaren navigerat
    //    vidare inne i appen innan mätningen hann köra.
    try {
      const franHemskarm =
        new URLSearchParams(window.location.search).get('source') === 'pwa'
      if (franHemskarm || arStandalone()) {
        capture('pwa_launch', {})
      }
    } catch {
      /* mätning får aldrig kasta */
    }

    // 3. Webbläsarens installationsevent.
    const onBeforeInstall = (event: Event) => {
      // preventDefault krävs, annars visar Chrome sin egen banner och
      // eventet går inte att spara till senare.
      event.preventDefault()
      taEmotInstallPrompt(event as BeforeInstallPromptEvent)
    }

    const onInstalled = () => {
      markeraInstallerad()
      capture('pwa_installed', {})
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    // Sömmen som klicktestet drar i (scripts/qa-pwa.ts). De fyra triggerna
    // sitter längst in i fyra långa flöden: ett brev måste genereras och
    // sparas, ett test måste köras klart, en matchning måste hämta riktiga
    // annonser. Att köra alla fyra i ett webbläsartest skulle göra testet
    // långsamt och beroende av edge-funktioner som kan ligga nere, och det
    // som faktiskt ska testas är raden, inte flödena.
    //
    // Kroken är samma funktion de fyra stallena anropar, så testet går genom
    // exakt samma regler. Den läser ingenting och ändrar ingenting som inte
    // en knapptryckning i appen redan gör.
    const w = window as typeof window & {
      __pwaTrigga?: (trigger: InstallTrigger) => boolean
    }
    w.__pwaTrigga = requestInstallPrompt

    // Registreringen av service workern kostar en rundtur och en trådstund.
    // Inget av det behövs för att sidan ska bli användbar, så den väntar tills
    // webbläsaren är ledig.
    let avbrytIdle: (() => void) | null = null

    const registrera = () => {
      avbrytIdle = scheduleIdle(() => {
        if (!('serviceWorker' in navigator)) return
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
          // Blockerad av inställningar, privat läge eller en proxy. Då
          // erbjuder webbläsaren ingen installation, och det är hela
          // konsekvensen.
        })
      }, 3000)
    }

    if (document.readyState === 'complete') {
      registrera()
    } else {
      window.addEventListener('load', registrera, { once: true })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener('load', registrera)
      avbrytIdle?.()
      delete w.__pwaTrigga
    }
  }, [])

  return null
}

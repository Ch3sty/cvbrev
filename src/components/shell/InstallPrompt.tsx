'use client'

/**
 * Frågan om hemskärmen (docs/plan-pwa.md, avsnitt 3 och 4).
 *
 * En rad i skalet ovanför bottennavet, samma form som e-postraden: 44 px hög,
 * panel med kant, text till vänster, en textknapp och ett kryss till höger.
 * Ingen modal, ingen orange yta, ingen ikon i raden. Frågan är liten därför
 * att den ska gå att ignorera.
 *
 * På Android öppnar "Lägg till" webbläsarens egen dialog. På iPhone finns
 * ingen sådan dialog, så knappen öppnar i stället ett ark med de tre steg
 * användaren måste göra själv, med dela-ikonen ritad i vårt ikonspråk.
 *
 * CLS: raden finns inte i DOM förrän en trigger öppnat den, och den öppnas
 * bara efter en användarhandling, aldrig vid inladdning. Det som skulle
 * kunna skifta är innehållet under raden, och den ligger fixerad ovanför
 * navet i stället för i flödet, så ingenting flyttar sig.
 *
 * Reglerna för när raden får visas bor inte här utan i lib/pwa/installPrompt,
 * så att de går att testa utan en webbläsare.
 */

import { useEffect, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import { X } from 'lucide-react'
import { capture } from '@/lib/analytics/events'
import {
  avfarda,
  lasServerState,
  lasState,
  markeraIosKlar,
  oppnaArk,
  prenumerera,
  stangArk,
  visaSystemdialog,
} from '@/lib/pwa/installPrompt'

// Arket öppnas bara på iPhone och bara efter ett tryck. Det ska inte ligga i
// samma paket som raden.
const InstallSheet = dynamic(() => import('./InstallSheet'), { ssr: false })

export default function InstallPrompt() {
  const state = useSyncExternalStore(prenumerera, lasState, lasServerState)

  // Mätningen hör till att raden visades, inte till att den renderades om.
  // Effekten beror därför bara på triggern, som sätts en gång per visning.
  useEffect(() => {
    if (!state.synlig || !state.trigger) return
    capture('pwa_prompt_shown', {
      trigger: state.trigger,
      platform: state.plattform,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.synlig, state.trigger])

  if (!state.synlig || !state.trigger) return null

  const { trigger, plattform } = state

  const laggTill = async () => {
    if (plattform === 'ios') {
      capture('pwa_prompt_accepted', { trigger, platform: plattform })
      oppnaArk()
      return
    }

    const utfall = await visaSystemdialog()
    if (utfall === 'accepted') {
      capture('pwa_prompt_accepted', { trigger, platform: plattform })
    } else {
      // Avslag i systemdialogen, eller ingen dialog kvar att visa. Båda
      // betyder att appen inte lades till.
      capture('pwa_prompt_dismissed', { trigger, platform: plattform })
    }
  }

  const stang = () => {
    capture('pwa_prompt_dismissed', { trigger, platform: plattform })
    avfarda()
  }

  return (
    <>
      {/* Raden ligger ovanför den fot som råkar finnas: bottennavet på en
          vanlig sida, FlowShells fot i ett flöde. Båda höjderna publiceras
          som CSS-variabler av den som äger dem, så raden behöver ingen egen
          sanning om hur högt den ska ligga. I ett flöde nollas
          --bottom-nav-h och --flow-footer-h sätts, aldrig tvärtom, så
          summan är alltid rätt fot.

          lg:hidden: desktop får ingen egen fråga, webbläsarens ikon i
          adressfältet räcker (planen, avsnitt 3). */}
      <div
        className="fixed inset-x-0 z-30 border-t border-kant bg-panel lg:hidden"
        style={{
          bottom: 'calc(var(--bottom-nav-h, 0px) + var(--flow-footer-h, 0px))',
        }}
      >
        <div className="mx-auto flex min-h-11 max-w-[960px] items-center gap-3 pl-4 pr-1">
          <p className="min-w-0 flex-1 truncate text-sm text-ink-1">
            Lägg Jobbcoach på hemskärmen
          </p>

          <button
            type="button"
            onClick={laggTill}
            className="shrink-0 text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
          >
            Lägg till
          </button>

          <button
            type="button"
            onClick={stang}
            aria-label="Stäng"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-insunken"
          >
            <X className="h-4 w-4 text-ink-3" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {state.arkOppet && (
        <InstallSheet
          open
          onClose={() => stangArk()}
          onDone={() => markeraIosKlar()}
        />
      )}
    </>
  )
}

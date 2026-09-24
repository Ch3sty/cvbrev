'use client'

/**
 * Steg 1, "Vad vill du börja med?" (docs/design/profil-registrering-2026-09-24.html,
 * Del B steg 1). Fem ChoiceCards (plain, naken ikon 24) i en radiogrupp, i den
 * ordning folk söker jobb. Inga priser. Fortsätt är spärrad tills ett kort
 * är valt, och spärrorsaken står ovanför knappen. Ingen automatisk övergång
 * vid tryck: den som råkar trycka fel ska kunna ändra sig.
 *
 * Tangentbord: piltangenterna flyttar och väljer i gruppen (en tabbstopp,
 * rörlig tabindex), mellanslag väljer, Tabb går till Hoppa över och sedan
 * Fortsätt.
 */

import { useRef, useState, type KeyboardEvent } from 'react'
import ChoiceCard from '@/components/shell/ChoiceCard'
import PubliktFlodesskal, { TEXTLANK } from './PubliktFlodesskal'
import IntentIkon from './IntentIkon'
import { INTENT_ORDNING, type SignupIntent } from './intent'
import { SKAL, STEG1 } from './registrering-copy'

export interface ValStegProps {
  forval: SignupIntent | null
  onFortsatt: (intent: SignupIntent) => void
  onHoppaOver: () => void
  /** Läses upp i topplänken, som bär med sig valet till inloggningen. */
  loginHref?: string
}

export default function ValSteg({ forval, onFortsatt, onHoppaOver, loginHref = '/login' }: ValStegProps) {
  const [valt, setValt] = useState<SignupIntent | null>(forval)
  const grupp = useRef<HTMLDivElement>(null)

  const flytta = (e: KeyboardEvent<HTMLDivElement>) => {
    const fram = e.key === 'ArrowDown' || e.key === 'ArrowRight'
    const bak = e.key === 'ArrowUp' || e.key === 'ArrowLeft'
    if (!fram && !bak) return
    e.preventDefault()
    // Utgå från kortet som har fokus, annars det valda.
    const fokus = (document.activeElement as HTMLElement | null)?.getAttribute('data-intent')
    const franFokus = fokus ? INTENT_ORDNING.indexOf(fokus as SignupIntent) : -1
    const nu = franFokus >= 0 ? franFokus : valt ? INTENT_ORDNING.indexOf(valt) : -1
    const n = INTENT_ORDNING.length
    const nasta = fram ? (nu + 1 + n) % n : (nu - 1 + n) % n
    const intent = INTENT_ORDNING[nasta]
    setValt(intent)
    const knapp = grupp.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nasta]
    knapp?.focus()
  }

  // En tabbstopp i gruppen: det valda kortet, annars det första.
  const tabbstopp = valt ?? INTENT_ORDNING[0]

  return (
    <PubliktFlodesskal
      steg={{ nu: 1, av: 3 }}
      toppLank={{ href: loginHref, text: SKAL.loggaIn, forklaring: SKAL.harKonto }}
      primar={{
        text: STEG1.fortsatt,
        onClick: () => valt && onFortsatt(valt),
        disabled: !valt,
        blockedReason: STEG1.sparr,
      }}
      fotnot={STEG1.fotnot}
    >
      <p className="text-steg uppercase text-ink-3">{STEG1.steg}</p>
      <h1
        id="valsteg-fraga"
        className="mt-1 font-display text-[26px] font-bold leading-[31px] tracking-[-0.025em] text-ink-1"
      >
        {STEG1.fraga}
      </h1>
      <p className="mt-1 text-sm leading-[22px] text-ink-2">{STEG1.under}</p>

      <div
        ref={grupp}
        role="radiogroup"
        aria-labelledby="valsteg-fraga"
        onKeyDown={flytta}
        className="mt-4 grid gap-2"
      >
        {INTENT_ORDNING.map((intent) => (
          <ChoiceCard
            key={intent}
            selected={valt === intent}
            onSelect={() => setValt(intent)}
            title={STEG1.kort[intent].titel}
            description={STEG1.kort[intent].text}
            leading={<IntentIkon intent={intent} />}
            tabIndex={intent === tabbstopp ? 0 : -1}
            data-intent={intent}
          />
        ))}
      </div>

      <button type="button" onClick={onHoppaOver} className={`${TEXTLANK} mt-1 min-h-11 text-left leading-[44px]`}>
        {STEG1.hoppaOver}
      </button>
    </PubliktFlodesskal>
  )
}

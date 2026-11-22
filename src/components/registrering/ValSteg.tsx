'use client'

/**
 * Steg 1, "Vad vill du börja med?" (docs/design/profil-registrering-2026-09-24.html,
 * Del B steg 1). Fem val i en radiogrupp, i den ordning folk söker jobb.
 * Publikt omgång 3 (skissen registrering): varje val i sin dels färg med
 * ring och bock, markerat med mörk kant. Valen och texterna är dagens
 * (byggbriefen beslut 5). Inga priser. Fortsätt är spärrad tills ett kort
 * är valt, och spärrorsaken står ovanför knappen. Ingen automatisk övergång
 * vid tryck: den som råkar trycka fel ska kunna ändra sig.
 *
 * Tangentbord: piltangenterna flyttar och väljer i gruppen (en tabbstopp,
 * rörlig tabindex), mellanslag väljer, Tabb går till Hoppa över och sedan
 * Fortsätt.
 */

import { useRef, useState, type KeyboardEvent } from 'react'
import { Ikon } from '@/components/publikt/v3/Ikon'
import type { Farg } from '@/components/publikt/v3/farg'
import PubliktFlodesskal, { TEXTLANK } from './PubliktFlodesskal'
import IntentIkon from './IntentIkon'
import { INTENT_ORDNING, type SignupIntent } from './intent'
import { SKAL, STEG1 } from './registrering-copy'
import './registrering.css'

/** Valens färg: delen i produkten som valet leder till (skissen registrering). */
const VAL_FARG: Record<SignupIntent, Farg> = { cv: 'cv', brev: 'brev', tester: 'tran', intervju: 'jobb', jobb: 'jobb' }

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
      <p className="rg-ey">{STEG1.steg}</p>
      <h1 id="valsteg-fraga" className="rg-h1">
        {STEG1.fraga}
      </h1>
      <p className="rg-under">{STEG1.under}</p>

      <div ref={grupp} role="radiogroup" aria-labelledby="valsteg-fraga" onKeyDown={flytta} className="rg-vallista">
        {INTENT_ORDNING.map((intent) => (
          <button
            key={intent}
            type="button"
            role="radio"
            aria-checked={valt === intent}
            onClick={() => setValt(intent)}
            tabIndex={intent === tabbstopp ? 0 : -1}
            data-intent={intent}
            data-p3-farg={VAL_FARG[intent]}
            className="rg-val"
          >
            <span className="p3-dorr" aria-hidden="true">
              <IntentIkon intent={intent} size={24} />
            </span>
            <b>{STEG1.kort[intent].titel}</b>
            <span className="rg-ring" aria-hidden="true">
              {valt === intent ? <Ikon namn="bock" /> : null}
            </span>
            <span className="rg-val-t">{STEG1.kort[intent].text}</span>
          </button>
        ))}
      </div>

      <button type="button" onClick={onHoppaOver} className={TEXTLANK}>
        {STEG1.hoppaOver}
      </button>
    </PubliktFlodesskal>
  )
}

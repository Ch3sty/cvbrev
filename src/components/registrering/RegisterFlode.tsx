'use client'

/**
 * Registreringens steg på klienten (Del B). Läget kommer från servern ur
 * adressen:
 *
 *   tratt     steg 1 (valet), sedan steg 2 (kontot) med valraden
 *   konto     ?borja=: steg 2 direkt med valraden och Ändra, som leder till
 *             steg 1 med valet förvalt
 *   smakprov  ett enda steg, kontot i smakprovsform
 *   paket     bara kontot, utan valrad (köpsteget kommer efter)
 *   redirect  bara kontot, utan valrad
 *
 * Ingången (header, meny, login, verktyg, pris, smakprov, direkt) läses här
 * ur sessionStorage och föregående sida.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { capture } from '@/lib/analytics/events'
import { getSignupAnalyticsContext } from '@/lib/analytics/attribution'
import RegisterKontoSteg, { loggaInHref } from './RegisterKontoSteg'
import ValSteg from './ValSteg'
import {
  ENTRY_STORAGE_KEY,
  harledEntry,
  type RegisterIngang,
  type SignupEntry,
  type SignupIntent,
} from './intent'

function lasIngang(ingang: RegisterIngang): SignupEntry {
  let sparad: string | null = null
  try {
    sparad = sessionStorage.getItem(ENTRY_STORAGE_KEY)
    sessionStorage.removeItem(ENTRY_STORAGE_KEY)
  } catch {
    /* privat läge */
  }
  let referrerPath: string | null = null
  try {
    if (document.referrer) {
      const u = new URL(document.referrer)
      if (u.origin === window.location.origin) referrerPath = u.pathname
    }
  } catch {
    /* ogiltig referrer */
  }
  return harledEntry(ingang, sparad, referrerPath)
}

type Steg = 'val' | 'konto'

export default function RegisterFlode({ ingang }: { ingang: RegisterIngang }) {
  const harVal = ingang.lage === 'tratt' || ingang.lage === 'konto'
  const [steg, setSteg] = useState<Steg>(ingang.lage === 'tratt' ? 'val' : 'konto')
  const [intent, setIntent] = useState<SignupIntent | null>(ingang.intent)
  const [skipped, setSkipped] = useState(false)
  const [entry, setEntry] = useState<SignupEntry>('direkt')
  const entryRef = useRef<SignupEntry | null>(null)
  const sedda = useRef(new Set<Steg>())

  // Ingången läses en gång, efter mount (sessionStorage och referrer finns
  // inte på servern).
  useEffect(() => {
    if (entryRef.current) return
    const e = lasIngang(ingang)
    entryRef.current = e
    setEntry(e)
    if (ingang.lage === 'konto' && ingang.intent) {
      capture('signup_intent_selected', { intent: ingang.intent, preset: true, skipped: false })
    }
  }, [ingang])

  // signup_flow_viewed en gång per besök på steget.
  useEffect(() => {
    const e = entryRef.current
    if (!e || sedda.current.has(steg)) return
    sedda.current.add(steg)
    capture('signup_flow_viewed', {
      step: steg,
      entry: e,
      preset_intent: ingang.intent,
      ...getSignupAnalyticsContext(),
    })
  }, [steg, entry, ingang.intent])

  const fortsatt = useCallback((valt: SignupIntent) => {
    setIntent(valt)
    setSkipped(false)
    capture('signup_intent_selected', { intent: valt, preset: false, skipped: false })
    setSteg('konto')
  }, [])

  const hoppaOver = useCallback(() => {
    setIntent(null)
    setSkipped(true)
    capture('signup_intent_selected', { intent: null, preset: false, skipped: true })
    setSteg('konto')
  }, [])

  if (steg === 'val') {
    return (
      <ValSteg
        forval={intent}
        onFortsatt={fortsatt}
        onHoppaOver={hoppaOver}
        loginHref={loggaInHref({ intent: null })}
      />
    )
  }

  return (
    <RegisterKontoSteg
      lage={ingang.lage}
      intent={intent}
      smakprov={ingang.smakprov}
      paket={ingang.paket}
      redirect={ingang.redirect}
      entry={entry}
      skipped={skipped}
      visaSteg={harVal}
      onAndraVal={harVal ? () => setSteg('val') : undefined}
    />
  )
}

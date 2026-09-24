'use client'

/**
 * Registreringens steg på klienten (Del B). Läget kommer från servern ur
 * adressen; ingången (header, meny, login, verktyg, pris, smakprov, direkt)
 * läses här ur sessionStorage och föregående sida.
 */

import { useEffect, useRef, useState } from 'react'
import { capture } from '@/lib/analytics/events'
import { getSignupAnalyticsContext } from '@/lib/analytics/attribution'
import RegisterKontoSteg from './RegisterKontoSteg'
import { ENTRY_STORAGE_KEY, harledEntry, type RegisterIngang, type SignupEntry } from './intent'

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

export default function RegisterFlode({ ingang }: { ingang: RegisterIngang }) {
  const [entry, setEntry] = useState<SignupEntry>('direkt')
  const matt = useRef(false)

  useEffect(() => {
    if (matt.current) return
    matt.current = true
    const e = lasIngang(ingang)
    setEntry(e)
    const kontext = getSignupAnalyticsContext()
    capture('signup_flow_viewed', { step: 'konto', entry: e, preset_intent: ingang.intent, ...kontext })
    if (ingang.intent) capture('signup_intent_selected', { intent: ingang.intent, preset: true, skipped: false })
  }, [ingang])

  return (
    <RegisterKontoSteg
      lage={ingang.lage}
      intent={ingang.intent}
      smakprov={ingang.smakprov}
      paket={ingang.paket}
      redirect={ingang.redirect}
      entry={entry}
    />
  )
}

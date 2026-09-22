'use client'

/**
 * Spårfrågan en gång till (docs/plan-paket-och-onboarding.md, Fas 2A flöde 1,
 * "Placering, och skälet").
 *
 * Hoppar användaren över spårvalet läses spåret som null och hemskärmen står
 * i sitt allmänna läge. Vi frågar igen, en gång, efter tre dagars aktivitet.
 * Aldrig mer än så.
 *
 * Två flaggor, och båda behövs:
 *   profiles.onboarding_track_asked_at  när frågan ställdes första gången.
 *                                       Ligger i databasen, så treddagarsfönstret
 *                                       överlever ett byte av telefon.
 *   localStorage jc_spar_fraga_2         att omfrågan är avfärdad. Ligger i
 *                                       webbläsaren därför att den inte är värd
 *                                       en skrivning till profilen: det värsta
 *                                       som händer om den tappas är att raden
 *                                       syns en gång till på en annan enhet, och
 *                                       en extra databaskolumn för det vore dyrare
 *                                       än felet den skyddar mot.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import StatusRow from '@/components/shell/StatusRow'
import { SPARVAL } from '@/lib/onboarding/program'

const LANK =
  'text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1'

const NYCKEL = 'jc_spar_fraga_2'

export default function SparFragaIgen({ className }: { className?: string }) {
  const [stangd, setStangd] = useState(true)

  // Läses efter mount, aldrig under rendering: localStorage finns inte på
  // servern, och en rad som dyker upp är bättre än en hydreringsavvikelse.
  useEffect(() => {
    try {
      setStangd(window.localStorage.getItem(NYCKEL) === '1')
    } catch {
      setStangd(false)
    }
  }, [])

  const stang = () => {
    setStangd(true)
    try {
      window.localStorage.setItem(NYCKEL, '1')
    } catch {
      /* privat läge: raden kommer tillbaka nästa gång, och det är acceptabelt */
    }
  }

  if (stangd) return null

  return (
    <StatusRow
      tone="neutral"
      showDot
      wrap
      className={className}
      action={
        <span className="flex items-center gap-3">
          <Link href="/dashboard/valj-spar" className={LANK} onClick={stang}>
            Svara
          </Link>
          <button type="button" onClick={stang} className={LANK}>
            Nej tack
          </button>
        </span>
      }
    >
      {SPARVAL.fraga}
    </StatusRow>
  )
}

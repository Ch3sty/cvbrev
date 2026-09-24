'use client'

/**
 * Hjälpredans delade tillstånd (docs/design/spec-onboarding-2026-09-22.html,
 * sektion 2 och 5).
 *
 * Raden finns på två ställen, i botten av sidomenyn på desktop och ovanför
 * bottennavigeringen på mobil, och båda öppnar samma ark. Arket renderas en
 * gång, i skalet, så det här är stället som vet om det är öppet.
 *
 * Läget räknas ur den delade summeringen: paketet och de provade brickorna
 * kommer serverrenderade i /api/dashboard/summary, ingen egen rundtur.
 * "Dölj hjälpredan" fäller ihop raden till en liten knapp till nästa dag, i localStorage: det värsta
 * som händer om flaggan tappas är att raden syns igen, och det är rätt.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { komIgangLage, type BrickaFakta, type KomIgangLage, type Paket } from '@/lib/onboarding/komigang'
import { capture, type KomIgangSurface } from '@/lib/analytics/events'

const DOLD_NYCKEL = 'jc_komigang_dold'

interface KomIgangContextValue {
  lage: KomIgangLage | null
  fakta: BrickaFakta
  /** Sann när raden ska synas: läget finns, allt är inte provat, inte dold. */
  visaRad: boolean
  /** Sann när användaren tryckt "Dölj" i dag: raden visas ihopfälld, aldrig borta. */
  dold: boolean
  arkOppet: boolean
  /** Öppnar arket och skjuter komigang_opened med varifrån det öppnades. */
  oppna: (surface?: KomIgangSurface) => void
  stang: () => void
  dolj: () => void
}

const KomIgangContext = createContext<KomIgangContextValue>({
  lage: null,
  fakta: {},
  visaRad: false,
  arkOppet: false,
  oppna: () => {},
  dold: false,
  stang: () => {},
  dolj: () => {},
})

export function useKomIgang() {
  return useContext(KomIgangContext)
}

/** Dagens datum i svensk tid, som nyckelvärde för "dold i dag". */
function idag(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date())
}

export function KomIgangProvider({ children }: { children: ReactNode }) {
  const { summary } = useDashboardData()
  const [arkOppet, setArkOppet] = useState(false)
  const [dold, setDold] = useState(false)

  // Läses efter mount, aldrig under rendering: localStorage finns inte på
  // servern, och en rad som försvinner är bättre än en hydreringsavvikelse.
  useEffect(() => {
    try {
      setDold(window.localStorage.getItem(DOLD_NYCKEL) === idag())
    } catch {
      setDold(false)
    }
  }, [])

  const lage = useMemo(() => {
    if (!summary?.komIgang || !summary.paket) return null
    const paket: Paket = summary.paket.scope
    // Valet i registreringen ordnar gratislistan. Betalande får paketets
    // lista oavsett val.
    const intent = paket ? null : (summary.komIgang.intent ?? null)
    return komIgangLage(paket, summary.komIgang.provade, summary.paket.planKey === 'all_day', intent)
  }, [summary])

  const fakta = summary?.komIgang?.fakta ?? {}

  // komigang_opened vid varje öppning, med läget som det såg ut då. Talet vi
  // följer är öppningar per köpare och från vilken yta, så att D2 fråga 4
  // (raden bara på hemskärmen i mobil) går att avgöra med data.
  const oppna = useCallback(
    (surface: KomIgangSurface = 'rad') => {
      setArkOppet(true)
      if (lage) {
        capture('komigang_opened', {
          paket: lage.paket,
          provade: lage.antalProvade,
          totalt: lage.antalTotalt,
          surface,
        })
      }
    },
    [lage]
  )
  const stang = useCallback(() => setArkOppet(false), [])
  const dolj = useCallback(() => {
    setArkOppet(false)
    setDold(true)
    try {
      window.localStorage.setItem(DOLD_NYCKEL, idag())
    } catch {
      /* privat läge: raden kommer tillbaka vid nästa besök */
    }
  }, [])

  const value = useMemo<KomIgangContextValue>(
    () => ({
      lage,
      fakta,
      visaRad: Boolean(lage && !lage.klar),
      dold,
      arkOppet,
      oppna,
      stang,
      dolj,
    }),
    [lage, fakta, dold, arkOppet, oppna, stang, dolj]
  )

  return <KomIgangContext.Provider value={value}>{children}</KomIgangContext.Provider>
}

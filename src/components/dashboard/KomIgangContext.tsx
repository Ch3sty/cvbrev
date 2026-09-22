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

const DOLD_NYCKEL = 'jc_komigang_dold'

interface KomIgangContextValue {
  lage: KomIgangLage | null
  fakta: BrickaFakta
  /** Sann när raden ska synas: läget finns, allt är inte provat, inte dold. */
  visaRad: boolean
  /** Sann när användaren tryckt "Dölj" i dag: raden visas ihopfälld, aldrig borta. */
  dold: boolean
  arkOppet: boolean
  oppna: () => void
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
    return komIgangLage(paket, summary.komIgang.provade)
  }, [summary])

  const fakta = summary?.komIgang?.fakta ?? {}

  const oppna = useCallback(() => setArkOppet(true), [])
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

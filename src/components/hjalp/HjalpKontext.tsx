'use client'

/**
 * Hjälpens gemensamma läge för en sida (src/lib/traning/hjalp.ts):
 *
 *   <HjalpProvider dold={hjalpDoldUrProfil(profil)} forsta={!seddAt || antalGjorda === 0}>
 *     ...sidan med HjalpRad, HjalpKnapp och HjalpPanel...
 *   </HjalpProvider>
 *
 * `dold` är profilens hjalp_dold (null när kolumnen saknas eller inget val
 * gjorts; då gäller localStorage). `forsta` avgör om rutorna står öppna.
 *
 * Utan provider fungerar komponenterna ändå: läget läses då ur
 * localStorage och `forsta` är falskt (alla rutor hopfällda).
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { HJALP_HANDELSE, bestamDold, lasLokalt, sparaHjalpDold, skrivLokalt } from '@/lib/traning/hjalp'

export interface HjalpVarde {
  /** Sant när användaren valt "Dölj hjälpen". Rutorna ritas då inte alls. */
  dold: boolean
  /** Första gången: rutorna står öppna. */
  forsta: boolean
  /** "Dölj hjälpen": döljer all hjälp på sidan och sparar valet. */
  dolj: () => void
  /** Slår på hjälpen igen (profilen). */
  visa: () => void
}

const Kontext = createContext<HjalpVarde | null>(null)

function useHjalpTillstand(server: boolean | null | undefined, forsta: boolean): HjalpVarde {
  // Före montering: serverns värde, annars synlig. Den lokala kopian läses
  // efter montering, så att servern och första målningen stämmer.
  const [dold, setDold] = useState<boolean>(server === true)

  useEffect(() => {
    if (typeof server === 'boolean') {
      setDold(server)
      skrivLokalt(server)
    } else {
      setDold(bestamDold(null, lasLokalt()))
    }
  }, [server])

  useEffect(() => {
    const lyssna = (e: Event) => {
      const v = (e as CustomEvent<boolean>).detail
      if (typeof v === 'boolean') setDold(v)
    }
    window.addEventListener(HJALP_HANDELSE, lyssna)
    return () => window.removeEventListener(HJALP_HANDELSE, lyssna)
  }, [])

  const dolj = useCallback(() => {
    setDold(true)
    void sparaHjalpDold(true)
  }, [])
  const visa = useCallback(() => {
    setDold(false)
    void sparaHjalpDold(false)
  }, [])

  return useMemo(() => ({ dold, forsta, dolj, visa }), [dold, forsta, dolj, visa])
}

export function HjalpProvider({
  dold,
  forsta,
  children,
}: {
  dold: boolean | null | undefined
  forsta: boolean
  children: ReactNode
}) {
  const varde = useHjalpTillstand(dold, forsta)
  return <Kontext.Provider value={varde}>{children}</Kontext.Provider>
}

/** Hjälpens läge. Inom HjalpProvider dess värde, annars ett eget lokalt. */
export function useHjalp(): HjalpVarde {
  const ctx = useContext(Kontext)
  const eget = useHjalpTillstand(null, false)
  return ctx ?? eget
}

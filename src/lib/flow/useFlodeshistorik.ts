'use client'

/**
 * Håller djupet på flödets historikposter (se flodeshistorik.ts).
 *
 * Anropa `fore('push')` eller `fore('replace')` precis före router.push eller
 * router.replace inom flödet. När adressen landat stämplas den nya posten
 * med rätt djup. Bakåt- och framåtgesten läser djupet som redan står på
 * posten. `stilla` är sant medan ett avslut går bakåt i historiken; då ska
 * flödet visa steget det avslutades från.
 */

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import {
  forbered,
  lamnarButik,
  lasDjup,
  lasFran,
  rumIDennaLaddning,
  stampla,
  taVantande,
} from './flodeshistorik'

export function useFlodeshistorik(
  /** Ändras när adressen ändras, till exempel searchParams.toString(). */
  adress: string,
  /** Släpp stillbilden när adressen åter visar det här (samma sida). */
  arFramme: () => boolean
) {
  const status = useSyncExternalStore(lamnarButik.subscribe, lamnarButik.get, lamnarButik.getServer)
  const djup = useRef(0)
  const fran = useRef<string | undefined>(undefined)
  const forsta = useRef(true)

  // Ett nytt flöde börjar aldrig stilla, och ett flöde som lämnas släpper.
  useEffect(() => {
    lamnarButik.slapp()
    return () => lamnarButik.slapp()
  }, [])

  const arFrammeRef = useRef(arFramme)
  arFrammeRef.current = arFramme

  useEffect(() => {
    if (forsta.current) {
      forsta.current = false
      // Ett djup som väntade från förra sidan hör inte till det här flödet.
      taVantande()
      const befintligt = lasDjup()
      if (befintligt === undefined) {
        // Ny post: flödets första. Kom vi hit med en klientnavigering från
        // ett rum i den här laddningen ligger rummets post direkt under.
        const rum = rumIDennaLaddning()
        fran.current = rum && rum !== window.location.pathname ? rum : undefined
        djup.current = 0
        stampla(0, fran.current)
      } else {
        // Omladdning eller bakåt in i flödet: posten vet redan.
        djup.current = befintligt
        fran.current = lasFran()
      }
      return
    }

    const vantande = taVantande()
    if (vantande !== null) {
      djup.current = vantande
      stampla(vantande, fran.current)
    } else {
      const d = lasDjup()
      if (d === undefined) stampla(djup.current, fran.current)
      else djup.current = d
    }

    if (status === 'landad' && arFrammeRef.current()) lamnarButik.slapp()
  }, [adress, status])

  // Reserv: ett avslut som av någon anledning aldrig landar på samma steg får
  // inte frysa flödet.
  useEffect(() => {
    if (status !== 'landad') return
    const t = window.setTimeout(() => lamnarButik.slapp(), 4000)
    return () => window.clearTimeout(t)
  }, [status])

  const fore = useCallback((lage: 'push' | 'replace') => {
    const nu = lasDjup() ?? djup.current
    forbered(lage === 'push' ? nu + 1 : nu)
  }, [])

  return { fore, stilla: status !== 'nej' }
}

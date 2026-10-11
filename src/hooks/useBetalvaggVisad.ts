'use client'

/**
 * betalvagg_visad en gång per montering (spec-rummen avsnitt 7, våg 5), för
 * betalväggar som inte är PaywallCard: kvotkort, låsta rader med egen
 * köpknapp. PaywallCard och GraValSheet skjuter händelsen själva.
 *
 * Refen överlever omritningar och StrictMode:s dubbelkörning, så nämnaren i
 * vägg till köp blir rätt. aktiv=false skjuter ingenting (kontot har
 * funktionen, eller väggen ritas inte).
 */

import { useEffect, useRef } from 'react'
import { capture, type BetalvaggPlats } from '@/lib/analytics/events'

export function useBetalvaggVisad(plats: BetalvaggPlats, aktiv = true, dagarKvar: number | null = null): void {
  const skickad = useRef(false)
  useEffect(() => {
    if (!aktiv || skickad.current) return
    skickad.current = true
    capture('betalvagg_visad', { plats, dagar_kvar: dagarKvar })
  }, [aktiv, plats, dagarKvar])
}

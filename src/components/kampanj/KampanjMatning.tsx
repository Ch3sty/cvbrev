'use client'

/**
 * Mätningen av kampanjraden på publika sidor. Raden själv är server-HTML;
 * den här komponenten ritar ingenting. Den läser vilken kampanj skriptet i
 * <head> valde och skickar visad en gång per sidvisning, och klickad när
 * någon trycker på raden.
 */

import { useEffect } from 'react'
import { capture } from '@/lib/analytics/events'

export default function KampanjMatning() {
  useEffect(() => {
    const kampanj = document.documentElement.getAttribute('data-kampanj')
    if (!kampanj) return
    capture('kampanj_rad_visad', { kampanj, yta: 'publikt' })
    const klick = (e: MouseEvent) => {
      const lank = (e.target as Element | null)?.closest?.('[data-kampanj-lank]')
      if (lank) capture('kampanj_rad_klickad', { kampanj, yta: 'publikt' })
    }
    document.addEventListener('click', klick)
    return () => document.removeEventListener('click', klick)
  }, [])
  return null
}

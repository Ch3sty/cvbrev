'use client'

/**
 * pricing_viewed för den publika prissidan.
 *
 * Egen komponent, och sist i sidan, av två skäl. Sidan ska vara serverrenderad
 * så långt det går, och händelsen ska skjutas en gång per montering, aldrig
 * per omritning. Den ritar ingenting.
 */

import { useEffect, useRef } from 'react'

import { capture } from '@/lib/analytics/events'

export default function PriserMatning() {
  const skjutet = useRef(false)

  useEffect(() => {
    if (skjutet.current) return
    skjutet.current = true
    capture('pricing_viewed', {
      trigger: 'nav',
      surface: 'public',
      logged_in: false,
      track: null,
    })
  }, [])

  return null
}

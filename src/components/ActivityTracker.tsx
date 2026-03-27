'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { logUserActivity, type ActivityType } from '@/lib/activity-logger'

/**
 * Spårar sidvisningar automatiskt för inloggade användare.
 * Monteras i layout.tsx — renderar inget UI.
 */
export default function ActivityTracker() {
  const { user } = useAuth()
  const pathname = usePathname()
  const prevPathname = useRef<string | null>(null)

  useEffect(() => {
    if (!user || pathname === prevPathname.current) return
    prevPathname.current = pathname

    // Bestäm specifik typ baserat på sökväg
    let activityType: ActivityType = 'page_viewed'
    if (pathname === '/priser') {
      activityType = 'pricing_viewed'
    }

    logUserActivity(user.id, activityType, `Besökte ${pathname}`, {
      path: pathname,
    })
  }, [user, pathname])

  return null
}

/**
 * Logga ett klick-event för inloggade användare.
 * Anropas från CTA-knappar och andra viktiga element.
 *
 * @param userId - Användarens ID (från useAuth)
 * @param label - Beskrivande etikett, t.ex. "Prova Premium gratis"
 * @param metadata - Extra data, t.ex. { page: '/priser', plan: 'premium' }
 */
export function trackClick(
  userId: string,
  label: string,
  metadata: Record<string, any> = {}
) {
  logUserActivity(userId, 'cta_clicked', label, metadata)
}

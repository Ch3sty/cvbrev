'use client'

/**
 * Skickar inloggade vidare från publika verktygssidor till motsvarande
 * dashboard-vy (docs/plan-konvertering.md, C2). Körs i klienten så att
 * landningssidorna kan prerenderas statiskt för SEO.
 *
 * Användaren läses ur AuthContext, som bara laddar Supabase-klienten när
 * det finns en sessionscookie. Den egna auth.getUser() här drog tidigare in
 * klienten och gjorde en rundtur till Supabase Auth för varje besökare, också
 * för den som aldrig loggat in.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function RedirectLoggedIn({ to }: { to: string }) {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) router.replace(to)
  }, [user, router, to])

  return null
}

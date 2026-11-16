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
 *
 * Bara den som är inloggad när sidan öppnas skickas vidare. Den som skapar
 * ett konto på sidan (kontoarket på /cv-mallar) stannar, annars försvann
 * finalen efter nedladdningen när sidan bytte till dashboarden
 * (klicktestet 2026-11-16).
 */

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function RedirectLoggedIn({ to }: { to: string }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const avgjord = useRef(false)

  useEffect(() => {
    if (avgjord.current || isLoading) return
    avgjord.current = true
    if (user) router.replace(to)
  }, [user, isLoading, router, to])

  return null
}

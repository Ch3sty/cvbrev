'use client'

/**
 * Skickar inloggade vidare från publika verktygssidor till motsvarande
 * dashboard-vy (docs/plan-konvertering.md, C2). Körs i klienten så att
 * landningssidorna kan prerenderas statiskt för SEO.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client-manager'

export default function RedirectLoggedIn({ to }: { to: string }) {
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user && mounted) router.replace(to)
      } catch {
        // Landningssidan visas även om sessionskontrollen misslyckas.
      }
    })()
    return () => {
      mounted = false
    }
  }, [router, to])

  return null
}

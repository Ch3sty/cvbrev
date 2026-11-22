/**
 * Jobbcoachen (Jobbsöket omgång 1, skissen Jobbcoachen). Server component.
 *
 * I en parallell omgång: dokumentantalen (samma två frågor som förut, de
 * styr kortet Dela ditt CV eller brev), frågorna utifrån läget (motorns
 * hamtaCoachForslag, F9) och gratisnivåns kvot (checkChatQuota, samma
 * räkning som chattrutten gör). Vyn ligger i src/components/jobb3/coach.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { checkChatQuota } from '@/lib/quota/quotaService'
import { hamtaCoachForslag } from '@/lib/jobbsok/server'
import { FASTA_FORSLAG, type CoachForslagLista } from '@/lib/jobbsok'
import CoachVy from '@/components/jobb3/coach/CoachVy'

export const metadata = { title: 'Jobbcoachen' }

const FASTA: CoachForslagLista = { lage: 'fasta', forslag: FASTA_FORSLAG.map((fraga) => ({ typ: 'fast', fraga, bokstaver: null, ansokanId: null })) }

export default async function JobbcoachenPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sok = await searchParams
  const supabase = createServerClient({ cookies: await cookies() })
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const [cvRes, brevRes, forslag, kvot] = await Promise.all([
    supabase.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('letters').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_saved', true),
    hamtaCoachForslag(user.id).catch((e) => {
      console.error('[jobbcoachen] Kunde inte räkna fram förslagen:', e)
      return FASTA
    }),
    // Samma klient som chattrutten (service role), annars ser räkningen inga rader.
    checkChatQuota(admin, user.id).catch(() => null),
  ])

  return (
    <CoachVy
      cvAntal={cvRes.count ?? 0}
      brevAntal={brevRes.count ?? 0}
      forslag={forslag}
      kvot={kvot && !kvot.isPremium ? { kvar: Math.max(0, kvot.limit - kvot.used), av: kvot.limit } : null}
      // Flaggan ?fraga=1 från /verktyg/jobbcoachen. Frågan själv ligger i webbläsarens
      // lagring (lib/jobbsok/provaFraga.ts) och läses aldrig ur adressen.
      hamtaFraga={sok.fraga !== undefined}
    />
  )
}

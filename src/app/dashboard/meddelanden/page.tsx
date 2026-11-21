/**
 * Meddelanden (Jobbsöket omgång 1, skissen Meddelanden). Server component.
 *
 * Sessionen och hela intresselistan läses här via den delade
 * getCandidateInterests, och ?interest= läses här, så första HTML innehåller
 * listan och vald förfrågan. Vyn ligger i src/components/jobb3/meddelanden.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getCandidateInterests } from '@/lib/interests/getCandidateInterests'
import type { CandidateInterest } from '@/components/interests/hubTypes'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import MeddelandenVy from '@/components/jobb3/meddelanden/MeddelandenVy'

export const metadata = { title: 'Meddelanden' }

export default async function MeddelandenPage({ searchParams }: { searchParams: Promise<{ interest?: string | string[] }> }) {
  const params = await searchParams
  const raw = params?.interest
  const djuplank = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null)

  const supabase = createServerClient({ cookies: await cookies() })
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  let start: CandidateInterest[] = []
  let laddfel = false
  try {
    start = await getCandidateInterests(supabase, user.id)
  } catch (error) {
    console.error('Fel vid server-hämtning av intresseanmälningar:', error)
    laddfel = true
  }

  return <MeddelandenVy djuplank={djuplank} start={start} laddfel={laddfel} />
}

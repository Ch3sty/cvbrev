import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { markeraMatchningarSedda } from '@/lib/rum/matchningarSedda'

/**
 * POST /api/rum/matchningar-sedda
 *
 * Anropas när en sökning i Matchade jobb har visat sina träffar, så att de
 * inte räknas som "nya" på Jobbsökets hem (spec-rummen 16.2 fråga 3).
 * Sidan själv sätter tiden när den renderas.
 */

export const dynamic = 'force-dynamic'

export async function POST() {
  const user = await hamtaVerifieradAnvandare()
  if (!user) return NextResponse.json({ error: 'Inte inloggad' }, { status: 401 })
  const supabase = createServerClient({ cookies: await cookies() })
  await markeraMatchningarSedda(supabase, user.id)
  return new NextResponse(null, { status: 204 })
}

// Delat för passets sidor (våg 3b): inloggningen och behörigheten, läst på
// servern så att flödet kan målas ur första HTML.

import 'server-only'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { lasBehorighet } from '@/lib/traning/motor.server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>

export async function passSida(): Promise<{ userId: string; supabase: Klient; betalande: boolean }> {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')
  const supabase = createServerClient({ cookies: await cookies() }) as unknown as Klient
  let betalande = false
  try {
    betalande = (await lasBehorighet(supabase, user.id)).harOvanGrund
  } catch {
    // Behörigheten styr bara M1:s betalvägg; servern spärrar ändå vid start.
  }
  return { userId: user.id, supabase, betalande }
}

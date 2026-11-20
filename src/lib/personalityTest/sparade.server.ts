// Personlighetstestets sparade svar, lästa på servern så att första
// påståendet målas ur första HTML (plan-testflode-2026-11-20 avsnitt 1, Fel
// och laddning; etapp 4). Samma rad och samma ägarkontroll som GET
// /api/personalityTest/answer. Null när läsningen inte gick: vyn hämtar då
// själv som förut.

import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'

export interface PersonlighetSparade {
  answers: unknown[]
  completed: boolean
}

export async function lasPersonlighetSvar(sessionId: string): Promise<PersonlighetSparade | null> {
  try {
    const user = await hamtaVerifieradAnvandare()
    if (!user) return null
    const supabase = createServerClient({ cookies: await cookies() })
    const { data, error } = await supabase
      .from('personality_test_sessions')
      .select('answers, completed_at')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (error || !data) return null
    const rad = data as { answers: unknown; completed_at: string | null }
    return { answers: Array.isArray(rad.answers) ? rad.answers : [], completed: Boolean(rad.completed_at) }
  } catch {
    return null
  }
}

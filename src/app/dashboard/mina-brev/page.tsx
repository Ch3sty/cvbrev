/**
 * Dina brev (BYGGSPEC avsnitt 7, skisserna Main, Hem-ny och Mobil-hem).
 *
 * Serverkomponent: sessionen, brevlistan med lås och kvot (motorns
 * hamtaBrevlista), nästa steg, CV:na, sökta tjänster och jobben ur
 * matchningarna läses här i en parallell omgång (components/brev3/hem/data).
 * Första HTML:en är hela sidan; ingen klientrundtur före första målningen.
 *
 * ?cv=<id> väljer CV:t nästa brev skrivs mot (Byt CV i väggen).
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { RUBRIK } from '@/lib/rum/copy'
import { hamtaDinaBrev } from '@/components/brev3/hem/data'
import DinaBrevVy from '@/components/brev3/hem/DinaBrevVy'

export const metadata = { title: RUBRIK.dinaBrev }

export default async function DinaBrevSida({ searchParams }: { searchParams: Promise<{ cv?: string | string[] }> }) {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const [cookieStore, sp] = await Promise.all([cookies(), searchParams])
  const supabase = createServerClient({ cookies: cookieStore })
  const cv = typeof sp.cv === 'string' && sp.cv ? sp.cv : null
  const data = await hamtaDinaBrev(supabase, user.id, cv)

  return <DinaBrevVy d={data} />
}

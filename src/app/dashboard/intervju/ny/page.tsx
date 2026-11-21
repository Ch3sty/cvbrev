/**
 * Nytt intervjuprov i rummets form (skissen Intervju-svar). Två steg som
 * förut, fråga och svar, nu med väggen och tillbakalänken i stället för
 * FlowShell. Servern läser proven en gång, så att frågevalets rader, förra
 * svaret och väggens STAR-brickor står rätt från första målningen.
 *
 * Med ?fraga= öppnas svaret direkt (banan och listorna länkar så); utan, eller
 * med ?steg=fraga, öppnas frågevalet.
 */

import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaProv } from '@/lib/intervju/data'
import { antalPerFraga, bastaNivaPerFraga, rekommenderadFraga } from '@/lib/intervju/nasta'
import { arFragaId } from '@/components/artiklar/intervjuprov/fragor'
import { hamtaIntervjuerPaGang } from '@/lib/jobbsok/server'
import { idagSv, narText, senastePerFraga } from '@/lib/jobbsok'
import SvarFlode, { type ForraSvaret } from '@/components/jobb3/intervju/SvarFlode'

export const metadata = { title: 'Nytt intervjuprov' }
export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Det som saknades i förra svaret på frågan, ur raden (bara egna rader). */
async function hamtaForra(admin: SupabaseClient<any>, userId: string, token: string): Promise<string | null> {
  if (!UUID.test(userId) || !UUID.test(token)) return null
  const { data } = await admin
    .from('anon_interview_samples')
    .select('missing, claimed_by, user_id')
    .eq('token', token)
    .maybeSingle()
  const r = data as { missing: string | null; claimed_by: string | null; user_id: string | null } | null
  if (!r || (r.claimed_by !== userId && r.user_id !== userId)) return null
  return r.missing
}

export default async function NyttProvPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const params = await searchParams
  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const now = new Date()
  const [prov, intervjuer] = await Promise.all([
    hamtaProv(admin, user.id, 200),
    hamtaIntervjuerPaGang(user.id, { nu: now }).catch(() => []),
  ])
  const forvald = typeof params.fraga === 'string' && arFragaId(params.fraga) ? params.fraga : null
  const senaste = senastePerFraga(prov)
  const forraProv = forvald ? senaste.get(forvald) ?? null : null
  const forraText = forraProv ? await hamtaForra(admin, user.id, forraProv.token) : null
  const forra: ForraSvaret | null = forraProv
    ? { level: forraProv.level, missingKind: forraProv.missingKind, createdAt: forraProv.createdAt, missing: forraText }
    : null

  const bokad = intervjuer.find((i) => i.lage === 'bokad' && i.dag) ?? null
  const intervju = bokad?.dag ? { company: bokad.company, nar: narText(bokad.dag, idagSv(now)) } : null

  const niva: Record<string, number> = {}
  senaste.forEach((p, f) => {
    niva[f] = p.level
  })

  return (
    <SvarFlode
      rekommenderad={rekommenderadFraga(prov)}
      forvald={forvald}
      antal={antalPerFraga(prov)}
      basta={bastaNivaPerFraga(prov)}
      senaste={niva}
      forra={forra}
      intervju={intervju}
    />
  )
}

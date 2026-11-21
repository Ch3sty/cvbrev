/**
 * Intervjusvaret, bedömt (docs/design/intervjuprov-spec-2026-09-23.md,
 * avsnitt 5, ägarens beslut 1), i rummets form sedan Jobbsöket omgång 1
 * (skissen Intervju-bedomt, vyn i src/components/jobb3/intervju/BedomtVy).
 *
 * Landningen efter claim, och det enda stället där hela återkopplingen och
 * det omskrivna svaret visas. Serverrenderad: raden läses med
 * admin-klienten efter egen kontroll av claimed_by, och en ohämtad rad
 * kopplas till kontot här (Google-registreringen landar direkt på sidan).
 * Annan användares svar, utgånget eller okänt ger 404.
 *
 * Ingen betalvägg: allt här är redan betalt med kontot.
 */

import { notFound, redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaEllerGorAnsprak } from '@/lib/intervju/rad'
import { hamtaProv } from '@/lib/intervju/data'
import { hamtaIntervjuerPaGang } from '@/lib/jobbsok/server'
import BedomtVy from '@/components/jobb3/intervju/BedomtVy'

export const metadata = { title: 'Ditt intervjusvar' }
export const dynamic = 'force-dynamic'

export default async function IntervjuSvarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const rad = await hamtaEllerGorAnsprak(admin, token, user.id)
  if (!rad) notFound()

  const [prov, intervjuer] = await Promise.all([
    hamtaProv(admin, user.id, 200),
    hamtaIntervjuerPaGang(user.id).catch(() => []),
  ])

  return <BedomtVy rad={rad} prov={prov} intervjuer={intervjuer} />
}

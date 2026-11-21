/**
 * Inför intervjun (Jobbsöket omgång 1, skissen Intervju och Mobil-intervju).
 *
 * Serverrenderad i en omgång: dagens hämtning (getInforIntervjunData: proven,
 * smakprovet, profilen, dagens kvot och scopet) och motorns Intervjuer på
 * gång (F6) med tjänsterna arket "När är intervjun?" erbjuder (omgång 2,
 * byggspec 9.6), parallellt. Vyn ligger i src/components/jobb3/intervju.
 * Mätningen (InforIntervjunClient) och gratisgränsen är dagens.
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaIntervjuHubb } from '@/lib/jobbsok/server'
import IntervjuHubb from '@/components/jobb3/intervju/IntervjuHubb'
import { getInforIntervjunData } from './getInforIntervjunData'
import InforIntervjunClient from './InforIntervjunClient'

export const metadata = { title: 'Inför intervjun' }
export const dynamic = 'force-dynamic'

export default async function InforIntervjunPage() {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const supabase = createServerClient({ cookies: await cookies() }) as unknown as SupabaseClient<any>
  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const now = new Date()
  const [data, hubb] = await Promise.all([
    getInforIntervjunData(supabase, admin, user.id),
    hamtaIntervjuHubb(user.id, { nu: now }).catch((e) => {
      console.error('[intervju] Kunde inte läsa intervjuerna på gång:', e)
      return { intervjuer: [], valbara: [] }
    }),
  ])

  return (
    <>
      <InforIntervjunClient
        provCount={data.prov.length}
        hasProfile={data.profil ? 'full' : data.smakprov ? 'sample' : 'none'}
        scope={data.scope}
        nextAction={data.handling.kind}
        kvotSlut={!data.utanTak && !data.kvotKvar}
        intervjufraga={hubb.intervjuer.length === 0}
      />
      <IntervjuHubb data={data} intervjuer={hubb.intervjuer} valbara={hubb.valbara} now={now} />
    </>
  )
}

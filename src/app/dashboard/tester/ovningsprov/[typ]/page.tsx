/**
 * Startarket för övningsprovet mot klockan (Testerna v2, skiss 2):
 *
 *   /dashboard/tester/ovningsprov/logik
 *   /dashboard/tester/ovningsprov/verbal
 *   /dashboard/tester/ovningsprov/numerisk
 *
 * Formatet läses ur planens leverantör på servern, så att arket målas ur
 * första HTML. En GET-sida skapar aldrig en session: provet startas av
 * knappen. För verbalt och numeriskt säger arket om ett prov pågår i dag
 * eller redan är gjort (ett per testtyp och dag).
 */

import { notFound } from 'next/navigation'
import Startark from '@/components/traning/ovningsprov/Startark'
import { arProvtyp, ovningsformat } from '@/lib/ovningsprov/format'
import { lasMeta, TIDSMARGINAL_MS } from '@/lib/ovningsprov/motor.server'
import { OVNINGSPROV_TEST_TYPE } from '@/lib/ovningsprov/typer'
import { lasBehorighet } from '@/lib/traning/motor.server'
import { arGiltigDag, dagarMellan, dagSthlm } from '@/lib/traning/datum'
import { testSkrivKlient } from '@/lib/tests/skrivKlient'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import { passSida } from '../../pass/sida.server'

export default async function OvningsprovStartSida({ params }: { params: Promise<{ typ: string }> }) {
  const { typ } = await params
  if (!arProvtyp(typ)) notFound()
  const { userId, supabase } = await passSida()
  const admin = testSkrivKlient()
  const idag = dagSthlm()

  const [beh, planRes, sessRes] = await Promise.all([
    lasBehorighet(supabase, userId).catch(() => ({ harOvanGrund: false, harProvlage: false, harHistorik: false })),
    admin.from('test_planer').select('*').eq('user_id', userId).maybeSingle(),
    typ === 'logik'
      ? Promise.resolve({ data: [], error: null })
      : admin
          .from('logic_test_v4_sessions')
          .select('id, meta, created_at, started_at, completed_at')
          .eq('user_id', userId)
          .eq('test_type', OVNINGSPROV_TEST_TYPE[typ])
          .order('created_at', { ascending: false })
          .limit(5),
  ])

  const plan = (planRes.error ? null : planRes.data) as { leverantor?: string | null; variant?: string | null; provdatum?: unknown } | null
  const provdatum = plan && arGiltigDag(plan.provdatum) ? plan.provdatum : null
  const dagarKvar = provdatum ? dagarMellan(idag, provdatum) : null
  const format = ovningsformat(typ, plan?.leverantor ?? null, plan?.variant ?? null)

  type Rad = { id: string; meta: unknown; created_at: string; started_at: string | null; completed_at: string | null }
  const rader = ((sessRes as { data: unknown }).data ?? []) as Rad[]
  const nu = Date.now()
  const pagaende = rader.find((r) => {
    const m = lasMeta(r.meta)
    if (!m || r.completed_at) return false
    return nu <= new Date(r.started_at ?? r.created_at).getTime() + m.tidsgrans_s * 1000 + TIDSMARGINAL_MS
  })
  const gjort = rader.find((r) => r.completed_at && dagSthlm(r.completed_at) === idag)

  return (
    <Startark
      typ={typ}
      format={format}
      dagarKvar={dagarKvar != null && dagarKvar >= 0 ? dagarKvar : null}
      last={!beh.harProvlage}
      pagaende={pagaende?.id ?? null}
      gjortIdag={pagaende ? null : gjort?.id ?? null}
      tillbakaHref={TRANING_RUTT.alla}
    />
  )
}

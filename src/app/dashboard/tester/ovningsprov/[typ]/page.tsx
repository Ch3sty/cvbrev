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
import { FigurserieOvningsprovStart } from '@/components/session/figurserie/FigurserieOvningsprov'
import { VnOvningsprovStart } from '@/components/session/vn/VnOvningsprov'
import { DeduktivOvningsprovStart } from '@/components/session/deduktiv/DeduktivOvningsprov'
import { MatrisOvningsprovStart } from '@/components/session/matris/MatrisOvningsprov'
import { lasTraningsmeta } from '@/lib/traning/historik'
import { TEST_TYPE } from '@/lib/traning/tillgang'
import { arProvtyp, ovningsformat } from '@/lib/ovningsprov/format'
import { lasMeta, TIDSMARGINAL_MS } from '@/lib/ovningsprov/motor.server'
import { OVNINGSPROV_TEST_TYPE } from '@/lib/ovningsprov/typer'
import { lasBehorighet } from '@/lib/traning/motor.server'
import { arGiltigDag, dagarMellan, dagSthlm } from '@/lib/traning/datum'
import { testSkrivKlient } from '@/lib/tests/skrivKlient'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import { passSida } from '../../pass/sida.server'
import { deltesterForPlan, mittTestNamn, mittTestUrPlan, type Deltyp, type LagradPlan } from '@/lib/traning/mittTest'
import type { Provtyp } from '@/lib/ovningsprov/format'
import { provNamn } from '@/lib/tester/v4/sparrData'
import { kortDatumV } from '@/lib/tester/v4/vagen'

const PROVTYP_DELTYP: Record<Provtyp, Deltyp> = { logik: 'matris', figurer: 'figurserie', deduktiv: 'deduktiv', verbal: 'verbal', numerisk: 'numerisk' }

export default async function OvningsprovStartSida({
  params,
  searchParams,
}: {
  params: Promise<{ typ: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { typ } = await params
  const sp = await searchParams
  const fran = sp.fran === 'provrad' ? 'provrad' : null
  if (!arProvtyp(typ)) notFound()
  const { userId, supabase } = await passSida()
  const admin = testSkrivKlient()
  const idag = dagSthlm()

  const [beh, planRes, sessRes] = await Promise.all([
    lasBehorighet(supabase, userId).catch(() => ({ harOvanGrund: false, harProvlage: false, harHistorik: false })),
    admin.from('test_planer').select('*').eq('user_id', userId).maybeSingle(),
    typ === 'logik'
      ? // Sessionsramen (etapp 3): en påbörjad generalrepetition fortsätts från startskärmen.
        admin
          .from('logic_test_v4_sessions')
          .select('id, meta, created_at, started_at, completed_at')
          .eq('user_id', userId)
          .eq('test_type', TEST_TYPE.general)
          .order('created_at', { ascending: false })
          .limit(5)
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
  // Omgång 3: provet i spärren, ur samma planrad (ingen ny läsning).
  // Bara när provtypen ingår i planen, så att spärren aldrig säger att provet prövar en typ det saknar.
  const mitt = mittTestUrPlan(plan as LagradPlan | null)
  const iPlan = (deltesterForPlan(plan as LagradPlan) ?? []).includes(PROVTYP_DELTYP[typ])
  const prov =
    mitt && mitt !== 'personlighet' && iPlan
      ? { namn: provNamn(mitt, mittTestNamn(mitt, (plan as { mitt_test_variant?: string | null } | null)?.mitt_test_variant ?? plan?.variant ?? null)), dag: provdatum && dagarKvar != null && dagarKvar >= 0 ? kortDatumV(provdatum) : null }
      : null

  type Rad = { id: string; meta: unknown; created_at: string; started_at: string | null; completed_at: string | null }
  const rader = ((sessRes as { data: unknown }).data ?? []) as Rad[]
  const nu = Date.now()
  const pagaende = rader.find((r) => {
    if (r.completed_at) return false
    const tidsgrans = typ === 'logik' ? lasTraningsmeta(r.meta)?.tidsgrans_s ?? null : lasMeta(r.meta)?.tidsgrans_s ?? null
    if (!tidsgrans) return false
    return nu <= new Date(r.started_at ?? r.created_at).getTime() + tidsgrans * 1000 + TIDSMARGINAL_MS
  })
  const gjort = rader.find((r) => r.completed_at && dagSthlm(r.completed_at) === idag)

  // Sessionsramen (plan-testflode-2026-11-20): startskärmen i ramens mall.
  if (typ === 'figurer') {
    return (
      <FigurserieOvningsprovStart
        format={format}
        dagarKvar={dagarKvar != null && dagarKvar >= 0 ? dagarKvar : null}
        last={!beh.harProvlage}
        pagaende={pagaende?.id ?? null}
        kvar={null}
        gjortIdag={pagaende ? null : gjort?.id ?? null}
        tillbakaHref={TRANING_RUTT.alla}
        fran={fran}
        prov={prov}
      />
    )
  }

  // Etapp 2: ord och text, siffror och tabeller har ramens startskärm.
  if (typ === 'verbal' || typ === 'numerisk') {
    return (
      <VnOvningsprovStart
        typ={typ}
        format={format}
        dagarKvar={dagarKvar != null && dagarKvar >= 0 ? dagarKvar : null}
        last={!beh.harProvlage}
        pagaende={pagaende?.id ?? null}
        gjortIdag={pagaende ? null : gjort?.id ?? null}
        tillbakaHref={TRANING_RUTT.alla}
        fran={fran}
        prov={prov}
      />
    )
  }
  if (typ === 'deduktiv') {
    return (
      <DeduktivOvningsprovStart
        format={format}
        dagarKvar={dagarKvar != null && dagarKvar >= 0 ? dagarKvar : null}
        last={!beh.harProvlage}
        pagaende={pagaende?.id ?? null}
        gjortIdag={pagaende ? null : gjort?.id ?? null}
        tillbakaHref={TRANING_RUTT.alla}
        fran={fran}
        prov={prov}
      />
    )
  }
  return (
    <MatrisOvningsprovStart
      format={format}
      dagarKvar={dagarKvar != null && dagarKvar >= 0 ? dagarKvar : null}
      last={!beh.harProvlage}
      pagaende={pagaende?.id ?? null}
      tillbakaHref={TRANING_RUTT.alla}
      fran={fran}
    />
  )
}

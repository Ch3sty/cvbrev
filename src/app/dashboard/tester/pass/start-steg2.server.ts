// Startskärmens läge för Träna i talserier, spatial förmåga och ordförråd
// (plan-testflode-2026-11-20 avsnitt 4.1, etapp 4), läst på servern så att
// startskärmen målas rätt ur första HTML: spärren och en påbörjad session
// från i dag ("Fortsätt"). Skapar aldrig en session; det gör bara
// startknappen, med samma POST som förut. Samma mönster som start.server.ts
// och start-vn.server.ts, i en egen fil så att typerna inte delar ändringar.

import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { harVnPass } from '@/lib/tester/pass.server'
import { STEG2_PASS_ANTAL, STEG2_PASS_TEST_TYPE, type Steg2PassKind } from '@/lib/tester/steg2/pass'
import { lasSteg2PassMeta } from '@/lib/tester/steg2/pass.server'
import { SEKUNDER_PER_UPPGIFT as TAL_S } from '@/lib/talserierV1/select'
import { SEKUNDER_PER_UPPGIFT as ORD_S } from '@/lib/ordforradV1/select'
import { dagSthlm } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import { lasTestInstallningar } from '@/lib/tester/installningar.server'
import { senasteNivakollNiva } from '@/lib/nivakoll/las.server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>

interface Rad {
  id: string
  meta: unknown
  answers: unknown
  completed_at: string | null
}

function antalSvar(answers: unknown): number {
  if (!Array.isArray(answers)) return 0
  return new Set((answers as { q_id?: string }[]).map((a) => a?.q_id).filter(Boolean)).size
}

export interface Steg2TranaStartlage {
  start: { last: boolean; fortsatt: boolean; kvar: number | null; antal: number; budgetPerUppgift: number | null }
  forklaringEfterSvar: boolean
  /** En Nivåkoll i typen finns (etapp 7: annars "Gör Nivåkollen först", som matrisen). */
  harNivakoll: boolean
  datum: string
}

/** Provets tid per uppgift när den är fast (spatial varierar per form). */
const FAST_BUDGET: Record<Steg2PassKind, number | null> = { talserie: TAL_S, spatial: null, ordforrad: ORD_S }

export async function steg2TranaStart(supabase: Klient, admin: Klient, userId: string, kind: Steg2PassKind, grupp: string | null): Promise<Steg2TranaStartlage> {
  const idag = dagSthlm()
  const [har, radRes, installningar, nivakoll] = await Promise.all([
    harVnPass(supabase, userId).catch(() => false),
    admin.from('logic_test_v4_sessions').select('id, meta, answers, completed_at').eq('user_id', userId).eq('test_type', STEG2_PASS_TEST_TYPE[kind]).order('created_at', { ascending: false }).limit(5),
    lasTestInstallningar(admin, userId),
    senasteNivakollNiva(admin, userId, kind).catch(() => null),
  ])
  const rader = ((radRes as { data: unknown }).data ?? []) as Rad[]
  // Samma regel som skapaSteg2Pass: ett påbörjat i dag med samma grupp återupptas.
  const pagaende = rader.find((r) => {
    const m = lasSteg2PassMeta(r.meta)
    return !r.completed_at && m && m.dag === idag && (m.grupp ?? null) === grupp
  })
  const meta = pagaende ? lasSteg2PassMeta(pagaende.meta) : null
  const antal = meta?.antal ?? STEG2_PASS_ANTAL
  return {
    start: {
      last: !har,
      fortsatt: Boolean(pagaende) && har,
      kvar: pagaende ? Math.max(0, antal - antalSvar(pagaende.answers)) : null,
      antal,
      budgetPerUppgift: kind === 'spatial' ? null : meta ? Math.round(meta.budget_s / Math.max(1, meta.antal)) : FAST_BUDGET[kind],
    },
    forklaringEfterSvar: installningar.forklaring_efter_svar,
    harNivakoll: nivakoll != null,
    datum: kortDatum(idag),
  }
}

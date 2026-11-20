// Startskärmarnas läge för Träna och Nivåkollen i Ord och text och Siffror
// och tabeller (plan-testflode-2026-11-20 avsnitt 4.1, etapp 2), läst på
// servern så att startskärmen målas rätt ur första HTML: spärren, en
// påbörjad session från i dag ("Fortsätt") och dagens färdiga Nivåkoll.
// Skapar aldrig en session; det gör bara startknappen, med samma POST som förut.
// Samma mönster som start.server.ts för figurserier, i en egen fil så att
// typerna inte delar ändringar.

import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { harVnPass, lasVnMeta } from '@/lib/tester/pass.server'
import { VN_ANTAL, VN_BUDGET_S, VN_PASS_TEST_TYPE, type VnKind } from '@/lib/tester/pass-typer'
import { lasNivakollMeta, nivakollVy } from '@/lib/nivakoll/motor.server'
import { NIVAKOLL_TEST_TYPE } from '@/lib/nivakoll/niva'
import { senasteNivakollNiva } from '@/lib/nivakoll/las.server'
import type { NivakollVy } from '@/lib/nivakoll/typer'
import { lasBehorighet } from '@/lib/traning/motor.server'
import { beslutaTillgang } from '@/lib/traning/tillgang'
import { dagSthlm } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import { lasTestInstallningar } from '@/lib/tester/installningar.server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>

interface Rad {
  id: string
  test_type: string | null
  meta: unknown
  answers: unknown
  created_at: string
  started_at?: string | null
  completed_at: string | null
}

const KOLUMNER = 'id, test_type, meta, answers, created_at, started_at, completed_at'

function antalSvar(answers: unknown): number {
  if (!Array.isArray(answers)) return 0
  return new Set((answers as { q_id?: string }[]).map((a) => a?.q_id).filter(Boolean)).size
}

export interface VnTranaStartlage {
  start: { last: boolean; fortsatt: boolean; kvar: number | null; antal: number; budgetPerUppgift: number }
  forklaringEfterSvar: boolean
  harNivakoll: boolean
  datum: string
}

/** Träna i ord och text eller siffror och tabeller; familj ger det riktade. */
export async function vnTranaStart(supabase: Klient, admin: Klient, userId: string, kind: VnKind, familj: string | null): Promise<VnTranaStartlage> {
  const idag = dagSthlm()
  const typ = familj ? 'riktat' : 'pass'
  const [har, radRes, installningar, nivakoll] = await Promise.all([
    harVnPass(supabase, userId).catch(() => false),
    admin.from('logic_test_v4_sessions').select(KOLUMNER).eq('user_id', userId).eq('test_type', VN_PASS_TEST_TYPE[kind][typ]).order('created_at', { ascending: false }).limit(5),
    lasTestInstallningar(admin, userId),
    senasteNivakollNiva(admin, userId, kind).catch(() => null),
  ])
  const rader = ((radRes as { data: unknown }).data ?? []) as Rad[]
  // Samma regel som skapaVnPass: ett påbörjat av samma slag i dag återupptas.
  const pagaende = rader.find((r) => {
    const m = lasVnMeta(r.meta)
    return !r.completed_at && m && m.typ === typ && m.familj === familj && m.dag === idag
  })
  const meta = pagaende ? lasVnMeta(pagaende.meta) : null
  const antal = meta?.antal ?? VN_ANTAL
  const budget = meta?.budget_s ?? VN_BUDGET_S[kind]
  return {
    start: {
      last: !har,
      fortsatt: Boolean(pagaende) && har,
      kvar: pagaende ? Math.max(0, antal - antalSvar(pagaende.answers)) : null,
      antal,
      budgetPerUppgift: Math.round(budget / Math.max(1, antal)),
    },
    forklaringEfterSvar: installningar.forklaring_efter_svar,
    harNivakoll: nivakoll != null,
    datum: kortDatum(idag),
  }
}

export interface VnNivakollStartlage {
  idagKlar: NivakollVy | null
  start: { last: boolean; fortsatt: boolean; kvar: number | null }
  datum: string
}

/** Nivåkollen i ord och text eller siffror och tabeller (som figurNivakollStart). */
export async function vnNivakollStart(supabase: Klient, admin: Klient, userId: string, kind: VnKind): Promise<VnNivakollStartlage> {
  const idag = dagSthlm()
  const [beh, radRes] = await Promise.all([
    lasBehorighet(supabase, userId).catch(() => ({ harOvanGrund: false, harProvlage: false, harHistorik: false })),
    admin.from('logic_test_v4_sessions').select(KOLUMNER).eq('user_id', userId).eq('test_type', NIVAKOLL_TEST_TYPE[kind]).order('created_at', { ascending: false }).limit(50),
  ])
  const rader = ((radRes as { data: unknown }).data ?? []) as Rad[]
  const idagRad = rader.find((r) => lasNivakollMeta(r.meta)?.dag === idag) ?? null
  if (idagRad?.completed_at) {
    const vy = nivakollVy(idagRad)
    if (vy?.resultat) return { idagKlar: vy, start: { last: false, fortsatt: false, kvar: null }, datum: kortDatum(idag) }
  }
  const slutforda = rader.filter((r) => r.completed_at).length
  const beslut = beslutaTillgang({ begard: 'matning', harOvanGrund: beh.harOvanGrund, harProvlage: beh.harProvlage, matningarSlutforda: slutforda, passSlutfordaIdag: 0 })
  const antal = idagRad ? lasNivakollMeta(idagRad.meta)?.antal ?? 0 : 0
  return {
    idagKlar: null,
    start: {
      last: !idagRad && !beslut.tillatet,
      fortsatt: Boolean(idagRad),
      kvar: idagRad ? Math.max(0, antal - antalSvar(idagRad.answers)) : null,
    },
    datum: kortDatum(idag),
  }
}

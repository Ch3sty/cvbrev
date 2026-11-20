// Startskärmarnas läge för Träna och Nivåkollen i figurserier
// (plan-testflode-2026-11-20 avsnitt 4.1, etapp 1), läst på servern så att
// startskärmen målas rätt ur första HTML: spärren, en påbörjad session från
// i dag ("Fortsätt") och dagens färdiga Nivåkoll (resultatet direkt).
// Skapar aldrig en session; det gör bara startknappen, med samma POST som förut.

import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { harVnPass } from '@/lib/tester/pass.server'
import { FIGURPASS_TEST_TYPE, FIGUR_ANTAL, FIGUR_BUDGET_PER_UPPGIFT_S } from '@/lib/tester/pass-figur'
import { lasFigurMeta } from '@/lib/tester/pass-figur.server'
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

export interface TranaStartlage {
  start: { last: boolean; fortsatt: boolean; kvar: number | null; antal: number; budgetPerUppgift: number }
  forklaringEfterSvar: boolean
  harNivakoll: boolean
  datum: string
}

export async function figurTranaStart(supabase: Klient, admin: Klient, userId: string): Promise<TranaStartlage> {
  const idag = dagSthlm()
  const [har, radRes, installningar, nivakoll] = await Promise.all([
    harVnPass(supabase, userId).catch(() => false),
    admin.from('logic_test_v4_sessions').select(KOLUMNER).eq('user_id', userId).eq('test_type', FIGURPASS_TEST_TYPE).order('created_at', { ascending: false }).limit(5),
    lasTestInstallningar(admin, userId),
    senasteNivakollNiva(admin, userId, 'figurserie').catch(() => null),
  ])
  const rader = ((radRes as { data: unknown }).data ?? []) as Rad[]
  const pagaende = rader.find((r) => {
    const m = lasFigurMeta(r.meta)
    return !r.completed_at && m && m.dag === idag
  })
  const antal = pagaende ? lasFigurMeta(pagaende.meta)?.antal ?? FIGUR_ANTAL : FIGUR_ANTAL
  return {
    start: {
      last: !har,
      fortsatt: Boolean(pagaende) && har,
      kvar: pagaende ? Math.max(0, antal - antalSvar(pagaende.answers)) : null,
      antal,
      budgetPerUppgift: FIGUR_BUDGET_PER_UPPGIFT_S,
    },
    forklaringEfterSvar: installningar.forklaring_efter_svar,
    harNivakoll: nivakoll != null,
    datum: kortDatum(idag),
  }
}

export interface NivakollStartlage {
  /** Dagens färdiga Nivåkoll: resultatet visas direkt. */
  idagKlar: NivakollVy | null
  start: { last: boolean; fortsatt: boolean; kvar: number | null }
  datum: string
}

export async function figurNivakollStart(supabase: Klient, admin: Klient, userId: string): Promise<NivakollStartlage> {
  const idag = dagSthlm()
  const [beh, radRes] = await Promise.all([
    lasBehorighet(supabase, userId).catch(() => ({ harOvanGrund: false, harProvlage: false, harHistorik: false })),
    admin.from('logic_test_v4_sessions').select(KOLUMNER).eq('user_id', userId).eq('test_type', NIVAKOLL_TEST_TYPE.figurserie).order('created_at', { ascending: false }).limit(50),
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

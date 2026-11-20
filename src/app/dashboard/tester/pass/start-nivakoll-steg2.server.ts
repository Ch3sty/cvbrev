// Startskärmens läge för Nivåkollen i talserier, spatial förmåga och
// ordförråd (plan-testflode-2026-11-20 avsnitt 10, etapp 6), läst på servern
// så att startskärmen målas rätt ur första HTML: spärren (en gång per typ
// gratis, igen med Premium), en påbörjad Nivåkoll från i dag ("Fortsätt") och
// dagens färdiga (resultatet direkt). Samma regel som figurNivakollStart
// (start.server.ts) och skapaNivakoll: beslutaTillgang med begard 'matning'.
// Skapar aldrig en session; det gör bara startknappen, med samma POST som förut.

import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { lasNivakollMeta, nivakollVy } from '@/lib/nivakoll/motor.server'
import { NIVAKOLL_TEST_TYPE, type Steg2NivakollKind } from '@/lib/nivakoll/niva'
import { lasBehorighet } from '@/lib/traning/motor.server'
import { beslutaTillgang } from '@/lib/traning/tillgang'
import { dagSthlm } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import type { NivakollStartlage } from './start.server'

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

export async function steg2NivakollStart(supabase: Klient, admin: Klient, userId: string, kind: Steg2NivakollKind): Promise<NivakollStartlage> {
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

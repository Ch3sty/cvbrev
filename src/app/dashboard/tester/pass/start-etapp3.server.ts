// Startskärmarnas läge för Figurer och mönster och Deduktiv slutledning
// (plan-testflode-2026-11-20 avsnitt 4.1, etapp 3), läst på servern så att
// startskärmen målas rätt ur första HTML: spärren (betalväggen eller
// dagskvoten), en påbörjad session från i dag ("Fortsätt") och dagens färdiga
// Nivåkoll. Skapar aldrig en session; det gör bara startknappen, med samma
// POST som förut. Beslutet om tillgång är motorns egen funktion
// (beslutaTillgang) på samma underlag som POST:en räknar.

import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { harVnPass } from '@/lib/tester/pass.server'
import { DEDUKTIVPASS_TEST_TYPE, DEDUKTIV_ANTAL, DEDUKTIV_BUDGET_PER_UPPGIFT_S } from '@/lib/tester/pass-deduktiv'
import { lasDeduktivMeta } from '@/lib/tester/pass-deduktiv.server'
import { lasNivakollMeta, nivakollVy } from '@/lib/nivakoll/motor.server'
import { NIVAKOLL_TEST_TYPE } from '@/lib/nivakoll/niva'
import { senasteNivakollNiva } from '@/lib/nivakoll/las.server'
import type { NivakollVy } from '@/lib/nivakoll/typer'
import { lasBehorighet, MATNING_FRAGOR, PASS_ANTAL } from '@/lib/traning/motor.server'
import { beslutaTillgang, TRANINGS_TEST_TYPER } from '@/lib/traning/tillgang'
import { antalMatningar, lasTraningsmeta, passIdag, slutfordaSessioner, type SessionRad } from '@/lib/traning/historik'
import { formatForPlan } from '@/lib/traning/tempo'
import { dagSthlm } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import { lasTestInstallningar } from '@/lib/tester/installningar.server'
import { GRUND_TEST_TYPER, nextMidnightStockholm, startOfTodayStockholm } from '@/lib/quota/quotaService'
import type { NivakollStartlage, TranaStartlage } from './start.server'

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

/* ------------------------------ Deduktiv ------------------------------- */

export async function deduktivTranaStart(supabase: Klient, admin: Klient, userId: string): Promise<TranaStartlage> {
  const idag = dagSthlm()
  const [har, radRes, installningar, nivakoll] = await Promise.all([
    harVnPass(supabase, userId).catch(() => false),
    admin.from('logic_test_v4_sessions').select(KOLUMNER).eq('user_id', userId).eq('test_type', DEDUKTIVPASS_TEST_TYPE).order('created_at', { ascending: false }).limit(5),
    lasTestInstallningar(admin, userId),
    senasteNivakollNiva(admin, userId, 'deduktiv').catch(() => null),
  ])
  const rader = ((radRes as { data: unknown }).data ?? []) as Rad[]
  const pagaende = rader.find((r) => {
    const m = lasDeduktivMeta(r.meta)
    return !r.completed_at && m && m.dag === idag
  })
  const antal = pagaende ? lasDeduktivMeta(pagaende.meta)?.antal ?? DEDUKTIV_ANTAL : DEDUKTIV_ANTAL
  return {
    start: {
      last: !har,
      fortsatt: Boolean(pagaende) && har,
      kvar: pagaende ? Math.max(0, antal - antalSvar(pagaende.answers)) : null,
      antal,
      budgetPerUppgift: DEDUKTIV_BUDGET_PER_UPPGIFT_S,
    },
    forklaringEfterSvar: installningar.forklaring_efter_svar,
    harNivakoll: nivakoll != null,
    datum: kortDatum(idag),
  }
}

export async function deduktivNivakollStart(supabase: Klient, admin: Klient, userId: string): Promise<NivakollStartlage> {
  const idag = dagSthlm()
  const [beh, radRes] = await Promise.all([
    lasBehorighet(supabase, userId).catch(() => ({ harOvanGrund: false, harProvlage: false, harHistorik: false })),
    admin.from('logic_test_v4_sessions').select(KOLUMNER).eq('user_id', userId).eq('test_type', NIVAKOLL_TEST_TYPE.deduktiv).order('created_at', { ascending: false }).limit(50),
  ])
  const rader = ((radRes as { data: unknown }).data ?? []) as Rad[]
  const idagRad = rader.find((r) => lasNivakollMeta(r.meta)?.dag === idag) ?? null
  if (idagRad?.completed_at) {
    const vy: NivakollVy | null = nivakollVy(idagRad)
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

/* -------------------------- Figurer och mönster ------------------------- */

export interface MatrisStartlage {
  /** Betalväggen (402 i POST:en) eller dagskvoten (429). */
  sparr: 'premium' | 'quota' | null
  /** En påbörjad session av samma slag i dag: knappen fortsätter den. */
  pagaende: { id: string; kvar: number } | null
  /** Minst en Nivåkoll gjord (nivån finns). */
  harNivakoll: boolean
  /** Uppgifter i en ny session och provets tid per uppgift (planens format). */
  antal: number
  budgetPerUppgift: number
  /** Gratis: dagens träning är grundnivån. */
  grund: boolean
  forklaringEfterSvar: boolean
  datum: string
  /** Nästa tillfälle när dagskvoten är slut. */
  nastaTillfalle: string | null
}

async function grundnivaIdag(admin: Klient, userId: string): Promise<number> {
  const { count, error } = await admin
    .from('logic_test_v4_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('test_type', [...GRUND_TEST_TYPER])
    .not('completed_at', 'is', null)
    .gte('completed_at', startOfTodayStockholm().toISOString())
  return error ? 0 : count ?? 0
}

/**
 * Träna (begard pass eller riktat) och Nivåkollen (begard matning) i
 * Figurer och mönster. Samma underlag som skapaTraningssession räknar på:
 * slutförda träningssessioner, dagens pass och dagens grundnivåtest.
 */
export async function matrisStart(
  supabase: Klient,
  admin: Klient,
  userId: string,
  begard: 'matning' | 'pass' | 'riktat',
  family: string | null = null
): Promise<MatrisStartlage> {
  const idag = dagSthlm()
  const [beh, radRes, planRes, installningar] = await Promise.all([
    lasBehorighet(supabase, userId).catch(() => ({ harOvanGrund: false, harProvlage: false, harHistorik: false })),
    admin
      .from('logic_test_v4_sessions')
      .select(KOLUMNER)
      .eq('user_id', userId)
      .in('test_type', [...TRANINGS_TEST_TYPER])
      .order('created_at', { ascending: false })
      .limit(400),
    admin.from('test_planer').select('leverantor, variant').eq('user_id', userId).maybeSingle(),
    begard === 'matning' ? Promise.resolve({ forklaring_efter_svar: true }) : lasTestInstallningar(admin, userId),
  ])
  const rader = ((radRes as { data: unknown }).data ?? []) as (SessionRad & { started_at?: string | null })[]
  const slutforda = slutfordaSessioner(rader)
  const grundIdag = begard === 'pass' && !beh.harOvanGrund ? await grundnivaIdag(admin, userId) : undefined
  const beslut = beslutaTillgang({
    begard,
    harOvanGrund: beh.harOvanGrund,
    harProvlage: beh.harProvlage,
    matningarSlutforda: antalMatningar(slutforda),
    passSlutfordaIdag: passIdag(slutforda, idag),
    forstaTraningsdag: slutforda[0]?.dag ?? null,
    idag,
    grundIdag,
  })
  const typer = begard === 'matning' ? ['matning', 'ommatning'] : [begard]
  const pagaendeRad = rader.find((r) => {
    if (r.completed_at) return false
    const m = lasTraningsmeta(r.meta)
    return !!m && m.dag === idag && typer.includes(m.typ) && (begard !== 'riktat' || m.family === family)
  })
  const meta = pagaendeRad ? lasTraningsmeta(pagaendeRad.meta) : null
  const smakprov = Number((meta as { smakprov?: { svar?: unknown[] } } | null)?.smakprov?.svar?.length ?? 0)
  const antalPagaende = meta ? Math.max(1, meta.antal - (begard === 'matning' ? smakprov : 0)) : 0
  const plan = (planRes as { data: { leverantor?: string | null; variant?: string | null } | null }).data
  const format = formatForPlan(plan?.leverantor ?? null, plan?.variant ?? null)
  // Påbörjad session: knappen fortsätter den, oavsett kvot (kvoten räknar slutförda).
  const sparr = pagaendeRad ? null : beslut.tillatet ? null : beslut.skal === 'kvot' ? 'quota' : 'premium'
  return {
    sparr,
    pagaende: pagaendeRad && meta ? { id: pagaendeRad.id, kvar: Math.max(0, antalPagaende - antalSvar(pagaendeRad.answers)) } : null,
    harNivakoll: antalMatningar(slutforda) > 0,
    antal: begard === 'matning' ? MATNING_FRAGOR : PASS_ANTAL,
    budgetPerUppgift: format.budget_s,
    grund: beslut.tillatet ? beslut.variant === 'grund' : !beh.harOvanGrund,
    forklaringEfterSvar: installningar.forklaring_efter_svar,
    datum: kortDatum(idag),
    nastaTillfalle: sparr === 'quota' ? nextMidnightStockholm().toISOString() : null,
  }
}

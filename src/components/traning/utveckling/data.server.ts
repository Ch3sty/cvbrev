/**
 * Serverhämtningen för Din utveckling: fördelningen per nivå ("Var du
 * står") och motorns familjer och tempo. Bara server (admin-klienten och
 * frågebanken).
 *
 * Fördelningen räknas exakt som percentile-routen
 * (src/app/api/logicTestV4/percentile/route.ts): samma test_type, slutförd
 * med poäng, meta.alternativ_blandade = true och samma bankversion
 * (medBankversion). Dessutom utan undantagna konton (admin_undantagna_konton,
 * src/lib/admin/undantag.ts). Bara antal per poäng lämnar servern, aldrig
 * andra användares rader.
 *
 *   const [varDuStar, motor] = await Promise.all([
 *     hamtaVarDuStar(admin, user.id),
 *     hamtaMotordata(admin, user.id),
 *   ])
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { arBlandad } from '@/lib/logicTestV7/blanda'
import { bankVersion, medBankversion, type BankVersion } from '@/lib/logicTestV7/fragor.server'
import { hamtaUndantag, uteslut, type Undantag } from '@/lib/admin/undantag'
import { hittaTraningsfraga, familjFor } from '@/lib/traning/bank.server'
import { TRANINGS_TEST_TYPER } from '@/lib/traning/tillgang'
import { VN_PASS_TEST_TYPER, kindForTestTyp } from '@/lib/tester/pass-typer'
import { lasTraningsmeta } from '@/lib/traning/historik'
import type { SessionRad } from '@/lib/traning/historik'
import { byggFordelning, type Fordelning } from './fordelning'
import { KLASSISKA, type KlassisktTest } from './katalog'
import { byggFamiljer, byggTempo } from './berakna'
import type { DinUtvecklingData, VarDuStarNiva } from './typer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>

/** PostgREST ger högst 1000 rader per svar; vi bläddrar. Taket skyddar mot en oväntat stor tabell. */
const SIDA = 1000
const MAX_SIDOR = 50

/**
 * Fördelningen på en nivå: antal slutförda, blandade sessioner per poäng i
 * given bankversion, utan undantagna konton.
 */
export async function hamtaFordelning(
  admin: Klient,
  arg: { testType: string; version: BankVersion; maxPoang: number; undantag?: Undantag }
): Promise<Fordelning> {
  const poang: number[] = []
  for (let sida = 0; sida < MAX_SIDOR; sida++) {
    let fraga = admin
      .from('logic_test_v4_sessions')
      .select('score')
      .eq('test_type', arg.testType)
      .eq('meta->>alternativ_blandade', 'true')
    fraga = medBankversion(fraga, arg.version)
    fraga = fraga.not('completed_at', 'is', null).not('score', 'is', null)
    if (arg.undantag) fraga = uteslut(fraga, 'user_id', arg.undantag)
    const { data, error } = await fraga.order('id', { ascending: true }).range(sida * SIDA, sida * SIDA + SIDA - 1)
    if (error) throw error
    const rader = (data ?? []) as { score: number | null }[]
    for (const r of rader) if (typeof r.score === 'number') poang.push(r.score)
    if (rader.length < SIDA) break
  }
  return byggFordelning(poang, arg.maxPoang)
}

interface EgenSession {
  test_type: string | null
  score: number | null
  meta: unknown
  completed_at: string | null
}

/**
 * Hennes bästa jämförbara poäng och bankversionen jämförelsen gäller: den
 * senaste blandade sessionens version, och bästa poängen inom den.
 */
export function egenJamforelse(sessioner: readonly EgenSession[]): { poang: number | null; version: BankVersion } {
  const blandade = sessioner
    .filter((s) => s.completed_at && typeof s.score === 'number' && arBlandad(s.meta))
    .sort((a, b) => (a.completed_at! < b.completed_at! ? 1 : -1))
  if (blandade.length === 0) return { poang: null, version: bankVersion(null) }
  const version = bankVersion(blandade[0].meta)
  const samma = blandade.filter((s) => bankVersion(s.meta) === version)
  return { poang: Math.max(...samma.map((s) => s.score as number)), version }
}

/**
 * "Var du står" för de nivåer hon gjort: fördelningen och hennes bästa
 * jämförbara poäng. Nivåer utan eget försök tas inte med.
 */
export async function hamtaVarDuStar(admin: Klient, userId: string, tester: readonly KlassisktTest[] = KLASSISKA): Promise<VarDuStarNiva[]> {
  const typer = tester.map((t) => t.testType)
  const [egnaRes, undantag] = await Promise.all([
    admin
      .from('logic_test_v4_sessions')
      .select('test_type, score, meta, completed_at')
      .eq('user_id', userId)
      .in('test_type', typer)
      .not('completed_at', 'is', null)
      .limit(1000),
    hamtaUndantag(admin).catch((e) => {
      // Utan undantagslistan räknar vi hellre utan jämförelse än med ägarens klick i.
      console.error('Din utveckling: undantagen kunde inte läsas', e)
      return null
    }),
  ])
  if (egnaRes.error) throw egnaRes.error
  const egna = (egnaRes.data ?? []) as EgenSession[]

  const gjorda = tester.filter((t) => egna.some((s) => s.test_type === t.testType))
  return Promise.all(
    gjorda.map(async (t): Promise<VarDuStarNiva> => {
      const mina = egna.filter((s) => s.test_type === t.testType)
      const { poang, version } = egenJamforelse(mina)
      let fordelning: Fordelning | null = null
      if (undantag) {
        try {
          fordelning = await hamtaFordelning(admin, { testType: t.testType, version, maxPoang: t.maxPoang, undantag })
        } catch (e) {
          console.error('Din utveckling: fördelningen kunde inte läsas', t.testType, e)
        }
      }
      return { slug: t.slug, fordelning, egenPoang: poang, egnaForsok: mina.length }
    })
  )
}

/** Logikens familjer och tempot ur motorns sessioner (de senaste 200). */
export async function hamtaMotordata(admin: Klient, userId: string): Promise<Pick<DinUtvecklingData, 'familjer' | 'tempo' | 'passPerTyp'>> {
  const { data, error } = await admin
    .from('logic_test_v4_sessions')
    .select('id, test_type, meta, answers, created_at, completed_at')
    .eq('user_id', userId)
    .in('test_type', [...TRANINGS_TEST_TYPER, ...VN_PASS_TEST_TYPER])
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(400)
  if (error) throw error
  const alla = (data ?? []) as SessionRad[]
  // Pass per testtyp (beställning omgång 2, B3); text- och sifferpassen hålls annars utanför matrisens räkning.
  const passPerTyp = { matris: 0, verbal: 0, numerisk: 0 }
  for (const r of alla) {
    const kind = kindForTestTyp(r.test_type)
    if (kind) passPerTyp[kind] += 1
    else if (['pass', 'riktat'].includes(lasTraningsmeta(r.meta)?.typ ?? '')) passPerTyp.matris += 1
  }
  const rader = alla.filter((r) => !kindForTestTyp(r.test_type))
  if (rader.length === 0) return { familjer: null, tempo: null, passPerTyp }
  const familjer = byggFamiljer(rader, (id) => {
    const q = hittaTraningsfraga(id)
    return q ? familjFor(q) : null
  })
  return { familjer: familjer.length ? familjer : null, tempo: byggTempo(rader), passPerTyp }
}


/**
 * Skrivspärren på testsessionerna (20261010211000_testsessioner_skrivsparr.sql)
 * tar bort användarens rätt att skriva logic_test_v4_sessions,
 * personality_test_sessions, user_personality_profile och anon_test_sessions.
 * Testet går igenom all serverkod och ser till att ingen skrivning mot de
 * tabellerna längre görs med användarens klient (createServerClient).
 */
import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { sparaTestsvar, SVARSNYCKLAR } from '../sparaSvar'
import { rattaMatrisSvar } from '@/lib/logicTestV7/fragor.server'
import grund from '@/lib/logicTestV7/questionBankGrund.v7.json'

const SRC = path.resolve(__dirname, '../../..')
const TABELLER = [
  'logic_test_v4_sessions',
  'personality_test_sessions',
  'user_personality_profile',
  'anon_test_sessions',
]

function allaFiler(dir: string): string[] {
  const ut: string[] = []
  for (const namn of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, namn.name)
    if (namn.isDirectory()) {
      if (namn.name === '__tests__' || namn.name === 'node_modules') continue
      ut.push(...allaFiler(p))
    } else if (/\.(ts|tsx)$/.test(namn.name)) {
      ut.push(p)
    }
  }
  return ut
}

describe('skrivspärren på testsessionerna', () => {
  it('ingen kod skriver testsessioner med användarens klient', () => {
    const traffar: string[] = []
    const monster = new RegExp(
      String.raw`await\s+supabase\s*\.from\(\s*'(${TABELLER.join('|')})'\s*\)\s*\.(insert|update|upsert|delete)\(`,
      'g'
    )
    for (const f of allaFiler(SRC)) {
      const text = fs.readFileSync(f, 'utf8')
      for (const m of text.matchAll(monster)) {
        traffar.push(`${path.relative(SRC, f)}: ${m[1]}.${m[2]}`)
      }
      // Skapa med blandning tar klienten som första argument.
      if (/skapaMedBlandning\(\s*supabase\s*,/.test(text)) {
        traffar.push(`${path.relative(SRC, f)}: skapaMedBlandning(supabase)`)
      }
    }
    expect(traffar).toEqual([])
  })

  it('svaren sparas med admin-klienten genom spara_testsvar_server', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 3, error: null })
    const reservRpc = vi.fn()
    const n = await sparaTestsvar({ rpc } as never, {
      userId: 'u1',
      tabell: 'logic_test_v4_sessions',
      sessionId: 's1',
      nycklar: SVARSNYCKLAR.matris,
      svar: { q_id: 'a', selected: 2, visat: 0, correct: false },
      reserv: { rpc: reservRpc } as never,
    })
    expect(n).toBe(3)
    expect(rpc).toHaveBeenCalledWith('spara_testsvar_server', {
      p_tabell: 'logic_test_v4_sessions',
      p_session: 's1',
      p_user: 'u1',
      p_nycklar: ['q_id'],
      p_svar: { q_id: 'a', selected: 2, visat: 0, correct: false },
      p_krav_oavslutad: true,
    })
    expect(reservRpc).not.toHaveBeenCalled()
  })

  it('faller tillbaka på spara_testsvar tills steg 1 är körd', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST202', message: 'Could not find the function public.spara_testsvar_server' },
    })
    const reservRpc = vi.fn().mockResolvedValue({ data: 1, error: null })
    const varning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const n = await sparaTestsvar({ rpc } as never, {
      userId: 'u1',
      tabell: 'personality_test_sessions',
      sessionId: 's1',
      nycklar: SVARSNYCKLAR.personlighet,
      svar: { questionId: 'q1', value: 4 },
      reserv: { rpc: reservRpc } as never,
    })
    expect(n).toBe(1)
    expect(reservRpc).toHaveBeenCalledWith('spara_testsvar', {
      p_tabell: 'personality_test_sessions',
      p_session: 's1',
      p_nycklar: ['questionId'],
      p_svar: { questionId: 'q1', value: 4 },
      p_krav_oavslutad: true,
    })
    varning.mockRestore()
  })

  it('andra databasfel kastas och faller inte tillbaka', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { code: '42501', message: 'permission denied' } })
    const reservRpc = vi.fn()
    await expect(
      sparaTestsvar({ rpc } as never, {
        userId: 'u1',
        tabell: 'logic_test_v4_sessions',
        sessionId: 's1',
        nycklar: SVARSNYCKLAR.matris,
        svar: { q_id: 'a' },
        reserv: { rpc: reservRpc } as never,
      })
    ).rejects.toMatchObject({ code: '42501' })
    expect(reservRpc).not.toHaveBeenCalled()
  })
})

describe('rattaMatrisSvar', () => {
  const banken = grund as unknown as Array<{ id: string; correctAnswer: number; options: unknown[] }>
  const [q1, q2] = banken

  it('räknar originalindex mot facit, inte svarets correct-flagga', () => {
    const fel = (q1.correctAnswer + 1) % q1.options.length
    expect(
      rattaMatrisSvar([
        { q_id: q1.id, selected: q1.correctAnswer, visat: 5, correct: false },
        { q_id: q2.id, selected: (q2.correctAnswer + 1) % q2.options.length, correct: true },
      ])
    ).toBe(1)
    expect(rattaMatrisSvar([{ q_id: q1.id, selected: fel, correct: true }])).toBe(0)
  })

  it('tål okända frågor och trasiga rader', () => {
    expect(rattaMatrisSvar([null, { q_id: 'finns-inte', selected: 0 }, { q_id: q1.id }])).toBe(0)
  })
})

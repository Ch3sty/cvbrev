// Kontrakttestet för etapp 2 (plan-testflode-2026-11-20 avsnitt 1 Sparande
// och 11): Ord och text och Siffror och tabeller i ramen. Rutterna och
// POST-kropparna är desamma som VerbalTestSession, VerbalExpertSession,
// NumericalTestSession, VnPassFlode, NivakollFlode och OvningsprovFlode
// skickade, ordagrant. Urvalet av uppgifter är detsamma som klienten gjorde,
// bara flyttat till servern.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { VN_KROPP, vnNivatestApi, vnSvarsform } from '../vn/api'
import { ovningsprovApi } from '../figurserie/api'
import { fetchNivakollApi, fetchVnPassApi } from '@/lib/tester/pass-klient'
import { vnGenomgang, vnInnehall } from '@/lib/tester/vn-nivatest.server'
import { sparadeVnSvar } from '@/lib/tester/vn-nivatest'
import { selectPassagesForSession as verbalGrund } from '@/lib/verbalTestV1/selectPassages.v1'
import { selectPassagesForSession as verbalAvancerad } from '@/lib/verbalTestV2/selectPassages.v2'
import { selectPassagesForSession as verbalExpert } from '@/lib/verbalTestExpert/selectPassages'
import { selectPassagesForSession as numGrund } from '@/lib/numericalTest/selectPassages'
import { selectPassagesForSession as numAvancerad } from '@/lib/numericalTestV2/selectPassages'
import { selectPassagesForSession as numExpert } from '@/lib/numericalTestExpert/selectPassages'

type Anrop = { url: string; metod: string; kropp: unknown }

function spionera(svar: { status?: number; json?: unknown } = {}) {
  const anrop: Anrop[] = []
  const f = vi.fn(async (url: string, init?: RequestInit) => {
    anrop.push({ url, metod: init?.method ?? 'GET', kropp: init?.body ? JSON.parse(String(init.body)) : null })
    return new Response(JSON.stringify(svar.json ?? { success: true }), { status: svar.status ?? 200 })
  })
  vi.stubGlobal('fetch', f)
  return anrop
}

afterEach(() => vi.unstubAllGlobals())

const SESSION = '3f6b2a1c-1234-4cde-9abc-0123456789ab'

describe('nivåtestens POST-kroppar är desamma som förut', () => {
  it('verbalt: {sessionId, passageId, statementIndex, answer, timeSpent} till /answer', async () => {
    const anrop = spionera()
    const api = vnNivatestApi({ sessionId: 's1', answerEndpoint: '/api/verbalTestV1/answer', completeEndpoint: '/api/verbalTestV1/complete', sessionEndpoint: '/s', form: 'verbal' })
    expect(await api.svara({ del: 'p7', punkt: '2', form: 'tre' }, 'cannot_say', 14)).toBe(true)
    expect(anrop).toEqual([
      { url: '/api/verbalTestV1/answer', metod: 'POST', kropp: { sessionId: 's1', passageId: 'p7', statementIndex: 2, answer: 'cannot_say', timeSpent: 14 } },
    ])
    expect(Object.keys(VN_KROPP.verbalSvar('a', 'b', 0, 'true', 0))).toEqual(['sessionId', 'passageId', 'statementIndex', 'answer', 'timeSpent'])
  })

  it('numeriskt och verbalt expert: {sessionId, passageId, questionId, selectedAnswerId, timeSpent}', async () => {
    const anrop = spionera({ json: { isCorrect: true } })
    const api = vnNivatestApi({ sessionId: 's2', answerEndpoint: '/api/numericalTest/answer', completeEndpoint: '/c', sessionEndpoint: '/s', form: 'numerisk' })
    expect(await api.svara({ del: 'u3', punkt: 'u3-q2', form: 'rader' }, 'b', 40)).toBe(true)
    expect(anrop[0]).toEqual({
      url: '/api/numericalTest/answer',
      metod: 'POST',
      kropp: { sessionId: 's2', passageId: 'u3', questionId: 'u3-q2', selectedAnswerId: 'b', timeSpent: 40 },
    })
    expect(Object.keys(VN_KROPP.fragaSvar('a', 'b', 'c', 'd', 0))).toEqual(['sessionId', 'passageId', 'questionId', 'selectedAnswerId', 'timeSpent'])
  })

  it('inlämningen: {sessionId} till /complete, och ja läses som förut per test', async () => {
    let anrop = spionera({ json: { success: true } })
    const verbal = vnNivatestApi({ sessionId: 's1', answerEndpoint: '/a', completeEndpoint: '/api/verbalTestV2/complete', sessionEndpoint: '/s', form: vnSvarsform('verbal-resonemang-v2') })
    expect(await verbal.lamnaIn()).toBe(true)
    expect(anrop[0]).toEqual({ url: '/api/verbalTestV2/complete', metod: 'POST', kropp: { sessionId: 's1' } })
    anrop = spionera({ json: { score: 20, time_spent: 900 } })
    const expert = vnNivatestApi({ sessionId: 's1', answerEndpoint: '/a', completeEndpoint: '/api/verbalTestExpert/complete', sessionEndpoint: '/s', form: vnSvarsform('verbal-resonemang-expert') })
    expect(await expert.lamnaIn()).toBe(true)
    spionera({ json: { error: 'x' } })
    const num = vnNivatestApi({ sessionId: 's1', answerEndpoint: '/a', completeEndpoint: '/c', sessionEndpoint: '/s', form: vnSvarsform('numeriskt-test') })
    expect(await num.lamnaIn()).toBe(false)
  })

  it('ett svar som inte gick fram räknas inte som sparat (kön försöker igen)', async () => {
    spionera({ status: 500 })
    const api = vnNivatestApi({ sessionId: 's1', answerEndpoint: '/a', completeEndpoint: '/c', sessionEndpoint: '/s', form: 'verbal' })
    expect(await api.svara({ del: 'p', punkt: '0', form: 'tre' }, 'true', 1)).toBe(false)
  })

  it('Träna, Nivåkollen och övningsprovet går genom samma rutter och kroppar', async () => {
    const anrop = spionera({ json: { session: { id: 'p1' } } })
    await fetchVnPassApi.skapa('verbal', 'kvantor')
    await fetchVnPassApi.svara({ sessionId: 'v1', nyckel: 'vt-1:0', svar: 'false', tid: 22 })
    await fetchVnPassApi.slutfor('v1')
    await fetchNivakollApi.skapa('numerisk')
    await fetchNivakollApi.svara({ sessionId: 'k1', nyckel: 'nq-4', svar: 'c', tid: 51 })
    await ovningsprovApi.starta('verbal')
    await ovningsprovApi.svara('p1', 'del:2', 'true', 33)
    expect(anrop.map((a) => [a.url, a.kropp])).toEqual([
      ['/api/traning/vnpass/session', { kind: 'verbal', familj: 'kvantor' }],
      ['/api/traning/vnpass/svar', { sessionId: 'v1', nyckel: 'vt-1:0', svar: 'false', tid: 22 }],
      ['/api/traning/vnpass/slutfor', { sessionId: 'v1' }],
      ['/api/traning/nivakoll/session', { kind: 'numerisk' }],
      ['/api/traning/nivakoll/svar', { sessionId: 'k1', nyckel: 'nq-4', svar: 'c', tid: 51 }],
      ['/api/traning/ovningsprov/session', { typ: 'verbal', fran: 'hubb' }],
      ['/api/traning/ovningsprov/svar', { sessionId: 'p1', nyckel: 'del:2', svar: 'true', tid: 33 }],
    ])
  })
})

describe('urvalet är detsamma som klienten gjorde, utan facit', () => {
  const meta = { underlag_version: 4 }
  const fall: [string, string[]][] = [
    ['verbal-resonemang', verbalGrund(SESSION, undefined, 4).flatMap((p) => p.statements.map((_, i) => `${p.id}:${i}`))],
    ['verbal-resonemang-v2', verbalAvancerad(SESSION, undefined, 4).flatMap((p) => p.statements.map((_, i) => `${p.id}:${i}`))],
    ['verbal-resonemang-expert', verbalExpert(SESSION, undefined, 4).flatMap((p) => p.questions.map((q) => q.id))],
    ['numeriskt-test', numGrund(SESSION, undefined, 4).flatMap((p) => p.questions.map((q) => q.id))],
    ['numeriskt-test-v2', numAvancerad(SESSION, undefined, 4).flatMap((p) => p.questions.map((q) => q.id))],
    ['numeriskt-test-expert', numExpert(SESSION).flatMap((p) => p.questions.map((q) => q.id))],
  ]
  it.each(fall)('%s: samma uppgifter i samma ordning', (slug, vantat) => {
    const inn = vnInnehall(slug, SESSION, meta)
    expect(inn?.uppgifter.map((u) => u.nyckel)).toEqual(vantat)
  })

  it('numeriskt har alternativen i samma blandade ordning som förut', () => {
    const inn = vnInnehall('numeriskt-test', SESSION, meta)!
    const forut = numGrund(SESSION, undefined, 4).flatMap((p) => p.questions)
    expect(inn.uppgifter.map((u) => u.alternativ.map((a) => a.id))).toEqual(forut.map((q) => q.options.map((o) => o.id)))
  })

  it('klientformen bär inget facit', () => {
    for (const [slug] of fall) {
      const json = JSON.stringify(vnInnehall(slug, SESSION, meta))
      expect(json).not.toMatch(/correctAnswer|isCorrect|explanation/)
    }
  })

  it('genomgången läser hennes svar i båda formerna', () => {
    const inn = vnInnehall('verbal-resonemang', SESSION, meta)!
    const forsta = inn.uppgifter[0]
    const g = vnGenomgang('verbal-resonemang', SESSION, meta, [{ passageId: forsta.del, statementIndex: 0, answer: 'false', timeSpent: 12 }])!
    expect(g.punkter[0]).toMatchObject({ nyckel: forsta.nyckel, valt: 'false', tid_s: 12 })
    expect(['true', 'false', 'cannot_say']).toContain(g.punkter[0].ratt)
    const num = vnInnehall('numeriskt-test', SESSION, meta)!
    const q = num.uppgifter[1]
    expect(sparadeVnSvar([{ passageId: q.del, questionId: q.nyckel, selectedAnswerId: q.alternativ[2].id }], num.uppgifter).get(q.nyckel)?.varde).toBe(q.alternativ[2].id)
  })
})

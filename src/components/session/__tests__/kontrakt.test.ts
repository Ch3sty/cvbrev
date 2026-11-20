// Kontrakttestet (plan-testflode-2026-11-20 avsnitt 1 Sparande och 11):
// ramen rör inga rutter och inga POST-kroppar. Kropparna som de gamla vyerna
// skickade är låsta här, ordagrant, per motor.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { KROPP, figurserieNivatestApi, ovningsprovApi } from '../figurserie/api'
import { fetchFigurPassApi, fetchNivakollApi } from '@/lib/tester/pass-klient'

type Anrop = { url: string; metod: string; kropp: unknown }

function spionera(svar: { status?: number; json?: unknown } = {}) {
  const anrop: Anrop[] = []
  const f = vi.fn(async (url: string, init?: RequestInit) => {
    anrop.push({ url, metod: init?.method ?? 'GET', kropp: init?.body ? JSON.parse(String(init.body)) : null })
    const status = svar.status ?? 200
    return new Response(JSON.stringify(svar.json ?? { success: true }), { status })
  })
  vi.stubGlobal('fetch', f)
  return anrop
}

afterEach(() => vi.unstubAllGlobals())

describe('POST-kropparna är desamma som förut', () => {
  it('nivåtestets svar: {sessionId, questionId, selectedIndex, timeSpent} till /answer', async () => {
    const anrop = spionera()
    const api = figurserieNivatestApi({
      sessionId: 's1',
      answerEndpoint: '/api/figurserier/answer',
      completeEndpoint: '/api/figurserier/complete',
      sessionEndpoint: '/api/figurserier/session',
    })
    expect(await api.svara('fs-g-rot-01', 3, 12)).toBe(true)
    expect(anrop).toEqual([{ url: '/api/figurserier/answer', metod: 'POST', kropp: { sessionId: 's1', questionId: 'fs-g-rot-01', selectedIndex: 3, timeSpent: 12 } }])
    expect(Object.keys(KROPP.nivatestSvar('a', 'b', 0, 0))).toEqual(['sessionId', 'questionId', 'selectedIndex', 'timeSpent'])
  })

  it('nivåtestets inlämning: {sessionId} till /complete', async () => {
    const anrop = spionera({ json: { success: true, score: 9 } })
    const api = figurserieNivatestApi({ sessionId: 's1', answerEndpoint: '/a', completeEndpoint: '/api/figurserier/complete', sessionEndpoint: '/s' })
    expect(await api.lamnaIn()).toBe(true)
    expect(anrop[0]).toEqual({ url: '/api/figurserier/complete', metod: 'POST', kropp: { sessionId: 's1' } })
  })

  it('ett svar som inte gick fram räknas inte som sparat (kön försöker igen)', async () => {
    spionera({ status: 500 })
    const api = figurserieNivatestApi({ sessionId: 's1', answerEndpoint: '/a', completeEndpoint: '/c', sessionEndpoint: '/s' })
    expect(await api.svara('q', 1, 1)).toBe(false)
  })

  it('övningsprovet: start {typ, fran}, svar {sessionId, nyckel, svar, tid}, slutför {sessionId}', async () => {
    const anrop = spionera({ json: { session: { id: 'p1' } } })
    expect(await ovningsprovApi.starta('figurer')).toEqual({ ok: true, id: 'p1' })
    expect(await ovningsprovApi.svara('p1', 'del-1', '4', 30)).toBe(true)
    await ovningsprovApi.lamnaIn('p1')
    expect(anrop).toEqual([
      { url: '/api/traning/ovningsprov/session', metod: 'POST', kropp: { typ: 'figurer', fran: 'hubb' } },
      { url: '/api/traning/ovningsprov/svar', metod: 'POST', kropp: { sessionId: 'p1', nyckel: 'del-1', svar: '4', tid: 30 } },
      { url: '/api/traning/ovningsprov/slutfor', metod: 'POST', kropp: { sessionId: 'p1' } },
    ])
  })

  it('övningsprovets svar efter tiden (410) och dubbletter (409) räknas som tagna, som förut', async () => {
    spionera({ status: 410 })
    expect(await ovningsprovApi.svara('p1', 'n', '1', 1)).toBe(true)
    spionera({ status: 409 })
    expect(await ovningsprovApi.svara('p1', 'n', '1', 1)).toBe(true)
  })

  it('Träna och Nivåkollen går genom pass-klient.ts med oförändrade kroppar', async () => {
    const anrop = spionera({ json: { session: {} } })
    await fetchFigurPassApi.skapa()
    await fetchFigurPassApi.svara({ sessionId: 'f1', nyckel: 'fs-1', visat: null, tid: 7 })
    await fetchFigurPassApi.slutfor('f1')
    await fetchNivakollApi.skapa('figurserie')
    await fetchNivakollApi.svara({ sessionId: 'k1', nyckel: 'fs-2', svar: '5', tid: 9 })
    await fetchNivakollApi.slutfor('k1')
    expect(anrop.map((a) => [a.url, a.kropp])).toEqual([
      ['/api/traning/figurpass/session', {}],
      ['/api/traning/figurpass/svar', { sessionId: 'f1', nyckel: 'fs-1', visat: null, tid: 7 }],
      ['/api/traning/figurpass/slutfor', { sessionId: 'f1' }],
      ['/api/traning/nivakoll/session', { kind: 'figurserie' }],
      ['/api/traning/nivakoll/svar', { sessionId: 'k1', nyckel: 'fs-2', svar: '5', tid: 9 }],
      ['/api/traning/nivakoll/slutfor', { sessionId: 'k1' }],
    ])
  })
})

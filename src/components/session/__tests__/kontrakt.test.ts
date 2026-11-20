// Kontrakttestet (plan-testflode-2026-11-20 avsnitt 1 Sparande och 11):
// ramen rör inga rutter och inga POST-kroppar. Kropparna som de gamla vyerna
// skickade är låsta här, ordagrant, per motor.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { KROPP, figurserieNivatestApi, ovningsprovApi } from '../figurserie/api'
import { fetchDeduktivPassApi, fetchFigurPassApi, fetchNivakollApi } from '@/lib/tester/pass-klient'
import { fetchPassApi } from '@/lib/traning/klient'
import { fetchUppvarmningApi } from '../matris/uppvarmningApi'
import { svarKropp } from '../matris/api'

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

describe('etapp 3: matrisens och deduktivens kroppar är desamma som förut', () => {
  it('matrisens Nivåkoll, Träna och övningsprov: PassFlodes kroppar, kalibreringen orörd', async () => {
    const anrop = spionera({ json: { session: { id: 'm1' }, aterkoppling: null, nasta: null, besvarade: 1, antal: 12, klar: false } })
    await fetchPassApi.skapa('matning')
    await fetchPassApi.skapa('riktat', { family: 'rotation-med-byte' })
    await fetchPassApi.skapa('general')
    // Svaret: {sessionId, questionId, selectedIndex, vetInte, tidenUte, timeSpent}, som PassFlode.
    await fetchPassApi.svara(svarKropp({ sessionId: 'm1', questionId: 'v7-1', valt: 2, tid: 14 }))
    await fetchPassApi.svara(svarKropp({ sessionId: 'm1', questionId: 'v7-2', valt: null, vetInte: true, tid: 30 }))
    await fetchPassApi.svara(svarKropp({ sessionId: 'm1', questionId: 'v7-3', valt: null, tidenUte: true, tid: 120 }))
    await fetchPassApi.slutfor('m1')
    expect(anrop.map((a) => [a.url, a.kropp])).toEqual([
      ['/api/traning/pass/session', { typ: 'matning' }],
      ['/api/traning/pass/session', { typ: 'riktat', family: 'rotation-med-byte' }],
      ['/api/traning/pass/session', { typ: 'general' }],
      ['/api/traning/pass/svar', { sessionId: 'm1', questionId: 'v7-1', selectedIndex: 2, vetInte: false, tidenUte: false, timeSpent: 14 }],
      ['/api/traning/pass/svar', { sessionId: 'm1', questionId: 'v7-2', selectedIndex: null, vetInte: true, tidenUte: false, timeSpent: 30 }],
      ['/api/traning/pass/svar', { sessionId: 'm1', questionId: 'v7-3', selectedIndex: null, vetInte: false, tidenUte: true, timeSpent: 120 }],
      ['/api/traning/pass/complete', { sessionId: 'm1' }],
    ])
    expect(Object.keys(svarKropp({ sessionId: 'a', questionId: 'b', valt: 0, tid: 0 }))).toEqual(['sessionId', 'questionId', 'selectedIndex', 'vetInte', 'tidenUte', 'timeSpent'])
  })

  it('matrisens och deduktivens nivåtest: samma /answer och /complete som figurserierna', async () => {
    const anrop = spionera({ json: { success: true } })
    for (const api of ['/api/logicTestV4', '/api/logicTestV6', '/api/deduktiv']) {
      const n = figurserieNivatestApi({ sessionId: 's9', answerEndpoint: `${api}/answer`, completeEndpoint: `${api}/complete`, sessionEndpoint: `${api}/session` })
      await n.svara('q-1', 4, 21)
      await n.lamnaIn()
    }
    expect(anrop.map((a) => [a.url, a.kropp])).toEqual([
      ['/api/logicTestV4/answer', { sessionId: 's9', questionId: 'q-1', selectedIndex: 4, timeSpent: 21 }],
      ['/api/logicTestV4/complete', { sessionId: 's9' }],
      ['/api/logicTestV6/answer', { sessionId: 's9', questionId: 'q-1', selectedIndex: 4, timeSpent: 21 }],
      ['/api/logicTestV6/complete', { sessionId: 's9' }],
      ['/api/deduktiv/answer', { sessionId: 's9', questionId: 'q-1', selectedIndex: 4, timeSpent: 21 }],
      ['/api/deduktiv/complete', { sessionId: 's9' }],
    ])
  })

  it('deduktivens Träna, Nivåkoll och övningsprov: samma rutter som förut', async () => {
    const anrop = spionera({ json: { session: { id: 'd1' } } })
    await fetchDeduktivPassApi.skapa()
    await fetchDeduktivPassApi.svara({ sessionId: 'd1', nyckel: 'dd-g-d1-01', visat: 3, tid: 50 })
    await fetchDeduktivPassApi.slutfor('d1')
    await fetchNivakollApi.skapa('deduktiv')
    await ovningsprovApi.starta('deduktiv')
    expect(anrop.map((a) => [a.url, a.kropp])).toEqual([
      ['/api/traning/deduktivpass/session', {}],
      ['/api/traning/deduktivpass/svar', { sessionId: 'd1', nyckel: 'dd-g-d1-01', visat: 3, tid: 50 }],
      ['/api/traning/deduktivpass/slutfor', { sessionId: 'd1' }],
      ['/api/traning/nivakoll/session', { kind: 'deduktiv' }],
      ['/api/traning/ovningsprov/session', { typ: 'deduktiv', fran: 'hubb' }],
    ])
  })

  it('uppvärmningen: {questionId, selectedIndex}, inget sparas', async () => {
    const anrop = spionera({ json: { correct: true, rattVisat: 1, regel: 'r' } })
    await fetchUppvarmningApi.svara('v7-9', 1)
    expect(anrop).toEqual([{ url: '/api/traning/uppvarmning', metod: 'POST', kropp: { questionId: 'v7-9', selectedIndex: 1 } }])
  })
})

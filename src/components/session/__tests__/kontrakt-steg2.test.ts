// Kontrakttestet för etapp 4 (plan-testflode-2026-11-20 avsnitt 1 Sparande
// och 11): talserier, spatial förmåga och ordförråd, I-provet och
// personlighetstestet går i ramen utan att någon rutt eller POST-kropp
// ändras. Kropparna som de gamla vyerna skickade är låsta här, ordagrant.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { figurserieNivatestApi } from '../figurserie/api'
import { fetchSteg2PassApi } from '@/lib/tester/pass-klient'
import { IPROV_KROPP, iprovApi } from '@/components/traning/iprov/IprovFlode'
import { PERSONLIGHET_KROPP, personlighetApi } from '@/components/personalityTest/TestSessionView'
import { steg2Facit, tillSteg2U } from '../typer/Steg2'

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

describe('nivåtestet i talserier, spatial och ordförråd', () => {
  it('svar och inlämning går till /api/steg2/<typ> med samma kroppar som Steg2TestSession', async () => {
    const anrop = spionera()
    const api = figurserieNivatestApi({
      sessionId: 's2',
      answerEndpoint: '/api/steg2/talserie/answer',
      completeEndpoint: '/api/steg2/talserie/complete',
      sessionEndpoint: '/api/steg2/talserie/session',
    })
    expect(await api.svara('ts-a-01', 2, 31)).toBe(true)
    expect(await api.lamnaIn()).toBe(true)
    expect(anrop).toEqual([
      { url: '/api/steg2/talserie/answer', metod: 'POST', kropp: { sessionId: 's2', questionId: 'ts-a-01', selectedIndex: 2, timeSpent: 31 } },
      { url: '/api/steg2/talserie/complete', metod: 'POST', kropp: { sessionId: 's2' } },
    ])
  })

  it('reservvägen läser GET ?id= och uppgifterna ur fragor', async () => {
    const anrop = spionera({ json: { session: { answers: [], started_at: '2026-11-20T10:00:00Z', completed_at: null }, fragor: [{ id: 'sp-1' }] } })
    const api = figurserieNivatestApi({ sessionId: 'x', answerEndpoint: '/a', completeEndpoint: '/c', sessionEndpoint: '/api/steg2/spatial/session' })
    const r = await api.hamta()
    expect(anrop[0]).toEqual({ url: '/api/steg2/spatial/session?id=x', metod: 'GET', kropp: null })
    expect(r?.fragor).toEqual([{ id: 'sp-1' }])
  })
})

describe('Träna i talserier, spatial och ordförråd', () => {
  it('skapa {kind, grupp}, svar {sessionId, nyckel, visat, tid}, slutför {sessionId}', async () => {
    const anrop = spionera({ json: { session: {} } })
    await fetchSteg2PassApi.skapa('spatial', 'C')
    await fetchSteg2PassApi.svara({ sessionId: 'p1', nyckel: 'sp-9', visat: null, tid: 12 })
    await fetchSteg2PassApi.svara({ sessionId: 'p1', nyckel: 'sp-8', visat: 3, tid: 20 })
    await fetchSteg2PassApi.slutfor('p1')
    expect(anrop.map((a) => [a.url, a.kropp])).toEqual([
      ['/api/traning/steg2pass/session', { kind: 'spatial', grupp: 'C' }],
      ['/api/traning/steg2pass/svar', { sessionId: 'p1', nyckel: 'sp-9', visat: null, tid: 12 }],
      ['/api/traning/steg2pass/svar', { sessionId: 'p1', nyckel: 'sp-8', visat: 3, tid: 20 }],
      ['/api/traning/steg2pass/slutfor', { sessionId: 'p1' }],
    ])
  })

  it('facit ur motorns genomgång: regeln i talserier, löptext i spatial och ordförråd', () => {
    const t = steg2Facit('talserie', { rattVisat: 1, regel: 'Plus tre varje gång', misstag: ['Du tog två', '', 'Fel håll'] }, 0)
    expect(t).toMatchObject({ ratt: 1, correct: false, regel: 'Plus tre varje gång', misstag: 'Du tog två' })
    const s = steg2Facit('spatial', { rattVisat: 2, forklaring: 'Vrid ett kvarts varv.', misstag: [] }, 2)
    expect(s).toMatchObject({ ratt: 2, correct: true, regel: null, text: 'Vrid ett kvarts varv.', misstag: null })
    const o = steg2Facit('ordforrad', { rattVisat: 0, options: ['glad', 'ledsen'], facit_betyder: 'på gott humör.', exempel: 'Hon var glad.', misstag: ['', 'x'], arMotsats: [false, true] }, 1)
    expect(o).toMatchObject({ correct: false, text: 'Glad betyder på gott humör. Exempel: ”Hon var glad.”', misstag: 'Det är motsatsen.' })
    expect(tillSteg2U('talserie', { id: 'ts-1', visade: [1, 2], luckor: 1, options: [[3]] }).nyckel).toBe('ts-1')
  })
})

describe('I-provet', () => {
  it('start {halvt}, deltest {sessionId, nr, handling}, svar {sessionId, nyckel, visat, tid}', async () => {
    const anrop = spionera({ json: { session: { id: 'i1' } } })
    await iprovApi.starta(true)
    await iprovApi.del('i1', 1, 'starta')
    expect(await iprovApi.svara('i1', 'ord-3', 4, 9)).toBe(true)
    await iprovApi.del('i1', 1, 'avsluta')
    expect(anrop.map((a) => [a.url, a.kropp])).toEqual([
      ['/api/traning/iprov/session', { halvt: true }],
      ['/api/traning/iprov/del', { sessionId: 'i1', nr: 1, handling: 'starta' }],
      ['/api/traning/iprov/svar', { sessionId: 'i1', nyckel: 'ord-3', visat: 4, tid: 9 }],
      ['/api/traning/iprov/del', { sessionId: 'i1', nr: 1, handling: 'avsluta' }],
    ])
    expect(Object.keys(IPROV_KROPP.svar('a', 'b', 0, 0))).toEqual(['sessionId', 'nyckel', 'visat', 'tid'])
  })

  it('ett svar efter tiden (409) räknas som taget, ett nätfel inte', async () => {
    spionera({ status: 409 })
    expect(await iprovApi.svara('i1', 'n', 1, 1)).toBe(true)
    spionera({ status: 500 })
    expect(await iprovApi.svara('i1', 'n', 1, 1)).toBe(false)
  })
})

describe('personlighetstestet', () => {
  it('svar {sessionId, questionId, value}, inlämning {sessionId}, sparade svar med GET', async () => {
    const anrop = spionera({ json: { success: true, completed: false, answers: [] } })
    await personlighetApi.sparade('p9')
    expect(await personlighetApi.svara('p9', 'o1', 4)).toBe(true)
    expect((await personlighetApi.lamnaIn('p9')).ok).toBe(true)
    expect(anrop).toEqual([
      { url: '/api/personalityTest/answer?sessionId=p9', metod: 'GET', kropp: null },
      { url: '/api/personalityTest/answer', metod: 'POST', kropp: { sessionId: 'p9', questionId: 'o1', value: 4 } },
      { url: '/api/personalityTest/complete', metod: 'POST', kropp: { sessionId: 'p9' } },
    ])
    expect(Object.keys(PERSONLIGHET_KROPP.svar('a', 'b', 1))).toEqual(['sessionId', 'questionId', 'value'])
  })
})

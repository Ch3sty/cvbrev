// Kontrakttestet för etapp 6 (plan-testflode-2026-11-20 avsnitt 10):
// Nivåkollen i talserier, spatial förmåga och ordförråd går på samma rutter
// och med samma kroppar som de andra Nivåkollerna (/api/traning/nivakoll),
// bara kind skiljer. Kropparna är låsta här, ordagrant.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchNivakollApi } from '@/lib/tester/pass-klient'
import { lasSteg2Nivakoll, steg2KollApi } from '../steg2/Steg2Nivakoll'
import type { NivakollVy } from '@/lib/nivakoll/typer'

import fs from 'node:fs'
import path from 'node:path'
import { capture } from '@/lib/analytics/events'

vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn() }))

type Anrop = { url: string; metod: string; kropp: unknown }

function spionera(svar: { status?: number; json?: unknown } = {}) {
  const anrop: Anrop[] = []
  const f = vi.fn(async (url: string, init?: RequestInit) => {
    anrop.push({ url, metod: init?.method ?? 'GET', kropp: init?.body ? JSON.parse(String(init.body)) : null })
    return new Response(JSON.stringify(svar.json ?? { session: {} }), { status: svar.status ?? 200 })
  })
  vi.stubGlobal('fetch', f)
  return anrop
}

afterEach(() => vi.unstubAllGlobals())

describe('Nivåkollen i talserier, spatial och ordförråd', () => {
  it.each(['talserie', 'spatial', 'ordforrad'] as const)('%s: skapa {kind}, svar {sessionId, nyckel, svar, tid}, slutför {sessionId}', async (kind) => {
    const anrop = spionera()
    const api = steg2KollApi(kind, fetchNivakollApi)
    await api.skapa()
    expect(await api.svara({ sessionId: 'k1', nyckel: 'q-1', valt: 2, tid: 14 })).toBe(true)
    await api.slutfor('k1')
    expect(anrop).toEqual([
      { url: '/api/traning/nivakoll/session', metod: 'POST', kropp: { kind } },
      { url: '/api/traning/nivakoll/svar', metod: 'POST', kropp: { sessionId: 'k1', nyckel: 'q-1', svar: '2', tid: 14 } },
      { url: '/api/traning/nivakoll/slutfor', metod: 'POST', kropp: { sessionId: 'k1' } },
    ])
  })

  it('409 på ett svar räknas som sparat; 402 vid start skjuter ingen händelse utan vägg (etapp 7: väggen mäter sig själv)', async () => {
    spionera({ status: 409, json: { error: 'redan_besvarad' } })
    const api = steg2KollApi('spatial', fetchNivakollApi)
    expect(await api.svara({ sessionId: 'k', nyckel: 'n', valt: 0, tid: 1 })).toBe(true)
    spionera({ status: 402, json: { error: 'feature_required' } })
    expect(await api.skapa()).toEqual({ ok: false, status: 402 })
    expect(capture).not.toHaveBeenCalledWith('betalvagg_visad', expect.anything())
  })

  it('nivamatning_startad och betalväggarna med samma egenskaper som i de andra typerna', () => {
    const k = fs.readFileSync(path.resolve(__dirname, '../steg2/Steg2Nivakoll.tsx'), 'utf8')
    expect(k).toContain("capture('nivamatning_startad', { ommatning: v.typ === 'ommatning', smakprov: 0, test_kind: kind })")
    expect(k).toContain(`plats="ommatning" matning={{ test_kind: kind, lage: 'nivakoll' }}`)
    expect(k).toContain('<NivakollKop testKind={vy.kind} />')
  })

  it('vyn till ramens form: uppgiften som nivåtestet och Träna, facit ur motorns genomgång', () => {
    const vy: NivakollVy = {
      id: 'k1',
      kind: 'talserie',
      typ: 'matning',
      startad: '2026-11-20T10:00:00Z',
      avslutad: true,
      budget_s: 60,
      uppgifter: [{ kind: 'talserie', nyckel: 'ts-1', niva: 'grund', v: { id: 'ts-1', visade: [1, 2, 3], luckor: 1, options: [[4], [5]] } }],
      underlag: {},
      besvarade: { 'ts-1': { svar: '1', tid_s: 12 } },
      genomgang: { 'ts-1': { correct: false, ratt: '0', valt: '1', forklaring: 'Plus ett', misstag: 'Du tog två', data: { rattVisat: 0, regel: 'Plus ett', misstag: ['', 'Du tog två'] } } },
      resultat: null,
    }
    const s = lasSteg2Nivakoll(vy)
    expect(s.uppgifter[0]).toMatchObject({ nyckel: 'ts-1', kind: 'talserie' })
    expect(s.besvarade['ts-1']).toEqual({ valt: 1, tid_s: 12 })
    expect(s.facit?.['ts-1']).toMatchObject({ ratt: 0, correct: false, regel: 'Plus ett', misstag: 'Du tog två' })
    expect(s.harResultat).toBe(false)
  })
})

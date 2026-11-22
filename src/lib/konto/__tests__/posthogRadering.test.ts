// Kön för radering i PostHog (beslut-mejl-och-radering 2c punkt 4). fetch är
// en mock, databasen en dubbel i minnet; inget anrop lämnar testet.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const loggaAdminFel = vi.fn(async (..._a: unknown[]) => undefined)
vi.mock('@/lib/admin/collect', () => ({ loggaAdminFel: (...a: unknown[]) => loggaAdminFel(...a) }))

import { fakeSupabase } from '@/lib/email/lifecycle/__tests__/fakeSupabase'
import { korPosthogRaderingar, raderaIPosthog, POSTHOG_MAX_FORSOK } from '../posthogRadering.server'

const A = '11111111-2222-4333-8444-555555555555'
const B = '22222222-2222-4333-8444-555555555555'

/** fakeSupabase saknar delete: den läggs till här för kön. */
function db(rader: Array<{ distinct_id: string; forsok: number; senaste_fel?: string | null }>) {
  const d = fakeSupabase({ posthog_raderingar: rader.map((r) => ({ senaste_fel: null, ...r })) })
  const from = d.client.from
  d.client.from = (tabell: string) => {
    const b = from(tabell)
    b.delete = () => ({
      in: async (k: string, vs: string[]) => {
        d.tables[tabell] = d.tables[tabell].filter((r) => !vs.includes(r[k]))
        return { error: null }
      },
    })
    return b
  }
  return d
}

const fetchMock = vi.fn()
beforeEach(() => {
  fetchMock.mockReset()
  loggaAdminFel.mockClear()
  vi.stubGlobal('fetch', fetchMock)
  process.env.POSTHOG_RADERA_NYCKEL = 'phx_test'
  process.env.POSTHOG_PROJECT_ID = '148688'
})
afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.POSTHOG_RADERA_NYCKEL
  delete process.env.POSTHOG_PROJECT_ID
})

describe('korPosthogRaderingar', () => {
  it('2xx tar bort köraderna, ett anrop med alla id', async () => {
    fetchMock.mockResolvedValue({ status: 202 })
    const d = db([{ distinct_id: A, forsok: 0 }, { distinct_id: B, forsok: 2 }])
    expect(await korPosthogRaderingar(d.client)).toEqual({ success: true, raderade: 2, kvar: 0 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ distinct_ids: [A, B], delete_events: true })
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer phx_test')
    expect(d.tables.posthog_raderingar).toEqual([])
  })

  it('fel räknar upp forsok och sparar felet', async () => {
    fetchMock.mockResolvedValue({ status: 503 })
    const d = db([{ distinct_id: A, forsok: 1 }])
    const r = await korPosthogRaderingar(d.client)
    expect(r).toMatchObject({ success: false, raderade: 0, kvar: 1 })
    expect(d.tables.posthog_raderingar[0]).toMatchObject({ forsok: 2, senaste_fel: 'PostHog svarade 503' })
    expect(loggaAdminFel).not.toHaveBeenCalled()
  })

  it(`vid ${POSTHOG_MAX_FORSOK} försök skrivs ett fel under Drift, med antalet men utan id`, async () => {
    fetchMock.mockResolvedValue({ status: 500 })
    const d = db([{ distinct_id: A, forsok: POSTHOG_MAX_FORSOK - 1 }, { distinct_id: B, forsok: 0 }])
    await korPosthogRaderingar(d.client)
    expect(loggaAdminFel).toHaveBeenCalledTimes(1)
    const [, kalla, text, metadata] = loggaAdminFel.mock.calls[0] as [unknown, string, string, Record<string, unknown>]
    expect(kalla).toBe('posthog_radering')
    expect(text).toContain('1 raderade konton')
    expect(text).not.toContain(A)
    expect(text).not.toContain(B)
    expect(JSON.stringify(metadata)).not.toContain(A)
  })

  it('utan nyckel anropas inte PostHog och kön står kvar', async () => {
    delete process.env.POSTHOG_RADERA_NYCKEL
    const d = db([{ distinct_id: A, forsok: 0 }])
    await korPosthogRaderingar(d.client)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(d.tables.posthog_raderingar[0]).toMatchObject({ distinct_id: A, forsok: 1, senaste_fel: 'nyckel saknas' })
  })

  it('tom kö gör inget anrop', async () => {
    const d = db([])
    expect(await korPosthogRaderingar(d.client)).toEqual({ success: true, raderade: 0, kvar: 0 })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('saknas tabellen (före migreringen) kastar kön inte', async () => {
    const klient = { from: () => ({ select: () => ({ order: () => ({ limit: async () => ({ data: null, error: { message: 'relation does not exist' } }) }) }) }) }
    const logg = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await korPosthogRaderingar(klient as never)).toMatchObject({ success: false, raderade: 0 })
    logg.mockRestore()
  })
})

describe('raderaIPosthog', () => {
  it('2xx raderar direkt och köar id:t för en andra radering i nattkörningen', async () => {
    fetchMock.mockResolvedValue({ status: 202 })
    const d = db([])
    expect(await raderaIPosthog(d.client, A)).toBe('raderad')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(d.tables.posthog_raderingar).toHaveLength(1)
    expect(d.tables.posthog_raderingar[0]).toMatchObject({ distinct_id: A, senaste_fel: null })
  })

  it('2xx svarar raderad också när kön inte går att skriva', async () => {
    fetchMock.mockResolvedValue({ status: 202 })
    const logg = vi.spyOn(console, 'error').mockImplementation(() => {})
    const klient = { from: () => ({ upsert: async () => ({ error: { message: 'relation does not exist' } }) }) }
    expect(await raderaIPosthog(klient as never, A)).toBe('raderad')
    logg.mockRestore()
  })

  it('utan nyckel köas allt, utan anrop', async () => {
    delete process.env.POSTHOG_RADERA_NYCKEL
    const d = db([])
    expect(await raderaIPosthog(d.client, A)).toBe('koad')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(d.tables.posthog_raderingar).toHaveLength(1)
    expect(d.tables.posthog_raderingar[0].distinct_id).toBe(A)
  })

  it('ett nätverksfel köar och kastar inte', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNRESET'))
    const d = db([])
    expect(await raderaIPosthog(d.client, A)).toBe('koad')
    expect(d.tables.posthog_raderingar[0]).toMatchObject({ distinct_id: A, senaste_fel: 'PostHog gick inte att nå' })
  })

  it('redan köad rad dubbleras inte', async () => {
    fetchMock.mockResolvedValue({ status: 500 })
    const d = db([{ distinct_id: A, forsok: 3 }])
    await raderaIPosthog(d.client, A)
    expect(d.tables.posthog_raderingar).toHaveLength(1)
    expect(d.tables.posthog_raderingar[0].forsok).toBe(3)
  })

  it('saknas tabellen ger fel men kastar inte', async () => {
    fetchMock.mockResolvedValue({ status: 500 })
    const logg = vi.spyOn(console, 'error').mockImplementation(() => {})
    const klient = { from: () => ({ upsert: async () => ({ error: { message: 'relation does not exist' } }) }) }
    expect(await raderaIPosthog(klient as never, A)).toBe('fel')
    logg.mockRestore()
  })
})

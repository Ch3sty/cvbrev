/**
 * Valen som bär det publika brevet in i kontot (publikt omgång 3, beslut 6):
 * annonsen från säljsidan via fliken, mallen, tonen och annonsen bredvid
 * utkastets token. Och claim-klienten som skickar valet och städar.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ANNONS_NYCKEL,
  UTKAST_VAL_NYCKEL,
  hamtaAnnonsTillStart,
  lasUtkastVal,
  rensaUtkastVal,
  sparaAnnonsTillStart,
  sparaUtkastVal,
} from '../publikt-brev-val'
import { claimPendingDraft, storePendingDraft } from '../claim-draft-client'

vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn() }))

afterEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('annonsen från säljsidan', () => {
  it('följer med en gång och tas sedan bort', () => {
    sparaAnnonsTillStart('  Vi söker en projektledare.  ')
    expect(sessionStorage.getItem(ANNONS_NYCKEL)).toBe('Vi söker en projektledare.')
    expect(hamtaAnnonsTillStart()).toBe('Vi söker en projektledare.')
    expect(hamtaAnnonsTillStart()).toBeNull()
  })

  it('tomt fält lägger inget i fliken', () => {
    sparaAnnonsTillStart('Gammal annons')
    sparaAnnonsTillStart('   ')
    expect(hamtaAnnonsTillStart()).toBeNull()
  })

  it('kapas vid taket', () => {
    sparaAnnonsTillStart('a'.repeat(9000))
    expect(hamtaAnnonsTillStart()).toHaveLength(8000)
  })
})

describe('valet bredvid utkastets token', () => {
  it('läses bara för samma token', () => {
    sparaUtkastVal('tok-1', { mall: 'koppar', ton: 'confident', annons: 'Annonsen' })
    expect(lasUtkastVal('tok-1')).toEqual({ mall: 'koppar', ton: 'confident', annons: 'Annonsen' })
    expect(lasUtkastVal('tok-2')).toBeNull()
    expect(lasUtkastVal(null)).toBeNull()
  })

  it('går ut efter sju dagar', () => {
    const nu = Date.now()
    sparaUtkastVal('tok-1', { mall: 'koppar' }, nu)
    expect(lasUtkastVal('tok-1', nu + 6 * 86_400_000)).not.toBeNull()
    expect(lasUtkastVal('tok-1', nu + 8 * 86_400_000)).toBeNull()
    expect(localStorage.getItem(UTKAST_VAL_NYCKEL)).toBeNull()
  })

  it('trasigt innehåll ger null', () => {
    localStorage.setItem(UTKAST_VAL_NYCKEL, '{inte json')
    expect(lasUtkastVal('tok-1')).toBeNull()
    rensaUtkastVal()
    expect(localStorage.getItem(UTKAST_VAL_NYCKEL)).toBeNull()
  })
})

describe('claimPendingDraft', () => {
  it('skickar mallen, tonen och annonsen med token och städar efter svaret', async () => {
    storePendingDraft('tok-1')
    sparaUtkastVal('tok-1', { mall: 'koppar', ton: 'balanced', annons: 'Annonsen' })
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ redirect: '/dashboard/mina-brev/mallar?brev=b1&mall=koppar' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const ut = await claimPendingDraft()
    expect(ut).toBe('/dashboard/mina-brev/mallar?brev=b1&mall=koppar')
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/public/letter-draft/claim')
    expect(JSON.parse(String(init.body))).toEqual({ token: 'tok-1', mall: 'koppar', ton: 'balanced', annons: 'Annonsen' })
    expect(lasUtkastVal('tok-1')).toBeNull()
  })

  it('utan sparat val skickas bara token, som förut', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ redirect: '/dashboard/mina-brev/b1' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await claimPendingDraft('tok-9')).toBe('/dashboard/mina-brev/b1')
    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
    expect(JSON.parse(String(init.body))).toEqual({ token: 'tok-9' })
  })

  it('401 (ingen session ännu) behåller valet till nästa försök', async () => {
    sparaUtkastVal('tok-1', { mall: 'koppar' })
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401 })))
    expect(await claimPendingDraft('tok-1')).toBeNull()
    expect(lasUtkastVal('tok-1')).toEqual({ mall: 'koppar', ton: null, annons: null })
  })
})

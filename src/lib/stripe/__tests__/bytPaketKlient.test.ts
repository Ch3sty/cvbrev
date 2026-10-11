/**
 * Klientens tolkning av create-upgrade-session. Ett 400 med saljs: false
 * (målet säljs inte längre) får ett eget utfall så att raden kan säga vad
 * som säljs, och blir aldrig ett tyst "klart".
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { bytPaket } from '../bytPaketKlient'

const svara = (status: number, body: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
  )

afterEach(() => vi.restoreAllMocks())

describe('bytPaket', () => {
  it('skickar all_month till rutten och läser ett lyckat byte', async () => {
    const f = svara(200, { upgraded: true, planKey: 'all_month' })
    expect(await bytPaket('all_month')).toEqual({ typ: 'bytt', planKey: 'all_month' })
    const kropp = JSON.parse((f.mock.calls[0][1] as RequestInit).body as string)
    expect(kropp.planKey).toBe('all_month')
  })

  it('400 med saljs: false blir saljsInte', async () => {
    svara(400, { error: 'Det paketet säljs inte längre.', saljs: false })
    expect(await bytPaket('cv_week')).toEqual({ typ: 'saljsInte' })
  })

  it('409 skiljer längdbyte från redan Premium', async () => {
    svara(409, { vidFornyelse: true, skal: 'langd' })
    expect(await bytPaket('all_month')).toEqual({ typ: 'vidFornyelse', skal: 'langd' })
    vi.restoreAllMocks()
    svara(409, { alreadySubscribed: true })
    expect(await bytPaket('all_month')).toEqual({ typ: 'redan' })
  })

  it('annat fel blir fel', async () => {
    svara(500, { error: 'nej' })
    expect(await bytPaket('all_month')).toEqual({ typ: 'fel' })
  })
})

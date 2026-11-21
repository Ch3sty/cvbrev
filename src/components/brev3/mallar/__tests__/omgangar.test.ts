/**
 * Rutnätet i Mallar hämtar brevet i omgångar och försöker igen vid fel
 * (QA 2026-11-21: "Visa de N övriga" med ett långt brev gav 504 och korten
 * stod kvar med katalogens CV-bilder).
 */
import { describe, expect, it, vi } from 'vitest'
import { MallarFel, OMGANG_STORLEK, forhandsvisaIOmgangar, provaIgen } from '../klient'

const ids = (n: number) => Array.from({ length: n }, (_, i) => `m${i + 1}`)
const svar = (mallar: readonly string[]) => Object.fromEntries(mallar.map((m) => [m, `<html>${m}</html>`]))

describe('forhandsvisaIOmgangar', () => {
  it('delar 32 mallar i omgångar om högst åtta, en i taget, och lämnar varje omgång direkt', async () => {
    const anrop: string[][] = []
    const hamta = vi.fn(async (_b: string, mallar: readonly string[], _font?: string | null) => {
      anrop.push([...mallar])
      return svar(mallar)
    })
    const klar = vi.fn()
    const miss = await forhandsvisaIOmgangar('brev-1', ids(32), 'georgia', klar, { hamta, vantan: [0] })
    expect(OMGANG_STORLEK).toBe(8)
    expect(anrop.map((a) => a.length)).toEqual([8, 8, 8, 8])
    expect(anrop.flat()).toEqual(ids(32))
    expect(klar).toHaveBeenCalledTimes(4)
    expect(Object.keys(Object.assign({}, ...klar.mock.calls.map((c) => c[0])))).toEqual(ids(32))
    expect(hamta.mock.calls.every((c) => c[0] === 'brev-1' && c[2] === 'georgia')).toBe(true)
    expect(miss).toEqual([])
  })

  it('försöker igen när en omgång svarar 504, och korten får brevet', async () => {
    let gang = 0
    const hamta = vi.fn(async (_b: string, mallar: readonly string[]) => {
      gang++
      if (gang === 2) throw new MallarFel(504, null)
      return svar(mallar)
    })
    const klar = vi.fn()
    const miss = await forhandsvisaIOmgangar('brev-1', ids(16), null, klar, { hamta, vantan: [0] })
    expect(hamta).toHaveBeenCalledTimes(3)
    expect(hamta.mock.calls[1][1]).toEqual(hamta.mock.calls[2][1])
    expect(klar).toHaveBeenCalledTimes(2)
    expect(miss).toEqual([])
  })

  it('försöker igen vid nätfel', async () => {
    const hamta = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockImplementation(async (_b: string, mallar: readonly string[]) => svar(mallar))
    const miss = await forhandsvisaIOmgangar('brev-1', ids(3), null, vi.fn(), { hamta, vantan: [0] })
    expect(hamta).toHaveBeenCalledTimes(2)
    expect(miss).toEqual([])
  })

  it('ger upp efter tre försök, går vidare till nästa omgång och redovisar de som inte kom', async () => {
    const hamta = vi.fn(async (_b: string, mallar: readonly string[]) => {
      if (mallar[0] === 'm1') throw new MallarFel(504, null)
      return svar(mallar)
    })
    const klar = vi.fn()
    const miss = await forhandsvisaIOmgangar('brev-1', ids(10), null, klar, { hamta, vantan: [0] })
    expect(hamta).toHaveBeenCalledTimes(4)
    expect(miss).toEqual(ids(8))
    expect(klar).toHaveBeenCalledTimes(1)
    expect(Object.keys(klar.mock.calls[0][0])).toEqual(['m9', 'm10'])
  })

  it('försöker inte igen vid 4xx', async () => {
    const hamta = vi.fn(async () => {
      throw new MallarFel(404, null)
    })
    const miss = await forhandsvisaIOmgangar('brev-1', ids(4), null, vi.fn(), { hamta, vantan: [0] })
    expect(hamta).toHaveBeenCalledTimes(1)
    expect(miss).toEqual(ids(4))
  })

  it('avbrott stoppar hämtningen utan nya försök', async () => {
    const ctrl = new AbortController()
    const hamta = vi.fn(async (_b: string, mallar: readonly string[]) => {
      ctrl.abort()
      return svar(mallar)
    })
    await expect(forhandsvisaIOmgangar('brev-1', ids(16), null, vi.fn(), { hamta, signal: ctrl.signal, vantan: [0] })).rejects.toMatchObject({
      name: 'AbortError',
    })
    expect(hamta).toHaveBeenCalledTimes(1)
  })

  it('provaIgen: serverfel, tidsgräns och nät ja, övriga 4xx och avbrott nej', () => {
    expect(provaIgen(new MallarFel(504, null))).toBe(true)
    expect(provaIgen(new MallarFel(500, null))).toBe(true)
    expect(provaIgen(new MallarFel(429, null))).toBe(true)
    expect(provaIgen(new MallarFel(400, 'invalid_field'))).toBe(false)
    expect(provaIgen(new MallarFel(401, null))).toBe(false)
    expect(provaIgen(new TypeError('Failed to fetch'))).toBe(true)
    const avbrutet = new Error('x')
    avbrutet.name = 'AbortError'
    expect(provaIgen(avbrutet)).toBe(false)
  })
})

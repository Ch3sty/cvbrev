import { afterEach, describe, expect, it, vi } from 'vitest'
import { HJALP_IDN, HJALP_RUTOR, HJALP_UI, hjalpRuta, synligaRutor, type HjalpId } from '../hjalp-copy'
import {
  HJALP_HANDELSE,
  HJALP_NYCKEL,
  bestamDold,
  hjalpDoldUrProfil,
  lasLokalt,
  skrivLokalt,
  sparaHjalpDold,
  startlage,
} from '../hjalp'

const ALLA: HjalpId[] = [
  'A1', 'A2', 'A3', 'A4', 'A5',
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9',
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
  'D1', 'D2', 'D3',
  'E1', 'E2', 'E3',
]

describe('hjalp-copy', () => {
  it('har alla rutor A1 till E3 ur hjalp.md och inga andra', () => {
    expect([...HJALP_IDN].sort()).toEqual([...ALLA].sort())
    for (const id of ALLA) {
      const r = HJALP_RUTOR[id]
      expect(r.id).toBe(id)
      expect(r.grupp).toBe(id[0])
      expect(r.rubrik.length).toBeGreaterThan(5)
      expect(r.text.length).toBeGreaterThan(40)
    }
  })

  it('har inga tankstreck eller kvarglömda markeringar', () => {
    const texter = [
      ...Object.values(HJALP_RUTOR).flatMap((r) => [r.rubrik, r.text, r.verifieraNot ?? '']),
      ...Object.values(HJALP_UI),
    ]
    for (const t of texter) {
      expect(t, t).not.toMatch(/[–—]/)
      expect(t, t).not.toMatch(/\s-\s/)
      expect(t, t).not.toMatch(/VERIFIERA|\*\*|\[|\]/)
    }
  })

  it('rubrikerna är frågor', () => {
    for (const r of Object.values(HJALP_RUTOR)) expect(r.rubrik.endsWith('?'), r.id).toBe(true)
  })

  it('markerar exakt de rutor som ska verifieras och visar dem inte', () => {
    const verifiera = ALLA.filter((id) => HJALP_RUTOR[id].verifiera)
    expect(verifiera).toEqual(['A4', 'B3', 'B5', 'C3'])
    for (const id of verifiera) {
      expect(HJALP_RUTOR[id].verifieraNot).toBeTruthy()
      expect(hjalpRuta(id)).toBeNull()
    }
    expect(hjalpRuta('B1')?.rubrik).toBe('Logiktest: vad är en matris?')
    expect(synligaRutor(['A1', 'A4', 'A5']).map((r) => r.id)).toEqual(['A1', 'A5'])
  })
})

describe('hjalp, läget', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    try {
      window.localStorage.clear()
    } catch {
      /* */
    }
  })

  it('serverns värde vinner, sedan den lokala kopian, annars synlig', () => {
    expect(bestamDold(true, false)).toBe(true)
    expect(bestamDold(false, true)).toBe(false)
    expect(bestamDold(null, true)).toBe(true)
    expect(bestamDold(undefined, false)).toBe(false)
    expect(bestamDold(null, null)).toBe(false)
  })

  it('öppen första gången, hopfälld sedan, borta när dold', () => {
    expect(startlage(false, true)).toBe('oppen')
    expect(startlage(false, false)).toBe('hopfalld')
    expect(startlage(false, true, false)).toBe('hopfalld')
    expect(startlage(true, true)).toBe('dold')
    expect(startlage(true, false)).toBe('dold')
  })

  it('läser profilens kolumn och null när den saknas', () => {
    expect(hjalpDoldUrProfil({ hjalp_dold: true })).toBe(true)
    expect(hjalpDoldUrProfil({ hjalp_dold: false })).toBe(false)
    expect(hjalpDoldUrProfil({ hjalp_dold: null })).toBeNull()
    expect(hjalpDoldUrProfil({ id: 'x' })).toBeNull()
    expect(hjalpDoldUrProfil(null)).toBeNull()
  })

  it('lokala kopian skriver och läser, och tål spärrad lagring', () => {
    expect(lasLokalt()).toBeNull()
    skrivLokalt(true)
    expect(window.localStorage.getItem(HJALP_NYCKEL)).toBe('1')
    expect(lasLokalt()).toBe(true)
    skrivLokalt(false)
    expect(lasLokalt()).toBe(false)

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => skrivLokalt(true)).not.toThrow()
    expect(lasLokalt()).toBeNull()
  })

  it('sparar lokalt, meddelar sidan och postar till profilen', async () => {
    const f = vi.fn(async () => new Response(null, { status: 204 }))
    const hort: boolean[] = []
    const lyssna = (e: Event) => hort.push((e as CustomEvent<boolean>).detail)
    window.addEventListener(HJALP_HANDELSE, lyssna)
    const ok = await sparaHjalpDold(true, f as unknown as typeof fetch)
    window.removeEventListener(HJALP_HANDELSE, lyssna)
    expect(ok).toBe(true)
    expect(hort).toEqual([true])
    expect(lasLokalt()).toBe(true)
    expect(f).toHaveBeenCalledWith('/api/profile/hjalp', expect.objectContaining({ method: 'POST', body: JSON.stringify({ dold: true }) }))
  })

  it('kastar aldrig när servern inte svarar', async () => {
    const f = vi.fn(async () => {
      throw new Error('nät')
    })
    await expect(sparaHjalpDold(false, f as unknown as typeof fetch)).resolves.toBe(false)
    expect(lasLokalt()).toBe(false)
  })
})

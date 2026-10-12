// @vitest-environment node
/**
 * Figurseriernas urval och rättning (beställningen omgång 2, A2): samma
 * urval ur sessionId på test- och resultatsidan, 15 per session, inget facit
 * under testet, servern dömer på originalindex, och poolerna blandas aldrig
 * med matrisernas.
 */
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'

// Bankfilerna är tomma före befordran; testet fyller dem med kandidaterna,
// lästa som filer (kandidatkatalogen importeras aldrig).
const kand = (n: string) => JSON.parse(readFileSync(`src/lib/figurserierV1/kandidater/${n}.json`, 'utf8'))
vi.mock('../bankGrund.json', () => ({ default: kand('grund') }))
vi.mock('../bankAvancerad.json', () => ({ default: kand('avancerad') }))
vi.mock('../bankExpert.json', () => ({ default: kand('expert') }))

const SESSION = '3f1c2a9e-1111-4222-8333-944455556666'

async function las() {
  vi.resetModules()
  return import('../fragor.server')
}


describe('figurseriernas frågor', () => {
  it('15 uppgifter, samma urval vid varje läsning, olika för olika sessioner', async () => {
    const F = await las()
    const a = F.serieInnehall({ id: SESSION, test_type: 'figurserier-grund', meta: F.SERIE_META })
    const b = F.serieInnehall({ id: SESSION, test_type: 'figurserier-grund', meta: F.SERIE_META })
    expect(a.fragor).toHaveLength(15)
    expect(a.fragor.map((q) => q.id)).toEqual(b.fragor.map((q) => q.id))
    const c = F.serieInnehall({ id: '00000000-0000-4000-8000-000000000001', test_type: 'figurserier-grund', meta: F.SERIE_META })
    expect(c.fragor.map((q) => q.id)).not.toEqual(a.fragor.map((q) => q.id))
    expect(a.fragor.every((q) => q.id.startsWith('fs-g-'))).toBe(true)
  })

  it('under testet: inget facit, ingen regel, inga misstag; genomgången bara när testet är avslutat', async () => {
    const F = await las()
    const pagaende = F.serieInnehall({ id: SESSION, test_type: 'figurserier-expert', meta: F.SERIE_META })
    expect(pagaende.genomgang).toBeNull()
    for (const q of pagaende.fragor) expect(Object.keys(q).sort()).toEqual(['difficulty', 'id', 'options', 'rad'])
    const klar = F.serieInnehall({ id: SESSION, test_type: 'figurserier-expert', meta: F.SERIE_META, completed_at: '2026-10-12T10:00:00Z' })
    expect(klar.genomgang).toHaveLength(15)
    for (const [i, g] of klar.genomgang!.entries()) {
      expect(g.options).toEqual(klar.fragor[i].options)
      expect(g.misstag[g.rattVisat]).toBe('')
    }
  })

  it('servern dömer på originalindex och poängen räknas om mot banken', async () => {
    const F = await las()
    const klar = F.serieInnehall({ id: SESSION, test_type: 'figurserier-avancerad', meta: F.SERIE_META, completed_at: 'x' })
    const svar = klar.genomgang!.map((g, i) => {
      const q = F.hittaSerieFraga(g.id)!
      const visat = i < 10 ? g.rattVisat : (g.rattVisat + 1) % 6
      const b = F.bedomSerieSvar(q, SESSION, true, visat)!
      return { q_id: g.id, ...b }
    })
    expect(svar.filter((s) => s.correct)).toHaveLength(10)
    expect(F.rattaSerieSvar(svar)).toBe(10)
    expect(F.bedomSerieSvar(F.hittaSerieFraga(svar[0].q_id)!, SESSION, true, 6)).toBeNull()
  })

  it('en matrisfråga finns inte i figurseriernas pool', async () => {
    const F = await las()
    expect(F.hittaSerieFraga('v7g-v3-vrid-01')).toBeUndefined()
    expect(F.rattaSerieSvar([{ q_id: 'v7g-v3-vrid-01', selected: 0 }])).toBe(0)
    expect(F.arSerieTestTyp('matrislogik-expert')).toBe(false)
  })

  it('bankfilerna är tomma precis när BANK_BEFORDRAD är false', async () => {
    const { BANK_BEFORDRAD } = await import('../status')
    for (const f of ['bankGrund', 'bankAvancerad', 'bankExpert']) {
      const bank = JSON.parse(readFileSync(`src/lib/figurserierV1/${f}.json`, 'utf8'))
      expect(bank.length === 0, f).toBe(!BANK_BEFORDRAD)
    }
  })
})

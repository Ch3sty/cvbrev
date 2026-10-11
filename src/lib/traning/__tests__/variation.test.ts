/**
 * Tillägget om variation (2026-10-12): exponeringsreglerna i passet (2.1)
 * och sträck- och golvregeln mellan passen (1.3).
 */
import { describe, expect, it } from 'vitest'
import { utanMallIRad, valjPass, valjRiktat, type BankFragaInfo, type Sedd } from '../passgenerator'
import { strackEllerGolv, passUtfall } from '../strack'
import { pForNiva } from '../svarighet'
import { laggTill } from '../datum'
import type { SessionRad, SlutfordRad, TraningsMeta } from '../historik'

const IDAG = '2026-10-12'

/** 90 frågor kring nivå 5 med tre familjer, tre primitiver och fem recept. */
function bank(n = 90): BankFragaInfo[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `q${i}`,
    p: 0.3 + (0.5 * i) / (n - 1),
    prior: 3,
    family: ['vridning', 'vandring', 'spegling'][i % 3],
    kalla: 'avancerad',
    recept: `M${i % 5}`,
    primitiv: ['pil', 'orbital', 'stralar', 'sektorhjul', 'ruta2x2'][i % 5],
  }))
}

describe('exponeringsreglerna (2.1)', () => {
  it('ingen mall två gånger i rad', () => {
    const u = valjPass({ bank: bank(), niva: 5, sedda: [], idag: IDAG, seed: 'a' })
    const recept = new Map(bank().map((q) => [q.id, q.recept]))
    const r = u.fragor.map((id) => recept.get(id))
    for (let i = 1; i < r.length; i++) expect(r[i], `${i}`).not.toBe(r[i - 1])
  })

  it('högst två per familj och per primitiv när banken räcker', () => {
    const b = Array.from({ length: 120 }, (_, i) => ({ ...bank(120)[i], family: `f${i % 9}`, primitiv: `p${i % 9}` }))
    const u = valjPass({ bank: b, niva: 5, sedda: [], idag: IDAG, seed: 'b' })
    const per = (falt: 'family' | 'primitiv') => {
      const m = new Map<string, number>()
      for (const id of u.fragor) { const q = b.find((x) => x.id === id)!; m.set(q[falt]!, (m.get(q[falt]!) ?? 0) + 1) }
      return Math.max(...m.values())
    }
    expect(per('family')).toBeLessThanOrEqual(2)
    expect(per('primitiv')).toBeLessThanOrEqual(2)
  })

  it('30 dagar är ett löfte: finns nio osedda nära nivån visas ingen sedd fråga', () => {
    const b = bank()
    // Hon har sett alla utom tolv nära nivån, för fem dagar sedan.
    const pN = pForNiva(5)
    const nara = b.filter((q) => Math.abs(q.p - pN) <= 0.3).slice(0, 12).map((q) => q.id)
    const sedda: Sedd[] = b.filter((q) => !nara.includes(q.id)).map((q) => ({ id: q.id, dag: laggTill(IDAG, -10) }))
    const u = valjPass({ bank: b, niva: 5, sedda, idag: IDAG, seed: 'c' })
    expect(u.upprepade).toEqual([])
    expect(u.fragor.every((id) => nara.includes(id))).toBe(true)
  })

  it('räcker inte de osedda får sedda frågor fylla, som förut', () => {
    const b = bank(20)
    const sedda: Sedd[] = b.slice(4).map((q) => ({ id: q.id, dag: laggTill(IDAG, -10) }))
    const u = valjPass({ bank: b, niva: 5, sedda, idag: IDAG, seed: 'd' })
    expect(u.fragor).toHaveLength(9)
    expect(u.upprepade.length).toBeGreaterThan(0)
  })

  it('utanMallIRad flyttar så lite som möjligt och behåller frågorna', () => {
    const q = (id: string, recept: string): BankFragaInfo => ({ id, p: 0.5, prior: 3, family: null, kalla: 'grund', recept })
    const ut = utanMallIRad([q('a', 'X'), q('b', 'X'), q('c', 'Y'), q('d', 'X')])
    expect(ut.map((x) => x.id)).toEqual(['a', 'c', 'b', 'd'])
  })

  it('riktat pass följer löftet men inte familjetaket', () => {
    const b = bank().map((q) => ({ ...q, family: 'vridning' }))
    const u = valjRiktat({ bank: b, family: 'vridning', niva: 5, sedda: [], idag: IDAG, seed: 'e' })
    expect(u.fragor).toHaveLength(9)
  })

  it('sträck: över-bandet dras ur p minst 0,25 under nivån', () => {
    const b = bank()
    const u = valjPass({ bank: b, niva: 5.5, sedda: [], idag: IDAG, seed: 'f', strack: true })
    const pN = pForNiva(5.5)
    const over = u.fragor.filter((id) => u.band[id] === 'over').map((id) => b.find((q) => q.id === id)!.p)
    expect(over.every((p) => p <= pN - 0.25 + 1e-9)).toBe(true)
  })

  it('golv: under-bandet får tre frågor', () => {
    const b = bank(120).map((q, i) => ({ ...q, family: `f${i % 9}`, primitiv: `p${i % 9}` }))
    const u = valjPass({ bank: b, niva: 4.5, sedda: [], idag: IDAG, seed: 'g', golv: true })
    expect(u.sammansattning.under).toBe(3)
  })
})

describe('sträck- och golvregeln (1.3)', () => {
  const meta = (fragor: string[], extra: Partial<TraningsMeta> = {}): TraningsMeta =>
    ({ traning: 1, typ: 'pass', fragor, upprepade: [], kalibrering: null, ...extra }) as unknown as TraningsMeta
  const pass = (id: string, ratt: number, extra: Partial<TraningsMeta> = {}): { rad: SlutfordRad; session: SessionRad } => {
    const fragor = Array.from({ length: 9 }, (_, i) => `${id}-q${i}`)
    return {
      rad: { id, dag: IDAG, typ: (extra.typ ?? 'pass') as SlutfordRad['typ'], meta: meta(fragor, extra), slut: `2026-10-1${id.length}T10:00:00Z` },
      session: { id, test_type: 'matrislogik-pass', meta: meta(fragor, extra), answers: fragor.map((q, i) => ({ q_id: q, selected: 0, correct: i < ratt })), created_at: '', completed_at: '' },
    }
  }
  it('två pass i rad med minst 8 av 9 ger sträck', () => {
    const a = pass('a', 8); const b = pass('b', 9)
    expect(strackEllerGolv([a.rad, b.rad], [a.session, b.session])).toBe('strack')
  })
  it('ett pass med 8 av 9 räcker inte', () => {
    const a = pass('a', 6); const b = pass('b', 9)
    expect(strackEllerGolv([a.rad, b.rad], [a.session, b.session])).toBe(null)
  })
  it('högst 3 av 9 i förra passet ger golv', () => {
    const a = pass('a', 9); const b = pass('b', 3)
    expect(strackEllerGolv([a.rad, b.rad], [a.session, b.session])).toBe('golv')
  })
  it('upprepade och kalibreringsfrågan räknas inte', () => {
    const a = pass('a', 9, { upprepade: ['a-q0'], kalibrering: 'a-q1' })
    expect(passUtfall(a.rad, [a.session])).toEqual({ ratt: 7, antal: 7 })
  })
})

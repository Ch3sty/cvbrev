import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { bygg, key, mjukNyckel, arHoger } from '../lib/matris/generera.mjs'
import { PLUS, UT } from '../lib/matris/recept-plus.mjs'
import { upptagnaRutnat, strukturFel } from '../lib/matris/kor-generator.mjs'
import { facitRuta0, kandidatKrav } from '../lib/matris/kontroll.mjs'

describe('generatorn för svår plus', () => {
  it('ett upptaget rutnät ger ett nytt försök och ett annat rutnät', () => {
    for (const rc of [PLUS[0], PLUS[16], PLUS[24], PLUS[39]]) {
      const forst = bygg(rc, new Set())
      const igen = bygg(rc, new Set([key(forst.grid)]))
      expect(key(igen.grid)).not.toBe(key(forst.grid))
      expect(igen.forsok).toBeGreaterThan(forst.forsok)
    }
  })

  it('kandidatfilen krockar inte med bankerna och har inga mjuka dubbletter', () => {
    const fil = JSON.parse(readFileSync(UT, 'utf8'))
    const upptagna = upptagnaRutnat(UT)
    expect(fil).toHaveLength(40)
    for (const q of fil) expect(upptagna.has(key(q.grid))).toBe(false)
    const mjuka = fil.map((q: { mekanism: string }) => mjukNyckel(q))
    expect(new Set(mjuka).size).toBe(40)
  })

  it('fälten för bandet', () => {
    const fil = JSON.parse(readFileSync(UT, 'utf8'))
    const per: Record<string, number> = {}
    for (const q of fil) {
      expect(q).toMatchObject({ band: 'plus', difficulty: 4, p_prior: q.mekanism === 'P3' ? 0.45 : 0.3 })
      expect(q.misstagGranskas).toBeUndefined()
      q.misstag.forEach((m: string, i: number) => (i === q.correctAnswer ? expect(m).toBe('') : expect(m.length).toBeGreaterThan(0)))
      expect(`${q.rule} ${q.misstag.join(' ')}`).not.toMatch(/[—–]|\blätt/)
      per[q.mekanism] = (per[q.mekanism] ?? 0) + 1
    }
    expect(per).toEqual({ P1: 8, P2: 8, P3: 8, P4: 8, P5: 8 })
  })

  it("P1': form och fyllning i latinska kvadrater, symbolen i schack, minst tre åt höger", () => {
    const fil = JSON.parse(readFileSync(UT, 'utf8'))
    const p1 = fil.filter((q: { mekanism: string }) => q.mekanism === 'P1')
    expect(p1.map((q: { id: string }) => q.id)).toEqual(['09', '10', '11', '12', '13', '14', '15', '16'].map((n) => `v7e-plus-p1-${n}`))
    let hoger = 0
    for (const q of p1) {
      const full = q.grid.map((r: unknown[]) => r.slice())
      full[2][2] = q.options[q.correctAnswer]
      const fyll = new Set(full.flat().map((c: { baseFill: string }) => c.baseFill))
      expect(fyll).toEqual(new Set(['none', 'gray', 'black']))
      expect(new Set(full.flat().map((c: { symbol: string }) => c.symbol)).size).toBe(2)
      expect(full.flat().some((c: { symbol: string }) => c.symbol === 'ring')).toBe(false)
      if (arHoger(full.map((r: { base: string }[]) => r.map((c) => c.base)))) hoger++
    }
    expect(hoger).toBeGreaterThanOrEqual(3)
  })

  it('P4 och P5: facitlinjen delar ett element och facit har minst två', () => {
    const fil = JSON.parse(readFileSync(UT, 'utf8'))
    const over = fil.filter((q: { family: string }) => q.family === 'overlagring')
    expect(over.map((q: { id: string }) => q.id).filter((id: string) => /over-0[1268]$/.test(id))).toEqual([])
    for (const q of over) {
      const v = (c: { filled?: number[]; rays?: number[] }) => c.filled ?? c.rays ?? []
      const kol = q.rule.startsWith('Den tredje')
      const [a, b] = kol ? [v(q.grid[2][0]), v(q.grid[2][1])] : [v(q.grid[0][2]), v(q.grid[1][2])]
      expect(a.some((x: number) => b.includes(x))).toBe(true)
      expect(v(q.options[q.correctAnswer]).length).toBeGreaterThanOrEqual(2)
    }
  })

  it('kraven för nya kandidater: ingen fråga har facit lika med rutan uppe till vänster', () => {
    const fil = JSON.parse(readFileSync(UT, 'utf8'))
    for (const q of fil) {
      expect(facitRuta0(q)).toBe(false)
      expect(kandidatKrav(q)).toEqual([])
    }
  })

  it('strukturvariationen fäller en latinsk mekanism med en enda struktur', () => {
    const fil = JSON.parse(readFileSync(UT, 'utf8'))
    const p3 = fil.filter((q: { mekanism: string }) => q.mekanism === 'P3')
    expect(strukturFel(p3)).toEqual(['P3: alla 8 frågor har samma struktur, minst två olika krävs'])
    expect(strukturFel(p3, { P3: 'undantag' })).toEqual([])
    expect(strukturFel(fil.filter((q: { mekanism: string }) => q.mekanism === 'P1'))).toEqual([])
  })
})

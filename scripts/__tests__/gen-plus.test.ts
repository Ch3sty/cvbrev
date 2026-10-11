import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { bygg, key, mjukNyckel } from '../lib/matris/generera.mjs'
import { PLUS, UT } from '../lib/matris/recept-plus.mjs'
import { upptagnaRutnat } from '../lib/matris/kor-generator.mjs'

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
      expect(q).toMatchObject({ band: 'plus', difficulty: 4, p_prior: 0.3 })
      expect(q.misstagGranskas).toBeUndefined()
      q.misstag.forEach((m: string, i: number) => (i === q.correctAnswer ? expect(m).toBe('') : expect(m.length).toBeGreaterThan(0)))
      expect(`${q.rule} ${q.misstag.join(' ')}`).not.toMatch(/[—–]|\blätt/)
      per[q.mekanism] = (per[q.mekanism] ?? 0) + 1
    }
    expect(per).toEqual({ P1: 8, P2: 8, P3: 8, P4: 8, P5: 8 })
  })
})

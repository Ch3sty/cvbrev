/**
 * Matrislogik parti 06 (docs/fragebank/matris-2026-11-19-omg3.md): kandidaterna
 * ligger i kandidater/ med fran_version 7 och är inte valbara förrän
 * scripts/befordra-matris-parti-06.mjs har körts efter granskningen.
 * Filen läses med fs, aldrig import (kandidater.test.ts).
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { ALLA_MATRISFRAGOR, BANK_VERSION, TRANINGSVERSION, valbarI } from '../selectQuestions.v7'
import { primitivSvg, ramFel } from '../svgMatt'
import type { V7Cell } from '../types.v7'

type K = { id: string; fran_version?: number; family?: string; grid: (V7Cell | null)[][]; options: V7Cell[] }
const KANDIDATER = JSON.parse(
  readFileSync('src/lib/logicTestV7/kandidater/matris-parti-06.v7.json', 'utf8')
) as K[]

describe('parti 06', () => {
  it('kandidaterna före granskning: fran_version 7 och unika id', () => {
    expect(KANDIDATER).toHaveLength(50)
    expect(new Set(KANDIDATER.map((q) => q.id)).size).toBe(50)
    for (const q of KANDIDATER) {
      expect(q.id).toMatch(/^v7[gae]-b7-/)
      expect(q.fran_version).toBe(7)
    }
  })

  it('valbara först i version 7, aldrig i dagens versioner', () => {
    for (const q of KANDIDATER) {
      expect(valbarI(q, BANK_VERSION)).toBe(false)
      expect(valbarI(q, 7)).toBe(true)
    }
    if (TRANINGSVERSION < 7) for (const q of KANDIDATER) expect(valbarI(q, TRANINGSVERSION)).toBe(false)
  })

  it('inget id krockar med bankerna, utom de som befordrats oförändrade', () => {
    const bank = new Map(ALLA_MATRISFRAGOR.map((q) => [q.id, q]))
    for (const q of KANDIDATER) {
      const b = bank.get(q.id)
      if (b) expect(b).toEqual(q)
    }
  })

  it('de nya primitiverna ritas, och ram-grått bara på referens', () => {
    for (const q of KANDIDATER) {
      for (const c of [...q.grid.flat(), ...q.options]) {
        if (!c) continue
        expect(['klocka', 'grupp', 'streckfigur']).toContain(c.kind)
        expect(primitivSvg(c).length).toBeGreaterThan(20)
        expect(ramFel(c)).toEqual([])
      }
    }
    // gruppen ritar lika många tecken som antalet, streckfiguren alltid åtta streck
    expect((primitivSvg({ kind: 'grupp', antal: 7, form: 'triangle', fill: 'none' }).match(/<path/g) ?? []).length).toBe(7)
    expect((primitivSvg({ kind: 'streckfigur', streck: [0, 4] }).match(/<line/g) ?? []).length).toBe(8)
    expect((primitivSvg({ kind: 'streckfigur', streck: [0, 4] }).match(/stroke-dasharray/g) ?? []).length).toBe(6)
  })
})

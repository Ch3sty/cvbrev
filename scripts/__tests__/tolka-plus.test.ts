import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { tolka, familjFor } from '../lib/matris/tolka.mjs'
import { oberoende } from '../lib/matris/kontroll.mjs'
import { vridenFraga, latinFraga } from './fixtures-matris.mjs'

describe('tolka: överlagring med vridning', () => {
  for (const op of ['xor', 'diff-ab'])
    for (const k of [1, 7])
      for (const axel of ['kolumn', 'rad'])
        it(`${op}, k = ${k}, axel ${axel}`, () => {
          const q = vridenFraga(op, k, axel)
          const t = tolka(q)
          expect(t.ok).toBe(true)
          expect(t.tvetydig).toEqual([])
          expect(t.regel.stralar.regel).toBe('overlagring-vriden')
          expect(t.regel.stralar.info).toEqual({ op, axel, k })
          expect(t.pred.stralar).toEqual(q.pred.rays)
          expect(t.traffar).toEqual([0])
          expect(familjFor(q, t)).toBe('overlagring')
        })
})

describe('oberoende', () => {
  const A = [[0, 1, 2], [1, 2, 0], [2, 0, 1]]
  const B3 = [[0, 1, 2], [2, 0, 1], [1, 2, 0]] // ortogonal mot A: 9 kombinationer
  const Bomd = [[1, 2, 0], [2, 0, 1], [0, 1, 2]] // omdöpning av A: 3 kombinationer
  it('två latinska kvadrater med 3 kombinationer fälls', () => {
    const q = latinFraga(A, Bomd, false)
    const t = tolka(q)
    expect(t.ok).toBe(true)
    expect(oberoende(q, t)).toEqual(['test-latin: symbol är en funktion av bas'])
  })
  it('två latinska kvadrater med 9 kombinationer godkänns', () => {
    const q = latinFraga(A, B3, false)
    expect(oberoende(q)).toEqual([])
  })
  it('latinska kvadrater plus schackmönster godkänns', () => {
    const q = latinFraga(A, B3, true)
    const t = tolka(q)
    expect(t.regel.basfyll.regel).toBe('periodisk')
    expect(oberoende(q, t)).toEqual([])
    expect(familjFor(q, t)).toBe('latin-flera')
  })
})

describe('familjFor oförändrad för de sex bankerna', () => {
  it('family i banken är densamma som tolkningen', () => {
    const filer = ['Grund', '', 'Expert', 'Grund3c', 'Avancerad3c', 'Expert3c'].map((f) => `src/lib/logicTestV7/questionBank${f}.v7.json`)
    const avvik: string[] = []
    let n = 0
    for (const fil of filer) {
      for (const q of JSON.parse(readFileSync(fil, 'utf8'))) {
        n++
        const f = familjFor(q)
        if (f !== q.family) avvik.push(`${q.id}: ${q.family} -> ${f}`)
      }
    }
    expect(n).toBe(270)
    expect(avvik).toEqual([])
  })
})

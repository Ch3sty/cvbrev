import { describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { alternativSeed, blandadPermutation } from '../blanda'
import * as skript from '../../../../scripts/lib/blanda-alternativ.mjs'

describe('valideringsskriptens blandning', () => {
  it('ger exakt samma permutation som appen', () => {
    for (let i = 0; i < 200; i++) {
      const seed = alternativSeed(randomUUID(), `v7-q${i}`)
      expect(skript.blandadPermutation(seed, 6)).toEqual(blandadPermutation(seed, 6))
      expect(skript.blandadPermutation(seed, 4)).toEqual(blandadPermutation(seed, 4))
    }
    expect(skript.alternativSeed('a', 'b')).toBe(alternativSeed('a', 'b'))
  })
})

/**
 * Tankstreck i frysta verbala titlar (beställning omgång 2, C3): bankfilerna
 * rörs inte, men inget tankstreck når det användaren ser.
 */
import { describe, expect, it } from 'vitest'
import { visningstitel } from '../titel'
import bankV1 from '@/lib/verbalTestV1/questionBank.json'
import bankV2 from '@/lib/verbalTestV2/questionBank.json'

const TANKSTRECK = /[—–]/

describe('visningstitel', () => {
  it('tar bort PASSAGE, numret och tankstrecket', () => {
    expect(visningstitel('PASSAGE 1 — Sommaranställningar')).toBe('Sommaranställningar')
    expect(visningstitel('PASSAGE 12 – Mental hälsa')).toBe('Mental hälsa')
    expect(visningstitel('Passage 3: Distansarbete')).toBe('Distansarbete')
    expect(visningstitel('PASSAGE 4 - Lön')).toBe('Lön')
  })
  it('rör inte vanliga titlar och byter tankstreck inne i titeln mot komma', () => {
    expect(visningstitel('Budget 2025')).toBe('Budget 2025')
    expect(visningstitel('Hemtjänstens schema')).toBe('Hemtjänstens schema')
    expect(visningstitel('Lön — och förmåner')).toBe('Lön, och förmåner')
    expect(visningstitel(null)).toBe('')
  })
  it('ingen av de 48 frysta titlarna har kvar tankstreck eller PASSAGE', () => {
    const titlar = [...bankV1, ...bankV2].map((p) => p.title)
    expect(titlar.filter((t) => TANKSTRECK.test(t)).length).toBe(48)
    for (const t of titlar) {
      const v = visningstitel(t)
      expect(v).not.toMatch(TANKSTRECK)
      expect(v).not.toMatch(/passage/i)
      expect(v.length).toBeGreaterThan(2)
    }
  })
})

/**
 * Ortlistan i extractContact (kommunnamn.ts) är ett utdrag ur
 * kommunalskatt-2026.json. Testet fäller när JSON-filen byts (ny årgång,
 * en kommun som byter namn) utan att listan följer med.
 */
import { describe, expect, it } from 'vitest'
import kommunerData from '@/data/kommunalskatt-2026.json'
import { KOMMUNNAMN } from '../kommunnamn'

describe('KOMMUNNAMN', () => {
  const urJson = (kommunerData as Array<{ namn: string }>).map((k) => k.namn)

  it('har exakt samma kommuner som kommunalskatt-2026.json', () => {
    expect([...KOMMUNNAMN].sort()).toEqual([...urJson].sort())
  })

  it('har 290 unika namn i svensk ordning', () => {
    expect(KOMMUNNAMN).toHaveLength(290)
    expect(new Set(KOMMUNNAMN).size).toBe(290)
    expect([...KOMMUNNAMN]).toEqual([...KOMMUNNAMN].sort((a, b) => a.localeCompare(b, 'sv')))
  })
})

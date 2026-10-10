/**
 * Våg 3c: matrisbanken med family, misstag och difficulty.
 *
 * - Varje fråga i alla sex banker har en familj ur familjer.json, en
 *   svårighetsprior 1-4 och ett misstag per alternativ på originalindex.
 * - De klassiska testerna drar fortfarande bara ur de 28 frusna frågorna per
 *   nivå, så att gamla sessioner får samma urval på resultatsidan.
 * - misstag och family följer aldrig med till testvyn (misstag avslöjar facit).
 */
import { describe, expect, it } from 'vitest'
import {
  GRUND_POOL,
  AVANCERAD_POOL,
  EXPERT_POOL,
  GRUND_3C,
  AVANCERAD_3C,
  EXPERT_3C,
  ALLA_MATRISFRAGOR,
  selectQuestionsForSession,
  selectAvanceradQuestionsForSession,
  selectExpertQuestionsForSession,
} from '../selectQuestions.v7'
import { selectProvQuestionsForSession } from '../selectProv.v7'
import { BANK_FOR_RUTT, visadeFragor, genomgangsFragor } from '../fragor.server'
import { FAMILJER, arMatrisFamilj, familjNamn } from '../familjer'

describe('matrisbanken efter våg 3c', () => {
  it('har minst 250 frågor och unika id', () => {
    expect(ALLA_MATRISFRAGOR.length).toBeGreaterThanOrEqual(250)
    expect(new Set(ALLA_MATRISFRAGOR.map((q) => q.id)).size).toBe(ALLA_MATRISFRAGOR.length)
  })

  it('de frusna bankerna har kvar 28 frågor var', () => {
    expect([GRUND_POOL.length, AVANCERAD_POOL.length, EXPERT_POOL.length]).toEqual([28, 28, 28])
  })

  it('varje fråga har family, difficulty och misstag', () => {
    for (const q of ALLA_MATRISFRAGOR) {
      expect(arMatrisFamilj(q.family), q.id).toBe(true)
      expect(q.difficulty, q.id).toBeGreaterThanOrEqual(1)
      expect(q.difficulty, q.id).toBeLessThanOrEqual(4)
      expect(q.misstag?.length, q.id).toBe(q.options.length)
      const granskas = new Set(q.misstagGranskas ?? [])
      q.misstag!.forEach((m, i) => {
        if (i === q.correctAnswer) expect(m, q.id).toBe('')
        else if (!granskas.has(i)) expect(m.length, `${q.id} alternativ ${i}`).toBeGreaterThan(0)
        expect(m, q.id).not.toMatch(/[—–]/)
      })
    }
  })

  it('alla familjer finns i varje nivå, och namnen går att slå upp', () => {
    for (const niva of [GRUND_3C, AVANCERAD_3C, EXPERT_3C]) {
      const fam = new Set(niva.map((q) => q.family))
      for (const f of FAMILJER) expect(fam.has(f.id), f.id).toBe(true)
    }
    expect(familjNamn('rotation-med-byte')).toBe('Rotation med byte')
    expect(familjNamn('okand')).toBeNull()
  })

  it('de klassiska testerna drar bara ur de frusna bankerna', () => {
    const nya = new Set([...GRUND_3C, ...AVANCERAD_3C, ...EXPERT_3C].map((q) => q.id))
    for (let i = 0; i < 50; i++) {
      const id = `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`
      for (const q of [
        ...selectQuestionsForSession(id),
        ...selectAvanceradQuestionsForSession(id),
        ...selectExpertQuestionsForSession(id),
        ...selectProvQuestionsForSession(id),
      ]) expect(nya.has(q.id)).toBe(false)
    }
  })

  it('nya frågor rättas i sin nivås rutt', () => {
    for (const q of [...GRUND_3C, ...EXPERT_3C]) expect(BANK_FOR_RUTT.v4.some((b) => b.id === q.id)).toBe(true)
    for (const q of AVANCERAD_3C) expect(BANK_FOR_RUTT.v6.some((b) => b.id === q.id)).toBe(true)
    for (const q of ALLA_MATRISFRAGOR) expect(BANK_FOR_RUTT.prov.some((b) => b.id === q.id)).toBe(true)
  })

  it('testvyn och genomgången får varken misstag eller family', () => {
    const id = '11111111-2222-4333-8444-555555555555'
    for (const f of [...visadeFragor('matrislogik-grund', id, true), ...genomgangsFragor('matrislogik-expert', id, true)]) {
      expect(Object.keys(f)).not.toContain('misstag')
      expect(Object.keys(f)).not.toContain('family')
      expect(Object.keys(f)).not.toContain('correctAnswer')
    }
  })
})

/**
 * Våg 3c: matrisbanken med family, misstag och difficulty.
 *
 * - Varje fråga i alla sex banker har en familj ur familjer.json, en
 *   svårighetsprior 1-4 och ett misstag per alternativ på originalindex.
 * - Sessioner utan meta.bank_version drar ur de 28 frusna frågorna per nivå,
 *   så att gamla sessioner får samma urval på resultatsidan. Nya klassiska
 *   sessioner (bank_version 2) drar ur alla ej pensionerade (spec-rummen 15).
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
  VALBARA_GRUND,
  VALBARA_AVANCERAD,
  VALBARA_EXPERT,
  bankVersion,
} from '../selectQuestions.v7'
import { selectProvQuestionsForSession } from '../selectProv.v7'
import { BANK_FOR_RUTT, visadeFragor, genomgangsFragor, matrisInnehall } from '../fragor.server'
import { questionsForToken } from '@/lib/tests/anon-session'
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

  it('sessioner utan bank_version drar ur de 28, version 2 ur alla ej pensionerade', () => {
    const nya = new Set([...GRUND_3C, ...AVANCERAD_3C, ...EXPERT_3C].map((q) => q.id))
    const pensionerade = new Set(ALLA_MATRISFRAGOR.filter((q) => q.pensionerad).map((q) => q.id))
    let nyaIVersion2 = 0
    for (let i = 0; i < 50; i++) {
      const id = `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`
      // Version 1 (meta utan bank_version): som före våg 3c.
      const v1 = genomgangsFragor('matrislogik-grund', id, true)
      expect(v1.map((q) => q.id)).toEqual(selectQuestionsForSession(id).map((q) => q.id))
      for (const q of [
        ...selectQuestionsForSession(id),
        ...selectAvanceradQuestionsForSession(id),
        ...selectExpertQuestionsForSession(id),
        ...selectProvQuestionsForSession(id),
      ]) expect(nya.has(q.id)).toBe(false)
      // Version 2: ur ALLA_<nivå>, aldrig en pensionerad fråga.
      const v2 = [
        ...selectQuestionsForSession(id, undefined, 2),
        ...selectAvanceradQuestionsForSession(id, undefined, 2),
        ...selectExpertQuestionsForSession(id, undefined, 2),
        ...selectProvQuestionsForSession(id, 2),
        ...questionsForToken(id, 2),
      ]
      for (const q of v2) expect(pensionerade.has(q.id), q.id).toBe(false)
      nyaIVersion2 += v2.filter((q) => nya.has(q.id)).length
    }
    expect(nyaIVersion2).toBeGreaterThan(0)
  })

  it('bankversionen läses ur meta, och test- och resultatsida drar samma urval', () => {
    expect(bankVersion(undefined)).toBe(1)
    expect(bankVersion({ alternativ_blandade: true })).toBe(1)
    expect(bankVersion({ alternativ_blandade: true, bank_version: 2 })).toBe(2)
    const id = '22222222-3333-4444-8555-666666666666'
    const meta = { alternativ_blandade: true, bank_version: 2 }
    const pagaende = matrisInnehall({ id, test_type: 'matrislogik-avancerad', meta, completed_at: null })
    const klar = matrisInnehall({ id, test_type: 'matrislogik-avancerad', meta, completed_at: '2026-10-11T08:00:00Z' })
    expect(klar.genomgang!.map((q) => q.id)).toEqual(pagaende.fragor.map((q) => q.id))
    expect(pagaende.fragor.map((q) => q.id)).toEqual(selectAvanceradQuestionsForSession(id, undefined, 2).map((q) => q.id))
  })

  it('valbara per nivå efter pensioneringen: 89, 80 och 83', () => {
    expect([VALBARA_GRUND.length, VALBARA_AVANCERAD.length, VALBARA_EXPERT.length]).toEqual([89, 80, 83])
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

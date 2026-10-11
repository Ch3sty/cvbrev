// Hubbens provrad i logikgruppen är generalrepetitionen i planens format
// (spec-rummen 19.6 punkt 6). Strängarna är specens, ordagrant.

import { describe, it, expect } from 'vitest'
import { PROVRAD, provradTexter } from '../prov/prov-copy'
import { provrad } from '@/lib/traning/rubrik'
import { PROVFORMAT } from '@/lib/traning/tempo'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import { TEST_GROUPS, provLasSlug } from '../components/testCatalog'
import { featureForSlug } from '../testConfig'
import { emptyHubData, getTesterHubData } from '../getHubData'

describe('provraden för generalrepetitionen', () => {
  it('Matrigma klassisk, låst', () => {
    expect(PROVRAD.rad2Format(provrad(PROVFORMAT.matrigma_klassisk), true)).toBe(
      'Samma format som Matrigma. Cirka 35 uppgifter på 40 minuter. Ingår i Premium.'
    )
  })

  it('Matrigma adaptiv, öppen', () => {
    expect(PROVRAD.rad2Format(provrad(PROVFORMAT.matrigma_adaptiv), false)).toBe(
      'Samma format som Matrigma. Cirka 12 uppgifter på 12 minuter.'
    )
  })

  it('utan leverantör, öppen', () => {
    expect(PROVRAD.rad2Format(provrad(PROVFORMAT.eget), false)).toBe(
      'Vårt eget format. 18 uppgifter på 25 minuter. Vet du vem som gör testet, så byter vi format.'
    )
  })

  it('utan leverantör, låst', () => {
    expect(PROVRAD.rad2Format(provrad(PROVFORMAT.eget), true)).toBe(
      'Vårt eget format. 18 uppgifter på 25 minuter. Vet du vem som gör testet, så byter vi format. Ingår i Premium.'
    )
  })

  it('SHL, låst: anmärkningen står i 1c-kortet, inte i raden (copy-plan 4.10)', () => {
    const rad = PROVRAD.rad2Format(provrad(PROVFORMAT.shl), true)
    expect(rad).toBe(
      'Samma format som SHL Verify. Cirka 18 uppgifter på 25 minuter. Ingår i Premium.'
    )
    expect(rad).not.toMatch(/figurdelen/)
  })

  it('aria-label låst', () => {
    expect(PROVRAD.ariaFormat(provrad(PROVFORMAT.matrigma_klassisk))).toBe(
      'Övningsprov mot klockan. Samma format som Matrigma. Cirka 35 uppgifter på 40 minuter. Låst, ingår i Premium.'
    )
  })
})

describe('katalogen', () => {
  it('logikgruppens prov leder till generalrepetitionen', () => {
    expect(TEST_GROUPS[0].prov?.href).toBe(TRANING_RUTT.general)
    expect(TEST_GROUPS[0].prov?.general).toBe(true)
  })

  it('Sidomenyns Provläget leder till samma pass', () => {
    expect(TRANING_RUTT.provlaget).toBe(TRANING_RUTT.general)
  })

  it('generalrepetitionen har provlägets lås', () => {
    expect(featureForSlug(provLasSlug(TEST_GROUPS[0].prov!))).toBe('test_exam_mode')
  })

  // Talen läses ur provets konfiguration (copy-premium avsnitt 5), inte ur
  // planens format: planens leverantör gäller bara logikprovet.
  it('verbal- och numeriskprovet lyder som förut, utan formatnamn', () => {
    for (const key of ['verbal', 'numerisk'] as const) {
      const prov = TEST_GROUPS.find((g) => g.key === key)!.prov!
      expect(prov.general).toBeUndefined()
      const n = prov.totalQuestions
      const m = prov.minutes
      expect(provradTexter(prov, 'matrigma_klassisk', true)).toEqual({
        rad2: `${n} uppgifter på ${m} minuter. Ingår i Premium.`,
        aria: `Övningsprov mot klockan. ${n} uppgifter på ${m} minuter. Låst, ingår i Premium.`,
      })
      expect(provradTexter(prov, 'eget', false).rad2).toBe(`${n} uppgifter på ${m} minuter.`)
    }
  })

  it('provradTexter läser planens format för generalrepetitionen', () => {
    const logik = TEST_GROUPS[0].prov!
    expect(provradTexter(logik, 'matrigma_klassisk', false).rad2).toBe(
      'Samma format som Matrigma. Cirka 35 uppgifter på 40 minuter.'
    )
  })
})

describe('getTesterHubData och provformatet', () => {
  /** Supabase-dubbel där test_planer svarar med plan eller fel. */
  function fake(plan: unknown, fel: unknown = null) {
    return {
      from(tabell: string) {
        const q: Record<string, unknown> = {}
        Object.assign(q, {
          select: () => q,
          eq: () => q,
          in: () => q,
          order: () => Promise.resolve({ data: [], error: null }),
          maybeSingle: () =>
            Promise.resolve(tabell === 'test_planer' ? { data: plan, error: fel } : { data: null, error: null }),
        })
        return q
      },
    }
  }

  it('läser planens leverantör och variant', async () => {
    const d = await getTesterHubData(fake({ leverantor: 'matrigma', variant: 'adaptiv' }), 'u', true)
    expect(d.provformat).toBe('matrigma_adaptiv')
    const shl = await getTesterHubData(fake({ leverantor: 'shl', variant: null }), 'u', true)
    expect(shl.provformat).toBe('shl')
  })

  it('utan plan eller vid fel: eget', async () => {
    expect((await getTesterHubData(fake(null), 'u', false)).provformat).toBe('eget')
    expect((await getTesterHubData(fake(null, { message: 'x' }), 'u', false)).provformat).toBe('eget')
    expect(emptyHubData().provformat).toBe('eget')
  })
})

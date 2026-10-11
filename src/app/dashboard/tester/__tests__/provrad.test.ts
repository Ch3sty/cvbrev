// Provraden i Alla tester (riktlinjer-tester-v2 1.2 och 1.5, skiss 1):
// övningsprovet mot klockan på logik, verbalt och numeriskt, formatet ur
// planens leverantör, "Ingår i Premium." bara när raden är låst.

import { describe, it, expect } from 'vitest'
import { ANMARKNING, antalTid, ovningsformat, provradTexter } from '@/lib/ovningsprov/format'
import { ovningsprovHref, TRANING_RUTT } from '@/lib/traning/rutter'
import { NIVA_GOR, PROV_FEATURE, TEST_GROUPS } from '../components/testCatalog'
import { emptyHubData, getTesterHubData } from '../getHubData'

describe('provraden, logik', () => {
  it('Matrigma klassisk, öppen', () => {
    expect(provradTexter(ovningsformat('logik', 'matrigma', null), false).rad).toBe(
      'Samma format som Matrigma: cirka 35 uppgifter på 40 minuter.'
    )
  })

  it('Matrigma adaptiv, öppen', () => {
    expect(provradTexter(ovningsformat('logik', 'matrigma', 'adaptiv'), false).rad).toBe(
      'Samma format som Matrigma: cirka 12 uppgifter på 12 minuter.'
    )
  })

  it('utan leverantör, låst (skiss 1, gratis)', () => {
    expect(provradTexter(ovningsformat('logik', null, null), true).rad).toBe(
      'Vårt format: 18 uppgifter på 25 minuter. Vet du leverantören så byter vi format. Ingår i Premium.'
    )
  })

  it('SHL: anmärkningen står under raden', () => {
    const t = provradTexter(ovningsformat('logik', 'shl', null), false)
    expect(t.rad).toBe('Samma format som SHL Verify: cirka 18 uppgifter på 25 minuter.')
    expect(t.anm).toBe(ANMARKNING.logik.shl)
  })

  it('Aon står som vårt format tills talen är verifierade (granskningen 6.3)', () => {
    const t = provradTexter(ovningsformat('logik', 'aon', null), false)
    expect(t.rad).toBe('Vårt format: 20 uppgifter på 5 minuter.')
    expect(t.anm).toBe(ANMARKNING.logik.aon)
  })

  it('Alva: per uppgift', () => {
    expect(antalTid(ovningsformat('logik', 'alva', null))).toBe('20 uppgifter, två minuter var')
  })

  it('aria för låst rad säger låst en gång', () => {
    const t = provradTexter(ovningsformat('logik', 'matrigma', null), true)
    expect(t.aria).toBe(
      'Övningsprov mot klockan. Samma format som Matrigma: cirka 35 uppgifter på 40 minuter. Låst, ingår i Premium.'
    )
  })
})

describe('provraden, verbalt och numeriskt', () => {
  it('vårt format utan plan, låst', () => {
    expect(provradTexter(ovningsformat('verbal', null), true).rad).toBe('Vårt format: 32 påståenden på 20 minuter. Ingår i Premium.')
    expect(provradTexter(ovningsformat('numerisk', null), true).rad).toBe('Vårt format: 20 frågor på 25 minuter. Ingår i Premium.')
  })

  it('SHL', () => {
    const v = provradTexter(ovningsformat('verbal', 'shl'), false)
    expect(v.rad).toBe('Samma format som SHL Verify verbal: 32 påståenden på 20 minuter.')
    expect(v.anm).toBe(ANMARKNING.verbal.shl)
    const n = provradTexter(ovningsformat('numerisk', 'shl'), false)
    expect(n.rad).toBe('Samma format som SHL Verify numerisk: cirka 20 frågor på 25 minuter.')
    expect(n.anm).toBe(ANMARKNING.numerisk.shl)
  })

  it('Matrigma: vårt format med anmärkningen att Assessio saknar testet', () => {
    const v = provradTexter(ovningsformat('verbal', 'matrigma', 'klassisk'), false)
    expect(v.rad).toBe('Vårt format: 32 påståenden på 20 minuter.')
    expect(v.anm).toBe('Assessio har inget verbalt test. Får du bara Matrigma behöver du inte öva det här.')
  })

  it('formatets tal hänger ihop: texter gånger påståenden', () => {
    for (const typ of ['verbal', 'numerisk'] as const) {
      const f = ovningsformat(typ, null)
      expect(f.delar!.antal * f.delar!.per).toBe(f.antal)
      expect(f.budget_s * f.antal).toBeLessThanOrEqual(f.minuter * 60)
    }
  })

  it('aldrig "samma test" och aldrig talstreck', () => {
    for (const typ of ['logik', 'verbal', 'numerisk'] as const) {
      for (const lev of [null, 'matrigma', 'alva', 'shl', 'aon', 'annat']) {
        const t = provradTexter(ovningsformat(typ, lev), true)
        expect(`${t.rad} ${t.anm ?? ''} ${t.aria}`).not.toMatch(/samma test|—/)
      }
    }
  })
})

describe('katalogen', () => {
  it('alla tre kognitiva grupper har en provrad till startarket', () => {
    for (const key of ['logik', 'verbal', 'numerisk'] as const) {
      const g = TEST_GROUPS.find((x) => x.key === key)!
      expect(g.prov?.href).toBe(ovningsprovHref(key))
      expect(g.cognitive).toHaveLength(3)
    }
    expect(TEST_GROUPS.find((x) => x.key === 'personlighet')!.prov).toBeUndefined()
  })

  it('ingen rad pekar på de gamla provsidorna', () => {
    expect(JSON.stringify(TEST_GROUPS)).not.toMatch(/-prov['"]/)
  })

  it('sidomenyn och hemvyn leder till samma startark', () => {
    expect(TRANING_RUTT.provlaget).toBe(ovningsprovHref('logik'))
    expect(TRANING_RUTT.general).toBe(ovningsprovHref('logik'))
  })

  it('övningsprovet kräver test_exam_mode', () => {
    expect(PROV_FEATURE).toBe('test_exam_mode')
  })

  it('segmenten beskriver regler, aldrig lätt', () => {
    expect(NIVA_GOR.logik).toEqual({ Grund: 'en regel', Avancerad: 'två regler', Expert: 'tre regler' })
    expect(JSON.stringify(NIVA_GOR)).not.toMatch(/lätt/i)
  })
})

describe('getTesterHubData och planen', () => {
  /** Supabase-dubbel där test_planer svarar med plan eller fel. */
  function fake(plan: unknown, fel: unknown = null, sessioner: unknown[] = []) {
    return {
      from(tabell: string) {
        const q: Record<string, unknown> = {}
        Object.assign(q, {
          select: () => q,
          eq: () => q,
          in: () => q,
          order: () => Promise.resolve({ data: tabell === 'logic_test_v4_sessions' ? sessioner : [], error: null }),
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
    expect(d.plan).toEqual({ leverantor: 'matrigma', variant: 'adaptiv' })
  })

  it('utan plan eller vid fel: eget och ingen plan', async () => {
    expect((await getTesterHubData(fake(null), 'u', false)).plan).toBeNull()
    expect((await getTesterHubData(fake(null, { message: 'x' }), 'u', false)).provformat).toBe('eget')
    expect(emptyHubData().plan).toBeNull()
  })

  it('harNivakoll följer en slutförd Nivåkoll', async () => {
    const utan = await getTesterHubData(fake(null), 'u', false)
    expect(utan.harNivakoll).toBe(false)
    const med = await getTesterHubData(
      fake(null, null, [{ id: 's', test_type: 'matrislogik-matning', score: 8, time_spent: 400, completed_at: '2026-10-11T10:00:00Z' }]),
      'u',
      false
    )
    expect(med.harNivakoll).toBe(true)
    expect(med.aggregate.totalCompleted).toBe(0)
  })
})

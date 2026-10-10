import { describe, expect, it } from 'vitest'
import { arPausdag, raknaSerie } from '../serie'
import { byggPlan, planTyp, raknaPlan } from '../plan'
import { dagSthlm, dagarIntervall, laggTill, veckodag } from '../datum'

describe('datum i svensk tid', () => {
  it('midnatt följer Stockholm, sommar- och vintertid', () => {
    expect(dagSthlm('2026-10-10T21:59:00Z')).toBe('2026-10-10') // 23:59 CEST
    expect(dagSthlm('2026-10-10T22:00:00Z')).toBe('2026-10-11') // 00:00 CEST
    expect(dagSthlm('2026-12-31T22:59:00Z')).toBe('2026-12-31') // 23:59 CET
    expect(dagSthlm('2026-12-31T23:00:00Z')).toBe('2027-01-01')
  })

  it('10 och 24 oktober 2026 är lördagar, 11 söndag', () => {
    expect(veckodag('2026-10-10')).toBe(6)
    expect(veckodag('2026-10-24')).toBe(6)
    expect(veckodag('2026-10-11')).toBe(0)
    expect(laggTill('2026-10-31', 1)).toBe('2026-11-01')
  })
})

describe('serien', () => {
  const PROV = '2026-10-24'
  const fore = ['2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09']

  it('exemplet 10 oktober: fyra dagar i rad före passet, fem efter', () => {
    expect(raknaSerie({ aktivaDagar: fore, idag: '2026-10-10', provdatum: PROV })).toEqual({
      dagar: 4,
      status: 'pagar',
      gjordIdag: false,
    })
    expect(raknaSerie({ aktivaDagar: [...fore, '2026-10-10'], idag: '2026-10-10', provdatum: PROV })).toMatchObject({
      dagar: 5,
      gjordIdag: true,
    })
  })

  it('söndagen är frizon: vila 11 oktober bryter inte, räknas inte', () => {
    const dagar = [...fore, '2026-10-10', '2026-10-12']
    expect(raknaSerie({ aktivaDagar: dagar, idag: '2026-10-12' }).dagar).toBe(6)
    // Söndag med pass räknas.
    expect(raknaSerie({ aktivaDagar: [...dagar, '2026-10-11'], idag: '2026-10-12' }).dagar).toBe(7)
  })

  it('en missad vardag bryter: "Serien börjar om i dag"', () => {
    const s = raknaSerie({ aktivaDagar: ['2026-10-06', '2026-10-07'], idag: '2026-10-09' })
    expect(s).toEqual({ dagar: 0, status: 'bruten', gjordIdag: false })
  })

  it('pausad två dagar före provet och på provdagen: varken räknas eller bryter', () => {
    expect(arPausdag('2026-10-21', PROV)).toBe(false)
    expect(['2026-10-22', '2026-10-23', '2026-10-24'].every((d) => arPausdag(d, PROV))).toBe(true)
    const tranat = dagarIntervall('2026-10-12', '2026-10-21')
    const provdagen = raknaSerie({ aktivaDagar: tranat, idag: PROV, provdatum: PROV })
    expect(provdagen.status).toBe('pausad')
    expect(provdagen.dagar).toBe(10)
    // Generalrepetitionen 22 och 23 räknas inte heller.
    expect(raknaSerie({ aktivaDagar: [...tranat, '2026-10-22', '2026-10-23'], idag: '2026-10-23', provdatum: PROV }).dagar).toBe(10)
    // Dagen efter provet fortsätter serien.
    expect(raknaSerie({ aktivaDagar: [...tranat, '2026-10-25'], idag: '2026-10-25', provdatum: PROV }).dagar).toBe(11)
  })

  it('inga pass alls ger status ingen', () => {
    expect(raknaSerie({ aktivaDagar: [], idag: '2026-10-10' })).toEqual({ dagar: 0, status: 'ingen', gjordIdag: false })
  })
})

describe('planen', () => {
  it('14 dagar från lördag 10 okt till lördag 24 okt: åtta pass, två vilodagar, en ommätning, två generalrepetitioner', () => {
    const plan = byggPlan({ start: '2026-10-10', prov: '2026-10-24', idag: '2026-10-10' })
    expect(raknaPlan(plan)).toEqual({ pass: 8, vila: 2, ommatning: 1, general: 2 })
    expect(plan[0]).toMatchObject({ dag: '2026-10-10', typ: 'matning' })
    expect(plan[plan.length - 1]).toMatchObject({ dag: '2026-10-24', typ: 'prov' })
    expect(planTyp('2026-10-17', '2026-10-10', '2026-10-24')).toBe('ommatning')
    expect(planTyp('2026-10-11', '2026-10-10', '2026-10-24')).toBe('vila')
    expect(planTyp('2026-10-22', '2026-10-10', '2026-10-24')).toBe('general')
  })

  it('exemplet med mätning 6 okt: ommätningar tisdag 13 och 20, vila 11 och 18', () => {
    const plan = byggPlan({ start: '2026-10-06', prov: '2026-10-24', idag: '2026-10-10' })
    const typ = (d: string) => plan.find((p) => p.dag === d)?.typ
    expect(typ('2026-10-13')).toBe('ommatning')
    expect(typ('2026-10-20')).toBe('ommatning')
    expect(typ('2026-10-11')).toBe('vila')
    expect(typ('2026-10-18')).toBe('vila')
    expect(typ('2026-10-23')).toBe('general')
  })

  it('generalrepetitionen vinner över söndag och ommätning, provet över allt', () => {
    // Prov tisdag 13 okt, mätning tisdag 6: 11 sön och 12 mån blir general, 13 prov.
    expect(planTyp('2026-10-11', '2026-10-06', '2026-10-13')).toBe('general')
    expect(planTyp('2026-10-13', '2026-10-06', '2026-10-13')).toBe('prov')
  })

  it('utan datum: rullande sju dagar efter i dag, ommätning var sjunde dag', () => {
    const plan = byggPlan({ start: '2026-10-06', idag: '2026-10-10' })
    expect(plan[plan.length - 1].dag).toBe('2026-10-17')
    expect(plan.filter((p) => p.typ === 'ommatning').map((p) => p.dag)).toEqual(['2026-10-13'])
    expect(plan.some((p) => p.typ === 'prov' || p.typ === 'general')).toBe(false)
  })

  it('status: gjord, missad, idag, kvar, och låsta ommätningar utan paket', () => {
    const plan = byggPlan({
      start: '2026-10-06',
      prov: '2026-10-24',
      idag: '2026-10-10',
      aktivaDagar: ['2026-10-06', '2026-10-07', '2026-10-09'],
    })
    const status = (d: string) => plan.find((p) => p.dag === d)?.status
    expect(status('2026-10-07')).toBe('gjord')
    expect(status('2026-10-08')).toBe('missad')
    expect(status('2026-10-10')).toBe('idag')
    expect(status('2026-10-12')).toBe('kvar')
    expect(status('2026-10-13')).toBe('last')
    expect(status('2026-10-22')).toBe('last')
    const betald = byggPlan({ start: '2026-10-06', prov: '2026-10-24', idag: '2026-10-10', betalande: true })
    expect(betald.find((p) => p.dag === '2026-10-13')?.status).toBe('kvar')
  })

  it('ett provdatum före mätningen ignoreras', () => {
    const plan = byggPlan({ start: '2026-10-10', prov: '2026-10-01', idag: '2026-10-10' })
    expect(plan.some((p) => p.typ === 'prov')).toBe(false)
  })
})

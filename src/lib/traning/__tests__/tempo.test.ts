import { describe, expect, it } from 'vitest'
import { arLangsam, formatForPlan, formatText, median, PROVFORMAT, raknaTempo, tempobudget } from '../tempo'
import { pForNiva } from '../svarighet'
import { TRANING_COPY } from '../copy'

describe('provformaten', () => {
  it('tempobudgeten per format: 68, 83, 120, 90, 15 sekunder', () => {
    expect(tempobudget('matrigma', 'klassisk')).toBe(68)
    expect(tempobudget(null)).toBe(83)
    expect(tempobudget('alva')).toBe(120)
    expect(tempobudget('shl')).toBe(90)
    expect(tempobudget('aon')).toBe(15)
  })

  it('14.4: adaptiv Matrigma 60 s, SHL 18 på 25 med 90 s och fast, Alva per uppgift', () => {
    expect(tempobudget('matrigma', 'adaptiv')).toBe(60)
    expect(PROVFORMAT.shl).toMatchObject({ antal: 18, minuter: 25, budget_s: 90, adaptiv: false, cirka: true })
    expect(PROVFORMAT.alva.tidsform).toBe('per_uppgift')
    expect(PROVFORMAT.alva.minuter).toBe(40)
    for (const f of Object.values(PROVFORMAT)) if (f.nyckel !== 'alva') expect(f.tidsform).toBe('total')
    expect(formatText(PROVFORMAT.alva)).toBe('cirka 20 uppgifter, 2 minuter per uppgift')
    expect(formatText(PROVFORMAT.shl)).toBe('cirka 18 uppgifter, 25 minuter')
    expect(formatText(PROVFORMAT.matrigma_adaptiv)).toBe('cirka 12 uppgifter, 12 minuter')
  })

  it('14.4: anmärkningen ur copy.ts för SHL och Aon, null för övriga', () => {
    expect(PROVFORMAT.shl.anmarkning).toBe(TRANING_COPY.format.anmarkning.shl)
    expect(PROVFORMAT.shl.anmarkning).toBe('SHL Verify G+ blandar siffror, slutledning och figurer. Provläget övar figurdelen.')
    expect(PROVFORMAT.aon.anmarkning).toBe(TRANING_COPY.format.anmarkning.aon)
    for (const k of ['matrigma_klassisk', 'matrigma_adaptiv', 'alva', 'eget'] as const) expect(PROVFORMAT[k].anmarkning).toBeNull()
  })

  it('Vet inte, Annat och okänd leverantör ger vårt provläge 18 på 25', () => {
    for (const l of [null, undefined, 'annat', 'okand']) {
      const f = formatForPlan(l)
      expect(f.nyckel).toBe('eget')
      expect([f.antal, f.minuter]).toEqual([18, 25])
    }
  })

  it('Matrigma utan variant är klassisk (täcker båda formaten), adaptiv är egen', () => {
    expect(formatForPlan('matrigma', null).nyckel).toBe('matrigma_klassisk')
    expect(formatForPlan('matrigma', 'adaptiv').nyckel).toBe('matrigma_adaptiv')
  })

  it('leverantörsformaten står med cirka och är inte verifierade än; Matrigma är tredjepart', () => {
    for (const f of Object.values(PROVFORMAT)) {
      if (f.leverantor) {
        expect(f.cirka).toBe(true)
        expect(f.verifierad).toBe(false)
      }
    }
    expect(PROVFORMAT.matrigma_klassisk.kalla).toBe('tredjepart')
    expect(formatText(PROVFORMAT.matrigma_klassisk)).toBe('cirka 35 uppgifter, 40 minuter')
    expect(formatText(PROVFORMAT.eget)).toBe('18 uppgifter, 25 minuter')
  })
})

describe('tempot', () => {
  const nara = pForNiva(5)

  it('räknar bara frågor nära nivån (|p − p_nivå| ≤ 0,15)', () => {
    const t = raknaTempo(
      [
        { p: nara, tid_s: 80, correct: true },
        { p: nara + 0.1, tid_s: 50, correct: true },
        { p: 0.95, tid_s: 200, correct: true }, // säker, räknas inte
        { p: 0.1, tid_s: 300, correct: false }, // långt över, räknas inte
      ],
      5,
      68
    )
    expect(t.antal_nara).toBe(2)
    expect(t.over_tid).toBe(1)
    expect(t.snitt_s).toBe(65)
    expect(t.langsamma).toEqual([0])
  })

  it('utan nivå räknas alla frågor; exakt på budget är inte över', () => {
    const t = raknaTempo([{ p: 0.9, tid_s: 68, correct: true }, { p: 0.2, tid_s: 69, correct: false }], null, 68)
    expect(t.antal_nara).toBe(2)
    expect(t.over_tid).toBe(1)
  })

  it('utan budget: långsam = över 1,5 × medianen för svårigheten', () => {
    expect(arLangsam(46, null, 30)).toBe(true)
    expect(arLangsam(45, null, 30)).toBe(false)
    expect(arLangsam(1000, null, null)).toBe(false)
    const t = raknaTempo([{ p: nara, tid_s: 50, correct: true, prior: 3 }], 5, null, { 3: 30 })
    expect(t.over_tid).toBe(1)
  })

  it('inga frågor nära nivån ger snitt null, inte 0', () => {
    expect(raknaTempo([{ p: 0.99, tid_s: 10, correct: true }], 7, 68).snitt_s).toBeNull()
    expect(raknaTempo([], 5, 68)).toMatchObject({ over_tid: 0, antal_nara: 0, snitt_s: null })
  })

  it('median', () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 2, 3])).toBe(2.5)
    expect(median([])).toBeNull()
  })
})

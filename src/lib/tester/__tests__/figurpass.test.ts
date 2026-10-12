// @vitest-environment node
/**
 * Figurpasset och figurseriernas övningsprov (beställning omgång 3, A3 och
 * A4): urvalet i passet (tre härnäst och en bryter, karensen), provets
 * sammansättning, formaten per leverantör, gaten, hemvyns rad och att de
 * klassiska nivåtestens urval per sessions-id är oförändrat.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { valjFigurpass, valjFigurer, bastaFigurGrundProcent, FIGUR_HARNAST } from '../pass-figur'
import { valjFragor, poolFor, harnastPool, bryterPool, BRYTER_GOLV, SERIE_VERSION } from '@/lib/figurserierV1/select'
import { valjFigurDelar, FIGUR_URVAL } from '@/lib/ovningsprov/motor.server'
import { ovningsformat, provradTexter } from '@/lib/ovningsprov/format'
import { featureForTestType } from '@/lib/tests/sessionGate'
import { visaFigurpass } from '@/lib/traning/hemvy'

const IDAG = '2026-10-12'
const pool = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => ({ id: `${prefix}-${i}` }))

describe('figurpassets urval', () => {
  it('tre härnäst och en bryter sist; fyra härnäst när bryter saknas', () => {
    const a = valjFigurpass({ harnast: pool('h', 20), bryter: pool('b', 14), sedda: new Map(), idag: IDAG, seed: 's' })
    expect(a.ids).toHaveLength(4)
    expect(a.ids.slice(0, FIGUR_HARNAST).every((id) => id.startsWith('h-'))).toBe(true)
    expect(a.ids[3].startsWith('b-')).toBe(true)
    expect(a.upprepad).toBe(false)
    const b = valjFigurpass({ harnast: pool('h', 20), bryter: [], sedda: new Map(), idag: IDAG, seed: 's' })
    expect(b.ids.every((id) => id.startsWith('h-'))).toBe(true)
    expect(b.ids).toHaveLength(4)
  })

  it('karensen: sedda inom 30 dagar väljs sist och markerar passet upprepat', () => {
    const p = pool('h', 4)
    const sedda = new Map(p.map((x) => [x.id, '2026-10-01']))
    const r = valjFigurer([...p, { id: 'ny' }], 2, sedda, IDAG, 's')
    expect(r.ids[0]).toBe('ny')
    expect(r.upprepad).toBe(true)
    const gammal = valjFigurer(p, 2, new Map(p.map((x) => [x.id, '2026-08-01'])), IDAG, 's')
    expect(gammal.upprepad).toBe(false)
  })

  it('nivån läser bästa klassiska figurserier-grund', () => {
    const rad = (score: number) => ({ test_type: 'figurserier-grund', meta: { antal: 15 }, score, completed_at: IDAG })
    expect(bastaFigurGrundProcent([rad(9), rad(13)])).toBe(87)
    expect(bastaFigurGrundProcent([{ ...rad(15), completed_at: null }])).toBeNull()
  })
})

describe('bankerna efter omgång 3', () => {
  it('bryter når golvet på båda nivåerna; härnäst i pass är nivåtestets bank plus parti 2', () => {
    expect(bryterPool('grund').length).toBeGreaterThanOrEqual(BRYTER_GOLV)
    expect(bryterPool('avancerad').length).toBeGreaterThanOrEqual(BRYTER_GOLV)
    expect(harnastPool('grund').length).toBe(44)
    expect(harnastPool('avancerad').length).toBe(46)
  })

  it('klassiska urvalet per sessions-id är oförändrat i grund och avancerad; de pensionerade väljs aldrig i version 2', () => {
    const ids = ['3f1c2a9e-1111-4222-8333-944455556666', '00000000-0000-4000-8000-000000000001', 'a1b2c3d4-0000-4000-8000-00000000abcd']
    for (const id of ids) {
      for (const n of ['grund', 'avancerad'] as const) {
        expect(valjFragor(n, id, 15, 2).map((q) => q.id)).toEqual(valjFragor(n, id, 15, 1).map((q) => q.id))
      }
      expect(valjFragor('expert', id, 15, 2).some((q) => q.pensionerad_fran)).toBe(false)
    }
    // Version 1 drar ur hela den frysta banken, de pensionerade inräknade (gamla sessioner).
    const bank = JSON.parse(readFileSync('src/lib/figurserierV1/bankExpert.json', 'utf8'))
    expect(poolFor('expert', 1)).toHaveLength(bank.length)
    expect(poolFor('expert', 2)).toHaveLength(bank.length - 2)
    expect(SERIE_VERSION).toBe(2)
  })
})

describe('figurseriernas övningsprov', () => {
  it('20 uppgifter: 6 grund, 10 avancerad, 4 expert, hälften bryter, svåraste sist', () => {
    const ids = valjFigurDelar('seed-1')
    expect(ids).toHaveLength(20)
    expect(new Set(ids).size).toBe(20)
    const niva = (id: string) => (id.includes('-g-') ? 'g' : id.includes('-a-') ? 'a' : 'e')
    expect(ids.map(niva).join('')).toBe('g'.repeat(6) + 'a'.repeat(10) + 'e'.repeat(4))
    expect(ids.filter((id) => id.startsWith('fsb-'))).toHaveLength(FIGUR_URVAL.medBryter.bryter.grund + FIGUR_URVAL.medBryter.bryter.avancerad)
    expect(valjFigurDelar('seed-1')).toEqual(ids)
  })

  it('formatet: Aon 20 på 5 minuter med cirka, övriga vårt format, SHL med anmärkningen', () => {
    const aon = ovningsformat('figurer', 'aon')
    expect(aon).toMatchObject({ antal: 20, minuter: 5, cirka: true, namn: 'Aon scales ix' })
    expect(provradTexter(aon, false).rad).toBe('Samma format som Aon scales ix: cirka 20 uppgifter på 5 minuter.')
    const shl = ovningsformat('figurer', 'shl')
    expect(provradTexter(shl, true).rad).toBe('Vårt format: 20 uppgifter på 15 minuter. Ingår i Premium.')
    expect(shl.anmarkning).toMatch(/^SHL Verify G\+ blandar siffror, slutledning och figurer/)
    expect(ovningsformat('figurer', null).okandLeverantor).toBe(true)
  })
})

describe('gate och hemvy', () => {
  it('figurpasset kräver test_daily_pass, övningsprovet test_exam_mode', () => {
    expect(featureForTestType('figurserie-pass')).toBe('test_daily_pass')
    expect(featureForTestType('figurserie-prov')).toBe('test_exam_mode')
  })

  it('raden visas med figurserie i planen, efter ett klassiskt test eller med Aon och SHL', () => {
    expect(visaFigurpass({ plan: null, figurserieGjord: false }, [])).toBe(false)
    expect(visaFigurpass({ plan: null, figurserieGjord: true }, [])).toBe(true)
    expect(visaFigurpass({ plan: null, figurserieGjord: false }, ['figurserie'])).toBe(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(visaFigurpass({ plan: { leverantor: 'aon' } as any, figurserieGjord: false }, ['matris'])).toBe(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(visaFigurpass({ plan: { leverantor: 'matrigma' } as any, figurserieGjord: false }, ['matris'])).toBe(false)
  })
})

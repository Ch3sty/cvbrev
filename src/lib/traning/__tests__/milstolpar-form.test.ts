import { describe, expect, it } from 'vitest'
import {
  forstaVeckanNadd,
  forstaVeckanSammanfattning,
  nyaMilstolpar,
  type Nivapunkt,
  type SlutfordSession,
} from '../milstolpar'
import { TRANING_COPY } from '../copy'
import { beraknaForm } from '../form'
import { imorgonRad, nastaForPass } from '../imorgon'

const PROV = '2026-10-24'
const K1: SlutfordSession[] = [
  { dag: '2026-10-06', typ: 'matning' },
  { dag: '2026-10-07', typ: 'pass' },
  { dag: '2026-10-08', typ: 'pass' },
  { dag: '2026-10-09', typ: 'pass' },
  { dag: '2026-10-10', typ: 'pass' },
  { dag: '2026-10-12', typ: 'pass' },
  { dag: '2026-10-13', typ: 'ommatning' },
]
const PUNKTER: Nivapunkt[] = [
  { dag: '2026-10-06', typ: 'matning', niva: 5.0 },
  { dag: '2026-10-07', typ: 'pass', niva: 5.2 },
  { dag: '2026-10-08', typ: 'pass', niva: 5.1 },
  { dag: '2026-10-09', typ: 'pass', niva: 5.4 },
  { dag: '2026-10-10', typ: 'pass', niva: 5.6 },
  { dag: '2026-10-12', typ: 'pass', niva: 5.7 },
  { dag: '2026-10-13', typ: 'ommatning', niva: 5.8 },
]

describe('milstolparna', () => {
  it('K1: sju dagar sedan mätningen, fem pass och en ommätning ger Första veckan på ommätningens dag', () => {
    expect(forstaVeckanNadd('2026-10-06', K1, '2026-10-13', PROV)).toBe(true)
    expect(K1.filter((s) => s.typ === 'pass')).toHaveLength(5)
    // Dagen före: inte än.
    expect(forstaVeckanNadd('2026-10-06', K1.slice(0, 6), '2026-10-12', PROV)).toBe(false)
  })

  it('Första veckan kräver alla planerade dagar: ett missat pass eller en tom ommätningsdag ger inget märke', () => {
    const utanTorsdag = K1.filter((s) => s.dag !== '2026-10-08')
    expect(forstaVeckanNadd('2026-10-06', utanTorsdag, '2026-10-14', PROV)).toBe(false)
    const ingetPaOmmatningsdagen = K1.filter((s) => s.typ !== 'ommatning')
    expect(forstaVeckanNadd('2026-10-06', ingetPaOmmatningsdagen, '2026-10-14', PROV)).toBe(false)
    // 14.3: på ommätningens dag räcker vilken slutförd session som helst.
    const passIStalletForOmmatning = K1.map((s) => (s.typ === 'ommatning' ? { ...s, typ: 'pass' as const } : s))
    expect(forstaVeckanNadd('2026-10-06', passIStalletForOmmatning, '2026-10-13', PROV)).toBe(true)
    // Mätningar räknas inte som pass.
    const matningIStallet = K1.map((s) => (s.dag === '2026-10-09' ? { ...s, typ: 'ommatning' as const } : s))
    expect(forstaVeckanNadd('2026-10-06', matningIStallet, '2026-10-13', PROV)).toBe(false)
  })

  it('14.3 gratis: grundpass dag 1 till 7 utom söndag, ommätningen låst, märket nås dag 7', () => {
    // Mätning tisdag 6 oktober, grundpass 7-10, 12 och 13 (ommätningens dag). Söndag 11 vila.
    const gratis: SlutfordSession[] = [
      { dag: '2026-10-06', typ: 'matning' },
      ...['2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-12', '2026-10-13'].map((dag) => ({ dag, typ: 'pass' as const })),
    ]
    expect(forstaVeckanNadd('2026-10-06', gratis, '2026-10-12')).toBe(false)
    expect(forstaVeckanNadd('2026-10-06', gratis, '2026-10-13')).toBe(true)
    expect(forstaVeckanSammanfattning('2026-10-06', gratis)).toEqual({ pass: 6, ommatningar: 0, generalrepetitioner: 0 })
    expect(TRANING_COPY.forstaVeckan.gratis(6)).toBe('Sju dagar sedan mätningen, sex pass, ingen missad dag')
  })

  it('K1-sammanfattningen: fem pass och en ommätning, mätningen räknas inte', () => {
    const s = forstaVeckanSammanfattning('2026-10-06', [...K1, { dag: '2026-10-14', typ: 'pass' }])
    expect(s).toEqual({ pass: 5, ommatningar: 1, generalrepetitioner: 0 })
    expect(TRANING_COPY.forstaVeckan.betalande(s.pass, s.ommatningar)).toBe(
      'Sju dagar sedan mätningen, fem pass och en ommätning, ingen missad dag'
    )
    // Riktade pass räknas som pass.
    expect(forstaVeckanSammanfattning('2026-10-06', [{ dag: '2026-10-07', typ: 'riktat' }]).pass).toBe(1)
  })

  it('Nivån upp: första hela nivån över mätningens (5,0 ger märket vid 6,0; 6,3 vid 7,0)', () => {
    const bas = { sessioner: K1, idag: '2026-10-13', provdatum: PROV }
    expect(nyaMilstolpar({ ...bas, punkter: PUNKTER })).not.toContain('nivan_upp')
    expect(nyaMilstolpar({ ...bas, punkter: [...PUNKTER, { dag: '2026-10-14', typ: 'pass', niva: 6.0 }] })).toContain('nivan_upp')
    const fran63: Nivapunkt[] = [{ dag: '2026-10-06', typ: 'matning', niva: 6.3 }, { dag: '2026-10-07', typ: 'pass', niva: 6.9 }]
    expect(nyaMilstolpar({ ...bas, punkter: fran63 })).not.toContain('nivan_upp')
    expect(nyaMilstolpar({ ...bas, punkter: [...fran63, { dag: '2026-10-08', typ: 'pass', niva: 7.0 }] })).toContain('nivan_upp')
  })

  it('Första mätningen, Generalrepetitionen och Provdagen; redan nådda kommer inte igen', () => {
    expect(nyaMilstolpar({ sessioner: [], punkter: [], idag: '2026-10-06' })).toEqual([])
    expect(nyaMilstolpar({ sessioner: K1.slice(0, 1), punkter: PUNKTER.slice(0, 1), idag: '2026-10-06' })).toEqual([
      'forsta_matningen',
    ])
    const alla = nyaMilstolpar({
      sessioner: [...K1, { dag: '2026-10-22', typ: 'general' }],
      punkter: PUNKTER,
      provdatum: PROV,
      idag: '2026-10-25',
    })
    expect(alla).toEqual(['forsta_matningen', 'forsta_veckan', 'generalrepetitionen', 'provdagen'])
    expect(
      nyaMilstolpar({ sessioner: K1, punkter: PUNKTER, provdatum: PROV, idag: '2026-10-24', redan: ['forsta_matningen'] })
    ).toEqual(['forsta_veckan'])
  })
})

describe('formordet', () => {
  const aktiva = K1.map((s) => s.dag)

  it('stigande när nivån steg 0,3 på sju dagar', () => {
    expect(beraknaForm({ punkter: PUNKTER, aktivaDagar: aktiva, idag: '2026-10-13' })).toMatchObject({
      form: 'stigande',
      andring7: 0.8,
    })
  })

  it('vilar efter tre dagar utan pass', () => {
    expect(beraknaForm({ punkter: PUNKTER, aktivaDagar: aktiva, idag: '2026-10-16' }).form).toBe('vilar')
    expect(beraknaForm({ punkter: PUNKTER, aktivaDagar: aktiva, idag: '2026-10-15' }).form).not.toBe('vilar')
  })

  it('sjunkande visas aldrig som ord: stabil med orsak', () => {
    const ner: Nivapunkt[] = [
      { dag: '2026-10-01', typ: 'matning', niva: 6.0 },
      { dag: '2026-10-09', typ: 'pass', niva: 5.6 },
    ]
    expect(beraknaForm({ punkter: ner, aktivaDagar: ['2026-10-09'], idag: '2026-10-09' })).toEqual({
      form: 'stabil',
      orsak: 'sjunkande',
      andring7: -0.4,
    })
  })
})

describe('I morgon', () => {
  it('lördagsexemplet: "Söndag är vilodag. Måndag: samma familj, ett steg svårare."', () => {
    const r = imorgonRad({ idag: '2026-10-10', start: '2026-10-06', prov: PROV, ratt: 7, antal: 9 })
    expect(r.text).toBe('Söndag är vilodag. Måndag: samma familj, ett steg svårare.')
    expect(r.dag).toBe('2026-10-12')
  })

  it('före ommätningen tar veckodagen över', () => {
    const r = imorgonRad({ idag: '2026-10-12', start: '2026-10-06', prov: PROV, ratt: 4, antal: 9 })
    expect(r.text).toBe('Tisdag: ommätning, 8 minuter.')
  })

  it('vanlig dag, generalrepetition, provet, grundpass', () => {
    expect(imorgonRad({ idag: '2026-10-07', start: '2026-10-06', prov: PROV, ratt: 7, antal: 9 }).text).toBe(
      'I morgon: samma familj, ett steg svårare'
    )
    expect(imorgonRad({ idag: '2026-10-07', start: '2026-10-06', prov: PROV, ratt: 4, antal: 9 }).text).toBe(
      'I morgon: ny familj'
    )
    expect(imorgonRad({ idag: '2026-10-21', start: '2026-10-06', prov: PROV, ratt: 4, antal: 9 }).text).toBe(
      'I morgon: generalrepetition'
    )
    expect(imorgonRad({ idag: '2026-10-23', start: '2026-10-06', prov: PROV, ratt: 4, antal: 9 }).text).toBe(
      'I morgon: provet. Tre uppvärmningsfrågor, inget mer.'
    )
    expect(imorgonRad({ idag: '2026-10-07', start: null, ratt: 4, antal: 9 }).text).toBe('I morgon: nästa grundpass')
  })

  it('två tredjedelar rätt räcker för "samma familj, ett steg svårare"', () => {
    expect(nastaForPass(6, 9)).toBe('familj_upp')
    expect(nastaForPass(5, 9)).toBe('ny_familj')
  })
})

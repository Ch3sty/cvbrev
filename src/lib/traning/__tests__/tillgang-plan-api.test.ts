import { describe, expect, it } from 'vitest'
import { beslutaTillgang, featureForTraningsTyp, type TillgangIn } from '../tillgang'
import { GRATISNIVA } from '../gratisniva'
import { featureForTestType } from '@/lib/tests/sessionGate'
import { DAILY_LIMIT_TEST_SESSIONS } from '@/lib/quota/quotaService'
import { fragaEfterProvet, validerPlan, validerSikte, validerUtfall } from '../testplan'
import { familjestatistik, lasFamilj, svagasteFamiljer, varDuTappar } from '../familjer'

const bas: TillgangIn = { begard: 'pass', harOvanGrund: false, harProvlage: false, matningarSlutforda: 0, passSlutfordaIdag: 0 }

describe('gratisnivån (ägarens beslut 2026-10-11, 17.2)', () => {
  it('standardvärdena är 17.2: mätningen en gång och ett grundpass dag 0', () => {
    expect(GRATISNIVA).toMatchObject({
      grundpassPerDag: 1,
      grundpassVarjeDag: false,
      matningGratis: true,
      ommatningGratis: false,
      genomgangGratis: true,
      kurvaHistorikGratis: false,
      provlageGratis: false,
      riktadePassGratis: false,
    })
    // 14.9: flaggan för passet på nivån är borttagen.
    expect(GRATISNIVA).not.toHaveProperty('passPaNivanGratis')
    expect(DAILY_LIMIT_TEST_SESSIONS).toBe(GRATISNIVA.grundpassPerDag)
  })

  it('mätningen gratis en gång, ommätningen kräver paket', () => {
    expect(beslutaTillgang({ ...bas, begard: 'matning' })).toEqual({ tillatet: true, typ: 'matning', variant: 'niva' })
    expect(beslutaTillgang({ ...bas, begard: 'matning', matningarSlutforda: 1 })).toMatchObject({
      tillatet: false,
      typ: 'ommatning',
      skal: 'betalvagg',
      feature: 'tests_above_base',
    })
    expect(beslutaTillgang({ ...bas, begard: 'matning', matningarSlutforda: 1, harOvanGrund: true })).toMatchObject({
      tillatet: true,
      typ: 'ommatning',
    })
  })

  it('ett grundpass om dagen utan paket, passet på nivån med paket', () => {
    expect(beslutaTillgang(bas)).toEqual({ tillatet: true, typ: 'pass', variant: 'grund' })
    expect(beslutaTillgang({ ...bas, passSlutfordaIdag: 1 })).toMatchObject({ tillatet: false, skal: 'kvot', grans: 1 })
    expect(beslutaTillgang({ ...bas, passSlutfordaIdag: 5, harOvanGrund: true })).toEqual({ tillatet: true, typ: 'pass', variant: 'niva' })
  })

  it('17.2 med standardvärdena: grundpass dag 0, betalvägg från dag 1 efter mätningen', () => {
    const dag0 = { ...bas, matningarSlutforda: 1, forstaTraningsdag: '2026-10-10', idag: '2026-10-10' }
    expect(beslutaTillgang(dag0)).toEqual({ tillatet: true, typ: 'pass', variant: 'grund' })
    expect(beslutaTillgang({ ...dag0, passSlutfordaIdag: 1 })).toMatchObject({ tillatet: false, skal: 'kvot' })
    const dag1 = { ...dag0, idag: '2026-10-11' }
    expect(beslutaTillgang(dag1)).toEqual({ tillatet: false, typ: 'pass', skal: 'betalvagg', feature: 'tests_above_base' })
    expect(beslutaTillgang({ ...dag1, harOvanGrund: true })).toEqual({ tillatet: true, typ: 'pass', variant: 'niva' })
  })

  it('en flagga per sak: dag 2 kan låsas, gratispasset är alltid ett grundpass', () => {
    const g = { ...GRATISNIVA, grundpassVarjeDag: false }
    expect(beslutaTillgang({ ...bas, gratis: g, forstaTraningsdag: '2026-10-09', idag: '2026-10-10' })).toMatchObject({
      tillatet: false,
      skal: 'betalvagg',
    })
    expect(beslutaTillgang({ ...bas, gratis: g, forstaTraningsdag: '2026-10-10', idag: '2026-10-10' })).toMatchObject({ tillatet: true })
    expect(beslutaTillgang({ ...bas, gratis: g, forstaTraningsdag: '2026-10-10', idag: '2026-10-10' })).toMatchObject({ variant: 'grund' })
    expect(beslutaTillgang({ ...bas, begard: 'matning', matningarSlutforda: 3, gratis: { ...GRATISNIVA, ommatningGratis: true } })).toMatchObject({
      tillatet: true,
      typ: 'ommatning',
    })
  })

  it('riktat pass kräver tests_above_base, generalrepetitionen test_exam_mode', () => {
    expect(beslutaTillgang({ ...bas, begard: 'riktat' })).toMatchObject({ tillatet: false, feature: 'tests_above_base' })
    expect(beslutaTillgang({ ...bas, begard: 'general' })).toMatchObject({ tillatet: false, feature: 'test_exam_mode' })
    expect(beslutaTillgang({ ...bas, begard: 'general', harProvlage: true })).toMatchObject({ tillatet: true })
    expect(beslutaTillgang({ ...bas, begard: 'riktat', gratis: { ...GRATISNIVA, riktadePassGratis: true } })).toMatchObject({ tillatet: true })
  })

  it('sessionGate känner de nya testtyperna', () => {
    expect(featureForTestType('matrislogik-riktat')).toBe('tests_above_base')
    expect(featureForTestType('matrislogik-general')).toBe('test_exam_mode')
    expect(featureForTestType('matrislogik-matning')).toBeNull()
    expect(featureForTestType('matrislogik-pass')).toBeNull()
    expect(featureForTraningsTyp('matrislogik-general', { riktadePassGratis: false, provlageGratis: true })).toBeNull()
    // Befintliga typer oförändrade.
    expect(featureForTestType('matrislogik')).toBeNull()
    expect(featureForTestType('matrislogik-expert')).toBe('tests_above_base')
  })
})

describe('planens validering', () => {
  const IDAG = '2026-10-10'

  it('bara fälten som skickas, null tar bort', () => {
    expect(validerPlan({ provdatum: '2026-10-24' }, IDAG)).toEqual({ ok: true, data: { provdatum: '2026-10-24' } })
    expect(validerPlan({ provdatum: null, leverantor: null }, IDAG)).toEqual({
      ok: true,
      data: { provdatum: null, leverantor: null, variant: null },
    })
    expect(validerPlan({ testtyper: ['matris', 'matris', 'verbal'] }, IDAG)).toEqual({ ok: true, data: { testtyper: ['matris', 'verbal'] } })
    expect(validerPlan({ leverantor: 'matrigma', variant: 'adaptiv' }, IDAG)).toEqual({
      ok: true,
      data: { leverantor: 'matrigma', variant: 'adaptiv' },
    })
  })

  it('avvisar okända värden, passerade och för avlägsna datum, tom kropp', () => {
    expect(validerPlan({ leverantor: 'cubiks' }, IDAG)).toEqual({ ok: false, fel: 'ogiltig_leverantor' })
    expect(validerPlan({ testtyper: ['iq'] }, IDAG)).toEqual({ ok: false, fel: 'ogiltiga_testtyper' })
    expect(validerPlan({ provdatum: '2026-10-09' }, IDAG)).toEqual({ ok: false, fel: 'provdatum_passerat' })
    expect(validerPlan({ provdatum: '2026-02-30' }, IDAG)).toEqual({ ok: false, fel: 'ogiltigt_provdatum' })
    expect(validerPlan({ provdatum: '2028-01-01' }, IDAG)).toEqual({ ok: false, fel: 'provdatum_for_langt_fram' })
    expect(validerPlan({}, IDAG)).toEqual({ ok: false, fel: 'inget_att_andra' })
    expect(validerPlan(null, IDAG)).toEqual({ ok: false, fel: 'ogiltig_kropp' })
  })

  it('siktet: en decimal, 1 till 7,5 under flaggan', () => {
    expect(validerSikte({ niva: 6.54 })).toEqual({ ok: true, data: 6.5 })
    expect(validerSikte({ niva: '6,5' })).toEqual({ ok: true, data: 6.5 })
    expect(validerSikte({ niva: 8 })).toEqual({ ok: false, fel: 'niva_utanfor_skalan' })
    expect(validerSikte({ niva: 'x' })).toEqual({ ok: false, fel: 'ogiltig_niva' })
  })

  it('"Hur gick det?": dagen efter provet, igen sju dagar efter "vet inte än", aldrig efter svar', () => {
    const plan = { provdatum: '2026-10-24', utfall: null, utfall_fraga_igen_at: null }
    expect(fragaEfterProvet(plan, '2026-10-24')).toBe(false)
    expect(fragaEfterProvet(plan, '2026-10-25')).toBe(true)
    const vetInte = validerUtfall({ utfall: 'vet_inte' }, '2026-10-25')
    expect(vetInte.ok && vetInte.data.utfall_fraga_igen_at).toBe('2026-11-01')
    const efter = { ...plan, utfall: 'vet_inte', utfall_fraga_igen_at: '2026-11-01' }
    expect(fragaEfterProvet(efter, '2026-10-31')).toBe(false)
    expect(fragaEfterProvet(efter, '2026-11-01')).toBe(true)
    expect(fragaEfterProvet({ ...plan, utfall: 'vidare' }, '2026-12-01')).toBe(false)
    expect(fragaEfterProvet(null, '2026-12-01')).toBe(false)
    expect(validerUtfall({ utfall: 'kanske' }, '2026-10-25')).toEqual({ ok: false, fel: 'ogiltigt_utfall' })
  })
})

describe('familjerna', () => {
  it('saknat family-fält räknas inte, ingen familj gissas', () => {
    expect(lasFamilj(undefined)).toBeNull()
    expect(lasFamilj('  ')).toBeNull()
    expect(lasFamilj(' Rotation ')).toBe('Rotation')
    expect(familjestatistik([{ family: undefined, correct: false }, { family: null, correct: true }])).toEqual([])
    expect(varDuTappar([{ family: undefined, correct: false }])).toEqual({ svagaste: [], langsamma: [], alla: [] })
  })

  it('de två svagaste, och rätt men långsamma', () => {
    const svar = [
      { family: 'Rotation', correct: false },
      { family: 'Rotation', correct: true },
      { family: 'Rotation', correct: false },
      { family: 'Antal', correct: true },
      { family: 'Antal', correct: false },
      { family: 'Spegling', correct: true, langsam: true },
      { family: 'Spegling', correct: true, langsam: true },
      { family: 'Latin', correct: true },
    ]
    const stat = familjestatistik(svar)
    expect(svagasteFamiljer(stat).map((f) => [f.family, f.ratt, f.antal])).toEqual([
      ['Rotation', 1, 3],
      ['Antal', 1, 2],
    ])
    expect(varDuTappar(svar).langsamma.map((f) => f.family)).toEqual(['Spegling'])
  })
})

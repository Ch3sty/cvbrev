// Hemvyn i Rekryteringstester (våg 2): rubriktabellen, tillstånden med
// konceptets exempeltal, gratisnivån enligt 17.2, kurvans geometri och
// ingångens plantext.

import { describe, expect, it } from 'vitest'
import { byggHemvy, decimal, veckorad, type HemModell } from '../hemvy'
import { fixtur, TILLSTAND, type Fixtur } from '../forhandsvisning'
import {
  kontextText,
  provrad,
  rubrikEfterProv,
  rubrikForeProv,
  rubrikPersonlighet,
  kortDatum,
} from '../rubrik'
import { PROVFORMAT } from '../tempo'
import { jobbsokRad, kopKnapp } from '../hem-copy'
import { kurvansGeometri, segment } from '@/components/traning/Kurva'
import { plantext } from '@/components/traning/Ingang'
import { byggPlan } from '../plan'

const modell = (t: Fixtur): HemModell => byggHemvy(fixtur(t))

describe('rubriktabellen (bilaga 11)', () => {
  const med = { leverantorNamn: 'Matrigma', testtyper: ['matris'] }
  const typ = { leverantorNamn: null, testtyper: ['matris'] }
  const utan = { leverantorNamn: null, testtyper: [] as string[] }
  it('mitt i träningen', () => {
    expect(rubrikForeProv(med, 14)).toBe('14 dagar till Matrigma')
    expect(rubrikForeProv(typ, 14)).toBe('14 dagar till logiktestet')
    expect(rubrikForeProv(utan, 14)).toBe('14 dagar till provet')
    expect(rubrikForeProv({ leverantorNamn: null, testtyper: ['numerisk'] }, 9)).toBe('9 dagar till siffertestet')
    expect(rubrikForeProv({ leverantorNamn: null, testtyper: ['verbal'] }, 9)).toBe('9 dagar till texttestet')
    expect(rubrikForeProv({ leverantorNamn: null, testtyper: ['matris', 'verbal'] }, 9)).toBe('9 dagar till provet')
  })
  it('inför, provdagen och efter', () => {
    expect(rubrikForeProv(med, 2)).toBe('I övermorgon: Matrigma')
    expect(rubrikForeProv(med, 1)).toBe('I morgon: Matrigma')
    expect(rubrikForeProv(typ, 2)).toBe('I övermorgon: logiktestet')
    expect(rubrikForeProv(utan, 0)).toBe('I dag: provet')
    expect(rubrikEfterProv(med)).toBe('Hur gick Matrigma?')
    expect(rubrikEfterProv(typ)).toBe('Hur gick logiktestet?')
    expect(rubrikEfterProv(utan)).toBe('Hur gick provet?')
  })
  it('provdagen-raden med och utan leverantör', () => {
    const m = provrad(PROVFORMAT.matrigma_klassisk)
    expect(m.titel).toBe('Samma format som Matrigma')
    expect(m.format).toBe('Cirka 35 uppgifter, 40 minuter, fast ordning.')
    const e = provrad(PROVFORMAT.eget)
    expect(e.titel).toBe('Vårt provläge')
    expect(e.format).toBe('18 uppgifter, 25 minuter. Vet du leverantören så byter vi format.')
    expect(provrad(PROVFORMAT.shl).anmarkning).toMatch(/blandar siffror/)
  })
  it('personlighet utan nedräkning och toppradens kontext', () => {
    expect(rubrikPersonlighet('2026-10-24')).toBe('Personlighetstest den 24 oktober')
    expect(kontextText({ ...med, provdatum: '2026-10-24' })).toBe('Matrigma, 24 okt')
    expect(kontextText({ ...typ, provdatum: '2026-10-24' })).toBe('Logiktest, 24 okt')
    expect(kontextText({ ...med, provdatum: null })).toBe('Matrigma, inget datum')
    expect(kontextText({ ...utan, provdatum: null })).toBeNull()
    expect(kortDatum('2026-03-05')).toBe('5 mars')
  })
})

describe('tillstånden med konceptets exempeltal', () => {
  it('varje fixtur ger rätt ram och exakt en primär handling i det lyfta kortet', () => {
    for (const t of TILLSTAND.filter((x) => x !== 'L1' && !x.startsWith('W'))) {
      const m = modell(t)
      expect(m.ram, t).toBe(t)
      if (t !== '1e') expect(m.lyft.handling, t).toBeTruthy()
    }
  })
  it('1b: dag 5, passet kvar', () => {
    const m = modell('1b')
    expect(m.vagg.rubrik).toBe('14 dagar till Matrigma')
    expect(m.vagg.rad).toBe('Nivå 5. Fyra dagar i rad. Dagens pass är kvar.')
    expect(m.vagg.dagsrad!.tal.map((t) => `${t.varde} ${t.etikett}`)).toEqual([
      '5,4 nivå, från 5,0',
      '1,1 kvar till siktet 6,5',
      '4 dagar i rad',
    ])
    expect(m.vagg.vecka!.status).toEqual(['tom', 'gjord', 'gjord', 'gjord', 'gjord', 'nu', 'vila'])
    expect(m.lyft.eyebrow).toBe('Dagens pass · nivå 5')
    expect(m.lyft.handling).toMatchObject({ typ: 'lank', text: 'Starta dagens pass' })
    expect(m.kontext?.text).toBe('Matrigma, 24 okt')
  })
  it('1g: efter passet, 7 av 9 rätt och "I morgon" byts mot söndagens vila', () => {
    const m = modell('1g')
    expect(m.lyft.titel).toBe('7 av 9 rätt. Nivån steg till 5,6.')
    expect(m.lyft.tre!.map((t) => t.varde)).toEqual(['7 av 9', '+0,2', '2 av 9'])
    expect(m.vagg.rad).toBe('Nivå 5. Fem dagar i rad. Dagens pass är gjort.')
    const imorgon = m.sektioner.find((s) => s.typ === 'status' && s.nyckel === 'imorgon')
    expect(imorgon && imorgon.typ === 'status' ? imorgon.text : null).toBe('Söndag är vilodag. Måndag: samma familj, ett steg svårare.')
    expect(m.nyPunkt).toBe(true)
  })
  it('1h och 1i', () => {
    const h = modell('1h')
    expect(h.vagg.rubrik).toBe('Rekryteringstester')
    expect(h.vagg.datumBox?.text).toMatch(/^Sätt ett datum så räknar vi bakåt/)
    expect(h.vagg.dagsrad!.tal[1]).toMatchObject({ varde: '3', etikett: 'pass gjorda' })
    const i = modell('1i')
    expect(i.vagg.rubrik).toBe('14 dagar till logiktestet')
    const prov = i.sektioner.find((s) => s.typ === 'rader' && s.nyckel === 'provdagen')
    expect(prov && prov.typ === 'rader' ? prov.rader[0].titel : null).toBe('Vårt provläge')
  })
  it('1c, 1d och 1e', () => {
    const c = modell('1c')
    expect(c.vagg.rubrik).toBe('I övermorgon: Matrigma')
    expect(c.vagg.rad).toBe('Nivå 6. Elva pass och två ommätningar bakom dig. Serien räknas inte de här dagarna.')
    expect(c.vagg.dagsrad!.ring).toBe('general')
    const d = modell('1d')
    expect(d.vagg.dagsrad).toBeUndefined()
    expect(d.vagg.provdag?.text).toMatch(/^Du har gjort elva pass, två ommätningar och två generalrepetitioner\./)
    expect(d.vagg.provdag?.skala?.etikettNu).toBe('Du 6,4')
    // Provdagen visar aldrig den låsta provdagen-raden (16.2).
    expect(d.sektioner.some((s) => s.typ === 'rader' && s.nyckel === 'provdagen')).toBe(false)
    const e = modell('1e')
    expect(e.vagg.rubrik).toBe('Hur gick Matrigma?')
    expect(e.vagg.efterKnappar).toBe(true)
  })
  it('T1, 1a, 1p och X1', () => {
    const t = modell('T1')
    expect(t.vagg.rubrik).toBe('Rekryteringstester')
    expect(t.vagg.rad).toMatch(/^Träna inför ditt rekryteringstest\./)
    expect(t.lyft.handling).toMatchObject({ text: 'Mät min nivå, 8 min' })
    const a = modell('1a')
    expect(a.vagg.planbild).toBeTruthy()
    expect(a.vagg.kurva).toBeUndefined()
    const p = modell('1p')
    expect(p.vagg.rubrik).toBe('Personlighetstest den 24 oktober')
    expect(p.vagg.dagsrad).toBeUndefined()
    const x = modell('X1')
    expect(x.lyft.titel).toBe('Passet gick inte att hämta.')
    expect(x.lyft.handling?.typ).toBe('forsok')
  })
  it('inga streck, inga "0 %" och ingen tom graf i något tillstånd', () => {
    for (const t of TILLSTAND.filter((x) => x !== 'L1')) {
      const text = JSON.stringify(modell(t))
      expect(text, t).not.toMatch(/—|–|"-"|\b0 %/)
      const m = modell(t)
      if (m.vagg.kurva) expect(m.vagg.kurva.punkter.length, t).toBeGreaterThan(0)
      for (const tal of m.vagg.dagsrad?.tal ?? []) expect(tal.varde, `${t} ${tal.etikett}`).not.toBe('0')
    }
  })
})

describe('gratisnivån (17.2)', () => {
  it('dag 2 utan paket: passet visas med tema och nivå, knappen köper paketet', () => {
    const m = modell('1f')
    expect(m.lyft.eyebrow).toBe('Dagens pass · nivå 5')
    expect(m.lyft.handling).toEqual({ typ: 'kop', text: kopKnapp(), feature: 'tests_above_base' })
    expect(kopKnapp()).toMatch(/^Köp .+, \d+ kr i månaden$/)
    expect(m.vagg.dagsrad!.tal[0].etikett).toBe('nivå, mätt i går')
    expect(m.vagg.dagsrad!.tal[2]).toMatchObject({ varde: '17', etikett: 'dagar till provet' })
    const tappar = m.sektioner.find((s) => s.typ === 'rader' && s.nyckel === 'tappar')
    expect(tappar && tappar.typ === 'rader' ? tappar.rader.every((r) => r.hoger?.typ === 'las') : false).toBe(true)
    expect(m.vagg.kurva!.plan.filter((d) => d.status === 'last').length).toBeGreaterThan(0)
  })
  it('mätningens dag utan paket: grundpasset är gratis', () => {
    const inp = fixtur('1f')
    const s = { ...inp.status!, idag: '2026-10-06', dagensPassGjort: false, dagarKvar: 18 }
    const m = byggHemvy({ ...inp, idag: '2026-10-06', status: s })
    expect(m.lyft.eyebrow).toBe('Dagens pass · grundnivå')
    expect(m.lyft.handling).toMatchObject({ typ: 'lank', text: 'Starta grundpasset' })
  })
})

describe('kurvan', () => {
  it('konceptets koordinater: 18,67 px per dag och 22 px per nivå på mobil', () => {
    const inp = fixtur('1b').status!
    const g = kurvansGeometri({ punkter: inp.punkter, plan: inp.plandagar, idag: inp.idag, start: '2026-10-06', prov: '2026-10-24', sikte: 6.5, bredd: 'mobil' })
    expect(g.x('2026-10-06')).toBe(30)
    expect(Math.round(g.x('2026-10-10') * 10) / 10).toBe(104.7)
    expect(g.x('2026-10-24')).toBe(366)
    expect(g.y(5)).toBe(90)
    expect(Math.round(g.y(5.4) * 10) / 10).toBe(81.2)
    expect(g.y(6.5)).toBe(57)
    expect(g.etiketter).toEqual([7, 6, 5])
    const d = kurvansGeometri({ punkter: inp.punkter, plan: inp.plandagar, idag: inp.idag, start: '2026-10-06', prov: '2026-10-24', sikte: 6.5, bredd: 'dator' })
    expect(d.y(5)).toBe(101)
    expect(d.y(6)).toBe(76)
    expect(d.x('2026-10-24')).toBe(816)
  })
  it('linjen bryts vid dagar utan punkt (vilodagar)', () => {
    expect(segment([{ dag: '2026-10-09' }, { dag: '2026-10-10' }, { dag: '2026-10-12' }, { dag: '2026-10-13' }])).toEqual([[0, 1], [2, 3]])
  })
  it('y-axeln toppar vid 10', () => {
    const g = kurvansGeometri({ punkter: [{ dag: '2026-10-06', niva: 9.6, typ: 'matning' }], plan: [], idag: '2026-10-07', start: '2026-10-06', bredd: 'mobil' })
    expect(g.hi).toBe(10)
  })
  it('veckoraden ur planen', () => {
    const plan = byggPlan({ start: '2026-10-06', prov: '2026-10-24', idag: '2026-10-10', aktivaDagar: ['2026-10-06', '2026-10-07'], betalande: true })
    expect(veckorad(plan, '2026-10-10')).toEqual(['tom', 'gjord', 'gjord', 'kvar', 'kvar', 'nu', 'vila'])
  })
})

describe('ingången och raderna', () => {
  it('E3: 14 dagar från en lördag ger konceptets plan (granskningen 3.3)', () => {
    expect(plantext('2026-10-10', '2026-10-24')).toEqual({
      dagar: '14 dagar.',
      text: 'Mätning i dag, åtta pass, två vilodagar, en ommätning, generalrepetition två dagar före och vila på provdagen. Går att ändra när som helst från huvudet.',
    })
  })
  it('Jobbsöket-raden', () => {
    expect(jobbsokRad({ tjanster: 3, intervjuer: 1, brev: 2 })).toBe('3 sökta tjänster, 1 intervju, 2 personliga brev.')
    expect(jobbsokRad({ tjanster: 0, intervjuer: 0, brev: 1 })).toBe('Inga sökta tjänster än. 1 personligt brev.')
    expect(jobbsokRad({ tjanster: 0, intervjuer: 0, brev: 0 })).toBe('Inga sökta tjänster eller personliga brev än.')
  })
  it('decimal med komma', () => {
    expect(decimal(5)).toBe('5,0')
    expect(decimal(6.35)).toBe('6,4')
  })
})

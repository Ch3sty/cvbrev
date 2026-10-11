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
    expect(m.format).toBe('Cirka 35 uppgifter på 40 minuter.')
    const e = provrad(PROVFORMAT.eget)
    expect(e.titel).toBe('Vårt eget format')
    expect(e.format).toBe('18 uppgifter på 25 minuter. Vet du vem som gör testet, så byter vi format.')
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
      const ram: Record<string, string> = { T1s: 'T1', '1as': '1a' }
      expect(m.ram, t).toBe(ram[t] ?? t)
      if (t !== '1e') expect(m.lyft.handling, t).toBeTruthy()
    }
  })
  it('1b: dag 5, passet kvar', () => {
    const m = modell('1b')
    expect(m.vagg.rubrik).toBe('14 dagar till Matrigma')
    // Sifferregeln (beslut-hemvy 2026-10-11 punkt 2): nivån bara i dagsraden, ett tal.
    expect(m.vagg.rad).toBe('Fyra dagar i rad. Dagens pass är kvar.')
    expect(m.vagg.dagsrad!.tal).toMatchObject({ varde: '5,4', etikett: 'din nivå, började på 5' })
    // Tillägget 2026-10-11 punkt 4: från tre punkter bär etiketten formen på mobil.
    expect(m.vagg.dagsrad!.tal.etikettMobil).toBeTruthy()
    expect(m.vagg.vecka!.status).toEqual(['tom', 'gjord', 'gjord', 'gjord', 'gjord', 'nu', 'vila'])
    // copy-plan 3.8: nivån är huvudtalet på väggen, eyebrowen säger den inte.
    expect(m.lyft.eyebrow).toBe('Dagens pass')
    expect(m.lyft.handling).toMatchObject({ typ: 'lank', text: 'Starta dagens pass' })
    expect(m.kontext?.text).toBe('Matrigma, 24 okt')
  })
  it('1g: efter passet, 7 av 9 rätt och "I morgon" byts mot söndagens vila', () => {
    const m = modell('1g')
    // copy-plan 3.3: titeln säger nivån, rätt-talet är kortets enda tal.
    expect(m.lyft.titel).toBe('Nivån steg till 5,6.')
    expect(m.lyft.tal).toEqual({ varde: '7 av 9', etikett: 'rätt' })
    expect(m.vagg.rad).toBe('Fem dagar i rad. Dagens pass är gjort.')
    const imorgon = m.sektioner.find((s) => s.typ === 'status' && s.nyckel === 'imorgon')
    expect(imorgon && imorgon.typ === 'status' ? imorgon.text : null).toBe('Söndag är vilodag. Måndag: samma mönster, ett steg svårare.')
    expect(m.nyPunkt).toBe(true)
  })
  it('1h och 1i', () => {
    const h = modell('1h')
    // 20.5 fråga 3: h1 upprepar aldrig toppradens brand.
    expect(h.vagg.rubrik).toBe('Ett pass om dagen')
    expect(h.vagg.rad).toBe('Fyra dagar i rad. Dagens pass är kvar.')
    expect(h.vagg.datumBox?.text).toMatch(/^Sätt ett datum, så lägger vi upp planen/)
    expect(h.vagg.dagsrad!.tal.varde).toBe('5,4')
    const i = modell('1i')
    expect(i.vagg.rubrik).toBe('14 dagar till logiktestet')
    const prov = i.sektioner.find((s) => s.typ === 'rader' && s.nyckel === 'provdagen')
    expect(prov && prov.typ === 'rader' ? prov.rader[0].titel : null).toBe('Övningsprovet')
    // copy-plan 3.5: utan leverantör format och erbjudandet, två meningar.
    expect(prov && prov.typ === 'rader' ? prov.rader[0].meta : null).toBe(
      'Vårt eget format, 18 uppgifter på 25 minuter. Vet du vem som gör testet, så byter vi format.'
    )
    // W3 (gratis, 22.4 fråga 2, copy-plan 3.5): format och datum, inte antal och tid.
    const w = modell('W3')
    const wp = w.sektioner.find((s) => s.typ === 'rader' && s.nyckel === 'provdagen')
    expect(wp && wp.typ === 'rader' ? wp.rader[0] : null).toMatchObject({ titel: 'Övningsprovet' })
    // Datumet i kort form, rad-meta (copy-premium 9.2): provet 24 okt, planen 22 okt.
    expect(wp && wp.typ === 'rader' ? wp.rader[0].meta : '').toBe('Samma format som Matrigma. Ligger i planen 22 okt och dagen före provet.')
    // Betalande får samma mening: öppen eller låst säger högersidan (22.4 fråga 2).
    // 1c ligger två dagar före provet och har ingen Provdagen-rad, så 1b får visa det.
    const b = modell('1b')
    const bp = b.sektioner.find((s) => s.typ === 'rader' && s.nyckel === 'provdagen')
    expect(bp && bp.typ === 'rader' ? bp.rader[0].meta : '').toBe('Samma format som Matrigma. Ligger i planen 22 okt och dagen före provet.')
    const c = modell('1c')
    const cp = c.sektioner.find((s) => s.typ === 'rader' && s.nyckel === 'provdagen')
    if (cp && cp.typ === 'rader') expect(cp.rader[0].meta).toMatch(/ Ligger i planen \d+ [a-zåäö]+ och dagen före provet\.$/)
  })
  it('1c, 1d och 1e', () => {
    const c = modell('1c')
    expect(c.vagg.rubrik).toBe('I övermorgon: Matrigma')
    expect(c.vagg.rad).toBe('Elva pass bakom dig. Nu återstår bara övningsprovet.')
    expect(c.vagg.dagsrad!.ring).toBe('general')
    const d = modell('1d')
    expect(d.vagg.dagsrad).toBeUndefined()
    // copy-plan 3.9: nivåmätningarna stryks ur meningen.
    expect(d.vagg.provdag?.text).toMatch(/^Du har gjort elva pass och två övningsprov\./)
    expect(d.vagg.provdag?.skala?.etikettNu).toBe('Du 6,4')
    // Provdagen visar aldrig den låsta provdagen-raden (16.2).
    expect(d.sektioner.some((s) => s.typ === 'rader' && s.nyckel === 'provdagen')).toBe(false)
    const e = modell('1e')
    expect(e.vagg.rubrik).toBe('Hur gick Matrigma?')
    expect(e.vagg.efterKnappar).toBe(true)
  })
  it('T1, 1a, 1p och X1', () => {
    const t = modell('T1')
    expect(t.vagg.rubrik).toBe('Träna inför ditt rekryteringstest')
    expect(t.vagg.rad).toBe('Börja med att mäta var du står. Vet du när provet är, så lägger vi upp planen fram till dagen.')
    expect(t.lyft.handling).toMatchObject({ text: 'Kolla min nivå, 8 min' })
    const a = modell('1a')
    expect(a.vagg.planbild).toBeTruthy()
    expect(a.vagg.kurva).toBeUndefined()
    const p = modell('1p')
    expect(p.vagg.rubrik).toBe('Personlighetstest den 24 oktober')
    expect(p.vagg.dagsrad).toBeUndefined()
    const x = modell('X1')
    expect(x.lyft.titel).toBe('Passet gick inte att hämta.')
    expect(x.lyft.handling?.typ).toBe('forsok')
    expect(x.vagg.rubrik).toBe('Träna inför ditt rekryteringstest')
    expect(x.vagg.rad).toBe('')
  })
  it('smakprovet räknas in i 1a och T1, en text (19.3 fråga 3, 19.5 fråga 2)', () => {
    const t = modell('T1s')
    expect(t.lyft.titel).toBe('Kolla din nivå. Cirka 5 minuter.')
    expect(t.lyft.text).toBe('Sju nya figuruppgifter ovanpå de fem från smakprovet. Efteråt vet du din nivå.')
    expect(t.lyft.handling).toMatchObject({ text: 'Kolla min nivå, 5 min' })
    const a = modell('1as')
    expect(a.lyft.text).toMatch(/^Sju nya figuruppgifter ovanpå de fem från smakprovet/)
    expect(a.lyft.fot).toBe('Nivåkollen är gratis, med eller utan Premium.')
    expect(modell('T1').lyft.text).toMatch(/^Tolv figuruppgifter/)
  })
  it('1t: bara siffror valt erbjuder siffertestet, aldrig matrismätningen (19.3 fråga 2)', () => {
    const m = modell('1t')
    expect(m.tillstand).toBe('annat_test')
    expect(m.vagg.rubrik).toBe('14 dagar till siffertestet')
    expect(m.vagg.rad).toBe('Nivå, kurva och dagliga pass finns i dag för figurer och mönster. Siffror och text får det senare.')
    expect(m.vagg.kurva).toBeUndefined()
    expect(m.vagg.planbild).toBeUndefined()
    expect(m.lyft).toMatchObject({ eyebrow: 'Första passet', titel: 'Gör siffertestet', text: 'Resultat och genomgång direkt. Vi säger till när passen finns.' })
    expect(m.lyft.handling).toMatchObject({ typ: 'lank', text: 'Starta siffertestet', href: '/dashboard/tester/numeriskt-test' })
    const fler = m.sektioner.find((s) => s.typ === 'rader' && s.nyckel === 'fler')
    const figurer = fler && fler.typ === 'rader' ? fler.rader.find((r) => r.titel === 'Figurer och mönster') : null
    expect(figurer).toMatchObject({ meta: 'Inte gjort än. Kolla din nivå på 8 minuter.', href: '/dashboard/tester/pass?typ=matning' })
  })
  it('1a gratis: meningen om grå platser med paketets namn (20.5 fråga 4)', () => {
    expect(modell('1a').vagg.kurvaMeta).toBe(
      'De grå dagarna ingår i Premium.'
    )
  })
  it('provdagen: samma råd för alla format, Matrigma-raden borta (19.3 fråga 4)', () => {
    const d = modell('1d')
    expect(JSON.stringify(d)).not.toMatch(/får inte pausas/)
  })
  it('tempokortet: över provets tid ur over_budget, ingen förklaringsmening (19.2 fråga 7)', () => {
    const m = modell('1b')
    const t = m.sektioner.find((s) => s.typ === 'tempo')
    expect(t && t.typ === 'tempo' ? t.tal.varde : null).toBe('2 av 9')
    expect(t && t.typ === 'tempo' ? t.meta : 'x').toBeUndefined()
  })
  it('inga streck, inga "0 %" och ingen tom graf i något tillstånd', () => {
    for (const t of TILLSTAND.filter((x) => x !== 'L1')) {
      const text = JSON.stringify(modell(t))
      expect(text, t).not.toMatch(/—|–|"-"|\b0 %/)
      const m = modell(t)
      if (m.vagg.kurva) expect(m.vagg.kurva.punkter.length, t).toBeGreaterThan(0)
      if (m.vagg.dagsrad) expect(m.vagg.dagsrad.tal.varde, t).not.toBe('0')
    }
  })
})

describe('gratisnivån (17.2)', () => {
  it('dag 2 utan paket: passet visas med tema och nivå, knappen köper paketet', () => {
    const m = modell('1f')
    expect(m.lyft.eyebrow).toBe('Dagens pass')
    expect(m.lyft.handling).toMatchObject({ typ: 'kop', text: kopKnapp(), feature: 'tests_above_base', plats: 'dag2' })
    expect(m.lyft.handling).toHaveProperty('prisrad', 'Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill.')
    // copy-premium avsnitt 8: kortformen i knappen, ryms på 360 px.
    expect(kopKnapp()).toBe('Köp Premium, 149 kr i månaden')
    expect(kopKnapp().length).toBeLessThan(30)
    expect(m.vagg.dagsrad!.tal.etikett).toBe('din nivå, kollad i går')
    const tappar = m.sektioner.find((s) => s.typ === 'rader' && s.nyckel === 'tappar')
    expect(tappar && tappar.typ === 'rader' ? tappar.rader.every((r) => r.hoger?.typ === 'las') : false).toBe(true)
    // En punkt (mätt i går): planbilden i stället för kurvan (beslut-hemvy avvikelse 2).
    expect(m.vagg.planbild!.plan.filter((d) => d.status === 'last').length).toBeGreaterThan(0)
  })
  it('mätningens dag utan paket: grundpasset är gratis', () => {
    const inp = fixtur('1f')
    const s = { ...inp.status!, idag: '2026-10-06', dagensPassGjort: false, dagarKvar: 18 }
    const m = byggHemvy({ ...inp, idag: '2026-10-06', status: s })
    expect(m.lyft.eyebrow).toBe('Dagens pass på grundnivå')
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
      text: 'Åtta pass fram till provet, ett övningsprov två dagar före och vila på provdagen. Du kan ändra datumet när du vill.',
    })
  })
  it('Jobbsöket-raden', () => {
    // Högst ett tal, breven räknas aldrig (beslut-hemvy 2026-10-11 punkt 2).
    expect(jobbsokRad({ tjanster: 3, intervjuer: 1, brev: 2 })).toBe('1 intervju på gång.')
    expect(jobbsokRad({ tjanster: 13, intervjuer: 0, brev: 97 })).toBe('13 sökta tjänster.')
    expect(jobbsokRad({ tjanster: 0, intervjuer: 0, brev: 1 })).toBe('Inga sökta tjänster än.')
  })
  it('decimal med komma', () => {
    expect(decimal(5)).toBe('5,0')
    expect(decimal(6.35)).toBe('6,4')
  })
})

describe('instrumenten (art-director 20.3 punkt 8 och 20.5 fråga 1)', async () => {
  const Nivaskala = await import('@/components/traning/Nivaskala')
  const { axelEtiketter, kurvansGeometri: geo } = await import('@/components/traning/Kurva')
  it('nivåskalan: målet står aldrig på skalan, krockregeln är borta', () => {
    expect('siktetKrockar' in Nivaskala).toBe(false)
    expect('SIKTE_KROCK_NIVAER' in Nivaskala).toBe(false)
  })
  it('axeln: "i dag" står alltid, slutdatumet faller bort i 1c på mobil', () => {
    const s = fixtur('1c').status!
    for (const bredd of ['mobil', 'dator'] as const) {
      const g = geo({ punkter: s.punkter, plan: s.plandagar, idag: s.idag, start: s.start!.dag, prov: s.plan!.provdatum, sikte: s.plan!.sikte, bredd })
      const e = axelEtiketter(g, s.idag, s.plandagar, { prov: s.plan!.provdatum, dator: bredd === 'dator' })
      expect(e.map((x) => x.text), bredd).toContain('i dag')
      if (bredd === 'mobil') expect(e.map((x) => x.text), bredd).not.toContain('24 okt')
    }
  })
  it('axeln: i 1b står i dag, start och slut', () => {
    const s = fixtur('1b').status!
    const g = geo({ punkter: s.punkter, plan: s.plandagar, idag: s.idag, start: s.start!.dag, prov: s.plan!.provdatum, sikte: s.plan!.sikte, bredd: 'mobil' })
    const t = axelEtiketter(g, s.idag, s.plandagar, { prov: s.plan!.provdatum, dator: false }).map((x) => x.text)
    expect(t).toEqual(expect.arrayContaining(['i dag', '6 okt', '24 okt']))
  })
})

describe('beslut-hemvy 2026-10-11', () => {
  const enPunkt = (t: Fixtur) => {
    const inp = fixtur(t)
    const s = inp.status!
    const forsta = s.punkter[0]
    return byggHemvy({ ...inp, status: { ...s, punkter: [forsta], start: { ...s.start!, dag: forsta.dag, niva: forsta.niva } } })
  }
  it('kurvan tänds vid två punkter; under två ritas planbilden när datum finns', () => {
    const m = enPunkt('1b')
    expect(m.vagg.kurva).toBeUndefined()
    expect(m.vagg.planbild).toMatchObject({ matt: true })
    expect(m.vagg.kurvaRubrik?.form).toBeUndefined()
    const h = enPunkt('1h')
    expect(h.vagg.kurva).toBeUndefined()
    expect(h.vagg.planbild).toBeUndefined()
    expect(h.vagg.kurvaRubrik).toBeUndefined()
  })
  it('formen visas först från tre punkter', () => {
    const inp = fixtur('1b')
    const s = inp.status!
    const tva = byggHemvy({ ...inp, status: { ...s, punkter: s.punkter.slice(0, 2), form: s.form ?? { form: 'stabil' } as never } })
    expect(tva.vagg.kurva).toBeTruthy()
    expect(tva.vagg.kurvaRubrik?.form).toBeUndefined()
    const fler = byggHemvy({ ...inp, status: { ...s, form: s.form ?? { form: 'stabil' } as never } })
    expect(s.punkter.length).toBeGreaterThanOrEqual(3)
    expect(fler.vagg.kurvaRubrik?.form).toBeTruthy()
  })
  it('Jobbsöket är en rad med högst ett tal och Fler tester har sektionslänken', () => {
    const m = modell('1b')
    const j = m.sektioner.find((s) => s.typ === 'rader' && s.nyckel === 'jobbsok')
    expect(j && j.typ === 'rader' ? j.rader[0] : null).toMatchObject({ symbol: 'jobb', hoger: { typ: 'chev' }, href: '/dashboard' })
    const meta = j && j.typ === 'rader' ? j.rader[0].meta ?? '' : ''
    expect((meta.match(/\d+/g) ?? []).length).toBeLessThanOrEqual(1)
    const fler = m.sektioner.find((s) => s.typ === 'rader' && s.nyckel === 'fler')
    expect(fler && fler.typ === 'rader' ? fler.lank : null).toMatchObject({ href: '/dashboard/tester/alla' })
  })
  it('ingen stapel på noll i Var du tappar', () => {
    const inp = fixtur('1b')
    const s = inp.status!
    const svaga = s.varDuTappar.svagaste.map((f, i) => (i === 0 ? { ...f, ratt: 0, andel: 0 } : f))
    const m = byggHemvy({ ...inp, status: { ...s, varDuTappar: { ...s.varDuTappar, svagaste: svaga } } })
    const t = m.sektioner.find((x) => x.typ === 'rader' && x.nyckel === 'tappar')
    const rad = t && t.typ === 'rader' ? t.rader[0] : null
    expect(rad?.stapel).toBeUndefined()
    expect(rad?.meta).not.toMatch(/\b0\b/)
  })
})

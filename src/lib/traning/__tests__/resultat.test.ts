// @vitest-environment node
//
// Resultatskärmarna i våg 3b (P4, S1, M1, O1, K1) som rena funktioner, med
// förhandsvisningens fixturer: riktiga V7-frågor ur banken, blandade som i
// passet, och spec-rummens exempeltal (bilaga 11). Plus fixtur-API:t som
// förhandsvisningen spelar upp passet mot.

import { describe, expect, it } from 'vitest'

const { byggForhandsdata } = await import('@/app/dashboard/tester/forhandsvisning-pass/fixturer.server')
import { fixturApi } from '../fixturApi'
import { datumLista, deltaText, fragorText, mmss, nivaHeltal, nivaText, PASS_COPY, serieText } from '../pass-copy'
import { andraRegelrad, kvitto, matningResultat, ommatningResultat, passResultat } from '../resultat'
import { kopKnapp } from '@/lib/plans/plans'

function resultatdata(ram: 'P4' | 'S1' | 'M1' | 'O1', opt: { betalande?: boolean } = {}) {
  const d = byggForhandsdata(ram, opt)
  if (!('resultat' in d)) throw new Error('ingen resultatram')
  return d.resultat
}

describe('formen på talen och datumen', () => {
  it('nivå, förflyttning, tid och listor', () => {
    expect(nivaText(5.6)).toBe('5,6')
    expect(nivaText(5)).toBe('5,0')
    expect(nivaHeltal(5.9)).toBe(5)
    expect(nivaHeltal(6.0)).toBe(6)
    expect(deltaText(0.2)).toBe('+0,2')
    expect(deltaText(-0.1)).toBe('−0,1')
    expect(deltaText(0.04)).toBe('0,0')
    expect(mmss(38)).toBe('0:38')
    expect(mmss(68)).toBe('1:08')
    expect(fragorText([4, 7])).toBe('Fråga 4 och 7')
    expect(fragorText([2, 4, 7])).toBe('Fråga 2, 4 och 7')
    expect(datumLista(['2026-10-13', '2026-10-20'])).toBe('13 och 20 okt')
    expect(datumLista(['2026-10-27', '2026-11-03'])).toBe('27 okt och 3 nov')
  })

  it('serien före "I morgon"', () => {
    expect(serieText(5, 'pagar')).toBe('Fem dagar i rad.')
    expect(serieText(1, 'pagar')).toBe('Serien har börjat.')
    expect(serieText(0, 'bruten')).toBe('Serien börjar om i dag.')
    expect(serieText(3, 'pausad')).toBe('Serien pausar, inget bryts.')
  })

  it('inga tankstreck och inget "poäng" i passets texter', () => {
    const texter: string[] = []
    const samla = (v: unknown) => {
      if (typeof v === 'string') texter.push(v)
      else if (typeof v === 'function') {
        try {
          const r = (v as (...a: unknown[]) => unknown)(5, 9, 5.6, 0.2)
          if (typeof r === 'string') texter.push(r)
        } catch {
          // Funktioner med andra argument provas inte.
        }
      } else if (v && typeof v === 'object') Object.values(v).forEach(samla)
    }
    samla(PASS_COPY)
    expect(texter.length).toBeGreaterThan(80)
    for (const t of texter) {
      expect(t).not.toMatch(/—/)
      expect(t.toLowerCase()).not.toMatch(/poäng/)
    }
  })
})

describe('P4: passet klart, 10 oktober', () => {
  const { avslut, vy, status } = resultatdata('P4')
  const r = passResultat(avslut, vy, status)

  it('rubriken, skalan och de tre talen', () => {
    expect(r.rubrik).toBe('7 av 9 rätt. Nivån steg till 5,6.')
    expect(r.riktning).toBe('upp')
    expect(r.skala).toMatchObject({ nu: 5.6, fran: 5.4, sikte: 6.5, etikettNu: 'Nu 5,6', etikettFran: 'från 5,4' })
    expect(r.tal.map((t) => t.varde)).toEqual(['7 av 9', '+0,2', '2 av 9'])
    expect(r.tal[1]).toMatchObject({ etikett: 'nivå, från 5,4', koppar: true })
    expect(r.tal[2].etikett).toBe('över provets tid')
  })

  it('tempot: fråga 4 och 7 över provets tid, staplarna följer', () => {
    expect(r.kort.titel).toBe('Fråga 4 och 7 tog över provets tid')
    expect(r.kort.text).toContain('Snitt 44 s, provet ger 68.')
    const over = r.kort.staplar.staplar.map((s, i) => (s.over ? i + 1 : 0)).filter(Boolean)
    expect(over).toEqual([4, 7])
    const fel = r.kort.staplar.staplar.map((s, i) => (s.fel ? i + 1 : 0)).filter(Boolean)
    expect(fel).toEqual([3, 8])
    expect(r.kort.staplar.linje).toBeGreaterThan(0)
    expect(r.kort.staplar.linje).toBeLessThan(0.2)
  })

  it('genomgången: fråga 3 och 8 med misstaget ur banken, sju rätt', () => {
    expect(r.genomgang.missar).toEqual([2, 7])
    expect(r.genomgang.ratt).toBe(7)
    expect(r.genomgang.rader.map((x) => x.titel)).toEqual(['Fråga 3, fel', 'Fråga 8, fel'])
    expect(r.genomgang.rader[0].meta).toMatch(/52 s\.$/)
    expect(r.primar).toEqual({ etikett: 'Gå igenom de två missarna', handling: 'genomga' })
  })

  it('"I morgon" byts mot veckodagen före vilan (lördagsexemplet)', () => {
    expect(r.status).toBe('Fem dagar i rad. Söndag är vilodag. Måndag: samma familj, ett steg svårare.')
    expect(r.mening).toContain('ommätningen på tisdag mer')
    // 19.2 fråga 4: jämförelsen med förra gången i familjen.
    expect(r.mening).toMatch(/^Rotation med byte: fem av sex rätt i dag, mot två av tre förra gången. /)
  })

  it('talet och kortet räknar samma frågor (19.2 fråga 7)', () => {
    expect(r.tal[2].varde).toBe('2 av 9')
    expect(r.kort.text).not.toContain('Tempot mäts på frågor nära din nivå')
  })
})

describe('S1: nivån sjönk, 8 oktober', () => {
  const { avslut, vy, status } = resultatdata('S1')
  const r = passResultat(avslut, vy, status)

  it('lika lugnt, med ordet om varför', () => {
    expect(r.rubrik).toBe('5 av 9 rätt. Nivån 5,1, ner en tiondel.')
    expect(r.riktning).toBe('ner')
    expect(r.tal[1]).toEqual({ varde: '5,1', etikett: 'nivå, från 5,2' })
    // 19.2 fråga 5: två av missarna var sträckuppgifter över nivån.
    expect(r.mening).toBe('Två av missarna var sträckuppgifter över din nivå. De räknas lätt mot dig och tungt för dig, och nivån rör sig högst 0,5 per pass.')
    expect(r.kort.text).toMatch(/Familjen går att öva med riktade pass.$/)
    expect(r.kort.axelMitt).toBe('ihåliga staplar: fel svar')
    expect(r.kort.eyebrow).toBe('Vad som hände')
    expect(r.kort.titel).toBe('Fyra missar, tre i samma familj')
    expect(r.status).toBe('Tre dagar i rad. I morgon: ny familj.')
    expect(r.primar.etikett).toBe('Gå igenom de fyra missarna')
  })
})

describe('riktat pass', () => {
  it('räknas i familjen, inte i nivån', () => {
    const { avslut, vy, status } = resultatdata('P4')
    const r = passResultat({ ...avslut, typ: 'riktat', niva_efter: null }, { ...vy, typ: 'riktat' }, status)
    expect(r.rubrik).toBe('7 av 9 rätt.')
    expect(r.skala).toBeNull()
    expect(r.mening).toBe('Riktade pass räknas i familjen, inte i nivån.')
    expect(r.eyebrow).toBe('Riktat pass klart')
  })
})

describe('M1: nivåmätningen med betalväggen', () => {
  it('gratis: dagens grundpass gratis, allt efter i dag låst, knappen med namn och pris', () => {
    const { avslut, status } = resultatdata('M1')
    const r = matningResultat(avslut, status, false)
    expect(r.heltal).toBe(5)
    expect(r.mening).toBe(
      'Du klarar de flesta uppgifter på grundnivå. Två regler samtidigt, som rotation med byte, går ungefär varannan gång. Två familjer drar ner mest, de står under Var du tappar.'
    )
    expect(r.tal.map((t) => t.varde)).toEqual(['9 av 12', '3 av 12', '52 s'])
    expect(r.tal[2].etikett).toBe('snitt, provet ger 68')
    expect(r.siktetMening).toContain('18 dagars träning')
    expect(r.planRubrik).toBe('Planen till 24 oktober · 18 dagar')
    expect(r.plan.map((p) => p.titel)).toEqual([
      'I dag: mätningen',
      'I dag: ett grundpass',
      '7 okt och varje dag: passet på din nivå',
      '13 och 20 okt: ommätning',
      '22 och 23 okt: generalrepetition',
      '24 okt: provdagen',
    ])
    expect(r.plan.filter((p) => p.last).length).toBe(3)
    expect(r.plan.find((p) => p.titel.includes('generalrepetition'))!.meta).toBe('Samma format som Matrigma, cirka 35 uppgifter, 40 minuter.')
    expect(r.plan[2].chip).toMatchObject({ text: 'Ingår i Premium', las: true })
    // copy-premium avsnitt 8: kortformen i knappen, fulla namnet i prisraden.
    expect(r.betalvagg!.knapp).toBe(kopKnapp())
    expect(r.betalvagg!.knapp).toBe('Köp Premium, 149 kr i månaden')
    expect(r.betalvagg!.prisrad).toBe('Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill.')
    expect(r.betalvagg!.eyebrow).toBe('Premium')
    expect(r.betalvagg!.rubrik).toBe('18 dagar kvar. Månaden täcker hela vägen.')
    // 19.4 punkt 1: "samma format som" när leverantören är känd.
    expect(r.betalvagg!.text).toContain('generalrepetitionen i samma format som Matrigma. Plus')
    expect(r.betalvagg!.lank).toBe('Gör dagens grundpass gratis')
    expect(r.betalvagg!.lankTill).toBe('grundpass')
    expect(r.plan[1].chip).toMatchObject({ text: 'Gratis' })
    expect(r.familjer.map((f) => f.titel)).toEqual(['Rotation med byte', 'Antal i rad och kolumn', 'Rätt men långsamma: speglingar'])
  })

  it('nämnaren i över provets tid är frågorna med tid (19.5 fråga 3)', () => {
    const { avslut, status } = resultatdata('M1')
    const r = matningResultat(avslut, status, false, 5)
    expect(r.tal[0].varde).toBe('9 av 12')
    expect(r.tal[1]).toMatchObject({ varde: '3 av 7', etikett: 'över provets tid' })
  })

  it('betalande: ingen betalvägg, inga lås', () => {
    const { avslut, status } = resultatdata('M1', { betalande: true })
    const r = matningResultat(avslut, status, true)
    expect(r.betalvagg).toBeNull()
    expect(r.plan.some((p) => p.last || p.chip?.las)).toBe(false)
    expect(r.plan.some((p) => p.titel === 'I dag: ett grundpass')).toBe(false)
  })
})

describe('O1: veckans ommätning', () => {
  it('före och efter, nästa ommätning som datum', () => {
    const { avslut, status } = resultatdata('O1')
    const r = ommatningResultat(avslut, status)
    expect(r.rubrik).toBe('5,8. Passen hade räknat dig till 5,7.')
    expect(r.skala).toMatchObject({ nu: 5.8, fran: 5.0, franEtikett: '6 okt 5,0' })
    expect(r.tal.map((t) => t.varde)).toEqual(['10 av 12', '+0,8', '1 av 12'])
    expect(r.tal[1].etikett).toBe('på en vecka')
    expect(r.status.startsWith('Nästa ommätning tisdag 20 oktober.')).toBe(true)
    expect(r.milstolpe?.namn).toBe('Första veckan')
  })
  it('utan milstolpe: Var du tappar nu med "mot 6 okt" (20.2 fråga 8)', () => {
    const d = byggForhandsdata('O1', { utanMilstolpe: true })
    if (!('resultat' in d)) throw new Error('ingen resultatram')
    const r = ommatningResultat(d.resultat.avslut, d.resultat.status)
    expect(r.milstolpe).toBeNull()
    expect(r.familjer.map((f) => `${f.titel}: ${f.meta}`)).toEqual([
      'Antal i rad och kolumn: 1 av 2 rätt, mot 2 av 4 den 6 okt.',
      'Rotation med byte: 2 av 3 rätt, mot 1 av 3 den 6 okt.',
    ])
    expect(r.familjerEyebrow).toBe('Var du tappar nu')
  })
  it('trösklarna (19.5 fråga 5): en fråga i familjen visas inte, jämförelsen kräver två i mätningen, annars det ackumulerade', () => {
    const d = byggForhandsdata('O1', { utanMilstolpe: true })
    if (!('resultat' in d)) throw new Error('ingen resultatram')
    const { avslut, status } = d.resultat
    const fam = avslut.familjer.passet.map((x) => x.family)
    const f = (family: string, ratt: number, antal: number) => ({ family, ratt, antal, andel: ratt / antal, ratt_men_langsamma: 0 })
    const tunn = ommatningResultat(
      {
        ...avslut,
        familjer: {
          ...avslut.familjer,
          passet: [f(fam[0], 1, 3), f(fam[1], 0, 1)],
          matningen: { dag: '2026-10-06', familjer: [f(fam[0], 1, 1)] },
        },
      },
      status
    )
    expect(tunn.familjerEyebrow).toBe('Var du tappar nu')
    expect(tunn.familjer).toHaveLength(1)
    expect(tunn.familjer[0].meta).toBe('1 av 3 rätt.')
    const ingen = ommatningResultat({ ...avslut, familjer: { ...avslut.familjer, passet: [f(fam[0], 0, 1), f(fam[1], 0, 1)] } }, status)
    expect(ingen.familjerEyebrow).toBe('Var du tappar')
    expect(ingen.familjer.length).toBe(avslut.familjer.svagaste.length)
    expect(ingen.familjer.length).toBeGreaterThan(0)
    expect(ingen.familjer.every((x) => / av \d+ rätt hittills\.$/.test(x.meta))).toBe(true)
  })
})

describe('raden efter regeln (19.2 fråga 1)', () => {
  it('rätt sträckuppgift inom tiden, rätt nära nivån över tiden, fel på en sträckuppgift', () => {
    expect(andraRegelrad({ correct: true, band: 'over', tid_s: 40 }, 60)).toBe('Sträckuppgift över din nivå, klarad inom provets tid.')
    expect(andraRegelrad({ correct: true, band: 'over', tid_s: 70 }, 60)).toBe('Sträckuppgift över din nivå. Rätt, men över provets tid.')
    expect(andraRegelrad({ correct: true, band: 'nara', tid_s: 70 }, 60)).toBe('Rätt, men över provets tid. Tempot räknas i resultatet.')
    expect(andraRegelrad({ correct: true, band: 'nara', tid_s: 40 }, 60)).toBeNull()
    expect(andraRegelrad({ correct: false, band: 'over', tid_s: 50 }, 60)).toBe('Sträckuppgift över din nivå.')
    expect(andraRegelrad({ correct: false, band: 'under', tid_s: 50 }, 60)).toBeNull()
    expect(andraRegelrad({ correct: true, band: null, tid_s: 40 }, 60)).toBeNull()
  })
})

describe('M1 när grundpasset redan är gjort (19.2 fråga 6)', () => {
  it('chippen säger Klart och länken går tillbaka', () => {
    const d = byggForhandsdata('M1', { grundGjort: true })
    if (!('resultat' in d)) throw new Error('ingen resultatram')
    const r = matningResultat(d.resultat.avslut, d.resultat.status, false)
    expect(r.plan[1]).toMatchObject({ titel: 'I dag: ett grundpass', chip: { text: 'Klart' } })
    expect(r.betalvagg).toMatchObject({ lank: 'Tillbaka till Rekryteringstester', lankTill: 'tillbaka' })
  })
})

describe('generalrepetitionen (19.2 fråga 8)', () => {
  it('meningen säger formatet och att punkten väger som en ommätning', () => {
    const { avslut, vy, status } = resultatdata('P4')
    const r = passResultat({ ...avslut, typ: 'general' }, { ...vy, typ: 'general' }, status)
    expect(r.mening).toBe('Samma format som Matrigma, cirka 35 uppgifter, 40 minuter. Punkten väger som en ommätning på kurvan.')
    expect(r.eyebrow).toBe('Generalrepetitionen klar')
  })
})

describe('K1: kvittot', () => {
  it('Första veckan med de rättade talen', () => {
    const d = byggForhandsdata('K1')
    if (d.ram !== 'K1') throw new Error('fel ram')
    expect(d.kvitto.namn).toBe('Första veckan')
    expect(d.kvitto.eyebrow).toBe('Milstolpe · tisdag 13 oktober')
    expect(d.kvitto.mening).toBe(
      'Sju dagar sedan mätningen, fem pass och en ommätning, ingen missad dag. Nivån gick från 5,0 till 5,8. Nästa märke: Nivån upp, vid 6,0.'
    )
  })

  it('Första mätningen och Nivån upp', () => {
    const { status } = resultatdata('O1')
    expect(kvitto('forsta_matningen', status, { betalande: true }).mening).toMatch(/^Din första punkt på kurvan, nivå 5,0\./)
  })
})

describe('fixtur-API:t (förhandsvisningen)', () => {
  it('ett pass: fel svar visar regeln och misstaget, "Vet inte" räknas som fel, klar efter nio', async () => {
    const d = byggForhandsdata('P1')
    if (!('fixtur' in d)) throw new Error('ingen fixtur')
    // Facit följer aldrig med till klienten.
    expect(JSON.stringify(d.fixtur.vy)).not.toContain('correctAnswer')
    const api = fixturApi({ ...d.fixtur, fordrojning: 0 })
    const vy = d.fixtur.vy
    const q3 = vy.fragor[2]
    const facit = d.fixtur.facit[q3.id]
    const fel = (facit.rattVisat + 1) % 6
    const s1 = await api.svara({ sessionId: vy.id, questionId: q3.id, selectedIndex: fel, timeSpent: 52 })
    expect(s1.ok && s1.aterkoppling).toMatchObject({ correct: false, vetInte: false, rattVisat: facit.rattVisat, tid_s: 52 })
    expect(s1.ok && s1.aterkoppling?.regel).toBeTruthy()
    const q4 = vy.fragor[3]
    const s2 = await api.svara({ sessionId: vy.id, questionId: q4.id, selectedIndex: null, vetInte: true, timeSpent: 40 })
    expect(s2.ok && s2.aterkoppling).toMatchObject({ correct: false, vetInte: true, misstag: null })
    // Samma fråga två gånger: 409, som servern.
    const igen = await api.svara({ sessionId: vy.id, questionId: q4.id, selectedIndex: 0, timeSpent: 1 })
    expect(igen.ok).toBe(false)
    let sista = s2
    for (const q of vy.fragor.slice(4)) {
      sista = await api.svara({ sessionId: vy.id, questionId: q.id, selectedIndex: d.fixtur.facit[q.id].rattVisat, timeSpent: 30 })
    }
    expect(sista.ok && sista.klar).toBe(true)
    const a = await api.slutfor(vy.id)
    expect(a.ok && a.avslut.ratt).toBe(2 + 5)
    const efter = await api.session(vy.id)
    expect(efter?.avslutad).toBe(true)
    expect(efter?.genomgang?.length).toBe(9)
  })
})

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
import { kvitto, matningResultat, ommatningResultat, passResultat } from '../resultat'
import { paketMedPris, paketNamn } from '@/lib/plans/plans'

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
  })
})

describe('S1: nivån sjönk, 8 oktober', () => {
  const { avslut, vy, status } = resultatdata('S1')
  const r = passResultat(avslut, vy, status)

  it('lika lugnt, med ordet om varför', () => {
    expect(r.rubrik).toBe('5 av 9 rätt. Nivån 5,1, ner en tiondel.')
    expect(r.riktning).toBe('ner')
    expect(r.tal[1]).toEqual({ varde: '5,1', etikett: 'nivå, från 5,2' })
    expect(r.mening).toContain('högst 0,5 per pass')
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
    expect(r.mening).toBe('Du klarar de flesta uppgifter på grundnivå inom provets tid. De svåra tar längre. I två familjer väljer du oftare fel svar.')
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
    expect(r.plan[2].chip).toMatchObject({ text: paketNamn('all_month'), las: true })
    expect(r.betalvagg!.knapp).toBe(`Köp ${paketMedPris('all_month')}`)
    expect(r.betalvagg!.knapp).toContain('149 kr i månaden')
    expect(r.betalvagg!.rubrik).toBe('18 dagar kvar. Månaden täcker hela vägen.')
    expect(r.familjer.map((f) => f.titel)).toEqual(['Rotation med byte', 'Antal i rad och kolumn', 'Rätt men långsamma: speglingar'])
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

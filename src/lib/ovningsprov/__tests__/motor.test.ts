// Övningsprovet i verbalt och numeriskt (riktlinjer-tester-v2 1.2, 1.3 och
// 1.9): urvalet, punkterna, rättningen och resultatet. Rena funktioner, ingen
// databas.

import { describe, expect, it } from 'vitest'
import { giltigtSvar, ovningsvy, punkterFor, raknaResultat, rubrikUtanNummer, valjDelar } from '../motor.server'
import { POOL_V1 as VERBAL_V1, POOL_V2 as VERBAL_V2 } from '@/lib/verbalTestProv/selectProv'
import { POOL_EXPERT, POOL_V1 as NUM_V1, POOL_V2 as NUM_V2 } from '@/lib/numericalTestProv/selectProv'
import { ovningsformat } from '../format'

describe('urvalet', () => {
  it('verbalt: åtta texter, fyra grund först och fyra avancerad sist, 32 påståenden', () => {
    const delar = valjDelar('verbal', 'seed-a')
    expect(delar).toHaveLength(8)
    const grund = new Set(VERBAL_V1.map((p) => p.id))
    const avancerad = new Set(VERBAL_V2.map((p) => p.id))
    expect(delar.slice(0, 4).every((id) => grund.has(id))).toBe(true)
    expect(delar.slice(4).every((id) => avancerad.has(id))).toBe(true)
    expect(punkterFor('verbal', delar)).toHaveLength(ovningsformat('verbal', null).antal)
  })

  it('numeriskt: fem underlag, två grund, två avancerad och ett expert, 20 frågor', () => {
    const delar = valjDelar('numerisk', 'seed-b')
    expect(delar).toHaveLength(5)
    expect(NUM_V1.some((p) => p.id === delar[0])).toBe(true)
    expect(NUM_V2.some((p) => p.id === delar[2])).toBe(true)
    expect(POOL_EXPERT.some((p) => p.id === delar[4])).toBe(true)
    expect(punkterFor('numerisk', delar)).toHaveLength(ovningsformat('numerisk', null).antal)
  })

  it('seedat: samma seed ger samma prov, texter hon haft väljs sist', () => {
    expect(valjDelar('verbal', 'x')).toEqual(valjDelar('verbal', 'x'))
    const forsta = valjDelar('verbal', 'x')
    const andra = valjDelar('verbal', 'x', new Set(forsta))
    expect(andra.filter((id) => forsta.includes(id))).toHaveLength(0)
  })

  it('rubriken tappar "PASSAGE n —"', () => {
    expect(rubrikUtanNummer('PASSAGE 1 — Sommaranställningar')).toBe('Sommaranställningar')
    expect(rubrikUtanNummer('Budget 2025')).toBe('Budget 2025')
  })
})

describe('svaren', () => {
  it('verbalt tar sant, falskt och går inte att avgöra, inget annat', () => {
    const p = punkterFor('verbal', [VERBAL_V1[0].id])[0]
    expect(giltigtSvar('verbal', p, 'cannot_say')).toBe(true)
    expect(giltigtSvar('verbal', p, 'kanske')).toBe(false)
  })

  it('numeriskt tar bara frågans egna alternativ', () => {
    const p = punkterFor('numerisk', [NUM_V1[0].id])[0]
    expect(giltigtSvar('numerisk', p, NUM_V1[0].questions[0].options[0].id)).toBe(true)
    expect(giltigtSvar('numerisk', p, 'z')).toBe(false)
  })
})

describe('resultatet', () => {
  const delar = valjDelar('verbal', 'resultat')
  const meta = { delar, tidsgrans_s: 1200, del_budget_s: 150 }
  const punkter = punkterFor('verbal', delar)
  const facit = (i: number) => {
    const p = punkter[i]
    return [...VERBAL_V1, ...VERBAL_V2].find((x) => x.id === p.del)!.statements[Number(p.punkt)].correctAnswer
  }

  it('obesvarade räknas som fel och är provets viktigaste tal', () => {
    // 28 besvarade, alla rätt; fyra obesvarade.
    const svar = punkter.slice(0, 28).map((p, i) => ({ nyckel: p.nyckel, svar: facit(i), tid: 30 }))
    const { resultat, genomgang } = raknaResultat({
      typ: 'verbal',
      meta,
      svar,
      startad: '2026-10-11T10:00:00Z',
      avslutad: '2026-10-11T10:20:00Z',
    })
    expect(resultat.ratt).toBe(28)
    expect(resultat.antal).toBe(32)
    expect(resultat.obesvarade).toBe(4)
    expect(resultat.avTiden).toBe(true)
    expect(resultat.tid_s).toBe(1200)
    expect(genomgang.filter((g) => g.svar === null)).toHaveLength(4)
    expect(resultat.delar).toHaveLength(8)
    expect(resultat.delar[0]).toMatchObject({ ratt: 4, antal: 4, tid_s: 120, budget_s: 150 })
    expect(resultat.delar[7].obesvarade).toBe(4)
  })

  it('tiden räckte: inlämnat före tiden, ingen obesvarad', () => {
    const svar = punkter.map((p, i) => ({ nyckel: p.nyckel, svar: i === 0 ? 'nej' : facit(i), tid: 20 }))
    const { resultat } = raknaResultat({
      typ: 'verbal',
      meta,
      svar,
      startad: '2026-10-11T10:00:00Z',
      avslutad: '2026-10-11T10:17:40Z',
    })
    expect(resultat.obesvarade).toBe(0)
    expect(resultat.avTiden).toBe(false)
    expect(resultat.tid_s).toBe(1060)
    expect(resultat.ratt).toBe(31)
    expect(resultat.tappade.length).toBeGreaterThan(0)
  })
})

describe('klientens form', () => {
  it('inget facit under provet, genomgången först efter avslutet', () => {
    const delar = valjDelar('numerisk', 'klient')
    const meta = {
      ovningsprov: 1,
      typ: 'numerisk',
      format: 'numerisk_eget',
      antal: 20,
      minuter: 25,
      tidsgrans_s: 1500,
      budget_s: 75,
      del_budget_s: 300,
      delar,
      seed: 'klient',
      dag: '2026-10-11',
      fran: null,
    }
    const pagar = ovningsvy({ id: 's', test_type: 'numerisk-general', meta, answers: [], created_at: '2026-10-11T10:00:00Z', completed_at: null })!
    const json = JSON.stringify(pagar.delar)
    expect(json).not.toMatch(/isCorrect|correctAnswerId|explanation/)
    expect(pagar.genomgang).toBeNull()
    expect(pagar.resultat).toBeNull()
    const klar = ovningsvy({ id: 's', test_type: 'numerisk-general', meta, answers: [], created_at: '2026-10-11T10:00:00Z', completed_at: '2026-10-11T10:25:00Z' })!
    expect(klar.resultat?.obesvarade).toBe(20)
    expect(klar.genomgang).toHaveLength(20)
  })
})

/**
 * Hemskärmens träningsfokus: Träningspaketet (scope tester) utan CV
 * (ägarens beslut 2026-09-24). Rangordningen följer Inför intervjun:
 * omskrivning, ogjord fråga, hela testet, nästa test på högre nivå.
 */

import { describe, expect, it } from 'vitest'
import { FRAGA_ORDNING, type FragaId } from '@/components/artiklar/intervjuprov/fragor'
import { nastaTest, traningsHandling, type IntervjuHem, type ProvSammanfattning } from '../nasta'

function prov(question: FragaId, level: number): ProvSammanfattning {
  return { token: `${question}-${level}`, question, level, missingKind: 'planen', createdAt: '2026-09-24T08:00:00Z' }
}

const allaGjorda = (niva: number) =>
  Object.fromEntries(FRAGA_ORDNING.map((f) => [f, niva])) as Partial<Record<FragaId, number>>

function hem(over: Partial<IntervjuHem> = {}): IntervjuHem {
  return { antalProv: 0, senaste: null, smakprovToken: null, harProfil: false, bastaNiva: {}, gjordaTestTyper: [], ...over }
}

describe('traningsHandling (scope tester, inget CV)', () => {
  it('nytt konto utan något: första intervjufrågan', () => {
    expect(traningsHandling(hem())).toEqual({ kind: 'interview-new', fraga: FRAGA_ORDNING[0] })
    expect(traningsHandling(null)).toEqual({ kind: 'interview-new', fraga: FRAGA_ORDNING[0] })
  })

  it('senaste provet 3 eller lägre: omskrivning, utan dygnsgräns', () => {
    const s = prov('styrkor', 3)
    expect(traningsHandling(hem({ antalProv: 1, senaste: s, bastaNiva: { styrkor: 3 } }))).toEqual({
      kind: 'interview-rewrite',
      prov: s,
    })
  })

  it('senaste provet 4: första ogjorda frågan i ordning', () => {
    const s = prov(FRAGA_ORDNING[0], 4)
    expect(traningsHandling(hem({ antalProv: 1, senaste: s, bastaNiva: { [FRAGA_ORDNING[0]]: 4 } }))).toEqual({
      kind: 'interview-new',
      fraga: FRAGA_ORDNING[1],
    })
  })

  it('alla frågor gjorda och bara smakprov: hela personlighetstestet', () => {
    const s = prov('beratta', 5)
    expect(
      traningsHandling(hem({ senaste: s, bastaNiva: allaGjorda(4), smakprovToken: 'tok', harProfil: false }))
    ).toEqual({ kind: 'personality-full', smakprovToken: 'tok' })
  })

  it('alla frågor gjorda och profil finns: nästa rekryteringstest på högre nivå', () => {
    const s = prov('beratta', 5)
    const i = hem({ senaste: s, bastaNiva: allaGjorda(4), smakprovToken: 'tok', harProfil: true, gjordaTestTyper: ['matrislogik'] })
    expect(traningsHandling(i)).toEqual({ kind: 'test-next', slug: 'matrislogik-avancerad', forsta: false })
  })

  it('inga tester gjorda: logiktestet på grundnivå som första test', () => {
    const i = hem({ senaste: prov('beratta', 5), bastaNiva: allaGjorda(4), harProfil: true })
    expect(traningsHandling(i)).toEqual({ kind: 'test-next', slug: 'matrislogik-grund', forsta: true })
  })

  it('allt gjort: frågan med lägst bästa nivå, aldrig tom yta', () => {
    const basta = { ...allaGjorda(5), [FRAGA_ORDNING[2]]: 4 }
    const alla = ['matrislogik-expert', 'verbal-resonemang-expert', 'numerical-reasoning-expert']
    const i = hem({ senaste: prov('beratta', 5), bastaNiva: basta, harProfil: true, gjordaTestTyper: alla })
    expect(traningsHandling(i)).toEqual({ kind: 'interview-new', fraga: FRAGA_ORDNING[2] })
  })

  it('äldre cachat svar utan bastaNiva: senaste provets fråga räknas som gjord', () => {
    const s = prov(FRAGA_ORDNING[0], 4)
    const i: IntervjuHem = { antalProv: 1, senaste: s, smakprovToken: null, harProfil: false }
    expect(traningsHandling(i)).toEqual({ kind: 'interview-new', fraga: FRAGA_ORDNING[1] })
  })
})

describe('nastaTest', () => {
  it('går vidare i den typ där något är gjort, testtyperna i ordning', () => {
    expect(nastaTest(['matrislogik', 'matrislogik-avancerad'])).toEqual({ slug: 'matrislogik-expert', forsta: false })
    expect(nastaTest(['matrislogik-expert', 'verbal-resonemang'])).toEqual({ slug: 'verbal-resonemang-v2', forsta: false })
    expect(nastaTest(['numerical-reasoning'])).toEqual({ slug: 'numeriskt-test-v2', forsta: false })
  })

  it('null i test_type räknas som matrislogik (äldre rader)', () => {
    expect(nastaTest([null])).toEqual({ slug: 'matrislogik-avancerad', forsta: false })
  })

  it('provläget och okända typer räknas inte', () => {
    expect(nastaTest(['matrislogik-prov'])).toEqual({ slug: 'matrislogik-grund', forsta: true })
  })
})

/**
 * Bank_version 3 (plan-facit-genvag A2): versionsfälten, poolerna och att
 * version 1 och 2 inte rörs.
 *
 * - Ögonblicksbilden av urvalet för version 1 och 2 (de första fem fråge-id
 *   för 20 fasta sessioner per nivå och i provet) togs före ändringen
 *   (scripts/snapshot-bank-v2.ts) och ska vara oförändrad.
 * - Valbara i version 2: 89, 80 och 83, i samma ordning som förut.
 * - Version 3: inga frågor med pensionerad_fran 3, aldrig facit lika rutan
 *   uppe till vänster utanför latin-antal och latin-form, och när V3-filerna
 *   är påfyllda minst 80 per nivå, alla elva familjer i grund och avancerad
 *   och minst sex på expert.
 */
import { describe, expect, it } from 'vitest'
import urvalV2 from './fixtures/urval-v2.json'
import {
  ALLA_GRUND,
  ALLA_AVANCERAD,
  ALLA_EXPERT,
  BANK_VERSION,
  VALBARA_GRUND,
  VALBARA_AVANCERAD,
  VALBARA_EXPERT,
  bankVersion,
  poolFor,
  valbarI,
  selectQuestionsForSession,
  selectAvanceradQuestionsForSession,
  selectExpertQuestionsForSession,
  type Versionsfalt,
} from '../selectQuestions.v7'
import { selectProvQuestionsForSession } from '../selectProv.v7'
import { medBankversion } from '../fragor.server'
import { percentilUnderlag, underlagsVersion } from '../percentilUnderlag'
import { TRANINGSBANK, hittaTraningsfraga } from '@/lib/traning/bank.server'
import { FAMILJER } from '../familjer'

type Q = { id: string; family?: string; options: unknown[]; correctAnswer: number; grid: unknown[][] } & Versionsfalt
const stable = (v: unknown): string =>
  Array.isArray(v) ? '[' + v.map(stable).join(',') + ']' : v && typeof v === 'object' ? '{' + Object.keys(v as object).sort().map((k) => `${k}:${stable((v as Record<string, unknown>)[k])}`).join(',') + '}' : String(v)

describe('version 1 och 2 är oförändrade', () => {
  const urval: Record<string, (s: string, v: 1 | 2) => string[]> = {
    grund: (s, v) => selectQuestionsForSession(s, 15, v).slice(0, 5).map((q) => q.id),
    avancerad: (s, v) => selectAvanceradQuestionsForSession(s, 15, v).slice(0, 5).map((q) => q.id),
    expert: (s, v) => selectExpertQuestionsForSession(s, 15, v).slice(0, 5).map((q) => q.id),
    prov: (s, v) => selectProvQuestionsForSession(s, v).slice(0, 5).map((q) => q.id),
  }
  it('ögonblicksbilden av urvalet håller för 20 sessioner per nivå och i provet', () => {
    const fixtur = urvalV2 as Record<string, Record<string, string[]>>
    for (const [nyckel, perSession] of Object.entries(fixtur)) {
      const [v, namn] = nyckel.split(':')
      for (const [s, ids] of Object.entries(perSession)) {
        expect(urval[namn](s, Number(v.slice(1)) as 1 | 2), `${nyckel} ${s}`).toEqual(ids)
      }
    }
  })

  it('valbara i version 2: 89, 80 och 83', () => {
    expect([VALBARA_GRUND.length, VALBARA_AVANCERAD.length, VALBARA_EXPERT.length]).toEqual([89, 80, 83])
  })
})

describe('versionsfälten', () => {
  it('valbarI följer fran_version och pensionerad_fran', () => {
    expect(valbarI({}, 2)).toBe(true)
    expect(valbarI({ pensionerad: true }, 2)).toBe(false)
    expect(valbarI({ fran_version: 3 }, 2)).toBe(false)
    expect(valbarI({ fran_version: 3 }, 3)).toBe(true)
    expect(valbarI({ pensionerad_fran: 3 }, 2)).toBe(true)
    expect(valbarI({ pensionerad_fran: 3 }, 3)).toBe(false)
  })

  it('bankVersion läser 1, 2 och 3 ur meta', () => {
    expect(bankVersion(null)).toBe(1)
    expect(bankVersion({ bank_version: 2 })).toBe(2)
    expect(bankVersion({ bank_version: 3 })).toBe(3)
    expect(underlagsVersion({ bank_version: 3 })).toBe(3)
    expect(percentilUnderlag('matrislogik-expert', { alternativ_blandade: true, bank_version: 3 })).toEqual({ matris: true, version: 3, nyckel: 'matrislogik-expert:v3' })
  })

  it('percentilen jämför version 3 bara med version 3', () => {
    const anrop: string[] = []
    const fraga = { eq: (k: string, v: string) => { anrop.push(`eq ${k} ${v}`); return fraga }, is: (k: string, v: null) => { anrop.push(`is ${k} ${v}`); return fraga } }
    medBankversion(fraga, 3)
    medBankversion(fraga, 2)
    medBankversion(fraga, 1)
    expect(anrop).toEqual(['eq meta->>bank_version 3', 'eq meta->>bank_version 2', 'is meta->>bank_version null'])
  })

  it('157 frågor bär pensionerad_fran 3, och ingen ny fråga saknar fran_version', () => {
    const alla = [...ALLA_GRUND, ...ALLA_AVANCERAD, ...ALLA_EXPERT] as unknown as Q[]
    expect(alla.filter((q) => q.pensionerad_fran === 3)).toHaveLength(157)
    for (const q of alla) if (q.fran_version !== undefined) expect(q.fran_version, q.id).toBe(3)
  })
})

describe('version 3', () => {
  const pool3 = { grund: poolFor('grund', 3), avancerad: poolFor('avancerad', 3), expert: poolFor('expert', 3) } as unknown as Record<string, Q[]>
  const pafylld = Object.values(pool3).every((p) => p.length >= 80)

  it('ingen fråga med pensionerad_fran 3 i version 3', () => {
    for (const p of Object.values(pool3)) expect(p.filter((q) => q.pensionerad_fran === 3)).toEqual([])
  })

  it('ingen fråga utanför latin-antal och latin-form har facit lika rutan uppe till vänster', () => {
    for (const p of Object.values(pool3)) {
      const ruta0 = p.filter((q) => !['latin-antal', 'latin-form'].includes(q.family ?? '') && stable(q.options[q.correctAnswer]) === stable(q.grid[0][0]))
      expect(ruta0.map((q) => q.id)).toEqual([])
    }
  })

  it.runIf(pafylld)('minst 80 per nivå, alla elva familjer i grund och avancerad, minst sex på expert', () => {
    const familjer = (p: Q[]) => new Set(p.map((q) => q.family))
    expect(familjer(pool3.grund).size).toBe(FAMILJER.length)
    expect(familjer(pool3.avancerad).size).toBe(FAMILJER.length)
    expect(familjer(pool3.expert).size).toBeGreaterThanOrEqual(6)
    expect(pool3.expert.filter((q) => (q as unknown as { band?: string }).band === 'plus').length).toBeGreaterThanOrEqual(40)
  })

  it('TRANINGSBANK är bankversionens valbara frågor, och gamla id hittas fortfarande', () => {
    const bank = TRANINGSBANK as unknown as Q[]
    expect(bank.every((q) => valbarI(q, BANK_VERSION))).toBe(true)
    const pensionerad = ([...ALLA_GRUND] as unknown as Q[]).find((q) => q.pensionerad_fran === 3)!
    expect(hittaTraningsfraga(pensionerad.id)?.id).toBe(pensionerad.id)
    if (BANK_VERSION === 3) expect(bank.some((q) => q.pensionerad_fran === 3)).toBe(false)
  })
})

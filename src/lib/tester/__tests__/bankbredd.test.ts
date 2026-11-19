// @vitest-environment node
/**
 * Vaktar talen i bankbredd.ts mot bankerna (docs/design/bankbredd-2026-11-19.md
 * avsnitt 2.2). Varje typ räknas med exakt den funktion och version som
 * urvalet använder. Växer eller krymper en bank faller testet: uppdatera då
 * BANK_PER_TYP, så följer elementet och all copy som läser BANK_TEXT med.
 */
import { describe, expect, it } from 'vitest'
import { BANK_MAX, BANK_PER_TYP, BANK_TEXT, BANK_TOTAL, BANK_TYPER, BANK_VISAT, bankTal, type BankTyp } from '../bankbredd'
import { TEST_TYPER } from '@/components/illustrations/TestGlyfer'
import {
  ALLA_AVANCERAD,
  ALLA_EXPERT,
  ALLA_GRUND,
  TRANINGSVERSION,
  valbarI,
  type Versionsfalt,
} from '@/lib/logicTestV7/selectQuestions.v7'
import { TRANINGSBANK } from '@/lib/traning/bank.server'
import { poolFor as figurPool, SERIE_VERSION } from '@/lib/figurserierV1/select'
import { poolFor as deduktivPool, DEDUKTIV_VERSION } from '@/lib/deduktivV1/select'
import { poolFor as talseriePool } from '@/lib/talserierV1/select'
import { poolFor as spatialPool } from '@/lib/spatialV1/select'
import { poolFor as ordPool } from '@/lib/ordforradV1/select'
import { passPool } from '@/lib/tester/pass-bank.server'

const NIVAER = ['grund', 'avancerad', 'expert'] as const
const summa = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

/** Matris: TRANINGSVERSION ur ALLA_*, inte poolFor (som bara känner version 1 till 3). */
const matrisValbara = (pool: readonly unknown[]) => pool.filter((q) => valbarI(q as Versionsfalt, TRANINGSVERSION)).length

function rakna(): Record<BankTyp, number> {
  return {
    matris: matrisValbara(ALLA_GRUND) + matrisValbara(ALLA_AVANCERAD) + matrisValbara(ALLA_EXPERT),
    figurer: summa(NIVAER.map((n) => figurPool(n, SERIE_VERSION).length)),
    deduktiv: summa(NIVAER.map((n) => deduktivPool(n, DEDUKTIV_VERSION).length)),
    talserier: summa(NIVAER.map((n) => talseriePool(n).length)),
    spatial: summa(NIVAER.map((n) => spatialPool(n).length)),
    ordforrad: summa(NIVAER.map((n) => ordPool(n).length)),
    // Verbalt: påståendena i texterna. Ingen expertnivå i passet.
    verbalt: summa(
      (['grund', 'avancerad'] as const).map((n) =>
        summa((passPool('verbal', n) as readonly { id: string; statements: unknown[] }[]).map((t) => t.statements.length)),
      ),
    ),
    // Numeriskt: frågorna i underlagen. Experten finns bara i provet och räknas inte (konservativt).
    numeriskt: summa(
      (['grund', 'avancerad'] as const).map((n) =>
        summa((passPool('numerisk', n) as readonly { id: string; questions: unknown[] }[]).map((u) => u.questions.length)),
      ),
    ),
  }
}

describe('bankbredd', () => {
  const raknat = rakna()

  it('matrisens summa är träningsbanken', () => {
    expect(raknat.matris).toBe(TRANINGSBANK.length)
  })

  it.each(BANK_TYPER.map((t) => [t]))('%s: det inskrivna talet stämmer mot banken', (typ) => {
    expect(BANK_PER_TYP[typ as BankTyp], `uppdatera BANK_PER_TYP.${typ} i src/lib/tester/bankbredd.ts`).toBe(raknat[typ as BankTyp])
  })

  it('åtta typer i Nio-radens ordning, utan personlighetstestet', () => {
    expect(BANK_TYPER).toEqual(TEST_TYPER.filter((t) => t !== 'personlighet'))
    expect(Object.keys(BANK_PER_TYP).sort()).toEqual([...BANK_TYPER].sort())
  })

  it('totalen, toppen och det visade talet', () => {
    expect(BANK_TOTAL).toBe(summa(Object.values(raknat)))
    expect(BANK_MAX).toBe(Math.max(...Object.values(raknat)))
    expect(BANK_VISAT % 100).toBe(0)
    expect(BANK_VISAT).toBeLessThan(BANK_TOTAL)
    expect(BANK_TOTAL - BANK_VISAT).toBeLessThanOrEqual(100)
  })

  it('texten', () => {
    expect(bankTal(3500)).toBe('3 500')
    expect(bankTal(288)).toBe('288')
    expect(BANK_TEXT).toBe(`över ${bankTal(BANK_VISAT)} uppgifter`)
  })
})

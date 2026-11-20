// @vitest-environment node
/**
 * Strukturerat facit i de verbala bankerna (omgång 3, del B): `stod` och
 * `narmast` står ordagrant i texten, börjar och slutar vid en menings- eller
 * satsgräns och rymmer en mening per sträng. "Går inte att avgöra" har tom
 * stod. Kontrollerna ligger i scripts/lib/facit-kontroll.mjs.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
// @ts-ignore ren JavaScript
import { kollaStod, kollaCitat } from '../../../../scripts/lib/facit-kontroll.mjs'

const FILER = [
  'verbalTestV1/questionBank.json',
  'verbalTestV1/underlagParti02.json',
  'verbalTestV1/underlagParti04.json',
  'verbalTestV2/questionBank.json',
  'verbalTestV2/underlagParti02.json',
  'verbalTestV2/underlagParti03.json',
  'verbalTestV2/underlagParti04.json',
  'verbalTestExpert/questionBank.json',
  'verbalTestExpert/underlagParti03.json',
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type P = any
const banker = FILER.map((f) => JSON.parse(readFileSync(`src/lib/${f}`, 'utf8')) as P[])

describe('verbalt facit, stod', () => {
  it('varje stod och narmast stämmer mot texten och facit', () => {
    for (const b of banker)
      for (const p of b) {
        ;(p.statements ?? []).forEach((s: P, i: number) => expect(kollaStod(p.text, s, s.correctAnswer), `${p.id}#${i}`).toEqual([]))
        for (const q of p.questions ?? []) expect(kollaStod(p.contextText, q, 'mc'), q.id).toEqual([])
      }
  })

  it('442 av 448 påståenden och frågor har stod (sex hoppade: fem med tveksamt facit, en utan avgörande mening)', () => {
    let n = 0
    for (const b of banker) for (const p of b) for (const x of [...(p.statements ?? []), ...(p.questions ?? [])]) if (x.stod) n++
    expect(n).toBe(442)
  })

  it('en mening som inte står ordagrant, två meningar i en sträng och ett halvt citat fälls', () => {
    const text = 'Företaget växer snabbt i år. Det anställer tio personer i år, och fler nästa år.'
    expect(kollaCitat(text, 'Företaget växer snabbt i år.')).toEqual([])
    expect(kollaCitat(text, 'Det anställer tio personer i år')).toEqual([])
    expect(kollaCitat(text, 'Företaget växer långsamt i år.').join()).toMatch(/ordagrant/)
    expect(kollaCitat(text, 'Företaget växer snabbt i år. Det anställer tio personer i år, och fler nästa år.').join()).toMatch(/mer än en mening/)
    expect(kollaCitat(text, 'anställer tio personer').join()).toMatch(/mitt i en sats/)
    expect(kollaStod(text, { stod: ['Företaget växer snabbt i år.'] }, 'cannot_say').join()).toMatch(/tom stod/)
    expect(kollaStod(text, { stod: [] }, 'true').join()).toMatch(/stod är tom/)
  })
})

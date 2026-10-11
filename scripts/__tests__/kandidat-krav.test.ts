import { describe, expect, it } from 'vitest'
import { facitRuta0, kandidatKrav, lasordningsCykel, oberoende, kontrollera } from '../lib/matris/kontroll.mjs'

const pil = (angle: number) => ({ kind: 'vector', angle, length: 'long', head: 'filled' })

// Pilen vrider sig 45 grader per ruta i läsordning: efter åtta steg är den tillbaka.
function cykel(id: string) {
  const c = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => pil(i * 45))
  return {
    id, title: 'Pilen vrider sig', rule: 'Pilen vrider sig 45 grader medurs för varje ruta. Läs rutorna som en lång rad, uppifrån och ner.',
    difficulty: 3, family: 'vridning',
    grid: [c.slice(0, 3), c.slice(3, 6), [c[6], c[7], null]],
    options: [pil(0), pil(90), pil(135), pil(180), pil(225), pil(270)], correctAnswer: 0,
  }
}

describe('kraven för nya kandidater (granskningen av parti 01, 2.6 punkt 7)', () => {
  it('facit lika med rutan uppe till vänster fälls på alla nivåer', () => {
    const q = cykel('v7g-test-01')
    expect(facitRuta0(q)).toBe(true)
    expect(kandidatKrav(q)).toEqual(['v7g-test-01: facit är identiskt med rutan uppe till vänster'])
  })

  it('ren läsordningsrörelse fälls på avancerad och expert, inte på grund', () => {
    const e = cykel('v7e-test-01')
    expect(lasordningsCykel(e)).toEqual({ ren: true, slutna: ['vinkel'] })
    expect(kandidatKrav(e)).toContain('v7e-test-01: ren rörelse i läsordning som sluter sig efter åtta steg (vinkel), genereras bara för grund')
    expect(kandidatKrav(cykel('v7g-test-02')).some((x: string) => /läsordning/.test(x))).toBe(false)
  })

  it('kontrollera tar med kraven bara med kandidat', () => {
    const q = cykel('v7a-test-01')
    expect(kontrollera(q, { strikt: false }).some((x: string) => /rutan uppe till vänster/.test(x))).toBe(false)
    expect(kontrollera(q, { strikt: false, kandidat: true }).some((x: string) => /rutan uppe till vänster/.test(x))).toBe(true)
  })

  it('mönsterrotation (grupp A) flaggas inte av oberoendet, men två rörelser gör det', async () => {
    const { readFileSync } = await import('node:fs')
    const bank = [
      ...JSON.parse(readFileSync('src/lib/logicTestV7/questionBankGrund3c.v7.json', 'utf8')),
      ...JSON.parse(readFileSync('src/lib/logicTestV7/questionBankExpert3c.v7.json', 'utf8')),
    ]
    const id = (x: string) => bank.find((q: { id: string }) => q.id === x)
    expect(oberoende(id('v7g-3c-rot-01'))).toEqual([])
    expect(oberoende(id('v7e-3c-rot-05'))).toEqual([])
    expect(oberoende(id('v7e-3c-tva-01')).length).toBeGreaterThan(0)
  })
})

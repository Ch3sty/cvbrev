import { describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { selectPassagesForSession as numGrund } from '@/lib/numericalTest/selectPassages'
import { selectPassagesForSession as numAvancerad } from '@/lib/numericalTestV2/selectPassages'
import { selectPassagesForSession as numExpert } from '@/lib/numericalTestExpert/selectPassages'
import { selectProvPassagesForSession as numProv } from '@/lib/numericalTestProv/selectProv'
import { selectPassagesForSession as verbalExpert } from '@/lib/verbalTestExpert/selectPassages'

type Q = { id: string; correctAnswerId: string; options: { id: string; isCorrect?: boolean }[] }
type P = { questions: Q[] }

const URVAL: Record<string, (id: string) => P[]> = {
  'numeriskt grund': (id) => numGrund(id) as unknown as P[],
  'numeriskt avancerad': (id) => numAvancerad(id) as unknown as P[],
  'numeriskt expert': (id) => numExpert(id) as unknown as P[],
  'numeriskt prov': (id) => numProv(id) as unknown as P[],
  'verbalt expert': (id) => verbalExpert(id) as unknown as P[],
}

describe.each(Object.entries(URVAL))('%s', (_namn, urval) => {
  it('samma session ger samma ordning, och alternativen är desamma (bara omflyttade)', () => {
    const id = randomUUID()
    const a = urval(id)
    expect(urval(id)).toEqual(a)
    for (const p of a) {
      for (const q of p.questions) {
        expect(q.options.map((o) => o.id).sort()).toEqual(['a', 'b', 'c', 'd'].slice(0, q.options.length))
        // Facit pekar på id, inte position, så rättningen påverkas inte.
        expect(q.options.find((o) => o.id === q.correctAnswerId)).toBeTruthy()
      }
    }
  })

  it('rätt svar fördelas ungefär jämnt över positionerna', () => {
    const pos = [0, 0, 0, 0]
    let total = 0
    for (let i = 0; i < 400; i++) {
      for (const p of urval(randomUUID())) {
        for (const q of p.questions) {
          pos[q.options.findIndex((o) => o.id === q.correctAnswerId)] += 1
          total += 1
        }
      }
    }
    for (const n of pos) {
      expect(n / total).toBeGreaterThan(0.25 - 0.03)
      expect(n / total).toBeLessThan(0.25 + 0.03)
    }
  })
})

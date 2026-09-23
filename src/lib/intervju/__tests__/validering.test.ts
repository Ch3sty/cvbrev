/**
 * Serverns kontroll av modellsvaret i intervjuprovet
 * (docs/design/intervjuprov-spec-2026-09-23.md, avsnitt 5 och 7).
 */

import { describe, expect, it } from 'vitest'
import {
  klippNiva,
  kontrolleraSvarslangd,
  OgiltigBedomning,
  omskrivetRader,
  tolkaBedomning,
} from '../validering'

const OMSKRIVET = 'Jag tog fram statistik på hur lång tid en plockrunda tog. '.repeat(8)

function giltigt(extra: Record<string, unknown> = {}) {
  return {
    relevant: true,
    level: 3,
    summary: 'Styrkan har ett bevis, men svagheten stannar vid en bekännelse.',
    works: 'Du namnger styrkan och bevisar den med tre projekt.',
    missing: 'Svagheten har ingen plan.',
    missingKind: 'planen',
    full: {
      points: [
        { title: 'Planen', text: 'Beskriv vad du gör åt svagheten.' },
        { title: 'Exemplet', text: 'Ge ett exempel på när den märkts.' },
      ],
    },
    improvedAnswer: OMSKRIVET,
    improvedWhy: 'Vi lade till planen.',
    ...extra,
  }
}

describe('tolkaBedomning', () => {
  it('släpper igenom ett giltigt svar och sätter etiketten ur nivån', () => {
    const r = tolkaBedomning(giltigt())
    expect(r.relevant).toBe(true)
    if (!r.relevant) return
    expect(r.level).toBe(3)
    expect(r.levelLabel).toBe('Godkänt')
    expect(r.full.points).toHaveLength(2)
  })

  it('sätter alla fem etiketter ur talet, aldrig ur modellen', () => {
    const etiketter = [1, 2, 3, 4, 5].map((level) => {
      const r = tolkaBedomning(giltigt({ level, levelLabel: 'Fantastiskt' }))
      return r.relevant ? r.levelLabel : null
    })
    expect(etiketter).toEqual(['Otillräckligt', 'Tunt', 'Godkänt', 'Starkt', 'Övertygande'])
  })

  it('klipper nivån till 1 till 5', () => {
    expect(klippNiva(0)).toBe(1)
    expect(klippNiva(9)).toBe(5)
    expect(klippNiva(3.6)).toBe(4)
    expect(klippNiva('2')).toBe(2)
    expect(klippNiva('nonsens')).toBe(1)
    const r = tolkaBedomning(giltigt({ level: 12 }))
    expect(r.relevant && r.level).toBe(5)
  })

  it('returnerar bara relevant=false för ett irrelevant svar, inget annat', () => {
    expect(tolkaBedomning({ relevant: false, level: 4, summary: 'x' })).toEqual({ relevant: false })
  })

  it('kastar när det omskrivna svaret är kortare än 300 tecken', () => {
    expect(() => tolkaBedomning(giltigt({ improvedAnswer: 'För kort.' }))).toThrow(OgiltigBedomning)
  })

  it('kastar när punkterna saknas eller är tomma', () => {
    expect(() => tolkaBedomning(giltigt({ full: { points: [] } }))).toThrow(OgiltigBedomning)
    expect(() => tolkaBedomning(giltigt({ full: {} }))).toThrow(OgiltigBedomning)
    expect(() =>
      tolkaBedomning(giltigt({ full: { points: [{ title: '', text: '' }] } }))
    ).toThrow(OgiltigBedomning)
  })

  it('kastar när summary, works eller missing är tomma', () => {
    expect(() => tolkaBedomning(giltigt({ summary: '  ' }))).toThrow(OgiltigBedomning)
    expect(() => tolkaBedomning(giltigt({ works: undefined }))).toThrow(OgiltigBedomning)
    expect(() => tolkaBedomning(giltigt({ missing: 3 }))).toThrow(OgiltigBedomning)
  })

  it('kastar på något som inte är ett objekt', () => {
    expect(() => tolkaBedomning(null)).toThrow(OgiltigBedomning)
    expect(() => tolkaBedomning('text')).toThrow(OgiltigBedomning)
  })

  it('faller tillbaka på exemplet när missingKind är okänt', () => {
    const r = tolkaBedomning(giltigt({ missingKind: 'motivationen' }))
    expect(r.relevant && r.missingKind).toBe('exemplet')
  })

  it('byter talstreck mot komma i allt som visas', () => {
    const r = tolkaBedomning(giltigt({ summary: 'Styrkan håller — svagheten gör det inte.' }))
    expect(r.relevant && r.summary).toBe('Styrkan håller, svagheten gör det inte.')
  })

  it('tar högst åtta punkter', () => {
    const points = Array.from({ length: 12 }, (_, i) => ({ title: `P${i}`, text: 'Text.' }))
    const r = tolkaBedomning(giltigt({ full: { points } }))
    expect(r.relevant && r.full.points.length).toBe(8)
  })
})

describe('omskrivetRader', () => {
  it('är en rad per 70 tecken, mellan fyra och åtta', () => {
    expect(omskrivetRader('x'.repeat(100))).toBe(4)
    expect(omskrivetRader('x'.repeat(420))).toBe(6)
    expect(omskrivetRader('x'.repeat(2000))).toBe(8)
  })
})

describe('kontrolleraSvarslangd', () => {
  it('kräver 200 till 1 200 tecken efter trim', () => {
    expect(kontrolleraSvarslangd('x'.repeat(199))).toBe('too_short')
    expect(kontrolleraSvarslangd('  ' + 'x'.repeat(199) + '  ')).toBe('too_short')
    expect(kontrolleraSvarslangd('x'.repeat(200))).toBeNull()
    expect(kontrolleraSvarslangd('x'.repeat(1200))).toBeNull()
    expect(kontrolleraSvarslangd('x'.repeat(1201))).toBe('too_long')
  })
})

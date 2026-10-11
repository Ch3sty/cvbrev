import { describe, expect, it } from 'vitest'
import { analysera, plusFel } from '../lib/matris/distraktorer.mjs'
import { godkandPlus, hjalp, PAR } from './fixtures-matris.mjs'

const ray = (s: number[]) => ({ kind: 'ray', rays: s })
const [a, b] = PAR[2]
const C = hjalp.opv('xor', a, b)
const fel = (q: ReturnType<typeof godkandPlus>) => plusFel(analysera(q))

describe('distraktorkontrollen, bandet svår plus', () => {
  it('en fråga som klarar allt', () => {
    const q = godkandPlus()
    const an = analysera(q)
    expect(an.R).toEqual(['op', 'vrid'])
    expect(an.naraMiss).toBe(5)
    expect(fel(q)).toEqual([])
  })
  it('1: färre än tre nära miss', () => {
    const q = godkandPlus()
    q.options[3] = ray(hjalp.rot(a, 1))
    q.options[4] = ray(hjalp.rot(b, 1))
    q.options[5] = ray([...C, 7].filter((x, i, arr) => arr.indexOf(x) === i).sort())
    expect(fel(q).some((x: string) => /bara 2 nära miss/.test(x))).toBe(true)
  })
  it('2: en regel bryts aldrig av en nära miss', () => {
    const q = godkandPlus()
    q.options[4] = ray(hjalp.rot(C, 2))
    q.options[5] = ray(hjalp.rot(C, 6))
    expect(fel(q)).toContain('fixtur-godkand: ingen nära miss bryter op')
  })
  it('3: ett alternativ stämmer på ingen regel', () => {
    const q = godkandPlus()
    q.options[5] = ray(hjalp.rot(a, 1))
    expect(fel(q)).toContain('fixtur-godkand: alternativ F stämmer på ingen regel')
  })
  it('4: fler än en kopia av en synlig ruta', () => {
    const q = godkandPlus()
    q.options[4] = q.grid[0][0]
    q.options[5] = q.grid[1][1]
    expect(fel(q)).toContain('fixtur-godkand: 2 alternativ är kopior av synliga rutor, högst en får vara det')
  })
  it('5: två distraktorer bryter samma regel på samma sätt', () => {
    const q = godkandPlus()
    q.options[5] = q.options[4]
    expect(fel(q)).toContain('fixtur-godkand: alternativ E och F bryter samma regel på samma sätt')
  })
  it('6: tom figur', () => {
    const q = godkandPlus()
    q.options[5] = ray([])
    expect(fel(q)).toContain('fixtur-godkand: alternativ F är en tom figur')
  })
})

/**
 * Tankstreck i frysta verbala titlar (beställning omgång 2, C3): bankfilerna
 * rörs inte, men inget tankstreck når det användaren ser.
 */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { visningstitel } from '../titel'
import bankV1 from '@/lib/verbalTestV1/questionBank.json'
import bankV2 from '@/lib/verbalTestV2/questionBank.json'
import VerbalPassageDisplay from '@/components/tests/verbal-shared/PassageDisplay'
import { PassageDisplay as VerbalV1PassageDisplay } from '@/components/tests/verbalV1/PassageDisplay'

const TANKSTRECK = /[—–]/

describe('visningstitel', () => {
  it('tar bort PASSAGE, numret och tankstrecket', () => {
    expect(visningstitel('PASSAGE 1 — Sommaranställningar')).toBe('Sommaranställningar')
    expect(visningstitel('PASSAGE 12 – Mental hälsa')).toBe('Mental hälsa')
    expect(visningstitel('Passage 3: Distansarbete')).toBe('Distansarbete')
    expect(visningstitel('PASSAGE 4 - Lön')).toBe('Lön')
  })
  it('rör inte vanliga titlar och byter tankstreck inne i titeln mot komma', () => {
    expect(visningstitel('Budget 2025')).toBe('Budget 2025')
    expect(visningstitel('Hemtjänstens schema')).toBe('Hemtjänstens schema')
    expect(visningstitel('Lön — och förmåner')).toBe('Lön, och förmåner')
    expect(visningstitel(null)).toBe('')
  })
  it('ingen av de 48 frysta titlarna har kvar tankstreck eller PASSAGE', () => {
    const titlar = [...bankV1, ...bankV2].map((p) => p.title)
    expect(titlar.filter((t) => TANKSTRECK.test(t)).length).toBe(48)
    for (const t of titlar) {
      const v = visningstitel(t)
      expect(v).not.toMatch(TANKSTRECK)
      expect(v).not.toMatch(/passage/i)
      expect(v.length).toBeGreaterThan(2)
    }
  })
})

describe('tankstreck i DOM', () => {
  it('textpanelerna ritar titeln utan tankstreck', () => {
    const p = bankV2[0]
    const a = render(<VerbalPassageDisplay title={p.title} topic={p.topic} text={p.text} difficulty={2} passageNumber={1} />)
    expect(a.container.textContent ?? '').not.toMatch(TANKSTRECK)
    a.unmount()
    const q = bankV1[0]
    const b = render(
      <VerbalV1PassageDisplay title={q.title} text={q.text} passageNumber={1} totalPassages={10} difficulty={1} topic={q.topic} />
    )
    expect(b.container.textContent ?? '').not.toMatch(TANKSTRECK)
  })
})

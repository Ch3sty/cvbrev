import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'

vi.mock('@/components/rum/Topprad', () => ({ default: () => <div data-topprad /> }))
vi.mock('@/components/traning/HemKlient', () => ({
  LasChip: ({ text, label }: { text: string; label?: string }) => (
    <button type="button" aria-label={label} data-laschip>
      {text}
    </button>
  ),
}))

import UtvecklingVy from '../UtvecklingVy'
import { PLAN_ALVA, data, punkt } from './testdata'

const grupp = (namn: string) => within(screen.getAllByRole('group', { name: namn })[0])

describe('UtvecklingVy, omgång 3 (skissens Utveckling, -fa och -ny)', () => {
  it('en testtyp i taget: alla typer som val, dagens typ förvald, rubriken från och till', () => {
    const { container } = render(<UtvecklingVy data={data()} standardTyp="matris" />)
    const typ = grupp('Testtyp')
    expect(typ.getAllByRole('button').length).toBe(8)
    expect(container.querySelector('[data-typ-val="matris"]')?.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('heading', { level: 2, name: /Figurer och mönster: från/ })).toBeTruthy()
  })

  it('perioden: 4 veckor förvalt, Planen bara med plan', () => {
    render(<UtvecklingVy data={data()} standardTyp="matris" />)
    expect(grupp('Period').getAllByRole('button').map((b) => b.textContent)).toEqual(['4 veckor', 'Allt'])
    expect(grupp('Period').getByRole('button', { name: '4 veckor' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('med plan: Planen finns som period', () => {
    render(<UtvecklingVy data={data({ plan: PLAN_ALVA, provdag: '2026-11-25', typer: data().typer.map((t) => ({ ...t, ingarIPlan: t.id === 'matris' })) })} />)
    expect(grupp('Period').getByRole('button', { name: 'Planen' })).toBeTruthy()
  })

  it('ett val av typ byter kurvan och sätter ?typ=', () => {
    const spion = vi.spyOn(window.history, 'replaceState')
    const { container } = render(<UtvecklingVy data={data()} standardTyp="matris" />)
    fireEvent.click(container.querySelector('[data-typ-val="deduktiv"]')!)
    expect(container.querySelector('[data-typ-val="deduktiv"]')?.getAttribute('aria-pressed')).toBe('true')
    expect(String(spion.mock.calls.at(-1)?.[2])).toContain('typ=deduktiv')
    spion.mockRestore()
  })

  it('en punkt i grafen väljer den och visar detaljen', () => {
    const { container } = render(<UtvecklingVy data={data()} standardTyp="matris" />)
    const p = container.querySelector('[data-graf="dator"] [data-punkt="matris-2026-11-17-trana"]')!
    fireEvent.click(p)
    expect(container.querySelector('[data-detalj="matris-2026-11-17-trana"]')).not.toBeNull()
  })

  it('historiken: nyast först, varje rad öppnar uppgifterna', () => {
    const { container } = render(<UtvecklingVy data={data()} standardTyp="matris" />)
    const rader = [...container.querySelectorAll('a[data-hist]')]
    expect(rader[0].getAttribute('data-hist')).toBe('matris-2026-11-17-trana')
    expect(rader[0].getAttribute('href')).toContain('/dashboard/tester/pass')
  })

  it('gratis: låsraden för historiken', () => {
    const { container } = render(<UtvecklingVy data={data({ historikLast: true })} standardTyp="matris" />)
    expect(container.querySelector('[data-historik-las]')).not.toBeNull()
  })

  it('ny användare: inte mätt än som lucka, exempelrader i historiken, Nivåkoll per typ', () => {
    const { container } = render(<UtvecklingVy data={data({ punkter: [], typer: data().typer.map((t) => ({ ...t, niva: { status: 'omatt', niva: null, osakerhet: 0.6, tak: 7.5 } })) })} standardTyp="matris" />)
    expect(screen.getByRole('heading', { level: 2, name: /här ritas din kurva/ })).toBeTruthy()
    expect(container.querySelectorAll('.t3-lucka').length).toBeGreaterThan(0)
    expect(container.textContent).toContain('Så ser en rad ut')
    expect(container.textContent).toContain('börja här')
  })

  it('en punkt: punkt två ger en riktning', () => {
    const { container } = render(<UtvecklingVy data={data({ punkter: [punkt('matris', '2026-11-17', 'nivakoll', 2.6)] })} standardTyp="matris" />)
    expect(container.textContent).toContain('vid första mätningen')
    expect(container.textContent).toContain('punkt två ger en riktning')
  })

  it('inget synligt "pass" i vyn', () => {
    const { container } = render(<UtvecklingVy data={data({ punkter: [...data().punkter, punkt('talserie', '2026-11-18', 'trana', null)] })} />)
    expect(container.textContent ?? '').not.toMatch(/\bpass\b/i)
  })
})

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

const chips = (namn: string) => within(screen.getByRole('group', { name: namn }))

describe('UtvecklingVy', () => {
  it('chips: Alla och typerna med data, planens först; period utan Planen när ingen plan finns', () => {
    render(<UtvecklingVy data={data()} />)
    const typ = chips('Testtyp i grafen')
    expect(typ.getAllByRole('button').map((b) => b.textContent)).toEqual(['Alla', 'Figurer och mönster', 'Deduktiv slutledning'])
    expect(chips('Period').getAllByRole('button').map((b) => b.textContent)).toEqual(['4 veckor', 'Allt'])
    expect(chips('Period').getByRole('button', { name: 'Allt' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('med plan: Planen finns som period, Allt förvalt som i skissen', () => {
    render(<UtvecklingVy data={data({ plan: PLAN_ALVA, provdag: '2026-11-25', typer: data().typer.map((t) => ({ ...t, ingarIPlan: t.id === 'matris' })) })} />)
    expect(chips('Period').getByRole('button', { name: 'Planen' }).getAttribute('aria-pressed')).toBe('false')
    expect(chips('Period').getByRole('button', { name: 'Allt' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Alva Logic')
    expect(screen.getAllByText('Ingår i Alva Logic').length).toBeGreaterThan(0)
  })

  it('en rad i Nivå per testtyp väljer typen i grafen och i resultaten', () => {
    const { container } = render(<UtvecklingVy data={data()} />)
    const resultat = () => container.querySelector('[data-sektion="resultat"]')!
    // Alla: nivåkoller och prov, inga träningar.
    expect(resultat().textContent).not.toContain('Träning')
    const rad = container.querySelector('[data-sektion="niva-per-typ"] [data-typ="matris"]') as HTMLButtonElement
    fireEvent.click(rad)
    expect(rad.getAttribute('aria-pressed')).toBe('true')
    expect(chips('Testtyp i grafen').getByRole('button', { name: 'Figurer och mönster' }).getAttribute('aria-pressed')).toBe('true')
    // En typ: även träningarna, och bara den typen.
    expect(resultat().textContent).toContain('Träning')
    expect(resultat().querySelector('[data-grupp="deduktiv"]')).toBeNull()
    // Ett tryck till går tillbaka till Alla.
    fireEvent.click(rad)
    expect(chips('Testtyp i grafen').getByRole('button', { name: 'Alla' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('en resultatrad väljer punkten och visar detaljen', () => {
    const { container } = render(<UtvecklingVy data={data()} />)
    const forsta = container.querySelector('[data-sektion="resultat"] [data-rad]') as HTMLButtonElement
    fireEvent.click(forsta)
    const detalj = container.querySelector('#utv-detalj')!
    expect(detalj.getAttribute('aria-live')).toBe('polite')
    expect(detalj.querySelector('[data-detalj]')?.getAttribute('data-detalj')).toBe(forsta.getAttribute('data-rad'))
    expect(within(detalj as HTMLElement).getByRole('link').textContent).toBe('Öppna')
  })

  it('gratis: senaste punkten per typ, låsta rader för historiken', () => {
    const { container } = render(<UtvecklingVy data={data({ historikLast: true, gratis: { ...data().gratis, premium: false } })} />)
    expect(container.querySelectorAll('[data-laschip]').length).toBe(2)
    expect(screen.getByText('Hela historiken ingår i Premium')).toBeTruthy()
    expect(screen.getByText('Äldre resultat ingår i Premium')).toBeTruthy()
    // En punkt per typ i grafen (dator och mobil ritas båda).
    const dator = container.querySelector('[data-graf="dator"]')!
    expect(dator.querySelectorAll('[data-punkt]').length).toBe(2)
  })

  it('tomt läge: grafens text och kortet Vad kurvan säger med första Nivåkollen', () => {
    const { container } = render(<UtvecklingVy data={data({ punkter: [] })} />)
    expect(screen.getByText('Gör Nivåkollen i en testtyp, så får grafen sin första linje.')).toBeTruthy()
    expect(container.querySelector('[data-sidkort="utveckling"]')?.getAttribute('data-slag')).toBe('forsta')
    expect(screen.getByRole('link', { name: /Mät din nivå/ }).getAttribute('href')).toBe('/dashboard/tester/pass?typ=matning')
    // En enda kopparknapp: kortets.
    expect(container.querySelectorAll('.knapp-primar').length).toBe(1)
  })

  it('väggen utan plan: datumet, "Din utveckling" och Välj prov, kortet med nivåpanelen', () => {
    const { container } = render(<UtvecklingVy data={data()} />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Din utveckling')
    expect(container.querySelector('[data-huvud="utveckling"] [data-valj-prov]')?.getAttribute('href')).toBe('/dashboard/tester/installningar')
    expect(container.querySelector('[data-sidkort-panel="kurvan"] svg[data-nivaband]')).not.toBeNull()
    expect(container.textContent ?? '').not.toContain('—')
  })

  it('väggen med plan: samma som Hem, provets namn och banan', () => {
    const { container } = render(<UtvecklingVy data={data({ plan: PLAN_ALVA, provdag: '2026-11-25', bana: [{ dag: '2026-11-19', status: 'idag' }, { dag: '2026-11-25', status: 'prov' }] })} />)
    expect(container.querySelector('[data-huvud="utveckling"]')).not.toBeNull()
    expect(container.querySelector('[data-nedrakning]')).not.toBeNull()
    expect(container.querySelector('[data-bana]')).not.toBeNull()
    expect(container.querySelector('[data-sidkort-panel="kurvan"]')?.textContent).toContain('Mot provets nivå')
  })

  it('?typ= väljer typen vid start', () => {
    render(<UtvecklingVy data={data()} startTyp="deduktiv" />)
    expect(chips('Testtyp i grafen').getByRole('button', { name: 'Deduktiv slutledning' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('inget synligt "pass" i vyn', () => {
    const { container } = render(<UtvecklingVy data={data({ punkter: [...data().punkter, punkt('talserie', '2026-11-18', 'trana', null)] })} />)
    expect(container.textContent ?? '').not.toMatch(/\bpass\b/i)
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { fixturTester } from '@/lib/tester/v4/fixturer'
import TesterVy from '../TesterVy'

vi.mock('@/components/rum/Topprad', () => ({ default: () => <div data-topprad /> }))
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/tester/alla',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

afterEach(() => cleanup())

/** Synlig text utan SVG-etiketter, för kontrollen av ordet "pass". */
function synligText(el: HTMLElement): string {
  return el.textContent ?? ''
}

describe('TesterVy', () => {
  it('utan plan: "Alla testtyper", inga etiketter "Ingår i", Personlighet sist', () => {
    const { container } = render(<TesterVy data={fixturTester('a', 'premium')} />)
    expect(screen.getByRole('heading', { name: 'Alla testtyper' })).toBeTruthy()
    expect(container.querySelector('[data-provgrupp]')).toBeNull()
    expect(screen.queryByText(/^Ingår i /)).toBeNull()
    const kort = Array.from(container.querySelectorAll('[data-testtyp]')).map((k) => k.getAttribute('data-testtyp'))
    expect(kort[kort.length - 1]).toBe('personlighet')
    expect(kort[0]).toBe('matris')
  })

  it('omätt kort: "Nivåkoll, 8 min" står bara i nivåbandet', () => {
    const { container } = render(<TesterVy data={fixturTester('a', 'premium')} />)
    const kort = container.querySelector('[data-testtyp="figurserie"]') as HTMLElement
    expect(within(kort).queryAllByText('Nivåkoll, 8 min').length).toBe(1)
  })

  it('Alva Logic: tonad grupp "Ingår i Alva Logic · 1 del" med kortet och övningsprovet', () => {
    const { container } = render(<TesterVy data={fixturTester('b', 'premium')} />)
    const grupp = container.querySelector('[data-provgrupp]') as HTMLElement
    expect(within(grupp).getByRole('heading', { name: 'Ingår i Alva Logic · 1 del' })).toBeTruthy()
    expect(grupp.querySelector('[data-testtyp="matris"]')).not.toBeNull()
    expect(grupp.querySelector('[data-ovningsprov]')).not.toBeNull()
    expect(within(grupp).getAllByText('Ingår i Alva Logic').length).toBe(2)
    expect(screen.getByRole('heading', { name: 'Används i andra rekryteringstest, inte i Alva Logic' })).toBeTruthy()
    // Inget "Ingår i" på typer som inte ingår.
    const ovriga = container.querySelector('[data-testtyp="deduktiv"]') as HTMLElement
    expect(within(ovriga).queryByText(/Ingår i/)).toBeNull()
    // Övriga står grå, planens delar i koppar.
    expect(container.querySelector('[data-testtyp="deduktiv"] svg[data-nivaband]')?.getAttribute('data-ton')).toBe('neutral')
    expect(container.querySelector('[data-testtyp="matris"] svg[data-nivaband]')?.getAttribute('data-ton')).toBe('koppar')
  })

  it('I-provet: tre delar i gruppen', () => {
    const { container } = render(<TesterVy data={fixturTester('c', 'premium')} />)
    expect(screen.getByRole('heading', { name: 'Ingår i I-provet · 3 delar' })).toBeTruthy()
    const grupp = container.querySelector('[data-provgrupp]') as HTMLElement
    expect(grupp.querySelectorAll('[data-testtyp]').length).toBe(3)
  })

  it('gratis: Grundnivå med "1 kvar i dag", låsen i menyn och Nivåkollen "Gratis en gång"', () => {
    const { container } = render(<TesterVy data={fixturTester('a', 'gratis', { kvotAnvand: false })} startTyp="figurserie" />)
    expect(screen.getAllByText('Grundnivå · 1 kvar i dag').length).toBeGreaterThan(0)
    const meny = document.querySelector('[data-meny="figurserie"]') as HTMLElement
    expect(within(meny).getByText('Gratis en gång')).toBeTruthy()
    // Omätt typ: Träna leder till Nivåkollen först.
    expect(meny.querySelector('[data-trana] a[href]')?.textContent).toBe('Gör Nivåkollen först')
    expect(within(meny).getAllByText('Ingår i Premium').length).toBeGreaterThanOrEqual(2)
    expect(container.querySelector('[data-gratisrad="kvar"]')).not.toBeNull()
  })

  it('gratis med dagens test gjort: "I morgon" på korten och gratisraden "Det här var grundnivån"', () => {
    const { container } = render(<TesterVy data={fixturTester('a', 'gratis', { kvotAnvand: true })} />)
    expect(screen.getAllByText(/I morgon/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/1 kvar i dag/)).toBeNull()
    expect(container.querySelector('[data-gratisrad="slut"]')).not.toBeNull()
  })

  it('premium: ingen gratisrad, inga lås på korten', () => {
    const { container } = render(<TesterVy data={fixturTester('c', 'premium')} />)
    expect(container.querySelector('[data-gratisrad]')).toBeNull()
    expect(container.querySelector('[data-testtyp] [data-las]')).toBeNull()
  })

  it('inget "pass" i renderad text i något läge', () => {
    for (const lage of ['a', 'b', 'c'] as const) {
      for (const niva of ['premium', 'gratis'] as const) {
        const { unmount } = render(<TesterVy data={fixturTester(lage, niva)} startTyp="matris" />)
        expect(synligText(document.body)).not.toMatch(/\bpass(et|en)?\b/i)
        unmount()
      }
    }
  })

  it('tryck på ett kort öppnar menyn och sätter ?typ=', () => {
    const spion = vi.spyOn(window.history, 'replaceState')
    const { container } = render(<TesterVy data={fixturTester('a', 'premium')} />)
    expect(document.querySelector('[data-meny]')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /^Deduktiv slutledning: träning/ }))
    expect(document.querySelector('[data-meny="deduktiv"]')).not.toBeNull()
    expect(String(spion.mock.calls.at(-1)?.[2])).toContain('typ=deduktiv')
    spion.mockRestore()
  })
})

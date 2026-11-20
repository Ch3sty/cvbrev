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

  it('omätt kort: typens Nivåkoll-tid står bara i nivåbandet', () => {
    const { container } = render(<TesterVy data={fixturTester('a', 'premium')} />)
    const kort = container.querySelector('[data-testtyp="figurserie"]') as HTMLElement
    expect(within(kort).queryAllByText('Nivåkoll, 7 min').length).toBe(1)
    expect(within(kort).queryAllByText('Nivåkoll, 8 min').length).toBe(0)
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

  it('väggen utan plan: datumet, "Alla tester", statusraden och Välj prov', () => {
    const { container } = render(<TesterVy data={fixturTester('a', 'premium')} />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Alla tester')
    const huvud = container.querySelector('[data-huvud="tester"]') as HTMLElement
    expect(huvud.textContent).toContain('Vet du vilket test?')
    expect(huvud.querySelector('[data-valj-prov]')?.getAttribute('href')).toBe('/dashboard/tester/installningar')
  })

  it('väggen med plan: samma som Hem, nedräkningen och banan', () => {
    const { container } = render(<TesterVy data={fixturTester('b', 'premium')} />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Alva Logic')
    expect(container.querySelector('[data-huvud="tester"]')).not.toBeNull()
    expect(container.querySelector('[data-nedrakning]')).not.toBeNull()
    expect(container.querySelector('[data-bana]')).not.toBeNull()
  })

  it('artikelplanen utan datum: Lägg till provdatum på väggen', () => {
    const { container } = render(<TesterVy data={fixturTester('b', 'gratis', { artikel: true })} />)
    expect(container.querySelector('[data-lagg-till-datum]')?.getAttribute('href')).toBe('/dashboard/tester/installningar?steg=3')
  })

  it('kortet under väggen: Prova något nytt med dagsmålet till höger', () => {
    const { container } = render(<TesterVy data={fixturTester('b', 'premium')} />)
    const kort = container.querySelector('[data-sidkort="tester"]') as HTMLElement
    expect(kort.getAttribute('data-slag')).toBe('nivakoll')
    expect(kort.textContent).toContain('Prova något nytt')
    expect(kort.textContent).toContain('testtyper väntar')
    expect(kort.querySelector('[data-dagsmal="panel"]')?.textContent).toContain('Dagsmål 1 av 2 i dag')
    expect(container.querySelector('[data-hint]')).toBeNull()
  })

  it('gratis med kvoten slut och ingen Nivåkoll kvar: nästa test i morgon', () => {
    const d = fixturTester('a', 'gratis', { kvotAnvand: true })
    const alla = { ...d, gratis: { ...d.gratis, nivakollGjord: Object.fromEntries(d.typer.map((t) => [t.id, true])) } }
    const { container } = render(<TesterVy data={alla} />)
    const kort = container.querySelector('[data-sidkort="tester"]') as HTMLElement
    expect(kort.getAttribute('data-slag')).toBe('imorgon')
    expect(kort.querySelector('[data-sidkort-knapp]')?.getAttribute('href')).toContain('plats=kvot')
    expect(kort.querySelector('[data-dagsmal="panel"]')?.textContent).toContain('Inget dagsmål valt')
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

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { fixturTester } from '@/lib/tester/v4/fixturer'
import TesterVy from '../TesterVy'

vi.mock('@/components/rum/Topprad', () => ({ default: () => <div data-topprad /> }))
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/tester/alla',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

afterEach(() => cleanup())

describe('TesterVy, omgång 3 (skissens Main och Mobil-tester)', () => {
  it('utan plan: dagens typ i panelen, Alla testtyper, Personlighet sist', () => {
    const data = fixturTester('a', 'premium')
    const { container } = render(<TesterVy data={data} />)
    const panel = container.querySelector('[data-panel3]')!
    expect(panel.getAttribute('data-planpanel')).toBe(data.dagens.typ)
    expect(screen.getByRole('heading', { name: 'Alla testtyper' })).toBeTruthy()
    const kort = [...container.querySelectorAll('.t3-typer [data-testtyp]')].map((k) => k.getAttribute('data-testtyp'))
    expect(kort.at(-1)).toBe('personlighet')
    expect(kort).not.toContain(data.dagens.typ)
  })

  it('Alva Logic: Det här prövar Alva Logic, Enda delen i provet, Fler testtyper', () => {
    const { container } = render(<TesterVy data={fixturTester('b', 'premium')} />)
    const panel = container.querySelector('[data-panel3]')!
    expect(panel.textContent).toContain('Det här prövar Alva Logic')
    expect(panel.textContent).toContain('Enda delen i provet')
    expect(panel.textContent).toContain('Välj hur du vill öva')
    expect(screen.getByRole('heading', { name: 'Fler testtyper' })).toBeTruthy()
  })

  it('I-provet: provets övriga delar i en egen rad', () => {
    render(<TesterVy data={fixturTester('c', 'premium')} />)
    expect(screen.getByRole('heading', { name: /^Fler delar i I-provet/ })).toBeTruthy()
  })

  it('gratis: låsta sätt att öva är knappar, inga länkar, och gratisraden står kvar', () => {
    const { container } = render(<TesterVy data={fixturTester('b', 'gratis')} />)
    const panel = container.querySelector('[data-panel3]')!
    expect(panel.querySelectorAll('button[data-las]').length).toBeGreaterThan(0)
    expect(panel.querySelector('a[data-las]')).toBeNull()
    expect(container.querySelector('[data-gratisrad]')).not.toBeNull()
  })

  it('premium: ingen gratisrad', () => {
    const { container } = render(<TesterVy data={fixturTester('b', 'premium')} />)
    expect(container.querySelector('[data-gratisrad]')).toBeNull()
  })

  it('inget "pass" i renderad text i något läge', () => {
    for (const lage of ['a', 'b', 'c'] as const) {
      for (const niva of ['premium', 'gratis'] as const) {
        const { unmount } = render(<TesterVy data={fixturTester(lage, niva)} startTyp="deduktiv" />)
        expect(document.body.textContent ?? '').not.toMatch(/\bpass(et|en)?\b/i)
        unmount()
      }
    }
  })

  it('tryck på ett kort öppnar startarket och sätter ?typ=', () => {
    const spion = vi.spyOn(window.history, 'replaceState')
    render(<TesterVy data={fixturTester('b', 'premium')} />)
    expect(document.querySelector('[data-meny]')).toBeNull()
    fireEvent.click(document.querySelector('button[data-testtyp="deduktiv"]')!)
    expect(document.querySelector('[data-meny="deduktiv"]')).not.toBeNull()
    expect(String(spion.mock.calls.at(-1)?.[2])).toContain('typ=deduktiv')
    spion.mockRestore()
  })
})

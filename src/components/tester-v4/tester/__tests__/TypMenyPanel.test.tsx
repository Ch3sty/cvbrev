import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { fixturTester } from '@/lib/tester/v4/fixturer'
import TypMenyPanel from '../TypMenyPanel'
import { LasProvider } from '../LasKontext'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/tester/alla',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

window.scrollTo = vi.fn() as never
afterEach(() => cleanup())

function rita(lage: 'a' | 'b' | 'c', niva: 'premium' | 'gratis', typ: 'matris' | 'talserie' | 'figurserie' = 'matris') {
  const data = fixturTester(lage, niva)
  const kort = data.typer.find((k) => k.id === typ)!
  const onStang = vi.fn()
  const r = render(
    <LasProvider paket={data.paket}>
      <TypMenyPanel kort={kort} meny={data.menyer[typ]} onStang={onStang} />
    </LasProvider>,
  )
  return { ...r, onStang, data }
}

describe('TypMenyPanel', () => {
  it('visar Träna, "eller", Testa dig med tre nivåer, Mät dig och senaste resultat', () => {
    const { container } = rita('b', 'premium')
    const meny = document.querySelector('[data-meny="matris"]') as HTMLElement
    expect(within(meny).getByRole('heading', { name: 'Figurer och mönster' })).toBeTruthy()
    expect(within(meny).getByText('Träning som följer din nivå')).toBeTruthy()
    expect(meny.querySelector('[data-eller]')?.textContent).toBe('eller')
    expect(within(meny).getByText('Du får resultat i procent. Flyttar inte din nivå.')).toBeTruthy()
    for (const n of ['Grundnivå', 'Avancerad nivå', 'Expertnivå']) expect(within(meny).getByText(n)).toBeTruthy()
    expect(within(meny).getByText('Nivåkollen, mät din nivå')).toBeTruthy()
    expect(within(meny).getByText('Senaste resultat')).toBeTruthy()
    expect(within(meny).getByRole('link', { name: 'Hela historiken i Din utveckling' }).getAttribute('href')).toBe(
      '/dashboard/tester/kurvan?typ=matris',
    )
    // Nivåbandet i mellanstorlek.
    expect(meny.querySelector('svg[data-nivaband="mellan"]')).not.toBeNull()
  })

  it('Esc stänger menyn', () => {
    const { onStang } = rita('a', 'premium')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onStang).toHaveBeenCalledTimes(1)
  })

  it('stängknappen stänger menyn', () => {
    const { onStang, container } = rita('a', 'premium')
    const meny = document.querySelector('[data-meny]') as HTMLElement
    fireEvent.click(within(meny).getByRole('button', { name: 'Stäng' }))
    expect(onStang).toHaveBeenCalled()
  })

  it('fokus flyttas in i menyn och fångas i arket på smal skärm', async () => {
    const { container } = rita('a', 'premium')
    const meny = document.querySelector('[data-meny]') as HTMLElement
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)))
    })
    expect(document.activeElement).toBe(meny)
    expect(meny.getAttribute('role')).toBe('dialog')
    const delar = meny.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    const sista = delar[delar.length - 1]
    sista.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(delar[0])
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(sista)
  })

  it('gratis: Träna låst och öppnar betalväggen, Avancerad och Expert låsta', () => {
    const { container } = rita('a', 'gratis', 'matris')
    const meny = document.querySelector('[data-meny]') as HTMLElement
    const trana = meny.querySelector('[data-trana] button[data-las]') as HTMLElement
    expect(trana.textContent).toContain('Träna')
    expect(meny.querySelectorAll('[data-testa] [data-las="premium"]').length).toBe(2)
    fireEvent.click(trana)
    expect(screen.getAllByRole('dialog').length).toBeGreaterThanOrEqual(2)
  })

  it('alla tre val går att nå: Träna, en nivå och Nivåkollen är länkar för Premium', () => {
    const { container } = rita('c', 'premium', 'talserie')
    const meny = document.querySelector('[data-meny]') as HTMLElement
    expect(meny.querySelector('[data-trana] a[href]')).not.toBeNull()
    expect(meny.querySelectorAll('[data-testa] a[href]').length).toBe(3)
  })

  it('talserier: Nivåkollen mäter nivån sedan etapp 6, nivåtestet flyttar den inte', () => {
    const { container } = rita('c', 'premium', 'talserie')
    const meny = document.querySelector('[data-meny]') as HTMLElement
    expect(within(meny).getByText('Du får resultat i procent. Flyttar inte din nivå.')).toBeTruthy()
    expect(within(meny).queryByText('Du får resultat i procent, och nivåtestet mäter din nivå.')).toBeNull()
    expect(within(meny).getByText('Nio uppgifter, cirka nio minuter. Högst en om dagen räknas.')).toBeTruthy()
    void container
  })
})

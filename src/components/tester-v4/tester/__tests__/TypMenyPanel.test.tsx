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
  it('startarket: namnet, mätaren och Välj hur du vill öva med nivåtesten', () => {
    rita('b', 'premium')
    const meny = document.querySelector('[data-meny="matris"]') as HTMLElement
    expect(within(meny).getByRole('heading', { name: 'Figurer och mönster' })).toBeTruthy()
    expect(within(meny).getByText('Välj hur du vill öva')).toBeTruthy()
    for (const n of ['Grund', 'Avancerad', 'Expert']) expect(within(meny).getAllByText(n).length).toBeGreaterThan(0)
    expect(meny.querySelector('.t3-matt')).not.toBeNull()
    expect(meny.querySelector('[data-forst]')).not.toBeNull()
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
    rita('b', 'gratis', 'matris')
    const meny = document.querySelector('[data-meny]') as HTMLElement
    expect(meny.querySelectorAll('.t3-fast[data-las="premium"]').length).toBe(2)
    const las = meny.querySelector('button.t3-lage[data-las]') as HTMLElement
    expect(las).not.toBeNull()
    fireEvent.click(las)
    expect(screen.getAllByRole('dialog').length).toBeGreaterThanOrEqual(2)
  })

  it('premium: sätten att öva och de tre nivåtesten är länkar', () => {
    rita('c', 'premium', 'talserie')
    const meny = document.querySelector('[data-meny]') as HTMLElement
    expect(meny.querySelector('a.t3-lage[data-forst]')).not.toBeNull()
    expect(meny.querySelectorAll('a.t3-fast').length).toBe(3)
    expect(meny.querySelector('[data-las]')).toBeNull()
  })
})
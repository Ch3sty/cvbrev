import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'

const capture = vi.fn()
vi.mock('@/lib/analytics/events', () => ({ capture: (...a: unknown[]) => capture(...a) }))
vi.mock('@/components/rum/Topprad', () => ({ default: () => <div data-topprad /> }))

import { HemVisad, IngangarMedMatning, NavMedMatning } from '../HemMatning'
import Navigering from '../Navigering'
import HemVy from '../HemVy'
import { navTexter } from '../hemData'
import { fixturTester } from '@/lib/tester/v4/fixturer'

beforeEach(() => {
  capture.mockClear()
  window.sessionStorage.clear()
})

// Navigeringen ska inte lämna sidan i jsdom.
const stoppa = (e: Event) => e.preventDefault()

describe('mätningen av nya Hem', () => {
  it('hem_visad en gång per besök, utan personuppgifter', () => {
    const { unmount } = render(<HemVisad plan premium={false} matta={3} />)
    expect(capture).toHaveBeenCalledTimes(1)
    expect(capture).toHaveBeenCalledWith('hem_visad', { plan: true, niva: 'gratis', matta_typer: 3, plattform: 'webb' })
    unmount()
    render(<HemVisad plan premium={false} matta={3} />)
    expect(capture).toHaveBeenCalledTimes(1)
  })

  it('hem_visad: premium och utan plan', () => {
    render(<HemVisad plan={false} premium matta={0} />)
    expect(capture).toHaveBeenCalledWith('hem_visad', { plan: false, niva: 'premium', matta_typer: 0, plattform: 'webb' })
  })

  it('hem_visad utan sessionStorage: en gång per montering', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blockerad')
    })
    try {
      render(<HemVisad plan premium={false} matta={1} />)
      expect(capture).toHaveBeenCalledTimes(1)
    } finally {
      spy.mockRestore()
    }
  })

  it('tester_nav_klickad med mål och sidan man stod på', () => {
    const { container } = render(<Navigering aktiv="hem" texter={navTexter(fixturTester('b', 'gratis'))} />)
    container.addEventListener('click', stoppa)
    fireEvent.click(container.querySelector('[data-nav="tester"] b')!)
    expect(capture).toHaveBeenLastCalledWith('tester_nav_klickad', { mal: 'tester', sida: 'hem', plattform: 'webb' })
    fireEvent.click(container.querySelector('[data-nav="utveckling"]')!)
    expect(capture).toHaveBeenLastCalledWith('tester_nav_klickad', { mal: 'utveckling', sida: 'hem', plattform: 'webb' })
    // Själva <nav> har kvar sina attribut (sticky, aria-label).
    const nav = container.querySelector('nav[data-nav-tester]')
    expect(nav?.className).toMatch(/lg:sticky/)
  })

  it('tester_nav_klickad från Din utveckling till Hem', () => {
    const { container } = render(
      <NavMedMatning sida="utveckling">
        <a href="#" data-nav="hem">Hem</a>
      </NavMedMatning>
    )
    container.addEventListener('click', stoppa)
    fireEvent.click(container.querySelector('a')!)
    expect(capture).toHaveBeenCalledWith('tester_nav_klickad', { mal: 'hem', sida: 'utveckling', plattform: 'webb' })
  })

  it('hem_ingang_klickad: knappen eller ett typkort', () => {
    const { container } = render(
      <IngangarMedMatning>
        <section data-ingang="tester">
          <a href="#" data-katalog="matris"><b>Matris</b></a>
          <a href="#" data-knapp>Öppna Tester</a>
          <p>Text</p>
        </section>
        <section data-ingang="utveckling">
          <a href="#" data-typ="spatial">Spatial</a>
          <a href="#">Öppna Din utveckling</a>
        </section>
      </IngangarMedMatning>
    )
    container.addEventListener('click', stoppa)
    fireEvent.click(container.querySelector('[data-katalog] b')!)
    expect(capture).toHaveBeenLastCalledWith('hem_ingang_klickad', { ingang: 'tester', kalla: 'typkort', testtyp: 'matris', plattform: 'webb' })
    fireEvent.click(container.querySelector('[data-knapp]')!)
    expect(capture).toHaveBeenLastCalledWith('hem_ingang_klickad', { ingang: 'tester', kalla: 'knapp', testtyp: null, plattform: 'webb' })
    fireEvent.click(container.querySelector('[data-typ]')!)
    expect(capture).toHaveBeenLastCalledWith('hem_ingang_klickad', { ingang: 'utveckling', kalla: 'typkort', testtyp: 'spatial', plattform: 'webb' })
    const antal = capture.mock.calls.length
    fireEvent.click(container.querySelector('p')!)
    expect(capture).toHaveBeenCalledTimes(antal)
  })

  it('HemVy skickar hem_visad och mäter ingångarna', () => {
    const data = fixturTester('b', 'gratis')
    const { container } = render(<HemVy data={data} />)
    container.addEventListener('click', stoppa)
    const visad = capture.mock.calls.find((c) => c[0] === 'hem_visad')
    expect(visad?.[1]).toMatchObject({
      plan: !!data.plan,
      niva: 'gratis',
      matta_typer: data.typer.filter((t) => t.synlig && t.niva.status === 'matt').length,
    })
    const knapp = container.querySelector('[data-ingang="utveckling"] a:last-of-type') as HTMLElement
    fireEvent.click(container.querySelector('[data-ingang="tester"] [data-katalog]')!)
    expect(capture).toHaveBeenLastCalledWith('hem_ingang_klickad', expect.objectContaining({ ingang: 'tester', kalla: 'typkort' }))
    expect(knapp).toBeTruthy()
  })
})

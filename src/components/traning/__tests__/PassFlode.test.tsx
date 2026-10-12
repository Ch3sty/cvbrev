// Passflödet i jsdom mot fixtur-API:t (våg 3b): svar med ett tryck, regeln
// efter svaret, "Vet inte" som fel, nätverksfel utan återkoppling och utan
// "sparat", och resultatet efter sista frågan. Aldrig rött.

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), usePathname: () => '/dashboard/tester/pass' }))
vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn() }))

const { byggForhandsdata } = await import('@/app/dashboard/tester/forhandsvisning-pass/fixturer.server')
const { fixturApi } = await import('@/lib/traning/fixturApi')
const { default: PassFlode } = await import('../PassFlode')

// jsdom saknar ResizeObserver och scrollIntoView.
globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
} as unknown as typeof ResizeObserver
Element.prototype.scrollIntoView = () => {}

function p1() {
  const d = byggForhandsdata('P1')
  if (!('fixtur' in d) || !('initial' in d)) throw new Error('P1')
  return d
}

describe('PassFlode', () => {
  it('fel svar: regeln och misstaget, alla sex alternativ står kvar, inget rött', async () => {
    const d = p1()
    const api = fixturApi({ ...d.fixtur, fordrojning: 0 })
    render(<PassFlode api={api} vy={d.fixtur.vy} betalande initial={{ idx: 2 }} forhandsvisning />)
    expect(screen.getByText('3 / 9')).toBeInTheDocument()
    expect(screen.getByText('Vet inte, visa regeln')).toBeInTheDocument()
    const alternativ = screen.getAllByRole('radio')
    expect(alternativ).toHaveLength(6)
    const facit = d.fixtur.facit[d.fixtur.vy.fragor[2].id]
    const fel = (facit.rattVisat + 1) % 6
    await act(async () => {
      fireEvent.click(alternativ[fel])
    })
    await waitFor(() => expect(document.querySelector('.regelpanel')).not.toBeNull())
    expect(screen.getByText(/^Inte den här, \d+ s$/)).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(6)
    expect(screen.getAllByRole('radio')[fel]).toHaveAttribute('aria-checked', 'true')
    expect(screen.getAllByRole('radio')[facit.rattVisat].getAttribute('aria-label')).toContain('rätt svar')
    expect(document.querySelectorAll('[role=radiogroup] .opacity-\\[\\.38\\]')).toHaveLength(4)
    expect(document.body.innerHTML).not.toMatch(/\b(text|bg|border)-fel\b/)
    expect(screen.getByRole('button', { name: 'Nästa fråga' })).toBeInTheDocument()
  })

  it('"Vet inte, visa regeln" räknas som fel och visar regeln', async () => {
    const d = p1()
    const api = fixturApi({ ...d.fixtur, fordrojning: 0 })
    render(<PassFlode api={api} vy={d.fixtur.vy} betalande initial={{ idx: 2 }} forhandsvisning />)
    await act(async () => {
      fireEvent.click(screen.getByText('Vet inte, visa regeln'))
    })
    await waitFor(() => expect(screen.getByText(/^Vet inte, \d+ s$/)).toBeInTheDocument())
    expect(screen.getAllByRole('radio').every((r) => r.getAttribute('aria-checked') === 'false')).toBe(true)
  })

  it('nätverksfel: banner och Försök igen, ingen regel, inget "sparat"', async () => {
    const d = p1()
    const riktig = fixturApi({ ...d.fixtur, fordrojning: 0 })
    let fel = true
    const api = {
      ...riktig,
      svara: async (inp: Parameters<typeof riktig.svara>[0]) =>
        fel ? ({ ok: false as const, status: 0, fel: 'natverk' }) : riktig.svara(inp),
    }
    render(<PassFlode api={api} vy={d.fixtur.vy} betalande initial={{ idx: 2 }} forhandsvisning />)
    await act(async () => {
      fireEvent.click(screen.getAllByRole('radio')[0])
    })
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Svaret gick inte att spara'))
    expect(document.querySelector('.regelpanel')).toBeNull()
    expect(document.body.textContent).not.toMatch(/sparat/i)
    fel = false
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Försök igen' }))
    })
    await waitFor(() => expect(document.querySelector('.regelpanel')).not.toBeNull())
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('hela passet till resultatet utan omladdning', async () => {
    const d = p1()
    const api = fixturApi({ ...d.fixtur, fordrojning: 0 })
    render(<PassFlode api={api} vy={d.fixtur.vy} betalande initial={{ idx: 2 }} forhandsvisning />)
    for (let i = 2; i < 9; i++) {
      const q = d.fixtur.vy.fragor[i]
      await act(async () => {
        fireEvent.click(screen.getAllByRole('radio')[d.fixtur.facit[q.id].rattVisat])
      })
      await waitFor(() => expect(document.querySelector('.regelpanel')).not.toBeNull())
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: i === 8 ? 'Visa resultatet' : 'Nästa fråga' }))
      })
    }
    await waitFor(() => expect(document.querySelector('[data-resultat]')).not.toBeNull(), { timeout: 3000 })
    expect(screen.getByText('Passet klart')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/^9 av 9 rätt\./)
  })
})

describe('passets rubrik (beställning omgång 2, C4)', () => {
  const rubrik = () => document.querySelector('[data-pass-shell] header p span')?.textContent ?? ''

  it('rubriken är passets tema och densamma på fråga 1 och 5, i ett pass med blandade familjer', () => {
    const d = p1()
    const vy = { ...d.fixtur.vy, tema: 'rotation-med-byte', besvarade: [], aterkoppling: {}, aktuell: 0 }
    const api = fixturApi({ ...d.fixtur, vy, fordrojning: 0 })
    const a = render(<PassFlode api={api} vy={vy} betalande initial={{ idx: 0 }} forhandsvisning />)
    const forsta = rubrik()
    a.unmount()
    render(<PassFlode api={api} vy={vy} betalande initial={{ idx: 4 }} forhandsvisning />)
    expect(screen.getByText('5 / 9')).toBeInTheDocument()
    expect(rubrik()).toBe(forsta)
    expect(forsta).toBe('Vrider sig och byter utseende')
  })

  it('utan tema står "Blandade mönster" på varje fråga', () => {
    const d = p1()
    const vy = { ...d.fixtur.vy, tema: null, besvarade: [], aterkoppling: {}, aktuell: 0 }
    const api = fixturApi({ ...d.fixtur, vy, fordrojning: 0 })
    for (const idx of [0, 4]) {
      const r = render(<PassFlode api={api} vy={vy} betalande initial={{ idx }} forhandsvisning />)
      expect(rubrik()).toBe('Blandade mönster')
      r.unmount()
    }
  })
})

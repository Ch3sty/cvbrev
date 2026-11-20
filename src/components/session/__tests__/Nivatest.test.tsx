// Nivåtestet i ramen: tryck markerar och Nästa bekräftar, Nästa utan val
// lämnar obesvarad, ‹ går tillbaka och ett svar kan ändras, kön skickar i
// bakgrunden, Lämna in frågar med antalet obesvarade och kön töms före
// inlämningen. Mjuk gräns: klockan stoppar ingen.

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }), usePathname: () => '/x' }))

const { harnastPool } = await import('@/lib/figurserierV1/select')
const { visaFigur } = await import('@/lib/figurserierV1/fragor.server')
const { default: Nivatest } = await import('../lagen/Nivatest')
const { FIGURSERIE } = await import('../typer/Figurserie')

globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
} as unknown as typeof ResizeObserver
window.scrollTo = (() => {}) as typeof window.scrollTo

describe('nivåtestet i ramen', () => {
  it('markera, Nästa, hoppa, tillbaka, ändra, Lämna in med dialog', async () => {
    const id = 's-1'
    const uppgifter = harnastPool('grund')
      .slice(0, 3)
      .map((q) => {
        const v = visaFigur(q, id)
        return { nyckel: q.id, form: 'harnast' as const, rad: v.rad, options: v.options }
      })
    const skickat: [string, number][] = []
    const skicka = vi.fn(async (u: { nyckel: string }, index: number) => {
      skickat.push([u.nyckel, index])
      return true
    })
    const lamnaIn = vi.fn(async () => true)
    const efter = vi.fn()
    render(
      <Nivatest
        ritare={FIGURSERIE}
        bas={{ test_kind: 'figurserie', lage: 'nivatest', niva: 'grund', format: null }}
        undertitel="Nivåtest, grundnivå"
        sessionId={id}
        uppgifter={uppgifter}
        sparade={[null, null, null]}
        startad={new Date(Date.now() - 25 * 60 * 1000).toISOString()}
        budgetS={20 * 60}
        skicka={skicka}
        lamnaIn={lamnaIn}
        efterInlamning={efter}
        avbrytHref="/dashboard/tester/figurserier-grund"
      />
    )
    // Mjuk gräns: fem minuter över, testet går vidare och ringen säger tiden över.
    expect(document.querySelector('[data-klocka="over"]')?.textContent).toMatch(/^\+5:0\d$/)
    expect(screen.getByText('1 / 3')).toBeTruthy()
    // Nästa utan val lämnar obesvarad.
    fireEvent.click(document.querySelector('[data-primar="nasta"]')!)
    expect(screen.getByText('2 / 3')).toBeTruthy()
    expect(skicka).not.toHaveBeenCalled()
    // Markera och bekräfta.
    fireEvent.click(document.querySelectorAll('[data-serie-alt] button')[4])
    fireEvent.click(document.querySelector('[data-primar="nasta"]')!)
    await waitFor(() => expect(skickat).toEqual([[uppgifter[1].nyckel, 4]]))
    // Tillbaka med ‹, ändra svaret.
    fireEvent.click(document.querySelector('[data-foregaende]')!)
    expect(screen.getByText('2 / 3')).toBeTruthy()
    expect(document.querySelectorAll('[data-serie-alt] button')[4].getAttribute('data-tillstand')).toBe('vald')
    fireEvent.click(document.querySelectorAll('[data-serie-alt] button')[1])
    fireEvent.click(document.querySelector('[data-primar="nasta"]')!)
    await waitFor(() => expect(skickat[1]).toEqual([uppgifter[1].nyckel, 1]))
    // Sista uppgiften: Lämna in.
    expect(screen.getByText('3 / 3')).toBeTruthy()
    fireEvent.click(document.querySelector('[data-primar="lamna-in"]')!)
    await screen.findByText('Lämna in?')
    expect(screen.getAllByText('2 uppgifter är obesvarade och räknas som fel.').length).toBeGreaterThan(0)
    await act(async () => {
      fireEvent.click(document.querySelector('[data-dialog-primar]')!)
    })
    await waitFor(() => expect(lamnaIn).toHaveBeenCalled())
    expect(efter).toHaveBeenCalled()
  })

  it('X frågar först; Fortsätt stänger dialogen, Avbryt lämnar', async () => {
    push.mockClear()
    const id = 's-2'
    const q = harnastPool('grund')[0]
    const v = visaFigur(q, id)
    render(
      <Nivatest
        ritare={FIGURSERIE}
        bas={{ test_kind: 'figurserie', lage: 'nivatest', niva: 'grund', format: null }}
        undertitel="Nivåtest, grundnivå"
        sessionId={id}
        uppgifter={[{ nyckel: q.id, form: 'harnast' as const, rad: v.rad, options: v.options }]}
        sparade={[null]}
        startad={new Date().toISOString()}
        budgetS={1200}
        skicka={async () => true}
        lamnaIn={async () => true}
        efterInlamning={() => {}}
        avbrytHref="/hubb"
      />
    )
    fireEvent.click(document.querySelector('[data-kryss]')!)
    await screen.findByText('Avbryta nivåtestet?')
    fireEvent.click(document.querySelector('[data-dialog-primar]')!)
    await waitFor(() => expect(screen.queryByText('Avbryta nivåtestet?')).toBeNull())
    expect(push).not.toHaveBeenCalled()
    fireEvent.click(document.querySelector('[data-kryss]')!)
    await screen.findByText('Avbryta nivåtestet?')
    fireEvent.click(document.querySelector('[data-dialog-lank]')!)
    expect(push).toHaveBeenCalledWith('/hubb')
  })
})

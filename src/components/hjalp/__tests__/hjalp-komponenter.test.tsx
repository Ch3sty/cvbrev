import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { HjalpKnapp, HjalpPanel, HjalpProvider, HjalpRad } from '..'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  window.localStorage.clear()
})

function stubbaFetch() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(null, { status: 204 }))
}

describe('HjalpRad', () => {
  it('står öppen första gången och hopfälld sedan', () => {
    const { container, unmount } = render(
      <HjalpProvider dold={null} forsta>
        <HjalpRad ids={['C5']} />
      </HjalpProvider>,
    )
    expect(container.querySelector('details')?.open).toBe(true)
    unmount()
    const r2 = render(
      <HjalpProvider dold={null} forsta={false}>
        <HjalpRad ids={['C5']} />
      </HjalpProvider>,
    )
    expect(r2.container.querySelector('details')?.open).toBe(false)
  })

  it('"Dölj hjälpen" tar bort all hjälp på sidan och sparar valet', async () => {
    const f = stubbaFetch()
    render(
      <HjalpProvider dold={null} forsta>
        <HjalpRad ids={['A1', 'A2']} rubrik="Aldrig gjort ett rekryteringstest?" />
        <HjalpRad ids={['C4']} />
        <HjalpKnapp id="B1" />
      </HjalpProvider>,
    )
    expect(screen.getByText('Aldrig gjort ett rekryteringstest?')).toBeTruthy()
    await act(async () => {
      fireEvent.click(screen.getAllByText('Dölj hjälpen')[0])
    })
    expect(screen.queryByText('Aldrig gjort ett rekryteringstest?')).toBeNull()
    expect(screen.queryByText('Vad är percentilen?')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Logiktest: vad är en matris?' })).toBeNull()
    expect(window.localStorage.getItem('hjalp_dold')).toBe('1')
    expect(f).toHaveBeenCalled()
  })

  it('ritar inget när profilen säger dold', () => {
    const { container } = render(
      <HjalpProvider dold forsta>
        <HjalpRad ids={['C5']} />
        <HjalpPanel rader={[{ ids: ['A1'] }]} />
      </HjalpProvider>,
    )
    expect(container.innerHTML).toBe('')
  })

  it('visar de rutor som verifierades 2026-10-11 (A4 och C3)', () => {
    const { container } = render(
      <HjalpProvider dold={null} forsta>
        <HjalpRad ids={['A4']} />
        <HjalpKnapp id="C3" />
      </HjalpProvider>,
    )
    expect(container.textContent).toContain('Hur lång tid tar det?')
    expect(container.querySelector('button[aria-haspopup="dialog"]')).not.toBeNull()
  })
})

describe('HjalpKnapp', () => {
  it('öppnar popovern, stängs med Esc och lämnar fokus på knappen', () => {
    render(
      <HjalpProvider dold={null} forsta={false}>
        <HjalpKnapp id="B1" etikett="Vad mäter logiktestet?" />
      </HjalpProvider>,
    )
    const knapp = screen.getByRole('button', { name: 'Vad mäter logiktestet?' })
    fireEvent.click(knapp)
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(knapp.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Stäng')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(knapp)
  })

  it('stängs med klick utanför och med krysset', () => {
    render(
      <HjalpProvider dold={null} forsta={false}>
        <p>utanför</p>
        <HjalpKnapp id="B2" />
      </HjalpProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Logiktest: vem använder det och hur övar jag?' }))
    fireEvent.pointerDown(screen.getByText('utanför'))
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Logiktest: vem använder det och hur övar jag?' }))
    fireEvent.click(screen.getByRole('button', { name: 'Stäng' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

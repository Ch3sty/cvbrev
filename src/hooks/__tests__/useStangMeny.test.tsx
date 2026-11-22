/**
 * Toppradens svävande menyer stängs lika (useStangMeny): klick utanför och
 * Escape, och vid Escape går fokus tillbaka till knappen. Testas på hooken och
 * på klockan (NotificationBell), där Escape inte stängde förut.
 */
import { useRef, useState } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useStangMeny } from '../useStangMeny'

vi.mock('@/lib/scheduleIdle', () => ({ scheduleIdle: (fn: () => void) => (fn(), () => {}) }))
import NotificationBell from '@/components/dashboard/NotificationBell'

function Meny() {
  const [oppen, setOppen] = useState(false)
  const ruta = useRef<HTMLDivElement>(null)
  const knapp = useRef<HTMLButtonElement>(null)
  useStangMeny(oppen, () => setOppen(false), [ruta], () => knapp.current)
  return (
    <div>
      <button type="button">Annat</button>
      <div ref={ruta}>
        <button ref={knapp} type="button" onClick={() => setOppen(true)}>
          Öppna
        </button>
        {oppen ? <p>Menyn</p> : null}
      </div>
    </div>
  )
}

describe('useStangMeny', () => {
  it('Escape stänger och lämnar fokus på knappen', () => {
    render(<Meny />)
    fireEvent.click(screen.getByText('Öppna'))
    expect(screen.queryByText('Menyn')).not.toBeNull()
    screen.getByText('Annat').focus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByText('Menyn')).toBeNull()
    expect(document.activeElement).toBe(screen.getByText('Öppna'))
  })

  it('klick utanför stänger, klick inne gör det inte, andra tangenter gör inget', () => {
    render(<Meny />)
    fireEvent.click(screen.getByText('Öppna'))
    fireEvent.mouseDown(screen.getByText('Menyn'))
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(screen.queryByText('Menyn')).not.toBeNull()
    fireEvent.mouseDown(screen.getByText('Annat'))
    expect(screen.queryByText('Menyn')).toBeNull()
  })

  it('stängd meny lyssnar inte', () => {
    const stang = vi.fn()
    function Stangd() {
      const r = useRef<HTMLDivElement>(null)
      useStangMeny(false, stang, [r], () => null)
      return <div ref={r} />
    }
    render(<Stangd />)
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.mouseDown(document.body)
    expect(stang).not.toHaveBeenCalled()
  })
})

describe('klockan i toppraden', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          notifications: [{ id: 'n1', type: null, title: 'Följ upp ansökan', message: null, actionUrl: null, read: false, createdAt: new Date().toISOString() }],
          unreadCount: 1,
        }),
      }))
    )
  })
  afterEach(() => vi.unstubAllGlobals())

  it('Escape stänger notisrutan och fokus går tillbaka till klockan', async () => {
    render(<NotificationBell />)
    const klocka = await screen.findByLabelText('Notiser, 1 olästa')
    await act(async () => {
      fireEvent.click(klocka)
    })
    await waitFor(() => expect(screen.queryByText('Följ upp ansökan')).not.toBeNull())
    expect(klocka.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByText('Följ upp ansökan')).toBeNull())
    expect(document.activeElement).toBe(klocka)
    expect(klocka.getAttribute('aria-expanded')).toBe('false')
  })

  it('klick utanför stänger fortfarande', async () => {
    render(<NotificationBell />)
    const klocka = await screen.findByLabelText('Notiser, 1 olästa')
    await act(async () => {
      fireEvent.click(klocka)
    })
    await waitFor(() => expect(screen.queryByText('Följ upp ansökan')).not.toBeNull())
    fireEvent.mouseDown(document.body)
    await waitFor(() => expect(screen.queryByText('Följ upp ansökan')).toBeNull())
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const push = vi.fn()
const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh, replace: vi.fn(), back: vi.fn() }), usePathname: () => '/dashboard/tester/installningar' }))
const capture = vi.fn()
vi.mock('@/lib/analytics/events', () => ({ capture: (...a: unknown[]) => capture(...a) }))
vi.mock('@/lib/analytics/provkalla', () => ({ sparaKontokalla: vi.fn() }))

import Ingang, { type IngangPlan } from '../Ingang'

const alva: IngangPlan = {
  testtyper: ['matris'],
  leverantor: 'alva',
  variant: null,
  provdatum: null,
  mitt_test: 'alva',
  mitt_test_variant: null,
  extra_typer: [],
  dagsmal: 2,
}

const fetchMock = vi.fn()
beforeEach(() => {
  push.mockClear()
  capture.mockClear()
  fetchMock.mockReset()
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) })
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
})

describe('Ingang, Plan inför provet (tester v4)', () => {
  it('datumsteget har dagsmålet med det sparade valet, och sparar det', async () => {
    render(<Ingang idag="2026-11-19" plan={alva} startSteg="datum" forsta={false} />)
    const grupp = screen.getByRole('radiogroup', { name: 'Vill du ha ett dagsmål?' })
    expect(grupp).toBeTruthy()
    expect(screen.getByRole('radio', { name: /Två om dagen/ }).getAttribute('aria-checked')).toBe('true')
    fireEvent.click(screen.getByRole('radio', { name: /Inget dagsmål/ }))
    fireEvent.click(screen.getByRole('button', { name: /Hoppa över/ }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/traning/plan')
    expect(JSON.parse(init.body)).toMatchObject({ dagsmal: null, mitt_test: 'alva' })
    await waitFor(() => expect(capture).toHaveBeenCalledWith('dagsmal_satt', expect.objectContaining({ dagsmal: null, plattform: 'webb' })))
  })

  it('efter kontot syns inget dagsmål och inget skickas', async () => {
    render(<Ingang idag="2026-11-19" plan={{ ...alva, mitt_test: 'iprov', leverantor: null }} startSteg="datum" forsta={false} efterKonto={{ nasta: '/dashboard/tester' }} />)
    expect(screen.queryByRole('radiogroup', { name: 'Vill du ha ett dagsmål?' })).toBeNull()
  })

  it('Avsluta planen frågar först, sedan DELETE och Hem', async () => {
    render(<Ingang idag="2026-11-19" plan={alva} startSteg="test" forsta={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Avsluta planen' }))
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
    const knappar = screen.getAllByRole('button', { name: 'Avsluta planen' })
    fireEvent.click(knappar[knappar.length - 1])
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/traning/plan', { method: 'DELETE' }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard/tester'))
  })

  it('Avsluta planen på fel: felet står kvar, ingen navigering', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 })
    render(<Ingang idag="2026-11-19" plan={alva} startSteg="test" forsta={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Avsluta planen' }))
    const knappar = screen.getAllByRole('button', { name: 'Avsluta planen' })
    fireEvent.click(knappar[knappar.length - 1])
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Det gick inte att avsluta planen'))
    expect(push).not.toHaveBeenCalled()
  })

  it('utan sparad plan eller första gången: ingen Avsluta planen', () => {
    render(<Ingang idag="2026-11-19" plan={null} startSteg="test" forsta={false} />)
    expect(screen.queryByRole('button', { name: 'Avsluta planen' })).toBeNull()
    render(<Ingang idag="2026-11-19" plan={alva} startSteg="test" forsta />)
    expect(screen.queryAllByRole('button', { name: 'Avsluta planen' }).length).toBe(0)
  })
})

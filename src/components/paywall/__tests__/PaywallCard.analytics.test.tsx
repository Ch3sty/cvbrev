/**
 * Betalväggen ska gå att mäta.
 *
 * paywall_shown hör till monteringen, inte till omritningen. Skickas den en
 * gång per omritning blir nämnaren i konverteringstalet fel, och då säger
 * kvoten paywall_cta_clicked / paywall_shown ingenting om copyn.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const captureMock = vi.fn()

vi.mock('@/lib/analytics/events', () => ({
  capture: (...args: unknown[]) => captureMock(...args),
  identifyUser: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/skapa-brev',
}))

import PaywallCard from '../PaywallCard'

describe('PaywallCard, mätning', () => {
  beforeEach(() => {
    captureMock.mockClear()
  })

  it('skickar paywall_shown exakt en gång per montering', () => {
    const { rerender } = render(<PaywallCard variant="kvot" />)

    const shown = captureMock.mock.calls.filter(([namn]) => namn === 'paywall_shown')
    expect(shown).toHaveLength(1)
    expect(shown[0][1]).toMatchObject({ variant: 'kvot', surface: '/dashboard/skapa-brev' })

    // Samma kort ritas om med nya props: fortfarande en enda händelse.
    rerender(<PaywallCard variant="kvot" className="mt-4" />)
    expect(captureMock.mock.calls.filter(([namn]) => namn === 'paywall_shown')).toHaveLength(1)
  })

  it('skickar ingen händelse för premium', () => {
    render(<PaywallCard variant="kvot" isPremium />)
    expect(captureMock).not.toHaveBeenCalled()
  })

  it('skickar paywall_cta_clicked med cta primary när ink-knappen klickas', () => {
    render(<PaywallCard variant="kvot" />)
    captureMock.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'Fortsätt skriva med Premium' }))

    expect(captureMock).toHaveBeenCalledWith('paywall_cta_clicked', {
      variant: 'kvot',
      surface: '/dashboard/skapa-brev',
      cta: 'primary',
    })
  })

  it('skickar paywall_cta_clicked med cta secondary för den sekundära handlingen', () => {
    const onSecondary = vi.fn()
    render(<PaywallCard variant="analys" onSecondary={onSecondary} />)
    captureMock.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'Vad ingår i Premium?' }))

    expect(onSecondary).toHaveBeenCalledTimes(1)
    expect(captureMock).toHaveBeenCalledWith('paywall_cta_clicked', {
      variant: 'analys',
      surface: '/dashboard/skapa-brev',
      cta: 'secondary',
    })
  })
})

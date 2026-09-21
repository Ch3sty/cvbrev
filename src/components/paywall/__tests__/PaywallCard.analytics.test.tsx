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

// Premiumgrenen renderar numera TrialRowConnected, som läser profilen. Den
// hämtningskedjan hör inte hit: det här är ett mättest för kortet. Default är
// ett konto utan provperiod, så premium ger tom yta precis som förut.
const profileMock = vi.fn(() => ({
  premiumSource: null as string | null,
  premiumUntil: null as Date | null,
  hasStripeSubscription: false,
}))

vi.mock('@/hooks/use-profile', () => ({
  useProfile: () => profileMock(),
}))

import PaywallCard from '../PaywallCard'

describe('PaywallCard, mätning', () => {
  beforeEach(() => {
    captureMock.mockClear()
    profileMock.mockReset()
    profileMock.mockReturnValue({
      premiumSource: null,
      premiumUntil: null,
      hasStripeSubscription: false,
    })
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

  it('visar priset och mäter det när premium beror på en provperiod', () => {
    profileMock.mockReturnValue({
      premiumSource: 'signup_trial',
      premiumUntil: new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000),
      hasStripeSubscription: false,
    })

    const { rerender } = render(<PaywallCard variant="kvot" isPremium />)

    // Ingen betalvägg, men priset står där spärren annars hade legat.
    expect(captureMock.mock.calls.filter(([namn]) => namn === 'paywall_shown')).toHaveLength(0)
    expect(screen.getByText(/Ingår i din provperiod, 3 dagar kvar\. Behåll det från 49 kr\./)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Se planer' })).toBeTruthy()

    const shown = captureMock.mock.calls.filter(([namn]) => namn === 'trial_price_shown')
    expect(shown).toHaveLength(1)
    expect(shown[0][1]).toMatchObject({ surface: '/dashboard/skapa-brev' })

    // Monteringen äger händelsen, inte omritningen.
    rerender(<PaywallCard variant="kvot" isPremium className="mt-4" />)
    expect(captureMock.mock.calls.filter(([namn]) => namn === 'trial_price_shown')).toHaveLength(1)
  })

  it('visar ingen prisrad för en betalande prenumerant', () => {
    profileMock.mockReturnValue({
      premiumSource: 'signup_trial',
      premiumUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      hasStripeSubscription: true,
    })

    const { container } = render(<PaywallCard variant="kvot" isPremium />)
    expect(container).toBeEmptyDOMElement()
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

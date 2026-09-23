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

// Premiumgrenen renderar ingenting sedan trialraden togs bort. Profilmocken
// står kvar därför att kortet fortfarande importerar hooken via andra vägar,
// och ett mättest ska inte dra in en Supabase-klient.
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
    const { rerender } = render(<PaywallCard variant="nedladdning" />)

    const shown = captureMock.mock.calls.filter(([namn]) => namn === 'paywall_shown')
    expect(shown).toHaveLength(1)
    expect(shown[0][1]).toMatchObject({ variant: 'nedladdning', surface: '/dashboard/skapa-brev' })

    // Samma kort ritas om med nya props: fortfarande en enda händelse.
    rerender(<PaywallCard variant="nedladdning" className="mt-4" />)
    expect(captureMock.mock.calls.filter(([namn]) => namn === 'paywall_shown')).toHaveLength(1)
  })

  it('skickar ingen händelse för premium', () => {
    render(<PaywallCard variant="nedladdning" isPremium />)
    expect(captureMock).not.toHaveBeenCalled()
  })

  it('renderar tom yta för en betalande, oavsett hur premium uppstod', () => {
    // Trialraden som stod här föll med reverse trial (ägarens beslut 3 i
    // docs/plan-paket-och-onboarding.md). En betalande ser ingenting: fel
    // spår i taket är en egen komponent, FelSpar.tsx, inte den här.
    profileMock.mockReturnValue({
      premiumSource: 'signup_trial',
      premiumUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      hasStripeSubscription: true,
    })

    const { container } = render(<PaywallCard variant="nedladdning" isPremium />)
    expect(container).toBeEmptyDOMElement()
    expect(captureMock).not.toHaveBeenCalled()
  })

  it('skickar paywall_cta_clicked med cta primary när ink-knappen klickas', () => {
    // Med spåret valt öppnar knappen produktvalet i stället för att navigera
    // till spårvalet, så klicket går att mäta utan en riktig navigering.
    render(<PaywallCard variant="nedladdning" track="cv" />)
    captureMock.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'Skaffa CV-paketet, 79 kr i veckan' }))

    expect(captureMock).toHaveBeenCalledWith('paywall_cta_clicked', {
      variant: 'nedladdning',
      surface: '/dashboard/skapa-brev',
      cta: 'primary',
      plan: 'cv_week',
    })
  })

  it('skickar paywall_cta_clicked med cta secondary för den sekundära handlingen', () => {
    const onSecondary = vi.fn()
    render(<PaywallCard variant="analys" track="cv" onSecondary={onSecondary} />)
    captureMock.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'Jämför paketen' }))

    expect(onSecondary).toHaveBeenCalledTimes(1)
    expect(captureMock).toHaveBeenCalledWith('paywall_cta_clicked', {
      variant: 'analys',
      surface: '/dashboard/skapa-brev',
      cta: 'secondary',
      plan: 'cv_week',
    })
  })

  it('skickar feature_blocked med feature och scope vid varje spärr', () => {
    render(<PaywallCard variant="mall" scope={null} />)

    const blocked = captureMock.mock.calls.filter(([namn]) => namn === 'feature_blocked')
    expect(blocked).toHaveLength(1)
    expect(blocked[0][1]).toEqual({
      feature: 'cv_templates_all',
      scope: null,
      surface: '/dashboard/skapa-brev',
    })
  })

  it('paywall_shown bär feature och föreslaget paket', () => {
    render(<PaywallCard variant="testniva" />)

    const shown = captureMock.mock.calls.filter(([namn]) => namn === 'paywall_shown')
    expect(shown[0][1]).toMatchObject({
      variant: 'testniva',
      feature: 'tests_above_base',
      suggestedPlan: 'test_week',
    })
  })
})

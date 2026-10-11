/**
 * Betalväggen ska gå att mäta.
 *
 * paywall_shown och betalvagg_visad hör till monteringen, inte till
 * omritningen. Skickas de en gång per omritning blir nämnaren i
 * konverteringstalet fel, och då säger kvoten paywall_cta_clicked /
 * paywall_shown ingenting om copyn.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const captureMock = vi.fn()

vi.mock('@/lib/analytics/events', () => ({
  capture: (...args: unknown[]) => captureMock(...args),
  identifyUser: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/skapa-brev',
}))

// Profilmocken står kvar så att ett mättest aldrig drar in en Supabase-klient
// om kortet en dag importerar hooken via en annan väg.
vi.mock('@/hooks/use-profile', () => ({
  useProfile: () => ({ premiumSource: null, premiumUntil: null, hasStripeSubscription: false }),
}))

import PaywallCard from '../PaywallCard'

const ursprung = window.location

describe('PaywallCard, mätning', () => {
  beforeEach(() => {
    captureMock.mockClear()
    Object.defineProperty(window, 'location', { configurable: true, writable: true, value: { href: '' } })
  })
  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, writable: true, value: ursprung })
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

  it('skickar ingen händelse och ritar ingenting för den som har funktionen', () => {
    const { container } = render(<PaywallCard variant="nedladdning" isPremium />)
    expect(container).toBeEmptyDOMElement()
    expect(captureMock).not.toHaveBeenCalled()
  })

  it('skickar betalvagg_visad en gång per montering, med platsen och dagar_kvar', () => {
    const { rerender } = render(<PaywallCard variant="cv-export" />)
    rerender(<PaywallCard variant="cv-export" className="mt-2" />)
    const visad = captureMock.mock.calls.filter(([namn]) => namn === 'betalvagg_visad')
    expect(visad).toHaveLength(1)
    expect(visad[0][1]).toEqual({ plats: 'cv_export', dagar_kvar: null })
  })

  it('platsen och dagarna går att sätta av anroparen', () => {
    render(<PaywallCard variant="testniva" plats="provlage" dagarKvar={3} />)
    const visad = captureMock.mock.calls.filter(([namn]) => namn === 'betalvagg_visad')
    expect(visad[0][1]).toEqual({ plats: 'provlage', dagar_kvar: 3 })
  })

  it('köpknappen skickar paywall_cta_clicked med plats och leder till köpsteget med platsen', () => {
    render(<PaywallCard variant="nedladdning" track="cv" />)
    captureMock.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'Köp Premium, 149 kr i månaden' }))

    expect(captureMock).toHaveBeenCalledWith('paywall_cta_clicked', {
      variant: 'nedladdning',
      surface: '/dashboard/skapa-brev',
      cta: 'primary',
      plan: 'all_month',
      plats: 'nedladdning',
    })
    expect(window.location.href).toBe('/dashboard/valj-spar?paket=all_month&steg=kop&plats=nedladdning')
  })

  it('skickar paywall_cta_clicked med cta secondary för vyns egen handling', () => {
    const onSecondary = vi.fn()
    render(<PaywallCard variant="mall" track="cv" onSecondary={onSecondary} />)
    captureMock.mockClear()

    fireEvent.click(screen.getByRole('button', { name: /^Välj bland de/ }))

    expect(onSecondary).toHaveBeenCalledTimes(1)
    expect(captureMock).toHaveBeenCalledWith('paywall_cta_clicked', {
      variant: 'mall',
      surface: '/dashboard/skapa-brev',
      cta: 'secondary',
      plan: 'all_month',
      plats: 'mall',
    })
  })

  it('Se vad som ingår är en länk till prissidan, också när vyn har en egen handling', () => {
    render(<PaywallCard variant="analys" onSecondary={vi.fn()} />)
    const lank = screen.getByRole('link', { name: 'Se vad som ingår' })
    expect(lank.getAttribute('href')).toBe('/priser')
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

  it('paywall_shown bär feature och föreslår alltid Premium', () => {
    render(<PaywallCard variant="testniva" />)

    const shown = captureMock.mock.calls.filter(([namn]) => namn === 'paywall_shown')
    expect(shown[0][1]).toMatchObject({
      variant: 'testniva',
      feature: 'tests_above_base',
      suggestedPlan: 'all_month',
    })
  })
})

describe('PaywallCard, texten', () => {
  it('rubriken säger Premium, prisraden fulla namnet och knappen kortformen', () => {
    render(<PaywallCard variant="mall" />)
    expect(screen.getByText('Mallen ingår i Premium')).toBeTruthy()
    expect(screen.getByText('Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Köp Premium, 149 kr i månaden' })).toBeTruthy()
  })

  it('inga gamla paketord och inget Dagspass i någon variant', () => {
    const varianter = [
      'mall', 'testniva', 'analys', 'nedladdning', 'cv-export', 'jobbtraffar', 'chatt',
      'historik', 'linkedin', 'bli-upptackt', 'test-tak', 'cv-antal', 'af-rapport', 'nedgraderad',
    ] as const
    for (const v of varianter) {
      const { container, unmount } = render(<PaywallCard variant={v} />)
      expect(container.textContent).not.toMatch(/Dagspass|paketen|Hela paketet|Uppgradera|Jämför|(^|[^0-9])49 kr/)
      unmount()
    }
  })

  it('LinkedIn-väggen skriver fulla namnet i rubriken och den korta prisraden', () => {
    render(<PaywallCard variant="linkedin" />)
    expect(screen.getByText('LinkedIn-optimeringen ingår i Jobbcoach Premium')).toBeTruthy()
    expect(screen.getByText('149 kr i månaden, säg upp när du vill.')).toBeTruthy()
  })
})

/**
 * Köpvägen i ett steg (docs/qa/qa-slutflode-2026-09-24.md, iakttagelse 1),
 * med ägarens beslut 2026-10-11: bara Jobbcoach Premium säljs. Varje
 * köpknapp i en betalvägg går direkt till köpsteget för Premium, oavsett
 * spår, och bär platsen för mätningen.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn(), identifyUser: vi.fn() }))
vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard/cv-mallar' }))
vi.mock('@/hooks/use-profile', () => ({
  useProfile: () => ({ premiumSource: null, premiumUntil: null, hasStripeSubscription: false }),
}))

import PaywallCard from '../PaywallCard'
import { kopstegHref } from '@/lib/onboarding/steps'

const ursprung = window.location
const KNAPP = 'Köp Premium, 149 kr i månaden'

beforeEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, writable: true, value: { href: '' } })
})
afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, writable: true, value: ursprung })
})

describe('köpknappen i betalväggen', () => {
  it('med sparat CV-spår: direkt till köpsteget för Premium', () => {
    render(<PaywallCard variant="mall" track="cv" />)
    fireEvent.click(screen.getByRole('button', { name: KNAPP }))
    expect(window.location.href).toBe('/dashboard/valj-spar?paket=all_month&steg=kop&plats=mall')
    expect(screen.queryByText('Välj paketet som passar')).toBeNull()
  })

  it('utan spår: också direkt till köpsteget för Premium', () => {
    render(<PaywallCard variant="testniva" />)
    fireEvent.click(screen.getByRole('button', { name: KNAPP }))
    expect(window.location.href).toBe(kopstegHref('all_month', 'testniva'))
  })

  it('allt-spåret köper Premium', () => {
    render(<PaywallCard variant="jobbtraffar" track="allt" />)
    fireEvent.click(screen.getByRole('button', { name: KNAPP }))
    expect(window.location.href).toBe(kopstegHref('all_month', 'jobbtraffar'))
  })

  it('knappen ryms på 360 px: under 30 tecken', () => {
    expect(KNAPP.length).toBeLessThan(30)
  })
})

describe('kopstegHref', () => {
  it('bär paketet och steget', () => {
    expect(kopstegHref('all_month')).toBe('/dashboard/valj-spar?paket=all_month&steg=kop')
  })

  it('ett osålt paket leder till Premium', () => {
    expect(kopstegHref('cv_week')).toBe('/dashboard/valj-spar?paket=all_month&steg=kop')
    expect(kopstegHref('all_day', 'matning')).toBe('/dashboard/valj-spar?paket=all_month&steg=kop&plats=matning')
  })
})

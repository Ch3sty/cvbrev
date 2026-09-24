/**
 * Köpvägen i ett steg (docs/qa/qa-slutflode-2026-09-24.md, iakttagelse 1).
 * En köpknapp som namngett paket och pris går direkt till köpsteget för
 * paketet, också när kontot har ett sparat spår. Produktvalet och
 * spårvalet visas bara när inget paket står i knappen.
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

beforeEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, writable: true, value: { href: '' } })
})
afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, writable: true, value: ursprung })
})

describe('köpknappen i betalväggen', () => {
  it('med sparat spår: direkt till köpsteget, inget produktval', () => {
    render(<PaywallCard variant="mall" track="cv" />)
    fireEvent.click(screen.getByRole('button', { name: 'Köp CV-paketet, 79 kr i veckan' }))
    expect(window.location.href).toBe('/dashboard/valj-spar?paket=cv_week&steg=kop')
    expect(screen.queryByText('Välj paketet som passar')).toBeNull()
  })

  it('utan spår: också direkt till köpsteget', () => {
    render(<PaywallCard variant="testniva" />)
    fireEvent.click(screen.getByRole('button', { name: /^Köp Träningspaketet/ }))
    expect(window.location.href).toBe(kopstegHref('test_week'))
  })

  it('Hela paketet-spåret köper Hela paketet', () => {
    render(<PaywallCard variant="mall" track="allt" />)
    fireEvent.click(screen.getByRole('button', { name: /^Köp Hela paketet/ }))
    expect(window.location.href).toBe(kopstegHref('all_week'))
  })
})

describe('kopstegHref', () => {
  it('bär paketet och steget', () => {
    expect(kopstegHref('all_month')).toBe('/dashboard/valj-spar?paket=all_month&steg=kop')
  })
})

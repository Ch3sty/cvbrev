/**
 * Black Week och Cyber Monday på betalväggen (K1 och K6, beslut 2026-11-15).
 *
 * Dashboard-layouten lägger kampanjen i KampanjPrisProvider bara för konton
 * som aldrig haft Premium. Väggen visar då kampanjpriset i prisraden och
 * knappen och skickar kampanjnyckeln med mätningen. Utan provider, alltså
 * för ett konto som haft Premium eller utanför kampanjen, gäller ordinarie
 * pris och kampanj null.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const captureMock = vi.fn()

vi.mock('@/lib/analytics/events', () => ({
  capture: (...args: unknown[]) => captureMock(...args),
  identifyUser: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/tester',
}))

import PaywallCard from '../PaywallCard'
import { KampanjPrisProvider } from '@/components/kampanj/KampanjPrisKontext'
import { KAMPANJ_BY_NYCKEL, premiumKnapp, premiumPrisrad, visning } from '@/lib/kampanj/kampanj'

const BW = visning(KAMPANJ_BY_NYCKEL['black-week-2026'])
const CM = visning(KAMPANJ_BY_NYCKEL['cyber-monday-2026'])

describe('betalväggen under kampanjen', () => {
  beforeEach(() => captureMock.mockClear())

  it('Black Week: kampanjpriset i prisraden och knappen, nyckeln i mätningen', () => {
    render(
      <KampanjPrisProvider kampanj={BW}>
        <PaywallCard variant="testniva" />
      </KampanjPrisProvider>
    )
    expect(screen.getByText('Jobbcoach Premium, 99 kr första månaden, sedan 149 kr i månaden. Säg upp när du vill.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Köp Premium, 99 kr första månaden' })).toBeTruthy()
    const shown = captureMock.mock.calls.find(([n]) => n === 'paywall_shown')
    expect(shown?.[1]).toMatchObject({ kampanj: 'black-week-2026' })
    screen.getByRole('button', { name: 'Köp Premium, 99 kr första månaden' }).click()
    const klick = captureMock.mock.calls.find(([n]) => n === 'paywall_cta_clicked')
    expect(klick?.[1]).toMatchObject({ kampanj: 'black-week-2026' })
  })

  it('Cyber Monday: samma mönster med 49 kr', () => {
    render(
      <KampanjPrisProvider kampanj={CM}>
        <PaywallCard variant="test-tak" />
      </KampanjPrisProvider>
    )
    expect(screen.getByText('Jobbcoach Premium, 49 kr första månaden, sedan 149 kr i månaden. Säg upp när du vill.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Köp Premium, 49 kr första månaden' })).toBeTruthy()
  })

  it('utan kampanj (eller konto som haft Premium): ordinarie pris och kampanj null', () => {
    render(
      <KampanjPrisProvider kampanj={null}>
        <PaywallCard variant="mall" />
      </KampanjPrisProvider>
    )
    expect(screen.getByText('Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Köp Premium, 149 kr i månaden' })).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/(^|[^1])(99|49) kr/)
    const shown = captureMock.mock.calls.find(([n]) => n === 'paywall_shown')
    expect(shown?.[1]).toMatchObject({ kampanj: null })
  })

  it('en spårkund (har redan en prenumeration) ser aldrig kampanjpriset', () => {
    render(
      <KampanjPrisProvider kampanj={BW}>
        <PaywallCard variant="mall" scope="tester" />
      </KampanjPrisProvider>
    )
    expect(document.body.textContent).not.toMatch(/(^|[^1])99 kr/)
  })

  it('testrummets prisrad och knapp följer samma helpers', () => {
    expect(premiumPrisrad(null)).toBe('Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill.')
    expect(premiumPrisrad(BW)).toBe('Jobbcoach Premium, 99 kr första månaden, sedan 149 kr i månaden. Säg upp när du vill.')
    expect(premiumKnapp(null)).toBe('Köp Premium, 149 kr i månaden')
    expect(premiumKnapp(CM)).toBe('Köp Premium, 49 kr första månaden')
  })
})

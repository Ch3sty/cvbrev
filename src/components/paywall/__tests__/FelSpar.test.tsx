// FelSpar: mätningen, och att raden aldrig är varm.
//
// feature_blocked är planens viktigaste händelse (avsnitt 6): den mäter var
// fel spår tar i taket. Dubbelräkning förstör den, så den ska skjutas exakt
// en gång per montering och aldrig per omritning.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const captureMock = vi.fn()

vi.mock('@/lib/analytics/events', () => ({
  capture: (...args: unknown[]) => captureMock(...args),
}))

const refreshMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock, push: vi.fn(), replace: vi.fn() }),
}))

import FelSpar, { FelSparRad } from '../FelSpar'

describe('FelSparRad', () => {
  beforeEach(() => captureMock.mockClear())

  it('skjuter feature_blocked exakt en gång per montering', () => {
    const { rerender } = render(
      <FelSparRad feature="cv_templates_all" scope="tester" surface="/dashboard/cv-mallar" />
    )

    const blockerade = captureMock.mock.calls.filter(([n]) => n === 'feature_blocked')
    expect(blockerade).toHaveLength(1)
    expect(blockerade[0][1]).toMatchObject({
      feature: 'cv_templates_all',
      scope: 'tester',
      surface: '/dashboard/cv-mallar',
    })

    rerender(
      <FelSparRad
        feature="cv_templates_all"
        scope="tester"
        surface="/dashboard/cv-mallar"
        className="mt-4"
      />
    )
    expect(captureMock.mock.calls.filter(([n]) => n === 'feature_blocked')).toHaveLength(1)
  })

  it('skjuter upgrade_shown för statusraden', () => {
    render(<FelSparRad feature="cv_templates_all" scope="tester" surface="/x" />)
    const visade = captureMock.mock.calls.filter(([n]) => n === 'upgrade_shown')
    expect(visade).toHaveLength(1)
    expect(visade[0][1]).toMatchObject({ from_scope: 'tester', to_scope: 'allt', surface: 'statusrad' })
  })

  it('säger vad paketet ger, inte vad det saknar', () => {
    render(<FelSparRad feature="cv_templates_all" scope="tester" surface="/x" />)
    expect(screen.getByText(/Du har Träningspaketet/)).toBeTruthy()
  })

  it('renderar ingenting för Allt eller för gratisnivån', () => {
    const { container: a } = render(<FelSparRad feature="cv_templates_all" scope="allt" surface="/x" />)
    expect(a).toBeEmptyDOMElement()
    const { container: b } = render(<FelSparRad feature="cv_templates_all" scope={null} surface="/x" />)
    expect(b).toBeEmptyDOMElement()
  })
})

describe('FelSpar, kortet i arket', () => {
  beforeEach(() => captureMock.mockClear())

  it('visar mellanskillnaden och prorationen, aldrig hela paketpriset', () => {
    render(
      <FelSpar feature="cv_templates_all" scope="tester" priceDeltaKr={20} open onClose={() => {}} />
    )
    expect(screen.getByText('Mellanskillnad, 20 kr')).toBeTruthy()
    expect(screen.getByText(/räknas av/)).toBeTruthy()
    expect(screen.queryByText(/99 kr/)).toBeNull()
  })

  it('skjuter upgrade_shown för arket när det öppnas', () => {
    render(<FelSpar feature="cv_templates_all" scope="tester" open onClose={() => {}} />)
    const visade = captureMock.mock.calls.filter(([n]) => n === 'upgrade_shown')
    expect(visade).toHaveLength(1)
    expect(visade[0][1]).toMatchObject({ surface: 'ark' })
  })

  it('knappen säger att den leder till en betalning', () => {
    render(<FelSpar feature="cv_templates_all" scope="tester" open onClose={() => {}} />)
    expect(screen.getByRole('button', { name: 'Byt till Hela paketet, 20 kr till i veckan' })).toBeTruthy()
  })
})

// Köptestet 2026-09-24, bugg 3: rutten svarar { upgraded: true } utan url vid
// ett lyckat byte och 409 när ett paket redan löper. Båda ska synas.
describe('FelSpar, svaret på knappen', () => {
  beforeEach(() => {
    captureMock.mockClear()
    refreshMock.mockClear()
  })

  const svara = (status: number, body: unknown) =>
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
    )

  it('ett lyckat byte ger bekräftelsen och hämtar om sidan när arket stängs', async () => {
    svara(200, { upgraded: true, planKey: 'all_week', scope: 'allt' })
    const onClose = vi.fn()
    render(<FelSpar feature="cv_templates_all" scope="tester" open onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /Byt till Hela paketet/ }))
    await waitFor(() => expect(screen.getByText('Du har nu Hela paketet')).toBeTruthy())
    expect(screen.queryByRole('button', { name: /Byt till Hela paketet/ })).toBeNull()
    expect(refreshMock).not.toHaveBeenCalled()
    fireEvent.click(screen.getAllByRole('button', { name: /Stäng/ })[0])
    expect(onClose).toHaveBeenCalled()
    expect(refreshMock).toHaveBeenCalledTimes(1)
  })

  it('409 säger varför och länkar till prenumerationssidan', async () => {
    svara(409, { error: 'Du har redan en aktiv prenumeration.', alreadySubscribed: true })
    render(<FelSpar feature="cv_templates_all" scope="tester" open onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Byt till Hela paketet/ }))
    await waitFor(() =>
      expect(screen.getByText('Du har redan ett paket som löper. Byt paket från prenumerationssidan.')).toBeTruthy()
    )
    const lank = screen.getByRole('link', { name: 'Till prenumerationen' })
    expect(lank.getAttribute('href')).toBe('/dashboard/profil/prenumeration')
    expect(refreshMock).not.toHaveBeenCalled()
  })
})

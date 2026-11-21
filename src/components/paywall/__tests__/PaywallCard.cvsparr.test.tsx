/**
 * CV-rummets spärrar vid nedladdning (omgång 1, steg 2): samma texter, pris,
 * köp och mätning som kortet, bara ritningen byts. Talrutan med plus i
 * analysen finns bara när en analys finns.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const captureMock = vi.fn()
vi.mock('@/lib/analytics/events', () => ({
  capture: (...args: unknown[]) => captureMock(...args),
  identifyUser: vi.fn(),
}))
vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard/cv-mallar' }))
vi.mock('@/hooks/use-profile', () => ({
  useProfile: () => ({ premiumSource: null, premiumUntil: null, hasStripeSubscription: false }),
}))

import PaywallCard from '../PaywallCard'
import { getPaywallCopy } from '../paywall-copy'
import { MALL_KATALOG } from '@/lib/cv/mallval/katalog'
import type { CvSparrData } from '@/components/cv/rum3/sparr/CvSparr'

const koppar = MALL_KATALOG.find((m) => m.id === 'koppar')!
const data = (plus: number | null): CvSparrData => ({
  mall: koppar,
  cv: null,
  antalMallar: MALL_KATALOG.length,
  antalWord: MALL_KATALOG.filter((m) => m.word).length,
  plusPoang: plus,
  fria: MALL_KATALOG.filter((m) => m.niva === 'gratis'),
})
const ursprung = window.location

describe('PaywallCard, utseendet cv', () => {
  beforeEach(() => {
    captureMock.mockClear()
    Object.defineProperty(window, 'location', { configurable: true, writable: true, value: { href: '' } })
  })
  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, writable: true, value: ursprung })
  })

  it('bär dagens rubrik, brödtext, prisrad och knapp för varianten mall', () => {
    const copy = getPaywallCopy('mall')
    render(<PaywallCard variant="mall" utseende="cv" cvSparr={data(22)} onSecondary={() => undefined} bare />)
    expect(screen.getByText(copy.title)).toBeTruthy()
    expect(screen.getByText(copy.body)).toBeTruthy()
    expect(screen.getByRole('button', { name: copy.primary })).toBeTruthy()
    expect(screen.getByText('Skicka CV:t precis som det ser ut här')).toBeTruthy()
    expect(screen.getByText(String(MALL_KATALOG.length))).toBeTruthy()
    expect(screen.getByText('+22')).toBeTruthy()
  })

  it('mäter visningen en gång och gratisvägen som sekundär', () => {
    const fria = vi.fn()
    render(<PaywallCard variant="mall" utseende="cv" cvSparr={data(null)} onSecondary={fria} bare />)
    expect(captureMock.mock.calls.filter((c) => c[0] === 'paywall_shown')).toHaveLength(1)
    expect(screen.queryByText(/^\+/)).toBeNull()
    fireEvent.click(screen.getAllByRole('button', { name: /Välj bland de/ })[0])
    expect(fria).toHaveBeenCalledTimes(1)
    const klick = captureMock.mock.calls.find((c) => c[0] === 'paywall_cta_clicked')
    expect(klick?.[1]).toMatchObject({ variant: 'mall', cta: 'secondary', plats: 'mall' })
  })

  it('köpknappen går till köpsteget med platsen', () => {
    const copy = getPaywallCopy('cv-export-word')
    render(<PaywallCard variant="cv-export-word" utseende="cv" cvSparr={data(null)} bare />)
    fireEvent.click(screen.getByRole('button', { name: copy.primary }))
    expect(window.location.href).toContain('cv_export_word')
    expect(screen.queryByRole('button', { name: /Välj bland de/ })).toBeNull()
  })
})

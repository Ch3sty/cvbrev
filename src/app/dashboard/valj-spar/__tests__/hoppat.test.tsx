/**
 * Frågan "Vad vill du börja med?" ställs högst en gång
 * (docs/qa/qa-slutflode-2026-09-24.md, iakttagelse 2). Den som hoppade över
 * steg 1 i registreringen landar i spårvalet med ?hoppat=1, och Börja gratis
 * går då direkt till hemskärmen utan gratisfrågan.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { landningsgren, HOPPAT_PARAM, type SignupCookie } from '@/components/registrering/intent'
import { KOPSTEG, SPARVAL } from '@/components/pricing/paket-copy'
import { SPARVAL_GRATIS } from '@/lib/onboarding/program'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn() }), usePathname: () => '/dashboard/valj-spar' }))
vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn(), identifyUser: vi.fn() }))

import ValjSparClient, { kopSource } from '../ValjSparClient'

// FlowShell mäter sin fot med ResizeObserver, som jsdom saknar.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const SPARVAL_PATH = '/dashboard/valj-spar'
const bas: SignupCookie = { intent: null, entry: 'header', skipped: false, smakprov: null, paket: null, redirect: null }

describe('landningen efter Hoppa över', () => {
  it('hoppade över: spårvalet får veta det', () => {
    expect(landningsgren({ ...bas, skipped: true }, SPARVAL_PATH)).toEqual({
      via: 'sparval',
      destination: `${SPARVAL_PATH}?${HOPPAT_PARAM}=1`,
    })
  })

  it('utan cookie eller utan att hoppa: vanliga spårvalet', () => {
    expect(landningsgren(null, SPARVAL_PATH)).toEqual({ via: 'sparval', destination: SPARVAL_PATH })
    expect(landningsgren(bas, SPARVAL_PATH)).toEqual({ via: 'sparval', destination: SPARVAL_PATH })
  })
})

describe('Börja gratis i köpsteget', () => {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }))
  beforeEach(() => {
    push.mockClear()
    fetchMock.mockClear()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('efter Hoppa över: direkt till hemskärmen, ingen fråga till', async () => {
    render(<ValjSparClient initialTrack={null} utanGratisfraga />)
    fireEvent.click(screen.getByRole('button', { name: SPARVAL.sekundar }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'))
    expect(screen.queryByText(SPARVAL_GRATIS.fraga)).toBeNull()
    const kropp = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    expect(kropp).toEqual({ track: null })
  })

  it('utan Hoppa över ställs frågan en gång, som förut', () => {
    render(<ValjSparClient initialTrack={null} />)
    fireEvent.click(screen.getByRole('button', { name: SPARVAL.sekundar }))
    expect(screen.getByText(SPARVAL_GRATIS.fraga)).toBeTruthy()
    expect(push).not.toHaveBeenCalled()
  })

  it('med ett sparat spår går Börja gratis direkt till hemskärmen', async () => {
    render(<ValjSparClient initialTrack="cv" />)
    fireEvent.click(screen.getByRole('button', { name: SPARVAL.sekundar }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'))
  })
})

// Spec-rummen våg 5: bara Jobbcoach Premium säljs. Köpsteget visas direkt,
// utan spårval och utan längdval.
describe('köpsteget', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    push.mockClear()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  const svar = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

  it('visar Premium direkt: fulla namnet i rubriken, prisraden i kort form', () => {
    render(<ValjSparClient initialTrack={null} />)
    expect(screen.getByRole('heading', { name: 'Jobbcoach Premium' })).toBeTruthy()
    expect(screen.getByText(KOPSTEG.prisrad())).toBeTruthy()
    expect(screen.queryByRole('radiogroup')).toBeNull()
    expect(screen.getByRole('button', { name: KOPSTEG.primar() })).toBeTruthy()
  })

  it('skickar platsen som source till kassan', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.includes('onboarding') ? svar(200, { ok: true }) : svar(200, { url: 'https://checkout.stripe.com/x' })
    )
    const href = vi.spyOn(window, 'location', 'get')
    href.mockReturnValue({ href: '' } as Location)
    render(<ValjSparClient initialTrack="allt" plats="matning" />)
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: KOPSTEG.primar() }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const anrop = fetchMock.mock.calls.find(([u]) => String(u).includes('create-plan-session'))!
    const kropp = JSON.parse((anrop[1] as RequestInit).body as string)
    expect(kropp).toEqual({ plan: 'all_month', source: 'betalvagg:matning', consent: true })
    href.mockRestore()
  })

  it('400 med saljs: false visas som fel, aldrig som klart', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.includes('onboarding')
        ? svar(200, { ok: true })
        : svar(400, { error: 'Jobbcoach Premium är det vi säljer i dag.', saljs: false, plan: 'all_month' })
    )
    render(<ValjSparClient initialTrack="allt" />)
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: KOPSTEG.primar() }))
    await waitFor(() => expect(screen.getByText(KOPSTEG.saljsInte)).toBeTruthy())
  })
})

describe('kopSource', () => {
  it('prissidan, registreringen och prenumerationen står för sig, resten är en betalvägg', () => {
    expect(kopSource('priser')).toBe('priser')
    expect(kopSource('registrering')).toBe('registrering')
    expect(kopSource('prenumeration')).toBe('prenumeration')
    expect(kopSource('matning')).toBe('betalvagg:matning')
    expect(kopSource(null)).toBe('onboarding_paket')
  })
})

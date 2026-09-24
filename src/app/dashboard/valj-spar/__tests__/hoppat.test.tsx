/**
 * Frågan "Vad vill du börja med?" ställs högst en gång
 * (docs/qa/qa-slutflode-2026-09-24.md, iakttagelse 2). Den som hoppade över
 * steg 1 i registreringen landar i spårvalet med ?hoppat=1, och Börja gratis
 * går då direkt till hemskärmen utan gratisfrågan.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { landningsgren, HOPPAT_PARAM, type SignupCookie } from '@/components/registrering/intent'
import { SPARVAL } from '@/components/pricing/paket-copy'
import { SPARVAL_GRATIS } from '@/lib/onboarding/program'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn() }), usePathname: () => '/dashboard/valj-spar' }))
vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn(), identifyUser: vi.fn() }))

import ValjSparClient from '../ValjSparClient'

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

describe('Börja gratis i spårvalet', () => {
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

  it('med paket i adressen öppnas köpsteget direkt', () => {
    render(<ValjSparClient initialTrack="cv" initialPlanKey="cv_week" oppnaKopsteg />)
    expect(screen.getByText('Steg 2 av 2')).toBeTruthy()
  })
})

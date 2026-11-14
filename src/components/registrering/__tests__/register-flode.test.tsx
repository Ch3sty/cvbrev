/**
 * Fråga 1 i registreringen är borttagen (ägarens beslut 2026-11-08, kill-regeln
 * med 61 till 65 procent tapp). Bar /register går direkt till kontosteget med
 * skipped, och frågan ställs i spårvalet efteråt. ?borja= har kvar valraden
 * och Ändra.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }) }))
const capture = vi.fn()
vi.mock('@/lib/analytics/events', () => ({ capture: (...a: unknown[]) => capture(...a), identifyUser: vi.fn() }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: {} }) }))
vi.mock('@/components/auth/GoogleSignInButton', () => ({
  default: ({ onBeforeRedirect, label }: { onBeforeRedirect?: () => void; label: string }) => (
    <button type="button" onClick={() => onBeforeRedirect?.()}>
      {label}
    </button>
  ),
  AuthDivider: () => null,
}))

import RegisterFlode from '../RegisterFlode'
import { registerIngang, lasSignupCookie, landningsgren, SIGNUP_COOKIE } from '../intent'
import { STEG1, STEG2 } from '../registrering-copy'

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const ur = (q: string) => {
  const p = new URLSearchParams(q)
  return (n: string) => p.get(n)
}

function cookie() {
  const rad = document.cookie.split('; ').find((r) => r.startsWith(`${SIGNUP_COOKIE}=`))
  return lasSignupCookie(rad?.slice(SIGNUP_COOKIE.length + 1))
}

describe('bar /register', () => {
  beforeEach(() => {
    cleanup()
    capture.mockClear()
    document.cookie = `${SIGNUP_COOKIE}=; Path=/; Max-Age=0`
  })

  it('visar kontosteget direkt, utan frågan och utan stegräknare', () => {
    render(<RegisterFlode ingang={registerIngang(ur(''))} />)
    expect(screen.getByRole('heading', { level: 1, name: STEG2.rubrik })).toBeTruthy()
    expect(screen.queryByText(STEG1.steg)).toBeNull()
    expect(screen.queryByText(STEG2.steg)).toBeNull()
    const vyer = capture.mock.calls.filter(([n]) => n === 'signup_flow_viewed').map(([, p]) => (p as { step: string }).step)
    expect(vyer).toEqual(['konto'])
  })

  it('kontosteget har två fält, e-post och lösenord, och inget namnfält (2026-11-09)', () => {
    render(<RegisterFlode ingang={registerIngang(ur(''))} />)
    expect(screen.getByLabelText(STEG2.epost)).toBeTruthy()
    expect(screen.getByLabelText(STEG2.losen)).toBeTruthy()
    expect(screen.queryByLabelText('Namn')).toBeNull()
    expect(document.querySelector('input[autocomplete="name"]')).toBeNull()
  })

  it('smakprovets kontosteg har inte heller något namnfält', () => {
    render(<RegisterFlode ingang={registerIngang(ur('test=abc'))} />)
    expect(document.querySelector('input[autocomplete="name"]')).toBeNull()
    expect(document.querySelectorAll('form input:not([type="hidden"]):not([type="checkbox"])').length).toBe(2)
  })

  it('cookien bär skipped och att frågan inte visats, så spårvalet ställer den', () => {
    render(<RegisterFlode ingang={registerIngang(ur(''))} />)
    fireEvent.click(screen.getByRole('button', { name: STEG2.google }))
    const c = cookie()
    expect(c).toMatchObject({ intent: null, skipped: true, fragaVisad: false })
    expect(landningsgren(c, '/dashboard/valj-spar')).toEqual({ via: 'sparval', destination: '/dashboard/valj-spar' })
  })

  it('efter provet: panelen med resultatet och signup_flow_viewed en gång (skissen 2026-11-09)', () => {
    const token = '11111111-2222-4333-8444-555555555555'
    render(
      <RegisterFlode
        ingang={registerIngang(ur(`test=${token}`))}
        provResultat={{ ratt: 4, totalt: 5, fel: [2] }}
      />
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Se vad du missade' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Kontot visar fråga 3 och regeln bakom' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Fråga 3 fel, de andra rätt' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Skapa konto och se svaren' })).toBeTruthy()
    const vyer = capture.mock.calls.filter(([n]) => n === 'signup_flow_viewed')
    expect(vyer).toHaveLength(1)
    expect(vyer[0][1]).toMatchObject({ step: 'konto', entry: 'smakprov' })
  })

  it('utan resultat från servern visas panelen utan tal, aldrig ett påhittat', () => {
    const token = '11111111-2222-4333-8444-555555555555'
    render(<RegisterFlode ingang={registerIngang(ur(`test=${token}`))} provResultat={null} />)
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'Kontot visar alla svar och regeln bakom varje mönster' })).toBeTruthy()
  })

  it('?borja= har kvar valraden och Ändra, som öppnar frågan', () => {
    render(<RegisterFlode ingang={registerIngang(ur('borja=tester'))} />)
    expect(screen.getByText(STEG2.steg)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: STEG2.andra }))
    expect(screen.getByText(STEG1.steg)).toBeTruthy()
  })
})

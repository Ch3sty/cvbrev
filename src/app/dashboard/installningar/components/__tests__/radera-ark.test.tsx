/**
 * Raderingsarket på webben (beslut-mejl-och-radering 2c punkt 6): frågan om
 * anledning, raderna om prenumerationen och lydelserna R1 till R11.
 * Inget raderas: fetch, Supabase och profilen är utbytta.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react'

const h = vi.hoisted(() => ({
  profil: null as Record<string, unknown> | null,
  success: vi.fn(),
}))

vi.mock('@/components/shell/Sheet', () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) => (open ? <div>{children}</div> : null),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/hooks/use-profile', () => ({ useProfile: () => ({ profile: h.profil }) }))
vi.mock('@/context/notificationcontext', () => ({ useNotification: () => ({ successWithMascot: h.success }) }))
vi.mock('@/lib/supabase/client-manager', () => ({
  getSupabaseClient: () => ({ auth: { signOut: vi.fn(async () => ({})) } }),
}))
vi.mock('@/lib/activity-logger', () => ({ logUserActivity: vi.fn(async () => undefined) }))
vi.mock('@/lib/lagring/kontoLagring', () => ({ vidUtloggning: vi.fn() }))

import { RaderaKonto } from '../KontoSection'
import { prenumerationsLage, useKontoHandlingar } from '../useKontoHandlingar'
import { RADERA_TEXT } from '@/lib/konto/radera-copy'
import { ANLEDNINGAR } from '@/lib/konto/avslut'
import { KONTO_SEKTION } from '@/app/dashboard/profil/profil-copy'

function ark(over: { stripe?: boolean; play?: boolean } = {}) {
  const onDeleteAccount = vi.fn(async (_a: unknown) => undefined)
  render(
    <RaderaKonto
      harStripePrenumeration={over.stripe ?? false}
      harPlayPrenumeration={over.play ?? false}
      onAvbryt={() => {}}
      onDeleteAccount={onDeleteAccount}
    />
  )
  return { onDeleteAccount }
}

const chip = (etikett: string) => screen.getByRole('button', { name: etikett })

describe('frågan om anledning', () => {
  it('sex chips i ordning, inget förvalt', () => {
    ark()
    expect(screen.getByText(RADERA_TEXT.R6)).toBeTruthy()
    expect(screen.getByText(RADERA_TEXT.R7)).toBeTruthy()
    for (const a of ANLEDNINGAR) expect(chip(a.etikett).getAttribute('aria-pressed')).toBe('false')
  })

  it('ett tryck väljer, ett annat chip byter, ett andra tryck på valt chip avmarkerar', () => {
    ark()
    fireEvent.click(chip('För dyrt'))
    expect(chip('För dyrt').getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(chip('Har fått jobb'))
    expect(chip('Har fått jobb').getAttribute('aria-pressed')).toBe('true')
    expect(chip('För dyrt').getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(chip('Har fått jobb'))
    expect(chip('Har fått jobb').getAttribute('aria-pressed')).toBe('false')
  })

  it('valet följer med till raderingen, och null utan val', async () => {
    const { onDeleteAccount } = ark()
    fireEvent.click(chip('Vill ta bort mina uppgifter'))
    fireEvent.change(screen.getByLabelText(/för att bekräfta/), { target: { value: 'radera mitt konto' } })
    fireEvent.click(screen.getByRole('button', { name: 'Radera permanent' }))
    await waitFor(() => expect(onDeleteAccount).toHaveBeenCalledWith('integritet'))
  })

  it('utan val skickas null', async () => {
    const { onDeleteAccount } = ark()
    fireEvent.change(screen.getByLabelText(/för att bekräfta/), { target: { value: 'radera mitt konto' } })
    fireEvent.click(screen.getByRole('button', { name: 'Radera permanent' }))
    await waitFor(() => expect(onDeleteAccount).toHaveBeenCalledWith(null))
  })
})

describe('raderna om prenumerationen', () => {
  it('R4 bara med Stripe-prenumeration', () => {
    ark({ stripe: true })
    expect(screen.getByText(RADERA_TEXT.R4)).toBeTruthy()
    expect(screen.queryByText(RADERA_TEXT.R4b)).toBeNull()
  })

  it('R4b bara med Play-prenumeration', () => {
    ark({ play: true })
    expect(screen.getByText(RADERA_TEXT.R4b)).toBeTruthy()
    expect(screen.queryByText(RADERA_TEXT.R4)).toBeNull()
  })

  it('utan prenumeration ingen av dem, och den gamla osanna meningen finns inte', () => {
    const { container } = render(
      <RaderaKonto harStripePrenumeration={false} harPlayPrenumeration={false} onAvbryt={() => {}} onDeleteAccount={async () => {}} />
    )
    expect(container.textContent).not.toContain(RADERA_TEXT.R4)
    expect(container.textContent).not.toContain(RADERA_TEXT.R4b)
    expect(container.textContent).not.toMatch(/sägs inte upp automatiskt/)
  })

  it('R2, R3, R5 och länken till datalagringen står i arket', () => {
    ark()
    expect(screen.getByText(RADERA_TEXT.R2)).toBeTruthy()
    for (const rad of RADERA_TEXT.R3) expect(screen.getByText(rad)).toBeTruthy()
    expect(screen.getByText(RADERA_TEXT.R5, { exact: false })).toBeTruthy()
    expect(screen.getByRole('link', { name: RADERA_TEXT.R5lank }).getAttribute('href')).toBe('/integritetspolicy#datalagring')
  })

  it('prenumerationsLage läser Stripe-status och Play med giltig tid', () => {
    const nu = new Date('2026-11-22T12:00:00Z')
    expect(prenumerationsLage({ subscription_status: 'past_due' }, nu)).toEqual({ harStripePrenumeration: true, harPlayPrenumeration: false })
    expect(prenumerationsLage({ subscription_status: 'canceled' }, nu).harStripePrenumeration).toBe(false)
    expect(prenumerationsLage({ premium_source: 'play', premium_until: '2026-12-01T00:00:00Z' }, nu).harPlayPrenumeration).toBe(true)
    expect(prenumerationsLage({ premium_source: 'play', premium_until: '2026-11-01T00:00:00Z' }, nu).harPlayPrenumeration).toBe(false)
    expect(prenumerationsLage(null, nu)).toEqual({ harStripePrenumeration: false, harPlayPrenumeration: false })
  })
})

describe('useKontoHandlingar', () => {
  beforeEach(() => {
    h.success.mockClear()
    vi.restoreAllMocks()
  })

  it('valet skickas i DELETE-kroppen och bekräftelsen är R9b med Stripe-prenumeration', async () => {
    h.profil = { id: 'u1', subscription_status: 'active' }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ raderat: true }), { status: 200 }))
    vi.spyOn(window, 'setTimeout').mockImplementation((() => 0) as never)
    const { result } = renderHook(() => useKontoHandlingar())
    await act(() => result.current.handleDeleteAccount('for_dyrt'))
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/konto/radera')
    expect(init.method).toBe('DELETE')
    expect(JSON.parse(String(init.body))).toEqual({ anledning: 'for_dyrt' })
    expect(h.success.mock.calls[0][0]).toBe(RADERA_TEXT.R9b)
  })

  it('utan prenumeration är bekräftelsen R9a och ingen aktivitetsrad skrivs', async () => {
    h.profil = { id: 'u1', subscription_status: null }
    const { logUserActivity } = await import('@/lib/activity-logger')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    vi.spyOn(window, 'setTimeout').mockImplementation((() => 0) as never)
    const { result } = renderHook(() => useKontoHandlingar())
    await act(() => result.current.handleDeleteAccount(null))
    expect(h.success.mock.calls[0][0]).toBe(RADERA_TEXT.R9a)
    expect(logUserActivity).not.toHaveBeenCalled()
  })
})

describe('lydelserna', () => {
  it('R1 står under länken Radera mitt konto', () => {
    expect(KONTO_SEKTION.raderaText).toBe(RADERA_TEXT.R1)
  })

  it('inga tankstreck och inga emoji i R1 till R11', () => {
    const alla = Object.values(RADERA_TEXT).flatMap((v) => (Array.isArray(v) ? v : [v]))
    for (const t of alla) {
      expect(t).not.toContain('—')
      expect(t).not.toMatch(/\p{Extended_Pictographic}/u)
    }
  })
})

/**
 * Kontraktet för personlighetsprovet (Personlighetsprov.tsx) på
 * /verktyg/personlighetstest och i artiklarna map-test-personlighetstest och
 * personlighetstest-jobb-guide, omgång 2 steg C.
 *
 * Ombyggnaden får ändra panelen, men inte det här: reglaget som radiogrupp
 * med fem lägen, POST-kroppen mot /api/public/personlighetsprov (som ska
 * klara serverns validerBegaran: uuid-token från klienten, tjugo unika svar
 * 1 till 5, slug), händelserna sample_started, sample_completed och
 * signup_gate_shown med kind 'personality', signup_started med source_page,
 * token i sessionStorage (storePendingPersonlighet), spärren
 * data-cta="personlighetsprov-gate" mot /register?personlighet=<token>,
 * inloggad data-cta="personlighetsprov-konto", och kvotens spärr mot /register.
 * Panelen har inga data-cta-position (räknas inte som reklamkort) och inga
 * rubriker (artikelns rubrikträd).
 */

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const capture = vi.fn()
vi.mock('@/lib/analytics/events', () => ({ capture: (...a: unknown[]) => capture(...a), identifyUser: vi.fn() }))

import Personlighetsprov from '@/components/artiklar/personlighetsprov/Personlighetsprov'
import { validerBegaran } from '@/lib/personlighet/smakprov-validering'
import { ANTAL_PASTAENDEN } from '@/lib/personlighet/smakprov-pastaenden'

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

function json(status: number, data: unknown) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(data) } as Response)
}

function profil(token: string, href?: string) {
  const f = (key: string, namn: string) => ({ key, namn, band: 'mitt', bandOrd: 'I mitten', segment: 3, lasning: 'En läsning.' })
  return {
    token,
    mening: 'Du är en sådan som rekryteraren läser som stabil.',
    faktorer: [
      f('openness', 'Öppenhet'),
      f('conscientiousness', 'Samvetsgrannhet'),
      f('extraversion', 'Extraversion'),
      f('agreeableness', 'Vänlighet'),
      f('stability', 'Stabilitet'),
    ],
    lockedCounts: { krav: 6, intervju: 5, omvanda: 3 },
    expiresAt: href ? null : '2026-11-27T00:00:00Z',
    ...(href ? { href } : {}),
  }
}

function handelse(namn: string) {
  return capture.mock.calls.filter(([n]) => n === namn).map(([, p]) => p)
}

/** Klockan flyttas fram (160 ms per svar, minst 450 ms laddning) i stället för att vänta på riktigt. */
const vanta = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

/** Svarar på alla tjugo påståenden via reglagets radioknappar. */
async function svaraAlla(varde = 4) {
  for (let i = 0; i < ANTAL_PASTAENDEN; i++) {
    const lagen = screen.getAllByRole('radio')
    expect(lagen).toHaveLength(5)
    fireEvent.click(lagen[varde - 1])
    await vanta(200)
  }
}

let fetchMock: ReturnType<typeof vi.fn>
let svar: (body: { token: string }) => Promise<Response>

beforeEach(() => {
  cleanup()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  capture.mockClear()
  sessionStorage.clear()
  svar = (body) => json(200, profil(body.token))
  fetchMock = vi.fn((_url: string, init?: RequestInit) => svar(JSON.parse(String(init?.body))))
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe.each<[string, string]>([
  ['map-test-personlighetstest', '/artiklar/map-test-personlighetstest'],
  ['personlighetstest-jobb-guide', '/artiklar/personlighetstest-jobb-guide'],
  ['verktyg/personlighetstest', '/verktyg/personlighetstest'],
])('personlighetsprovet, slug %s', (slug, kallsida) => {
  it('tjugo svar, kroppen, händelserna, token och spärren', async () => {
    render(<Personlighetsprov slug={slug} />)

    // Inbjudan: påstående 1 och reglaget syns direkt, utan rubriker och utan reklamkortets attribut.
    expect(screen.getAllByRole('radio')).toHaveLength(5)
    expect(document.querySelectorAll('h1, h2, h3')).toHaveLength(0)
    expect(document.querySelector('[data-cta-position]')).toBeNull()

    await svaraAlla(4)
    await vanta(600)
    await waitFor(() => expect(handelse('sample_completed')).toHaveLength(1), { timeout: 3000 })

    expect(handelse('sample_started')).toEqual([{ kind: 'personality', cluster: 'test', slug }])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/public/personlighetsprov')
    expect(init.method).toBe('POST')
    const body = JSON.parse(String(init.body))
    expect(Object.keys(body).sort()).toEqual(['answers', 'slug', 'token'])
    expect(body.slug).toBe(slug)
    expect(body.answers).toHaveLength(ANTAL_PASTAENDEN)
    expect(body.answers.every((a: { value: number }) => a.value === 4)).toBe(true)
    // Servern ska godta kroppen som den är.
    expect(validerBegaran(body)).not.toBeNull()

    expect(handelse('sample_completed')[0]).toMatchObject({ kind: 'personality', cluster: 'test', slug })
    expect(handelse('signup_gate_shown')).toEqual([{ kind: 'personality', cluster: 'test', slug }])
    expect(sessionStorage.getItem('jc_pending_personlighet')).toBe(body.token)

    const gate = document.querySelector<HTMLAnchorElement>('a[data-cta="personlighetsprov-gate"]')
    expect(gate).not.toBeNull()
    expect(gate!.getAttribute('href')).toBe(`/register?personlighet=${body.token}`)
    expect(document.querySelectorAll('h1, h2, h3')).toHaveLength(0)
    gate!.addEventListener('click', (e) => e.preventDefault())
    fireEvent.click(gate!)
    expect(handelse('signup_started')).toEqual([{ cluster: 'test', source_page: kallsida }])
  }, 15000)
})

it('inloggad: länken till profilen med data-cta="personlighetsprov-konto", ingen spärr och ingen väntande token', async () => {
  svar = (body) => json(200, profil(body.token, `/dashboard/intervju/profil/${body.token}`))
  render(<Personlighetsprov slug="map-test-personlighetstest" />)
  await svaraAlla(2)
  await vanta(600)
  await waitFor(() => expect(handelse('sample_completed')).toHaveLength(1), { timeout: 3000 })
  const body = JSON.parse(String((fetchMock.mock.calls[0] as [string, RequestInit])[1].body))
  const konto = document.querySelector<HTMLAnchorElement>('a[data-cta="personlighetsprov-konto"]')
  expect(konto?.getAttribute('href')).toBe(`/dashboard/intervju/profil/${body.token}`)
  expect(document.querySelector('a[data-cta="personlighetsprov-gate"]')).toBeNull()
  expect(handelse('signup_gate_shown')).toHaveLength(0)
  expect(sessionStorage.getItem('jc_pending_personlighet')).toBeNull()
}, 15000)

it('kvoten: spärren med data-cta="personlighetsprov-gate" mot /register', async () => {
  svar = () => json(429, { error: 'rate_limited', message: 'Du har gjort tre personlighetstest idag.', registerHref: '/register' })
  render(<Personlighetsprov slug="verktyg/personlighetstest" />)
  await svaraAlla(3)
  await vanta(600)
  await waitFor(() => expect(document.querySelector('a[data-cta="personlighetsprov-gate"]')).not.toBeNull(), { timeout: 3000 })
  expect(document.querySelector('a[data-cta="personlighetsprov-gate"]')!.getAttribute('href')).toBe('/register')
  expect(document.body.textContent).toContain('Du har gjort tre personlighetstest idag.')
  expect(handelse('sample_completed')).toHaveLength(0)
}, 15000)

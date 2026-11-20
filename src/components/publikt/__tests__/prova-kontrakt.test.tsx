/**
 * Kontraktet för /verktyg/rekryteringstester/prova (ProvaFlow), omgång 2
 * steg C. Ombyggnaden till sessionsramen får ändra skalet och vyerna, men
 * inte det här: data-cta="prova-start" och "prova-gate", POST-kropparna mot
 * /api/public/test-session (matrisen utan kropp, typerna med { typ }),
 * händelserna sample_started, sample_completed, signup_gate_shown,
 * signup_started och sample_restored med sina egenskaper, token i
 * sessionStorage (storePendingTestSession) och länken /register?test=<token>.
 *
 * Svarsknapparna hittas via roller, inte klasser. Behöver ombyggnaden andra
 * svarskontroller ändras bara hjälparen svarsknappar().
 */

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const capture = vi.fn()
vi.mock('@/lib/analytics/events', () => ({ capture: (...a: unknown[]) => capture(...a), identifyUser: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
  usePathname: () => '/verktyg/rekryteringstester/prova',
  useSearchParams: () => new URLSearchParams(),
}))

import ProvaFlow from '@/app/(public)/verktyg/rekryteringstester/prova/ProvaFlow'
import { questionsForToken, toPublicQuestion } from '@/lib/tests/anon-session'
import { BANK_VERSION } from '@/lib/logicTestV7/selectQuestions.v7'
import { publikUppgift, underlagFor, valjProv } from '@/lib/tests/prov-typer.server'
import { sparaProv } from '@/lib/tests/prova-lokalt'
import { storePendingTestSession } from '@/lib/letters/claim-draft-client'
import type { NyProvTyp, ProvTyp } from '@/lib/tests/prov-typer'

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const TOKEN = '22222222-3333-4444-8555-666666666666'

function json(status: number, data: unknown) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(data) } as Response)
}

function startSvar(typ: ProvTyp) {
  if (typ === 'matris') {
    return {
      token: TOKEN,
      questions: questionsForToken(TOKEN, BANK_VERSION).map((q) => toPublicQuestion(q, TOKEN, true)),
      total: 5,
      expiresAt: '2026-11-27T00:00:00Z',
    }
  }
  const refs = valjProv(typ, TOKEN, TOKEN)
  return { token: TOKEN, typ, uppgifter: refs.map(publikUppgift), underlag: underlagFor(refs), total: refs.length, expiresAt: '2026-11-27T00:00:00Z' }
}

/** Svarskontrollerna i den aktuella uppgiften: radio om sådana finns, annars knappar utom start och navigering. */
function svarsknappar(): HTMLElement[] {
  const radio = screen.queryAllByRole('radio')
  const alla = radio.length ? radio : screen.queryAllByRole('button')
  return alla.filter(
    (b) =>
      !(b as HTMLButtonElement).disabled &&
      b.getAttribute('aria-disabled') !== 'true' &&
      b.getAttribute('data-cta') !== 'prova-start' &&
      !/tillbaka|föregående|hoppa|avbryt|stäng|logga in/i.test(b.textContent ?? '')
  )
}

/**
 * Ett svar i ramens publika läge: ett tryck markerar, Nästa (eller Visa
 * resultatet) bekräftar. Steg C: svarskontrollerna bekräftas med ramens
 * primärknapp, så hjälparen trycker på båda. Förväntningarna är orörda.
 */
async function svara() {
  await act(async () => {
    fireEvent.click(svarsknappar()[0])
  })
  const primar = document.querySelector<HTMLButtonElement>('[data-primar]')
  if (!primar) throw new Error('ramens primärknapp saknas')
  await act(async () => {
    fireEvent.click(primar)
  })
}

function anrop(fetchMock: ReturnType<typeof vi.fn>, i: number) {
  const [url, init] = fetchMock.mock.calls[i] as [string, RequestInit]
  return { url, method: init?.method, body: init?.body ? JSON.parse(String(init.body)) : undefined }
}

function handelse(namn: string) {
  return capture.mock.calls.filter(([n]) => n === namn).map(([, p]) => p)
}

beforeEach(() => {
  cleanup()
  capture.mockClear()
  sessionStorage.clear()
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe.each<[ProvTyp]>([['matris'], ['figurserie'], ['iprov']])('provet utan konto, %s', (typ) => {
  it('start, svar, rättning, spärr: kropparna, händelserna, token och länken', async () => {
    const start = startSvar(typ)
    const total = start.total
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : {}
      if (url === '/api/public/test-session' && body.token) return json(200, { score: total - 1, total, fel: [1], percentile: null })
      return json(200, start)
    })
    vi.stubGlobal('fetch', fetchMock)

    const exempel = typ === 'matris' ? null : (() => {
      const refs = valjProv(typ as NyProvTyp, 'artikel:x', 'artikel:x', 'artikel:x')
      return { uppgift: publikUppgift(refs[0])!, underlag: underlagFor([refs[0]]) }
    })()
    render(<ProvaFlow typ={typ} exempel={exempel} />)

    const startknapp = document.querySelector<HTMLButtonElement>('[data-cta="prova-start"]')
    expect(startknapp).not.toBeNull()
    await act(async () => {
      fireEvent.click(startknapp!)
    })
    await waitFor(() => expect(handelse('sample_started')).toHaveLength(1))

    const forsta = anrop(fetchMock, 0)
    expect(forsta.url).toBe('/api/public/test-session')
    expect(forsta.method).toBe('POST')
    // Matrisen startas utan kropp, typerna med { typ } (route.ts läser body.typ).
    if (typ === 'matris') expect(forsta.body ?? {}).toEqual({})
    else expect(forsta.body).toEqual({ typ })
    expect(handelse('sample_started')[0]).toEqual({ kind: 'test', cluster: 'test', test_kind: typ, plats: 'prova' })

    for (let i = 0; i < total; i++) await svara()
    await waitFor(() => expect(handelse('sample_completed')).toHaveLength(1))

    const ratta = anrop(fetchMock, 1)
    expect(ratta.method).toBe('POST')
    expect(Object.keys(ratta.body).sort()).toEqual(['answers', 'token'])
    expect(ratta.body.token).toBe(TOKEN)
    expect(ratta.body.answers).toHaveLength(total)

    // plats saknas i dag i sample_completed och signup_gate_shown på provsidan; den får läggas till som 'prova'.
    expect(handelse('sample_completed')[0]).toMatchObject({ kind: 'test', cluster: 'test', test_kind: typ })
    expect(handelse('signup_gate_shown')).toHaveLength(1)
    expect(handelse('signup_gate_shown')[0]).toMatchObject({ kind: 'test', cluster: 'test', test_kind: typ })
    for (const p of [...handelse('sample_completed'), ...handelse('signup_gate_shown')]) {
      expect([undefined, 'prova']).toContain((p as { plats?: string }).plats)
    }
    expect(handelse('sample_restored')).toHaveLength(0)
    await waitFor(() => expect(sessionStorage.getItem('jc_pending_test')).toBe(TOKEN))

    const gate = document.querySelector<HTMLAnchorElement>('a[data-cta="prova-gate"]')
    expect(gate).not.toBeNull()
    expect(gate!.getAttribute('href')).toBe(`/register?test=${TOKEN}`)
    gate!.addEventListener('click', (e) => e.preventDefault())
    fireEvent.click(gate!)
    expect(handelse('signup_started')).toEqual([{ cluster: 'test', source_page: '/verktyg/rekryteringstester/prova' }])
  })
})

describe('tillbaka från registreringen', () => {
  it('resultatet står kvar: sample_restored, ingen ny sample_completed, spärren med samma token', async () => {
    vi.stubGlobal('fetch', vi.fn())
    storePendingTestSession(TOKEN)
    sparaProv(TOKEN, { score: 3, total: 5, fel: [0, 4], percentile: null }, [], 'matris')
    render(<ProvaFlow typ="matris" />)
    await waitFor(() => expect(handelse('sample_restored')).toEqual([{ kind: 'test' }]))
    expect(handelse('sample_completed')).toHaveLength(0)
    expect(handelse('signup_gate_shown')).toHaveLength(0)
    expect(document.querySelector('a[data-cta="prova-gate"]')?.getAttribute('href')).toBe(`/register?test=${TOKEN}`)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('en sparad typ återställer typens resultat även om sidan öppnas utan ?typ=', async () => {
    vi.stubGlobal('fetch', vi.fn())
    storePendingTestSession(TOKEN)
    sparaProv(TOKEN, { score: 5, total: 6, fel: [2], percentile: null }, [], 'iprov')
    render(<ProvaFlow typ="matris" />)
    await waitFor(() => expect(handelse('sample_restored')).toHaveLength(1))
    expect(document.querySelector('a[data-cta="prova-gate"]')?.getAttribute('href')).toBe(`/register?test=${TOKEN}`)
  })
})

it('gränsen tre prov per dygn: meddelandet och länken till registreringen, inget sample_started', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      json(429, { error: 'rate_limited', message: 'Du har gjort tre prov idag. Skapa ett gratiskonto så tränar du vidare direkt.', registerHref: '/register' })
    )
  )
  render(<ProvaFlow typ="matris" />)
  await act(async () => {
    fireEvent.click(document.querySelector<HTMLButtonElement>('[data-cta="prova-start"]')!)
  })
  await waitFor(() => expect(document.body.textContent).toContain('Du har gjort tre prov idag.'))
  expect(document.querySelector('a[href="/register"]')).not.toBeNull()
  expect(handelse('sample_started')).toHaveLength(0)
})

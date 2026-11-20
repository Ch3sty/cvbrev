/**
 * Personlighetsprovets resultat i omgång 3 (beslut C) på /verktyg/personlighetstest.
 *
 * Hela sidan renderas, så att ingressen och h1 går att kontrollera i
 * resultatläget. Vaktar: alla fem dragen öppet med bandord och läsningen
 * (raden om hur en rekryterare läser draget), tydligaste draget först (serverns
 * ordning, faktorer[0]) med sidans "i arbetet"-text, de låsta raderna utan
 * kravprofilernas och intervjuråden text, spärrens rubrik, och att ingressen
 * och den enda h1:an står kvar när resultatet visas.
 */

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn(), identifyUser: vi.fn() }))
vi.mock('@/components/auth/RedirectLoggedIn', () => ({ default: () => null }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/verktyg/personlighetstest',
  useSearchParams: () => new URLSearchParams(),
}))

import PersonlighetstestSida from '@/app/(public)/verktyg/personlighetstest/page'
import { ANTAL_PASTAENDEN } from '@/lib/personlighet/smakprov-pastaenden'
import { INTERVJU, KRAVPROFILER, LASNING } from '@/lib/personlighet/smakprov-tolkning'

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
} as unknown as typeof IntersectionObserver

const INGRESS = 'Tjugo påståenden på samma modell som MAP och de flesta test i svensk rekrytering. Du får din profil direkt och en rad per faktor om hur en rekryterare läser den.'

/** Serverns ordning: tydligaste draget först. Medvetet inte sidans faktorordning. */
const FAKTORER = [
  { key: 'openness', namn: 'Öppenhet', band: 'low', bandOrd: 'Låg', segment: 1, lasning: LASNING.openness.low },
  { key: 'conscientiousness', namn: 'Samvetsgrannhet', band: 'high', bandOrd: 'Hög', segment: 5, lasning: LASNING.conscientiousness.high },
  { key: 'stability', namn: 'Stabilitet', band: 'high', bandOrd: 'Hög', segment: 4, lasning: LASNING.stability.high },
  { key: 'extraversion', namn: 'Utåtriktning', band: 'mid', bandOrd: 'Mitt emellan', segment: 3, lasning: LASNING.extraversion.mid },
  { key: 'agreeableness', namn: 'Vänlighet', band: 'mid', bandOrd: 'Mitt emellan', segment: 3, lasning: LASNING.agreeableness.mid },
]

function json(status: number, data: unknown) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(data) } as Response)
}

const vanta = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

beforeEach(() => {
  cleanup()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  sessionStorage.clear()
  vi.stubGlobal(
    'fetch',
    vi.fn((_url: string, init?: RequestInit) => {
      const { token } = JSON.parse(String(init?.body))
      return json(200, {
        token,
        mening: 'Det rekryteraren lägger märke till först: låg öppenhet och hög samvetsgrannhet.',
        faktorer: FAKTORER,
        lockedCounts: { krav: 6, intervju: 5, omvanda: 3 },
        expiresAt: '2026-11-27T00:00:00Z',
      })
    })
  )
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('personlighetsprovets resultat på verktygssidan', () => {
  it('fem drag öppet, tydligaste först, låsta rader utan facit, ingressen kvar', async () => {
    const { container } = render(<PersonlighetstestSida />)
    const provet = container.querySelector('#provet')!
    // Före: en h1, ingressen, inga rubriker i provrutan.
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(provet.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0)

    for (let i = 0; i < ANTAL_PASTAENDEN; i++) {
      const lagen = screen.getAllByRole('radio')
      fireEvent.click(lagen[3])
      await vanta(200)
    }
    await vanta(600)
    await waitFor(() => expect(container.querySelector('[data-personlighet-profil]')).not.toBeNull(), { timeout: 3000 })

    // Tydligaste draget är serverns första, med sin läsning och sidans "i arbetet"-text.
    const forsta = container.querySelector<HTMLElement>('[data-drag-forsta]')!
    expect(forsta.getAttribute('data-drag-forsta')).toBe('openness')
    expect(forsta.textContent).toContain('Öppenhet')
    expect(forsta.textContent).toContain('Låg')
    expect(forsta.textContent).toContain(LASNING.openness.low)
    expect(forsta.textContent).toContain('Nyfikenhet på nya arbetssätt och idéer.')

    // De fyra andra som rader, i serverns ordning, var och en med bandord och läsning.
    const rader = [...container.querySelectorAll<HTMLElement>('[data-drag]')]
    expect(rader.map((r) => r.getAttribute('data-drag'))).toEqual(['conscientiousness', 'stability', 'extraversion', 'agreeableness'])
    rader.forEach((r, i) => {
      const f = FAKTORER[i + 1]
      expect(r.textContent).toContain(f.namn)
      expect(r.textContent).toContain(f.bandOrd)
      expect(r.querySelector('[data-lasning]')!.textContent).toBe(f.lasning)
    })
    expect(container.querySelectorAll('[data-lasning]')).toHaveLength(5)

    // Spärren: rubriken, kontoknappen och tre låsta rader utan kravprofilernas och intervjuråden text.
    const sparr = container.querySelector<HTMLElement>('[data-personlighet-sparr]')!
    expect(sparr.textContent).toContain('Se vad rekryteraren läser ut av hela profilen')
    expect(sparr.querySelector('a[data-cta="personlighetsprov-gate"]')).not.toBeNull()
    expect([...sparr.querySelectorAll('[data-last]')].map((l) => l.getAttribute('data-last'))).toEqual(['krav', 'intervju', 'omvanda'])
    expect(sparr.querySelector('[data-last="krav"]')!.textContent).toContain('sex kravprofiler')
    const sidtext = container.textContent ?? ''
    for (const k of KRAVPROFILER) {
      expect(sidtext).not.toContain(k.vagerTungt)
    }
    for (const band of Object.values(INTERVJU)) {
      for (const text of Object.values(band)) expect(sidtext).not.toContain(text)
    }
    expect(sidtext).not.toMatch(/Passar profilen|Räkna med en fråga om|Kräver ett bra svar om/)

    // Ingressen och h1 står kvar i resultatläget, inga rubriker i provrutan.
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    const ingresser = [...container.querySelectorAll('p')].filter((p) => p.textContent?.includes(INGRESS))
    expect(ingresser).toHaveLength(1)
    expect(ingresser[0].textContent).toContain('Inget konto, ungefär två minuter.')
    expect(provet.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0)

    // Det fasta arket på telefonen bär samma väg till kontot.
    const ark = container.querySelector('[data-personlighet-ark] a[data-cta="personlighetsprov-gate"]')
    expect(ark?.getAttribute('href')).toMatch(/^\/register\?personlighet=/)
  }, 20000)
})

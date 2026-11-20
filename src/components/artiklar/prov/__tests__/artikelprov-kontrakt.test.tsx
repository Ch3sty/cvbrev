/**
 * Kontraktet för provet i artiklarna (<ArtikelProv>), omgång 2 steg C.
 *
 * Ombyggnaden till sessionsramen får ändra utseende och markup inne i rutan,
 * men inte det här: uppgift 1 står i server-HTML:en och går att svara på,
 * rutan bär data-cta-attributen som ArtikelKlient mäter, rutan har inga
 * rubriker, POST-kropparna mot /api/public/test-session, PostHog-händelserna
 * med sina egenskaper, token i sessionStorage, källan i kakan och spärren
 * med data-cta="artikel-prov-gate" mot /register?test=<token>.
 *
 * Testerna letar svarsknappar via roller (radio, annars knapp) och läser
 * resultatet via länkens data-cta, inte via klasser. Behöver ombyggnaden
 * andra svarskontroller ändras bara hjälparen svarsknappar().
 */

import fs from 'node:fs'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { act, cleanup, fireEvent, render, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const capture = vi.fn()
vi.mock('@/lib/analytics/events', () => ({ capture: (...a: unknown[]) => capture(...a), identifyUser: vi.fn() }))

import ArtikelProv from '../ArtikelProv'
import { artikelSeedMatris, questionsForToken, toPublicQuestion } from '@/lib/tests/anon-session'
import { BANK_VERSION } from '@/lib/logicTestV7/selectQuestions.v7'
import { artikelSeed, publikUppgift, underlagFor, valjProv } from '@/lib/tests/prov-typer.server'
import { PROV_TYPER, provAntal, type NyProvTyp, type ProvTyp } from '@/lib/tests/prov-typer'
import { lasProvkallaKlient } from '@/lib/analytics/provkalla'

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const TOKEN = '11111111-2222-4333-8444-555555555555'
const FACIT = /correctAnswer|correctAnswerId|"rattVisat"|"regel"|"rule"|"explanation"|"forklaring"|"losning"|"misstag"/

/** De 16 artiklarna med provet 2026-11-20. En artikel som tappar provet fäller testet. */
const ARTIKLAR: ReadonlyArray<[string, ProvTyp]> = [
  ['alva-labs-logiktest', 'matris'],
  ['aon-cut-e-test', 'figurserie'],
  ['cubiks-logiks-test', 'numerisk'],
  ['deduktivt-induktivt-test', 'deduktiv'],
  ['i-prov', 'iprov'],
  ['logiktest-exempel-med-losningar', 'matris'],
  ['logiktest-tips', 'matris'],
  ['logiska-tester', 'matris'],
  ['matrigma-test', 'matris'],
  ['numeriskt-test-guide', 'numerisk'],
  ['ordforstaelse-test', 'ordforrad'],
  ['rotation-test-guide', 'spatial'],
  ['stanine-testresultat', 'iprov'],
  ['talserier', 'talserie'],
  ['tester-hos-myndigheter', 'matris'],
  ['verbalt-test-guide', 'verbal'],
]

function svarsknappar(ruta: HTMLElement): HTMLElement[] {
  const w = within(ruta)
  const radio = w.queryAllByRole('radio')
  const alla = radio.length ? radio : w.queryAllByRole('button')
  return alla.filter(
    (b) =>
      !(b as HTMLButtonElement).disabled &&
      b.getAttribute('aria-disabled') !== 'true' &&
      !/tillbaka|föregående|hoppa|igen|avbryt|stäng/i.test(b.textContent ?? '')
  )
}

/**
 * Ett svar i provrutan: ett tryck markerar, Svara bekräftar (steg C, samma
 * gest som sessionsramen). Hjälparen trycker på båda; förväntningarna är orörda.
 */
async function svara() {
  await act(async () => {
    fireEvent.click(svarsknappar(ruta())[0])
  })
  const knapp = ruta().querySelector<HTMLButtonElement>('[data-artikel-prov-svara]')
  if (!knapp) throw new Error('Svara saknas i rutan')
  await act(async () => {
    fireEvent.click(knapp)
  })
}

function ruta(): HTMLElement {
  const r = document.querySelector<HTMLElement>('[data-cta-position="inline"][data-cta-variant^="prov-"]')
  if (!r) throw new Error('provrutan saknas')
  return r
}

function json(status: number, data: unknown) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(data) } as Response)
}

function startSvar(typ: ProvTyp, slug: string) {
  if (typ === 'matris') {
    const seed = artikelSeedMatris(slug)
    return {
      token: TOKEN,
      questions: questionsForToken(seed, BANK_VERSION).map((q) => toPublicQuestion(q, seed, true)),
      total: 5,
      expiresAt: '2026-11-27T00:00:00Z',
    }
  }
  const fro = artikelSeed(typ, slug)
  const refs = valjProv(typ, fro, TOKEN, fro)
  return { token: TOKEN, typ, uppgifter: refs.map(publikUppgift), underlag: underlagFor(refs), total: refs.length, expiresAt: '2026-11-27T00:00:00Z' }
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
  document.cookie = 'jc_provkalla=; Path=/; Max-Age=0'
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('artiklarna med provet', () => {
  it('de 16 artiklarna har kvar <ArtikelProv> med samma typ', () => {
    for (const [slug, typ] of ARTIKLAR) {
      const mdx = fs.readFileSync(path.join(process.cwd(), 'content/artiklar', `${slug}.mdx`), 'utf8')
      expect(mdx, slug).toMatch(new RegExp(`<ArtikelProv[^>]*typ="${typ}"`))
    }
  })
})

describe.each(ARTIKLAR)('uppgift 1 i server-HTML:en, %s', (slug, typ) => {
  const html = renderToStaticMarkup(<ArtikelProv typ={typ} slug={slug} cluster="test" />)
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const r = doc.querySelector<HTMLElement>('[data-cta-position="inline"]')

  it('rutan bär data-cta-attributen som ArtikelKlient mäter', () => {
    expect(r).not.toBeNull()
    expect(r!.getAttribute('data-cta-cluster')).toBe('test')
    expect(r!.getAttribute('data-cta-variant')).toBe(`prov-${typ}`)
    expect(r!.getAttribute('data-cta-slug')).toBe(slug)
    expect(r!.getAttribute('data-artikel-prov')).toBe(typ)
  })

  it('uppgift 1 går att svara på direkt (minst två svarsknappar, inga disabled)', () => {
    const knappar = Array.from(r!.querySelectorAll<HTMLButtonElement>('button, [role="radio"]')).filter((b) => !b.disabled)
    expect(knappar.length).toBeGreaterThanOrEqual(2)
  })

  it('inga rubriker i rutan: artikelns rubrikträd ändras inte', () => {
    expect(r!.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0)
  })

  it('inget facit i HTML:en', () => {
    expect(html).not.toMatch(FACIT)
  })

  it('samma HTML varje gång (CDN-cachen): uppgiften väljs med artikelns fasta frö', () => {
    expect(renderToStaticMarkup(<ArtikelProv typ={typ} slug={slug} cluster="test" />)).toBe(html)
  })
})

it('okänd typ ritar ingenting', () => {
  expect(renderToStaticMarkup(<ArtikelProv typ="okand" slug="x" />)).toBe('')
})

it('alla typer i PROV_TYPER går att rita i en artikel', () => {
  for (const typ of PROV_TYPER) {
    expect(renderToStaticMarkup(<ArtikelProv typ={typ} slug="kontrakt" cluster="test" />), typ).toContain(`data-cta-variant="prov-${typ}"`)
  }
})

describe.each<[string, ProvTyp]>([
  ['logiska-tester', 'matris'],
  ['talserier', 'talserie'],
  ['i-prov', 'iprov'],
])('flödet i artikeln, %s (%s)', (slug, typ) => {
  it('start, svar, rättning, spärr: kropparna, händelserna, token och länken', async () => {
    const start = startSvar(typ, slug)
    const total = start.total
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : {}
      if (url === '/api/public/test-session' && body.token) return json(200, { score: total - 1, total, fel: [2], percentile: null })
      return json(200, start)
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<ArtikelProv typ={typ} slug={slug} cluster="test" />)

    // Uppgift 1: svaret startar provet med typ och artikel.
    await svara()
    await waitFor(() => expect(handelse('sample_started')).toHaveLength(1))
    expect(anrop(fetchMock, 0)).toEqual({ url: '/api/public/test-session', method: 'POST', body: { typ, artikel: slug } })
    expect(handelse('sample_started')[0]).toEqual({ kind: 'test', cluster: 'test', test_kind: typ, plats: 'artikel', slug })
    expect(lasProvkallaKlient()).toMatchObject({ via: 'smakprov', slug })
    if (typ === 'iprov') expect(lasProvkallaKlient()).toMatchObject({ mitt_test: 'iprov' })

    // Resten av uppgifterna i samma ruta.
    for (let i = 1; i < total; i++) {
      await svara()
    }
    await waitFor(() => expect(handelse('sample_completed')).toHaveLength(1))

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const ratta = anrop(fetchMock, 1)
    expect(ratta.url).toBe('/api/public/test-session')
    expect(ratta.method).toBe('POST')
    expect(Object.keys(ratta.body).sort()).toEqual(['answers', 'token'])
    expect(ratta.body.token).toBe(TOKEN)
    expect(ratta.body.answers).toHaveLength(total)

    const props = { kind: 'test', cluster: 'test', test_kind: typ, plats: 'artikel', slug }
    expect(handelse('sample_completed')[0]).toEqual(props)
    expect(handelse('signup_gate_shown')).toEqual([props])
    expect(sessionStorage.getItem('jc_pending_test')).toBe(TOKEN)

    // Spärren: länken bär token, ligger i rutan och skickar signup_started.
    const gate = document.querySelector<HTMLAnchorElement>('a[data-cta="artikel-prov-gate"]')
    expect(gate).not.toBeNull()
    expect(gate!.getAttribute('href')).toBe(`/register?test=${TOKEN}`)
    expect(gate!.closest('[data-cta-position="inline"]')?.getAttribute('data-cta-variant')).toBe(`prov-${typ}`)
    gate!.addEventListener('click', (e) => e.preventDefault())
    fireEvent.click(gate!)
    expect(handelse('signup_started')).toEqual([{ cluster: 'test', source_page: `/artiklar/${slug}` }])
  })
})

it('gränsen tre prov per dygn: meddelandet och länken till registreringen', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      json(429, { error: 'rate_limited', message: 'Du har gjort tre prov idag. Skapa ett gratiskonto så tränar du vidare direkt.', registerHref: '/register' })
    )
  )
  render(<ArtikelProv typ="matris" slug="logiska-tester" cluster="test" />)
  await svara()
  await waitFor(() => expect(document.body.textContent).toContain('Du har gjort tre prov idag.'))
  expect(ruta().querySelector('a[href="/register"]')).not.toBeNull()
  expect(handelse('sample_started')).toHaveLength(0)
})

it('klienten håller aldrig facit: startsvaret för artikelns typer saknar facitnycklar', () => {
  for (const [slug, typ] of ARTIKLAR) {
    expect(JSON.stringify(startSvar(typ as NyProvTyp, slug)), slug).not.toMatch(FACIT)
  }
  expect(provAntal('iprov')).toBe(6)
})

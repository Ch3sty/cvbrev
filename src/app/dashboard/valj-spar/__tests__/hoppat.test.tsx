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
    // Väggen: beloppet stort, perioden under (kampanjmärket 2026-11-23).
    expect(screen.getByText('149 kr')).toBeTruthy()
    expect(screen.getByText(KOPSTEG.prisradUtanBelopp())).toBeTruthy()
    expect(KOPSTEG.prisradUtanBelopp()).toBe('i månaden, säg upp när du vill.')
    expect(screen.queryByRole('radiogroup')).toBeNull()
    expect(screen.getByRole('button', { name: KOPSTEG.primar() })).toBeTruthy()
  })

  it('knappen är spärrad tills rutan är kryssad, och raden under säger varför', () => {
    render(<ValjSparClient initialTrack={null} />)
    const knapp = screen.getByRole('button', { name: KOPSTEG.primar() }) as HTMLButtonElement
    expect(knapp.disabled).toBe(true)
    expect(screen.getByText('Kryssa i rutan för att fortsätta.')).toBeTruthy()
    fireEvent.click(screen.getByRole('checkbox'))
    expect(knapp.disabled).toBe(false)
    expect(screen.getByText(KOPSTEG.fotnot)).toBeTruthy()
  })

  it('under en kampanj: kampanjens pris, nedräkningen och samma kropp till kassan som förut', async () => {
    const bw = {
      nyckel: 'black-week-2026' as const,
      namn: 'Black Week',
      etikett: 'BLACK WEEK',
      pris: 99,
      rabattKr: 50,
      giltigTill: 'till och med söndag 29 november 23.59',
      tema: 'svart' as const,
      slutMs: Date.parse('2026-11-30T00:00:00+01:00'),
      copy: {
        bannerText: '',
        bannerLank: '',
        kortRubrik: '',
        kortKnapp: '',
        kortStang: '',
        prisKnapp: '',
        prisFotnot: '',
      },
    }
    fetchMock.mockImplementation(async (url: string) =>
      url.includes('onboarding') ? svar(200, { ok: true }) : svar(200, { url: 'https://checkout.stripe.com/x' })
    )
    const href = vi.spyOn(window, 'location', 'get')
    href.mockReturnValue({ href: '' } as Location)
    const { container } = render(<ValjSparClient initialTrack="allt" plats="kampanjmejl" kampanj={bw} />)
    expect(screen.getByText('99 kr')).toBeTruthy()
    expect(screen.getByText('Du sparar 50 kr')).toBeTruthy()
    expect(screen.getByText(KOPSTEG.prisradKampanjUtanBelopp())).toBeTruthy()
    expect(container.querySelector('[data-kn]')?.getAttribute('data-kn')).toBe(String(bw.slutMs))
    expect(screen.getByText('Gäller till och med söndag 29 november 23.59')).toBeTruthy()
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Till betalning, 99 kr' }))
    await waitFor(() => expect(fetchMock.mock.calls.some(([u]) => String(u).includes('create-plan-session'))).toBe(true))
    const anrop = fetchMock.mock.calls.find(([u]) => String(u).includes('create-plan-session'))!
    const kropp = JSON.parse((anrop[1] as RequestInit).body as string)
    expect(kropp).toEqual({ plan: 'all_month', source: 'betalvagg:kampanjmejl', consent: true, kampanj: 'black-week-2026' })
    href.mockRestore()
  })

  it('gratisvägen står i foten för den som inte bett om köp, och under korten för den som kom från en betalvägg', () => {
    // Regression 2026-11-23: ett nytt konto landar här utan plats, och i
    // telefon låg länken en och en halv skärm ned.
    const utan = render(<ValjSparClient initialTrack="allt" />)
    const iFot = utan.container.querySelectorAll('.kop-fot .kop-gratis button')
    expect(iFot).toHaveLength(1)
    expect(utan.container.querySelectorAll('.kop-gratis button')).toHaveLength(1)
    utan.unmount()

    const med = render(<ValjSparClient initialTrack="allt" plats="matning" />)
    expect(med.container.querySelectorAll('.kop-fot .kop-gratis button')).toHaveLength(0)
    expect(med.container.querySelectorAll('.kop-golv .kop-gratis button')).toHaveLength(1)
    med.unmount()
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
    expect(kropp).toEqual({ plan: 'all_month', source: 'betalvagg:matning', consent: true, kampanj: null })
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

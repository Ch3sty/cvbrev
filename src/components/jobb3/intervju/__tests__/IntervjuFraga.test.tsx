/**
 * "När är intervjun?" i Inför intervjun (Jobbsöket omgång 2, byggspec 9.2
 * till 9.5 och 9.9): kortet och raden, Hoppa över, arkets fält och felrader,
 * och de två anropen.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'

const routerRefresh = vi.fn()
const summeringRefresh = vi.fn(async () => {})
const logActivity = vi.fn(async () => true)
const capture = vi.fn()

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: routerRefresh, push: vi.fn() }) }))
vi.mock('@/contexts/DashboardDataContext', () => ({ useDashboardData: () => ({ refresh: summeringRefresh }) }))
vi.mock('@/context/notificationcontext', () => ({ useNotification: () => ({ logActivity }) }))
vi.mock('@/lib/analytics/events', () => ({ capture: (...a: unknown[]) => capture(...a) }))

import IntervjuFraga, { IHOP_NYCKEL } from '../IntervjuFraga'
import { HUBB } from '../text'
import type { ValbarForIntervju } from '@/lib/jobbsok/intervju'

const T = HUBB.fraga

const VALBARA: ValbarForIntervju[] = [
  { id: 'ue', company: 'Umeå Energi', jobTitle: 'Ekonomiassistent', bokstaver: 'UE', appliedAt: '2026-11-10' },
  { id: 'no', company: 'Norrmejerier', jobTitle: 'Ekonomiassistent', bokstaver: 'NO', appliedAt: '2026-11-05' },
]

type Svar = { ok: boolean; body: unknown }
let svar: Svar[] = []
const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => {
  const s = svar.shift() ?? { ok: true, body: { success: true, data: {} } }
  return { ok: s.ok, status: s.ok ? 200 : 500, json: async () => s.body } as Response
})

beforeEach(() => {
  svar = []
  fetchMock.mockClear()
  routerRefresh.mockClear()
  summeringRefresh.mockClear()
  logActivity.mockClear()
  capture.mockClear()
  vi.stubGlobal('fetch', fetchMock)
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-intervjufraga')
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function oppnaArket() {
  fireEvent.click(screen.getByRole('button', { name: T.knapp }))
  return screen.getByRole('dialog')
}

/** Etiketterna på arkets fält i den ordning de står (utan tillägget "valfritt"). */
function faltOrdning(dialog: HTMLElement): string[] {
  return Array.from(dialog.querySelectorAll('label.j3-falt > .j3-etikett')).map((e) => e.firstChild?.textContent?.trim() ?? '')
}

function fyll(dialog: HTMLElement, etikett: string | RegExp, varde: string) {
  fireEvent.change(within(dialog).getByLabelText(etikett), { target: { value: varde } })
}

function spara(dialog: HTMLElement) {
  fireEvent.click(within(dialog).getByRole('button', { name: T.spara }))
}

const anropen = () => fetchMock.mock.calls.map(([url, init]) => ({ url, body: init?.body ? JSON.parse(init.body as string) : undefined }))

describe('kortet och raden', () => {
  it('tom lista: både det öppna kortet och raden finns, med texterna i 9.2', () => {
    const { container } = render(<IntervjuFraga tom valbara={[]} />)
    const oppen = container.querySelector('.j3c-fraga-oppen') as HTMLElement
    const ihop = container.querySelector('.j3c-fraga-ihop') as HTMLElement
    expect(oppen).toBeTruthy()
    expect(ihop).toBeTruthy()
    expect(oppen.textContent).toContain('När är intervjun?')
    expect(oppen.textContent).toContain('Lägg in dag och tid, så räknar vi ner och visar vad du hinner öva på. Tjänsten hamnar under Sökta tjänster.')
    expect(within(oppen).getByRole('button', { name: 'Lägg in intervjun' })).toBeTruthy()
    expect(within(oppen).getByRole('button', { name: 'Ingen intervju bokad än' })).toBeTruthy()
    expect(ihop.textContent).toContain('Har du fått en intervjutid?')
    expect(ihop.textContent).toContain('Lägg in den, så räknar vi ner till intervjun.')
    expect(within(ihop).getByRole('button', { name: 'Lägg in' })).toBeTruthy()
  })

  it('lista med rader: inget kort och ingen rad', () => {
    const { container } = render(<IntervjuFraga tom={false} valbara={[]} />)
    expect(container.querySelector('.j3c-fraga-oppen')).toBeNull()
    expect(container.querySelector('.j3c-fraga-ihop')).toBeNull()
  })

  it('"Ingen intervju bokad än" sparar nyckeln, sätter attributet och flyttar fokus till "Lägg in"', () => {
    const { container } = render(<IntervjuFraga tom valbara={[]} />)
    fireEvent.click(screen.getByRole('button', { name: T.hoppa }))
    expect(window.localStorage.getItem(IHOP_NYCKEL)).toBe('1')
    expect(document.documentElement.getAttribute('data-intervjufraga')).toBe('ihop')
    const lagg = within(container.querySelector('.j3c-fraga-ihop') as HTMLElement).getByRole('button', { name: 'Lägg in' })
    expect(document.activeElement).toBe(lagg)
    expect(capture).toHaveBeenCalledWith('tjanstfraga_val', { plats: 'intervju-hubb', val: 'hoppad' })
  })

  it('vid montering läses nyckeln och attributet sätts', () => {
    window.localStorage.setItem(IHOP_NYCKEL, '1')
    render(<IntervjuFraga tom valbara={[]} />)
    expect(document.documentElement.getAttribute('data-intervjufraga')).toBe('ihop')
  })
})

describe('arket', () => {
  it('utan valbara: Dag, Tid, Plats, Tjänst, Arbetsgivare, Datum sökt, och Datum sökt är tomt', () => {
    render(<IntervjuFraga tom valbara={[]} />)
    const dialog = oppnaArket()
    expect(capture).toHaveBeenCalledWith('tjanstfraga_val', { plats: 'intervju-hubb', val: 'oppnad' })
    expect(within(dialog).getByText(T.arkTextNy)).toBeTruthy()
    expect(faltOrdning(dialog)).toEqual(['Dag', 'Tid', 'Plats', 'Tjänst', 'Arbetsgivare', 'Datum sökt'])
    expect((within(dialog).getByLabelText(/^Datum sökt/) as HTMLInputElement).value).toBe('')
    expect((within(dialog).getByLabelText(/^Dag/) as HTMLInputElement).value).toBe('')
    expect(dialog.textContent).toContain('Dagen du skickade ansökan. Datumet står i din månadsrapport.')
  })

  it('med valbara: Dag, Tid, Plats, sedan valen; "En annan tjänst" visar de tre fälten', () => {
    render(<IntervjuFraga tom valbara={VALBARA} />)
    const dialog = oppnaArket()
    expect(within(dialog).getByText(T.arkTextVal)).toBeTruthy()
    expect(faltOrdning(dialog)).toEqual(['Dag', 'Tid', 'Plats'])
    const val = within(dialog).getByRole('group', { name: T.vilken })
    const knappar = within(val).getAllByRole('button')
    // Varje tjänst är en egen rad: titeln som huvudtext och arbetsgivaren under (efter klicktestet).
    expect(knappar.map((k) => k.querySelector('.j3c-tjanstval-titel')?.textContent ?? null)).toEqual(['Ekonomiassistent', 'Ekonomiassistent', null])
    expect(knappar.map((k) => k.querySelector('.j3c-tjanstval-ag')?.textContent ?? null)).toEqual(['Umeå Energi', 'Norrmejerier', null])
    expect(knappar.map((k) => k.textContent?.replace(/^(UE|NO)/, '').trim())).toEqual(['Ekonomiassistent, Umeå Energi', 'Ekonomiassistent, Norrmejerier', 'En annan tjänst'])
    expect(dialog.querySelector('.j3c-tjanstval')?.contains(val)).toBe(true)
    expect(knappar.every((k) => k.getAttribute('aria-pressed') === 'false')).toBe(true)
    // Valen står efter Plats.
    const plats = within(dialog).getByLabelText(/^Plats/)
    expect(plats.compareDocumentPosition(val) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    fireEvent.click(within(val).getByRole('button', { name: /En annan tjänst/ }))
    expect(faltOrdning(dialog)).toEqual(['Dag', 'Tid', 'Plats', 'Tjänst', 'Arbetsgivare', 'Datum sökt'])
  })

  it('fler än fem valbara: fem visas, "Visa alla" fäller ut resten', () => {
    const sju = Array.from({ length: 7 }, (_, i) => ({ ...VALBARA[0], id: `t${i}`, company: `Företag ${i}` }))
    render(<IntervjuFraga tom valbara={sju} />)
    const dialog = oppnaArket()
    const val = () => within(dialog).getByRole('group', { name: T.vilken })
    expect(within(val()).getAllByRole('button')).toHaveLength(6)
    fireEvent.click(within(dialog).getByRole('button', { name: T.visaAlla }))
    expect(within(val()).getAllByRole('button')).toHaveLength(8)
  })

  it('foten säger "Vi räknar ner till intervjun och frågar hur det gick dagen efter." och "räknar ner hit" står ingenstans', () => {
    render(<IntervjuFraga tom valbara={[]} />)
    const dialog = oppnaArket()
    expect(dialog.textContent).toContain('Vi räknar ner till intervjun och frågar hur det gick dagen efter.')
    expect(document.body.textContent).not.toContain('räknar ner hit')
    expect(JSON.stringify(HUBB)).not.toContain('räknar ner hit')
  })
})

describe('felraderna', () => {
  it('allt tomt utan valbara: Dag, Tjänst, Arbetsgivare och Datum sökt, ordagrant, och inget anrop', () => {
    render(<IntervjuFraga tom valbara={[]} />)
    const dialog = oppnaArket()
    spara(dialog)
    expect(dialog.textContent).toContain('Välj dagen för intervjun.')
    expect(dialog.textContent).toContain('Skriv tjänsten också, så hittar du den igen.')
    expect(dialog.textContent).toContain('Skriv arbetsgivaren också, så hittar du tjänsten igen.')
    expect(dialog.textContent).toContain('Välj dagen du sökte, så blir månadsrapporten rätt.')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(within(dialog).getByLabelText(/^Dag/))
    expect(within(dialog).getByLabelText(/^Dag/).getAttribute('aria-invalid')).toBe('true')
  })

  it('tomt Datum sökt: felraden och ingen sparning', () => {
    render(<IntervjuFraga tom valbara={[]} />)
    const dialog = oppnaArket()
    fyll(dialog, /^Dag/, '2026-11-24')
    fyll(dialog, /^Tjänst/, 'Ekonomiassistent')
    fyll(dialog, /^Arbetsgivare/, 'Umeå Energi')
    spara(dialog)
    expect(dialog.textContent).toContain('Välj dagen du sökte, så blir månadsrapporten rätt.')
    expect(document.activeElement).toBe(within(dialog).getByLabelText(/^Datum sökt/))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('Datum sökt efter intervjuns dag', () => {
    render(<IntervjuFraga tom valbara={[]} />)
    const dialog = oppnaArket()
    fyll(dialog, /^Dag/, '2026-11-10')
    fyll(dialog, /^Tjänst/, 'Ekonomiassistent')
    fyll(dialog, /^Arbetsgivare/, 'Umeå Energi')
    fyll(dialog, /^Datum sökt/, '2026-11-12')
    spara(dialog)
    expect(dialog.textContent).toContain('Dagen du sökte kan inte ligga efter intervjun.')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('med valbara och inget val: "Välj vilken tjänst intervjun gäller."', () => {
    render(<IntervjuFraga tom valbara={VALBARA} />)
    const dialog = oppnaArket()
    fyll(dialog, /^Dag/, '2026-11-24')
    spara(dialog)
    expect(dialog.textContent).toContain('Välj vilken tjänst intervjun gäller.')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(document.activeElement?.textContent).toContain('Umeå Energi')
  })
})

describe('spara', () => {
  function fyllNy(dialog: HTMLElement) {
    fyll(dialog, /^Dag/, '2026-11-24')
    fyll(dialog, /^Tid/, '10:00')
    fyll(dialog, /^Plats/, 'Storgatan 34, Umeå')
    fyll(dialog, /^Tjänst/, 'Ekonomiassistent')
    fyll(dialog, /^Arbetsgivare/, 'Umeå Energi')
    fyll(dialog, /^Datum sökt/, '2026-11-05')
  }

  it('ny tjänst: två anrop i ordning, det andra med fran intervju-hubb; kvittensen och länken efteråt', async () => {
    svar = [
      { ok: true, body: { success: true, data: { id: 'ny-1', job_title: 'Ekonomiassistent', company: 'Umeå Energi' } } },
      { ok: true, body: { success: true, data: { id: 'h1' } } },
    ]
    window.localStorage.setItem(IHOP_NYCKEL, '1')
    render(<IntervjuFraga tom valbara={[]} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Lägg in' })[0])
    const dialog = screen.getByRole('dialog')
    fyllNy(dialog)
    spara(dialog)
    const status = await screen.findByRole('status')
    expect(anropen()).toEqual([
      { url: '/api/applications', body: { job_title: 'Ekonomiassistent', company: 'Umeå Energi', applied_at: '2026-11-05', application_channel: 'ad' } },
      {
        url: '/api/applications/ny-1/events',
        body: { event_type: 'interview_invited', intervju: { datum: '2026-11-24', tid: '10:00', plats: 'Storgatan 34, Umeå' }, fran: 'intervju-hubb' },
      },
    ])
    expect(status.textContent).toContain('Intervjun är inlagd. Tjänsten ligger också under Sökta tjänster.')
    expect(within(status).getByRole('link', { name: 'Öppna tjänsten' }).getAttribute('href')).toBe('/dashboard/sokta-tjanster/ny-1?steg=forbered&fran=intervju-hubb')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(routerRefresh).toHaveBeenCalled()
    expect(summeringRefresh).toHaveBeenCalled()
    expect(window.localStorage.getItem(IHOP_NYCKEL)).toBeNull()
    expect(document.documentElement.hasAttribute('data-intervjufraga')).toBe(false)
    expect(logActivity).toHaveBeenCalledWith('application_logged', expect.any(String), { applicationId: 'ny-1', channel: 'ad', fran: 'intervju-hubb' })
  })

  it('vald befintlig tjänst: ett enda anrop, på den tjänstens id, ingen aktivitet loggas', async () => {
    render(<IntervjuFraga tom valbara={VALBARA} />)
    const dialog = oppnaArket()
    fyll(dialog, /^Dag/, '2026-11-24')
    fireEvent.click(within(dialog).getByRole('button', { name: /Norrmejerier/ }))
    spara(dialog)
    await screen.findByRole('status')
    expect(anropen()).toEqual([
      { url: '/api/applications/no/events', body: { event_type: 'interview_invited', intervju: { datum: '2026-11-24', tid: null, plats: null }, fran: 'intervju-hubb' } },
    ])
    expect(logActivity).not.toHaveBeenCalled()
  })

  it('anrop 2 faller: raden om att tjänsten är sparad, och nästa tryck gör bara anrop 2', async () => {
    svar = [
      { ok: true, body: { success: true, data: { id: 'ny-2', job_title: 'Ekonomiassistent', company: 'Umeå Energi' } } },
      { ok: false, body: { error: 'Kunde inte spara händelsen' } },
      { ok: true, body: { success: true, data: { id: 'h2' } } },
    ]
    render(<IntervjuFraga tom valbara={[]} />)
    const dialog = oppnaArket()
    fyllNy(dialog)
    spara(dialog)
    await waitFor(() => expect(dialog.textContent).toContain('Tjänsten är sparad, men intervjun gick inte att lägga in. Försök igen.'))
    expect(screen.getByRole('dialog')).toBeTruthy()
    spara(dialog)
    await screen.findByRole('status')
    expect(anropen().map((a) => a.url)).toEqual(['/api/applications', '/api/applications/ny-2/events', '/api/applications/ny-2/events'])
  })

  it('anrop 1 faller: "Det gick inte att spara just nu. Försök igen." och inget anrop 2', async () => {
    svar = [{ ok: false, body: { error: 'insert failed' } }]
    render(<IntervjuFraga tom valbara={[]} />)
    const dialog = oppnaArket()
    fyllNy(dialog)
    spara(dialog)
    await waitFor(() => expect(dialog.textContent).toContain('Det gick inte att spara just nu. Försök igen.'))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

// Träna figurserier i ramen mot ett fixtur-API med riktiga uppgifter ur
// banken: startskärmen med kryssrutan, sessionen skapas först vid Starta,
// tryck markerar och knappen bekräftar, Förklaringen med rätt och fel,
// "Vet inte", kryssrutan av (provtempo) och resultatet med Gå igenom.

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }), usePathname: () => '/dashboard/tester/pass' }))
vi.mock('@/contexts/DashboardDataContext', () => ({ useDashboardData: () => ({ summary: null }) }))
vi.mock('@/components/traning/FragaRapport', () => ({ default: () => null }))

const { harnastPool } = await import('@/lib/figurserierV1/select')
const { bedomFigur, genomgaFigur, visaFigur } = await import('@/lib/figurserierV1/fragor.server')
const { default: FigurserieTrana } = await import('../figurserie/FigurserieTrana')
import type { FigurPassApi } from '@/lib/tester/pass-klient'
import type { FigurPassVy } from '@/lib/tester/pass-figur'

globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
} as unknown as typeof ResizeObserver
Element.prototype.scrollIntoView = () => {}
window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia

function fixtur() {
  const id = '00000000-0000-4000-8000-0000000000bb'
  const fragor = harnastPool('grund').slice(0, 4)
  let vy: FigurPassVy = {
    id,
    niva: 'grund',
    upprepad: false,
    budget_s: 180,
    startad: '2026-11-20T08:00:00Z',
    avslutad: false,
    expertRad: false,
    uppgifter: fragor.map((q) => {
      const v = visaFigur(q, id)
      return { nyckel: q.id, form: 'harnast' as const, rad: v.rad, options: v.options }
    }),
    besvarade: {},
    aterkoppling: {},
    resultat: null,
  }
  const svar: { visat: number | null }[] = []
  const api: FigurPassApi = {
    skapa: vi.fn(async () => ({ ok: true as const, session: vy })),
    async svara(inp) {
      svar.push({ visat: inp.visat })
      const q = fragor.find((f) => f.id === inp.nyckel)!
      const b = bedomFigur(q, id, inp.visat)!
      const g = genomgaFigur(q, id)
      const at = { correct: b.correct, rattVisat: g.rattVisat, valtVisat: b.visat, regel: q.rule, misstag: !b.correct && b.visat != null ? g.misstag[b.visat] || null : null, familj: q.family }
      vy = { ...vy, besvarade: { ...vy.besvarade, [inp.nyckel]: { visat: inp.visat, tid_s: inp.tid } }, aterkoppling: { ...vy.aterkoppling, [inp.nyckel]: at } }
      const n = Object.keys(vy.besvarade).length
      return { ok: true as const, nyckel: inp.nyckel, aterkoppling: at, besvarade: n, antal: 4, klar: n >= 4 }
    },
    async slutfor() {
      const ratt = Object.values(vy.aterkoppling).filter((a) => a.correct).length
      vy = { ...vy, avslutad: true, resultat: { ratt, antal: 4, tid_s: 80, budget_s: 180, tappade: [] } }
      return { ok: true as const, session: vy }
    },
    session: async () => vy,
  }
  return { api, svar, rattIndex: (i: number) => genomgaFigur(fragor[i], id).rattVisat }
}

const fetchSpion = vi.fn(async () => new Response('{}', { status: 200 }))
beforeEach(() => {
  fetchSpion.mockClear()
  vi.stubGlobal('fetch', fetchSpion)
})

const START = { last: false, fortsatt: false, kvar: null, antal: 4, budgetPerUppgift: 45 }

describe('Träna figurserier i ramen', () => {
  it('startskärmen först, sessionen skapas vid Starta, svar med Förklaringen och resultatet', async () => {
    const f = fixtur()
    render(<FigurserieTrana start={START} forklaringEfterSvar harNivakoll datum="20 nov" api={f.api} />)
    expect(screen.getByRole('heading', { name: 'Träna figurserier' })).toBeTruthy()
    const kryss = screen.getByRole('checkbox', { name: /Förklaring efter varje svar/ }) as HTMLInputElement
    expect(kryss.checked).toBe(true)
    expect(f.api.skapa).not.toHaveBeenCalled()

    fireEvent.click(screen.getAllByText('Starta träningen')[0])
    await screen.findByText('Uppgift 1 av 4')
    expect(f.api.skapa).toHaveBeenCalledTimes(1)

    // Svara är inaktiv tills ett svar är markerat.
    const svara = () => document.querySelector('[data-primar="svara"]') as HTMLButtonElement
    expect(svara().disabled).toBe(true)
    // Fel svar först: ett alternativ som inte är facit.
    const fel = (f.rattIndex(0) + 1) % 6
    fireEvent.click(document.querySelectorAll('[data-serie-alt] button')[fel])
    expect(svara().disabled).toBe(false)
    await act(async () => {
      fireEvent.click(svara())
    })
    await waitFor(() => expect(document.querySelector('[data-forklaringen="fel"]')).toBeTruthy())
    expect(document.querySelector('[data-tillstand="ratt"]')).toBeTruthy()
    expect(document.querySelector('[data-tillstand="fel"]')).toBeTruthy()
    expect(screen.getByText('Inte den här')).toBeTruthy()

    fireEvent.click(document.querySelector('[data-primar="nasta"]')!)
    await screen.findByText('Uppgift 2 av 4')
    // Rätt svar.
    fireEvent.click(document.querySelectorAll('[data-serie-alt] button')[f.rattIndex(1)])
    await act(async () => {
      fireEvent.click(svara())
    })
    await waitFor(() => expect(document.querySelector('[data-forklaringen="ratt"]')).toBeTruthy())
    fireEvent.click(document.querySelector('[data-primar="nasta"]')!)
    await screen.findByText('Uppgift 3 av 4')
    // Vet inte, visa förklaringen.
    await act(async () => {
      fireEvent.click(screen.getByText('Vet inte, visa förklaringen'))
    })
    await waitFor(() => expect(document.querySelector('[data-forklaringen="vet_inte"]')).toBeTruthy())
    expect(f.svar[2].visat).toBe(null)
    fireEvent.click(document.querySelector('[data-primar="nasta"]')!)
    await screen.findByText('Uppgift 4 av 4')
    fireEvent.click(document.querySelectorAll('[data-serie-alt] button')[0])
    await act(async () => {
      fireEvent.click(svara())
    })
    await waitFor(() => expect(document.querySelector('[data-forklaringen]')).toBeTruthy())
    expect(screen.getByText('Visa resultatet')).toBeTruthy()
    await act(async () => {
      fireEvent.click(screen.getByText('Visa resultatet'))
    })
    await screen.findByText('Träningen klar')
    expect(document.querySelector('[data-resultatskarm="trana"]')).toBeTruthy()

    // Gå igenom öppnar genomgången i ramen.
    fireEvent.click(document.querySelector('[data-ga-igenom]')!)
    await waitFor(() => expect(document.querySelector('[data-genomgang-post]')).toBeTruthy())
    expect(screen.getByText('Träna, genomgång')).toBeTruthy()
  })

  it('kryssrutan av: Nästa bekräftar, ingen Förklaring, och valet sparas', async () => {
    const f = fixtur()
    render(<FigurserieTrana start={START} forklaringEfterSvar harNivakoll={false} datum="20 nov" api={f.api} />)
    fireEvent.click(screen.getByRole('checkbox', { name: /Förklaring efter varje svar/ }))
    expect(fetchSpion).toHaveBeenCalledWith('/api/traning/installningar', expect.objectContaining({ method: 'POST', body: JSON.stringify({ forklaring_efter_svar: false }) }))
    fireEvent.click(screen.getAllByText('Starta träningen')[0])
    await screen.findByText('Uppgift 1 av 4')
    expect(screen.getByText('Vet inte')).toBeTruthy()
    const nasta = () => document.querySelector('[data-primar="nasta"]') as HTMLButtonElement
    expect(nasta().disabled).toBe(true)
    fireEvent.click(document.querySelectorAll('[data-serie-alt] button')[2])
    await act(async () => {
      fireEvent.click(nasta())
    })
    await screen.findByText('Uppgift 2 av 4')
    expect(document.querySelector('[data-forklaringen]')).toBeNull()
    expect(f.svar[0].visat).toBe(2)
    // Vet inte går vidare utan förklaring.
    await act(async () => {
      fireEvent.click(screen.getByText('Vet inte'))
    })
    await screen.findByText('Uppgift 3 av 4')
    expect(document.querySelector('[data-forklaringen]')).toBeNull()
  })

  it('gratis: betalväggen på startskärmen, ingen startknapp', () => {
    const f = fixtur()
    render(<FigurserieTrana start={{ ...START, last: true }} forklaringEfterSvar harNivakoll datum="20 nov" api={f.api} />)
    expect(screen.queryByText('Starta träningen')).toBeNull()
    expect(document.querySelector('[data-start-sparr="premium"]')).toBeTruthy()
  })
})

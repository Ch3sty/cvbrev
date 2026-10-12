// Text- och sifferpassets flöde i jsdom mot ett fixtur-API: svar med ett
// tryck, förklaringen efter svaret, rubriken står still (C4), resultatet
// "3 av 4 rätt", inga tankstreck och aldrig rött.

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }), usePathname: () => '/dashboard/tester/pass' }))

const { klientform, ratta } = await import('@/lib/tester/pass-bank.server')
const { default: VnPassFlode } = await import('../vnpass/VnPassFlode')
import type { VnPassApi } from '@/lib/tester/pass-klient'
import type { VnKind, VnPassVy } from '@/lib/tester/pass-typer'

globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
} as unknown as typeof ResizeObserver
Element.prototype.scrollIntoView = () => {}

function fixtur(kind: VnKind, underlagId: string, familj: string | null = null): { vy: VnPassVy; api: VnPassApi } {
  const id = '00000000-0000-4000-8000-0000000000aa'
  const f = klientform(kind, underlagId, id, familj)!
  let vy: VnPassVy = {
    id,
    typ: familj ? 'riktat' : 'pass',
    kind,
    niva: 'avancerad',
    familj,
    upprepad: false,
    budget_s: kind === 'verbal' ? 150 : 300,
    startad: '2026-10-12T08:00:00Z',
    avslutad: false,
    expertRad: true,
    underlag: f.underlag,
    punkter: f.punkter,
    besvarade: {},
    aterkoppling: {},
    resultat: null,
  }
  const api: VnPassApi = {
    async skapa() {
      return { ok: true, session: vy }
    },
    async svara(inp) {
      const r = ratta(kind, underlagId, inp.nyckel, inp.svar, id)!
      const at = { correct: r.correct, ratt: r.ratt, forklaring: r.forklaring }
      vy = { ...vy, besvarade: { ...vy.besvarade, [inp.nyckel]: { svar: inp.svar, tid_s: inp.tid } }, aterkoppling: { ...vy.aterkoppling, [inp.nyckel]: at } }
      const besvarade = Object.keys(vy.besvarade).length
      return { ok: true, nyckel: inp.nyckel, aterkoppling: at, besvarade, antal: 4, klar: besvarade >= 4 }
    },
    async slutfor() {
      const ratt = Object.values(vy.aterkoppling).filter((a) => a.correct).length
      vy = {
        ...vy,
        avslutad: true,
        resultat: { ratt, antal: 4, tid_s: 120, budget_s: vy.budget_s, tappade: [{ familj: 'kvantor', ratt: 1, antal: 3, andel: 1 / 3, riktat: true }] },
      }
      return { ok: true, session: vy }
    },
    async session() {
      return vy
    },
  }
  return { vy, api }
}

const rubrik = () => document.querySelector('[data-pass-shell] header p span')?.textContent ?? ''

describe('VnPassFlode', () => {
  it('textpasset: rubriken står still, förklaringen efter svaret, resultatet 3 av 4', async () => {
    const { vy, api } = fixtur('verbal', 'va-07-foreningsstod')
    render(<VnPassFlode api={api} vy={vy} forhandsvisning />)
    expect(rubrik()).toBe('Textpass')
    expect(screen.getByText('1 / 4')).toBeInTheDocument()
    expect(screen.getAllByRole('radio').map((r) => r.textContent)).toEqual(['Sant', 'Falskt', 'Går inte att avgöra'])

    // Tre rätt och ett fel: facit ur banken.
    const facit = ['true', 'false', 'false', 'cannot_say']
    const fel = (s: string) => (s === 'true' ? 'Falskt' : 'Sant')
    const namn: Record<string, string> = { true: 'Sant', false: 'Falskt', cannot_say: 'Går inte att avgöra' }
    for (let i = 0; i < 4; i++) {
      const nyckel = vy.punkter[i].nyckel
      const ratt = ratta('verbal', 'va-07-foreningsstod', nyckel, facit[i], vy.id)
      const svar = ratt?.correct ? namn[facit[i]] : namn[ratta('verbal', 'va-07-foreningsstod', nyckel, 'cannot_say', vy.id)!.ratt]
      const val = i === 3 ? fel(ratta('verbal', 'va-07-foreningsstod', nyckel, 'true', vy.id)!.ratt) : svar
      await act(async () => {
        fireEvent.click(screen.getByRole('radio', { name: new RegExp(`^${val}`) }))
      })
      await waitFor(() => expect(document.querySelector('[data-vn-forklaring]')).not.toBeNull())
      expect(rubrik()).toBe('Textpass')
      expect(screen.getAllByRole('radio')).toHaveLength(3)
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: i === 3 ? 'Visa resultatet' : 'Nästa' }))
      })
    }
    await waitFor(() => expect(document.querySelector('[data-vn-resultat]')).not.toBeNull())
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('3 av 4 rätt.')
    expect(rubrik()).toBe('Textpass')
    expect(screen.getByText('Öva den här typen')).toBeInTheDocument()
    expect(screen.getByText('Du är på expertnivå. Gör nivåtestet i stället.')).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/[—–]/)
    expect(document.body.textContent).not.toMatch(/\d+\s?%/)
    expect(document.body.innerHTML).not.toMatch(/\b(text|bg|border)-fel\b/)
  })

  it('riktat textpass: rubriken är familjen och kvantorpåståendet kommer först', () => {
    const { vy, api } = fixtur('verbal', 'va-01-hemtjanstens-schema', 'kvantor')
    render(<VnPassFlode api={api} vy={vy} forhandsvisning />)
    expect(rubrik()).toBe('Alla, inga och ibland')
  })

  it('sifferpasset: underlaget med tabellen, alternativen som rader, räknare tillåten', () => {
    const { vy, api } = fixtur('numerisk', 'na-01-kommunbudget')
    render(<VnPassFlode api={api} vy={vy} forhandsvisning />)
    expect(rubrik()).toBe('Sifferpass')
    expect(screen.getByText('Räknare tillåten')).toBeInTheDocument()
    expect(document.querySelector('table')).not.toBeNull()
    expect(screen.getAllByRole('radio')).toHaveLength(4)
  })
})

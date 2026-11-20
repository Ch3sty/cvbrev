// Omgång 3, steg 2b: underlagets typer. Ord och text (stödmeningen i
// artikeln), siffror och tabeller (tabellens generella regel, markeringen
// efter facit och räknevägen i domen).

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn() }))

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const { VnUnderlag, markeraStycken, NUMERISK } = await import('../typer/Vn')
const { Raknevag, cellText, cellTal, huvudFor } = await import('../typer/Siffror')

const text = (stycken: string[], stod: string[], narmast: string | null = null) => markeraStycken(stycken, stod, narmast)

describe('stödmeningen i texten', () => {
  const stycken = ['Burkarna smälts ner. Pantsystemet sköts av ett företag som ägs av bryggerier och handeln. Sedan några år finns pant.']

  it('markerar meningen och sätter taggen efter den', () => {
    const b = text(stycken, ['Pantsystemet sköts av ett företag som ägs av bryggerier och handeln.'])
    const mark = b[0].filter((x) => x.slag === 'stod')
    expect(mark).toHaveLength(1)
    expect(mark[0].tagg).toBe(true)
    expect(b[0].map((x) => x.text).join('')).toBe(stycken[0])
  })

  it('tål radbrytningar och dubbla blanksteg i banken', () => {
    const b = text(stycken, ['Pantsystemet sköts av ett\nföretag som  ägs av bryggerier och handeln.'])
    expect(b[0].some((x) => x.slag === 'stod')).toBe(true)
  })

  it('en mening som inte finns ger ingen markering och inget fel', () => {
    const b = text(stycken, ['Det här står inte i texten.'])
    expect(b[0].every((x) => x.slag === null)).toBe(true)
  })

  it('närmast markeras bara när stod är tom (går inte att avgöra)', () => {
    expect(text(stycken, [], 'Sedan några år finns pant.')[0].some((x) => x.slag === 'narmast')).toBe(true)
    expect(text(stycken, ['Burkarna smälts ner.'], 'Sedan några år finns pant.')[0].some((x) => x.slag === 'narmast')).toBe(false)
  })

  it('artikeln ritar Här står det och Räcker inte efter facit, ingenting före', () => {
    const u = {
      nyckel: 'p:0',
      kind: 'verbal' as const,
      del: 'p',
      punkt: '0',
      underlag: { id: 'p', typ: 'text' as const, titel: 'Panten', amne: 'Miljö', text: stycken[0] },
      text: 'Påstående',
      alternativ: [],
      form: 'tre' as const,
      iDel: 1,
      delAntal: 4,
    }
    const { rerender, container } = render(<VnUnderlag u={u} />)
    expect(container.querySelector('[data-stod-mening]')).toBeNull()
    rerender(<VnUnderlag u={u} facitData={{ stod: ['Burkarna smälts ner.'] }} />)
    expect(screen.getByText('Här står det')).toBeTruthy()
    rerender(<VnUnderlag u={u} facitData={{ stod: [], narmast: 'Sedan några år finns pant.' }} />)
    expect(screen.getByText('Räcker inte')).toBeTruthy()
  })
})

describe('siffror och tabeller', () => {
  const tabell = {
    caption: 'Försäljning 2024 per kategori (MSEK)',
    headers: ['Kategori', 'Q1', 'Q4', 'Totalt'],
    rows: [
      ['Elektronik', '12.5', '22.1', '68.6'],
      ['Kläder', '6.8', '14.0', '38.1'],
      ['Totalt', '19.3', '36.1', '106.7'],
    ],
    highlightLastRow: true,
  }
  const u = {
    nyckel: 'q1',
    kind: 'numerisk' as const,
    del: 'n1',
    punkt: 'q1',
    underlag: { id: 'n1', typ: 'siffror' as const, titel: 'Försäljningsanalys', amne: null, kontext: 'Ett företag.', tabell, diagram: null },
    text: 'Fråga',
    alternativ: [],
    form: 'rader' as const,
    iDel: 1,
    delAntal: 4,
  }

  it('huvudet: tabellens rubrik och enheten ur parentesen', () => {
    expect(huvudFor(u.underlag, 'reserv')).toEqual({ titel: 'Försäljning 2024 per kategori', enhet: 'MSEK' })
    expect(cellText('12.5')).toBe('12,5')
    expect(cellTal('4 250')).toBe(4250)
  })

  it('färgprick per rad, stapel i totalkolumnen, summaraden som fot', () => {
    const { container } = render(<VnUnderlag u={u} />)
    expect(container.querySelectorAll('tbody .sess-prick')).toHaveLength(2)
    expect(container.querySelectorAll('tbody .sess-spar')).toHaveLength(2)
    expect(container.querySelector('tfoot [data-summa]')?.textContent).toContain('Totalt')
    expect(container.querySelector('[data-anvand]')).toBeNull()
  })

  it('efter facit tänds cellerna där raderna och kolumnerna i anvander möts', () => {
    const { container } = render(<VnUnderlag u={u} facitData={{ losning: { steg: [{ uttryck: '14,0 − 6,8 = 7,2' }], anvander: { rader: ['Kläder'], kolumner: ['Q1', 'Q4'] } } }} />)
    const celler = [...container.querySelectorAll('tbody td[data-anvand]')].map((c) => c.textContent)
    expect(celler).toEqual(['6,8', '14,0'])
  })

  it('räknevägen: ett steg per bricka, svaret grönt sist och slutsatsen under', () => {
    render(<Raknevag losning={{ steg: [{ uttryck: '60 − 42 = 18', etikett: 'skillnaden' }, { uttryck: '18 / 42 = 0,43', etikett: 'delat med januari' }], slutsats: 'Maj hade flest.' }} rattText="43 %" />)
    expect(screen.getByText('60 − 42 = 18')).toBeTruthy()
    expect(screen.getByText('18 ÷ 42 = 0,43')).toBeTruthy()
    expect(screen.getByText('43 %').closest('[data-svar]')).not.toBeNull()
    expect(screen.getByText('Maj hade flest.')).toBeTruthy()
  })

  it('utan losning ritar domen ingen räkneväg (förklaringen står ensam)', () => {
    const F = NUMERISK.Forklaring!
    const { container } = render(<F u={u} facit={{ ratt: 0, correct: true, regel: null, misstag: null, text: 'Förklaringen.' }} valt={0} plats="svar" />)
    expect(container.querySelector('[data-raknevag]')).toBeNull()
  })
})

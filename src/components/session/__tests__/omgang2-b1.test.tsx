// Omgång 2 steg B1: villkorskortet och remsan i deduktiv slutledning, texten
// som dokument och påståendets hjälprad i Ord och text, datatabellen och
// diagrammens skala i Siffror och tabeller, och miniatyrerna i listan.

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import bankGrund from '@/lib/deduktivV1/bankGrund.json'
import bankAvancerad from '@/lib/deduktivV1/bankAvancerad.json'
import bankExpert from '@/lib/deduktivV1/bankExpert.json'
import type { DeduktivFraga } from '@/lib/deduktivV1/types'

vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn() }))

const { DEDUKTIV, VillkorKort, markeraVillkor, remsansNamn, villkorPerPlats } = await import('../typer/Deduktiv')
const { VERBAL, NUMERISK, VnUnderlag, VnUppgift, delaKontext, delaRubrik, lasMeta } = await import('../typer/Vn')
const { skala } = await import('../typer/VnDiagram')
const { MATRIS } = await import('../typer/Matris')

globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const lista = (b: unknown) => (Array.isArray(b) ? b : (Object.values(b as object).find(Array.isArray) as unknown[])) as DeduktivFraga[]
const alla = [...lista(bankGrund), ...lista(bankAvancerad), ...lista(bankExpert)]

describe('deduktiv: villkorskortet och remsan', () => {
  it('sätter kvantorer och relationer i semibold, längsta frasen först', () => {
    const { container } = render(<p>{markeraVillkor('Den gröna pärmen ligger direkt till vänster om den svarta pärmen.')}</p>)
    expect([...container.querySelectorAll('b')].map((b) => b.textContent)).toEqual(['direkt till vänster om'])
    const { container: c2 } = render(<p>{markeraVillkor('Eva står inte bredvid Åsa och Leo står på plats 4.')}</p>)
    expect([...c2.querySelectorAll('b')].map((b) => b.textContent)).toEqual(['inte bredvid', 'på plats 4'])
    const { container: c3 } = render(<p>{markeraVillkor('Några studenter jobbar i kassan.')}</p>)
    expect(c3.querySelector('b')?.textContent).toBe('Några')
    // Inga träffar inne i ord.
    const { container: c4 } = render(<p>{markeraVillkor('Företaget har allergiker.')}</p>)
    expect(c4.querySelector('b')).toBeNull()
  })

  it('remsan heter efter uppgiftens objekt, annars platserna', () => {
    expect(remsansNamn('Fyra pärmar i olika färger ligger på en hylla, på plats 1 till 4 räknat från vänster.', 4).titel).toBe('Hyllan')
    expect(remsansNamn('Fem kollegor står i en rad på plats 1 till 5, räknat från vänster.', 5).titel).toBe('Raden')
    expect(remsansNamn('Sex kollegor håller en presentation var, i en turordning med plats 1 till 6.', 6).titel).toBe('Turordningen')
    expect(remsansNamn(null, 4).titel).toBe('Platserna 1 till 4')
  })

  it('varje uppgift med remsa i banken får platserna från servern och villkorstaggar ur lösningsgången', () => {
    const med = alla.filter((q) => q.losning.schema)
    expect(med.length).toBeGreaterThan(200)
    let taggade = 0
    let platser = 0
    for (const q of med) {
      const { tagg, steg } = villkorPerPlats(q.losning)
      expect(tagg).toHaveLength(q.losning.schema!.namn.length)
      expect(steg.every((s) => s >= 0 && s <= q.losning.steg.length)).toBe(true)
      platser += tagg.length
      taggade += tagg.filter(Boolean).length
      for (const t of tagg) if (t) expect(t).toMatch(/^(villkor \d+(, \d+)*|antagandet)$/)
    }
    // Varje plats låses av ett namngivet steg i lösningsgången.
    expect(taggade).toBe(platser)
  })

  it('ritar remsan tom i uppgiften och ifylld i facit, svarets plats markerad', () => {
    const q = alla.find((x) => x.losning.schema && x.losning.schema.koppar && x.intro?.includes('hylla'))!
    const { rerender, container } = render(<VillkorKort intro={q.intro} villkor={q.villkor} platser={q.losning.schema!.namn.length} />)
    expect(container.querySelector('[data-deduktiv-remsa="tom"]')).not.toBeNull()
    expect(screen.getByText('Hyllan')).toBeTruthy()
    rerender(<VillkorKort intro={q.intro} villkor={q.villkor} platser={q.losning.schema!.namn.length} losning={q.losning} />)
    expect(container.querySelector('[data-deduktiv-remsa="fylld"]')).not.toBeNull()
    expect(container.querySelectorAll('[data-svar]')).toHaveLength(1)
  })

  it('utan platser (premisskedjor och nya familjer) ingen remsa', () => {
    const { container } = render(<VillkorKort intro={null} villkor={['Alla elektriker har behörighetsbevis.']} />)
    expect(container.querySelector('[data-deduktiv-remsa]')).toBeNull()
  })

  it('har Förklaring och Miniatyr i ritaren', () => {
    expect(DEDUKTIV.Forklaring).toBeTypeOf('function')
    expect(DEDUKTIV.Miniatyr).toBeTypeOf('function')
    expect(MATRIS.Miniatyr).toBeTypeOf('function')
    expect(VERBAL.Miniatyr).toBeTypeOf('function')
    expect(NUMERISK.Miniatyr).toBeTypeOf('function')
  })
})

describe('ord och text: texten som dokument', () => {
  const u = {
    nyckel: 'p1:0',
    kind: 'verbal' as const,
    del: 'p1',
    punkt: '0',
    underlag: { id: 'p1', typ: 'text' as const, titel: 'Panten', amne: 'Miljö', text: 'Första stycket här.\n\nAndra stycket.\n\nTredje.' },
    text: 'Pantsystemet ger vinst.',
    alternativ: [
      { id: 'true', text: 'Sant' },
      { id: 'false', text: 'Falskt' },
      { id: 'cannot_say', text: 'Går inte att avgöra' },
    ],
    form: 'tre' as const,
    iDel: 2,
    delAntal: 4,
  }
  it('metaraden räknar stycken och lästid', () => {
    expect(lasMeta(['a b c', 'd', 'e'])).toBe('3 stycken, cirka 1 minut')
    expect(lasMeta([Array(500).fill('ord').join(' ')])).toBe('1 stycke, cirka 3 minuter')
    render(<VnUnderlag u={u} />)
    expect(screen.getByText('3 stycken, cirka 1 minut')).toBeTruthy()
  })
  it('hjälpraden om den tredje knappen står under de tre', () => {
    render(<VnUppgift u={u} nr={1} antal={4} vald={null} facit={null} last={false} onValj={() => {}} />)
    expect(screen.getByText('Går inte att avgöra: texten säger varken det ena eller det andra.')).toBeTruthy()
  })
})

describe('siffror och tabeller', () => {
  it('rubriken delas i namn och enhet', () => {
    expect(delaRubrik('Yta (kvm)')).toEqual({ namn: 'Yta', enhet: 'kvm' })
    expect(delaRubrik('Lokal')).toEqual({ namn: 'Lokal', enhet: null })
  })
  it('kontextens siffermeningar går till faktaraden, den första står kvar', () => {
    const k = 'Ett servicebolag har 80 anställda. Av dessa arbetar 45 heltid. Bolaget undersöker budgeten.'
    expect(delaKontext(k)).toEqual({ inledning: ['Ett servicebolag har 80 anställda. Bolaget undersöker budgeten.'], fakta: 'Av dessa arbetar 45 heltid.' })
    expect(delaKontext('Total marknad är 18.5 miljarder. Mer text.').fakta).toBeNull()
  })
  it('skalan har rena steg och nollan', () => {
    expect(skala(0, 300)).toMatchObject({ min: 0, max: 300, steg: 100, streck: [0, 100, 200, 300] })
    const s = skala(0, 47)
    expect(s.streck[0]).toBe(0)
    expect(s.max).toBeGreaterThanOrEqual(47)
    expect(s.streck.length).toBeLessThanOrEqual(5)
  })
})

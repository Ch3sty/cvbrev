/**
 * Raderade konton i adminen (beslut-mejl-och-radering 2c punkt 8): tomt läge
 * före migreringen, bara antalet under fem rader, fördelningar från fem, och
 * aldrig en rad för rad. Databasen är en dubbel.
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { hamtaAvslut, sammanstall, kvartalEtikett } from '../avslut'
import RaderadeKonton from '../RaderadeKonton'
import type { AvslutRad } from '@/lib/konto/avslut'

function rad(over: Partial<AvslutRad> = {}): AvslutRad {
  return {
    kvartal: '2026-10-01',
    kalla: 'webb',
    kontots_alder: '8_30_dagar',
    hade_premium: false,
    har_betalat: false,
    antal_cv: '1',
    antal_brev: '0',
    antal_test: '1_5',
    antal_sokta: '0',
    dagar_sedan_aktivitet: '1_7',
    anledning: null,
    ...over,
  }
}

function klient(svar: { data: unknown; error: unknown } | Error) {
  return {
    from: () => ({
      select: () => ({
        order: () => ({
          range: async () => {
            if (svar instanceof Error) throw svar
            return svar
          },
        }),
      }),
    }),
  }
}

describe('hamtaAvslut', () => {
  it('saknas tabellen blir det noll rader, aldrig ett fel', async () => {
    const logg = vi.spyOn(console, 'error').mockImplementation(() => {})
    const s = await hamtaAvslut(klient({ data: null, error: { message: "Could not find the table 'public.konto_avslut'" } }))
    expect(s.antal).toBe(0)
    const t = await hamtaAvslut(klient(new Error('nätet')))
    expect(t.antal).toBe(0)
    logg.mockRestore()
  })

  it('läser och räknar ihop raderna', async () => {
    const s = await hamtaAvslut(klient({ data: [rad(), rad({ anledning: 'for_dyrt' })], error: null }))
    expect(s.antal).toBe(2)
  })
})

describe('sammanstall', () => {
  it('räknar anledning, premium, användning och kvartal', () => {
    const s = sammanstall([
      rad({ anledning: 'for_dyrt', hade_premium: true, har_betalat: true }),
      rad({ anledning: 'for_dyrt', antal_brev: '2_5' }),
      rad({ kvartal: '2027-01-01', antal_cv: '0', antal_test: '0', antal_sokta: '1' }),
    ])
    expect(s.anledning.find((a) => a.etikett === 'För dyrt')?.antal).toBe(2)
    expect(s.anledning.at(-1)).toEqual({ etikett: 'Ingen anledning vald', antal: 1 })
    expect(s.premium).toEqual([
      { etikett: 'Hade Premium vid avslutet', antal: 1 },
      { etikett: 'Har betalat någon gång', antal: 1 },
    ])
    expect(s.anvandning).toEqual([
      { etikett: 'Minst ett CV', antal: 2 },
      { etikett: 'Minst ett brev', antal: 1 },
      { etikett: 'Minst ett test', antal: 2 },
      { etikett: 'Minst en sökt tjänst', antal: 1 },
    ])
    expect(s.perKvartal).toEqual([
      { etikett: '2026 kvartal 4', antal: 2 },
      { etikett: '2027 kvartal 1', antal: 1 },
    ])
  })

  it('kvartalets etikett', () => {
    expect(kvartalEtikett('2026-10-01')).toBe('2026 kvartal 4')
    expect(kvartalEtikett('2027-04-01')).toBe('2027 kvartal 2')
  })
})

describe('sektionen Raderade konton', () => {
  it('inga rader: nollan med sedan-datum', () => {
    render(<RaderadeKonton avslut={sammanstall([])} />)
    expect(screen.getByText(/^0 raderade konton sedan .+\.$/)).toBeTruthy()
  })

  it('färre än fem: bara antalet och förklaringen, ingen fördelning', () => {
    const { container } = render(<RaderadeKonton avslut={sammanstall([rad({ anledning: 'integritet' }), rad()])} />)
    expect(screen.getByText('Fördelningen visas när fem konton har raderats, så att ingen enskild rad går att känna igen.')).toBeTruthy()
    expect(container.textContent).not.toContain('Vill ta bort mina uppgifter')
    expect(container.querySelector('table')).toBeNull()
  })

  it('fem eller fler: kvartal och fem tabeller med antal och andel', () => {
    const rader = [rad({ anledning: 'fick_jobb' }), rad(), rad(), rad(), rad({ kvartal: '2027-01-01' })]
    const { container } = render(<RaderadeKonton avslut={sammanstall(rader)} />)
    expect(screen.getByText('2026 kvartal 4: 4')).toBeTruthy()
    expect(container.querySelectorAll('table')).toHaveLength(5)
    for (const r of ['Anledning', 'Kontots ålder', 'Premium', 'Senast aktiv', 'Användning']) expect(screen.getByText(r)).toBeTruthy()
    expect(screen.getByText('Har fått jobb')).toBeTruthy()
    expect(screen.getAllByText('20 %').length).toBeGreaterThan(0)
  })
})

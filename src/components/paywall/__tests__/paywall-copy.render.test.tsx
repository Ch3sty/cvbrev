import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PaywallCard from '@/components/paywall/PaywallCard'

describe('betalväggarnas nya copy', () => {
  it('nedladdning: brygga och knapp utan "Lås upp"', () => {
    render(<PaywallCard variant="nedladdning" />)
    expect(screen.getByText(/Läs och kopiera det fritt/)).toBeTruthy()
    expect(screen.getByText('Ladda ner med Premium')).toBeTruthy()
    expect(screen.getByText('Kopiera texten i stället')).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/Lås upp/)
  })

  it('cv-export: ingen siffra på mallarna', () => {
    render(<PaywallCard variant="cv-export" />)
    expect(screen.getByText(/alla mallar och obegränsade analyser/)).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/42 mallar/)
  })

  it('analys: argument utan förkortning', () => {
    render(<PaywallCard variant="analys" />)
    expect(screen.getByText(/genomgången avsnitt för avsnitt/)).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/ATS-genomgången/)
  })

  it('nedgraderad: påminner om vad som finns kvar', () => {
    render(<PaywallCard variant="nedgraderad" />)
    expect(screen.getByText('Fem dagar med Premium är över')).toBeTruthy()
    expect(screen.getByText(/finns kvar att läsa och kopiera/)).toBeTruthy()
  })
})

describe('prisstegen', () => {
  it('varje nivå har en rad som säger vem den passar', async () => {
    const { PLANS } = await import('@/lib/plans/plans')
    expect(PLANS.map((p) => p.audience)).toEqual([
      'En ansökan som ska in ikväll',
      'Flera ansökningar samma vecka',
      'Aktivt sökande, avsluta när du vill',
      'Ett längre sök eller byte av bransch',
    ])
  })
})

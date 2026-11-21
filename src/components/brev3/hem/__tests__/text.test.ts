import { describe, expect, it } from 'vitest'
import { jobbTagg, kravEtikett, langdOrd, narRelativt, rollKort, skalRad, soktaOgon, stortTalRader } from '../text'

const nu = new Date('2026-11-21T10:00:00Z') // lördag

describe('Dina brev, texterna', () => {
  it('datum i ord, svensk tid', () => {
    expect(narRelativt('2026-11-21T06:00:00Z', nu)).toBe('i dag')
    expect(narRelativt('2026-11-20T14:12:00Z', nu)).toBe('i går')
    expect(narRelativt('2026-11-17T10:00:00Z', nu)).toBe('i tisdags')
    expect(narRelativt('2026-11-02T10:00:00Z', nu)).toBe('2 nov')
    expect(jobbTagg('2026-11-20T23:30:00Z', nu)).toBe('I dag')
  })

  it('tjänsten kort på telefonen', () => {
    expect(rollKort('IT-projektledare till kundplattformen')).toBe('IT-projektledare')
    expect(rollKort('Projektledare, digitala hyresgästtjänster')).toBe('Projektledare')
    expect(rollKort('Projektledare IT')).toBe('Projektledare IT')
  })

  it('det stora talets rader', () => {
    expect(stortTalRader('av 7 krav i annonsen')).toEqual({ rad1: 'av 7 krav', rad2: 'i annonsen' })
    expect(stortTalRader('ord')).toEqual({ rad1: 'ord', rad2: null })
    expect(stortTalRader('ansökningar skickade')).toEqual({ rad1: 'ansökningar', rad2: 'skickade' })
  })

  it('mätarnas etiketter och rader', () => {
    expect(kravEtikett(6, 7, ['Engelska i tal och skrift'])).toBe('Sex av sju krav besvaras i brevet. Engelska i tal och skrift saknas.')
    expect(langdOrd(0.72)).toBe('Brevet fyller knappt tre fjärdedelar av en sida.')
    expect(langdOrd(1.1)).toBe('Brevet går över till sida två.')
    expect(soktaOgon(1)).toBe('Sökta tjänster · 1 ansökan')
    expect(soktaOgon(0)).toBe('Sökta tjänster')
    expect(skalRad(['Din roll matchar', '3 av dina kompetenser nämns i annonsen'])).toBe('Passar ditt CV: din roll matchar och 3 av dina kompetenser nämns i annonsen.')
    expect(skalRad([])).toBeNull()
  })
})

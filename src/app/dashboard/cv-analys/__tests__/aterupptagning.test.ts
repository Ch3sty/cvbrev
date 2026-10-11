// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { aterupptagning } from '../aterupptagning'
import { formatCVDate } from '@/lib/utils/date-formatter'

const result = {
  atsFriendliness: { score: 72 },
  profileSummary: { atsImpact: 9, improvedText: 'Projektledare med sju år i offentlig sektor.' },
  roleBasedImprovements: [
    { roleTitle: 'Projektledare', atsImpact: 5, suggestedText: 'Ledde åtta IT-projekt.' },
    { roleTitle: 'Koordinator', atsImpact: 0, suggestedText: '' },
  ],
  skillSuggestions: [{ skill: 'SAP', atsImpact: 4 }, { skill: 'Agil projektledning', atsImpact: 3 }],
  structuredCV: { summary: 'Driven person.', experience: [] },
}

describe('återupptagen CV-analys (21.2 fråga 2)', () => {
  it('landar i granskningen med analysens förslag förvalda, id och namn i resultatet', () => {
    const a = aterupptagning({ id: 'jobb1', cvId: 'cv1', displayName: 'Projektledare, VGR', result })
    expect(a.steg).toBe(5)
    expect(a.cvId).toBe('cv1')
    expect(a.resultat).toMatchObject({ id: 'jobb1', display_name: 'Projektledare, VGR' })
    expect(a.val).toEqual({ profil: true, roller: [0], kompetenser: [0, 1], allmant: [] })
  })
  it('det som valdes senast vinner, och utan strukturerat CV landar den på resultatet', () => {
    const { structuredCV: _, ...utan } = result
    const a = aterupptagning({
      id: 'jobb2',
      cvId: null,
      displayName: null,
      result: { ...utan, selectedImprovements: { profile: false, roles: [0], skills: [1], general: [] } },
    })
    expect(a.steg).toBe(3)
    expect(a.val).toEqual({ profil: false, roller: [0], kompetenser: [1], allmant: [] })
  })
})

describe('relativa datum (21.3 punkt 8)', () => {
  it('1 vecka sedan, annars N veckor sedan', () => {
    const dagar = (n: number) => new Date(Date.now() - n * 86400000 - 3600000).toISOString()
    expect(formatCVDate(dagar(8))).toBe('1 vecka sedan')
    expect(formatCVDate(dagar(15))).toBe('2 veckor sedan')
  })
})

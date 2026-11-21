import { describe, expect, it } from 'vitest'
import { arNy, faktaRutor, kravOchMeriterande, passarSkal, skalKort, ansokan } from '../annons'
import type { MatchScore } from '@/app/dashboard/jobbmatchning/data/match-score'

const score = (p: Partial<MatchScore>): MatchScore => ({
  score: 92,
  roleHits: 1,
  roleTotal: 3,
  skillHits: 0,
  skillTotal: 0,
  hasStatedSkills: false,
  locationLabel: 'Umeå',
  isRemote: false,
  parts: { roles: 0, skills: 0, location: 1, freshness: 0 },
  ...p,
})

const annons = {
  id: '123',
  headline: 'Ekonomiassistent',
  employer: { name: 'Ålö AB' },
  workplace_address: { municipality: 'Umeå' },
  publication_date: '2026-11-19T08:00:00',
  employment_type: { label: 'Vanlig anställning' },
  working_hours_type: { label: 'Heltid' },
  salary_description: 'Enligt överenskommelse',
  must_have: { skills: [{ label: 'Leverantörsreskontra' }, { label: 'SAP' }], work_experiences: [] },
  nice_to_have: { skills: [{ label: 'Excel' }] },
  application_details: { url: 'https://example.se/ansok', via_af: true },
}

describe('passarSkal', () => {
  it('kravprofil: kompetenserna en och en, den som saknas markeras', () => {
    const { skal } = passarSkal(annons, { extracted_skills: ['Leverantörsreskontra'], extracted_location: 'Umeå' }, [], score({}))
    expect(skal[0].rubrik).toBe('1 av dina 3 roller')
    expect(skal[0].text).toBe('Ekonomiassistent stämmer med en av de tre rollerna i ditt CV.')
    expect(skal[1].rubrik).toBe('1 av 2 kompetenser i kravprofilen')
    expect(skal[1].kompetenser).toEqual({ har: ['Leverantörsreskontra'], saknas: ['SAP'] })
    expect(skal[2]).toEqual({ rubrik: 'Umeå', text: 'Samma ort som i ditt CV.' })
  })
  it('utan kravprofil markeras ingen kompetens som saknad', () => {
    const utan = { ...annons, must_have: {}, nice_to_have: {}, description: { text: 'Du arbetar med leverantörsreskontra och Fortnox.' } }
    const { skal } = passarSkal(utan, { extracted_skills: ['Leverantörsreskontra', 'Fortnox', 'SAP'] }, ['Umeå'], score({ roleTotal: 1 }))
    const komp = skal.find((s) => s.kompetenser)
    expect(komp?.kompetenser?.saknas).toEqual([])
    expect(skal[0].rubrik).toBe('Din roll matchar')
    expect(skal.at(-1)?.text).toBe('En av orterna du har valt.')
  })
  it('distans före orten', () => {
    const { skal } = passarSkal(annons, null, [], score({ isRemote: true }))
    expect(skal.at(-1)?.rubrik).toBe('Distans')
  })
})

describe('raden och annonsen', () => {
  it('skälen kort på telefon', () => {
    expect(skalKort(['Din roll matchar', '6 av 7 kompetenser i kravprofilen', 'Umeå'])).toBe('Din roll, 6 av 7 kompetenser')
    expect(skalKort(['2 av dina 3 roller', 'Distans'])).toBe('2 av dina 3 roller, distans')
  })
  it('faktarutorna: lönen bara som annonsens egen text', () => {
    const f = faktaRutor(annons, Date.parse('2026-11-21T12:00:00Z'))
    expect(f[0]).toEqual({ varde: 'Vanlig anställning, heltid', etikett: 'Anställningsform' })
    expect(f[1].varde).toBe('19 november')
    expect(f[2]).toEqual({ varde: 'Enligt överenskommelse', etikett: 'Lön, annonsens egen text' })
  })
  it('krav och meriterande', () => {
    expect(kravOchMeriterande(annons)).toEqual({ krav: ['Leverantörsreskontra', 'SAP'], meriterande: ['Excel'] })
  })
  it('ny efter senaste besöket', () => {
    expect(arNy(annons, '2026-11-18T00:00:00Z')).toBe(true)
    expect(arNy(annons, '2026-11-20T00:00:00Z')).toBe(false)
    expect(arNy(annons, null)).toBe(false)
  })
  it('ansökan via Arbetsförmedlingen', () => {
    expect(ansokan(annons)).toEqual({ url: 'https://example.se/ansok', text: 'Ansök via Arbetsförmedlingen' })
  })
})

describe('orten (rättningsrundan)', () => {
  it('en ort som inte är användarens står aldrig som skäl', () => {
    const { skal } = passarSkal(annons, null, [], score({ locationLabel: 'Stockholm', parts: { roles: 0, skills: 0, location: 0.3, freshness: 0 } }))
    expect(skal.some((s) => s.rubrik === 'Stockholm')).toBe(false)
  })
})

describe('skälen kort med ort', () => {
  it('ortnamn behåller stor bokstav, en kompetens i singular', () => {
    expect(skalKort(['1 av dina 3 roller', 'Umeå'])).toBe('1 av dina 3 roller, Umeå')
    expect(skalKort(['1 av dina kompetenser nämns i annonsen', 'Umeå'])).toBe('1 kompetens nämns, Umeå')
  })
})

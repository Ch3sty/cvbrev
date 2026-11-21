/**
 * CV-rummet omgång 1: innehållet (språk bara när vi letat), potentialen
 * (analysöversiktens uträkning), flikarnas adresser och förhandsvisningens
 * delade minne (samma CV och mall ger samma nyckel oavsett valens ordning).
 */
import { describe, expect, it } from 'vitest'
import { innehallUrCv } from '../cvRum'
import { raknaPotential, potentialPoang } from '@/lib/cv/analys/potential'
import { flikHref } from '@/components/cv/rum3/flikar'
import { nyckelFor } from '@/components/cv/Dokument/hooks'

const CV = {
  personalInfo: { fullName: 'Erik' },
  summary: 'Projektledare.',
  experience: [{ position: 'Projektledare', company: 'Nordea' }],
  education: [{ degree: 'Civilingenjör', institution: 'KTH' }],
  skills: [{ category: 'Kompetenser', skills: ['Scrum'] }],
}

describe('innehallUrCv', () => {
  it('räknar fem avsnitt när språken är inlästa och tomma, och språk saknas', () => {
    const i = innehallUrCv({ ...CV, languages: [] }, 'saknas')
    expect(i.avsnitt).toHaveLength(5)
    expect(i.avsnitt.filter((a) => a.finns)).toHaveLength(4)
    expect(i.avsnitt.find((a) => !a.finns)?.nyckel).toBe('sprak')
  })
  it('säger ingenting om språk som vi aldrig letat efter', () => {
    const i = innehallUrCv(CV, 'inte_inlast')
    expect(i.avsnitt.map((a) => a.nyckel)).not.toContain('sprak')
    expect(i.avsnitt.every((a) => a.finns)).toBe(true)
  })
  it('läser gamla roles-formatet och saknad struktur', () => {
    expect(innehallUrCv({ profile: 'x', roles: [{ title: 'A' }] }, 'inte_inlast').avsnitt.find((a) => a.nyckel === 'erfarenhet')?.finns).toBe(true)
    expect(innehallUrCv(null, 'inte_inlast').strukturerat).toBe(false)
  })
})

describe('potentialen', () => {
  it('följer analysöversiktens uträkning', () => {
    const r = {
      profileSummary: { atsImpact: 8 },
      roleBasedImprovements: [{ atsImpact: 6 }, { atsImpact: 3 }],
      skillSuggestions: [{ relevance: 'high' }, { relevance: 'medium' }],
      generalImprovements: [{ category: 'Nyckelord' }],
    }
    const p = raknaPotential(r)
    expect(p.roles).toBe(18)
    expect(p.total).toBe(Math.round(8 + 18 + 1.5 + 2))
    expect(potentialPoang(62, r)).toBe(92)
    expect(potentialPoang(95, r)).toBe(100)
  })
})

describe('flikarna', () => {
  it('bär CV:t i ?cv=', () => {
    expect(flikHref('mallar', 'abc', { mall: 'linne' })).toBe('/dashboard/cv-mallar?cv=abc&mall=linne')
    expect(flikHref('cv')).toBe('/dashboard/profil/cv')
  })
})

describe('förhandsvisningens minne', () => {
  it('ger samma nyckel för samma CV, mall och val i annan ordning', () => {
    const a = nyckelFor({ typ: 'inloggad', cvId: '1', structuredData: CV, cvText: 't', mall: 'linne', val: { rubriker: {}, farg: 1 } })
    const b = nyckelFor({ typ: 'inloggad', mall: 'linne', val: { farg: 1 }, cvText: 't', structuredData: CV, cvId: '1' })
    expect(a).toBe(b)
  })
  it('ger ny nyckel när CV:t ändras', () => {
    const a = nyckelFor({ typ: 'inloggad', cvId: '1', structuredData: CV, mall: 'linne', val: {} })
    const b = nyckelFor({ typ: 'inloggad', cvId: '1', structuredData: { ...CV, summary: 'Ny' }, mall: 'linne', val: {} })
    expect(a).not.toBe(b)
  })
})

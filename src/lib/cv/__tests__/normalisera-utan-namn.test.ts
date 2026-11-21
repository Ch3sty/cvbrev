// @vitest-environment node
/**
 * Inläsningen (parseCV) frågar inte modellen om namnet sedan 2026-11-21
 * (inga personuppgifter till AI:n). Hittas namnet inte lokalt är det tomt,
 * och då får normaliseringen inte kasta rollerna: den publika tolkningen och
 * uppladdningen föll annars till reserven utan erfarenhet.
 */
import { describe, expect, it } from 'vitest'
import { normalizeStructuredData } from '../normalize-structured-data'

const ROLLER = {
  name: '',
  profile: 'Ekonomichef med arton års erfarenhet.',
  roles: [
    { title: 'Ekonomichef', company: 'Nordström Industri AB', period: '2020 - Pågående', description: 'Ansvarar för ekonomi.', originalText: '' },
    { title: 'Controller', company: 'Åhléns AB', period: '2015 - 2020', description: 'Uppföljning.', originalText: '' },
  ],
  education: [{ degree: 'Civilekonom', institution: 'Handelshögskolan', period: '2002 - 2006' }],
  skills: ['Controlling', 'Power BI'],
  languages: [{ language: 'Engelska', proficiency: 'Flytande' }],
  contact: { email: '', phone: '', address: '' },
}

describe('normalizeStructuredData med tomt namn', () => {
  it('behåller roller, profil och utbildning när namnet saknas', () => {
    const cv = normalizeStructuredData(ROLLER)!
    expect(cv).not.toBeNull()
    expect(cv.personalInfo.fullName).toBe('')
    expect(cv.experience).toHaveLength(2)
    expect(cv.experience[0].position).toBe('Ekonomichef')
    expect(cv.summary).toBe('Ekonomichef med arton års erfarenhet.')
    expect(cv.education).toHaveLength(1)
  })

  it('ger fortfarande null när varken namn, roller eller profil finns', () => {
    expect(normalizeStructuredData({ name: '', profile: '', roles: [], education: [], skills: [] })).toBeNull()
  })

  it('namnet följer med när det finns, som förut', () => {
    expect(normalizeStructuredData({ ...ROLLER, name: 'Märta Söderström' })!.personalInfo.fullName).toBe('Märta Söderström')
  })
})

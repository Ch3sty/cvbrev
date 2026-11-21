/**
 * Det kanoniska CV:t ur inläsningens roles-format ska vara det arket visar
 * (normalizeStructuredData), eftersom det är det som räknas och det som
 * sparas när hon ersätter sitt CV i analysflödet.
 */
import { describe, expect, it } from 'vitest'
import { kanonisktCv, kompetenserIcv, delaKompetens } from '@/lib/cv/poang'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'

const ROLLER = {
  name: 'Erik Lindberg',
  profile: 'Lagerarbetare med fem års erfarenhet.',
  roles: [
    {
      title: 'Lagerarbetare',
      company: 'Logistikbolaget AB',
      period: '2019 - 2024',
      description: 'Plockade order med truck, Ansvarade för inleverans',
      responsibilities: ['Plockade order med truck', 'Ansvarade för inleverans'],
      originalText: '',
    },
    { title: 'Butiksbiträde', company: 'Livsbutiken', period: '2017 - 2019', description: 'Kassa\nVarupåfyllning', originalText: '' },
  ],
  education: [],
  skills: ['Truckkort A och B', 'Lagersystem', 'Excel och Word'],
}

describe('kanonisktCv för roles-formatet', () => {
  it('punkterna är desamma som arket visar (responsibilities före beskrivningen)', () => {
    const k = kanonisktCv(ROLLER)!
    const arket = normalizeStructuredData(ROLLER)!
    expect(k.experience[0].description).toEqual(['Plockade order med truck', 'Ansvarade för inleverans'])
    expect(k.experience[0].description).toEqual(arket.experience[0].description)
    expect(k.experience[1].description).toEqual(['Kassa', 'Varupåfyllning'])
  })
})

describe('delaKompetens', () => {
  it('"och" delar inte bort ett kort led', () => {
    expect(delaKompetens('Truckkort A och B')).toEqual(['Truckkort A och B'])
  })
  it('"och" mellan två egna termer delar som förut', () => {
    expect(delaKompetens('Excel och Word')).toEqual(['Excel', 'Word'])
    expect(delaKompetens('Kunskaper-Säljteknik-Mötesbokning')).toEqual(['Kunskaper', 'Säljteknik', 'Mötesbokning'])
  })
  it('kompetenserna i ett inläst CV tappar inget', () => {
    expect(kompetenserIcv(kanonisktCv(ROLLER)!.skills)).toEqual(['Truckkort A och B', 'Lagersystem', 'Excel', 'Word'])
  })
})

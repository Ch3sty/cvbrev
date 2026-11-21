/**
 * Platshållare som står kvar i CV:t och vad siffrorna ger (efterrättning A
 * 2026-11-21). Plus som utlovas ska vara exakt det hon får när hon fyllt i
 * sina egna tal.
 */
import { describe, expect, it } from 'vitest'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { kanonisktCv } from '../kanon'
import { raknaPoang } from '../modell'
import { medSiffror, platshallareIRad, platshallareKvar, plusForSiffror } from '../siffror'

const MED_ANTAL: CVMetadata = {
  personalInfo: { fullName: 'Sara Lind', email: 'sara.lind@exempel.se', phone: '070-555 12 34', address: 'Uppsala', title: 'Butikssäljare' },
  summary:
    'Butikssäljare med vana av kassa, varuplock och kundmöten i en stor butik. Jag har hjälpt [antal] kunder om dagen och vet hur man håller ordning på lager och hyllor när det är mycket att göra.',
  experience: [
    {
      position: 'Butikssäljare',
      company: 'ICA Kvantum',
      startDate: '2019',
      endDate: '2024',
      description: [
        'Hjälpte kunder att hitta rätt varor i butiken',
        'Ansvarade för kassan under helger med [antal] kunder per pass',
        'Fyllde på hyllor och tog emot leveranser',
      ],
    },
    {
      position: 'Lagerarbetare',
      company: 'PostNord',
      startDate: '2017',
      endDate: '2019',
      description: ['Plockade order till butiker', 'Körde truck vid in- och utleveranser'],
    },
  ],
  education: [{ degree: 'Gymnasieexamen', institution: 'Katedralskolan', startDate: '2014', endDate: '2017' }],
  skills: [{ category: 'Färdigheter', skills: ['Kassa', 'Kundservice', 'Truckkort', 'Lagerhantering', 'Varuplock', 'Merförsäljning'] }],
  languages: [{ language: 'Svenska', proficiency: 'Modersmål' }],
}

describe('platshallareKvar', () => {
  it('hittar raderna med [antal] i CV:ts ordning, med avsnitt och jobbets plats', () => {
    const kvar = platshallareKvar(MED_ANTAL)
    expect(kvar.map((k) => [k.avsnitt, k.index ?? null])).toEqual([
      ['profil', null],
      ['erfarenhet', 0],
    ])
    expect(kvar[1].text).toBe('Ansvarade för kassan under helger med [antal] kunder per pass')
  })

  it('tomt när inget står kvar', () => {
    const ifyllt = medSiffror(MED_ANTAL, '40')
    expect(platshallareKvar(ifyllt)).toEqual([])
    expect(plusForSiffror(ifyllt)).toBe(0)
  })

  it('maskeringens platshållare och kontaktuppgifterna räknas inte', () => {
    const cv: CVMetadata = {
      ...MED_ANTAL,
      personalInfo: { fullName: '[NAMN]', email: '[EMAIL]', phone: '[TEL]' },
      summary: 'Nås på [EMAIL] och [TEL].',
      experience: [],
    }
    expect(platshallareKvar(cv)).toEqual([])
  })

  it('läser lagrade rader i alla format (roles-formatet)', () => {
    const kvar = platshallareIRad({
      name: 'Test',
      profile: 'Säljare.',
      roles: [{ title: 'Säljare', company: 'Butik', period: '2019 till 2024', responsibilities: ['Sålde till [antal] kunder i veckan'] }],
    })
    expect(kvar).toEqual([{ avsnitt: 'erfarenhet', index: 0, text: 'Sålde till [antal] kunder i veckan' }])
  })

  it('en rad med två platshållare är en rad', () => {
    const cv: CVMetadata = { ...MED_ANTAL, summary: undefined, experience: [{ position: 'A', company: 'B', startDate: '2020', description: ['Ledde [antal] personer och [antal] projekt'] }] }
    expect(platshallareKvar(cv)).toHaveLength(1)
  })
})

describe('plus för siffrorna är sant', () => {
  it('poäng med ifyllda tal minus poäng i dag, större än noll här', () => {
    const plus = plusForSiffror(MED_ANTAL)
    expect(plus).toBeGreaterThan(0)
    expect(plus).toBe(raknaPoang(medSiffror(MED_ANTAL)).total - raknaPoang(MED_ANTAL).total)
  })

  it('ett CV där hon fyllt i egna tal får exakt den utlovade poängen', () => {
    const idag = raknaPoang(MED_ANTAL).total
    const plus = plusForSiffror(MED_ANTAL)
    // Hon skriver sina egna tal, olika på varje rad, som hon skulle göra i arbetsläget.
    const ifyllt: CVMetadata = JSON.parse(
      JSON.stringify(MED_ANTAL)
        .replace('hjälpt [antal] kunder', 'hjälpt 120 kunder')
        .replace('med [antal] kunder per pass', 'med 350 kunder per pass')
    )
    expect(platshallareKvar(ifyllt)).toEqual([])
    expect(raknaPoang(ifyllt).total).toBe(idag + plus)
    // Samma sak efter att CV:t sparats och lästs tillbaka (kanonisk form).
    expect(raknaPoang(kanonisktCv(ifyllt)!).total).toBe(idag + plus)
  })

  it('vilket tal hon skriver spelar ingen roll för poängen', () => {
    const a = raknaPoang(medSiffror(MED_ANTAL, '3')).total
    const b = raknaPoang(medSiffror(MED_ANTAL, '12')).total
    const c = raknaPoang(medSiffror(MED_ANTAL, '4500')).total
    expect(new Set([a, b, c]).size).toBe(1)
  })

  it('noll plus när talen inte ändrar poängen', () => {
    // Rollen har redan ett tal, så [antal] på samma roll ger inget mer där.
    const cv: CVMetadata = {
      ...MED_ANTAL,
      summary: MED_ANTAL.summary!.replace('[antal]', 'många'),
      experience: [
        {
          ...MED_ANTAL.experience[0],
          description: ['Hjälpte 80 kunder per dag i butiken', 'Ansvarade för kassan med [antal] kunder per pass', 'Fyllde på hyllor och tog emot leveranser'],
        },
        MED_ANTAL.experience[1],
      ],
    }
    expect(platshallareKvar(cv)).toHaveLength(1)
    expect(plusForSiffror(cv)).toBe(0)
  })
})

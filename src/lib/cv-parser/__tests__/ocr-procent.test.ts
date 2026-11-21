import { describe, expect, it } from 'vitest'
import { lagaProcent } from '@/lib/cv-parser/ocr'

/**
 * OCR:en läser "35 %" som "35 24" (bild-cv-erik-lindberg.pdf). Rättningen
 * ska bara slå till där "24" inte kan betyda något annat.
 */
describe('lagaProcent', () => {
  it('rättar procent som lästs som 24', () => {
    // Raderna ur bildfixturen, som OCR:en gav dem i produktion.
    expect(lagaProcent('+ Införde agilt arbetssätt som ökade leveranstakten med 35 24')).toBe(
      '+ Införde agilt arbetssätt som ökade leveranstakten med 35 %'
    )
    expect(lagaProcent('e Införde Scrum och kortade tiden till lansering med 40 24\ne Handledde 3 juniora')).toBe(
      'e Införde Scrum och kortade tiden till lansering med 40 %\ne Handledde 3 juniora'
    )
    expect(lagaProcent('Minskade svinnet med 12,5 24.')).toBe('Minskade svinnet med 12,5 %.')
    expect(lagaProcent('Ökade försäljningen med cirka 8 24 på ett år')).toBe('Ökade försäljningen med cirka 8 % på ett år')
    expect(lagaProcent('Höjde andelen från 10 24 till 12 24, jämfört med')).toBe('Höjde andelen från 10 % till 12 %, jämfört med')
  })

  it('rör inte 24 som betyder något annat', () => {
    const orort = [
      'Ansvarade för 24 anställda',
      'Butikschef med 24 anställda',
      'Projektledare 2018 till 2024',
      'Biträdande 2016-2024',
      'Jour klockan 08.24',
      'Öppet 8 till 24',
      'Sveavägen 12, 114 24 Stockholm',
      'Postadress: 114 24',
      'Arbetade på 2 24-timmarspass i veckan',
      'Gick med 3 24 timmars skift',
      'Tel 070 24 56 78',
      'Utbildade 24 handläggare',
      'Arbetade 24 timmar i veckan',
      'Ökade med 35 % och 24 nya kunder',
      'med 135 24',
    ]
    for (const rad of orort) expect(lagaProcent(rad)).toBe(rad)
  })
})

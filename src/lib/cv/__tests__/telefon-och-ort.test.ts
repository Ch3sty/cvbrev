/**
 * Klicktestet på live 2026-11-22 (F1 och Övrigt): den publika CV-tolkningen
 * tappade sista siffran i "070-000 00 00", läste inte ut orten utan
 * postnummer och slog ihop "bygg- och" till "byggoch".
 */
import { describe, it, expect } from 'vitest'
import { SVENSKT_TELEFONNUMMER, normaliseraTelefon, parseSwedishCVContent } from '@/lib/cv/swedish-cv-content-parser'
import { cleanExtractedText } from '@/lib/cv-parser/text-utils'

function las(text: string): string | null {
  return text.match(SVENSKT_TELEFONNUMMER)?.[0] ?? null
}

describe('SVENSKT_TELEFONNUMMER', () => {
  it.each([
    ['070-123 45 67'],
    ['070 123 45 67'],
    ['0701234567'],
    ['070-000 00 00'],
    ['+46 70 123 45 67'],
    ['+46 (0)70-123 45 67'],
    ['+46701234567'],
    ['0046 70 123 45 67'],
    ['08-123 456 78'],
    ['031-12 34 56'],
    ['0480-123 45'],
  ])('läser "%s" hela', (nummer) => {
    expect(las(`Telefon: ${nummer}`)).toBe(nummer)
    expect(las(`Projektledare | Göteborg | test@example.invalid | ${nummer}`)).toBe(nummer)
  })

  it('slukar inte ett postnummer eller årtal efter numret', () => {
    expect(las('070-123 45 67 411 05 Göteborg')).toBe('070-123 45 67')
    expect(las('031-12 34 56 41105 Göteborg')).toBe('031-12 34 56')
    expect(las('08-123 456 78 2016')).toBe('08-123 456 78')
    expect(las('031-12 34 56 2016 till 2020')).toBe('031-12 34 56')
  })

  it('tar inte datum, årtal, postnummer eller personnummer för ett nummer', () => {
    expect(las('2020-01-05 till 2021-03-04')).toBeNull()
    expect(las('411 05 Göteborg')).toBeNull()
    expect(las('2016 till 2020')).toBeNull()
    expect(las('19850101-1234')).toBeNull()
  })
})

describe('normaliseraTelefon', () => {
  it('behåller numret som det står och ändrar aldrig siffrorna', () => {
    expect(normaliseraTelefon('070-123 45 67')).toBe('070-123 45 67')
    expect(normaliseraTelefon('+46 70 123 45 67')).toBe('+46 70 123 45 67')
    expect(normaliseraTelefon('08-123 456 78')).toBe('08-123 456 78')
    expect(normaliseraTelefon('031 - 12 34 56')).toBe('031-12 34 56')
  })

  it('grupperar ett mobilnummer utan mellanrum och skriver 0046 som +46', () => {
    expect(normaliseraTelefon('0701234567')).toBe('070-123 45 67')
    expect(normaliseraTelefon('0046 70 123 45 67')).toBe('+46 70 123 45 67')
  })
})

describe('parseSwedishCVContent, kontaktraden', () => {
  const CV = [
    'Test Testsson',
    'Projektledare | Göteborg | test.testsson@example.invalid | 070-000 00 00',
    'Profil',
    'Projektledare med åtta års erfarenhet av bygg- och infrastrukturprojekt.',
  ].join('\n')

  it('läser telefonnumret hela och orten utan postnummer', async () => {
    const cv = await parseSwedishCVContent(CV)
    expect(cv.personalInfo.phone).toBe('070-000 00 00')
    expect(cv.personalInfo.address).toBe('Göteborg')
  })

  it('behåller postnummer och ort när de finns', async () => {
    const cv = await parseSwedishCVContent('Test Testsson\nStorgatan 1, 411 05 Göteborg\n070-123 45 67')
    expect(cv.personalInfo.address).toBe('411 05 Göteborg')
    expect(cv.personalInfo.phone).toBe('070-123 45 67')
  })
})

describe('cleanExtractedText, bindestreck inom en rad', () => {
  it('behåller "bygg- och" och liknande sammandragningar', () => {
    expect(cleanExtractedText('erfarenhet av bygg- och infrastrukturprojekt')).toBe('erfarenhet av bygg- och infrastrukturprojekt')
    expect(cleanExtractedText('för- eller nackdelar')).toBe('för- eller nackdelar')
    expect(cleanExtractedText('heltids- till deltidstjänst')).toBe('heltids- till deltidstjänst')
  })

  it('slår fortfarande ihop avstavning mitt i ett ord', () => {
    expect(cleanExtractedText('infra- struktur')).toBe('infrastruktur')
    expect(cleanExtractedText('projekt- ledare')).toBe('projektledare')
  })
})

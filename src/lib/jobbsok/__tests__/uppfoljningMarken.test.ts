import { describe, expect, it } from 'vitest'
import { maskForModel } from '@/lib/privacy/pii'
import { valideraAiMejl } from '../uppfoljning'
import { amneMedMarken, aterstallMarken, maskaMedMarken, valideraMejlMedMarken } from '../uppfoljningMarken'

const opts = { detectNameHeuristically: false, fullName: 'Anna Lindqvist', knownPhones: ['070-123 45 67'] }

/** Det som går till AI:n får inte innehålla något av originalvärdena. */
function inget(skickat: string[], varden: string[]) {
  const text = skickat.join('\n')
  for (const v of varden) expect(text).not.toContain(v)
}

describe('maskaMedMarken', () => {
  it('telefon blir [TELEFON 1] och kommer tillbaka ordagrant', () => {
    const stycken = ['Jag sökte tjänsten den 3 november.', 'Ring mig gärna på 070-123 45 67 om ni undrar något.']
    const m = maskaMedMarken(stycken, opts)!
    expect(m.stycken[1]).toBe('Ring mig gärna på [TELEFON 1] om ni undrar något.')
    expect(m.marken).toEqual([{ mark: '[TELEFON 1]', varde: '070-123 45 67' }])
    inget(m.stycken, ['070-123 45 67'])
    const svar = valideraMejlMedMarken({ amne: 'Ansökan', stycken: ['Jag sökte den 3 november.', 'Ring [TELEFON 1].'] }, 40, m.marken)
    expect(svar?.stycken).toEqual(['Jag sökte den 3 november.', 'Ring 070-123 45 67.'])
  })

  it('e-post, även med punkt direkt efter', () => {
    const m = maskaMedMarken(['Jag sökte i oktober.', 'Mejla mig på anna.l@exempel.se.'], opts)!
    expect(m.stycken[1]).toBe('Mejla mig på [E-POST 1].')
    expect(m.marken).toEqual([{ mark: '[E-POST 1]', varde: 'anna.l@exempel.se' }])
    const svar = valideraMejlMedMarken({ amne: 'X', stycken: ['Sökte i oktober.', 'Mejla [E-POST 1].'] }, 40, m.marken)
    expect(svar?.stycken[1]).toBe('Mejla anna.l@exempel.se.')
  })

  it('länk', () => {
    const m = maskaMedMarken(['Jag sökte i oktober.', 'Min portfolio finns på https://exempel.se/anna och där ser ni mer.'], opts)!
    expect(m.stycken[1]).toBe('Min portfolio finns på [LÄNK 1] och där ser ni mer.')
    inget(m.stycken, ['https://exempel.se/anna'])
    const svar = valideraMejlMedMarken({ amne: 'X', stycken: ['Sökte i oktober.', 'Portfolio: [LÄNK 1] och mer.'] }, 40, m.marken)
    expect(svar?.stycken[1]).toBe('Portfolio: https://exempel.se/anna och mer.')
  })

  it('namn, helt och som förnamn', () => {
    const m = maskaMedMarken(['Jag heter Anna Lindqvist och sökte i oktober.', 'Fråga efter Anna i växeln.'], opts)!
    expect(m.stycken).toEqual(['Jag heter [NAMN 1] och sökte i oktober.', 'Fråga efter [NAMN 2] i växeln.'])
    expect(m.marken).toEqual([
      { mark: '[NAMN 1]', varde: 'Anna Lindqvist' },
      { mark: '[NAMN 2]', varde: 'Anna' },
    ])
    inget(m.stycken, ['Anna', 'Lindqvist'])
    const svar = valideraMejlMedMarken({ amne: 'X', stycken: ['[NAMN 1] sökte i oktober.', 'Fråga efter [NAMN 2].'] }, 40, m.marken)
    expect(svar?.stycken).toEqual(['Anna Lindqvist sökte i oktober.', 'Fråga efter Anna.'])
  })

  it('två olika telefonnummer får var sitt märke, samma nummer två gånger samma märke', () => {
    const m = maskaMedMarken(
      ['Mobil 070-123 45 67, jobb 073-987 65 43.', 'Helst mobilen, 070-123 45 67.'],
      opts
    )!
    expect(m.stycken).toEqual(['Mobil [TELEFON 1], jobb [TELEFON 2].', 'Helst mobilen, [TELEFON 1].'])
    expect(m.marken).toEqual([
      { mark: '[TELEFON 1]', varde: '070-123 45 67' },
      { mark: '[TELEFON 2]', varde: '073-987 65 43' },
    ])
    const svar = valideraMejlMedMarken({ amne: 'X', stycken: ['Jobb [TELEFON 2].', 'Mobil [TELEFON 1].'] }, 40, m.marken)
    expect(svar?.stycken).toEqual(['Jobb 073-987 65 43.', 'Mobil 070-123 45 67.'])
  })

  it('den märkta texten går igenom maskForModel oförändrad', () => {
    const m = maskaMedMarken(['Ring 070-123 45 67 eller mejla a@b.se.', 'Anna Lindqvist, https://x.se/a'], opts)!
    for (const s of m.stycken) expect(maskForModel(s, opts).text).toBe(s)
  })

  it('text utan uppgifter: inga märken, styckena som de var', () => {
    const stycken = ['Jag sökte tjänsten den 3 november.', 'Jag är fortfarande intresserad.']
    expect(maskaMedMarken(stycken, opts)).toEqual({ stycken, marken: [] })
  })

  it('egna hakparenteser bredvid en uppgift går inte att återställa: null', () => {
    expect(maskaMedMarken(['Ring 070-123 45 67 [efter kl 16].', 'Hej.'], opts)).toBeNull()
  })
})

describe('valideraMejlMedMarken', () => {
  const marken = [
    { mark: '[TELEFON 1]', varde: '070-123 45 67' },
    { mark: '[E-POST 1]', varde: 'anna@exempel.se' },
  ]

  it('modellen stryker ett märke: underkänt', () => {
    expect(valideraMejlMedMarken({ amne: 'X', stycken: ['Sökte i oktober.', 'Ring [TELEFON 1].'] }, 40, marken)).toBeNull()
  })

  it('modellen hittar på ett märke: underkänt', () => {
    expect(
      valideraMejlMedMarken({ amne: 'X', stycken: ['Sökte i oktober.', 'Ring [TELEFON 1] eller [TELEFON 2], [E-POST 1].'] }, 40, marken)
    ).toBeNull()
    expect(
      valideraMejlMedMarken({ amne: 'X', stycken: ['Hej [NAMN].', 'Ring [TELEFON 1], [E-POST 1].'] }, 40, marken)
    ).toBeNull()
  })

  it('egen e-post eller länk i svaret: underkänt', () => {
    expect(valideraMejlMedMarken({ amne: 'X', stycken: ['a@b.se', 'Ring [TELEFON 1], [E-POST 1].'] }, 40, marken)).toBeNull()
    expect(valideraMejlMedMarken({ amne: 'X', stycken: ['www.x.se', 'Ring [TELEFON 1], [E-POST 1].'] }, 40, marken)).toBeNull()
  })

  it('räknar orden i den återställda texten', () => {
    // Två ord med märket, fem med numret utskrivet (070-123, 45, 67).
    const svar = { amne: 'X', stycken: ['Sökte nyss.', 'Ring [TELEFON 1], [E-POST 1].'] }
    expect(valideraMejlMedMarken(svar, 6, marken)).toBeNull()
    expect(valideraMejlMedMarken(svar, 7, marken)?.stycken[1]).toBe('Ring 070-123 45 67, anna@exempel.se.')
  })

  it('talstreck blir komma, märket står kvar', () => {
    expect(
      valideraMejlMedMarken({ amne: 'X', stycken: ['Sökte nyss — i oktober.', 'Ring [TELEFON 1], [E-POST 1].'] }, 40, marken)?.stycken[0]
    ).toBe('Sökte nyss, i oktober.')
  })

  it('första utkastet är lika strängt som förut: platshållare godkänns inte som uppgifter', () => {
    // valideraAiMejl är orörd: den tvättar bort hakparenteser och underkänner @.
    expect(valideraAiMejl({ amne: 'X', stycken: ['Ring [TELEFON 1].', 'b', 'c'] })).toEqual({ subject: 'X', stycken: ['Ring.', 'b', 'c'] })
    expect(valideraAiMejl({ amne: 'X', stycken: ['a', 'b', 'mejla mig på x@y.se'] })).toBeNull()
  })
})

describe('aterstallMarken och amneMedMarken', () => {
  it('[TELEFON 1] rör inte [TELEFON 10]', () => {
    expect(aterstallMarken('[TELEFON 1] [TELEFON 10]', [{ mark: '[TELEFON 1]', varde: 'a' }])).toBe('a [TELEFON 10]')
  })

  it('ämnesraden tappar uppgifterna i stället för att märkas', () => {
    expect(amneMedMarken('Ansökan, Anna Lindqvist 070-123 45 67', opts)).toBe('Ansökan,')
    expect(amneMedMarken('Min ansökan till tjänsten som ekonom', opts)).toBe('Min ansökan till tjänsten som ekonom')
  })
})

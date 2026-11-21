import { describe, expect, it } from 'vitest'
import { delaUppMejl, ordIMejlet, sattIhop, sattTillbaka, styckenUrMejl } from '../uppfoljning'
import { forberedKortning, valideraMejlMedMarken } from '../uppfoljningMarken'

// "Skriv om kortare" utan nätverk: forberedKortning som i rutten, ett påhittat
// AI-svar genom samma validering som skrivKortare (maxOrd = ordForut - 1) och
// sattTillbaka. Hälsning och avslut får aldrig gå till AI:n och ska komma
// tillbaka ordagrant.

const opts = { detectNameHeuristically: false, fullName: 'Anna Lindqvist', knownPhones: ['070-123 45 67'] }

const BROD = [
  'Jag sökte tjänsten som ekonomiassistent hos er den 6 november och undrar hur långt ni har kommit i rekryteringen.',
  'Jag är fortfarande intresserad. Det jag gör i dag, kund- och leverantörsreskontra, ligger nära det ni beskriver i annonsen.',
  'Hör gärna av er om ni vill ha något mer från mig. Jag svarar på det här mejlet eller i telefon.',
]

/** Kör kortningen med ett givet AI-svar. Null betyder orört utkast. */
function korta(body: string, aiStycken: string[]): string | null {
  const k = forberedKortning(body, opts)
  if (!k) return null
  // Inget ur hälsningen eller avslutet får finnas i det som går till AI:n.
  const skickat = k.markt.stycken.join('\n')
  if (k.delar.halsning) expect(skickat).not.toContain(k.delar.halsning)
  for (const rad of k.delar.avslut.split('\n').filter((r) => r.trim())) expect(skickat).not.toContain(rad)
  const svar = valideraMejlMedMarken({ amne: 'Ansökan', stycken: aiStycken }, Math.max(20, k.ordForut - 1), k.markt.marken)
  return svar ? sattTillbaka(k.delar, svar.stycken) : null
}

describe('Skriv om kortare: hälsning och avslut står kvar ordagrant', () => {
  it('telefon på egen rad under namnet står kvar, och numret i brödtexten också', () => {
    const avslut = 'Vänliga hälsningar\nAnna Lindqvist\n070-123 45 67'
    const body = ['Hej,', BROD[0], `${BROD[1]} Ring gärna på 070-123 45 67.`, BROD[2], avslut].join('\n\n')
    const k = forberedKortning(body, opts)!
    expect(k.markt.stycken[1]).toContain('[TELEFON 1]')
    expect(k.delar.avslut).toBe(avslut)
    const ut = korta(body, ['Jag sökte tjänsten den 6 november. Hur långt har ni kommit?', 'Ring gärna på [TELEFON 1].'])
    expect(ut).toBe(`Hej,\n\nJag sökte tjänsten den 6 november. Hur långt har ni kommit?\n\nRing gärna på 070-123 45 67.\n\n${avslut}`)
  })

  it('e-post, länk, titel och extra rad i avslutet står kvar', () => {
    const avslut =
      'Med vänlig hälsning,\nAnna Lindqvist\nEkonom\nanna.l@exempel.se\nhttps://linkedin.com/in/anna-l\nNås bäst efter kl 16'
    const body = ['Hej,', ...BROD, avslut].join('\n\n')
    const ut = korta(body, ['Jag sökte tjänsten den 6 november.', 'Hör av er om ni vill ha mer.'])
    expect(ut).toBe(`Hej,\n\nJag sökte tjänsten den 6 november.\n\nHör av er om ni vill ha mer.\n\n${avslut}`)
  })

  it('ändrad hälsningsrad står kvar', () => {
    const body = ['Hej Anna,', ...BROD, 'Vänliga hälsningar\nElin'].join('\n\n')
    expect(delaUppMejl(body)?.halsning).toBe('Hej Anna,')
    const ut = korta(body, ['Jag sökte tjänsten den 6 november.', 'Hör av er om ni vill ha mer.'])
    expect(ut?.startsWith('Hej Anna,\n\nJag sökte')).toBe(true)
    expect(ut?.endsWith('\n\nVänliga hälsningar\nElin')).toBe(true)
  })

  it('avslutsfrasen på raden direkt under brödtexten känns också igen', () => {
    const body = `Hej,\n\n${BROD[0]}\n\n${BROD[2]}\nVänliga hälsningar\nElin\n070-123 45 67`
    expect(delaUppMejl(body)).toEqual({ halsning: 'Hej,', stycken: [BROD[0], BROD[2]], avslut: 'Vänliga hälsningar\nElin\n070-123 45 67' })
  })

  it('avslut som inte känns igen ger orört utkast', () => {
    const body = ['Hej,', ...BROD, 'Hörs!\nElin\n070-123 45 67'].join('\n\n')
    expect(delaUppMejl(body)).toBeNull()
    expect(forberedKortning(body, opts)).toBeNull()
    expect(korta(body, ['Kort.', 'Kortare.'])).toBeNull()
    // Utan avslut alls, eller med en lång första rad som börjar med hälsningen: också orört.
    expect(forberedKortning(['Hej,', ...BROD].join('\n\n'), opts)).toBeNull()
    expect(forberedKortning(`Hej, jag skriver för att höra hur det går med tjänsten och rekryteringen.\n\n${BROD[2]}\n\nMvh Elin`, opts)).toBeNull()
  })

  it('engelskt mejl med Kind regards', () => {
    const avslut = 'Kind regards,\nAnna Lindqvist\n+46 70 123 45 67'
    const brod = [
      'I applied for the Accountant position on 6 November and wanted to ask how the recruitment is progressing.',
      'My experience with month-end closing is close to what you describe.',
      'Please let me know if you need anything more from me.',
    ]
    const body = ['Dear Anna,', ...brod, avslut].join('\n\n')
    const ut = korta(body, ['I applied for the Accountant role on 6 November. How is it going?', 'Happy to send more.'])
    expect(ut).toBe(`Dear Anna,\n\nI applied for the Accountant role on 6 November. How is it going?\n\nHappy to send more.\n\n${avslut}`)
  })

  it('ett långt avslut räknas inte in i orden: en lyckad kortning godkänns', () => {
    const avslut = `Vänliga hälsningar\nAnna Lindqvist\n${'Ekonom med lång erfarenhet av redovisning och lön '.repeat(4).trim()}`
    const body = ['Hej,', BROD[0], BROD[2], avslut].join('\n\n')
    const k = forberedKortning(body, opts)!
    expect(k.ordForut).toBe(ordIMejlet(body))
    // Bara de två brödstyckena räknas, inte de drygt trettio orden i avslutet.
    expect(k.ordForut).toBe(40)
    expect(korta(body, ['Jag sökte tjänsten den 6 november.', 'Hör av er om ni vill ha mer.'])).not.toBeNull()
    // Ett svar som inte är kortare än brödtexten underkänns fortfarande.
    expect(korta(body, [BROD[0], BROD[2]])).toBeNull()
  })

  it('utkast utan något extra beter sig som förut', () => {
    const body = sattIhop(BROD, 'sv', 'Elin Sundberg')
    expect(styckenUrMejl(body)).toEqual(BROD)
    const ut = korta(body, ['Jag sökte tjänsten den 6 november.', 'Hör av er om ni vill ha mer.'])
    expect(ut).toBe(sattIhop(['Jag sökte tjänsten den 6 november.', 'Hör av er om ni vill ha mer.'], 'sv', 'Elin Sundberg'))
    const en = sattIhop(['First.', 'Second.'], 'en', null)
    expect(delaUppMejl(en)).toEqual({ halsning: 'Hello,', stycken: ['First.', 'Second.'], avslut: 'Kind regards' })
  })
})

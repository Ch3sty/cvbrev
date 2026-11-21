/**
 * Språknivån: personens egen formulering gäller (beslutet 2026-11-21,
 * punkt 1). Tre vägar: ny inläsning ordagrant, tolkaNiva med steget Goda
 * kunskaper, och redan inlästa CV där Konversation visas som Goda kunskaper
 * när CV-texten säger god, goda eller bra. Poängdelen Språk är oförändrad.
 */
import { describe, it, expect } from 'vitest'
import { harledSprakniva, harNiva, radMedHarleddSprakniva, tolkaNiva, tvattaSprak, MAX_EGEN_NIVA } from '../sprak'
import { poangFor } from '../poang/modell'
import { NORMALT_CV } from '../word/__tests__/fixtures'
import { byggDokument } from '../mallar/innehall'
import { MALLAR } from '../mallar/register'

const TEXT = `Anna Andersson
SPRÅK
Engelska, goda kunskaper
Tyska, grundläggande
Spanska, C1
Franska, flytande i tal och skrift
Italienska, kan läsa enklare texter och föra samtal om vardagen`

describe('ny inläsning: nivån ordagrant', () => {
  it('behåller nivån när den står i CV-texten och är högst 30 tecken', () => {
    const ut = tvattaSprak(
      [
        { language: 'Engelska', proficiency: 'goda kunskaper' },
        { language: 'Tyska', proficiency: 'grundläggande' },
        { language: 'Spanska', proficiency: 'C1' },
        { language: 'Franska', proficiency: 'flytande i tal och skrift' },
      ],
      TEXT,
    )
    expect(ut).toEqual([
      // Ett av stegen (oavsett skiftläge) skrivs som steget, så att väljaren känner igen det.
      { language: 'Engelska', proficiency: 'Goda kunskaper' },
      { language: 'Tyska', proficiency: 'grundläggande' },
      { language: 'Spanska', proficiency: 'C1' },
      { language: 'Franska', proficiency: 'flytande i tal och skrift' },
    ])
  })

  it('längre än 30 tecken eller inte i texten: tolkas till ett steg som förut', () => {
    const lang = 'kan läsa enklare texter och föra samtal om vardagen'
    expect(lang.length).toBeGreaterThan(MAX_EGEN_NIVA)
    const ut = tvattaSprak(
      [
        { language: 'Italienska', proficiency: lang },
        { language: 'Engelska', proficiency: 'Very good' },
        { language: 'Tyska', proficiency: 'B1' },
      ],
      TEXT,
    )
    expect(ut).toEqual([
      { language: 'Italienska', proficiency: '' },
      { language: 'Engelska', proficiency: 'Goda kunskaper' },
      { language: 'Tyska', proficiency: 'Goda kunskaper' },
    ])
  })

  it('utan CV-text tolkas nivån som förut', () => {
    expect(tvattaSprak([{ language: 'Tyska', proficiency: 'grundläggande' }])).toEqual([{ language: 'Tyska', proficiency: 'Nybörjare' }])
  })

  it('nivån på 30 tecken ritas ordagrant i varje mall', () => {
    const cv = { ...NORMALT_CV, languages: [{ language: 'Franska', proficiency: 'flytande i tal och skrift' }] }
    for (const def of MALLAR) {
      const dok = byggDokument(cv, def)
      const sprak = [...dok.fullBredd, ...dok.huvudspalt, ...dok.sidospalt].find((a) => a.sektion === 'sprak')
      expect(sprak?.innehall, def.id).toEqual({ typ: 'sprak', rader: [{ sprak: 'Franska', niva: 'flytande i tal och skrift' }] })
    }
  })
})

describe('tolkaNiva med steget Goda kunskaper', () => {
  it('god, goda, good och B1/B2 ger Goda kunskaper', () => {
    for (const t of ['god', 'Goda', 'goda kunskaper', 'Good', 'B1', 'b2', 'Goda kunskaper']) expect(tolkaNiva(t), t).toBe('Goda kunskaper')
  })

  it('konversation, conversational och bra ger Konversation', () => {
    for (const t of ['Konversation', 'conversational', 'bra', 'god konversation']) expect(tolkaNiva(t), t).toBe('Konversation')
  })

  it('mycket god och mycket bra är fortfarande Flytande', () => {
    expect(tolkaNiva('mycket god')).toBe('Flytande')
    expect(tolkaNiva('Mycket bra')).toBe('Flytande')
  })
})

describe('redan inlästa CV: Konversation visas som Goda kunskaper när texten säger det', () => {
  const sd = {
    name: 'Anna',
    roles: [],
    languages: [
      { language: 'Engelska', proficiency: 'Konversation' },
      { language: 'Tyska', proficiency: 'Konversation' },
      { language: 'Svenska', proficiency: 'Modersmål' },
    ],
  }

  it('god, goda eller bra på språkets rad', () => {
    const ut = harledSprakniva(sd, 'Språk\nEngelska: goda kunskaper\nTyska - bra\nSvenska, modersmål') as typeof sd
    expect(ut.languages).toEqual([
      { language: 'Engelska', proficiency: 'Goda kunskaper' },
      { language: 'Tyska', proficiency: 'Goda kunskaper' },
      { language: 'Svenska', proficiency: 'Modersmål' },
    ])
    // Ingen mutation av originalet (ingenting skrivs tillbaka).
    expect(sd.languages[0].proficiency).toBe('Konversation')
  })

  it('bara den del av raden som hör till språket räknas', () => {
    const ut = harledSprakniva(sd, 'Språk: Engelska (konversation), tyska (goda)') as typeof sd
    expect(ut.languages[0].proficiency).toBe('Konversation')
    expect(ut.languages[1].proficiency).toBe('Goda kunskaper')
  })

  it('en rad som bara nämner språket hoppas över, nästa rad med nivå räknas', () => {
    const ut = harledSprakniva(sd, 'Undervisade i engelska på gymnasiet\nSpråk\nEngelska, god') as typeof sd
    expect(ut.languages[0].proficiency).toBe('Goda kunskaper')
  })

  it('utan god, goda eller bra lämnas strukturen orörd (samma objekt)', () => {
    expect(harledSprakniva(sd, 'Engelska, konversation\nTyska')).toBe(sd)
    expect(harledSprakniva(sd, null)).toBe(sd)
    expect(harledSprakniva(null, 'x')).toBeNull()
  })

  it('gäller också CVMetadata och raden som helhet', () => {
    const rad = { id: '1', cv_text: 'Engelska - goda kunskaper', structured_data: { ...NORMALT_CV, languages: [{ language: 'Engelska', proficiency: 'Konversation' }] } }
    const ut = radMedHarleddSprakniva(rad)
    expect((ut.structured_data as typeof rad.structured_data).languages[0].proficiency).toBe('Goda kunskaper')
    const orord = { id: '2', cv_text: 'Engelska - konversation', structured_data: rad.structured_data }
    expect(radMedHarleddSprakniva(orord)).toBe(orord)
  })
})

describe('poängdelen Språk är oförändrad', () => {
  const sprakDel = (languages: unknown) => {
    const p = poangFor({ ...NORMALT_CV, languages }, null)
    return p?.kategorier.find((k) => k.id === 'sprak')
  }

  it('samma poäng med Konversation, Goda kunskaper och den egna formuleringen', () => {
    const fore = sprakDel([{ language: 'Engelska', proficiency: 'Konversation' }, { language: 'Tyska', proficiency: 'Nybörjare' }])
    const goda = sprakDel([{ language: 'Engelska', proficiency: 'Goda kunskaper' }, { language: 'Tyska', proficiency: 'Nybörjare' }])
    const egen = sprakDel([{ language: 'Engelska', proficiency: 'goda kunskaper' }, { language: 'Tyska', proficiency: 'grundläggande' }])
    expect(fore?.poang).toBe(5)
    expect(goda?.poang).toBe(fore?.poang)
    expect(egen?.poang).toBe(fore?.poang)
    expect(poangFor({ ...NORMALT_CV, languages: [{ language: 'Engelska', proficiency: 'Goda kunskaper' }] }, null)?.total).toBe(
      poangFor({ ...NORMALT_CV, languages: [{ language: 'Engelska', proficiency: 'Konversation' }] }, null)?.total,
    )
  })

  it('nivån krävs fortfarande: ett språk utan nivå ger inte nivåpoängen', () => {
    expect(sprakDel([{ language: 'Engelska', proficiency: '' }])?.poang).toBe(3)
    expect(harNiva('')).toBe(false)
    expect(harNiva('  ')).toBe(false)
    expect(harNiva('C1')).toBe(true)
  })
})

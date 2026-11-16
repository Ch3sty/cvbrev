/**
 * CV-byggaren "Direkt på arket": datamappningen till CV-formatet,
 * miniminivån, den guidade ordningen, spöktexten per titel och bladen i
 * adressen.
 */
import { describe, expect, it } from 'vitest'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'
import { renderMallHtml } from '@/lib/cv/mallar/render/html'
import { periodErfarenhet } from '@/lib/cv/mallar/innehall'
import {
  GUIDAD,
  antalKlara,
  harInnehall,
  kompetenslista,
  medKompetenser,
  miniminiva,
  nastaLucka,
  nyttCv,
  type ByggCv,
} from '../modell'
import { arPagaende, skrivDatum, tolkaDatum } from '../datum'
import { PROFILRAD, SPOK_GENERISK, medSpok, spokAvsnitt, spokFor } from '../spok'
import { byggKalla, utanBygge, valFor } from '../kalla'
import { arkForAvsnitt, arkNyckel, tolkaArk } from '../ark'

const profil = { namn: 'Sara Holm', epost: 'sara@example.com', telefon: '070 123 45 67', ort: 'Göteborg', linkedin: '' }

function medJobb(cv: ByggCv): ByggCv {
  return {
    ...cv,
    experience: [{ position: 'Kundtjänstmedarbetare', company: 'Nordvik Service AB', startDate: '2022-08', description: ['Tog emot ärenden'] }],
  }
}

describe('datamappningen till CV-formatet', () => {
  it('ett nytt CV har kontakten ur profilen, titeln och svenska förifyllt', () => {
    const cv = nyttCv(profil, ' Kundtjänstmedarbetare ')
    expect(cv.personalInfo).toMatchObject({ fullName: 'Sara Holm', email: 'sara@example.com', phone: '070 123 45 67', address: 'Göteborg', title: 'Kundtjänstmedarbetare' })
    expect(cv.languages).toEqual([{ language: 'Svenska', proficiency: 'Modersmål' }])
    expect(cv.bygge).toEqual({ utkast: true })
    expect(cv.experience).toEqual([])
  })

  it('går genom normalizeStructuredData oförändrat, med byggarens fält kvar', () => {
    const cv = { ...medJobb(nyttCv(profil, 'Säljare')), bygge: { utkast: true, mall: 'linne', val: { typsnitt: 'georgia' as const } } }
    const ut = normalizeStructuredData(JSON.parse(JSON.stringify(cv))) as ByggCv
    expect(ut.experience[0].position).toBe('Kundtjänstmedarbetare')
    expect(ut.bygge?.mall).toBe('linne')
    expect(valFor(ut)).toEqual({ typsnitt: 'georgia' })
  })

  it('utanBygge tar bort byggarens fält inför rendering och nedladdning', () => {
    const cv = nyttCv(profil)
    expect('bygge' in utanBygge(cv)).toBe(false)
  })

  it('perioder sparas som ISO och skrivs som svenska datum i mallen', () => {
    expect(skrivDatum({ manad: 8, ar: '2022' })).toBe('2022-08')
    expect(skrivDatum({ manad: null, ar: '2022' })).toBe('2022')
    expect(skrivDatum({ manad: 3, ar: '22' })).toBe('')
    expect(periodErfarenhet({ position: 'x', company: 'y', startDate: '2022-08', description: [] })).toBe('aug 2022 – Pågående')
  })

  it('äldre datum i uppladdade CV:n går att läsa in i bladet', () => {
    expect(tolkaDatum('Jan 2021')).toEqual({ manad: 1, ar: '2021' })
    expect(tolkaDatum('januari 2021')).toEqual({ manad: 1, ar: '2021' })
    expect(tolkaDatum('mar 2021')).toEqual({ manad: 3, ar: '2021' })
    expect(tolkaDatum('2021-03-01')).toEqual({ manad: 3, ar: '2021' })
    expect(tolkaDatum('03/2021')).toEqual({ manad: 3, ar: '2021' })
    expect(tolkaDatum('2019')).toEqual({ manad: null, ar: '2019' })
    expect(tolkaDatum('Pågående')).toEqual({ manad: null, ar: '' })
    expect(arPagaende('Nuvarande')).toBe(true)
  })

  it('kompetenserna är en platt lista; namngivna grupper står kvar', () => {
    const cv: CVMetadata = {
      personalInfo: { fullName: 'A', email: 'a@b.se' },
      experience: [],
      education: [],
      skills: [
        { category: 'System', skills: ['Zendesk', 'Excel'] },
        { category: '', skills: ['Kundbemötande', 'excel'] },
      ],
    }
    expect(kompetenslista(cv)).toEqual(['Zendesk', 'Excel', 'Kundbemötande'])
    expect(medKompetenser(cv, ['Zendesk', 'Kundbemötande', 'Reklamationer'])).toEqual([
      { category: 'System', skills: ['Zendesk'] },
      { category: '', skills: ['Kundbemötande', 'Reklamationer'] },
    ])
  })
})

describe('miniminivån', () => {
  it('kräver namn, e-post och ett jobb eller en utbildning, aldrig telefon', () => {
    const cv = nyttCv({ ...profil, telefon: '' })
    expect(miniminiva(cv)).toEqual({ klar: false, saknas: 'innehall' })
    expect(miniminiva(medJobb(cv)).klar).toBe(true)
    expect(miniminiva({ ...cv, education: [{ degree: '', institution: 'Polhemsgymnasiet' }] }).klar).toBe(true)
  })

  it('säger vad som saknas i ordning: namn, e-post, innehåll', () => {
    const cv = medJobb(nyttCv(profil))
    expect(miniminiva({ ...cv, personalInfo: { ...cv.personalInfo, fullName: ' ' } }).saknas).toBe('namn')
    expect(miniminiva({ ...cv, personalInfo: { ...cv.personalInfo, email: '' } }).saknas).toBe('epost')
  })

  it('en tom post räknas inte som ett jobb', () => {
    const cv = { ...nyttCv(profil), experience: [{ position: ' ', company: '', startDate: '', description: [] }] }
    expect(harInnehall(cv, 'erfarenhet')).toBe(false)
  })
})

describe('den guidade ordningen', () => {
  it('är jobb först och profilen sist', () => {
    expect([...GUIDAD]).toEqual(['erfarenhet', 'utbildning', 'kompetenser', 'profil', 'sprak'])
  })

  it('föreslår nästa tomma avsnitt; språk är redan ifyllt', () => {
    const cv = nyttCv(profil)
    expect(nastaLucka(cv)).toBe('erfarenhet')
    expect(nastaLucka(medJobb(cv))).toBe('utbildning')
    expect(antalKlara(cv)).toBe(1)
    const allt = { ...medJobb(cv), education: [{ degree: 'X', institution: 'Y' }], skills: [{ category: '', skills: ['Excel'] }] }
    expect(nastaLucka(allt)).toBe('profil')
    expect(nastaLucka({ ...allt, summary: 'Om mig' })).toBe(null)
  })

  it('hoppar över avsnitt hon valt bort', () => {
    expect(nastaLucka(medJobb(nyttCv(profil)), ['utbildning'])).toBe('kompetenser')
  })
})

describe('spöktexten per titel', () => {
  it('är generisk utan titel', () => {
    expect(spokFor('')).toBe(SPOK_GENERISK)
    expect(spokFor(undefined).erfarenhet.titel).toBe('Yrkestitel')
  })

  it('följer titeln för kundtjänst, ordagrant ur skissen', () => {
    const s = spokFor('Kundtjänstmedarbetare')
    expect(s.erfarenhet.titel).toBe('Kundtjänstmedarbetare')
    expect(s.erfarenhet.punkter[0]).toBe('Hur många ärenden du tog emot per dag, och i vilka kanaler')
    expect(s.kompetenser).toEqual(['Kundbemötande', 'Ärendesystem', 'Excel', 'Engelska'])
    expect(s.profil).toBe('Kundtjänstmedarbetare med vana vid telefon och chatt, som söker en roll med mer ansvar.')
  })

  it('följer rubrikuppsättningarnas ordlista (vård, lager, IT)', () => {
    expect(spokFor('Undersköterska').kompetenser).toContain('Omvårdnad')
    expect(spokFor('Lagerarbetare').kompetenser).toContain('Orderplock')
    expect(spokFor('Systemutvecklare').kompetenser).toContain('Git')
    expect(spokFor('Florist').erfarenhet.titel).toBe('Florist')
  })

  it('innehåller aldrig tankstreck', () => {
    for (const t of ['', 'Undersköterska', 'Kock', 'Lärare', 'Ekonom', 'Handläggare', 'Snickare', 'Butikssäljare', 'Student', 'Chef', 'Kundtjänstmedarbetare']) {
      expect(JSON.stringify(spokFor(t))).not.toMatch(/—/)
    }
  })

  it('fyller bara tomma avsnitt och ändrar aldrig originalet', () => {
    const cv = medJobb(nyttCv(profil, 'Kundtjänstmedarbetare'))
    const kopia = JSON.parse(JSON.stringify(cv))
    const { cv: visning, markering } = medSpok(cv)
    expect(cv).toEqual(kopia)
    expect(markering.sektioner).toEqual(['profil', 'utbildning', 'kompetenser'])
    expect(visning.experience[0].company).toBe('Nordvik Service AB')
    expect(visning.education[0].degree).toBe('Utbildning eller program')
    expect(markering.profilRad).toBe(PROFILRAD.erbjud)
    expect(medSpok(nyttCv(profil)).markering.profilRad).toBe(PROFILRAD.forst)
    expect(spokAvsnitt(nyttCv(profil))).not.toContain('sprak')
  })

  it('ett tomt namn blir "Ditt namn" i grått', () => {
    const { cv, markering } = medSpok(nyttCv({ ...profil, namn: '' }))
    expect(cv.personalInfo.fullName).toBe('Ditt namn')
    expect(markering.namn).toBe(true)
  })

  it('renderas grå i förhandsvisningen och aldrig utan spok (filen)', () => {
    const cv = nyttCv(profil, 'Kundtjänstmedarbetare')
    const { cv: visning, markering } = medSpok(cv)
    const html = renderMallHtml(visning, 'linne', {}, { forhandsvisning: true, spok: markering })
    expect(html).toMatch(/data-avsnitt="erfarenhet" data-spok="1"/)
    expect(html).toContain('#A6A6AE')
    expect(html).toContain(PROFILRAD.forst)
    // Filen byggs ur CV:t utan spöken.
    const fil = renderMallHtml(utanBygge(cv), 'linne', {})
    expect(fil).not.toContain('data-spok')
    expect(fil).not.toContain('Hur många ärenden')
  })
})

describe('bladen i adressen', () => {
  it('tolkar och skriver ?ark=', () => {
    for (const v of ['huvud', 'fler', 'erfarenhet', 'erfarenhet:0', 'utbildning:ny', 'kompetenser', 'profil', 'sprak', 'intyg']) {
      const a = tolkaArk(v)
      expect(a).not.toBeNull()
      expect(arkNyckel(a!)).toBe(v)
    }
    expect(tolkaArk('okänt')).toBeNull()
    expect(tolkaArk('erfarenhet:-1')).toBeNull()
    expect(tolkaArk('profil:2')).toBeNull()
  })

  it('ett tryck på arket öppnar rätt blad', () => {
    const cv = nyttCv(profil)
    expect(arkForAvsnitt(cv, 'erfarenhet')).toEqual({ typ: 'post', sektion: 'erfarenhet', index: 'ny' })
    expect(arkForAvsnitt(medJobb(cv), 'erfarenhet')).toEqual({ typ: 'post', sektion: 'erfarenhet', index: 0 })
    const tva = { ...medJobb(cv), experience: [...medJobb(cv).experience, ...medJobb(cv).experience] }
    expect(arkForAvsnitt(tva, 'erfarenhet')).toEqual({ typ: 'lista', sektion: 'erfarenhet' })
    expect(arkForAvsnitt(cv, 'profil')).toEqual({ typ: 'avsnitt', sektion: 'profil' })
  })

  it('källan till förhandsvisningen är densamma på servern och i klienten', () => {
    const cv = nyttCv(profil, 'Säljare')
    const a = byggKalla({ cv, cvId: null, mall: 'linne', val: {}, rubriker: {} })
    const b = byggKalla({ cv: JSON.parse(JSON.stringify(cv)), cvId: null, mall: 'linne', val: {}, rubriker: {} })
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
    expect(a.spok).toBe(true)
    expect('bygge' in (a.structuredData as object)).toBe(false)
  })
})

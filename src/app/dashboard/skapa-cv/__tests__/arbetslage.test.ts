import { describe, expect, it } from 'vitest'
import { valTillQuery, valUrAdress } from '@/lib/cv/mallar/val'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { nyttCv } from '@/lib/cv/bygg/modell'
import {
  arkFor,
  arkForParam,
  arkKalla,
  lageFor,
  nastaFor,
  ordning,
  paramForArk,
  periodText,
  startArk,
  tillbakaHref,
  tolkaAvsnitt,
  tolkaFran,
  tolkaPost,
} from '../arbetslage'
import { arbetslageHref } from '@/components/cv/rum3/flikar'

const uppladdat: CVMetadata = {
  personalInfo: { fullName: 'Erik Lindberg', email: 'erik@exempel.se' },
  experience: [
    { position: 'Projektledare', company: 'Klarna', startDate: '2018', endDate: '2021', description: [] },
    { position: 'Senior Projektledare', company: 'Nordea Bank', startDate: 'Jan 2021', endDate: 'Nu', description: [] },
    { position: 'Biträdande projektledare', company: 'Tieto', startDate: '2016', endDate: '2018', description: [] },
  ],
  education: [{ degree: 'Civilingenjör', institution: 'KTH', startDate: '2011', endDate: '2016' }],
  skills: [],
}

describe('arbetsläget: läget', () => {
  it('nytt CV och utkast byggs, uppladdat och klart redigeras', () => {
    expect(lageFor(null, nyttCv({ namn: 'Sara' }))).toBe('bygg')
    expect(lageFor('id', { ...uppladdat, bygge: { utkast: true } })).toBe('bygg')
    expect(lageFor('id', { ...uppladdat, bygge: { utkast: false } })).toBe('redigera')
    expect(lageFor('id', uppladdat)).toBe('redigera')
  })
})

describe('arbetsläget: adressen', () => {
  it('tolkar fran, även byggarens gamla mina_cv', () => {
    expect(tolkaFran('mallar')).toBe('mallar')
    expect(tolkaFran('mina_cv')).toBe('ditt-cv')
    expect(tolkaFran('hemskarm')).toBeNull()
  })
  it('Klar går till sidan i fran med samma cv och mall', () => {
    expect(tillbakaHref('mallar', 'abc', 'koppar')).toBe('/dashboard/cv-mallar?cv=abc&mall=koppar')
    expect(tillbakaHref('ditt-cv', 'abc', 'koppar')).toBe('/dashboard/profil/cv?cv=abc')
    expect(tillbakaHref('analys', 'abc', null)).toBe('/dashboard/cv-analys?cv=abc')
    expect(tillbakaHref(null, null, null)).toBe('/dashboard/profil/cv')
    // Valen från Mallar följer med tillbaka dit, men inte till de andra flikarna.
    expect(tillbakaHref('mallar', 'abc', 'koppar', { typsnitt: 'georgia', farg: 2, ordning: 'standard' })).toBe(
      '/dashboard/cv-mallar?cv=abc&mall=koppar&typsnitt=georgia&farg=2'
    )
    expect(tillbakaHref('ditt-cv', 'abc', 'koppar', { typsnitt: 'georgia' })).toBe('/dashboard/profil/cv?cv=abc')
    const q = valTillQuery({ typsnitt: 'lato', farg: 1, ordning: 'intyg', enSida: true, rubriker: { profil: 'Om mig' } }, new URLSearchParams('cv=x'))
    expect(q.toString()).toBe('cv=x&typsnitt=lato&farg=1&ordning=intyg&ensida=1')
    expect(valUrAdress(q)).toEqual({ typsnitt: 'lato', farg: 1, ordning: 'intyg', enSida: true })
    expect(valUrAdress(new URLSearchParams('cv=x&mall=linne'))).toBeNull()
  })
  it('avsnittet i adressen och tillbaka', () => {
    expect(tolkaAvsnitt('sprak')).toBe('sprak')
    expect(tolkaAvsnitt('huvud')).toBeNull()
    for (const p of ['kontakt', 'profil', 'erfarenhet', 'utbildning', 'kompetenser', 'sprak', 'fler'] as const) {
      expect(paramForArk(arkForParam(uppladdat, p))).toBe(p)
    }
    expect(paramForArk({ typ: 'avsnitt', sektion: 'intyg' })).toBe('fler')
  })
  it('post i adressen öppnar just den rollen eller utbildningen', () => {
    expect(tolkaPost('2')).toBe(2)
    expect(tolkaPost('0')).toBe(0)
    expect(tolkaPost('-1')).toBeNull()
    expect(tolkaPost('x')).toBeNull()
    expect(tolkaPost(null)).toBeNull()
    // Klarna står på plats 0 i listan men inte överst på arket.
    expect(arkForParam(uppladdat, 'erfarenhet', 0)).toEqual({ typ: 'post', sektion: 'erfarenhet', index: 0 })
    expect(arkForParam(uppladdat, 'erfarenhet', 2)).toEqual({ typ: 'post', sektion: 'erfarenhet', index: 2 })
    expect(arkForParam(uppladdat, 'utbildning', 0)).toEqual({ typ: 'post', sektion: 'utbildning', index: 0 })
    // Utan post, eller med en post som inte finns: översta på arket som förut.
    expect(arkForParam(uppladdat, 'erfarenhet', 9)).toEqual(arkForParam(uppladdat, 'erfarenhet'))
    expect(arkForParam(uppladdat, 'erfarenhet', null)).toEqual({ typ: 'post', sektion: 'erfarenhet', index: 1 })
    // Post gäller bara jobb och utbildning.
    expect(arkForParam(uppladdat, 'profil', 0)).toEqual(arkForParam(uppladdat, 'profil'))
  })
  it('Öppna i CV:t bär posten i adressen', () => {
    expect(arbetslageHref('abc', 'analys', { avsnitt: 'erfarenhet', post: 2, mall: 'linne' })).toBe(
      '/dashboard/skapa-cv?cv=abc&avsnitt=erfarenhet&post=2&mall=linne&fran=analys'
    )
    expect(arbetslageHref('abc', 'analys', { avsnitt: 'profil', mall: 'linne' })).toBe('/dashboard/skapa-cv?cv=abc&avsnitt=profil&mall=linne&fran=analys')
  })
})

describe('arbetsläget: jobbens ordning', () => {
  it('det senaste först, pågående överst', () => {
    expect(ordning(uppladdat, 'erfarenhet')).toEqual([1, 0, 2])
  })
  it('erfarenhet öppnar jobbet överst på arket, tomt avsnitt ett nytt', () => {
    expect(arkFor(uppladdat, 'erfarenhet')).toEqual({ typ: 'post', sektion: 'erfarenhet', index: 1 })
    expect(arkFor({ ...uppladdat, experience: [] }, 'erfarenhet')).toEqual({ typ: 'post', sektion: 'erfarenhet', index: 'ny' })
    expect(arkFor(uppladdat, 'referenser')).toEqual({ typ: 'fler' })
  })
  it('perioden utan tankstreck', () => {
    expect(periodText('2018', '2021')).toBe('2018 till 2021')
    expect(periodText('2021-01', undefined, true)).toBe('2021 till i dag')
    expect(periodText('2021', 'Nu')).toBe('2021 till i dag')
  })
})

describe('arbetsläget: start och Nästa', () => {
  it('från början: kontakten när namn eller e-post saknas, annars första luckan', () => {
    expect(startArk(nyttCv({ namn: 'Sara' }), 'bygg')).toEqual({ typ: 'huvud' })
    expect(startArk(nyttCv({ namn: 'Sara', epost: 's@e.se' }), 'bygg')).toEqual({ typ: 'post', sektion: 'erfarenhet', index: 'ny' })
    expect(startArk(uppladdat, 'redigera')).toEqual({ typ: 'post', sektion: 'erfarenhet', index: 1 })
  })
  it('Nästa: miniminivån först, sedan den guidade ordningen utom avsnittet hon står i', () => {
    const cv = nyttCv({ namn: 'Sara', epost: 's@e.se' })
    expect(nastaFor(cv, 'kontakt', [])).toEqual({ typ: 'avsnitt', sektion: 'erfarenhet' })
    // Skissen Bygg: medan hon skriver första jobbet pekar Nästa på utbildningen.
    expect(nastaFor(cv, 'erfarenhet', [])).toEqual({ typ: 'avsnitt', sektion: 'utbildning' })
    expect(nastaFor(nyttCv({ namn: 'Sara' }), 'erfarenhet', [])).toEqual({ typ: 'kontakt' })
    const medJobb = { ...cv, experience: uppladdat.experience }
    expect(nastaFor(medJobb, 'erfarenhet', [])).toEqual({ typ: 'avsnitt', sektion: 'utbildning' })
    expect(nastaFor(medJobb, 'erfarenhet', ['utbildning'])).toEqual({ typ: 'avsnitt', sektion: 'kompetenser' })
  })
})

describe('arbetsläget: källan till arket', () => {
  it('spöktext bara när CV:t byggs, aldrig byggarens fält i datan', () => {
    const a = arkKalla({ cv: { ...uppladdat, bygge: { utkast: true } }, cvId: 'x', mall: 'linne', val: {}, rubriker: {}, lage: 'bygg' })
    expect(a.spok).toBe(true)
    expect('bygge' in (a.structuredData as object)).toBe(false)
    const b = arkKalla({ cv: uppladdat, cvId: 'x', mall: 'linne', val: {}, rubriker: {}, lage: 'redigera' })
    expect(b.spok).toBeUndefined()
  })
})

import { describe, it, expect } from 'vitest'
import {
  arPlatshallareNamn,
  arPlatshallareTelefon,
  bytKontaktIBrev,
  kontaktForCv,
  kontaktIBrev,
  lasKontaktIStrukturerad,
  sattKontaktIStrukturerad,
} from '../dokumentKontakt'
import { arTomEllerPlatshallare, epostForCv } from '../dokumentEpost'
import { DOCX_TEMPLATES, type DocxTemplateId } from '@/lib/letters/docx-templates'
import type { ProfileDataForLetter } from '@/lib/letters/template-merger'

const profil = {
  full_name: 'Anna Profilsson',
  phone: '070-111 22 33',
  location: 'Malmö',
  email: 'konto@exempel.se',
  contact_email: null,
}

describe('platshållare', () => {
  it('namn', () => {
    for (const v of ['', null, '[NAMN]', 'Ditt namn', 'ditt namn ', 'Namn saknas']) {
      expect(arPlatshallareNamn(v)).toBe(true)
    }
    expect(arPlatshallareNamn('Anna Svensson')).toBe(false)
  })
  it('telefon', () => {
    for (const v of ['', '[TELEFON]', '070-123 45 67', '+46 70 123 45 67', '070-xxx xx xx']) {
      expect(arPlatshallareTelefon(v)).toBe(true)
    }
    expect(arPlatshallareTelefon('073-555 12 34')).toBe(false)
  })
  it('LinkedIn-importens exempeladress', () => {
    expect(arTomEllerPlatshallare('din@email.com')).toBe(true)
    expect(epostForCv('din@email.com', profil)).toBe('konto@exempel.se')
  })
})

describe('kontaktForCv', () => {
  it('det som står i CV:t vinner', () => {
    const ut = kontaktForCv(
      { fullName: 'Anna CV-son', phone: '073-555 12 34', address: 'Lund', email: 'cv@exempel.se' },
      profil
    )
    expect(ut).toEqual({ fullName: 'Anna CV-son', phone: '073-555 12 34', address: 'Lund', email: 'cv@exempel.se' })
  })
  it('tomt och platshållare fylls från profilen', () => {
    const ut = kontaktForCv({ fullName: 'Ditt namn', phone: '[TELEFON]', email: 'din@email.com' }, profil)
    expect(ut).toEqual({
      fullName: 'Anna Profilsson',
      phone: '070-111 22 33',
      address: 'Malmö',
      email: 'konto@exempel.se',
    })
  })
  it('CV ur löptext: profilen vinner som förut', () => {
    const ut = kontaktForCv({ fullName: 'Gissat Namn', phone: '073-555 12 34' }, profil, null, 'text')
    expect(ut.fullName).toBe('Anna Profilsson')
    expect(ut.phone).toBe('070-111 22 33')
  })
})

describe('structured_data', () => {
  it('CVMetadata', () => {
    const sd = { personalInfo: { fullName: 'A', email: 'a@b.se', phone: '1' }, experience: [] }
    const ut = sattKontaktIStrukturerad(sd, { fullName: 'B', phone: '073-555 12 34' })
    expect(lasKontaktIStrukturerad(ut)).toEqual({ fullName: 'B', email: 'a@b.se', phone: '073-555 12 34', address: '' })
  })
  it('ParsedCV', () => {
    const sd = { name: 'A', roles: [], contact: { email: 'a@b.se' } }
    const ut = sattKontaktIStrukturerad(sd, { fullName: 'B', email: 'c@d.se' })
    expect(lasKontaktIStrukturerad(ut)).toEqual({ fullName: 'B', email: 'c@d.se', phone: '', address: '' })
  })
  it('okänt format', () => {
    expect(sattKontaktIStrukturerad({ foo: 1 }, { fullName: 'B' })).toBeNull()
  })
})

const kropp =
  'Jag heter Anna Gammal och nås på 070-999 88 77 eller anna.gammal@exempel.se.\n\nMed min bakgrund i Malmö passar jag väl.'
const jobb = { title: 'Ansökan', company: 'Bolaget AB', position: 'Ekonom' }

function brev(id: DocxTemplateId, p: Partial<ProfileDataForLetter>): string {
  const profile: ProfileDataForLetter = {
    full_name: 'Anna Gammal',
    email: 'anna.gammal@exempel.se',
    phone: '070-999 88 77',
    location: 'Malmö',
    include_phone_in_letters: true,
    include_location_in_letters: true,
    ...p,
  }
  return DOCX_TEMPLATES[id].generateHTML(profile, jobb, kropp, '10 oktober 2026')
}

const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
const kroppAv = (s: string) => s.match(/<div class="body-content">[\s\S]*?<\/div>/)?.[0]
const ny = { namn: 'Bea Ny', epost: 'bea@exempel.se', telefon: '073-555 12 34', ort: 'Umeå' }

describe('bytKontaktIBrev mot alla brevmallar', () => {
  const mallar = Object.keys(DOCX_TEMPLATES) as DocxTemplateId[]

  it.each(mallar)('%s: med kända gamla värden blir brevet som ett nyskrivet', (id) => {
    const gammalt = brev(id, {})
    const facit = brev(id, { full_name: ny.namn, email: ny.epost, phone: ny.telefon, location: ny.ort })
    const ut = bytKontaktIBrev(gammalt, ny, {
      namn: 'Anna Gammal',
      epost: 'anna.gammal@exempel.se',
      telefon: '070-999 88 77',
      ort: 'Malmö',
    })
    expect(norm(ut)).toBe(norm(facit))
  })

  it.each(mallar)('%s: utan gamla värden byts namn, telefon och e-post men aldrig brödtexten', (id) => {
    const gammalt = brev(id, {})
    const ut = bytKontaktIBrev(gammalt, { namn: ny.namn, epost: ny.epost, telefon: ny.telefon })
    const facit = brev(id, { full_name: ny.namn, email: ny.epost, phone: ny.telefon })
    expect(norm(ut)).toBe(norm(facit))
    expect(kroppAv(ut)).toBe(kroppAv(gammalt))
  })

  it.each(mallar)('%s: telefonen tas bort och läggs till', (id) => {
    const medTel = brev(id, {})
    const utanTel = bytKontaktIBrev(medTel, { telefon: '' })
    const facitUtan = brev(id, { include_phone_in_letters: false })
    expect(norm(utanTel)).toBe(norm(facitUtan))

    const tillagd = bytKontaktIBrev(facitUtan, { telefon: ny.telefon })
    const utanforKropp = tillagd.replace(kroppAv(tillagd) ?? '', '')
    expect(utanforKropp.split(ny.telefon).length - 1).toBe(1)
    expect(kroppAv(tillagd)).toBe(kroppAv(facitUtan))
  })
})

describe('kontaktIBrev', () => {
  it('telefon och ort bara när de ska visas i brev', () => {
    expect(kontaktIBrev({ ...profil, include_phone_in_letters: false, include_location_in_letters: true })).toEqual({
      namn: 'Anna Profilsson',
      epost: 'konto@exempel.se',
      telefon: '',
      ort: 'Malmö',
    })
  })
})

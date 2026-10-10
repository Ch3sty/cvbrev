import { describe, it, expect } from 'vitest'
import {
  arGiltigEpost,
  arTomEllerPlatshallare,
  bytEpostIBrev,
  dokumentEpost,
  epostForCv,
} from '../dokumentEpost'

const konto = { email: 'konto@exempel.se', contact_email: null }
const egen = { email: 'konto@exempel.se', contact_email: 'jobb@exempel.se' }

describe('dokumentEpost', () => {
  it('kontoadressen när ingen egen finns', () => {
    expect(dokumentEpost(konto)).toBe('konto@exempel.se')
    expect(dokumentEpost({ email: null, contact_email: '  ' }, { email: 'auth@exempel.se' })).toBe('auth@exempel.se')
  })
  it('den egna adressen när den finns', () => {
    expect(dokumentEpost(egen)).toBe('jobb@exempel.se')
  })
})

describe('epostForCv', () => {
  it('platshållare och tomt ersätts', () => {
    for (const v of ['', null, '[E-POST]', '[EMAIL]', '[EMAIL REMOVED]']) {
      expect(arTomEllerPlatshallare(v)).toBe(true)
      expect(epostForCv(v, egen)).toBe('jobb@exempel.se')
    }
  })
  it('det användaren skrivit i CV-byggaren vinner', () => {
    expect(epostForCv('annan@exempel.se', egen)).toBe('annan@exempel.se')
    expect(epostForCv('annan@exempel.se', konto)).toBe('annan@exempel.se')
  })
  it('förifylld kontoadress byts mot den egna', () => {
    expect(epostForCv('KONTO@exempel.se', egen)).toBe('jobb@exempel.se')
    expect(epostForCv('konto@exempel.se', konto)).toBe('konto@exempel.se')
  })
})

describe('arGiltigEpost', () => {
  it('formatet', () => {
    expect(arGiltigEpost('a@b.se')).toBe(true)
    expect(arGiltigEpost('a@b')).toBe(false)
    expect(arGiltigEpost('a b@c.se')).toBe(false)
    expect(arGiltigEpost('')).toBe(false)
  })
})

describe('bytEpostIBrev', () => {
  const html =
    '<html><head><link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400"></head><body>' +
    '<div class="header"><p>Anna</p><p>gammal@exempel.se</p></div>' +
    '<div class="body-content"><p>Skriv till chef@foretag.se om du vill.</p></div>' +
    '<div class="signature"><p>gammal@exempel.se</p></div></body></html>'
  it('byter huvud och avslutning men inte brevets kropp eller head', () => {
    const ut = bytEpostIBrev(html, 'ny@exempel.se')
    expect(ut).not.toContain('gammal@exempel.se')
    expect(ut.match(/ny@exempel\.se/g)?.length).toBe(2)
    expect(ut).toContain('chef@foretag.se')
    expect(ut).toContain('wght@300;400')
  })
})

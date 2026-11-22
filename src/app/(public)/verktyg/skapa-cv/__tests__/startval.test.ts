import { describe, expect, it } from 'vitest'
import { byggarStart, lasStartval, startvalHref, TITEL_MAX } from '../startval'
import { registerIngang, sakerRedirect } from '@/components/registrering/intent'

const param = (url: string, namn: string) => new URL(url, 'https://www.jobbcoach.ai').searchParams.get(namn)

describe('startbladet på /verktyg/skapa-cv', () => {
  it('skriv med titel: byggaren hoppar över sitt startblad med titeln ifylld', () => {
    const u = byggarStart('Projektledare', 'skriv')
    expect(u.startsWith('/dashboard/skapa-cv?')).toBe(true)
    expect(param(u, 'borja')).toBe('1')
    expect(param(u, 'titel')).toBe('Projektledare')
    expect(param(u, 'ladda')).toBeNull()
    expect(param(u, 'fran')).toBe('registrering')
  })

  it('skriv utan titel: startbladet visas som vanligt', () => {
    const u = byggarStart('   ', 'skriv')
    expect(param(u, 'borja')).toBeNull()
    expect(param(u, 'titel')).toBeNull()
  })

  it('ladda: uppladdningen fälls upp, titeln följer med, startbladet står kvar', () => {
    const u = byggarStart('Undersköterska', 'ladda')
    expect(param(u, 'ladda')).toBe('1')
    expect(param(u, 'titel')).toBe('Undersköterska')
    expect(param(u, 'borja')).toBeNull()
  })

  it('titeln tvättas och kortas', () => {
    const u = byggarStart(`  Senior   ${'x'.repeat(200)}`, 'skriv')
    const t = param(u, 'titel')!
    expect(t.startsWith('Senior x')).toBe(true)
    expect(t.length).toBe(TITEL_MAX)
  })

  it('okänt val blir skriv', () => {
    expect(lasStartval('ladda')).toBe('ladda')
    expect(lasStartval('skriv')).toBe('skriv')
    expect(lasStartval(null)).toBe('skriv')
    expect(lasStartval('<script>')).toBe('skriv')
  })

  it('registreringen tar emot målet som en säker redirect', () => {
    const href = startvalHref('Projektledare & IT', 'skriv')
    expect(href.startsWith('/register?')).toBe(true)
    const red = param(href, 'redirect')!
    expect(sakerRedirect(red)).toBe(red)
    expect(param(red, 'titel')).toBe('Projektledare & IT')
    const ingang = registerIngang((n) => param(href, n))
    expect(ingang.lage).toBe('redirect')
    expect(ingang.redirect).toBe(red)
  })
})

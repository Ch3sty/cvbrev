import { describe, expect, it } from 'vitest'
import { platsUrSource } from '../plats'

describe('platsUrSource: subscription_paid får platsen ur metadata.source', () => {
  it('tar delen efter betalvagg:', () => {
    expect(platsUrSource('betalvagg:matning')).toBe('matning')
    expect(platsUrSource('betalvagg:provlage')).toBe('provlage')
  })

  it('lämnar annan source som den är', () => {
    expect(platsUrSource('priser')).toBe('priser')
    expect(platsUrSource('registrering')).toBe('registrering')
    expect(platsUrSource('onboarding_paket')).toBe('onboarding_paket')
  })

  it('ger ingen plats utan source eller med tom betalvägg', () => {
    expect(platsUrSource(undefined)).toBeUndefined()
    expect(platsUrSource('')).toBeUndefined()
    expect(platsUrSource(null)).toBeUndefined()
    expect(platsUrSource('betalvagg:')).toBeUndefined()
  })
})

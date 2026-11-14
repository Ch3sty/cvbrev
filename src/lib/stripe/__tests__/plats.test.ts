import { describe, expect, it } from 'vitest'
import { kopKallaUrMetadata, platsUrSource } from '../plats'

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

describe('kopKallaUrMetadata: subscription_paid får källan och valet', () => {
  it('tar konto_kalla och mitt_test ur kassans metadata', () => {
    expect(
      kopKallaUrMetadata({ supabaseUUID: 'u1', plan: 'all_month', konto_kalla: 'smakprov:alva-labs-logiktest', mitt_test: 'alva', provdatum: '2026-12-01' }),
    ).toEqual({ konto_kalla: 'smakprov:alva-labs-logiktest', mitt_test: 'alva' })
    expect(kopKallaUrMetadata({ konto_kalla: 'hubb' })).toEqual({ konto_kalla: 'hubb' })
  })

  it('ger inget utan metadata eller med skräp', () => {
    expect(kopKallaUrMetadata(undefined)).toEqual({})
    expect(kopKallaUrMetadata(null)).toEqual({})
    expect(kopKallaUrMetadata({ plan: 'all_month' })).toEqual({})
    expect(kopKallaUrMetadata({ konto_kalla: 'någon@exempel.se', mitt_test: 'Alva Labs!' })).toEqual({})
  })
})

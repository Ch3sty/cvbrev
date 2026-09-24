/**
 * Vem får se ett intervjusvar (sidan och proxyns 404 delar regeln).
 */

import { describe, expect, it } from 'vitest'
import { arTillganglig, arToken } from '../rad'

const NU = Date.parse('2026-09-23T20:00:00Z')
const SENARE = '2026-09-30T20:00:00Z'

const rad = (extra: Record<string, unknown> = {}) => ({
  user_id: null,
  claimed_by: null,
  expires_at: SENARE,
  full: { points: [] },
  ...extra,
})

describe('arTillganglig', () => {
  it('släpper in ägaren av ett hämtat svar', () => {
    expect(arTillganglig(rad({ claimed_by: 'a' }), 'a', NU)).toBe(true)
  })

  it('stänger ute alla andra från ett hämtat svar', () => {
    expect(arTillganglig(rad({ claimed_by: 'a' }), 'b', NU)).toBe(false)
  })

  it('låter vem som helst med token hämta ett anonymt, ohämtat svar', () => {
    expect(arTillganglig(rad(), 'b', NU)).toBe(true)
  })

  it('låter bara skribenten hämta ett ohämtat svar skrivet inloggat', () => {
    expect(arTillganglig(rad({ user_id: 'a' }), 'a', NU)).toBe(true)
    expect(arTillganglig(rad({ user_id: 'a' }), 'b', NU)).toBe(false)
  })

  it('stänger utgångna och irrelevanta svar, också för ägaren', () => {
    expect(arTillganglig(rad({ claimed_by: 'a', expires_at: '2026-09-23T19:00:00Z' }), 'a', NU)).toBe(false)
    expect(arTillganglig(rad({ claimed_by: 'a', full: { points: [], irrelevant: true } }), 'a', NU)).toBe(false)
  })
})

describe('permanenta rader (beslut 2, 2026-09-24)', () => {
  it('en hämtad rad utan expires_at går inte ut', () => {
    expect(arTillganglig(rad({ claimed_by: 'a', expires_at: null }), 'a', NU + 365 * 86400000)).toBe(true)
    expect(arTillganglig(rad({ claimed_by: 'a', expires_at: null }), 'b', NU)).toBe(false)
  })
})

describe('arToken', () => {
  it('godtar bara uuid', () => {
    expect(arToken('f5ae063c-b3f4-4e16-b441-eed30f9affea')).toBe(true)
    expect(arToken('../admin')).toBe(false)
    expect(arToken(undefined)).toBe(false)
  })
})

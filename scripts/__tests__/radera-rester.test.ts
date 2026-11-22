// Urvalen i skripten för rester efter raderade konton
// (beslut-mejl-och-radering 2d). Rena funktioner, inget nätverk, ingen databas.
import { describe, expect, it, vi } from 'vitest'

vi.mock('../_env', () => ({ laddaEnv: () => {} }))

import { valjRester } from '../radera-posthog-rester'
import { valjHandelser, mottagare } from '../radera-mejlhandelser-rester'

const V4_A = '11111111-2222-4333-8444-555555555555'
const V4_B = '22222222-2222-4333-9444-555555555555'
const V4_KONTO = '33333333-2222-4333-a444-555555555555'

describe('valjRester (PostHog)', () => {
  const par = [
    { distinctId: V4_A, personId: 'p1' },
    { distinctId: 'anonym-1', personId: 'p1' },
    { distinctId: V4_B, personId: 'p2' },
    { distinctId: V4_KONTO, personId: 'p3' },
    { distinctId: 'anonym-2', personId: 'p4' },
    { distinctId: V4_A.replace('1111', '9999'), personId: 'p5' },
    { distinctId: V4_KONTO, personId: 'p5' },
  ]
  const konton = new Set([V4_KONTO])

  it('tar personer med e-post vars id av version 4 saknar konto', () => {
    const u = valjRester(par, new Set(['p1', 'p2', 'p3', 'p4', 'p5']), konton)
    expect(u.personer).toBe(2)
    expect(u.distinctIds.sort()).toEqual([V4_A, V4_B].sort())
  })

  it('utan e-post tas personen inte', () => {
    expect(valjRester(par, new Set(['p1']), konton).distinctIds).toEqual([V4_A])
  })

  it('sammanslagen med ett befintligt konto tas inte, och anonyma utan uuid tas inte', () => {
    const u = valjRester(par, new Set(['p3', 'p4', 'p5']), konton)
    expect(u.personer).toBe(0)
  })
})

describe('valjHandelser (email_events)', () => {
  it('samma villkor som SQL:en: inte kontonas adresser, inte våra egna, inte utan mottagare', () => {
    const u = valjHandelser(
      [
        { id: 'e1', payload: { to: ['Borta@Exempel.se'] } },
        { id: 'e2', payload: { to: 'kvar@exempel.se' } },
        { id: 'e3', payload: { to: ['info@jobbcoach.ai'] } },
        { id: 'e4', payload: {} },
        { id: 'e5', payload: { to: 'borta@exempel.se' } },
      ],
      new Set(['kvar@exempel.se'])
    )
    expect(u.ids).toEqual(['e1', 'e5'])
    expect([...u.adresser]).toEqual(['borta@exempel.se'])
  })

  it('mottagaren läses som payload->to->0, annars payload->to', () => {
    expect(mottagare({ to: ['A@b.se', 'c@d.se'] })).toBe('a@b.se')
    expect(mottagare({ to: 'X@y.se' })).toBe('x@y.se')
    expect(mottagare(null)).toBeNull()
  })
})

/**
 * /register för den som redan är inloggad (H3, 2026-11-14): inget formulär,
 * utan dit registreringen skulle leda.
 */
import { describe, expect, it } from 'vitest'
import { inloggadFranRegister, registerIngang } from '../intent'

const VAGAR = { valkommenPath: '/dashboard/valkommen', sparvalPath: '/dashboard/valj-spar' }
const ingang = (q: string) => {
  const p = new URLSearchParams(q)
  return registerIngang((n) => p.get(n))
}

describe('inloggadFranRegister', () => {
  it('smakprovet hämtas hem på valkommen-sidan', () => {
    expect(inloggadFranRegister(ingang('test=b48cd409-f041-4edc-9638-b5e4d3288298'), VAGAR)).toBe(
      '/dashboard/valkommen?test=b48cd409-f041-4edc-9638-b5e4d3288298'
    )
    expect(inloggadFranRegister(ingang('cv_start=lakare:norrsken'), VAGAR)).toBe('/dashboard/valkommen?cv_start=lakare%3Anorrsken')
  })
  it('redirecten, köpsteget och valets verktyg', () => {
    expect(inloggadFranRegister(ingang('redirect=%2Fdashboard%2Ftester%2Fiprov'), VAGAR)).toBe('/dashboard/tester/iprov')
    expect(inloggadFranRegister(ingang('paket=all_month'), VAGAR)).toBe('/dashboard/valj-spar?paket=all_month&steg=kop')
    expect(inloggadFranRegister(ingang('borja=tester'), VAGAR)).toBe('/dashboard/tester')
  })
  it('bar /register och en främmande redirect går till hemskärmen', () => {
    expect(inloggadFranRegister(ingang(''), VAGAR)).toBe('/dashboard')
    expect(inloggadFranRegister(ingang('redirect=https%3A%2F%2Fevil.example'), VAGAR)).toBe('/dashboard')
  })
})

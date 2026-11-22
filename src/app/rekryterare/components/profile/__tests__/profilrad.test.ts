/**
 * Raden under kandidatens namn på detaljsidan och i delningslänken (QA live
 * 2026-11-22, punkt 4): efter ja och i Öppen profil står bara yrkesrollen
 * (och region och aktiv sedan när de finns), aldrig "Anonym profil".
 */
import { describe, expect, it, vi } from 'vitest'

vi.mock('framer-motion', () => ({ motion: { div: 'div' } }))
import { profilRad } from '../ProfileSections'

describe('raden under namnet', () => {
  it('efter ja: yrkesrollen, utan Anonym profil', () => {
    expect(profilRad({ fullName: 'Vera Provgren', role: 'Projektledare', regions: [], visibility: 'anonymous' }, null)).toBe('Projektledare')
  })

  it('Öppen profil med namn: yrkesrollen och regionen, ingen profiletikett', () => {
    expect(profilRad({ fullName: 'Vera Provgren', role: 'Projektledare', regions: ['Västmanlands län'], visibility: 'open' }, null)).toBe(
      'Projektledare · Västmanlands län'
    )
  })

  it('före ja: rollen är rubriken, raden säger Anonym profil', () => {
    expect(profilRad({ fullName: null, role: 'Projektledare', regions: [], visibility: 'anonymous' }, '3 nov')).toBe(
      'Anonym profil · aktiv i poolen sedan 3 nov'
    )
  })
})

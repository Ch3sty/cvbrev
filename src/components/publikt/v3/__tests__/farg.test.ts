import { describe, expect, it } from 'vitest'
import { FARGER, FARG_OVRIGT, fargForSokvag } from '../farg'
import { KLUSTER_RUM } from '../../innehall/artikel-kluster'

/**
 * Grafiten finns inte publikt (ägaren 2026-11-22: inget svart). Allt utan
 * egen del står i indigo, och rekryterarsidorna i skog.
 */
describe('sidornas färg', () => {
  it('har fyra färger och ingen grafit', () => {
    expect([...FARGER]).toEqual(['tran', 'cv', 'brev', 'jobb'])
    expect(FARGER as readonly string[]).not.toContain('neutral')
    expect(FARG_OVRIGT).toBe('tran')
  })

  it('ger sidor utan egen del indigo, som startsidan', () => {
    for (const s of ['/', '/hjalpcenter', '/kontakt', '/press', '/karriar', '/integrationer', '/exempel', '/authors/helena', '/artiklar', '/login', '/auth/forgot-password', '/finns-inte', null, undefined]) {
      expect(fargForSokvag(s)).toBe('tran')
    }
  })

  it('ger delarnas sidor delens färg', () => {
    expect(fargForSokvag('/verktyg/rekryteringstester/prova')).toBe('tran')
    expect(fargForSokvag('/cv-mallar/lakare')).toBe('cv')
    expect(fargForSokvag('/skapa-brev/start?mall=koppar')).toBe('brev')
    expect(fargForSokvag('/verktyg/sokta-tjanster/')).toBe('jobb')
  })

  it('ställer rekryterarsidorna och kalkylatorerna i skog', () => {
    expect(fargForSokvag('/for-rekryterare')).toBe('jobb')
    expect(fargForSokvag('/for-rekryterare/insikter/kravprofil')).toBe('jobb')
    expect(fargForSokvag('/rakna-ut/traffsakerhet')).toBe('jobb')
  })

  it('låter inget artikelkluster falla tillbaka på grafit', () => {
    for (const rum of Object.values(KLUSTER_RUM)) expect(rum).not.toBe('neu')
  })
})

import { describe, expect, it } from 'vitest'
import { aktivUndersida, rumForPath } from '../rum'

describe('rumForPath (spec-rummen avsnitt 5)', () => {
  it('Träningen äger /dashboard/tester och allt under', () => {
    expect(rumForPath('/dashboard/tester')).toBe('tran')
    expect(rumForPath('/dashboard/tester/matrislogik-grund/test/abc/results')).toBe('tran')
    expect(rumForPath('/dashboard/tester/prov/saknas')).toBe('tran')
  })

  it('CV går före profilen, så /dashboard/profil/cv är CV', () => {
    expect(rumForPath('/dashboard/profil/cv')).toBe('cv')
    expect(rumForPath('/dashboard/profil/cv/123')).toBe('cv')
    expect(rumForPath('/dashboard/skapa-cv')).toBe('cv')
    expect(rumForPath('/dashboard/cv-analys')).toBe('cv')
    expect(rumForPath('/dashboard/cv-mallar')).toBe('cv')
    expect(rumForPath('/dashboard/linkedin-optimizer')).toBe('cv')
  })

  it('Personliga brev', () => {
    expect(rumForPath('/dashboard/mina-brev')).toBe('brev')
    expect(rumForPath('/dashboard/mina-brev/abc/edit')).toBe('brev')
    expect(rumForPath('/dashboard/skapa-brev')).toBe('brev')
  })

  it('kontot är grafit', () => {
    expect(rumForPath('/dashboard/profil')).toBe('neutral')
    expect(rumForPath('/dashboard/profil/prenumeration')).toBe('neutral')
    expect(rumForPath('/dashboard/installningar')).toBe('neutral')
    expect(rumForPath('/dashboard/valj-spar')).toBe('neutral')
    expect(rumForPath('/dashboard/kontakt')).toBe('neutral')
    expect(rumForPath('/dashboard/bugg-feedback')).toBe('neutral')
    expect(rumForPath('/dashboard/valkommen')).toBe('neutral')
    expect(rumForPath('/dashboard/vecka/start')).toBe('neutral')
  })

  it('allt annat under /dashboard är Jobbsöket', () => {
    expect(rumForPath('/dashboard')).toBe('jobb')
    expect(rumForPath('/dashboard/')).toBe('jobb')
    expect(rumForPath('/dashboard/sokta-tjanster/1')).toBe('jobb')
    expect(rumForPath('/dashboard/intervju/ny')).toBe('jobb')
    expect(rumForPath('/dashboard/jobbcoachen')).toBe('jobb')
    expect(rumForPath('/dashboard/jobbmatchning')).toBe('jobb')
    expect(rumForPath('/dashboard/bli-upptackt')).toBe('jobb')
    expect(rumForPath('/dashboard/meddelanden')).toBe('jobb')
    expect(rumForPath(null)).toBe('jobb')
  })

  it('ett prefix som bara liknar räknas inte', () => {
    expect(rumForPath('/dashboard/testerna')).toBe('jobb')
    // Testrummets egen sida Test och datum är inte kontots Inställningar.
    expect(rumForPath('/dashboard/tester/installningar')).toBe('tran')
    expect(rumForPath('/dashboard/profilen')).toBe('jobb')
  })
})

describe('aktivUndersida', () => {
  const rader = [
    { href: '/dashboard', exact: true },
    { href: '/dashboard/sokta-tjanster' },
    { href: '/dashboard/intervju' },
  ]
  it('exakt träff för exakta rader, längsta prefix annars', () => {
    expect(aktivUndersida('/dashboard', rader)?.href).toBe('/dashboard')
    expect(aktivUndersida('/dashboard/sokta-tjanster/5', rader)?.href).toBe('/dashboard/sokta-tjanster')
    expect(aktivUndersida('/dashboard/okand', rader)).toBeNull()
  })
})

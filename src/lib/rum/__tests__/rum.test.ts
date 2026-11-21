import { describe, expect, it } from 'vitest'
import { aktivUndersida, rumForPath } from '../rum'
import { UNDERSIDA } from '../copy'

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

describe('sidomenyn i Rekryteringstester (tester v4, planen 3.3)', () => {
  const tran = [
    { href: '/dashboard/tester', exact: true },
    { href: '/dashboard/tester/alla' },
    { href: '/dashboard/tester/kurvan' },
    { href: '/dashboard/tester/installningar' },
  ]
  it('raderna heter Hem, Tester, Din utveckling och Plan inför provet', () => {
    expect([UNDERSIDA.hem, UNDERSIDA.tester, UNDERSIDA.dinUtveckling, UNDERSIDA.planInforProvet]).toEqual([
      'Hem',
      'Tester',
      'Din utveckling',
      'Plan inför provet',
    ])
  })
  it('Hem är exakt, typens meny och undersidorna markerar rätt rad', () => {
    expect(aktivUndersida('/dashboard/tester', tran)?.href).toBe('/dashboard/tester')
    expect(aktivUndersida('/dashboard/tester/alla', tran)?.href).toBe('/dashboard/tester/alla')
    expect(aktivUndersida('/dashboard/tester/kurvan', tran)?.href).toBe('/dashboard/tester/kurvan')
    expect(aktivUndersida('/dashboard/tester/installningar', tran)?.href).toBe('/dashboard/tester/installningar')
    // Ett test under /dashboard/tester markerar ingen rad (Hem är exakt).
    expect(aktivUndersida('/dashboard/tester/pass', tran)).toBeNull()
  })
  it('ingen rad säger pass', () => {
    for (const t of [UNDERSIDA.hem, UNDERSIDA.tester, UNDERSIDA.dinUtveckling, UNDERSIDA.planInforProvet]) {
      expect(t).not.toMatch(/\bpass\b/i)
    }
  })
})

describe('menyPath (arbetsläget i CV-rummet)', () => {
  const q = (s: string) => new URLSearchParams(s)
  it('markerar fliken hon kom från när ett befintligt CV redigeras', async () => {
    const { menyPath } = await import('../rum')
    expect(menyPath('/dashboard/skapa-cv', q('cv=a&fran=mallar'))).toBe('/dashboard/cv-mallar')
    expect(menyPath('/dashboard/skapa-cv', q('cv=a&fran=analys'))).toBe('/dashboard/cv-analys')
    expect(menyPath('/dashboard/skapa-cv', q('cv=a&fran=ditt-cv'))).toBe('/dashboard/profil/cv')
    expect(menyPath('/dashboard/skapa-cv', q('cv=a'))).toBe('/dashboard/profil/cv')
  })
  it('Skapa nytt CV bara när CV:t byggs från början', async () => {
    const { menyPath } = await import('../rum')
    expect(menyPath('/dashboard/skapa-cv', q('fran=mina_cv&titel=x'))).toBe('/dashboard/skapa-cv')
    expect(menyPath('/dashboard/cv-mallar', q('cv=a'))).toBe('/dashboard/cv-mallar')
  })
})

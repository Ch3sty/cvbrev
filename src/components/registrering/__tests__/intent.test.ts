/**
 * Registreringstrattens landningstabell, cookien och Google-callbackens mål
 * (docs/design/profil-registrering-spec-2026-09-24.md, Del B).
 *
 * Google-inloggningen går inte att klicktesta headless. Därför simuleras
 * hela vägen här: /register skriver cookien, webbläsaren bär den genom
 * Googles redirect (SameSite=Lax), /auth/callback läser den och väljer mål,
 * och /dashboard/valkommen väljer landning ur samma cookie.
 */

import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  INTENTS,
  googleCallbackMal,
  harledEntry,
  landningsgren,
  lasSignupCookie,
  registerIngang,
  sakerRedirect,
  serialiseraSignupCookie,
  type SignupCookie,
} from '../intent'
import { vantaMedTak } from '@/lib/analytics/server'

const VALKOMMEN = '/dashboard/valkommen'
const SPARVAL = '/dashboard/valj-spar'
const UUID = '0b4f7a53-8b8e-4a44-9d2d-2f1f7b3c1e11'

const ur = (q: string) => {
  const p = new URLSearchParams(q)
  return (n: string) => p.get(n)
}

describe('landningstabellen för /register', () => {
  it('bar /register är tratten', () => {
    expect(registerIngang(ur(''))).toEqual({ lage: 'tratt', intent: null, smakprov: null, paket: null, redirect: null })
  })

  it('?borja= ger kontosteget med valet', () => {
    const i = registerIngang(ur('borja=tester'))
    expect(i.lage).toBe('konto')
    expect(i.intent).toBe('tester')
  })

  it('ett okänt ?borja= ignoreras', () => {
    expect(registerIngang(ur('borja=allt')).lage).toBe('tratt')
  })

  it('?paket= ger paketläget', () => {
    const i = registerIngang(ur('paket=all_month'))
    expect(i.lage).toBe('paket')
    expect(i.paket).toBe('all_month')
    expect(registerIngang(ur('paket=gratis')).lage).toBe('tratt')
  })

  it('smakproven, alla fem typerna', () => {
    expect(registerIngang(ur(`intervju=${UUID}`)).smakprov).toEqual({ typ: 'intervju', token: UUID })
    expect(registerIngang(ur(`personlighet=${UUID}`)).smakprov).toEqual({ typ: 'personlighet', token: UUID })
    expect(registerIngang(ur('test=abc123def456')).smakprov).toEqual({ typ: 'test', token: 'abc123def456' })
    expect(registerIngang(ur('draft=Zx9_token-123')).smakprov).toEqual({ typ: 'draft', token: 'Zx9_token-123' })
    expect(registerIngang(ur('cv_start=sjukskoterska:modern')).smakprov).toEqual({ typ: 'cv_start', token: 'sjukskoterska:modern' })
    expect(registerIngang(ur('intervju=inte-ett-uuid')).lage).toBe('tratt')
  })

  it('smakprov går före redirect, redirect före paket, paket före valet', () => {
    expect(registerIngang(ur(`intervju=${UUID}&paket=cv_week&borja=cv`)).lage).toBe('smakprov')
    expect(registerIngang(ur('redirect=/dashboard/cv-mallar&paket=cv_week')).lage).toBe('redirect')
    expect(registerIngang(ur('paket=cv_week&borja=cv')).lage).toBe('paket')
    // Valet följer bara med där steg 1 eller valraden finns.
    expect(registerIngang(ur('paket=cv_week&borja=cv')).intent).toBeNull()
  })

  it('redirect släpper bara igenom relativa sökvägar i appen', () => {
    expect(sakerRedirect('//evil.example')).toBeNull()
    expect(sakerRedirect('https://evil.example')).toBeNull()
    expect(sakerRedirect('/\\evil')).toBeNull()
    expect(sakerRedirect('/dashboard')).toBeNull()
    expect(sakerRedirect('/dashboard/cv-mallar')).toBe('/dashboard/cv-mallar')
    expect(registerIngang(ur('redirect=//evil.example')).lage).toBe('tratt')
  })

  it('ingången: adressen först, sedan sessionStorage, sedan föregående sida', () => {
    expect(harledEntry({ lage: 'smakprov' }, 'header', null)).toBe('smakprov')
    expect(harledEntry({ lage: 'paket' }, null, null)).toBe('pris')
    expect(harledEntry({ lage: 'konto' }, null, null)).toBe('verktyg')
    expect(harledEntry({ lage: 'tratt' }, 'header', '/priser')).toBe('header')
    expect(harledEntry({ lage: 'tratt' }, null, '/login')).toBe('login')
    expect(harledEntry({ lage: 'tratt' }, null, '/verktyg/rekryteringstester')).toBe('verktyg')
    expect(harledEntry({ lage: 'tratt' }, null, '/priser')).toBe('pris')
    expect(harledEntry({ lage: 'tratt' }, 'skräp', null)).toBe('direkt')
  })
})

describe('valen', () => {
  it('fem val med spår, paket och landning enligt designfilens tabell', () => {
    expect(INTENTS).toEqual({
      cv: { track: 'cv', plan: 'cv_week', landning: '/dashboard/skapa-cv', ikon: 'cv' },
      brev: { track: 'cv', plan: 'cv_week', landning: '/dashboard/skapa-brev', ikon: 'brev' },
      tester: { track: 'tester', plan: 'test_week', landning: '/dashboard/tester', ikon: 'test' },
      intervju: { track: 'tester', plan: 'test_week', landning: '/dashboard/intervju', ikon: 'intervju' },
      jobb: { track: 'allt', plan: 'all_week', landning: '/dashboard/jobbmatchning', ikon: 'jobb' },
    })
  })
})

describe('cookien jc_signup', () => {
  it('går fram och tillbaka oförändrad', () => {
    const c: SignupCookie = {
      intent: 'tester',
      entry: 'verktyg',
      skipped: false,
      smakprov: { typ: 'test', token: 'abc123def456' },
      paket: null,
      redirect: null,
    }
    expect(lasSignupCookie(serialiseraSignupCookie(c))).toEqual(c)
  })

  it('tål skräp och ogiltiga fält', () => {
    expect(lasSignupCookie(undefined)).toBeNull()
    expect(lasSignupCookie('%7Binte-json')).toBeNull()
    const c = lasSignupCookie(
      encodeURIComponent(JSON.stringify({ intent: 'allt', entry: 'x', skipped: 'ja', paket: 'gratis', redirect: '//evil', smakprov: { typ: 'intervju', token: 'nej' } }))
    )
    expect(c).toEqual({ intent: null, entry: 'direkt', skipped: false, smakprov: null, paket: null, redirect: null })
  })
})

describe('Google-vägen, simulerad från knapp till landning', () => {
  /** Det som händer i webbläsaren: cookien skrivs, Google svarar, callbacken läser. */
  function genomGoogle(c: SignupCookie, isNewAccount: boolean, next = VALKOMMEN) {
    const iWebblasaren = serialiseraSignupCookie(c)
    const iCallbacken = lasSignupCookie(iWebblasaren)
    const mal = googleCallbackMal({ isNewAccount, next, cookie: iCallbacken, valkommenPath: VALKOMMEN })
    const gren = mal === VALKOMMEN ? landningsgren(iCallbacken, SPARVAL) : null
    return { mal, gren }
  }

  const bas: SignupCookie = { intent: null, entry: 'header', skipped: false, smakprov: null, paket: null, redirect: null }

  it('nytt konto med valet Skriva CV landar på förslaget med CV-paketet', () => {
    const { mal, gren } = genomGoogle({ ...bas, intent: 'cv' }, true)
    expect(mal).toBe(VALKOMMEN)
    expect(gren).toEqual({ via: 'forslag', intent: 'cv' })
    expect(INTENTS.cv.plan).toBe('cv_week')
  })

  it('nytt konto från testprovet kör hämtkedjan på valkommen (smakprovet i cookien)', () => {
    const c = { ...bas, entry: 'smakprov' as const, smakprov: { typ: 'test' as const, token: 'abc123def456' } }
    const { mal } = genomGoogle(c, true)
    expect(mal).toBe(VALKOMMEN)
    expect(lasSignupCookie(serialiseraSignupCookie(c))?.smakprov).toEqual({ typ: 'test', token: 'abc123def456' })
  })

  it('brevutkastet och CV-starten överlever också', () => {
    for (const sp of [
      { typ: 'draft' as const, token: 'Zx9_token-123' },
      { typ: 'cv_start' as const, token: 'larare:klassisk' },
    ]) {
      const c = { ...bas, smakprov: sp }
      expect(genomGoogle(c, true).mal).toBe(VALKOMMEN)
      expect(lasSignupCookie(serialiseraSignupCookie(c))?.smakprov).toEqual(sp)
    }
  })

  it('?paket=all_month landar på köpsteget med paketet', () => {
    const { gren } = genomGoogle({ ...bas, entry: 'pris', paket: 'all_month' }, true)
    expect(gren).toEqual({ via: 'paket', destination: `${SPARVAL}?paket=all_month&steg=kop` })
  })

  it('?redirect= går före paketet', () => {
    const { gren } = genomGoogle({ ...bas, paket: 'cv_week', redirect: '/dashboard/cv-mallar' }, true)
    expect(gren).toEqual({ via: 'redirect', destination: '/dashboard/cv-mallar' })
  })

  it('Hoppa över landar på spårvalet, som vet att frågan redan hoppats över', () => {
    const { gren } = genomGoogle({ ...bas, skipped: true }, true)
    expect(gren).toEqual({ via: 'sparval', destination: `${SPARVAL}?hoppat=1` })
  })

  it('befintligt konto: hemskärmen, eller redirecten, eller valkommen om ett smakprov väntar', () => {
    expect(genomGoogle({ ...bas, intent: 'cv' }, false).mal).toBe('/dashboard')
    expect(genomGoogle({ ...bas, redirect: '/dashboard/tester' }, false).mal).toBe('/dashboard/tester')
    expect(genomGoogle({ ...bas, smakprov: { typ: 'intervju', token: UUID } }, false).mal).toBe(VALKOMMEN)
  })

  it('inloggningens Google med eget next rörs inte', () => {
    expect(googleCallbackMal({ isNewAccount: false, next: '/dashboard/tester', cookie: null, valkommenPath: VALKOMMEN })).toBe('/dashboard/tester')
    expect(googleCallbackMal({ isNewAccount: true, next: '/dashboard', cookie: null, valkommenPath: VALKOMMEN })).toBe(VALKOMMEN)
    expect(googleCallbackMal({ isNewAccount: true, next: '/kassa?plan=all_day', cookie: null, valkommenPath: VALKOMMEN })).toBe('/kassa?plan=all_day')
  })
})

describe('signup_completed i callbacken väntas in med tak', () => {
  it('svarar sant när anropet hinner', async () => {
    expect(await vantaMedTak(Promise.resolve(), 50)).toBe(true)
  })
  it('släpper efter taket när anropet hänger', async () => {
    const start = Date.now()
    expect(await vantaMedTak(new Promise(() => {}), 60)).toBe(false)
    expect(Date.now() - start).toBeLessThan(1000)
  })
  it('callbacken väntar på händelsen före redirecten', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../../../app/auth/callback/route.ts'), 'utf8')
    const vanta = src.indexOf('await vantaMedTak(skickad, 1500)')
    const redirect = src.lastIndexOf('return NextResponse.redirect(`${origin}${destination}`)')
    expect(vanta).toBeGreaterThan(0)
    expect(redirect).toBeGreaterThan(vanta)
  })
})

describe('de osanna påståendena är borta', () => {
  it('ingen rad om fem dagar Premium, ingen statistik och ingen poängmätare i registreringen', () => {
    const SRC = path.resolve(__dirname, '../../..')
    const filer = [
      'app/register/page.tsx',
      'app/login/page.tsx',
      ...fs.readdirSync(path.join(SRC, 'components/registrering')).filter((f) => /\.tsx?$/.test(f)).map((f) => `components/registrering/${f}`),
    ]
    for (const f of filer) {
      const text = fs.readFileSync(path.join(SRC, f), 'utf8')
      for (const osann of ['Fem dagar Premium', '12 487', '94%', '94 %', 'AI-verktyg', 'AtsScoreMeter', 'CV:n skapade']) {
        expect(text.includes(osann), `${f}: ${osann}`).toBe(false)
      }
    }
    expect(fs.existsSync(path.join(SRC, 'components/auth/AtsScoreMeter.tsx'))).toBe(false)
  })
})

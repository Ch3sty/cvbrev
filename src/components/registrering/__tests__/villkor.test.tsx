/**
 * Saas-leads villkor för registreringstratten (docs/rapporter/beslut-registrering-2026-09-24.md
 * och specens acceptanskriterier 14, 15 och 16).
 *
 * 14  onboarding_intent läses bara av landningen, Kom igång och hemskärmens
 *     ordning. Aldrig av Sidebar, src/lib/access/ eller någon API-route utom
 *     /api/onboarding/track. Testet läser filträdet, så att det faller i CI.
 * 15  Menyn är identisk oavsett val: sidomenyn och mobilnavet renderas för
 *     ett gratiskonto med valet cv, tester och jobb och jämförs som HTML.
 * 16  Kom igång per val för gratiskonton: rätt ordning, och cv_upp och profil
 *     står aldrig i en gratislista per val.
 */

import { describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { render, cleanup } from '@testing-library/react'
import {
  KOM_IGANG_LISTA_GRATIS,
  brickaText,
  komIgangLage,
  komIgangRadText,
  listaFor,
  utanforIntent,
} from '@/lib/onboarding/komigang'
import { featureOrdning, featureUtanforVal } from '@/hooks/useUnusedFeatures'
import { traningsHandling } from '@/lib/intervju/nasta'
import { INTENT_ORDNING, type SignupIntent } from '../intent'

const SRC = path.resolve(__dirname, '../../..')

function filer(dir: string, ut: string[] = []): string[] {
  for (const namn of fs.readdirSync(dir)) {
    const full = path.join(dir, namn)
    if (fs.statSync(full).isDirectory()) {
      if (namn === 'node_modules' || namn.startsWith('.')) continue
      filer(full, ut)
    } else if (/\.(ts|tsx|js|jsx|sql)$/.test(namn)) ut.push(full)
  }
  return ut
}
const rel = (f: string) => path.relative(SRC, f).split(path.sep).join('/')

/* ------------------------------------------------------------ 14 */

/** De enda ställena i src där kolumnen får nämnas (specen, kriterium 14). */
const TILLATET = [
  /^app\/dashboard\/valkommen\//,
  /^app\/api\/onboarding\/track\//,
  /^lib\/onboarding\/komigang(-server)?\.ts$/,
  /^components\/dashboard\/KomIgang[^/]*\.tsx?$/,
  /^app\/dashboard\/\(oversikt\)\//,
  /^hooks\/useUnusedFeatures\.ts$/,
  /^components\/registrering\//,
  // Typfilerna: händelsernas typer och summeringens form.
  /^lib\/analytics\/events\.ts$/,
  /^contexts\/DashboardDataContext\.tsx$/,
]

describe('kriterium 14: valet läses bara av landningen, Kom igång och hemskärmens ordning', () => {
  const alla = filer(SRC).filter((f) => !rel(f).includes('__tests__/'))

  it('onboarding_intent nämns bara i de tillåtna filerna', () => {
    const utanfor = alla
      .filter((f) => fs.readFileSync(f, 'utf8').includes('onboarding_intent'))
      .map(rel)
      .filter((r) => !TILLATET.some((t) => t.test(r)))
    expect(utanfor, `onboarding_intent utanför de tillåtna filerna:\n${utanfor.join('\n')}`).toEqual([])
  })

  it('noll träffar i Sidebar, src/lib/access/ och API-routes utom onboarding/track', () => {
    const forbjudna = alla.filter((f) => {
      const r = rel(f)
      return (
        r === 'components/dashboard/Sidebar.tsx' ||
        r.startsWith('components/dashboard/sidebar/') ||
        r.startsWith('lib/access/') ||
        (r.startsWith('app/api/') && !r.startsWith('app/api/onboarding/track/'))
      )
    })
    expect(forbjudna.length).toBeGreaterThan(10)
    // Både kolumnen och summeringens fält (komIgang.intent) räknas som läsning.
    const traffar = forbjudna
      .filter((f) => /onboarding_intent|komIgang\??\.intent|komIgangIntent/.test(fs.readFileSync(f, 'utf8')))
      .map(rel)
    expect(traffar).toEqual([])
  })

  it('/api/onboarding/track är enda routen som skriver kolumnen', () => {
    const skriver = alla
      .filter((f) => rel(f).startsWith('app/api/'))
      .filter((f) => fs.readFileSync(f, 'utf8').includes('onboarding_intent'))
      .map(rel)
    expect(skriver).toEqual(['app/api/onboarding/track/route.ts'])
  })
})

/* ------------------------------------------------------------ 15 */

// Sidomenyn och mobilnavet renderas med en summering som bara skiljer sig i
// valet. Kontexterna mockas; komponenterna själva är de riktiga.
let summering: any = null
vi.mock('@/contexts/DashboardDataContext', () => ({
  useDashboardData: () => ({ summary: summering, refresh: async () => {}, isLoading: false }),
}))
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))
vi.mock('@/lib/supabase/client-manager', () => ({
  getSupabaseClient: () => ({ channel: () => ({ on: () => ({ subscribe: () => ({}) }) }), removeChannel: () => {} }),
}))
vi.mock('@/lib/scheduleIdle', () => ({ scheduleIdle: () => () => {} }))
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/hooks/use-profile', () => ({ useProfile: () => ({ profile: null, loading: false }) }))
vi.mock('@/hooks/useCandidateInterests', () => ({ useCandidateInterests: () => ({ count: 0, unread: 0 }) }))

function summeringFor(intent: SignupIntent) {
  return {
    profile: { subscription_tier: 'free', premium_until: null },
    cv: { count: 0, activeName: null },
    paket: {
      scope: null,
      track: null,
      planKey: null,
      fornyasAt: null,
      dayPassOnly: false,
      chatUsed: 0,
      chatLimit: 10,
      lettersUsed: 0,
      lettersLimit: 1,
    },
    komIgang: { provade: [], fakta: {}, intent },
    sidomeny: { cv: 0, brev: 0, ansokningar: 0 },
    arAdmin: false,
  }
}

describe('kriterium 15: menyn är identisk oavsett val', () => {
  it('sidomenyn och mobilnavet ger samma HTML för cv, tester och jobb', async () => {
    const { default: Sidebar } = await import('@/components/dashboard/Sidebar')
    const { default: MobileBottomNav } = await import('@/components/dashboard/MobileBottomNav')
    const html: string[] = []
    for (const intent of ['cv', 'tester', 'jobb'] as const) {
      summering = summeringFor(intent)
      const s = render(<Sidebar />)
      const m = render(<MobileBottomNav cvCount={0} applicationCount={0} />)
      html.push(s.container.innerHTML + '|' + m.container.innerHTML)
      cleanup()
    }
    expect(html[0].length).toBeGreaterThan(1000)
    expect(html[1]).toBe(html[0])
    expect(html[2]).toBe(html[0])
  })
})

/* ------------------------------------------------------------ 16 och bredden */

describe('kriterium 16: Kom igång per val för gratiskonton', () => {
  it('listorna per val enligt specen', () => {
    expect(KOM_IGANG_LISTA_GRATIS).toEqual({
      tester: ['matris_grund', 'personlighet', 'intervjuprov', 'analys_gratis', 'brev', 'jobbmatchning'],
      intervju: ['intervjuprov', 'personlighet', 'matris_grund', 'analys_gratis', 'brev', 'jobbmatchning'],
      cv: ['analys_gratis', 'mall', 'brev', 'jobbmatchning', 'matris_grund', 'intervjuprov'],
      brev: ['brev', 'analys_gratis', 'mall', 'jobbmatchning', 'matris_grund', 'intervjuprov'],
      jobb: ['jobbmatchning', 'analys_gratis', 'brev', 'mall', 'matris_grund', 'intervjuprov'],
    })
  })

  it('cv_upp och profil står aldrig i en gratislista per val, och varje lista har sex brickor', () => {
    for (const intent of INTENT_ORDNING) {
      const lista = KOM_IGANG_LISTA_GRATIS[intent]
      expect(lista).not.toContain('cv_upp')
      expect(lista).not.toContain('profil')
      expect(lista).toHaveLength(6)
      expect(new Set(lista).size).toBe(6)
    }
  })

  it('valet ändrar bara gratislistan; betalande och konton utan val har dagens listor', () => {
    expect(listaFor(null, null)).toEqual(['profil', 'cv_upp', 'analys_gratis', 'mall', 'matris_grund'])
    expect(listaFor('tester', 'cv')[0]).toBe('profil')
    expect(listaFor(null, 'tester')[0]).toBe('matris_grund')
  })

  it('intent tester: matrislogik först, sedan CV-analysen, brevet och tre matchade jobb bland de andra', () => {
    const lage = komIgangLage(null, [], false, 'tester')
    const titlar = lage.lista.map((k) => brickaText(k, null, {}, lage.gratisMedVal).titel)
    expect(titlar).toEqual([
      'Matrislogik, grundnivå',
      'Personlighetstestet',
      'Intervjuprovet',
      'Analysera ditt CV',
      'Skriv ett personligt brev',
      'Se tre matchade jobb',
    ])
    expect(lage.nasta).toBe('matris_grund')
    expect(komIgangRadText(lage)).toBe('0 av 6 provade, allt ingår gratis')
  })

  it('undertexterna säger vad som ingår gratis', () => {
    expect(brickaText('mall', null, {}, true)).toMatchObject({ titel: 'Välj en CV-mall', text: '3 mallar och en nedladdning ingår gratis' })
    expect(brickaText('personlighet', null, {}, true).text).toBe('50 påståenden, se vad rekryteraren läser ut')
    expect(brickaText('intervjuprov', null, {}, true).text).toBe('En fråga, återkoppling på svaret')
    expect(brickaText('jobbmatchning', null, {}, true).text).toBe('Jobb du inte hittat själv, med skälen')
  })

  it('outside_intent: en bricka utanför valets område', () => {
    expect(utanforIntent('analys_gratis', 'tester')).toBe(true)
    expect(utanforIntent('personlighet', 'tester')).toBe(false)
    expect(utanforIntent('matris_grund', 'cv')).toBe(true)
    expect(utanforIntent('mall', null)).toBe(false)
  })
})

describe('bredden på hemskärmen', () => {
  it('intent som ordning i useUnusedFeatures: CV-valet får testerna först, testvalet CV-analysen', () => {
    expect(featureOrdning('cv')[0].slug).toBe('tester')
    expect(featureOrdning('brev')[0].slug).toBe('tester')
    expect(featureOrdning('tester')[0].slug).toBe('cv-analys')
    expect(featureOrdning('intervju')[0].slug).toBe('cv-analys')
    expect(featureOrdning(null)[0].slug).toBe('bli-upptackt')
    // Valet ändrar ordningen, aldrig vad som finns.
    expect(featureOrdning('cv').map((f) => f.slug).sort()).toEqual(featureOrdning(null).map((f) => f.slug).sort())
    expect(featureUtanforVal('tester', 'cv')).toBe(true)
    expect(featureUtanforVal('cv-analys', 'cv')).toBe(false)
  })

  it('testvalet får första rekryteringstestet som Nästa handling, intervjuvalet intervjufrågan', () => {
    expect(traningsHandling(null, true)).toEqual({ kind: 'test-next', slug: expect.any(String), forsta: true })
    expect(traningsHandling(null, false).kind).toBe('interview-new')
  })
})

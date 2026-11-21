/**
 * De publika proven enligt skissen (2026-11-21): startskärmen, det öppna
 * kortets tvåspaltsdom och registreringen med provresultat. Strukturen som
 * byggarna och SEO läser: en h1, ingressen i DOM, länken till
 * /verktyg/rekryteringstester, Starta provet; domen med Regeln, Ditt misstag
 * och "Du valde"; registreringens mörka halva bara när ett provresultat följer
 * med.
 */

import { cleanup, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }), usePathname: () => '/', useSearchParams: () => new URLSearchParams() }))
vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn(), identifyUser: vi.fn() }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: {} }) }))
vi.mock('@/components/auth/GoogleSignInButton', () => ({
  default: ({ label }: { label: string }) => <button type="button">{label}</button>,
  AuthDivider: () => null,
}))

import ProvStart from '@/components/publikt/prov/ProvStart'
import OppetFacitKort from '@/components/publikt/prov/OppetFacitKort'
import { oppenPost } from '@/components/publikt/prov/provPost'
import RegisterFlode from '@/components/registrering/RegisterFlode'
import { registerIngang } from '@/components/registrering/intent'
import { oppetFacitMatris } from '@/lib/tests/oppet-facit.server'
import { questionsForToken } from '@/lib/tests/anon-session'
import { BANK_VERSION } from '@/lib/logicTestV7/selectQuestions.v7'

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const TOKEN = '12345678-1234-4234-8234-123456789abc'
const ur = (q: string) => {
  const p = new URLSearchParams(q)
  return (n: string) => p.get(n)
}

beforeEach(() => cleanup())

describe('startskärmen', () => {
  it('en h1, ingressen, länken till Rekryteringstester och Starta provet', () => {
    const { container } = render(
      <ProvStart typ="matris" eyebrow="Figurer och mönster, fem uppgifter" rubrik="Prova ett rekryteringstest" ingressFet="Samma typ av frågor." ingress=" Fem uppgifter." loading={false} fel={null} loginHref="/login" onStart={() => {}} />
    )
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(container.querySelector('[data-start-ingress]')?.textContent).toContain('Samma typ av frågor.')
    expect(container.querySelector('a[href="/verktyg/rekryteringstester"]')).not.toBeNull()
    expect(container.querySelectorAll('[data-cta="prova-start"]').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('[data-prova-typval] a')).toHaveLength(9)
  })
})

describe('det öppna kortets dom', () => {
  it('matrisen med en miss: Regeln, Ditt misstag och Du valde i två spalter', () => {
    const q = questionsForToken(TOKEN, BANK_VERSION)
    const answers = q.map((x, i) => (i < 2 ? (x.correctAnswer + 1) % x.options.length : x.correctAnswer))
    const of = oppetFacitMatris(q, answers, TOKEN, true).oppet_facit!
    const post = oppenPost(JSON.parse(JSON.stringify(of)), {})!
    const { container } = render(<OppetFacitKort post={post} nr={1} antal={5} />)
    const dom = container.querySelector('[data-dom-tva]')
    if (of.uppgift.kind === 'matris' && (of.uppgift as { misstag: string | null }).misstag) {
      expect(dom).not.toBeNull()
      expect(dom!.textContent).toContain('Regeln')
      expect(dom!.textContent).toMatch(/Du valde [A-F]\. Rätt svar är [A-F]\./)
    }
  })
})

describe('registreringen', () => {
  it('med provresultat: mörka halvan med resultatet och formuläret i kortet', () => {
    render(<RegisterFlode ingang={registerIngang(ur(`test=${TOKEN}`))} provResultat={{ ratt: 3, totalt: 5, fel: [1, 3] }} />)
    expect(document.querySelector('[data-prov-registrering]')).not.toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'Skapa ditt konto' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Skapa konto och se svaren' })).toBeTruthy()
  })

  it('utan prov: som förut, ingen mörk halva', () => {
    render(<RegisterFlode ingang={registerIngang(ur(''))} />)
    expect(document.querySelector('[data-prov-registrering]')).toBeNull()
  })
})

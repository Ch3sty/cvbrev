/**
 * Omgång 3, steg 2: resultatet med ett öppet facit på provsidan och i
 * artikeln, i spärrens tre varianter. Svaren tas fram med serverns egna
 * funktioner (oppetFacitTyp, oppetFacitMatris), som rättningen gör.
 *
 *  - rubriken per variant (briefen, Förlagor och texter)
 *  - exakt ett öppet facit, på uppgiften servern valde
 *  - de låsta raderna bär ingen facittext från någon annan uppgift
 *  - artikelns resultat har inga h1 till h6
 */

import { cleanup, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn(), identifyUser: vi.fn() }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: {} }) }))
vi.mock('@/components/auth/GoogleSignInButton', () => ({
  default: ({ label }: { label: string }) => <button type="button">{label}</button>,
  AuthDivider: () => null,
}))

import ProvResultatSida from '@/components/publikt/prov/ProvResultatSida'
import { ProvResultatRuta } from '@/components/artiklar/prov/ArtikelProvKlient'
import { franMatris, franPublika } from '@/components/publikt/prov/provPost'
import { PROV3 } from '@/components/publikt/prov/prov-copy'
import { genomgaProv, publikUppgift, rattaSvar, underlagFor, valjProv, felPositioner } from '@/lib/tests/prov-typer.server'
import { oppetFacitMatris, oppetFacitTyp } from '@/lib/tests/oppet-facit.server'
import { questionsForToken, toPublicQuestion, felIndex } from '@/lib/tests/anon-session'
import { BANK_VERSION } from '@/lib/logicTestV7/selectQuestions.v7'
import { lasRattning } from '@/lib/tests/prova-lokalt'
import type { NyProvTyp } from '@/lib/tests/prov-typer'

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const TOKEN = '12345678-1234-4234-8234-123456789abc'
const SCEN = { flera: [1, 3, 4], en: [3], noll: [] as number[] } as const
type Variant = keyof typeof SCEN
const VANTAT_INDEX: Record<Variant, number> = { flera: 1, en: 0, noll: 0 }

function talserie(variant: Variant) {
  const typ: NyProvTyp = 'talserie'
  const refs = valjProv(typ, TOKEN, TOKEN)
  const facit = genomgaProv(refs, refs.map(() => ({ svar: null, selected: -1, correct: false })))
  const ratt = facit.map((g) => String((g.genomgang as { rattVisat: number }).rattVisat))
  const svar = refs.map((r, i) => ((SCEN[variant] as readonly number[]).includes(i) ? rattaSvar(r, ratt[i] === '0' ? '1' : '0') : rattaSvar(r, ratt[i])))
  const data = { score: svar.filter((s) => s.correct).length, total: refs.length, fel: felPositioner(svar, refs.length), percentile: null, ...oppetFacitTyp(refs, svar) }
  const underlag = underlagFor(refs)
  const poster = franPublika(refs.map((r) => publikUppgift(r)!), underlag)
  const allaTexter = genomgaProv(refs, svar).map((g) => JSON.stringify(g.genomgang))
  return { typ, result: lasRattning(data), poster, underlag, allaTexter, regler: genomgaProv(refs, svar).map((g) => (g.genomgang as { regel?: string }).regel ?? '') }
}

function matris(variant: Variant) {
  const q = questionsForToken(TOKEN, BANK_VERSION)
  const answers = q.map((x, i) => ((SCEN[variant] as readonly number[]).includes(i) ? (x.correctAnswer + 1) % x.options.length : x.correctAnswer))
  const fel = felIndex(q, answers)
  const data = { score: 5 - fel.length, total: 5, fel, percentile: 40, ...oppetFacitMatris(q, answers, TOKEN, true) }
  return { typ: 'matris' as const, result: lasRattning(data), poster: q.map((x) => franMatris(toPublicQuestion(x, TOKEN, true))), underlag: {}, regler: q.map((x) => x.rule) }
}

beforeEach(() => {
  cleanup()
  sessionStorage.clear()
})

describe.each<[string, (v: Variant) => ReturnType<typeof matris> | ReturnType<typeof talserie>]>([
  ['matrisen', matris],
  ['talserier', talserie],
])('provsidans resultat, %s', (_n, bygg) => {
  it.each<[Variant]>([['flera'], ['en'], ['noll']])('%s: rubriken, exakt ett öppet facit, låsta rader utan facittext', (variant) => {
    const f = bygg(variant)
    const { container } = render(<ProvResultatSida typ={f.typ} result={f.result} token={TOKEN} poster={f.poster} underlag={f.underlag} onStang={() => {}} onGorOm={() => {}} />)
    const antal = f.result.total
    const antalFel = SCEN[variant].length
    // En h1: huvudtalet.
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(container.querySelector('h1')!.textContent).toBe(`${antal - antalFel} av ${antal} rätt`)
    // Spärrens rubrik per variant (kortet står två gånger i DOM: kolumnen på dator och sist på telefon).
    const rubrik = PROV3.sparr.rubrik(f.typ, variant, antalFel, antal)
    expect(screen.getAllByText(rubrik).length).toBeGreaterThan(0)
    if (variant === 'noll') expect(rubrik).toBe('Fem av fem. Mät din nivå på skalan 1 till 10')
    if (variant === 'en') expect(rubrik).toMatch(/bakom uppgiften du missade$/)
    if (variant === 'flera') expect(rubrik).toMatch(/bakom dina två andra missar$/)
    // Exakt ett öppet facit, på uppgiften servern valde.
    const oppna = container.querySelectorAll('[data-oppet-facit]')
    expect(oppna).toHaveLength(1)
    expect(oppna[0].getAttribute('data-oppet-facit')).toBe(String(VANTAT_INDEX[variant] + 1))
    // De andra uppgifternas rader: ingen regel från någon annan uppgift någonstans utanför det öppna kortet.
    const utanfor = (container.textContent ?? '').replace(oppna[0].textContent ?? '', '')
    f.regler.forEach((r, i) => {
      if (i === VANTAT_INDEX[variant] || !r || r.length < 12) return
      expect(utanfor.includes(r), `regeln för uppgift ${i + 1}`).toBe(false)
    })
    // Låsta rader: missarna, och alla utom den öppna när allt var rätt.
    const lasta = container.querySelectorAll('[data-prov-andra] [data-last]')
    expect(lasta.length).toBe(variant === 'noll' ? antal - 1 : variant === 'en' ? 1 : antalFel - 1)
    // Spärrens knapp till registreringen bär token.
    expect(container.querySelector('a[data-cta="prova-gate"]')!.getAttribute('href')).toBe(`/register?test=${TOKEN}`)
  })
})

describe('artikelns resultat', () => {
  it.each<[Variant]>([['flera'], ['en'], ['noll']])('%s: inga rubriker, exakt ett öppet facit, kontoraden och spärren', (variant) => {
    const f = talserie(variant)
    const { container } = render(<ProvResultatRuta typ={f.typ} slug="talserier" resultat={f.result} token={TOKEN} poster={f.poster} underlag={f.underlag} />)
    expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0)
    expect(container.querySelectorAll('[data-oppet-facit]')).toHaveLength(1)
    expect(container.querySelector('[data-prov-kontorad]')).not.toBeNull()
    expect(container.querySelector('a[data-cta="artikel-prov-gate"]')!.getAttribute('href')).toBe(`/register?test=${TOKEN}`)
    expect(container.querySelector('[data-prov-villkor]')).not.toBeNull()
    expect(container.querySelectorAll('[data-lista-rad="fel"][data-last]').length).toBe(variant === 'noll' ? 0 : variant === 'en' ? 1 : 2)
  })

  it('medan rättningen pågår: rutan står i sin höjd utan tal och facit', () => {
    const { container } = render(<ProvResultatRuta typ="talserie" slug="talserier" resultat={null} token={TOKEN} poster={[]} underlag={{}} total={5} />)
    expect(container.querySelector('[data-prov-vantar]')).not.toBeNull()
    expect(container.querySelectorAll('[data-oppet-facit]')).toHaveLength(0)
    expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0)
  })
})

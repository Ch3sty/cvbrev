/**
 * Betalväggarna i sessionsramen (plan-testflode-2026-11-20 avsnitt 8 och 9,
 * etapp 7): rätt plats, samma händelser som före ramen plus test_kind och
 * lage, kampanjpriset, köpknappen i fotens plats på mobil och aldrig en vägg
 * inne i en session.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const captureMock = vi.fn()

vi.mock('@/lib/analytics/events', () => ({
  capture: (...args: unknown[]) => captureMock(...args),
  identifyUser: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/tester/pass',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

import PaywallCard from '@/components/paywall/PaywallCard'
import Startskarm from '../Startskarm'
import NivakollKop from '../delat/NivakollKop'
import { OvningsprovBetalvagg } from '../delat/OvningsprovStart'
import { KampanjPrisProvider } from '@/components/kampanj/KampanjPrisKontext'
import { KAMPANJ_BY_NYCKEL, visning } from '@/lib/kampanj/kampanj'
import { ovningsformat } from '@/lib/ovningsprov/format'

const BW = visning(KAMPANJ_BY_NYCKEL['black-week-2026'])
const BW_KNAPP = 'Köp Premium, 99 kr första månaden'

const anrop = (namn: string) => captureMock.mock.calls.filter(([n]) => n === namn).map(([, p]) => p as Record<string, unknown>)

beforeEach(() => captureMock.mockClear())

describe('PaywallCard med testväggens mätning', () => {
  it('betalvagg_visad och paywall_cta_clicked bär plats, test_kind och lage; övriga egenskaper som förut', () => {
    render(<PaywallCard variant="testniva" feature="test_daily_pass" plats="dag2" matning={{ test_kind: 'talserie', lage: 'trana' }} />)
    expect(anrop('betalvagg_visad')).toEqual([{ plats: 'dag2', dagar_kvar: null, test_kind: 'talserie', lage: 'trana' }])
    expect(anrop('paywall_shown')[0]).toMatchObject({ variant: 'testniva', price_shown: true, feature: 'test_daily_pass', test_kind: 'talserie' })
    expect(anrop('feature_blocked')).toHaveLength(1)
    screen.getByRole('button', { name: /Köp Premium/ }).click()
    expect(anrop('paywall_cta_clicked')[0]).toMatchObject({ variant: 'testniva', cta: 'primary', plats: 'dag2', test_kind: 'talserie', lage: 'trana' })
  })

  it('utan matning: exakt samma händelser som före etapp 7', () => {
    render(<PaywallCard variant="testniva" plats="testniva" />)
    expect(anrop('betalvagg_visad')).toEqual([{ plats: 'testniva', dagar_kvar: null }])
    expect(anrop('paywall_shown')[0]).not.toHaveProperty('test_kind')
  })

  it("del 'fot' ritar bara knappen och mäter ingen visning; del 'kort' döljer knappen under lg", () => {
    const { container } = render(<PaywallCard variant="testniva" plats="ommatning" del="fot" matning={{ test_kind: 'matris', lage: 'nivakoll' }} />)
    expect(container.querySelectorAll('button')).toHaveLength(1)
    expect(container.querySelector('[data-paywall-fot]')).toBeTruthy()
    expect(anrop('betalvagg_visad')).toHaveLength(0)
    expect(anrop('paywall_shown')).toHaveLength(0)
    container.querySelector('button')!.click()
    expect(anrop('paywall_cta_clicked')[0]).toMatchObject({ plats: 'ommatning', test_kind: 'matris', lage: 'nivakoll' })

    captureMock.mockClear()
    const kort = render(<PaywallCard variant="testniva" plats="ommatning" del="kort" />)
    const knapp = kort.container.querySelector('button.knapp-primar')!
    expect(knapp.className).toContain('hidden')
    expect(knapp.className).toContain('lg:inline-flex')
    expect(anrop('betalvagg_visad')).toHaveLength(1)
  })

  it('Black Week: kampanjpriset också i fotens knapp', () => {
    render(
      <KampanjPrisProvider kampanj={BW}>
        <PaywallCard variant="testniva" plats="dag2" del="fot" />
      </KampanjPrisProvider>
    )
    expect(screen.getByRole('button', { name: BW_KNAPP })).toBeTruthy()
  })
})

describe('Startskärmen med vägg', () => {
  const bas = { test_kind: 'figurserie', lage: 'trana' as const, niva: null, format: null }
  const regler: [{ titel: string }, null, { titel: string }] = [{ titel: 'Sex uppgifter.' }, null, { titel: 'Nivån rör sig.' }]

  it('väggens köpknapp står i foten på mobil, kortet bär resten, en visning mäts', () => {
    const { container } = render(
      <KampanjPrisProvider kampanj={BW}>
        <Startskarm
          bas={bas}
          eyebrow="Figurserier"
          rubrik="Träna figurserier"
          scen="figurserie"
          regler={regler}
          sparrad="premium"
          fortsattTillganglig={false}
          sparr={<PaywallCard variant="testniva" feature="test_daily_pass" plats="dag2" matning={{ test_kind: 'figurserie', lage: 'trana' }} />}
        />
      </KampanjPrisProvider>
    )
    const fot = container.querySelector('[data-start-fot="vagg"]')
    expect(fot).toBeTruthy()
    expect(fot!.closest('footer')!.className).toContain('lg:hidden')
    expect(fot!.querySelector('[data-paywall-fot]')!.textContent).toBe(BW_KNAPP)
    // Kortets knapp finns kvar för dator.
    const kortKnapp = container.querySelector('[data-start-sparr] button.knapp-primar')
    expect(kortKnapp?.className).toContain('lg:inline-flex')
    expect(anrop('betalvagg_visad')).toEqual([{ plats: 'dag2', dagar_kvar: null, test_kind: 'figurserie', lage: 'trana' }])
    expect(anrop('test_start_viewed')[0]).toMatchObject({ test_kind: 'figurserie', lage: 'trana', sparrad: 'premium' })
  })

  it('utan vägg: Starta i foten som förut', () => {
    const { container } = render(
      <Startskarm bas={bas} eyebrow="Figurserier" rubrik="Träna figurserier" scen="figurserie" regler={regler} sparrad="none" fortsattTillganglig={false} knapp={{ text: 'Starta träningen', onClick: () => {} }} />
    )
    expect(container.querySelector('[data-start-fot="start"]')).toBeTruthy()
    expect(anrop('betalvagg_visad')).toHaveLength(0)
  })

  it('nivåtestets startsida (inline): kortet i rummet, köpknappen i en fot ovanför bottennavigeringen på mobil', () => {
    const { container } = render(
      <Startskarm
        inline
        bas={{ ...bas, lage: 'nivatest' }}
        eyebrow="Figurserier"
        rubrik="Figurserier, avancerad nivå"
        scen="figurserie"
        regler={[{ titel: 'a' }, { titel: 'b' }, { titel: 'c' }]}
        sparrad="premium"
        fortsattTillganglig={false}
        sparr={<PaywallCard variant="testniva" plats="testniva" matning={{ test_kind: 'figurserie', lage: 'nivatest' }} />}
      />
    )
    expect(container.querySelector('footer')).toBeNull()
    const fot = container.querySelector('[data-start-fot="vagg"]') as HTMLElement
    expect(fot.className).toContain('fixed')
    expect(fot.className).toContain('lg:hidden')
    expect(fot.style.bottom).toBe('var(--bottom-nav-h, 0px)')
    expect(fot.querySelector('[data-paywall-fot]')).toBeTruthy()
    expect(container.querySelector('[data-start-sparr] button.knapp-primar')!.className).toContain('lg:inline-flex')
    expect(anrop('betalvagg_visad')).toHaveLength(1)
  })
})

describe('Övningsprovets vägg och köpet på Nivåkollens resultat', () => {
  it('övningsprovet: plats provlage, test_kind provtypen, lage ovningsprov, kampanjen i klicket', () => {
    render(
      <KampanjPrisProvider kampanj={BW}>
        <OvningsprovBetalvagg typ="verbal" format={ovningsformat('verbal', null, null)} dagarKvar={null} fran="provrad" tillbakaHref="/dashboard/tester" />
      </KampanjPrisProvider>
    )
    expect(anrop('betalvagg_visad')).toEqual([{ plats: 'provlage', dagar_kvar: null, test_kind: 'verbal', lage: 'ovningsprov', kalla: 'provrad' }])
    const knapp = screen.getByRole('link', { name: BW_KNAPP })
    expect(knapp.getAttribute('href')).toContain('provlage')
    knapp.click()
    expect(anrop('paywall_cta_clicked')[0]).toMatchObject({ plats: 'provlage', kampanj: 'black-week-2026', test_kind: 'verbal', lage: 'ovningsprov' })
  })

  it('Nivåkollens resultat: köpet i statusraden med plats matning, som före ramen', () => {
    render(
      <KampanjPrisProvider kampanj={BW}>
        <NivakollKop testKind="spatial" />
      </KampanjPrisProvider>
    )
    expect(anrop('betalvagg_visad')).toEqual([{ plats: 'matning', dagar_kvar: null, test_kind: 'spatial', lage: 'nivakoll' }])
    const knapp = screen.getByRole('link', { name: BW_KNAPP })
    expect(knapp.getAttribute('href')).toContain('matning')
    knapp.click()
    expect(anrop('paywall_cta_clicked')[0]).toMatchObject({ plats: 'matning', cta: 'primary', test_kind: 'spatial', lage: 'nivakoll' })
  })
})

/* ------------------------------------------------- källkoden som grind */

function filer(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) return n === '__tests__' ? [] : filer(p)
    return /\.(tsx?|ts)$/.test(n) ? [p] : []
  })
}

describe('källkoden', () => {
  const sessionFiler = filer(join(process.cwd(), 'src/components/session'))

  it('varje PaywallCard i ramens startskärmar har plats (kvotkortet: test_tak ur varianten) och test_kind och lage', () => {
    for (const f of sessionFiler) {
      const kod = readFileSync(f, 'utf8')
      const kort = kod.match(/<PaywallCard[\s\S]*?\/>/g) ?? []
      for (const k of kort) {
        expect(k, f).toMatch(/plats=|variant="test-tak"/)
        expect(k, f).toMatch(/matning=\{\{ test_kind: [^,]+, lage: '(trana|nivakoll|nivatest|ovningsprov|iprov|personlighet)' \}\}/)
      }
    }
  })

  it('ingen vägg inne i en session: SessionsRam, lägena och typerna nämner inte PaywallCard, Premium eller Lås upp', () => {
    const inne = sessionFiler.filter((f) => /[\\/](SessionsRam|Svarskort|Klocka|Forklaringen|Uppgiftsarket)\.tsx$|[\\/]typer[\\/]|[\\/]lagen[\\/](Genomgang|gemensamt)\.tsx$/.test(f))
    expect(inne.length).toBeGreaterThan(5)
    for (const f of inne) {
      const kod = readFileSync(f, 'utf8')
      expect(kod, f).not.toMatch(/PaywallCard|Lås upp|Premium/)
    }
  })

  it('ingen betalvagg_visad utan vägg: ingen händelse vid 402 i lägenas api', () => {
    for (const f of sessionFiler) {
      const kod = readFileSync(f, 'utf8')
      expect(kod, f).not.toMatch(/status === 402\) capture\('betalvagg_visad'/)
    }
  })
})

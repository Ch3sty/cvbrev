/**
 * Black Week och Cyber Monday i brevrummets spärr (förhandskontroll inför
 * 23 november 2026). Kedjan som i produktionen: kampanjForVisning med
 * kampanjNu() och kontots profil, dashboard-layoutens rad
 * `kampanj && behorig ? visning(kampanj) : null`, KampanjPrisProvider och
 * BrevSparr. Datumet låses med falsk klocka; bara Date fejkas.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'

let profil: Record<string, unknown> | null = null

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: profil, error: null }) }),
      }),
    }),
  }),
}))
vi.mock('@/lib/stripe/server', () => ({ stripe: {} }))
vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn(), identifyUser: vi.fn() }))
vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard/mina-brev/mallar' }))

import BrevSparr, { type BrevSparrVariant } from '../BrevSparr'
import { KampanjPrisProvider } from '@/components/kampanj/KampanjPrisKontext'
import { kampanjNu, visning } from '@/lib/kampanj/kampanj'
import { kampanjForVisning } from '@/lib/kampanj/kampanj.server'
import { getPaywallCopy } from '@/components/paywall/paywall-copy'
import { SALD_PLAN } from '@/lib/plans/plans'

const ALDRIG_PREMIUM = { subscription_id: null, subscription_status: null, paket_started_at: null, premium_source: null }
const HAFT_PREMIUM = { subscription_id: 'sub_gammal', subscription_status: 'canceled', paket_started_at: '2026-03-01T00:00:00Z', premium_source: 'stripe' }

let nr = 0
async function sparrenVid(datum: string, konto: Record<string, unknown>, variant: BrevSparrVariant = 'nedladdning') {
  vi.setSystemTime(new Date(datum))
  profil = konto
  nr += 1
  const { kampanj, behorig } = await kampanjForVisning(`konto-${nr}`, kampanjNu())
  // Samma rad som src/app/dashboard/layout.tsx.
  const kampanjPris = kampanj && behorig ? visning(kampanj) : null
  render(
    <KampanjPrisProvider kampanj={kampanjPris}>
      <BrevSparr variant={variant} onClose={() => {}} nastaGratis="2026-12-07T00:00:00+01:00" />
    </KampanjPrisProvider>,
  )
  const pris = document.body.querySelector('.b3-sparr-pris')?.textContent ?? ''
  const knapp = document.body.querySelector('[data-sparr-kop]')?.textContent ?? ''
  return { pris, knapp }
}

describe('brevrummets spärr under Black Week och Cyber Monday', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} })) as unknown as typeof window.matchMedia
    window.scrollTo = (() => {}) as typeof window.scrollTo
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it.each([
    ['23 nov 00.00', '2026-11-23T00:00:00+01:00', 99],
    ['29 nov 23.59', '2026-11-29T23:59:00+01:00', 99],
    ['30 nov 00.00', '2026-11-30T00:00:00+01:00', 49],
    ['30 nov 23.59', '2026-11-30T23:59:00+01:00', 49],
  ])('aldrig Premium, %s: %i kr i prisraden och knappen', async (_n, datum, kr) => {
    for (const variant of ['nedladdning', 'vecka'] as const) {
      const { pris, knapp } = await sparrenVid(datum, ALDRIG_PREMIUM, variant)
      expect(pris).toContain(`${kr} kr första månaden, sedan 149 kr i månaden`)
      expect(knapp).toBe(`Köp Premium, ${kr} kr första månaden`)
      cleanup()
    }
  })

  it.each([
    ['22 nov 23.59, före kampanjen', '2026-11-22T23:59:00+01:00'],
    ['1 dec 00.00, efter kampanjen', '2026-12-01T00:00:00+01:00'],
  ])('aldrig Premium, %s: ordinarie 149 kr', async (_n, datum) => {
    const { pris, knapp } = await sparrenVid(datum, ALDRIG_PREMIUM)
    expect(pris).toContain('Jobbcoach Premium, 149 kr i månaden.')
    expect(knapp).toBe('Köp Premium, 149 kr i månaden')
    expect(document.body.textContent).not.toMatch(/(^|[^1])(99|49) kr/)
  })

  it.each([
    ['Black Week', '2026-11-25T12:00:00+01:00'],
    ['Cyber Monday', '2026-11-30T12:00:00+01:00'],
  ])('kontot har haft Premium, %s: ordinarie 149 kr', async (_n, datum) => {
    for (const variant of ['nedladdning', 'vecka'] as const) {
      const { pris, knapp } = await sparrenVid(datum, HAFT_PREMIUM, variant)
      expect(pris).toContain('Jobbcoach Premium, 149 kr i månaden.')
      expect(knapp).toBe('Köp Premium, 149 kr i månaden')
      expect(document.body.textContent).not.toMatch(/(^|[^1])(99|49) kr/)
      cleanup()
    }
  })

  it.each(['cv', 'tester', 'allt'] as const)('spåret %s ur onboardingen ändrar inte kampanjpriset', async (track) => {
    vi.setSystemTime(new Date('2026-11-24T09:00:00+01:00'))
    profil = ALDRIG_PREMIUM
    nr += 1
    const { kampanj, behorig } = await kampanjForVisning(`konto-${nr}`, kampanjNu())
    render(
      <KampanjPrisProvider kampanj={kampanj && behorig ? visning(kampanj) : null}>
        <BrevSparr variant="nedladdning" onClose={() => {}} track={track} />
      </KampanjPrisProvider>,
    )
    expect(document.body.querySelector('[data-sparr-kop]')?.textContent).toBe('Köp Premium, 99 kr första månaden')
  })

  it('köpknappen leder till planen som kampanjen gäller (köpsteget och kassan prövar själva)', () => {
    expect(getPaywallCopy('nedladdning', { quotaFeature: 'letter_generation', plan: SALD_PLAN, plats: 'nedladdning' }).plan).toBe(SALD_PLAN)
    expect(getPaywallCopy('kvot', { quotaFeature: 'letter_generation', plan: SALD_PLAN, plats: 'kvot' }).plan).toBe(SALD_PLAN)
  })
})

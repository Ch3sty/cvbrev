/**
 * Testväggen när dagens grundnivåtest är gjort (svepet före Black Week,
 * 2026-11-19, textdäcket T11 och F4). "Kör grundnivån igen" ledde rakt in i
 * kvotspärren. Med grundKvarIdag 0 är det sekundära länken "Se vad som
 * ingår", och kvotlåset (plats 'kvot') säger "Dagens grundnivåtest är gjort".
 * Köpknappen står kvar, med kampanjpriset under en kampanj.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const captureMock = vi.fn()
vi.mock('@/lib/analytics/events', () => ({
  capture: (...args: unknown[]) => captureMock(...args),
  identifyUser: vi.fn(),
}))
vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard/tester/alla' }))

import PaywallCard from '../PaywallCard'
import GraValSheet from '../GraValSheet'
import { getPaywallCopy } from '../paywall-copy'
import { KampanjPrisProvider } from '@/components/kampanj/KampanjPrisKontext'
import { KAMPANJ_BY_NYCKEL, visning } from '@/lib/kampanj/kampanj'
import { byggGratislage, lasNivaTest } from '@/lib/tester/v4/gratis'
import { lasFor } from '@/components/tester-v4/tester/lasning'

const KNAPP = 'Köp Premium, 149 kr i månaden'
const RUBRIK = 'Dagens grundnivåtest är gjort'

describe('testväggen efter dagens grundnivåtest', () => {
  beforeEach(() => captureMock.mockClear())

  it('F4: det sekundära villkoras på grundKvarIdag', () => {
    expect(getPaywallCopy('testniva', { grundKvarIdag: 1 }).secondary).toBe('Kör grundnivån igen')
    expect(getPaywallCopy('testniva', { grundKvarIdag: null }).secondary).toBe('Kör grundnivån igen')
    expect(getPaywallCopy('testniva').secondary).toBe('Kör grundnivån igen')
    expect(getPaywallCopy('testniva', { grundKvarIdag: 0 }).secondary).toBe('Se vad som ingår')
  })

  it('T11: kvotlåset ger plats kvot och rubriken, aldrig Avancerad nivå', () => {
    expect(lasFor({ slag: 'niva_test', zon: 'grund', las: { skal: 'kvot', chip: 'I morgon' } }).plats).toBe('kvot')
    const g = byggGratislage({ premium: false, harHistorik: false, grundIdag: 1, nivakollGjord: {}, kampanj: null })
    expect(g.grundKvarIdag).toBe(0)
    expect(lasFor({ slag: 'niva_test', zon: 'grund', las: lasNivaTest(g, 'grund').las }).plats).toBe('kvot')
    const c = getPaywallCopy('testniva', { plats: 'kvot' })
    expect(c.title).toBe(RUBRIK)
    expect(c.title).not.toMatch(/Avancerad nivå/)
    expect(c.body).toBe(
      'Ett nytt öppnar i morgon, i vilken testtyp du vill. Med Premium väntar du inte: träning på din nivå och tester på alla nivåer, utan tak, och övningsprov mot klockan.'
    )
    expect(c.secondary).toBe('Se vad som ingår')
    expect(getPaywallCopy('test-tak').title).toBe(RUBRIK)
  })

  it('kvoten kvar: "Kör grundnivån igen" står kvar som förut', () => {
    const onSecondary = vi.fn()
    render(<PaywallCard variant="testniva" plats="testniva" onSecondary={onSecondary} grundKvarIdag={1} />)
    fireEvent.click(screen.getByRole('button', { name: 'Kör grundnivån igen' }))
    expect(onSecondary).toHaveBeenCalledTimes(1)
  })

  it('kvoten slut: inget nytt grundtest, länken Se vad som ingår och köpknappen kvar', () => {
    const onSecondary = vi.fn()
    render(<PaywallCard variant="testniva" plats="testniva" onSecondary={onSecondary} grundKvarIdag={0} />)
    expect(screen.queryByText('Kör grundnivån igen')).toBeNull()
    expect(screen.getByRole('link', { name: 'Se vad som ingår' })).toBeTruthy()
    expect(screen.getByRole('button', { name: KNAPP })).toBeTruthy()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('kvotlåset: rubriken, Bankbredd och ingen statusrad', () => {
    const { container } = render(<PaywallCard variant="testniva" plats="kvot" testTyp="matris" onSecondary={() => {}} grundKvarIdag={0} />)
    expect(screen.getByRole('heading', { name: RUBRIK })).toBeTruthy()
    expect(container.querySelector('figure.bb.bb-rad.bb-ljus')).toBeTruthy()
    expect(container.querySelector('.bb-staplar li[data-markerad]')?.getAttribute('data-typ')).toBe('matris')
    expect(container.querySelector('[data-grund-kvot]')).toBeNull()
    expect(container.textContent).not.toMatch(/·/)
  })

  it('under Black Week står kampanjknappen kvar', () => {
    render(
      <KampanjPrisProvider kampanj={visning(KAMPANJ_BY_NYCKEL['black-week-2026'])}>
        <PaywallCard variant="testniva" plats="kvot" onSecondary={() => {}} grundKvarIdag={0} />
      </KampanjPrisProvider>
    )
    expect(screen.getByRole('button', { name: 'Köp Premium, 99 kr första månaden' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: RUBRIK })).toBeTruthy()
  })

  it('arket (GraValSheet) för vidare kvoten till kortet', () => {
    render(
      <GraValSheet
        open
        onClose={() => {}}
        feature="tests_above_base"
        variant="testniva"
        scope={null}
        track={null}
        surface="/dashboard/tester/alla"
        plats="testniva"
        grundKvarIdag={0}
      />
    )
    expect(screen.queryByText('Kör grundnivån igen')).toBeNull()
    expect(screen.getByRole('link', { name: 'Se vad som ingår' })).toBeTruthy()
    expect(screen.getByRole('button', { name: KNAPP })).toBeTruthy()
  })

  it('arkets väggar med egen rubrik behåller länken Se vad som ingår', () => {
    render(<PaywallCard variant="testniva" plats="riktat" onSecondary={() => {}} grundKvarIdag={0} />)
    expect(screen.getByRole('link', { name: 'Se vad som ingår' })).toBeTruthy()
  })
})

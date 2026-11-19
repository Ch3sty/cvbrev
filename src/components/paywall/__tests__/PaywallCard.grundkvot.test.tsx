/**
 * Testväggens sekundära när dagens grundnivåtest är gjort (svepet före Black
 * Week, 2026-11-19). "Kör grundnivån igen" ledde rakt in i kvotspärren. Med
 * grundKvarIdag 0 visar kortet v4:s "I morgon"-läge (lasNivaTest, skal kvot)
 * i stället, och köpknappen står kvar.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const captureMock = vi.fn()
vi.mock('@/lib/analytics/events', () => ({
  capture: (...args: unknown[]) => captureMock(...args),
  identifyUser: vi.fn(),
}))
vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard/tester/alla' }))

import PaywallCard, { grundSlutIdag } from '../PaywallCard'
import GraValSheet from '../GraValSheet'
import { KampanjPrisProvider } from '@/components/kampanj/KampanjPrisKontext'
import { KAMPANJ_BY_NYCKEL, visning } from '@/lib/kampanj/kampanj'
import { byggGratislage, lasNivaTest } from '@/lib/tester/v4/gratis'
import { LAS_CHIP, ZON_RUBRIK } from '@/lib/tester/v4/copy'

const KNAPP = 'Köp Premium, 149 kr i månaden'
const I_MORGON = `${ZON_RUBRIK.grund} · ${LAS_CHIP.kvot}`

describe('testväggen efter dagens grundnivåtest', () => {
  beforeEach(() => captureMock.mockClear())

  it('grundSlutIdag gäller bara testniva med känd kvot 0', () => {
    expect(grundSlutIdag('testniva', 0)).toBe(true)
    expect(grundSlutIdag('testniva', 1)).toBe(false)
    expect(grundSlutIdag('testniva', null)).toBe(false)
    expect(grundSlutIdag('testniva', undefined)).toBe(false)
    expect(grundSlutIdag('mall', 0)).toBe(false)
  })

  it('kvoten kvar: "Kör grundnivån igen" står kvar som förut', () => {
    const onSecondary = vi.fn()
    render(<PaywallCard variant="testniva" plats="testniva" onSecondary={onSecondary} grundKvarIdag={1} />)
    fireEvent.click(screen.getByRole('button', { name: 'Kör grundnivån igen' }))
    expect(onSecondary).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(I_MORGON)).toBeNull()
  })

  it('kvoten slut: inget nytt grundtest, "Grundnivå · I morgon" och köpknappen kvar', () => {
    const onSecondary = vi.fn()
    const { container } = render(<PaywallCard variant="testniva" plats="testniva" onSecondary={onSecondary} grundKvarIdag={0} />)
    expect(screen.queryByText('Kör grundnivån igen')).toBeNull()
    expect(screen.getByText(I_MORGON)).toBeTruthy()
    expect(container.querySelector('[data-grund-kvot="i-morgon"]')?.tagName).toBe('SPAN')
    expect(screen.getByRole('button', { name: KNAPP })).toBeTruthy()
    // Bara köpknappen är en knapp; I morgon är status, ingen handling.
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('samma ord som v4:s låsta grundnivå när kvoten är slut', () => {
    const g = byggGratislage({ premium: false, harHistorik: false, grundIdag: 1, nivakollGjord: {}, kampanj: null })
    expect(g.grundKvarIdag).toBe(0)
    expect(lasNivaTest(g, 'grund').las?.chip).toBe(LAS_CHIP.kvot)
    render(<PaywallCard variant="testniva" onSecondary={() => {}} grundKvarIdag={g.grundKvarIdag} />)
    expect(screen.getByText(I_MORGON)).toBeTruthy()
  })

  it('under Black Week står kampanjknappen kvar bredvid I morgon', () => {
    render(
      <KampanjPrisProvider kampanj={visning(KAMPANJ_BY_NYCKEL['black-week-2026'])}>
        <PaywallCard variant="testniva" onSecondary={() => {}} grundKvarIdag={0} />
      </KampanjPrisProvider>
    )
    expect(screen.getByRole('button', { name: 'Köp Premium, 99 kr första månaden' })).toBeTruthy()
    expect(screen.getByText(I_MORGON)).toBeTruthy()
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
    expect(screen.getByText(I_MORGON)).toBeTruthy()
    expect(screen.getByRole('button', { name: KNAPP })).toBeTruthy()
  })

  it('arkets väggar med egen rubrik behåller länken Se vad som ingår', () => {
    render(<PaywallCard variant="testniva" plats="riktat" onSecondary={() => {}} grundKvarIdag={0} />)
    expect(screen.getByRole('link', { name: 'Se vad som ingår' })).toBeTruthy()
    expect(screen.queryByText(I_MORGON)).toBeNull()
  })
})

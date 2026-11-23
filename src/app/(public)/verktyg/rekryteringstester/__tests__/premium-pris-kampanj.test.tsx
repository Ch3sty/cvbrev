/**
 * Testsidans priser under Black Week (svepet 2026-11-19). Kortet "Premium tar
 * bort taket" visade statiskt "149 kr i månaden" medan kampanjen sa 99 kr.
 * Alla priser i löptext på sidan går nu genom MedKampanjPris, som ritar
 * ordinarie och varje kampanj som är kvar; KampanjHuvud väljer i webbläsaren
 * efter klockan. Datumet mockas med falska timers.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MedKampanjPris } from '@/components/kampanj/Kampanj'
import { kampanjSkript } from '@/lib/kampanj/kampanj'
import { SALD_PLAN, prisPeriod } from '@/lib/plans/plans'

const PRIS = prisPeriod(SALD_PLAN)
const SIDA = readFileSync(path.join(process.cwd(), 'src/app/(public)/verktyg/rekryteringstester/page.tsx'), 'utf8')

/** Kör head-skriptet som i webbläsaren och returnerar vald kampanj. */
function valdKampanj(nu: Date): string | null {
  document.documentElement.removeAttribute('data-kampanj')
  new Function(kampanjSkript(nu))()
  return document.documentElement.getAttribute('data-kampanj')
}

afterEach(() => {
  vi.useRealTimers()
  document.documentElement.removeAttribute('data-kampanj')
})

describe('testsidans pris följer kampanjen', () => {
  it('inget statiskt pris i löptexten, kortet går genom MedKampanjPris', () => {
    // Inget pris som eget barn i JSX, bara som text till MedKampanjPris.
    expect(SIDA).not.toMatch(/[^=]\{PRIS\}/)
    const kort = SIDA.slice(SIDA.indexOf('tar bort taket'), SIDA.indexOf('tar bort taket') + 400)
    expect(kort).toContain('<MedKampanjPris text={PRIS} />')
    expect(SIDA.match(/<MedKampanjPris text=\{PRIS\} \/>/g)?.length).toBe(3)
  })

  it('Black Week: kampanjvarianten säger 99 kr och väljs av huvudskriptet', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-24T12:00:00+01:00'))
    const { container } = render(<p>Hela din resultathistorik, <MedKampanjPris text={PRIS} />.</p>)
    // Kampanjens namn står före priset (kampanjmärket 2026-11-23, km-ord).
    expect(container.querySelector('[data-kv="black-week-2026"]')?.textContent).toBe('Black Week 99 kr första månaden, sedan 149 kr i månaden')
    expect(container.querySelector('[data-kv="black-week-2026"] .km-ord')?.textContent).toBe('Black Week')
    expect(container.querySelector('[data-kv="ord"]')?.textContent).toBe(PRIS)
    expect(valdKampanj(new Date())).toBe('black-week-2026')
  })

  it('Cyber Monday: 49 kr', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-30T10:00:00+01:00'))
    const { container } = render(<MedKampanjPris text={PRIS} />)
    expect(container.querySelector('[data-kv="cyber-monday-2026"]')?.textContent).toMatch(/^Cyber Monday 49 kr första månaden/)
    expect(container.querySelector('[data-kv="black-week-2026"]')).toBeNull()
    expect(valdKampanj(new Date())).toBe('cyber-monday-2026')
  })

  it('före kampanjen ritas varianterna men ingen väljs, ordinarie syns', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-19T12:00:00+01:00'))
    const { container } = render(<MedKampanjPris text={PRIS} />)
    expect(container.querySelector('[data-kv="black-week-2026"]')).not.toBeNull()
    expect(valdKampanj(new Date())).toBeNull()
  })

  it('efter kampanjerna: bara ordinarie, utan omslag', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-02T12:00:00+01:00'))
    const { container } = render(<MedKampanjPris text={PRIS} />)
    expect(container.textContent).toBe(PRIS)
    expect(container.querySelector('[data-kv]')).toBeNull()
  })
})

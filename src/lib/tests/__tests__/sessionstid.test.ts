/**
 * Testklockan och time_spent räknas från sessionens started_at (servertid),
 * inte från när vyn monterades. Röktestet 2026-11-19: omladdning mitt i
 * talserier grund nollade klockan och gav time_spent 1 s för en session som
 * pågick 02:06:55–02:09:24.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { renderHook, act } from '@testing-library/react'
import { sessionstid, summaUppgiftstid, TAK_SEKUNDER } from '../sessionstid'
import { formatClock, sekunderSedan, startMs, useElapsedClock } from '@/hooks/use-elapsed-clock'

const START = '2026-11-19T01:06:55.000Z'
const SLUT = Date.parse('2026-11-19T01:09:24.000Z')

describe('sessionstid', () => {
  it('en paus över natten ger summan per uppgift, högst taket', () => {
    const start = '2026-11-19T20:00:00Z'
    const nasta = Date.parse('2026-11-20T08:00:00Z')
    expect(sessionstid(start, nasta, 640)).toBe(640)
    expect(sessionstid(start, nasta, 0)).toBe(TAK_SEKUNDER)
    expect(sessionstid(start, nasta, 99999)).toBe(TAK_SEKUNDER)
  })

  it('räknar från started_at, inte summan av tiden per uppgift', () => {
    // Röktestets session: svaren summerade till 1 s.
    expect(sessionstid(START, SLUT, 1)).toBe(149)
  })

  it('tar Date och sträng lika', () => {
    expect(sessionstid(new Date(START), SLUT)).toBe(149)
  })

  it('faller tillbaka på reserven när started_at saknas eller är trasig', () => {
    expect(sessionstid(null, SLUT, 42)).toBe(42)
    expect(sessionstid(undefined, SLUT, 7.9)).toBe(7)
    expect(sessionstid('inte ett datum', SLUT, 5)).toBe(5)
    expect(sessionstid(null, SLUT)).toBe(0)
  })

  it('blir aldrig negativ när klockorna går isär', () => {
    expect(sessionstid(START, Date.parse(START) - 5000)).toBe(0)
  })

  it('summerar tiden per uppgift med båda nyckelformerna', () => {
    expect(summaUppgiftstid([{ time_spent: 3 }, { time_spent: 'x' }, null, { time_spent: 4 }])).toBe(7)
    expect(summaUppgiftstid([{ timeSpent: 2 }, { timeSpent: 5 }], 'timeSpent')).toBe(7)
    expect(summaUppgiftstid(null)).toBe(0)
  })
})

describe('klockan i vyn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(SLUT)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('startMs och sekunderSedan läser serverns tid', () => {
    expect(startMs(START)).toBe(Date.parse(START))
    expect(startMs(null)).toBeNull()
    expect(startMs('')).toBeNull()
    expect(startMs('trasig')).toBeNull()
    expect(sekunderSedan(START)).toBe(149)
    expect(sekunderSedan(null)).toBe(0)
  })

  it('en ny montering (omladdning) fortsätter från started_at i stället för 00:00', () => {
    const { result, unmount } = renderHook(() => useElapsedClock(START))
    expect(result.current).toBe(formatClock(149))
    unmount()

    // "Omladdning" fem sekunder senare: samma started_at, ny montering.
    vi.setSystemTime(SLUT + 5000)
    const igen = renderHook(() => useElapsedClock(START))
    expect(igen.result.current).toBe('02:34')
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(igen.result.current).toBe('02:35')
  })

  it('står på 00:00 tills sessionen är läst och hoppar sedan till rätt tid', () => {
    const { result, rerender } = renderHook(({ s }: { s: string | null }) => useElapsedClock(s), {
      initialProps: { s: null as string | null },
    })
    expect(result.current).toBe('00:00')
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current).toBe('00:00')
    rerender({ s: START })
    // 149 s till SLUT plus de tre sekunder hämtningen tog.
    expect(result.current).toBe('02:32')
  })
})

describe('alla testvyer och complete-rutter ankrar tiden i started_at', () => {
  const ROT = path.resolve(__dirname, '../../../..')
  const las = (p: string) => fs.readFileSync(path.join(ROT, p), 'utf8')

  const VYER = [
    'src/components/tests/steg2/Steg2TestSession.tsx',
    'src/components/tests/deduktiv/DeduktivTestSession.tsx',
    'src/components/tests/serie/FigurserieTestSession.tsx',
    'src/components/tests/matrix/MatrixTestSession.tsx',
    'src/components/tests/verbal/VerbalExpertSession.tsx',
    'src/components/tests/verbal/VerbalTestSession.tsx',
    'src/components/tests/numerical/NumericalTestSession.tsx',
  ]

  it.each(VYER)('%s startar inte klockan vid montering', (p) => {
    const text = las(p)
    expect(text).not.toMatch(/useState\(new Date\(\)\)/)
    expect(text).not.toMatch(/testStartTime/)
    expect(text).toMatch(/started_at/)
  })

  const RUTTER = [
    'steg2/[kind]',
    'deduktiv',
    'figurserier',
    'logicTestV4',
    'logicTestV6',
    'logicTestProv',
    'numericalTest',
    'numericalTestV2',
    'numericalTestExpert',
    'numericalTestProv',
    'verbalTestV1',
    'verbalTestV2',
    'verbalTestExpert',
  ]

  it.each(RUTTER)('/api/%s/complete räknar time_spent med sessionstid', (r) => {
    const text = las(`src/app/api/${r}/complete/route.ts`)
    expect(text).toMatch(/sessionstid\(session\.started_at/)
    expect(text).not.toMatch(/> 0\s*\?\s*\w+\s*:\s*Math\.floor/)
  })
})

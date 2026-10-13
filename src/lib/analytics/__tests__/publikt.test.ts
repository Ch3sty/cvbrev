/**
 * Videomätaren ska skicka varje steg en gång, även när videon loopar, och
 * alltid med device och watched_pct. Annars blir kvoterna
 * video_watched_75 / video_started meningslösa.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const captureMock = vi.fn()

vi.mock('../events', () => ({
  capture: (...args: unknown[]) => captureMock(...args),
}))

import { videoMatare, jobbkartanEvent } from '../publikt'

const bas = { page: '/verktyg/rekryteringstester', position: 'hero', variant: '169' as const }

function namn(): string[] {
  return captureMock.mock.calls.map((c) => c[0] as string)
}

describe('videoMatare', () => {
  beforeEach(() => captureMock.mockReset())

  it('skickar visad och startad en gång var', () => {
    const m = videoMatare(bas)
    m.visad()
    m.visad()
    m.startad()
    m.startad()
    expect(namn()).toEqual(['video_shown', 'video_started'])
    expect(captureMock.mock.calls[0][1]).toMatchObject({ ...bas, watched_pct: 0 })
    expect(['mobil', 'desktop']).toContain(captureMock.mock.calls[0][1].device)
  })

  it('skickar 25, 50, 75 och klar en gång genom två varv i en loop', () => {
    const m = videoMatare(bas)
    for (let varv = 0; varv < 2; varv++) {
      for (let t = 0; t <= 20; t += 0.25) m.tid(t, 20)
    }
    expect(namn()).toEqual(['video_watched_25', 'video_watched_50', 'video_watched_75', 'video_completed'])
    expect(captureMock.mock.calls[2][1].watched_pct).toBeGreaterThanOrEqual(75)
    expect(captureMock.mock.calls[3][1].watched_pct).toBe(100)
  })

  it('ignorerar okänd längd', () => {
    const m = videoMatare(bas)
    m.tid(5, NaN)
    m.tid(5, 0)
    expect(namn()).toEqual([])
  })

  it('knappen skickas varje gång med hur långt videon kommit', () => {
    const m = videoMatare(bas)
    m.tid(11, 20)
    m.ctaKlick()
    m.ctaKlick()
    expect(namn().filter((n) => n === 'video_cta_clicked')).toHaveLength(2)
    expect(captureMock.mock.calls.at(-1)?.[1]).toMatchObject({ watched_pct: 55 })
  })

  it('ljudet räknas en gång', () => {
    const m = videoMatare(bas)
    m.ljudPa()
    m.ljudPa()
    expect(namn()).toEqual(['video_sound_on'])
  })
})

describe('jobbkartanEvent', () => {
  beforeEach(() => captureMock.mockReset())

  it('skickar vidare till capture oförändrat', () => {
    jobbkartanEvent('jobbkartan_delning', { typ: 'csv' })
    expect(captureMock).toHaveBeenCalledWith('jobbkartan_delning', { typ: 'csv' })
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Serverhjälparen för PostHog. PostHog ignorerar Puppeteer, så det här är
// den enda platsen där serverhändelserna verifieras: att rätt nyckel, rätt
// distinct_id och rätt egenskaper går ut, och att ett trasigt nät aldrig
// når anroparen.

import { captureServer, timmarSedan, type CapturePayload } from '../server'

const fetchMock = vi.fn()

function sistaKroppen(): CapturePayload {
  const [, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit]
  return JSON.parse(String(init.body)) as CapturePayload
}

describe('captureServer', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = 'phc_test'
    process.env.POSTHOG_HOST = 'https://eu.posthog.com/'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
    delete process.env.POSTHOG_HOST
  })

  it('skickar subscription_paid till /capture/ med användar-id som distinct_id', () => {
    captureServer('subscription_paid', 'user-1', { plan: 'cv_week', scope: 'cv', amount_sek: 79 })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://eu.posthog.com/capture/')
    expect(init.method).toBe('POST')

    const kropp = sistaKroppen()
    expect(kropp.api_key).toBe('phc_test')
    expect(kropp.event).toBe('subscription_paid')
    expect(kropp.distinct_id).toBe('user-1')
    expect(kropp.properties).toMatchObject({ plan: 'cv_week', scope: 'cv', amount_sek: 79 })
    expect(kropp.properties.$lib).toBe('jobbcoach-server')
    expect(typeof kropp.timestamp).toBe('string')
  })

  it('skickar renewal_succeeded med plan och cycle', () => {
    captureServer('renewal_succeeded', 'user-2', { plan: 'all_week', cycle: 1 })
    expect(sistaKroppen()).toMatchObject({
      event: 'renewal_succeeded',
      distinct_id: 'user-2',
      properties: { plan: 'all_week', cycle: 1 },
    })
  })

  it('skickar onboarding_step_completed och onboarding_completed med paket och timmar', () => {
    captureServer('onboarding_step_completed', 'user-3', {
      paket: 'cv',
      step: 'cv_upp',
      index: 1,
      hours_since_purchase: 2.5,
    })
    expect(sistaKroppen().properties).toMatchObject({
      paket: 'cv',
      step: 'cv_upp',
      index: 1,
      hours_since_purchase: 2.5,
    })

    captureServer('onboarding_completed', 'user-3', { paket: 'cv', hours_since_purchase: 30 })
    expect(sistaKroppen()).toMatchObject({
      event: 'onboarding_completed',
      properties: { paket: 'cv', hours_since_purchase: 30 },
    })
  })

  it('gör ingenting utan projektnyckel', () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
    captureServer('subscription_paid', 'user-1', { plan: 'cv_week' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('gör ingenting utan distinct_id', () => {
    captureServer('subscription_paid', '', { plan: 'cv_week' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('kastar aldrig när nätet fallerar och returnerar utan att vänta', async () => {
    const varning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    fetchMock.mockRejectedValue(new Error('nere'))

    expect(() => captureServer('renewal_succeeded', 'user-1', { plan: 'cv_week', cycle: 2 })).not.toThrow()

    // Avvisningen hanteras i bakgrunden, inte i anroparens tråd.
    await Promise.resolve()
    await Promise.resolve()
    expect(varning).toHaveBeenCalled()
    varning.mockRestore()
  })

  it('kastar aldrig när fetch själv kastar synkront', () => {
    const varning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    fetchMock.mockImplementation(() => {
      throw new Error('ingen fetch')
    })
    expect(() => captureServer('subscription_paid', 'user-1', { plan: 'cv_week' })).not.toThrow()
    varning.mockRestore()
  })

  it('faller tillbaka på eu.posthog.com när ingen host är satt', () => {
    delete process.env.POSTHOG_HOST
    captureServer('subscription_paid', 'user-1', { plan: 'cv_week' })
    expect((fetchMock.mock.calls[0] as [string])[0]).toBe('https://eu.posthog.com/capture/')
  })
})

describe('timmarSedan', () => {
  const nu = new Date('2026-09-22T12:00:00Z')

  it('räknar timmar med en decimal', () => {
    expect(timmarSedan('2026-09-22T09:30:00Z', nu)).toBe(2.5)
  })

  it('ger null för saknad, trasig eller framtida tid', () => {
    expect(timmarSedan(null, nu)).toBeNull()
    expect(timmarSedan('inte ett datum', nu)).toBeNull()
    expect(timmarSedan('2026-09-23T12:00:00Z', nu)).toBeNull()
  })
})

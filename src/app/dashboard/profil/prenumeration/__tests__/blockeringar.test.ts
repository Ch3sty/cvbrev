/**
 * Blockeringslistan och förslagslogiken.
 *
 * Det bärande kravet: panelens tal ska vara summan av listan (dirigentens
 * beslut). Räknas de var för sig säger sidan emot sig själv på två rader, och
 * det är precis det testerna nedan finns för att hindra.
 */

import { describe, expect, it, vi } from 'vitest'

import { lasBlockeringar, foreslaPaket } from '../blockeringar'

/** Minsta möjliga stubbe: kedjan fram till gte().limit() och ett svar. */
function klient(rader: { metadata: { feature: string } }[] | null, error?: unknown) {
  const kedja: any = {
    select: () => kedja,
    eq: () => kedja,
    gte: () => kedja,
    limit: () => Promise.resolve({ data: rader, error: error ?? null }),
  }
  return { from: vi.fn(() => kedja) } as any
}

const rad = (feature: string) => ({ metadata: { feature } })

describe('lasBlockeringar', () => {
  it('grupperar per feature och lägger mest frekvent först', async () => {
    const res = await lasBlockeringar(
      klient([
        rad('cv_analysis'),
        rad('test:matris'),
        rad('test:verbal'),
        rad('test:numerisk'),
        rad('chat_message'),
      ]),
      'u1'
    )

    expect(res.rader[0]).toEqual({ feature: 'tests_above_base', antal: 3 })
    expect(res.rader).toHaveLength(3)
  })

  it('har ett totaltal som är exakt summan av listan', async () => {
    const res = await lasBlockeringar(
      klient([rad('cv_analysis'), rad('cv_analysis'), rad('test:matris')]),
      'u1'
    )
    const summa = res.rader.reduce((n, r) => n + r.antal, 0)
    expect(res.totalt).toBe(summa)
    expect(res.totalt).toBe(3)
  })

  it('ser när blockeringarna spänner båda spåren', async () => {
    const bada = await lasBlockeringar(klient([rad('cv_analysis'), rad('test:matris')]), 'u1')
    expect(bada.badaSparen).toBe(true)

    const ett = await lasBlockeringar(klient([rad('cv_analysis'), rad('cv_export')]), 'u1')
    expect(ett.badaSparen).toBe(false)
  })

  it('översätter kvotrutternas gamla namn till featurenamn', async () => {
    const res = await lasBlockeringar(klient([rad('letter_generation')]), 'u1')
    expect(res.rader[0].feature).toBe('letter_download')
  })

  it('släpper igenom ett featurenamn oförändrat', async () => {
    const res = await lasBlockeringar(klient([rad('bli_upptackt')]), 'u1')
    expect(res.rader[0].feature).toBe('bli_upptackt')
  })

  it('hoppar över okända namn i stället för att rita en tom rad', async () => {
    const res = await lasBlockeringar(klient([rad('nagot_helt_annat')]), 'u1')
    expect(res.rader).toHaveLength(0)
    expect(res.totalt).toBe(0)
  })

  it('räknar bara utanför scopet när ett scope anges', async () => {
    const res = await lasBlockeringar(
      klient([rad('cv_analysis'), rad('test:matris'), rad('test:verbal')]),
      'u1',
      { utanforScope: 'cv' }
    )
    // CV-analysen ingår i CV-spåret och ska inte räknas mot en CV-kund.
    expect(res.rader).toEqual([{ feature: 'tests_above_base', antal: 2 }])
  })

  it('ger en tom lista när frågan misslyckas, aldrig ett kast', async () => {
    const res = await lasBlockeringar(klient(null, { message: 'nej' }), 'u1')
    expect(res).toEqual({ rader: [], totalt: 0, badaSparen: false })
  })
})

describe('foreslaPaket', () => {
  const tomt = { rader: [], totalt: 0, badaSparen: false }

  it('följer blockeringarna före spåret', () => {
    const plan = foreslaPaket(
      { rader: [{ feature: 'tests_above_base', antal: 4 }], totalt: 4, badaSparen: false },
      'cv'
    )
    expect(plan).toBe('test_week')
  })

  it('föreslår Allt när blockeringarna spänner båda spåren', () => {
    const plan = foreslaPaket(
      {
        rader: [
          { feature: 'cv_analysis_full', antal: 2 },
          { feature: 'tests_above_base', antal: 2 },
        ],
        totalt: 4,
        badaSparen: true,
      },
      'cv'
    )
    expect(plan).toBe('all_week')
  })

  it('faller tillbaka på spåret när inget blockerat', () => {
    expect(foreslaPaket(tomt, 'cv')).toBe('cv_week')
    expect(foreslaPaket(tomt, 'tester')).toBe('test_week')
    expect(foreslaPaket(tomt, 'allt')).toBe('all_week')
  })

  it('föreslår Hela paketet när vi varken har blockeringar eller spår', () => {
    expect(foreslaPaket(tomt, null)).toBe('all_week')
  })
})

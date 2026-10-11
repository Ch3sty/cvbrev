// Kvittomejlet (docs/qa/qa-kop-testlage-2026-09-24.md, bugg 4). Webhooken
// lägger raden receipt_<event.id>, så registret måste hitta mallen ur den,
// och texterna ska följa docs/design/copy-premium-2026-10-11.md avsnitt 3:
// ämnet "Kvitto: Jobbcoach Premium, 149 kr", längden på raden Prenumeration.
import { describe, it, expect } from 'vitest'
import { resolveLifecycleEmail } from '../registry'
import type { LifecycleContext } from '../types'
import { ANGERRATT_RAD } from '../templates/vecka'

const ctx = (metadata: Record<string, unknown>): LifecycleContext =>
  ({
    admin: {} as never,
    userId: 'u1',
    profile: { id: 'u1', email: 'a@b.se', full_name: 'Anna' } as never,
    metadata,
  }) as LifecycleContext

describe('kvittot', () => {
  it('registret hittar mallen ur receipt_<event.id>', () => {
    expect(resolveLifecycleEmail('receipt_evt_1UJ6K4PWMWdjmTDj')?.type).toBe('receipt')
    expect(resolveLifecycleEmail('payment_failed_evt_1ABC')?.type).toBe('payment_failed')
    expect(resolveLifecycleEmail('receipt_evt_')).toBeNull()
  })

  it.each([
    ['cv_week', 79, 'Kvitto: CV-paketet, 79 kr'],
    ['test_week', 79, 'Kvitto: Träningspaketet, 79 kr'],
    ['all_day', 49, 'Kvitto: Dagspasset, 49 kr'],
    ['all_week', 99, 'Kvitto: Jobbcoach Premium, 99 kr'],
    ['all_month', 149, 'Kvitto: Jobbcoach Premium, 149 kr'],
    ['all_quarter', 299, 'Kvitto: Jobbcoach Premium, 299 kr'],
  ])('%s ger ämnet "%s"', async (planKey, amount, amne) => {
    const mall = resolveLifecycleEmail('receipt_evt_test')!
    const r = await mall.render(
      ctx({ planKey, amount, periodStart: '2026-09-24T08:00:00Z', periodEnd: '2026-10-24T08:00:00Z' })
    )
    expect(r.subject).toBe(amne)
  })

  it('månadskvittot har copy-premiums rubrik, brödtext och rader, ångerrätten sist', async () => {
    const mall = resolveLifecycleEmail('receipt_evt_test')!
    const r = await mall.render(
      ctx({ planKey: 'all_month', amount: 149, periodStart: '2026-10-11T08:00:00Z', periodEnd: '2026-11-11T08:00:00Z' })
    )
    expect(r.subject).toBe('Kvitto: Jobbcoach Premium, 149 kr')
    expect(r.html).toContain('Kvitto för Jobbcoach Premium')
    expect(r.html).toContain(
      'Här är kvittot på 149 kr för Jobbcoach Premium. Perioden gäller 11 oktober till 11 november och dras sedan varje månad på samma datum, tills du säger upp. Det gör du i ditt konto under Prenumeration.'
    )
    const rader = [
      'Belopp: 149 kr inklusive moms',
      'Prenumeration: Jobbcoach Premium, en månad',
      'Period: 11 oktober till 11 november',
      'Nästa dragning: 11 november',
      ANGERRATT_RAD,
    ]
    let forra = -1
    for (const rad of rader) {
      const i = r.html.indexOf(rad)
      expect(i, rad).toBeGreaterThan(forra)
      forra = i
    }
    expect(ANGERRATT_RAD).toBe(
      'Du valde att starta direkt, så ångerrätten på fjorton dagar gäller inte. Säg upp när du vill, då dras inget mer.'
    )
    expect(r.html).not.toContain('Paket:')
  })

  it('en befintlig veckokund får sin längd på raden: "Jobbcoach Premium, en vecka"', async () => {
    const mall = resolveLifecycleEmail('receipt_evt_test')!
    const r = await mall.render(
      ctx({ planKey: 'all_week', amount: 99, periodStart: '2026-10-11T08:00:00Z', periodEnd: '2026-10-18T08:00:00Z' })
    )
    expect(r.html).toContain('Prenumeration: Jobbcoach Premium, en vecka')
    expect(r.html).toContain('dras sedan var sjunde dag, tills du säger upp')
  })

  it('ett gammalt planName utan planKey skriver det nya namnet', async () => {
    const mall = resolveLifecycleEmail('receipt_evt_test')!
    const r = await mall.render(
      ctx({ planName: 'Hela paketet', amount: 149, periodStart: '2026-10-11T08:00:00Z', periodEnd: '2026-11-11T08:00:00Z' })
    )
    expect(r.subject).toBe('Kvitto: Jobbcoach Premium, 149 kr')
    expect(r.html).not.toMatch(/Hela paketet/)
  })

  it('uppsägningskvittot: ämne med datumet och rubriken utan veckan', async () => {
    const mall = resolveLifecycleEmail('canceled_until_sunday')!
    const r = await mall.render(ctx({ planKey: 'all_month', periodEnd: '2026-11-11T08:00:00Z' }))
    expect(r.subject).toBe('Uppsagt. Jobbcoach Premium gäller till 11 november.')
    expect(r.html).toContain('Uppsagt, och perioden gäller ut')
    expect(r.html).toContain('Premium gäller till och med 11 november')
    expect(`${r.subject} ${r.html}`).not.toMatch(/söndag|[Vv]eckan gäller/)
  })

  it('inga förbjudna ord i kvittot eller uppsägningen (copy-premium avsnitt 2)', async () => {
    const kvitto = await resolveLifecycleEmail('receipt_evt_test')!.render(
      ctx({ planKey: 'all_month', amount: 149, periodStart: '2026-10-11T08:00:00Z', periodEnd: '2026-11-11T08:00:00Z' })
    )
    const uppsagt = await resolveLifecycleEmail('canceled_until_sunday')!.render(
      ctx({ planKey: 'all_month', periodEnd: '2026-11-11T08:00:00Z' })
    )
    for (const r of [kvitto, uppsagt]) {
      const text = `${r.subject} ${r.preheader} ${r.html}`
      expect(text).not.toMatch(/Hela paketet|paketen|ett paket|Uppgradera|Premium-|149 kr\/mån|per månad|—/)
    }
  })

  it('är transaktionellt, så opt-out stoppar det inte', () => {
    expect(resolveLifecycleEmail('receipt_evt_x')?.transactional).toBe(true)
  })
})

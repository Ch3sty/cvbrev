// Kvittomejlet (docs/qa/qa-kop-testlage-2026-09-24.md, bugg 4). Webhooken
// lägger raden receipt_<event.id>, så registret måste hitta mallen ur den,
// och ämnet ska följa regeln "Kvitto: Hela paketet, en månad, 149 kr".
import { describe, it, expect } from 'vitest'
import { resolveLifecycleEmail } from '../registry'
import type { LifecycleContext } from '../types'

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
    ['all_week', 99, 'Kvitto: Hela paketet, en vecka, 99 kr'],
    ['all_month', 149, 'Kvitto: Hela paketet, en månad, 149 kr'],
    ['all_quarter', 299, 'Kvitto: Hela paketet, ett kvartal, 299 kr'],
  ])('%s ger ämnet "%s"', async (planKey, amount, amne) => {
    const mall = resolveLifecycleEmail('receipt_evt_test')!
    const r = await mall.render(
      ctx({ planKey, amount, periodStart: '2026-09-24T08:00:00Z', periodEnd: '2026-10-24T08:00:00Z' })
    )
    expect(r.subject).toBe(amne)
  })

  it('är transaktionellt, så opt-out stoppar det inte', () => {
    expect(resolveLifecycleEmail('receipt_evt_x')?.transactional).toBe(true)
  })
})

/**
 * Bli upptäckt och LinkedIn: texterna ska säga att funktionen ingår i
 * Jobbcoach Premium (copy-vag5 avsnitt 6.2 och 8, copy-premium). FAQ-datan
 * blir också FAQPage-schema, så en osann rad här syns i Googles resultat.
 */
import { describe, expect, it } from 'vitest'

import { PLAN_BY_KEY, SALD_PLAN, paketMedPris } from '@/lib/plans/plans'
import { BLI_UPPTACKT_FAQ_ITEMS } from '@/app/(public)/verktyg/bli-upptackt/components/bli-upptackt-faq-data'
import { LINKEDIN_OPTIMERING_FAQ_ITEMS } from '@/app/(public)/verktyg/linkedin-optimering/components/linkedin-optimering-faq-data'

const allt = (items: { q: string; a: string }[]) => items.map((i) => `${i.q} ${i.a}`).join('\n')
const antal = (text: string, del: string) => text.split(del).length - 1

describe('Bli upptäckt: gratis för alla sedan 2026-11-15 (saas-lead)', () => {
  const text = allt(BLI_UPPTACKT_FAQ_ITEMS)
  it('kostnadsfrågan säger att det inte kostar något, utan pris', () => {
    const kostnad = BLI_UPPTACKT_FAQ_ITEMS.find((i) => /kostar/i.test(i.q))
    expect(kostnad).toBeDefined()
    expect(kostnad!.a).toMatch(/^Ingenting./)
    expect(kostnad!.a).not.toMatch(/d+ kr/)
  })
  it('ingenting säger att synligheten ingår i Premium', () => {
    expect(text).not.toMatch(/synligheten ingår|ingår i Jobbcoach Premium, 149/i)
    expect(text).not.toContain(paketMedPris(SALD_PLAN))
  })
})

describe('LinkedIn: optimeringen ingår i Jobbcoach Premium', () => {
  const text = allt(LINKEDIN_OPTIMERING_FAQ_ITEMS)
  it('ingen gratis optimering i veckan', () => {
    expect(text).not.toMatch(/gratis optimering|optimering i veckan är gratis|1 optimering gratis/i)
  })
  it('kostnadsfrågan nämner Jobbcoach Premium med priset ur PLANS, inga gamla paket', () => {
    const kostnad = LINKEDIN_OPTIMERING_FAQ_ITEMS.find((i) => /kostar|gratis/i.test(i.q))
    expect(kostnad).toBeDefined()
    expect(kostnad!.a).toContain(paketMedPris(SALD_PLAN))
    expect(kostnad!.a).not.toContain(PLAN_BY_KEY.cv_week.name)
    expect(kostnad!.a).not.toContain(`${PLAN_BY_KEY.cv_week.amount} kr`)
    expect(kostnad!.a).not.toContain(`${PLAN_BY_KEY.all_week.amount} kr`)
  })
  it('inga talstreck', () => {
    expect(text).not.toMatch(/[–—]/)
  })
})

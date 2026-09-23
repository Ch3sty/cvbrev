/**
 * Bli upptäckt och LinkedIn: texterna ska säga vilket paket funktionen
 * ingår i (ägarens beslut 2026-09-23, docs/bygg-noter-paket.md,
 * "Efterarbete: avgjort"). FAQ-datan blir också FAQPage-schema, så en
 * osann rad här syns i Googles resultat.
 */
import { describe, expect, it } from 'vitest'

import { PLAN_BY_KEY } from '@/lib/plans/plans'
import { BLI_UPPTACKT_FAQ_ITEMS } from '@/app/(public)/verktyg/bli-upptackt/components/bli-upptackt-faq-data'
import { LINKEDIN_OPTIMERING_FAQ_ITEMS } from '@/app/(public)/verktyg/linkedin-optimering/components/linkedin-optimering-faq-data'

const allt = (items: { q: string; a: string }[]) => items.map((i) => `${i.q} ${i.a}`).join('\n')

describe('Bli upptäckt: synligheten ingår i Hela paketet', () => {
  const text = allt(BLI_UPPTACKT_FAQ_ITEMS)
  it('en fråga säger vad det kostar, med Hela paketets priser ur PLANS', () => {
    const kostnad = BLI_UPPTACKT_FAQ_ITEMS.find((i) => /kostar/i.test(i.q))
    expect(kostnad).toBeDefined()
    expect(kostnad!.a).toContain(`${PLAN_BY_KEY.all_week.amount} kr`)
    expect(kostnad!.a).toContain(`${PLAN_BY_KEY.all_month.amount} kr`)
    expect(kostnad!.a).toContain(PLAN_BY_KEY.all_week.name)
  })
  it('ingenting säger att det är gratis att synas', () => {
    expect(text).not.toMatch(/gratis att synas|kostar ingenting|synas gratis/i)
  })
})

describe('LinkedIn: optimeringen ingår i CV-paketet och Hela paketet', () => {
  const text = allt(LINKEDIN_OPTIMERING_FAQ_ITEMS)
  it('ingen gratis optimering i veckan', () => {
    expect(text).not.toMatch(/gratis optimering|optimering i veckan är gratis|1 optimering gratis/i)
  })
  it('kostnadsfrågan nämner CV-paketet och Hela paketet med priser ur PLANS', () => {
    const kostnad = LINKEDIN_OPTIMERING_FAQ_ITEMS.find((i) => /kostar|gratis/i.test(i.q))
    expect(kostnad).toBeDefined()
    expect(kostnad!.a).toContain(PLAN_BY_KEY.cv_week.name)
    expect(kostnad!.a).toContain(`${PLAN_BY_KEY.cv_week.amount} kr`)
    expect(kostnad!.a).toContain(`${PLAN_BY_KEY.all_week.amount} kr`)
    expect(kostnad!.a).toContain(`${PLAN_BY_KEY.all_month.amount} kr`)
  })
  it('inga talstreck', () => {
    expect(text).not.toMatch(/[–—]/)
  })
})

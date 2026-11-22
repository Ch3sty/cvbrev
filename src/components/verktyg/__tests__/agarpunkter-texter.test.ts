/**
 * De publika texterna i beslut-agarpunkter punkt 2 (2026-11-22) som förs in
 * före S-1: Öppen profil på Bli upptäckt och för rekryterare, de två nya
 * FAQ-svaren och delningslänkens tal ur konstanten.
 */
import { describe, expect, it } from 'vitest'

import { BLI_UPPTACKT_FAQ_ITEMS } from '@/app/(public)/verktyg/bli-upptackt/components/bli-upptackt-faq-data'
import { REKRYTERARE_FAQ_ITEMS } from '@/app/(public)/for-rekryterare/components/rekryterare-faq-data'
import { JOBBCOACHEN_FAQ_ITEMS } from '@/app/(public)/verktyg/jobbcoachen/components/jobbcoachen-faq-data'
import { FRAGOR } from '@/app/(public)/verktyg/sokta-tjanster/sokta-tjanster-data'
import { APPLICATION_SHARE_TTL_DAYS } from '@/lib/applications/shareTtl'
import { APPLICATION_SHARE_TTL_DAYS as TTL_I_LANKARNA } from '@/lib/applications/shareLinks'

describe('Öppen profil (D-10)', () => {
  it('chefsfrågan säger att det gäller i Anonym först', () => {
    const svar = BLI_UPPTACKT_FAQ_ITEMS.find((i) => i.q === 'Kan min nuvarande chef se att jag är synlig?')!.a
    expect(svar).toBe(
      'Nej, inte i läget Anonym först, som är förvalt. Där döljer vi vilka företag du har jobbat på, så din arbetsgivare kan inte hitta eller känna igen din profil även om de letar i kandidatpoolen. Väljer du Öppen profil syns ditt namn och dina arbetsgivare direkt.'
    )
  })

  it('rekryterarens svar säger att namn och arbetsgivare syns i Öppen profil', () => {
    const svar = REKRYTERARE_FAQ_ITEMS.find((i) => i.q === 'Vad ser vi om en kandidat?')!.a
    expect(svar).toContain('Namn och arbetsgivare är dolda tills kandidaten tackat ja, om hen inte själv har valt Öppen profil, och kontaktuppgifterna visas alltid först efter ett ja.')
    expect(svar).not.toMatch(/foto/)
  })

  it('GDPR-svaret säger lagring i Irland, inte all data', () => {
    const svar = REKRYTERARE_FAQ_ITEMS.find((i) => i.q === 'Hur funkar det med GDPR?')!.a
    expect(svar).toContain('Kandidatprofilerna lagras i EU, i Irland')
    expect(svar).not.toMatch(/All data lagras/)
  })
})

describe('de nya FAQ-svaren (D-11, D-12)', () => {
  it('Sökta tjänster har nio frågor, den nya sist, med talet ur konstanten', () => {
    expect(FRAGOR).toHaveLength(9)
    const sista = FRAGOR[FRAGOR.length - 1]
    expect(sista.q).toBe('Vem kan se mina sökta tjänster?')
    expect(sista.a).toContain(`i ${APPLICATION_SHARE_TTL_DAYS} dagar.`)
    expect(APPLICATION_SHARE_TTL_DAYS).toBe(TTL_I_LANKARNA)
    expect(APPLICATION_SHARE_TTL_DAYS).toBe(30)
  })

  it('Jobbcoachen har frågan efter frågan om att dela CV:t', () => {
    const i = JOBBCOACHEN_FAQ_ITEMS.findIndex((f) => f.q === 'Vad vet Jobbcoachen om mig?')
    expect(i).toBeGreaterThan(0)
    expect(JOBBCOACHEN_FAQ_ITEMS[i - 1].q).toBe('Kan jag dela mitt CV med Jobbcoachen?')
    expect(JOBBCOACHEN_FAQ_ITEMS[i].a).toMatch(/^Det du har skrivit i profilen om målroll, ort och bransch/)
  })
})

describe('säkerhetssvaren efter S-1 (D-3, D-4)', () => {
  it('cv-analysen och brevet säger lagring i Irland och sju år hos Stripe, inte all data', async () => {
    const { CV_ANALYS_FAQ_ITEMS } = await import('@/app/(public)/verktyg/cv-analys/components/cv-analys-faq-data')
    const { BREV_FAQ_ITEMS } = await import('@/app/(public)/verktyg/personligt-brev/components/brev-faq-data')
    const cv = CV_ANALYS_FAQ_ITEMS.find((i) => i.q === 'Är mitt CV säkert hos er?')!.a
    const brev = BREV_FAQ_ITEMS.find((i) => i.q === 'Är det säkert att lämna mitt CV och era brev?')!.a
    expect(cv).toContain('CV-filen och texten lagras i EU, i Irland, i en lagring som bara ditt konto når.')
    for (const a of [cv, brev]) {
      expect(a).toContain('Kvitton finns kvar hos Stripe i sju år, som bokföringslagen kräver.')
      expect(a).not.toMatch(/all data lagras/)
    }
  })
})

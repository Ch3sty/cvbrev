/**
 * Strukturerad data för /priser: Product med AggregateOffer och FAQPage
 * (copy-premium avsnitt 3, ägarens beslut 2026-10-11).
 *
 * Bara säljbara planer (SALJBARA_PLANER): i dag en rad, Jobbcoach Premium
 * per månad, så offerCount är 1 och lowPrice är lika med highPrice. Schemat
 * och kortet läser samma rad i PLANS och kan inte säga olika saker. Inga
 * betyg (aggregateRating) och inga citat.
 *
 * Egen fil eftersom en page.tsx bara får exportera det Next.js känner igen.
 */

import { PRISER_FAQ_ITEMS, PRISER_META, PREMIUM_CURRENCY } from './priser-data'
import { PLAN_BY_KEY, SALD_PLAN, SALJBARA_PLANER, paketMedLangd, paketNamn } from '@/lib/plans/plans'
import { PAKET_RAD } from '@/components/pricing/paket-copy'

const URL = PRISER_META.url
const TILLGANGLIG = 'https://schema.org/InStock'
const SALJARE = { '@type': 'Organization', name: 'Jobbcoach.ai', url: 'https://www.jobbcoach.ai' }

/** Stripes period som enhetskod i UN/CEFACT: MON per månad, WEE per vecka. */
const PERIODKOD = { dag: 'DAY', vecka: 'WEE', 'månad': 'MON', kvartal: 'QAN' } as const

export function prisSchema() {
  const belopp = SALJBARA_PLANER.map((p) => p.amount)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: paketNamn(SALD_PLAN),
    description: PLAN_BY_KEY[SALD_PLAN].beskrivning,
    brand: { '@type': 'Brand', name: 'Jobbcoach.ai' },
    url: URL,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: PREMIUM_CURRENCY,
      lowPrice: Math.min(...belopp),
      highPrice: Math.max(...belopp),
      offerCount: SALJBARA_PLANER.length,
      availability: TILLGANGLIG,
      offers: SALJBARA_PLANER.map((plan) => ({
        '@type': 'Offer',
        name: paketMedLangd(plan.key),
        description: PAKET_RAD[plan.key],
        price: plan.amount,
        priceCurrency: PREMIUM_CURRENCY,
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: plan.amount,
          priceCurrency: PREMIUM_CURRENCY,
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: 1,
            unitCode: PERIODKOD[plan.length],
          },
        },
        url: URL,
        availability: TILLGANGLIG,
        seller: SALJARE,
      })),
    },
  }
}

export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PRISER_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

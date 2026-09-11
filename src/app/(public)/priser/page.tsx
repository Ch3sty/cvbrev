/**
 * /priser - landningssida i orange/rod-DNA.
 * Sektioner: Hero -> Pris-kort (Free + Premium) -> Jamforelsetabell ->
 * Vad ingar (8 funktioner) -> FAQ -> Final CTA-band.
 * SEO: Product + Offer + FAQPage JSON-LD.
 */
import Breadcrumb from '@/components/Breadcrumb'
import PriserHero from './components/PriserHero'
import PriserKort from './components/PriserKort'
import PriserJamforelse from './components/PriserJamforelse'
import PriserVadIngar from './components/PriserVadIngar'
import PriserFAQ from './components/PriserFAQ'
import PriserCTABand from './components/PriserCTABand'
import {
  PRISER_FAQ_ITEMS,
  PREMIUM_PRICE,
  PREMIUM_CURRENCY,
} from './components/priser-data'
import { PLANS } from '@/lib/plans/plans'

export default function PriserSida() {
  // === Schema.org markup ===
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Jobbcoach.ai Premium',
    description:
      'Allt-i-ett-plattform för svensk jobbsökning: obegränsade personliga brev och CV-analyser, alla CV-mallar, Smart-anpassad ton, LinkedIn-optimering, jobbmatchning och rekryteringstester.',
    brand: {
      '@type': 'Brand',
      name: 'Jobbcoach.ai',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://www.jobbcoach.ai/priser',
      price: PREMIUM_PRICE,
      priceCurrency: PREMIUM_CURRENCY,
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: PREMIUM_PRICE,
        priceCurrency: PREMIUM_CURRENCY,
        billingDuration: 'P1M',
        unitCode: 'MON',
      },
      seller: {
        '@type': 'Organization',
        name: 'Jobbcoach.ai',
      },
    },
  }

  // A7: fyra produkter, inte en. Prisstegen kommer från PLANS så schemat
  // aldrig glider isär från korten.
  const offerSchema = {
    '@context': 'https://schema.org',
    '@type': 'AggregateOffer',
    name: 'Jobbcoach.ai Premium',
    url: 'https://www.jobbcoach.ai/priser',
    priceCurrency: PREMIUM_CURRENCY,
    lowPrice: Math.min(...PLANS.map((p) => p.amount)),
    highPrice: Math.max(...PLANS.map((p) => p.amount)),
    offerCount: PLANS.length,
    availability: 'https://schema.org/InStock',
    offers: PLANS.map((plan) => ({
      '@type': 'Offer',
      name: `Jobbcoach.ai Premium ${plan.name}`,
      description: plan.body,
      price: plan.amount,
      priceCurrency: PREMIUM_CURRENCY,
      url: 'https://www.jobbcoach.ai/priser',
      availability: 'https://schema.org/InStock',
    })),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PRISER_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        // Ett par svar innehåller en länk i copyn. Schemat vill ha ren text.
        text: item.a.replace(/<[^>]+>/g, ''),
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumb
            items={[
              { name: 'Hem', href: '/' },
              { name: 'Priser', href: '/priser' },
            ]}
          />
        </div>

        <PriserHero />
        <PriserKort />
        <PriserJamforelse />
        <PriserVadIngar />
        <PriserFAQ />
        <PriserCTABand />
      </main>
    </>
  )
}

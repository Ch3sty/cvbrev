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
  TRIAL_DAYS,
} from './components/priser-data'

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
      url: 'https://jobbcoach.ai/priser',
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1400',
      bestRating: '5',
      worstRating: '1',
    },
  }

  const offerSchema = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: `Jobbcoach.ai Premium ${TRIAL_DAYS} dagar gratis trial`,
    description: `Prova Premium gratis i ${TRIAL_DAYS} dagar utan att lämna kortuppgifter. Därefter ${PREMIUM_PRICE} kr per månad. Avsluta när som helst.`,
    price: PREMIUM_PRICE,
    priceCurrency: PREMIUM_CURRENCY,
    url: 'https://jobbcoach.ai/trial-signup',
    availability: 'https://schema.org/InStock',
    eligibleDuration: {
      '@type': 'QuantitativeValue',
      value: TRIAL_DAYS,
      unitCode: 'DAY',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PRISER_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
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

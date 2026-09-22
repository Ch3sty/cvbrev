/**
 * /priser (docs/plan-paket-och-onboarding.md, Fas 2D avsnitt 2).
 *
 * Sex sektioner, och ordningen är argumentet: först vad man väljer mellan,
 * sedan vad det kostar, sedan vad gratis ger, sedan detaljerna, sedan
 * frågorna, sist förtroendet.
 *
 * Serverrenderad rakt igenom. Spårväljaren och Allt-kortets längdval är det
 * enda som behöver JavaScript, och utan det visar Allt-kortet sitt veckoläge,
 * som är förvalt. Korten, tabellen, alla fem FAQ-svaren och förtroenderaden
 * står i HTML.
 *
 * SEO: FAQPage och AggregateOffer, med samma priser som korten eftersom båda
 * läser PLANS.
 */

import Breadcrumb from '@/components/Breadcrumb'
import PriserHero from './components/PriserHero'
import PriserPaket from './components/PriserPaket'
import PriserGratis from './components/PriserGratis'
import PriserJamforelse from './components/PriserJamforelse'
import PriserFAQ from './components/PriserFAQ'
import PriserFortroende from './components/PriserFortroende'
import PriserMatning from './components/PriserMatning'
import { PRISER_FAQ_ITEMS, PREMIUM_CURRENCY } from './components/priser-data'
import { PLANS } from '@/lib/plans/plans'
import { PAKET_RAD } from '@/components/pricing/paket-copy'

// Samma dygn som resten av (public). Sidan har ingen besökarspecifik data:
// inloggningen läses i klienten, så CDN:et får behålla svaret.
export const revalidate = 86400

const URL = 'https://www.jobbcoach.ai/priser'

export default function PriserSida() {
  const offerSchema = {
    '@context': 'https://schema.org',
    '@type': 'AggregateOffer',
    name: 'Jobbcoach.ai',
    url: URL,
    priceCurrency: PREMIUM_CURRENCY,
    lowPrice: Math.min(...PLANS.map((p) => p.amount)),
    highPrice: Math.max(...PLANS.map((p) => p.amount)),
    offerCount: PLANS.length,
    availability: 'https://schema.org/InStock',
    offers: PLANS.map((plan) => ({
      '@type': 'Offer',
      name: plan.name,
      description: PAKET_RAD[plan.key],
      price: plan.amount,
      priceCurrency: PREMIUM_CURRENCY,
      url: URL,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Jobbcoach.ai' },
    })),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PRISER_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="min-h-screen bg-mark">
        <div className="mx-auto max-w-[1040px] px-4 pb-12 pt-6 sm:px-6">
          <Breadcrumb
            items={[
              { name: 'Hem', href: '/' },
              { name: 'Priser', href: '/priser' },
            ]}
          />

          <div className="mt-6 space-y-12">
            <div>
              <PriserHero />
              <PriserPaket />
            </div>

            <PriserGratis />
            <PriserJamforelse />
            <PriserFAQ />
            <PriserFortroende />
          </div>
        </div>
      </main>

      <PriserMatning />
    </>
  )
}

/**
 * /priser (docs/design/spec-prissida-2026-09-22.html, sektion 1 och 2).
 *
 * Ordningen är argumentet: hero med löftena, tre paket, gratisraden,
 * funktionerna en och en, hjälpredan per paket, förtroendekorten, tabellen
 * rad för rad och frågorna.
 *
 * Serverrenderad rakt igenom. Knapparna och Hela paketets längdval är det
 * enda som behöver JavaScript, och utan det visar Hela paketets kort sitt
 * veckoläge, som är förvalt. Korten, tabellen, alla fyra FAQ-svaren och
 * förtroendekorten står i HTML.
 *
 * SEO: FAQPage och AggregateOffer, med samma priser som korten eftersom
 * båda läser PLANS.
 */

import PriserHero from './components/PriserHero'
import PriserPaket from './components/PriserPaket'
import PriserGratis from './components/PriserGratis'
import PriserFunktioner from './components/PriserFunktioner'
import PriserGuide from './components/PriserGuide'
import PriserFortroende from './components/PriserFortroende'
import PriserJamforelse from './components/PriserJamforelse'
import PriserFAQ from './components/PriserFAQ'
import PriserMatning from './components/PriserMatning'
import { PRISER_FAQ_ITEMS, PREMIUM_CURRENCY } from './components/priser-data'
import { PLANS, paketMedLangd } from '@/lib/plans/plans'
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
      name: paketMedLangd(plan.key),
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
        <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 sm:px-6 lg:px-12 lg:pb-[72px] lg:pt-16">
          <PriserHero />
          <PriserPaket />
          <PriserGratis />
          <PriserFunktioner />
          <PriserGuide />
          <PriserFortroende />
          <PriserJamforelse />
          <PriserFAQ />
        </div>
      </main>

      <PriserMatning />
    </>
  )
}

/**
 * /for-rekryterare — publik B2B-landningssida i orange/röd-DNA.
 * Sektioner: Hero (med exempelkort) → Värdeprops → Så funkar det →
 * Exempelkort → Hela profilen (detaljmock) → Trust (GDPR) → FAQ → Final CTA-band.
 * CTA leder till /rekryterare/registrera (beta utan betalning).
 */
import Breadcrumb from '@/components/Breadcrumb'
import RekryterareHero from './components/RekryterareHero'
import ProductTour from './components/ProductTour'
import RekryterareVardeprops from './components/RekryterareVardeprops'
import RekryterareTestIntegritet from './components/RekryterareTestIntegritet'
import RekryterareSaFunkar from './components/RekryterareSaFunkar'
import RekryterareExempel from './components/RekryterareExempel'
import RekryterareProfilExempel from './components/RekryterareProfilExempel'
import RekryterareTrust from './components/RekryterareTrust'
import RekryterareFAQ from './components/RekryterareFAQ'
import RekryterareInsikter from './components/RekryterareInsikter'
import RekryterareCTABand from './components/RekryterareCTABand'
import { REKRYTERARE_FAQ_ITEMS } from './components/rekryterare-faq-data'

export default function ForRekryterareSida() {
  // === Schema.org markup ===
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Jobbcoach.ai kandidatpool för rekryterare',
    url: 'https://www.jobbcoach.ai/for-rekryterare',
    description:
      'Kandidatpool där varje profil har verifierade testresultat med percentiler. Anonymt tills kandidaten accepterar kontakt. Kostnadsfritt för verifierade rekryterare under lanseringsperioden.',
    serviceType: 'Rekryteringstjänst',
    areaServed: {
      '@type': 'Country',
      name: 'Sverige',
    },
    provider: {
      '@type': 'Organization',
      name: 'Jobbcoach.ai',
      url: 'https://www.jobbcoach.ai',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Kostnadsfritt under lanseringsperioden för verifierade rekryterare',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: REKRYTERARE_FAQ_ITEMS.map((item) => ({
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
      {/* Strukturerad data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="bg-white min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumb
            items={[
              { name: 'Hem', href: '/' },
              { name: 'För rekryterare', href: '/for-rekryterare' },
            ]}
          />
        </div>

        {/* Sektioner */}
        <RekryterareHero />
        <ProductTour />
        <RekryterareVardeprops />
        <RekryterareTestIntegritet />
        <RekryterareSaFunkar />
        <RekryterareExempel />
        <RekryterareProfilExempel />
        <RekryterareTrust />
        <RekryterareInsikter />
        <RekryterareFAQ />
        <RekryterareCTABand />
      </main>
    </>
  )
}

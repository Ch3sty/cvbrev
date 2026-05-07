/**
 * /verktyg/personligt-brev — landningssida i orange/röd-DNA.
 * Sektioner: Hero (med live-demo) → Så funkar det → Mallgalleri →
 * Resultat-bevis → Skrivtips → FAQ → Final CTA-band.
 * Behåller stark SEO: 3 JSON-LD-scheman + Breadcrumb-schema.
 */
import Breadcrumb from '@/components/Breadcrumb'
import BrevHero from './components/BrevHero'
import BrevHurFunkar from './components/BrevHurFunkar'
import BrevMallGalleri from './components/BrevMallGalleri'
import BrevResultatBevis from './components/BrevResultatBevis'
import BrevSkrivtips from './components/BrevSkrivtips'
import BrevFAQ from './components/BrevFAQ'
import { BREV_FAQ_ITEMS } from './components/brev-faq-data'
import BrevCTABand from './components/BrevCTABand'

export default function PersonligtBrevSida() {
  // === Schema.org markup ===
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai Personligt brev-verktyg',
    url: 'https://www.jobbcoach.ai/verktyg/personligt-brev',
    description:
      'Skräddarsy personliga brev som matchar jobbannonsen. Sju mallar, sex tonaliteter, ATS-optimerat. Export som PDF eller Word.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '5 brev gratis varje vecka, ingen kortuppgift',
    },
    featureList:
      '7 brevmallar, 6 tonaliteter, ATS-optimerat, PDF- och Word-export, sparade brev, jobbannons-matchning, svensk- och engelskspråkigt',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1400',
      bestRating: '5',
      worstRating: '1',
    },
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så skapar du ett personligt brev med Jobbcoach.ai',
    description:
      'Fyra steg från tomt papper till färdig ansökan: välj CV, klistra in annons, välj mall och ton, ladda ner.',
    totalTime: 'PT4M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Välj ditt CV',
        text:
          'Ladda upp eller välj ett CV du redan sparat. Vår tjänst plockar ut din erfarenhet och dina styrkor.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Klistra in jobbannonsen',
        text:
          'Vi läser annonsen, identifierar nyckelkraven och matchar dem mot din bakgrund.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Välj mall och ton',
        text:
          'Sju mallar för olika branscher och sex tonalitetsval, från professionellt till entusiastiskt.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Ladda ner som PDF eller Word',
        text:
          'Granska, finjustera om du vill, exportera. Spara brevet i ditt konto för senare.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: BREV_FAQ_ITEMS.map((item) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
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
              { name: 'Verktyg', href: '/funktioner' },
              {
                name: 'Personligt brev',
                href: '/verktyg/personligt-brev',
              },
            ]}
          />
        </div>

        {/* Sektioner */}
        <BrevHero />
        <BrevHurFunkar />
        <BrevMallGalleri />
        <BrevResultatBevis />
        <BrevSkrivtips />
        <BrevFAQ />
        <BrevCTABand />
      </main>
    </>
  )
}

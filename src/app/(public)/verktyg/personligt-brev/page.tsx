/**
 * /verktyg/personligt-brev â€” landningssida i orange/rÃ¶d-DNA.
 * Sektioner: Hero (med live-demo) â†’ SÃ¥ funkar det â†’ Mallgalleri â†’
 * Resultat-bevis â†’ Skrivtips â†’ FAQ â†’ Final CTA-band.
 * BehÃ¥ller stark SEO: 3 JSON-LD-scheman + Breadcrumb-schema.
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
      'SkrÃ¤ddarsy personliga brev som matchar jobbannonsen. Sju mallar, sex tonaliteter, ATS-optimerat. Export som PDF eller Word.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '5 brev gratis varje vecka, ingen kortuppgift',
    },
    featureList:
      '7 brevmallar, 6 tonaliteter, ATS-optimerat, PDF- och Word-export, sparade brev, jobbannons-matchning, svensk- och engelsksprÃ¥kigt',
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
    name: 'SÃ¥ skapar du ett personligt brev med Jobbcoach.ai',
    description:
      'Fyra steg frÃ¥n tomt papper till fÃ¤rdig ansÃ¶kan: vÃ¤lj CV, klistra in annons, vÃ¤lj mall och ton, ladda ner.',
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
        name: 'VÃ¤lj ditt CV',
        text:
          'Ladda upp eller vÃ¤lj ett CV du redan sparat. VÃ¥r tjÃ¤nst plockar ut din erfarenhet och dina styrkor.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Klistra in jobbannonsen',
        text:
          'Vi lÃ¤ser annonsen, identifierar nyckelkraven och matchar dem mot din bakgrund.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'VÃ¤lj mall och ton',
        text:
          'Sju mallar fÃ¶r olika branscher och sex tonalitetsval, frÃ¥n professionellt till entusiastiskt.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Ladda ner som PDF eller Word',
        text:
          'Granska, finjustera om du vill, exportera. Spara brevet i ditt konto fÃ¶r senare.',
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

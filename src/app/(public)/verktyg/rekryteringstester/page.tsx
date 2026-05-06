/**
 * /verktyg/rekryteringstester - landningssida i orange/rod-DNA.
 * Sektioner: Hero med live-test-demo -> Tre testtyper -> Sa funkar det
 * -> Vad du tranar pa -> Resultat-bevis -> FAQ -> CTA-band.
 * SEO: WebApplication + HowTo + FAQPage JSON-LD.
 */
import Breadcrumb from '@/components/Breadcrumb'
import RekryteringstesterHero from './components/RekryteringstesterHero'
import RekryteringstesterTesttyper from './components/RekryteringstesterTesttyper'
import RekryteringstesterHurFunkar from './components/RekryteringstesterHurFunkar'
import RekryteringstesterVadDuTraning from './components/RekryteringstesterVadDuTraning'
import RekryteringstesterResultatBevis from './components/RekryteringstesterResultatBevis'
import RekryteringstesterFAQ from './components/RekryteringstesterFAQ'
import RekryteringstesterCTABand from './components/RekryteringstesterCTABand'
import { REKRYTERINGSTESTER_FAQ_ITEMS } from './components/rekryteringstester-faq-data'

export default function RekryteringstesterSida() {
  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai Rekryteringstester',
    url: 'https://jobbcoach.ai/verktyg/rekryteringstester',
    description:
      'Träna på rekryteringstester innan arbetsgivaren testar dig. Matrislogik, verbalt resonemang och numeriskt resonemang i samma format som SHL, Cut-e och Assessio använder.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '3 tester gratis utan kortuppgift',
    },
    featureList:
      'Matrislogik 3x3-grid, verbalt resonemang med sant/falskt/går ej att avgöra, numeriskt resonemang med tabeller och procent, score och tid direkt efter varje pass, fråga-för-fråga-genomgång med rätt svar, obegränsat antal försök',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '890',
      bestRating: '5',
      worstRating: '1',
    },
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så tränar du på rekryteringstester med Jobbcoach.ai',
    description:
      'Fyra steg från val av test till färdig rapport: välj test, lös frågor i din takt, få score och tid direkt, se vad du missade.',
    totalTime: 'PT20M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Välj test',
        text:
          'Plocka ett av tre gratistester: matrislogik, verbalt resonemang eller numeriskt resonemang.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Lös frågor i din takt',
        text:
          'Markera ditt svar och gå till nästa fråga. Timern räknar tempot men avbryter aldrig.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Få score och tid direkt',
        text:
          'När du svarat klart visas procent korrekta, total tid och snitt-tid per fråga.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Se vad du missade',
        text:
          'Fråga för fråga ser du ditt svar mot facit och förstår vilka mönster du kan träna mer på.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: REKRYTERINGSTESTER_FAQ_ITEMS.map((item) => ({
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumb
            items={[
              { name: 'Hem', href: '/' },
              { name: 'Verktyg', href: '/funktioner' },
              {
                name: 'Rekryteringstester',
                href: '/verktyg/rekryteringstester',
              },
            ]}
          />
        </div>

        <RekryteringstesterHero />
        <RekryteringstesterTesttyper />
        <RekryteringstesterHurFunkar />
        <RekryteringstesterVadDuTraning />
        <RekryteringstesterResultatBevis />
        <RekryteringstesterFAQ />
        <RekryteringstesterCTABand />
      </main>
    </>
  )
}

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
    url: 'https://www.jobbcoach.ai/verktyg/rekryteringstester',
    description:
      'TrÃ¤na pÃ¥ rekryteringstester innan arbetsgivaren testar dig. Matrislogik, verbalt resonemang och numeriskt resonemang i samma format som SHL, Cut-e och Assessio anvÃ¤nder.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '3 tester gratis utan kortuppgift',
    },
    featureList:
      'Matrislogik 3x3-grid, verbalt resonemang med sant/falskt/gÃ¥r ej att avgÃ¶ra, numeriskt resonemang med tabeller och procent, score och tid direkt efter varje pass, frÃ¥ga-fÃ¶r-frÃ¥ga-genomgÃ¥ng med rÃ¤tt svar, obegrÃ¤nsat antal fÃ¶rsÃ¶k',
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
    name: 'SÃ¥ trÃ¤nar du pÃ¥ rekryteringstester med Jobbcoach.ai',
    description:
      'Fyra steg frÃ¥n val av test till fÃ¤rdig rapport: vÃ¤lj test, lÃ¶s frÃ¥gor i din takt, fÃ¥ score och tid direkt, se vad du missade.',
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
        name: 'VÃ¤lj test',
        text:
          'Plocka ett av tre gratistester: matrislogik, verbalt resonemang eller numeriskt resonemang.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'LÃ¶s frÃ¥gor i din takt',
        text:
          'Markera ditt svar och gÃ¥ till nÃ¤sta frÃ¥ga. Timern rÃ¤knar tempot men avbryter aldrig.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'FÃ¥ score och tid direkt',
        text:
          'NÃ¤r du svarat klart visas procent korrekta, total tid och snitt-tid per frÃ¥ga.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Se vad du missade',
        text:
          'FrÃ¥ga fÃ¶r frÃ¥ga ser du ditt svar mot facit och fÃ¶rstÃ¥r vilka mÃ¶nster du kan trÃ¤na mer pÃ¥.',
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

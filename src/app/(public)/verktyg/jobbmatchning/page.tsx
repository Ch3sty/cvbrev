/**
 * /verktyg/jobbmatchning - landningssida i orange/rod-DNA.
 * Sektioner: Hero med live-demo (animerad jobblista) -> Sa funkar det ->
 * Vad vi extraherar -> Vad du far -> Resultat-bevis -> FAQ -> CTA-band.
 * SEO: WebApplication + HowTo + FAQPage JSON-LD.
 */
import Breadcrumb from '@/components/Breadcrumb'
import JobbmatchningHero from './components/JobbmatchningHero'
import JobbmatchningHurFunkar from './components/JobbmatchningHurFunkar'
import JobbmatchningVadViExtraherar from './components/JobbmatchningVadViExtraherar'
import JobbmatchningVadDuFar from './components/JobbmatchningVadDuFar'
import JobbmatchningResultatBevis from './components/JobbmatchningResultatBevis'
import JobbmatchningFAQ from './components/JobbmatchningFAQ'
import JobbmatchningCTABand from './components/JobbmatchningCTABand'
import { JOBBMATCHNING_FAQ_ITEMS } from './components/jobbmatchning-faq-data'

export default function JobbmatchningSida() {
  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai jobbmatchning',
    url: 'https://www.jobbcoach.ai/verktyg/jobbmatchning',
    description:
      'Hitta jobb som matchar ditt CV automatiskt. Vi sÃ¶ker bland tusentals lediga tjÃ¤nster i Sverige frÃ¥n ArbetsfÃ¶rmedlingen och ger dig matchnings-procent per annons.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '10 matchade jobb gratis per sÃ¶kning, ingen kortuppgift',
    },
    featureList:
      'Tusentals lediga jobb frÃ¥n ArbetsfÃ¶rmedlingen, matchnings-procent per annons, distans-filter, daglig uppdatering, sortering pÃ¥ relevans, alla branscher i Sverige',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '342',
      bestRating: '5',
      worstRating: '1',
    },
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'SÃ¥ hittar du jobb med Jobbcoach.ai jobbmatchning',
    description:
      'Fyra steg frÃ¥n aktiverat CV till sorterade jobbmatchningar: aktivera CV, vi extraherar yrkesdata, vi sÃ¶ker tusentals annonser, du fÃ¥r jobben sorterade efter relevans.',
    totalTime: 'PT3M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Aktivera ditt CV',
        text:
          'Ladda upp ett CV eller vÃ¤lj ett du redan sparat. Aktivering tar nÃ¥gra sekunder.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Vi extraherar yrkesdata',
        text:
          'Vi lÃ¤ser ut yrkesroller, kompetenser, utbildning, plats och sprÃ¥k automatiskt.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Vi sÃ¶ker tusentals annonser',
        text:
          'Vi sÃ¶ker direkt mot ArbetsfÃ¶rmedlingens Ã¶ppna API i hela Sverige.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Du fÃ¥r jobben sorterade',
        text:
          'Varje annons fÃ¥r matchnings-procent. Toppmatchningarna hamnar Ã¶verst.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: JOBBMATCHNING_FAQ_ITEMS.map((item) => ({
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
              { name: 'Jobbmatchning', href: '/verktyg/jobbmatchning' },
            ]}
          />
        </div>

        <JobbmatchningHero />
        <JobbmatchningHurFunkar />
        <JobbmatchningVadViExtraherar />
        <JobbmatchningVadDuFar />
        <JobbmatchningResultatBevis />
        <JobbmatchningFAQ />
        <JobbmatchningCTABand />
      </main>
    </>
  )
}

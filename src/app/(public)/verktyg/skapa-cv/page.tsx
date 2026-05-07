/**
 * /verktyg/skapa-cv - landningssida i orange/rod-DNA.
 * Sektioner: Hero med live-demo (mini-wizard som speglar dashboard-flodet) ->
 * Sa funkar det -> Vad du far -> Mallar (lank till /verktyg/cv-mallar) ->
 * Resultat-bevis -> FAQ -> CTA-band.
 * SEO: WebApplication + HowTo + FAQPage JSON-LD.
 */
import Breadcrumb from '@/components/Breadcrumb'
import SkapaCvHero from './components/SkapaCvHero'
import SkapaCvHurFunkar from './components/SkapaCvHurFunkar'
import SkapaCvVadDuFar from './components/SkapaCvVadDuFar'
import SkapaCvMallar from './components/SkapaCvMallar'
import SkapaCvResultatBevis from './components/SkapaCvResultatBevis'
import SkapaCvFAQ from './components/SkapaCvFAQ'
import SkapaCvCTABand from './components/SkapaCvCTABand'
import { SKAPA_CV_FAQ_ITEMS } from './components/skapa-cv-faq-data'

export default function SkapaCvSida() {
  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai CV-byggare',
    url: 'https://www.jobbcoach.ai/verktyg/skapa-cv',
    description:
      'Skapa CV gratis online med vÃ¥r CV-byggare. Sju enkla steg, live-preview, ATS-sÃ¤kra mallar och export till PDF eller Word. Helt pÃ¥ svenska.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Skapa CV helt gratis, ingen kortuppgift',
    },
    featureList:
      'Sju-stegs CV-byggare, live-preview, ATS-sÃ¤kra mallar, auto-save, PDF- och Word-export, LinkedIn-import, mobile-friendly',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'SÃ¥ skapar du ett CV med Jobbcoach.ai',
    description:
      'Fyra steg frÃ¥n val till fÃ¤rdig PDF: vÃ¤lj mall, fyll i sju enkla steg, vi sÃ¤tter ihop, ladda ner.',
    totalTime: 'PT10M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'VÃ¤lj en mall',
        text:
          'BlÃ¤ddra bland modern, traditionell och kreativ stil. Du kan byta mall efterÃ¥t utan att fÃ¶rlora din data.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Fyll i sju enkla steg',
        text:
          'Kontaktuppgifter, om dig, erfarenhet, utbildning, kompetenser och sprÃ¥k. Allt sparas automatiskt.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Vi sÃ¤tter ihop CV:t',
        text:
          'Allt landar automatiskt pÃ¥ rÃ¤tt plats i mallen. Live-preview visar slutresultatet medan du skriver.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Ladda ner som PDF eller Word',
        text:
          'NÃ¤r du Ã¤r nÃ¶jd exporterar du ditt CV. Sparas i ditt konto fÃ¶r senare redigering.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SKAPA_CV_FAQ_ITEMS.map((item) => ({
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
              { name: 'Skapa CV', href: '/verktyg/skapa-cv' },
            ]}
          />
        </div>

        <SkapaCvHero />
        <SkapaCvHurFunkar />
        <SkapaCvVadDuFar />
        <SkapaCvMallar />
        <SkapaCvResultatBevis />
        <SkapaCvFAQ />
        <SkapaCvCTABand />
      </main>
    </>
  )
}

/**
 * /verktyg/jobbcoachen - landningssida i orange/rod-DNA.
 * Sektioner: Hero med live-chat-demo -> Sa funkar det -> Vad du kan fraga om
 * -> Kallorna bakom svaren -> Resultat-bevis -> FAQ -> CTA-band.
 * SEO: WebApplication + HowTo + FAQPage JSON-LD.
 */
import Breadcrumb from '@/components/Breadcrumb'
import JobbcoachenHero from './components/JobbcoachenHero'
import JobbcoachenHurFunkar from './components/JobbcoachenHurFunkar'
import JobbcoachenAmnen from './components/JobbcoachenAmnen'
import JobbcoachenKallor from './components/JobbcoachenKallor'
import JobbcoachenResultatBevis from './components/JobbcoachenResultatBevis'
import JobbcoachenFAQ from './components/JobbcoachenFAQ'
import JobbcoachenCTABand from './components/JobbcoachenCTABand'
import { JOBBCOACHEN_FAQ_ITEMS } from './components/jobbcoachen-faq-data'

export default function JobbcoachenSida() {
  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai Karriärguiden',
    url: 'https://jobbcoach.ai/verktyg/jobbcoachen',
    description:
      'Karriärrådgivning baserad på Arbetsförmedlingen, SCB, fackförbund, Försäkringskassan, CSN och Skatteverket. Få svar på frågor om lön, intervju, arbetsrätt och karriärbyte med klickbara källhänvisningar.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '5 frågor gratis utan kortuppgift',
    },
    featureList:
      'Karriärrådgivning från svenska källor, klickbara källhänvisningar i varje svar, marknadslön per yrke, arbetsrätt och LAS, intervjuförberedelse, karriärbyte, A-kassa och CSN, dokumentdelning av CV och brev',
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
    name: 'Så får du karriärråd med Karriärguiden på Jobbcoach.ai',
    description:
      'Fyra steg från fråga till svar med källhänvisning: ställ frågan, vi söker bland verifierade källor, du får svaret med citat, du följer upp.',
    totalTime: 'PT2M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Ställ frågan',
        text:
          'Skriv en fråga om lön, intervju, arbetsrätt, karriärbyte eller annat som rör jobblivet i Sverige.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Vi söker bland verifierade källor',
        text:
          'Karriärguiden söker i en kunskapsbas av Arbetsförmedlingen, SCB, fackförbund, Försäkringskassan, CSN och Skatteverket.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Du får svar med källhänvisning',
        text:
          'Svaret är kort och konkret med klickbara källor markerade direkt i texten.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Följ upp tills det är klart',
        text:
          'Karriärguiden minns samtalet och du kan följa upp utan att börja om.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: JOBBCOACHEN_FAQ_ITEMS.map((item) => ({
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
              { name: 'Jobbcoachen', href: '/verktyg/jobbcoachen' },
            ]}
          />
        </div>

        <JobbcoachenHero />
        <JobbcoachenHurFunkar />
        <JobbcoachenAmnen />
        <JobbcoachenKallor />
        <JobbcoachenResultatBevis />
        <JobbcoachenFAQ />
        <JobbcoachenCTABand />
      </main>
    </>
  )
}

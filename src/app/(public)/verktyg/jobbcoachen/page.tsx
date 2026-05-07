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
    name: 'Jobbcoach.ai KarriÃ¤rguiden',
    url: 'https://www.jobbcoach.ai/verktyg/jobbcoachen',
    description:
      'KarriÃ¤rrÃ¥dgivning baserad pÃ¥ ArbetsfÃ¶rmedlingen, SCB, fackfÃ¶rbund, FÃ¶rsÃ¤kringskassan, CSN och Skatteverket. FÃ¥ svar pÃ¥ frÃ¥gor om lÃ¶n, intervju, arbetsrÃ¤tt och karriÃ¤rbyte med klickbara kÃ¤llhÃ¤nvisningar.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '5 frÃ¥gor gratis utan kortuppgift',
    },
    featureList:
      'KarriÃ¤rrÃ¥dgivning frÃ¥n svenska kÃ¤llor, klickbara kÃ¤llhÃ¤nvisningar i varje svar, marknadslÃ¶n per yrke, arbetsrÃ¤tt och LAS, intervjufÃ¶rberedelse, karriÃ¤rbyte, A-kassa och CSN, dokumentdelning av CV och brev',
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
    name: 'SÃ¥ fÃ¥r du karriÃ¤rrÃ¥d med KarriÃ¤rguiden pÃ¥ Jobbcoach.ai',
    description:
      'Fyra steg frÃ¥n frÃ¥ga till svar med kÃ¤llhÃ¤nvisning: stÃ¤ll frÃ¥gan, vi sÃ¶ker bland verifierade kÃ¤llor, du fÃ¥r svaret med citat, du fÃ¶ljer upp.',
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
        name: 'StÃ¤ll frÃ¥gan',
        text:
          'Skriv en frÃ¥ga om lÃ¶n, intervju, arbetsrÃ¤tt, karriÃ¤rbyte eller annat som rÃ¶r jobblivet i Sverige.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Vi sÃ¶ker bland verifierade kÃ¤llor',
        text:
          'KarriÃ¤rguiden sÃ¶ker i en kunskapsbas av ArbetsfÃ¶rmedlingen, SCB, fackfÃ¶rbund, FÃ¶rsÃ¤kringskassan, CSN och Skatteverket.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Du fÃ¥r svar med kÃ¤llhÃ¤nvisning',
        text:
          'Svaret Ã¤r kort och konkret med klickbara kÃ¤llor markerade direkt i texten.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'FÃ¶lj upp tills det Ã¤r klart',
        text:
          'KarriÃ¤rguiden minns samtalet och du kan fÃ¶lja upp utan att bÃ¶rja om.',
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

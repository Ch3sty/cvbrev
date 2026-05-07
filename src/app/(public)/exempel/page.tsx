/**
 * /exempel â€” hub-sida for hela exempel-biblioteket.
 * Sektioner: Hero -> Kategori-paneler (CV + Brev) -> Populara yrken (12) ->
 * Bransch-hub (6 kategorier) -> Sa anvander du -> FAQ -> CTA-band.
 * SEO: WebPage + BreadcrumbList + FAQPage + ItemList JSON-LD.
 */
import Breadcrumb from '@/components/Breadcrumb'
import ExempelHero from './components/ExempelHero'
import ExempelKategoriPaneler from './components/ExempelKategoriPaneler'
import ExempelPopulara from './components/ExempelPopulara'
import ExempelKategoriHub from './components/ExempelKategoriHub'
import ExempelHurAnvanda from './components/ExempelHurAnvanda'
import ExempelFAQ from './components/ExempelFAQ'
import ExempelCTABand from './components/ExempelCTABand'
import {
  EXEMPEL_FAQ_ITEMS,
  POPULARA_YRKEN,
  TOTAL_EXEMPEL,
  TOTAL_CV_YRKEN,
  TOTAL_BREV_YRKEN,
} from './components/exempel-data'

export default function ExempelPage() {
  // === Schema.org markup ===

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${TOTAL_EXEMPEL} CV-exempel och personliga brev | Jobbcoach.ai`,
    description: `BlÃ¤ddra bland ${TOTAL_CV_YRKEN} CV-exempel och ${TOTAL_BREV_YRKEN} personliga brev fÃ¶r 151 yrken fÃ¶rdelade Ã¶ver sex branscher. ATS-optimerade och gratis.`,
    url: 'https://www.jobbcoach.ai/exempel',
    publisher: {
      '@type': 'Organization',
      name: 'Jobbcoach.ai',
      url: 'https://www.jobbcoach.ai',
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Hem',
        item: 'https://www.jobbcoach.ai',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Exempel',
        item: 'https://www.jobbcoach.ai/exempel',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: EXEMPEL_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  // ItemList med populara yrken (lyfter dem i SERP)
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'PopulÃ¤ra yrkes-exempel',
    description: 'De mest sÃ¶kta yrkena fÃ¶r CV och personliga brev i Sverige',
    numberOfItems: POPULARA_YRKEN.length * 2, // CV + brev for varje
    itemListElement: POPULARA_YRKEN.flatMap((yrke, idx) => [
      {
        '@type': 'ListItem',
        position: idx * 2 + 1,
        name: `CV-exempel: ${yrke.namn}`,
        url: `https://www.jobbcoach.ai/cv-exempel/${yrke.slug}`,
      },
      {
        '@type': 'ListItem',
        position: idx * 2 + 2,
        name: `Personligt brev-exempel: ${yrke.namn}`,
        url: `https://www.jobbcoach.ai/personligt-brev-exempel/${yrke.slug}`,
      },
    ]),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <main className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumb
            items={[
              { name: 'Hem', href: '/' },
              { name: 'Exempel', href: '/exempel' },
            ]}
          />
        </div>

        <ExempelHero />
        <ExempelKategoriPaneler />
        <ExempelPopulara />
        <ExempelKategoriHub />
        <ExempelHurAnvanda />
        <ExempelFAQ />
        <ExempelCTABand />
      </main>
    </>
  )
}

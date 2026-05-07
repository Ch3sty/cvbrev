/**
 * /personligt-brev-exempel - galleri-sida med 76 personliga brev-exempel.
 * Renderar GalleriPageContent med brev-yrkes-data.
 * SEO: ItemList + BreadcrumbList + FAQPage JSON-LD + dynamisk metadata.
 */
import type { Metadata } from 'next'
import GalleriPageContent from '@/app/(public)/exempel/components/GalleriPageContent'
import { BREV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { BREV_GALLERI_FAQ } from '@/app/(public)/exempel/components/galleri-faq'

const ANTAL_BREV = BREV_GALLERI.length

export function generateMetadata(): Metadata {
  return {
    title: `Personligt brev-exempel: ${ANTAL_BREV} yrkesmallar | Jobbcoach.ai`,
    description: `Bläddra bland ${ANTAL_BREV} personliga brev-exempel inom vård, tech, ekonomi, service, utbildning och offentlig sektor. Skrivna för svenska rekryterare och ATS-system. Helt gratis.`,
    keywords:
      'personligt brev exempel, personligt brev mall, personligt brev mall gratis, ansökningsbrev mall, jobbansökan exempel, personligt brev vård, personligt brev tech, brev till jobb',
    openGraph: {
      title: `${ANTAL_BREV} personliga brev-exempel för svenska yrken | Jobbcoach.ai`,
      description: `Professionella personliga brev-exempel för ${ANTAL_BREV} yrken. Skrivna för svenska rekryterare. Helt gratis.`,
      type: 'website',
      locale: 'sv_SE',
      url: 'https://www.jobbcoach.ai/personligt-brev-exempel',
      siteName: 'Jobbcoach.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ANTAL_BREV} personliga brev-exempel för svenska yrken | Jobbcoach.ai`,
      description: `Professionella personliga brev-exempel för ${ANTAL_BREV} yrken. Helt gratis.`,
    },
    alternates: {
      canonical: 'https://www.jobbcoach.ai/personligt-brev-exempel',
    },
    robots: { index: true, follow: true },
  }
}

export default function PersonligtBrevExempelGalleri() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Personligt brev-exempel för svenska yrken',
    description: `Bibliotek med ${ANTAL_BREV} personliga brev-exempel inom vård, tech, ekonomi, service, utbildning och offentlig sektor.`,
    numberOfItems: BREV_GALLERI.length,
    itemListElement: BREV_GALLERI.map((y, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `Personligt brev-exempel: ${y.namn}`,
      url: `https://www.jobbcoach.ai/personligt-brev-exempel/${y.slug}`,
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://www.jobbcoach.ai' },
      { '@type': 'ListItem', position: 2, name: 'Exempel', item: 'https://www.jobbcoach.ai/exempel' },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Personligt brev-exempel',
        item: 'https://www.jobbcoach.ai/personligt-brev-exempel',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: BREV_GALLERI_FAQ.map((item) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <GalleriPageContent
        type="brev"
        yrken={BREV_GALLERI}
        faqItems={BREV_GALLERI_FAQ}
      />
    </>
  )
}

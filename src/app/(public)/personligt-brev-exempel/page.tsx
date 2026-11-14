/**
 * /personligt-brev-exempel - galleri-sida med personligt brev-exempel per yrke.
 * Renderar GalleriPageContent med brev-yrkes-data.
 * SEO: ItemList + BreadcrumbList + FAQPage JSON-LD + dynamisk metadata.
 */
import type { Metadata } from 'next'
import GalleriPageContent from '@/app/(public)/exempel/components/GalleriPageContent'
import { BREV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { BREV_GALLERI_FAQ } from '@/app/(public)/exempel/components/galleri-faq'
import { KATEGORIER } from '@/app/(public)/exempel/components/exempel-data'

const ANTAL_BREV = BREV_GALLERI.length
// Huvudordsplanen steg 1 (SEO-förslaget K4 a, 2026-11-14): galleriet tar
// exempelorden, mallordet ägs av artikeln personligt-brev-mall-gratis.
const TITEL = `Personligt brev exempel: ${ANTAL_BREV} färdiga brev för svenska yrken`
const BESKRIVNING = `Personligt brev exempel för ${ANTAL_BREV} yrken, skrivna för svenska rekryterare. Se inledning, koppling till annonsen och avslutning, och använd brevet som mall.`

export function generateMetadata(): Metadata {
  return {
    title: TITEL,
    description: BESKRIVNING,
    keywords: 'personligt brev exempel, exempel på personligt brev, personligt brev exempel yrke, jobbansökan exempel',
    openGraph: {
      title: TITEL,
      description: BESKRIVNING,
      type: 'website',
      locale: 'sv_SE',
      url: 'https://www.jobbcoach.ai/personligt-brev-exempel',
      siteName: 'Jobbcoach.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title: TITEL,
      description: BESKRIVNING,
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
    description: `${ANTAL_BREV} exempel på personligt brev för yrken i ${KATEGORIER.length} kategorier.`,
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

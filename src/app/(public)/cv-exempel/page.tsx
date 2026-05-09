/**
 * /cv-exempel - galleri-sida med 74 CV-exempel.
 * Renderar GalleriPageContent med CV-yrkes-data.
 * SEO: ItemList + BreadcrumbList + FAQPage JSON-LD + dynamisk metadata.
 */
import type { Metadata } from 'next'
import GalleriPageContent from '@/app/(public)/exempel/components/GalleriPageContent'
import { CV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { CV_GALLERI_FAQ } from '@/app/(public)/exempel/components/galleri-faq'

const ANTAL_CV = CV_GALLERI.length

export function generateMetadata(): Metadata {
  return {
    title: `${ANTAL_CV} CV-exempel för svenska yrken 2026 — gratis och ATS-optimerade | Jobbcoach.ai`,
    description: `Se färdiga CV-exempel för ${ANTAL_CV} svenska yrken — vård, tech, ekonomi, service, utbildning och offentlig sektor. Lärorika exempel för din egen jobbansökan.`,
    keywords:
      'cv exempel, exempel cv, bra cv exempel, cv exempel student, cv exempel säljare, cv exempel barnskötare, ats-optimerat cv, professionellt cv, svenska cv, jobbansökan',
    openGraph: {
      title: `${ANTAL_CV} CV-exempel för svenska yrken | Jobbcoach.ai`,
      description: `Professionella CV-exempel för ${ANTAL_CV} yrken. ATS-optimerade och anpassade för svenska arbetsgivare. Helt gratis.`,
      type: 'website',
      locale: 'sv_SE',
      url: 'https://www.jobbcoach.ai/cv-exempel',
      siteName: 'Jobbcoach.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ANTAL_CV} CV-exempel för svenska yrken | Jobbcoach.ai`,
      description: `Professionella CV-exempel för ${ANTAL_CV} yrken. ATS-optimerade. Helt gratis.`,
    },
    alternates: {
      canonical: 'https://www.jobbcoach.ai/cv-exempel',
    },
    robots: { index: true, follow: true },
  }
}

export default function CVExempelGalleri() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CV-exempel för svenska yrken',
    description: `Bibliotek med professionella CV-exempel för ${ANTAL_CV} yrken inom vård, tech, ekonomi, service, utbildning och offentlig sektor.`,
    numberOfItems: CV_GALLERI.length,
    itemListElement: CV_GALLERI.map((y, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `CV-exempel: ${y.namn}`,
      url: `https://www.jobbcoach.ai/cv-exempel/${y.slug}`,
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
        name: 'CV-exempel',
        item: 'https://www.jobbcoach.ai/cv-exempel',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CV_GALLERI_FAQ.map((item) => ({
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
        type="cv"
        yrken={CV_GALLERI}
        faqItems={CV_GALLERI_FAQ}
      />
    </>
  )
}

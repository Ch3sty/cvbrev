/**
 * /cv-exempel - galleri-sida med 74 CV-exempel.
 * Renderar GalleriPageContent med CV-yrkes-data.
 * SEO: ItemList + BreadcrumbList JSON-LD.
 */
import GalleriPageContent from '@/app/(public)/exempel/components/GalleriPageContent'
import { CV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'

export default function CVExempelGalleri() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CV-exempel för svenska yrken',
    description:
      'Bibliotek med professionella CV-exempel för 74 yrken inom vård, tech, ekonomi, service, utbildning och offentlig sektor.',
    numberOfItems: CV_GALLERI.length,
    itemListElement: CV_GALLERI.map((y, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `CV-exempel: ${y.namn}`,
      url: `https://jobbcoach.ai/cv-exempel/${y.slug}`,
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://jobbcoach.ai' },
      { '@type': 'ListItem', position: 2, name: 'Exempel', item: 'https://jobbcoach.ai/exempel' },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'CV-exempel',
        item: 'https://jobbcoach.ai/cv-exempel',
      },
    ],
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
      <GalleriPageContent type="cv" yrken={CV_GALLERI} />
    </>
  )
}

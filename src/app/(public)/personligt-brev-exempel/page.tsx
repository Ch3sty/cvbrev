/**
 * /personligt-brev-exempel - galleri-sida med 76 personliga brev-exempel.
 * Renderar GalleriPageContent med brev-yrkes-data.
 * SEO: ItemList + BreadcrumbList JSON-LD.
 */
import GalleriPageContent from '@/app/(public)/exempel/components/GalleriPageContent'
import { BREV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'

export default function PersonligtBrevExempelGalleri() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Personligt brev-exempel för svenska yrken',
    description:
      'Bibliotek med 76 personliga brev-exempel inom vård, tech, ekonomi, service, utbildning och offentlig sektor.',
    numberOfItems: BREV_GALLERI.length,
    itemListElement: BREV_GALLERI.map((y, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `Personligt brev-exempel: ${y.namn}`,
      url: `https://jobbcoach.ai/personligt-brev-exempel/${y.slug}`,
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
        name: 'Personligt brev-exempel',
        item: 'https://jobbcoach.ai/personligt-brev-exempel',
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
      <GalleriPageContent type="brev" yrken={BREV_GALLERI} />
    </>
  )
}

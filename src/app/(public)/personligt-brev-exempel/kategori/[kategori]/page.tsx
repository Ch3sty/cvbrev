import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import KategoriPageContent from '@/app/(public)/exempel/components/KategoriPageContent'
import {
  KATEGORIER,
  type KategoriSlug,
} from '@/app/(public)/exempel/components/exempel-data'
import { BREV_YRKEN } from '@/app/(public)/exempel/components/yrken-data'

interface PageProps {
  params: Promise<{ kategori: string }>
}

export async function generateStaticParams() {
  return KATEGORIER.map((k) => ({ kategori: k.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { kategori: slug } = await params
  const kat = KATEGORIER.find((k) => k.slug === slug)
  if (!kat) return {}

  const yrkenIDennaTyp = kat.yrken.filter((y) => BREV_YRKEN[y]).length

  return {
    title: `Personligt brev-exempel ${kat.namn.toLowerCase()} (${yrkenIDennaTyp} yrken) | Jobbcoach.ai`,
    description: `Professionella personliga brev inom ${kat.namn.toLowerCase()}. ${kat.kortBeskrivning}. Skrivna med svenska rekryterare och ATS-system i åtanke.`,
    keywords: `personligt brev exempel ${kat.namn.toLowerCase()}, personligt brev mall ${kat.namn.toLowerCase()}, ansökningsbrev ${kat.namn.toLowerCase()}`,
    openGraph: {
      title: `Personligt brev-exempel för ${kat.namn} | Jobbcoach.ai`,
      description: kat.kortBeskrivning,
      type: 'website',
      locale: 'sv_SE',
      url: `https://www.jobbcoach.ai/personligt-brev-exempel/kategori/${slug}`,
      siteName: 'Jobbcoach.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Personligt brev-exempel för ${kat.namn} | Jobbcoach.ai`,
      description: kat.kortBeskrivning,
    },
    alternates: {
      canonical: `https://www.jobbcoach.ai/personligt-brev-exempel/kategori/${slug}`,
    },
  }
}

export default async function BrevKategoriSida({ params }: PageProps) {
  const { kategori: slug } = await params
  const kat = KATEGORIER.find((k) => k.slug === (slug as KategoriSlug))
  if (!kat) notFound()

  const yrkenIDennaTyp = kat.yrken.filter((y) => BREV_YRKEN[y])

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Personligt brev-exempel för ${kat.namn}`,
    description: kat.introIngress,
    url: `https://www.jobbcoach.ai/personligt-brev-exempel/kategori/${slug}`,
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
      {
        '@type': 'ListItem',
        position: 4,
        name: kat.namn,
        item: `https://www.jobbcoach.ai/personligt-brev-exempel/kategori/${slug}`,
      },
    ],
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Personligt brev-exempel för ${kat.namn}`,
    numberOfItems: yrkenIDennaTyp.length,
    itemListElement: yrkenIDennaTyp.map((yrkesSlug, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `Personligt brev-exempel: ${BREV_YRKEN[yrkesSlug]}`,
      url: `https://www.jobbcoach.ai/personligt-brev-exempel/${yrkesSlug}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <KategoriPageContent
        kategori={kat}
        type="brev"
        yrkenMap={BREV_YRKEN}
      />
    </>
  )
}

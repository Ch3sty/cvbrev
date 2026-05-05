import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import KategoriPageContent from '@/app/(public)/exempel/components/KategoriPageContent'
import {
  KATEGORIER,
  type KategoriSlug,
} from '@/app/(public)/exempel/components/exempel-data'
import { CV_YRKEN } from '@/app/(public)/exempel/components/yrken-data'

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

  const yrkenIDennaTyp = kat.yrken.filter((y) => CV_YRKEN[y]).length

  return {
    title: `CV-exempel ${kat.namn.toLowerCase()} (${yrkenIDennaTyp} yrken) | Jobbcoach.ai`,
    description: `Professionella CV-exempel inom ${kat.namn.toLowerCase()}. ${kat.kortBeskrivning}. Anpassade för svenska arbetsgivare och ATS-system.`,
    keywords: `cv exempel ${kat.namn.toLowerCase()}, cv mall ${kat.namn.toLowerCase()}, ${kat.namn.toLowerCase()} cv, jobbansökan ${kat.namn.toLowerCase()}`,
    openGraph: {
      title: `CV-exempel för ${kat.namn} | Jobbcoach.ai`,
      description: kat.kortBeskrivning,
      type: 'website',
      locale: 'sv_SE',
      url: `https://jobbcoach.ai/cv-exempel/kategori/${slug}`,
      siteName: 'Jobbcoach.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title: `CV-exempel för ${kat.namn} | Jobbcoach.ai`,
      description: kat.kortBeskrivning,
    },
    alternates: {
      canonical: `https://jobbcoach.ai/cv-exempel/kategori/${slug}`,
    },
  }
}

export default async function CvKategoriSida({ params }: PageProps) {
  const { kategori: slug } = await params
  const kat = KATEGORIER.find((k) => k.slug === (slug as KategoriSlug))
  if (!kat) notFound()

  const yrkenIDennaTyp = kat.yrken.filter((y) => CV_YRKEN[y])

  // === JSON-LD ===

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `CV-exempel för ${kat.namn}`,
    description: kat.introIngress,
    url: `https://jobbcoach.ai/cv-exempel/kategori/${slug}`,
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
      {
        '@type': 'ListItem',
        position: 4,
        name: kat.namn,
        item: `https://jobbcoach.ai/cv-exempel/kategori/${slug}`,
      },
    ],
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `CV-exempel för ${kat.namn}`,
    numberOfItems: yrkenIDennaTyp.length,
    itemListElement: yrkenIDennaTyp.map((yrkesSlug, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `CV-exempel: ${CV_YRKEN[yrkesSlug]}`,
      url: `https://jobbcoach.ai/cv-exempel/${yrkesSlug}`,
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
        type="cv"
        yrkenMap={CV_YRKEN}
      />
    </>
  )
}

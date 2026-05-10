/**
 * /cv-mallar/[yrke] - dedikerad yrkesmall-sida.
 *
 * Skiljer sig fran /cv-exempel/[yrke]:
 *  - /cv-exempel/[yrke] = innehallsexempel (Erik Anderssons fardiga CV)
 *  - /cv-mallar/[yrke]  = mall-design + rekryterar-perspektiv
 *
 * Schema.org: Product (mallen som produkt) + BreadcrumbList.
 * Canonical: self.
 * Internal-link: /cv-exempel/[yrke] (cross-direction).
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { YRKESMALL_LIST, YRKESMALL_SLUGS } from '../yrkesmall-data'
import YrkesmallContent from './YrkesmallContent'

interface Props {
  params: Promise<{ yrke: string }>
}

export function generateStaticParams() {
  return YRKESMALL_SLUGS.map(yrke => ({ yrke }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { yrke } = await params
  const data = YRKESMALL_LIST.find(y => y.slug === yrke)

  if (!data) {
    return { title: 'CV-mall — Jobbcoach.ai' }
  }

  return {
    title: `CV-mall för ${data.namn} 2026 — gratis nedladdning | Jobbcoach.ai`,
    description: `Färdig CV-mall för ${data.namnBestamd} som är ATS-optimerad och matchar svenska arbetsgivares förväntningar. Se ${data.freeMallNamn} (gratis) och ${data.premiumMallNamn} (premium) och vad rekryterare letar efter. Gratis att ladda ner.`,
    keywords: `cv mall ${data.namnBestamd}, ${data.namnBestamd} cv mall, mall cv ${data.namnBestamd}, gratis cv mall ${data.namnBestamd}, ${data.namnBestamd} cv exempel, ats-säker cv mall`,
    openGraph: {
      title: `CV-mall för ${data.namn} | Jobbcoach.ai`,
      description: `Specialiserad CV-mall för ${data.namnBestamd}. ATS-säker och anpassad för svenska arbetsgivare.`,
      type: 'article',
      locale: 'sv_SE',
      url: `https://www.jobbcoach.ai/cv-mallar/${data.slug}`,
      siteName: 'Jobbcoach.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title: `CV-mall för ${data.namn} | Jobbcoach.ai`,
      description: `Specialiserad CV-mall för ${data.namnBestamd}. ATS-säker. Gratis att ladda ner.`,
    },
    alternates: {
      canonical: `https://www.jobbcoach.ai/cv-mallar/${data.slug}`,
    },
    robots: { index: true, follow: true },
  }
}

export default async function YrkesmallPage({ params }: Props) {
  const { yrke } = await params
  const data = YRKESMALL_LIST.find(y => y.slug === yrke)

  if (!data) {
    notFound()
  }

  // Schema.org: Product (mallen ar produkten)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `CV-mall för ${data.namn}`,
    description: data.intro,
    brand: {
      '@type': 'Brand',
      name: 'Jobbcoach.ai',
    },
    category: 'CV-mall',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      availability: 'https://schema.org/InStock',
      url: `https://www.jobbcoach.ai/cv-mallar/${data.slug}`,
    },
    image: `https://www.jobbcoach.ai/mallar/${data.freeMallId}.svg`,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://www.jobbcoach.ai' },
      { '@type': 'ListItem', position: 2, name: 'CV-mallar', item: 'https://www.jobbcoach.ai/cv-mallar' },
      {
        '@type': 'ListItem',
        position: 3,
        name: data.namn,
        item: `https://www.jobbcoach.ai/cv-mallar/${data.slug}`,
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  // Tre relaterade yrkesmallar (alla utom denna)
  const relaterade = YRKESMALL_LIST.filter(y => y.slug !== data.slug).slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <YrkesmallContent data={data} relaterade={relaterade} />
    </>
  )
}

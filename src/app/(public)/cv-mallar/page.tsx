/**
 * /cv-mallar — hub-sida fOr "cv mall"-sokintent.
 *
 * Skiljer sig fran /cv-exempel:
 *  - /cv-exempel = innehallsexempel ("hur skriver jag mitt CV")
 *  - /cv-mallar  = mall-design ("vilken mall ska jag valja")
 *
 * SEO: ItemList + BreadcrumbList + FAQPage JSON-LD.
 * Canonical: /cv-mallar (self).
 */
import type { Metadata } from 'next'
import CvMallarPageContent from './components/CvMallarPageContent'
import { YRKESMALL_LIST } from './yrkesmall-data'
import { CV_MALLAR_FAQ } from './components/cv-mallar-faq'

export function generateMetadata(): Metadata {
  return {
    title: 'CV-mallar 2026 — gratis och premium-mallar att ladda ner | Jobbcoach.ai',
    description:
      'Välj bland färdiga ATS-säkra CV-mallar för svenska yrken. Gratis att ladda ner, anpassade per bransch och uppdaterade för 2026. Modern, traditionell, kreativ — välj din stil.',
    keywords:
      'cv mall, cv mallar, gratis cv mall, cv mall ladda ner, cv mall gratis, professionell cv-mall, cv-mall, ats-säker cv-mall, cv mall pdf, cv mall word, modern cv mall',
    openGraph: {
      title: 'CV-mallar 2026 — gratis och premium-mallar | Jobbcoach.ai',
      description:
        'Färdiga ATS-säkra CV-mallar för svenska yrken. Modern, traditionell, kreativ — välj rätt design för ditt yrke.',
      type: 'website',
      locale: 'sv_SE',
      url: 'https://www.jobbcoach.ai/cv-mallar',
      siteName: 'Jobbcoach.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'CV-mallar 2026 — gratis och premium-mallar | Jobbcoach.ai',
      description: 'Färdiga ATS-säkra CV-mallar för svenska yrken. Helt gratis.',
    },
    alternates: {
      canonical: 'https://www.jobbcoach.ai/cv-mallar',
    },
    robots: { index: true, follow: true },
  }
}

export default function CvMallarHub() {
  // ItemList med yrkesmall-sidor (driver SEO for "cv mall {yrke}"-cluster)
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CV-mallar för svenska yrken',
    description: `Bibliotek med yrkesspecifika CV-mallar för ${YRKESMALL_LIST.length} yrken. ATS-säkra, gratis och anpassade för svenska arbetsgivare.`,
    numberOfItems: YRKESMALL_LIST.length,
    itemListElement: YRKESMALL_LIST.map((y, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `CV-mall för ${y.namn}`,
      url: `https://www.jobbcoach.ai/cv-mallar/${y.slug}`,
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
        name: 'CV-mallar',
        item: 'https://www.jobbcoach.ai/cv-mallar',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CV_MALLAR_FAQ.map((item) => ({
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
      <CvMallarPageContent yrkesmallar={YRKESMALL_LIST} faqItems={CV_MALLAR_FAQ} />
    </>
  )
}

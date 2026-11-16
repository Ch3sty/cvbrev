/**
 * /cv-mallar — hub-sida fOr "cv mall"-sokintent.
 *
 * Skiljer sig fran /cv-exempel:
 *  - /cv-exempel = innehallsexempel ("hur skriver jag mitt CV")
 *  - /cv-mallar  = mall-design ("vilken mall ska jag valja")
 *
 * SEO: ItemList (yrkessidorna), ItemList med en Product per mall, HowTo,
 * BreadcrumbList och FAQPage JSON-LD. Canonical: /cv-mallar (self).
 * Sedan 2026-11-16 den enda mallsidan: /verktyg/cv-mallar 308:ar hit och dess
 * innehåll (Word-avsnittet #word, stegen, funktionerna, Product-listan och
 * frågorna) står här (SEO-strategens beslut ur Search Console).
 */
import type { Metadata } from 'next'
import CvMallarPageContent from './components/CvMallarPageContent'
import { YRKESMALL_LIST } from './yrkesmall-data'
import { CV_MALLAR_FAQ } from './components/cv-mallar-faq'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { howToSchema, produktListaSchema } from './components/mallar-produkt'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'

// Huvudordsplanen steg 1 (SEO-förslaget K4 a, 2026-11-14): "CV-mall" först,
// bara löften sidan håller. Talen ur konstanterna.
const TITEL = `CV-mall: ${TEMPLATE_COUNT} mallar att fylla i och ladda ner, ${FREE_TEMPLATE_COUNT} gratis`
const BESKRIVNING = `CV-mallar för svenska jobb: ${TEMPLATE_COUNT} mallar att fylla i och ladda ner som PDF eller Word, ${FREE_TEMPLATE_COUNT} av dem gratis. Se vilken mall som passar ditt yrke och din erfarenhet.`

export function generateMetadata(): Metadata {
  return {
    title: TITEL,
    description: BESKRIVNING,
    keywords:
      'cv mall, cv mallar, gratis cv mall, cv mall ladda ner, cv mall gratis, professionell cv-mall, cv-mall, ats-säker cv-mall, cv mall pdf, cv mall word, modern cv mall',
    openGraph: {
      title: TITEL,
      description: BESKRIVNING,
      type: 'website',
      locale: 'sv_SE',
      url: 'https://www.jobbcoach.ai/cv-mallar',
      siteName: 'Jobbcoach.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title: TITEL,
      description: BESKRIVNING,
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
    description: `CV-mallar för ${YRKESMALL_LIST.length} svenska yrken, med rätt sektioner och rekryterarens tips per yrke.`,
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
      {/* Inloggade hör hemma i verktyget, som på /verktyg/cv-mallar förut (C2). */}
      <RedirectLoggedIn to="/dashboard/cv-mallar" />
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(produktListaSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema()) }}
      />
      <CvMallarPageContent yrkesmallar={YRKESMALL_LIST} faqItems={CV_MALLAR_FAQ} />
    </>
  )
}

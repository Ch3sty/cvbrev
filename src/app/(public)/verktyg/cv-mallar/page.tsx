/**
 * /verktyg/cv-mallar - produktdemo-landningssida i orange/rod-DNA.
 *
 * SEO-roll: produkt-/funktionsdemo, INTE huvudsidan fOr "cv mall"-sokintent.
 * Den huvudsidan ar /cv-mallar (kortare URL, optimerad fOr sokord).
 * Darfor sätter vi canonical till /cv-mallar sa Google forstar att
 * /verktyg/cv-mallar ar en alternativ vy och inte ska konkurrera om ranking.
 *
 * Sektioner: Hero med live-demo -> Sa funkar det -> Mall-galleri ->
 * Vad du far -> Resultat-bevis -> FAQ -> CTA-band.
 * SEO: ItemList (dynamisk fran SIMPLE_TEMPLATES) + HowTo + FAQPage.
 */
import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'

export const metadata: Metadata = {
  title: 'CV-mallar — verktyg och funktion | Jobbcoach.ai',
  description:
    'Funktionsdemo för Jobbcoach.ai:s CV-mallverktyg. Se hur du väljer mall, fyller i uppgifter och laddar ner färdig PDF.',
  alternates: {
    canonical: 'https://www.jobbcoach.ai/cv-mallar',
  },
  robots: { index: true, follow: true },
}
import CVMallarHero from './components/CVMallarHero'
import CVMallarHurFunkar from './components/CVMallarHurFunkar'
import CVMallarGalleri from './components/CVMallarGalleri'
import CVMallarVadDuFar from './components/CVMallarVadDuFar'
import CVMallarResultatBevis from './components/CVMallarResultatBevis'
import CVMallarFAQ from './components/CVMallarFAQ'
import CVMallarCTABand from './components/CVMallarCTABand'
import { CV_MALLAR_FAQ_ITEMS } from './components/cv-mallar-faq-data'

export default function CVMallarSida() {
  // === Schema.org markup ===

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CV-mallar för svenska arbetsgivare',
    description:
      'Professionella CV-mallar i modern, traditionell och kreativ stil. ATS-säkra och anpassade för svenska arbetsgivare.',
    numberOfItems: SIMPLE_TEMPLATES.length,
    itemListElement: SIMPLE_TEMPLATES.map((tpl, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: tpl.name,
        description: tpl.description,
        image: `https://www.jobbcoach.ai${tpl.imagePath}`,
        category: tpl.category,
        // brand löser GSC-varningen "No global identifier" (Google accepterar
        // brand ELLER gtin; en digital CV-mall har ingen gtin). sku = stabil id.
        brand: { '@type': 'Brand', name: 'Jobbcoach.ai' },
        sku: tpl.id,
        url: `https://www.jobbcoach.ai/cv-mallar#${tpl.id}`,
        offers: {
          '@type': 'Offer',
          price: tpl.tier === 'free' ? '0' : '149',
          priceCurrency: 'SEK',
          availability: 'https://schema.org/InStock',
          url: 'https://www.jobbcoach.ai/cv-mallar',
          // Merchant listings kräver pris > 0; gratismallar förblir giltiga
          // product snippets. seller anges för komplett Offer-data.
          seller: { '@type': 'Organization', name: 'Jobbcoach.ai' },
        },
      },
    })),
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så bygger du ett CV med Jobbcoach.ai',
    description:
      'Fyra steg från val till färdig PDF: välj mall, fyll i, vi flyttar in datan, ladda ner.',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Välj en mall',
        text:
          'Bläddra bland modern, traditionell och kreativ stil. Klicka på den som passar din bransch.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Fyll i dina uppgifter',
        text:
          'Vårt formulär guidar dig genom varje sektion. Du kan importera från LinkedIn eller börja från ett befintligt CV.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Vi flyttar in datan',
        text:
          'Allt landar automatiskt på rätt plats i mallen. Byter du mall efteråt följer datan med.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Ladda ner som PDF eller Word',
        text:
          'Exportera ditt CV. Sparas i ditt konto för senare redigering.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CV_MALLAR_FAQ_ITEMS.map((item) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumb
            items={[
              { name: 'Hem', href: '/' },
              { name: 'Verktyg', href: '/funktioner' },
              { name: 'CV-mallar', href: '/verktyg/cv-mallar' },
            ]}
          />
        </div>

        <CVMallarHero />
        <CVMallarHurFunkar />
        <CVMallarGalleri />
        <CVMallarVadDuFar />
        <CVMallarResultatBevis />
        <CVMallarFAQ />
        <CVMallarCTABand />
      </main>
    </>
  )
}

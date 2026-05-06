/**
 * /verktyg/cv-mallar - landningssida i orange/rod-DNA.
 * Sektioner: Hero med live-demo -> Sa funkar det -> Mall-galleri ->
 * Vad du far -> Resultat-bevis -> FAQ -> CTA-band.
 * SEO: ItemList (dynamisk fran SIMPLE_TEMPLATES) + HowTo + FAQPage.
 */
import Breadcrumb from '@/components/Breadcrumb'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'
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
        image: `https://jobbcoach.ai${tpl.imagePath}`,
        category: tpl.category,
        offers: {
          '@type': 'Offer',
          price: tpl.tier === 'free' ? '0' : '149',
          priceCurrency: 'SEK',
          availability: 'https://schema.org/InStock',
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

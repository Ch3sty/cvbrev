/**
 * /verktyg/cv-analys - landningssida i orange/rod-DNA.
 * Sektioner: Hero med live-demo -> Sa funkar det -> Vad vi kontrollerar
 * (6 kategorier) -> Resultat-bevis -> Skrivtips -> FAQ -> CTA-band.
 * SEO: WebApplication + HowTo + FAQPage JSON-LD.
 */
import Breadcrumb from '@/components/Breadcrumb'
import CVAnalysHero from './components/CVAnalysHero'
import CVAnalysHurFunkar from './components/CVAnalysHurFunkar'
import CVAnalysVadVikollar from './components/CVAnalysVadVikollar'
import CVAnalysResultatBevis from './components/CVAnalysResultatBevis'
import CVAnalysSkrivtips from './components/CVAnalysSkrivtips'
import CVAnalysFAQ from './components/CVAnalysFAQ'
import CVAnalysCTABand from './components/CVAnalysCTABand'
import { CV_ANALYS_FAQ_ITEMS } from './components/cv-analys-faq-data'

export default function CVAnalysSida() {
  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai CV-analys',
    url: 'https://www.jobbcoach.ai/verktyg/cv-analys',
    description:
      'CV-analys som ger ATS-poäng från 0 till 100, sex kategori-betyg och konkreta förbättringsförslag på 60 sekunder. Anpassad för svenska arbetsgivare.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '1 CV-analys gratis varje vecka, ingen kortuppgift',
    },
    featureList:
      'ATS-poäng 0-100, sex kategorier (ATS, struktur, språk, nyckelord, kvantifiering, profil), before/after-text, konkreta förbättringsförslag, svenska och engelska CV',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1400',
      bestRating: '5',
      worstRating: '1',
    },
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så analyserar du ditt CV med Jobbcoach.ai',
    description:
      'Fyra steg från upplagt CV till starkare ansökan: ladda upp, vi analyserar, få ATS-poäng, spara förbättrad version.',
    totalTime: 'PT60S',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Ladda upp ditt CV',
        text:
          'Ladda upp ett befintligt CV som PDF eller välj ett du redan sparat. Vi accepterar både svenska och engelska.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Vi analyserar i bakgrunden',
        text:
          'Det tar 30 till 60 sekunder. Vi kontrollerar struktur, språk, nyckelord och kvantifierade resultat.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Få ATS-poäng och förslag',
        text:
          'Du får en ATS-poäng från 0 till 100 plus förslag i sex kategorier med exakt vad som bör ändras.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Spara den förbättrade versionen',
        text:
          'Välj vilka förslag du vill applicera, granska before/after och ladda ner som PDF eller Word.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CV_ANALYS_FAQ_ITEMS.map((item) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
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
              { name: 'CV-analys', href: '/verktyg/cv-analys' },
            ]}
          />
        </div>

        <CVAnalysHero />
        <CVAnalysHurFunkar />
        <CVAnalysVadVikollar />
        <CVAnalysResultatBevis />
        <CVAnalysSkrivtips />
        <CVAnalysFAQ />
        <CVAnalysCTABand />
      </main>
    </>
  )
}

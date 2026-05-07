/**
 * /verktyg/linkedin-optimering - landningssida i orange/rod-DNA.
 * Sektioner: Hero med live-demo -> Varfor syns du inte -> Sa funkar det
 * -> Sektioner -> Tva lagen -> Resultat-bevis -> FAQ -> CTA-band.
 * SEO: WebApplication + HowTo + FAQPage JSON-LD.
 */
import Breadcrumb from '@/components/Breadcrumb'
import LinkedinOptimeringHero from './components/LinkedinOptimeringHero'
import LinkedinOptimeringVarfor from './components/LinkedinOptimeringVarfor'
import LinkedinOptimeringHurFunkar from './components/LinkedinOptimeringHurFunkar'
import LinkedinOptimeringSektioner from './components/LinkedinOptimeringSektioner'
import LinkedinOptimeringTvaLagen from './components/LinkedinOptimeringTvaLagen'
import LinkedinOptimeringResultatBevis from './components/LinkedinOptimeringResultatBevis'
import LinkedinOptimeringFAQ from './components/LinkedinOptimeringFAQ'
import LinkedinOptimeringCTABand from './components/LinkedinOptimeringCTABand'
import { LINKEDIN_OPTIMERING_FAQ_ITEMS } from './components/linkedin-optimering-faq-data'

export default function LinkedinOptimeringSida() {
  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai LinkedIn-optimering',
    url: 'https://www.jobbcoach.ai/verktyg/linkedin-optimering',
    description:
      'Optimera din LinkedIn-profil för rekryterares sökningar. Vi förbättrar rubrik, om-mig, erfarenhet, utbildning och kompetenser samtidigt. Du copy-pastar in din text och får optimerad version tillbaka, vi loggar aldrig in på din LinkedIn.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '1 optimering gratis per vecka, ingen kortuppgift',
    },
    featureList:
      'Optimering av rubrik, om-mig, erfarenhet, utbildning och kompetenser, score-rapport före och efter per sektion, två lägen (stå ut eller specifik roll), CV-autofyll från sparat CV, copy-paste-flöde utan LinkedIn-inloggning, STAR-format på erfarenhet, ATS-optimering med branschkeywords',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '1200',
      bestRating: '5',
      worstRating: '1',
    },
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så optimerar du din LinkedIn-profil med Jobbcoach.ai',
    description:
      'Fem steg från copy-paste till uppdaterad LinkedIn-profil: hämta din profiltext, klistra in eller välj sparat CV, vi optimerar fem sektioner, jämför före och efter, kopiera tillbaka till LinkedIn.',
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Hämta din profiltext från LinkedIn',
        text:
          'Kopiera din nuvarande rubrik, om-mig och erfarenhet från LinkedIn. Eller välj ett sparat CV som källa.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Klistra in i fem fält',
        text:
          'Klistra in texten i fälten Rubrik, Om mig, Erfarenhet, Utbildning och Kompetenser. Inga obligatoriska fält.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Vi optimerar fem sektioner samtidigt',
        text:
          'Karriärguidens AI bearbetar alla fem sektioner parallellt med svensk arbetsmarknadskontext, branschkeywords och ATS-anpassning på 30-60 sekunder.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Jämför före och efter',
        text:
          'Split-view visar din nuvarande text bredvid den optimerade. Per sektion ser du score-deltan och vad som ändrats.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Kopiera tillbaka till LinkedIn',
        text:
          'En knapp kopierar hela paketet eller en sektion åt gången. Du klistrar in på LinkedIn manuellt och sparar.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: LINKEDIN_OPTIMERING_FAQ_ITEMS.map((item) => ({
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
              {
                name: 'LinkedIn-optimering',
                href: '/verktyg/linkedin-optimering',
              },
            ]}
          />
        </div>

        <LinkedinOptimeringHero />
        <LinkedinOptimeringVarfor />
        <LinkedinOptimeringHurFunkar />
        <LinkedinOptimeringSektioner />
        <LinkedinOptimeringTvaLagen />
        <LinkedinOptimeringResultatBevis />
        <LinkedinOptimeringFAQ />
        <LinkedinOptimeringCTABand />
      </main>
    </>
  )
}

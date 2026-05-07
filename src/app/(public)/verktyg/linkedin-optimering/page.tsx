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
      'Optimera din LinkedIn-profil fÃ¶r rekryterares sÃ¶kningar. Vi fÃ¶rbÃ¤ttrar rubrik, om-mig, erfarenhet, utbildning och kompetenser samtidigt. Du copy-pastar in din text och fÃ¥r optimerad version tillbaka, vi loggar aldrig in pÃ¥ din LinkedIn.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '1 optimering gratis per vecka, ingen kortuppgift',
    },
    featureList:
      'Optimering av rubrik, om-mig, erfarenhet, utbildning och kompetenser, score-rapport fÃ¶re och efter per sektion, tvÃ¥ lÃ¤gen (stÃ¥ ut eller specifik roll), CV-autofyll frÃ¥n sparat CV, copy-paste-flÃ¶de utan LinkedIn-inloggning, STAR-format pÃ¥ erfarenhet, ATS-optimering med branschkeywords',
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
    name: 'SÃ¥ optimerar du din LinkedIn-profil med Jobbcoach.ai',
    description:
      'Fem steg frÃ¥n copy-paste till uppdaterad LinkedIn-profil: hÃ¤mta din profiltext, klistra in eller vÃ¤lj sparat CV, vi optimerar fem sektioner, jÃ¤mfÃ¶r fÃ¶re och efter, kopiera tillbaka till LinkedIn.',
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
        name: 'HÃ¤mta din profiltext frÃ¥n LinkedIn',
        text:
          'Kopiera din nuvarande rubrik, om-mig och erfarenhet frÃ¥n LinkedIn. Eller vÃ¤lj ett sparat CV som kÃ¤lla.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Klistra in i fem fÃ¤lt',
        text:
          'Klistra in texten i fÃ¤lten Rubrik, Om mig, Erfarenhet, Utbildning och Kompetenser. Inga obligatoriska fÃ¤lt.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Vi optimerar fem sektioner samtidigt',
        text:
          'KarriÃ¤rguidens AI bearbetar alla fem sektioner parallellt med svensk arbetsmarknadskontext, branschkeywords och ATS-anpassning pÃ¥ 30-60 sekunder.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'JÃ¤mfÃ¶r fÃ¶re och efter',
        text:
          'Split-view visar din nuvarande text bredvid den optimerade. Per sektion ser du score-deltan och vad som Ã¤ndrats.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Kopiera tillbaka till LinkedIn',
        text:
          'En knapp kopierar hela paketet eller en sektion Ã¥t gÃ¥ngen. Du klistrar in pÃ¥ LinkedIn manuellt och sparar.',
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

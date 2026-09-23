/**
 * /verktyg/cv-analys på verktygsmallen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5). h1, title, description och schemat (WebApplication, HowTo,
 * FAQPage) är oförändrade; bara ramen och sektionernas form är nya.
 */
import VerktygsSida from '@/components/verktyg/VerktygsSida'
import CVAnalysMini from './components/CVAnalysMini'
import { CV_ANALYS_FAQ_ITEMS } from './components/cv-analys-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { IlluScenCv } from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY } from '@/lib/plans/plans'

const KATEGORIER = [
  { rubrik: 'Läsbarhet för rekryteringssystem', text: 'Att rubriker, formatering och filstruktur fungerar i de system svenska arbetsgivare sorterar med. Inga kolumner som förvirrar maskinen.' },
  { rubrik: 'Struktur', text: 'Avsnittens längd och ordning, datumformat och att de viktiga rubrikerna (Erfarenhet, Utbildning, Kompetenser) finns på rätt plats.' },
  { rubrik: 'Språk och grammatik', text: 'Aktiva verb, inga fyllnadsord och en konsekvent ton. "Ansvarig för" blir "Ledde", "Jobbade med" blir "Drev".' },
  { rubrik: 'Nyckelord', text: 'Vi jämför med vanliga söktermer i din bransch och flaggar de viktigaste som saknas, till exempel Scrum, intressenthantering och budget för en projektledare.' },
  { rubrik: 'Kvantifiering', text: 'Hur många mätbara resultat du visar, och var siffror gör mest nytta. "Ökade försäljningen" blir "Ökade försäljningen 40 procent på 8 månader".' },
  { rubrik: 'Profil och styrkor', text: 'Din öppning, omskriven till tre rader som lyfter det just du kan och som rekryteraren minns.' },
]

const SKRIVTIPS = [
  { rubrik: 'Kvantifiera dina resultat', text: 'Siffror övertygar mer än adjektiv. "Ökade omsättningen 40 procent på 8 månader" säger mer än "duktig på försäljning".' },
  { rubrik: 'Börja varje punkt med ett verb', text: 'Drev, byggde, ledde, införde. Aktiva verb visar handlingskraft; passiva formuleringar gör att du försvinner i mängden.' },
  { rubrik: 'Använd annonsens egna ord', text: 'Står en term i annonsen, skriv den exakt så i CV:t. Rekryteringssystemen letar efter exakta termer, inte synonymer.' },
  { rubrik: 'En sida räcker ofta', text: 'Under fem års erfarenhet: en A4. Mer erfarenhet: högst två. Akademiska CV med publikationer kan vara längre, men då av en anledning.' },
  { rubrik: 'Hoppa över bilden', text: 'Bilder kan göra att systemen läser fel. I Sverige väger innehållet tyngre än utseendet, så lägg platsen på det som säljer dig.' },
]

export default function CVAnalysSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

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
      description: '1 CV-analys gratis per konto, ingen kortuppgift',
    },
    featureList:
      'ATS-poäng 0-100, sex kategorier (ATS, struktur, språk, nyckelord, kvantifiering, profil), before/after-text, konkreta förbättringsförslag, svenska och engelska CV',
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
      <RedirectLoggedIn to="/dashboard/cv-analys" />
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

      <VerktygsSida
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Verktyg', href: '/funktioner' },
          { name: 'CV-analys', href: '/verktyg/cv-analys' },
        ]}
        eyebrow="CV-analys · vet varför CV:t inte får svar"
        h1="Få konkret feedback på ditt CV på 60 sekunder"
        ingress="Vi läser ditt CV som ett rekryteringssystem gör och kontrollerar struktur, språk, nyckelord och kvantifiering."
        fet="Du får en poäng från 0 till 100, betyg i sex kategorier och åtgärder du kan göra direkt."
        primar={{ text: 'Analysera mitt CV', href: '#mini-analys' }}
        sekundar={{ text: 'Så fungerar det', href: '#sa-funkar-det' }}
        loften={[
          { tal: '1 analys', text: 'gratis per konto' },
          { tal: '60 sek', text: 'till poängen' },
          { tal: '6', text: 'kategorier med betyg' },
        ]}
        scen={<IlluScenCv className="h-auto w-full" />}
        handling={<CVAnalysMini />}
        handlingId="mini-analys"
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress: 'Fyra steg från uppladdat CV till en starkare ansökan.',
          rader: howToSchema.step.map((s) => ({ rubrik: s.name, text: s.text })),
          lank: { text: 'Analysera mitt CV', href: '#mini-analys' },
        }}
        kontroll={{
          eyebrow: 'Vad vi kontrollerar',
          rubrik: 'Sex saker rekryteraren och systemet ser först',
          rader: KATEGORIER,
        }}
        extra={[
          {
            eyebrow: 'Skrivtips',
            rubrik: 'Fem saker som lyfter vilket CV som helst',
            rader: SKRIVTIPS,
          },
        ]}
        citat={{
          text: 'Jag fick 64 i ATS-poäng på första analysen och insåg att jag inte hade kvantifierat något alls. Efter en eftermiddag med förslagen var jag uppe i 91. Tre veckor senare hade jag tre intervjuer.',
          namn: 'Sara, 31, Stockholm',
          roll: 'marknadsförare, från 64 till 91 i poäng',
        }}
        slut={{
          eyebrow: `${PLAN_BY_KEY.cv_week.name}, ${PLAN_BY_KEY.cv_week.amount} kr i veckan`,
          rubrik: 'Hela analysen, varje fynd med åtgärd.',
          text: `Poängen och det tyngsta fyndet är gratis. Hela analysen, alla mallar och personliga brev utan tak ingår i ${PLAN_BY_KEY.cv_week.name}, ${PLAN_BY_KEY.cv_week.amount} kr i veckan.`,
          knapp: { text: 'Analysera mitt CV gratis', href: '#mini-analys' },
          sekundar: { text: 'Se CV-exempel först', href: '/exempel' },
        }}
        faq={{
          rubrik: 'Frågor om CV-analysen',
          ingress: (
            <>
              Hittar du inte svaret? Mejla{' '}
              <a href="mailto:support@jobbcoach.ai" className="text-ink-1 underline decoration-kant-stark underline-offset-4">
                support@jobbcoach.ai
              </a>
              .
            </>
          ),
          fragor: CV_ANALYS_FAQ_ITEMS,
        }}
      />
    </>
  )
}

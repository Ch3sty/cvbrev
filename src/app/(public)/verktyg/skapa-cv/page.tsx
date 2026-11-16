/**
 * /verktyg/skapa-cv på verktygsmallen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5). h1, title, description och schemat (WebApplication, HowTo,
 * FAQPage) är oförändrade; bara ramen och sektionernas form är nya.
 * Demon i heron (mini-byggaren som speglar dashboard-flödet) är handlingen.
 */
import VerktygsMall from '@/components/publikt/VerktygsMall'
import SkarmSkapaCv from '@/components/publikt/telefon/skarmar/SkarmSkapaCv'
import SkapaCvLiveDemo from './components/SkapaCvLiveDemo'
import { SKAPA_CV_FAQ_ITEMS } from './components/skapa-cv-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { SALD_PLAN, paketKort, paketMedPris } from '@/lib/plans/plans'
import { TEMPLATE_COUNT, FREE_TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { MALL_KATALOG } from '@/lib/cv/mallar/katalog'
import { WORD_TEMPLATE_COUNT_ORD } from '@/lib/cv/template-antal'

const FUNKTIONER = [
  {
    rubrik: 'Mallar som rekryteringssystemen kan läsa',
    text: 'Alla mallar är byggda för systemen svenska arbetsgivare sorterar ansökningar med. Rena rubriker, läsbar struktur och ingen formatering som förvirrar maskinen.',
  },
  {
    rubrik: 'Förhandsvisning medan du skriver',
    text: 'Du ser CV:t ta form direkt. Skriv en rad och se var den landar i mallen, långt innan du laddar ner.',
  },
  {
    rubrik: 'Utkastet väntar på dig',
    text: 'Det du fyller i ligger kvar i webbläsaren medan du bygger, så du kan stänga fliken och fortsätta i samma webbläsare. I sista steget sparar du CV:t i ditt konto, och då finns det på alla dina enheter.',
  },
  {
    rubrik: `Ladda ner som PDF, eller Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna`,
    text: `Alla mallar laddas ner som PDF. Välj en av de ${WORD_TEMPLATE_COUNT_ORD} Word-mallarna när du vill ändra i filen själv, eller när annonsen ber om ett format som går att redigera. I gratismallarna kostar Word-filen inget, i de övriga ingår den i ${paketKort()}.`,
  },
  {
    rubrik: 'Börja från ett CV du redan har',
    text: 'Ladda upp ditt gamla CV, eller en PDF av din LinkedIn-profil, så läser vi ut roller, utbildning och kompetenser åt dig. Du slipper skriva allt en gång till.',
  },
  {
    rubrik: 'Fungerar lika bra i mobilen',
    text: 'Hela byggaren är gjord för mobilen först. Bygg hela CV:t i telefonen, och när du sparat det öppnar du det på datorn för att ladda ner.',
  },
]

/** De tre första i katalogen (gratismallarna först), med mallens korta rad och stil. */
const UTVALDA = MALL_KATALOG.slice(0, 3)

export default function SkapaCvSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai CV-byggare',
    url: 'https://www.jobbcoach.ai/verktyg/skapa-cv',
    description:
      `Skapa CV gratis online med vår CV-byggare. Sju enkla steg, förhandsvisning, ATS-säkra mallar och nedladdning som PDF, eller Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna. Helt på svenska.`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Skapa CV helt gratis, ingen kortuppgift',
    },
    featureList:
      `Sju-stegs CV-byggare, förhandsvisning, ATS-säkra mallar, utkast i webbläsaren, PDF-nedladdning, Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna, uppladdning av befintligt CV, mobilanpassad`,
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så skapar du ett CV med Jobbcoach.ai',
    description:
      'Fyra steg från val till färdig PDF: välj mall, fyll i sju enkla steg, vi sätter ihop, ladda ner.',
    totalTime: 'PT10M',
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
          'Bläddra bland modern, traditionell och kreativ stil. Du kan byta mall efteråt utan att förlora din data.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Fyll i sju enkla steg',
        text:
          'Kontaktuppgifter, om dig, erfarenhet, utbildning, kompetenser och språk. Utkastet ligger kvar i webbläsaren tills du sparar.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Vi sätter ihop CV:t',
        text:
          'Allt landar automatiskt på rätt plats i mallen. Förhandsvisningen visar slutresultatet medan du skriver.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: `Ladda ner som PDF, eller Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna`,
        text:
          'När du är nöjd laddar du ner ditt CV. Det sparas i ditt konto för senare redigering.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SKAPA_CV_FAQ_ITEMS.map((item) => ({
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
      <RedirectLoggedIn to="/dashboard/skapa-cv" />
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

      <VerktygsMall
        rum="cv"
        telefon={<SkarmSkapaCv />}
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Verktyg', href: '/funktioner' },
          { name: 'Skapa CV', href: '/verktyg/skapa-cv' },
        ]}
        eyebrow="Skapa CV, färdigt på tio minuter"
        h1="Skapa ditt CV gratis på minuter"
        ingress={`Vår CV-byggare tar dig genom sju enkla steg och visar CV:t medan du skriver. Du fyller i, vi sätter ihop och du laddar ner som PDF, eller Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna.`}
        fet="Gratis att börja och helt på svenska."
        primar={{ text: 'Bygg mitt CV gratis', href: '/register?borja=cv' }}
        sekundar={{ text: 'Se mallarna', href: '/cv-mallar' }}
        loften={[
          { tal: '10 min', text: 'från start till färdigt CV' },
          { tal: '7 steg', text: 'ett i taget, förhandsvisning hela vägen' },
          { tal: String(TEMPLATE_COUNT), text: `mallar, ${FREE_TEMPLATE_COUNT} gratis` },
        ]}
        handling={<SkapaCvLiveDemo />}
        handlingId="demo"
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress: 'Du skriver, vi sätter ihop. Inga krångliga Word-mallar att kämpa med.',
          rader: howToSchema.step.map((s) => ({ rubrik: s.name, text: s.text })),
          lank: { text: 'Skapa mitt CV gratis', href: '/register?borja=cv' },
        }}
        kontroll={{
          eyebrow: 'Vad du får',
          rubrik: 'Sex saker som gör CV-byggandet enkelt',
          ingress: 'Byggaren tar bort friktionen. Du lägger tiden på innehållet, vi sköter resten.',
          rader: FUNKTIONER,
        }}
        extra={[
          {
            eyebrow: 'Mallar att välja på',
            rubrik: 'Mallar som passar din bransch',
            ingress: `${TEMPLATE_COUNT} mallar som passar alla yrken, med rubriker för din bransch, ${FREE_TEMPLATE_COUNT} av dem gratis. Byt mall efteråt utan att förlora det du fyllt i.`,
            rader: UTVALDA.map((m) => ({
              rubrik: m.namn,
              text: (
                <>
                  <span className="text-ink-3">{m.kort}.</span> {m.stil}.
                </>
              ),
            })),
            lank: { text: 'Se alla mallar', href: '/cv-mallar' },
          },
          {
            eyebrow: 'Resultat',
            rubrik: 'Tio minuters arbete som gör skillnad i månader',
            rader: [
              { rubrik: '10 minuter till färdigt CV', text: 'Hela vägen från första klicket till nedladdad PDF.' },
              { rubrik: 'Gratis att börja', text: 'Ingen kortuppgift och inga dolda avgifter.' },
              {
                rubrik: 'Läsbart för systemen i alla mallar',
                text: 'Ansökan sorteras inte bort på vägen för att maskinen inte kunde läsa den.',
              },
            ],
            lank: { text: 'Skapa ditt CV gratis', href: '/register?borja=cv' },
          },
        ]}
        slut={{
          eyebrow: paketMedPris(SALD_PLAN),
          rubrik: 'Skapa ditt CV gratis på minuter.',
          text: `Sju enkla steg, förhandsvisning och mallar som systemen kan läsa. Du börjar gratis utan kortuppgift. Alla ${TEMPLATE_COUNT} mallar, full CV-analys och nedladdning av allt du skriver ingår i ${paketKort()}.`,
          knapp: { text: 'Bygg mitt CV gratis', href: '/register?borja=cv' },
          sekundar: { text: 'Se CV-exempel först', href: '/cv-exempel' },
        }}
        faq={{
          rubrik: 'Vanliga frågor om att skapa CV',
          ingress: (
            <>
              Hittar du inte svaret?{' '}
              <a href="mailto:support@jobbcoach.ai" className="text-ink-1 underline decoration-kant-stark underline-offset-4">
                Hör av dig
              </a>
              .
            </>
          ),
          fragor: SKAPA_CV_FAQ_ITEMS,
        }}
      />
    </>
  )
}

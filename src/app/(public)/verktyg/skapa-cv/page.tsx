/**
 * /verktyg/skapa-cv på verktygsmallen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5). h1, title, description och schemat (WebApplication, HowTo,
 * FAQPage) är oförändrade; bara ramen och sektionernas form är nya.
 * Demon i heron (mini-byggaren som speglar dashboard-flödet) är handlingen.
 */
import VerktygsSida from '@/components/verktyg/VerktygsSida'
import SkapaCvLiveDemo from './components/SkapaCvLiveDemo'
import { SKAPA_CV_FAQ_ITEMS } from './components/skapa-cv-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { IlluScenSkapaCv } from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY } from '@/lib/plans/plans'
import { SIMPLE_TEMPLATES, TEMPLATE_COUNT, FREE_TEMPLATE_COUNT } from '@/lib/cv/simple-templates'

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
    rubrik: 'Sparas automatiskt',
    text: 'Allt du fyller i sparas i bakgrunden. Stäng fliken mitt i ett steg och fortsätt där du slutade när du kommer tillbaka.',
  },
  {
    rubrik: 'Ladda ner som PDF eller Word',
    text: 'Välj PDF för de flesta ansökningar och Word när annonsen ber om ett format som går att redigera.',
  },
  {
    rubrik: 'Hämta uppgifterna från LinkedIn',
    text: 'Har du en uppdaterad LinkedIn-profil? Importera profil, erfarenhet och kompetenser direkt, så slipper du skriva allt en gång till.',
  },
  {
    rubrik: 'Fungerar lika bra i mobilen',
    text: 'Hela byggaren är gjord för mobilen först. Börja på bussen och fortsätt vid datorn hemma.',
  },
]

const KATEGORI: Record<string, string> = {
  modern: 'Modern',
  traditional: 'Traditionell',
  creative: 'Kreativ',
}

const UTVALDA = SIMPLE_TEMPLATES.slice(0, 3)

export default function SkapaCvSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai CV-byggare',
    url: 'https://www.jobbcoach.ai/verktyg/skapa-cv',
    description:
      'Skapa CV gratis online med vår CV-byggare. Sju enkla steg, live-preview, ATS-säkra mallar och export till PDF eller Word. Helt på svenska.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Skapa CV helt gratis, ingen kortuppgift',
    },
    featureList:
      'Sju-stegs CV-byggare, live-preview, ATS-säkra mallar, auto-save, PDF- och Word-export, LinkedIn-import, mobile-friendly',
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
          'Kontaktuppgifter, om dig, erfarenhet, utbildning, kompetenser och språk. Allt sparas automatiskt.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Vi sätter ihop CV:t',
        text:
          'Allt landar automatiskt på rätt plats i mallen. Live-preview visar slutresultatet medan du skriver.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Ladda ner som PDF eller Word',
        text:
          'När du är nöjd exporterar du ditt CV. Sparas i ditt konto för senare redigering.',
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

  const pris = PLAN_BY_KEY.cv_week.amount

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

      <VerktygsSida
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Verktyg', href: '/funktioner' },
          { name: 'Skapa CV', href: '/verktyg/skapa-cv' },
        ]}
        eyebrow="Skapa CV · färdigt på tio minuter"
        h1="Skapa ditt CV gratis på minuter"
        ingress="Vår CV-byggare tar dig genom sju enkla steg och visar CV:t medan du skriver. Du fyller i, vi sätter ihop och du laddar ner som PDF eller Word."
        fet="Gratis att börja och helt på svenska."
        primar={{ text: 'Bygg mitt CV gratis', href: '/register' }}
        sekundar={{ text: 'Se mallarna', href: '/verktyg/cv-mallar' }}
        loften={[
          { tal: '10 min', text: 'från start till färdigt CV' },
          { tal: '7 steg', text: 'ett i taget, sparas automatiskt' },
          { tal: String(TEMPLATE_COUNT), text: `mallar, ${FREE_TEMPLATE_COUNT} gratis` },
        ]}
        scen={<IlluScenSkapaCv className="h-auto w-full" />}
        handling={<SkapaCvLiveDemo />}
        handlingId="demo"
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress: 'Du skriver, vi sätter ihop. Inga krångliga Word-mallar att kämpa med.',
          rader: howToSchema.step.map((s) => ({ rubrik: s.name, text: s.text })),
          lank: { text: 'Skapa mitt CV gratis', href: '/register' },
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
            ingress: `${TEMPLATE_COUNT} mallar i modern, traditionell och kreativ stil, ${FREE_TEMPLATE_COUNT} av dem gratis. Byt mall efteråt utan att förlora det du fyllt i.`,
            rader: UTVALDA.map((t) => ({
              rubrik: t.name,
              text: (
                <>
                  <span className="text-ink-3">{KATEGORI[t.category] ?? t.category}.</span> {t.description}.
                </>
              ),
            })),
            lank: { text: 'Se alla mallar', href: '/verktyg/cv-mallar' },
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
            lank: { text: 'Skapa ditt CV gratis', href: '/register' },
          },
        ]}
        citat={{
          text: 'Jag hade kämpat med Word i flera veckor och fick aldrig till det. Bytte till er CV-byggare och hade ett snyggt CV på en kvart. Skickade in tre ansökningar samma dag.',
          namn: 'Marcus, 32, Göteborg',
          roll: 'systemutvecklare, från veckor i Word till en kvart',
        }}
        slut={{
          eyebrow: 'CV-veckan',
          rubrik: 'Skapa ditt CV gratis på minuter.',
          text: `Sju enkla steg, förhandsvisning och mallar som systemen kan läsa. Du börjar gratis utan kortuppgift. Alla ${TEMPLATE_COUNT} mallar, full CV-analys och nedladdning av allt du skriver ingår i CV-veckan, ${pris} kr i veckan.`,
          knapp: { text: 'Bygg mitt CV gratis', href: '/register' },
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

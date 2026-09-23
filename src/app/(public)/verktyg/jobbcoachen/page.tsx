/**
 * /verktyg/jobbcoachen på verktygsmallen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5). h1, title, description och schemat (WebApplication, HowTo,
 * FAQPage) är oförändrade; bara ramen och sektionernas form är nya.
 */
import VerktygsSida from '@/components/verktyg/VerktygsSida'
import JobbcoachenLiveDemo from './components/JobbcoachenLiveDemo'
import { JOBBCOACHEN_FAQ_ITEMS } from './components/jobbcoachen-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { IlluScenCoach } from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY } from '@/lib/plans/plans'
import { FREE_CHAT_MESSAGES_PER_ACCOUNT } from '@/lib/quota/quotaService'

const AMNEN = [
  { rubrik: 'CV och personligt brev', text: 'Få feedback på en formulering, hjälp att skriva om en mening så att den landar, eller förslag på vad som saknas. Dela ditt sparade CV direkt i samtalet. Till exempel: "Hur skriver jag min sammanfattning?"' },
  { rubrik: 'Marknadslön och löneförhandling', text: 'Vi hämtar SCB:s officiella lönestatistik per yrke, region och erfarenhet. Du får siffror som stämmer och argument att luta dig mot i samtalet. Till exempel: "Vad tjänar en projektledare i Göteborg?"' },
  { rubrik: 'Intervjuförberedelse', text: 'Öva svar på vanliga intervjufrågor, packa din erfarenhet i en berättelse och få tips på vad du själv ska fråga. Till exempel: "Hur svarar jag på frågan om svagheter?"' },
  { rubrik: 'Arbetsrätt och LAS', text: 'Vi förklarar uppsägningstider, anställningsformer, semester, övertid och vad LAS säger om saklig grund, med källa så att du ser vad lagen säger. Till exempel: "Hur lång uppsägningstid har jag?"' },
  { rubrik: 'Karriärbyte och utveckling', text: 'Byta bransch, ta nästa kliv eller plugga vidare? Vi visar vilka roller som ligger nära din erfarenhet och vilka kompetenser du behöver bygga. Till exempel: "Vilka roller passar min bakgrund?"' },
  { rubrik: 'A-kassa, sjukdom och CSN', text: 'Ersättningsregler, väntedagar, vad som gäller vid sjukskrivning och hur CSN fungerar om du vill plugga om. Vi hänvisar till rätt myndighet när det behövs. Till exempel: "Får jag CSN som vuxen?"' },
]

const KALLOR = [
  { rubrik: 'Arbetsförmedlingen', text: 'Regler för arbetslöshet, etableringsstöd, jobbsökarverksamhet och stödformer. Hit hänvisar Karriärguiden när frågan rör myndighetsregler eller stöd.' },
  { rubrik: 'SCB', text: 'Lönestatistik per yrke, region och erfarenhet samt arbetsmarknadsdata. Frågar du om marknadslön är det SCB:s lönestrukturstatistik som ligger till grund.' },
  { rubrik: 'Fackförbund', text: 'Kollektivavtal och stöd från Unionen, Kommunal, IF Metall, Vision och fler. Används när frågan rör avtalsenliga villkor eller regler i en viss bransch.' },
  { rubrik: 'Försäkringskassan', text: 'Sjukpenning, föräldraledighet, regler vid sjukskrivning och ersättningar. Hit hänvisar vi när frågan rör socialförsäkringen och vad du har rätt till.' },
  { rubrik: 'CSN', text: 'Studielån, omställningsstudiestöd och regler för att plugga om som vuxen. Användbart när du överväger vidareutbildning eller karriärbyte.' },
  { rubrik: 'Skatteverket', text: 'Skatteregler för anställning, eget företag, traktamente och förmåner. Används när lönen räknas i nettotermer eller när du jämför anställningsformer.' },
]

export default function JobbcoachenSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai Karriärguiden',
    url: 'https://www.jobbcoach.ai/verktyg/jobbcoachen',
    description:
      'Karriärrådgivning baserad på Arbetsförmedlingen, SCB, fackförbund, Försäkringskassan, CSN och Skatteverket. Få svar på frågor om lön, intervju, arbetsrätt och karriärbyte med klickbara källhänvisningar.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '10 meddelanden gratis per konto, utan kortuppgift',
    },
    featureList:
      'Karriärrådgivning från svenska källor, klickbara källhänvisningar i varje svar, marknadslön per yrke, arbetsrätt och LAS, intervjuförberedelse, karriärbyte, A-kassa och CSN, dokumentdelning av CV och brev',
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så får du karriärråd med Karriärguiden på Jobbcoach.ai',
    description:
      'Fyra steg från fråga till svar med källhänvisning: ställ frågan, vi söker bland verifierade källor, du får svaret med citat, du följer upp.',
    totalTime: 'PT2M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Ställ frågan',
        text:
          'Skriv en fråga om lön, intervju, arbetsrätt, karriärbyte eller annat som rör jobblivet i Sverige.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Vi söker bland verifierade källor',
        text:
          'Karriärguiden söker i en kunskapsbas av Arbetsförmedlingen, SCB, fackförbund, Försäkringskassan, CSN och Skatteverket.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Du får svar med källhänvisning',
        text:
          'Svaret är kort och konkret med klickbara källor markerade direkt i texten.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Följ upp tills det är klart',
        text:
          'Karriärguiden minns samtalet och du kan följa upp utan att börja om.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: JOBBCOACHEN_FAQ_ITEMS.map((item) => ({
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
      <RedirectLoggedIn to="/dashboard/jobbcoachen" />
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
          { name: 'Jobbcoachen', href: '/verktyg/jobbcoachen' },
        ]}
        eyebrow="Karriärguiden · svar med källa"
        h1="Karriärrådgivning från någon som faktiskt kan svensk arbetsmarknad"
        ingress="Fråga om lön, intervju, uppsägning eller karriärbyte och få ett kort svar med klickbara källhänvisningar till Arbetsförmedlingen, SCB och fackförbund."
        fet="Vi gör researchen, så slipper du googla på 20 olika sajter."
        primar={{ text: 'Fråga gratis', href: '/register' }}
        sekundar={{ text: 'Så fungerar det', href: '#sa-funkar-det' }}
        loften={[
          { tal: `${FREE_CHAT_MESSAGES_PER_ACCOUNT} meddelanden`, text: 'gratis per konto' },
          { tal: 'Källa', text: 'till varje svar' },
          { tal: 'Sekunder', text: 'till första svaret' },
        ]}
        scen={<IlluScenCoach className="h-auto w-full" />}
        handling={<JobbcoachenLiveDemo />}
        handlingId="demo"
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress: 'Ställ frågan, få svaret med källa och gå vidare. Inga flikar fulla av lönerapporter och forumtrådar.',
          rader: howToSchema.step.map((s) => ({ rubrik: s.name, text: s.text })),
          lank: { text: 'Fråga Karriärguiden gratis', href: '/register' },
        }}
        kontroll={{
          eyebrow: 'Vad du kan fråga om',
          rubrik: 'Sex områden vi hjälper dig med',
          ingress: 'Karriärguiden kan svensk arbetsmarknad, från lönesamtalet till arbetsrätten.',
          rader: AMNEN,
        }}
        extra={[
          {
            eyebrow: 'Källorna bakom svaren',
            rubrik: 'Verifierad svensk arbetsmarknadsdata',
            ingress: 'Inga blogginlägg och inga forumtrådar. Karriärguiden hämtar svaren ur sex pålitliga källor och visar exakt var informationen kommer ifrån.',
            rader: KALLOR,
          },
        ]}
        citat={{
          text: 'Jag kollade marknadslön i Karriärguiden innan mitt lönesamtal och fick siffror direkt från SCB plus argument jag kunde använda. Gick in i samtalet med en kvarts förberedelse och kom ut med 8 000 kr mer i månaden.',
          namn: 'Emma, 34, Malmö',
          roll: 'marknadschef på ett medtechbolag',
        }}
        slut={{
          eyebrow: 'Allt-paketet',
          rubrik: 'Sluta googla. Fråga någon som vet.',
          text: `${FREE_CHAT_MESSAGES_PER_ACCOUNT} meddelanden ingår gratis på ditt konto, utan kortuppgift. Coachen utan tak, med ditt CV i samtalet, ingår i Allt: ${PLAN_BY_KEY.all_week.amount} kr i veckan eller ${PLAN_BY_KEY.all_month.amount} kr i månaden.`,
          knapp: { text: 'Fråga Karriärguiden gratis', href: '/register' },
          sekundar: { text: 'Se hur det fungerar', href: '#sa-funkar-det' },
        }}
        faq={{
          rubrik: 'Vanliga frågor om karriärrådgivning',
          ingress: (
            <>
              Hittar du inte svaret?{' '}
              <a href="mailto:support@jobbcoach.ai" className="text-ink-1 underline decoration-kant-stark underline-offset-4">
                Hör av dig
              </a>
              .
            </>
          ),
          fragor: JOBBCOACHEN_FAQ_ITEMS,
        }}
      />
    </>
  )
}

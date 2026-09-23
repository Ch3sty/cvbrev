/**
 * /verktyg/jobbmatchning på verktygsmallen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5). h1, title, description och schemat (WebApplication, HowTo,
 * FAQPage) är oförändrade; bara ramen och sektionernas form är nya.
 */
import VerktygsSida from '@/components/verktyg/VerktygsSida'
import JobbmatchningLiveDemo from './components/JobbmatchningLiveDemo'
import { JOBBMATCHNING_FAQ_ITEMS } from './components/jobbmatchning-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { IlluScenMatch } from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY } from '@/lib/plans/plans'
import { FREE_TIER_JOB_LIMIT } from '@/lib/jobmatching/freeLimit'

const DATAPUNKTER = [
  { rubrik: 'Yrkesroller', text: 'Vi översätter dina tidigare titlar till JobTech Taxonomy, den officiella svenska yrkesklassificeringen. Så vet vi att "frontend-utvecklare" och "webbutvecklare" är närliggande roller.' },
  { rubrik: 'Kompetenser', text: 'Tekniska och mjuka kompetenser ur ditt CV, från enskilda program till hela erfarenhetsområden. Vi ställer dem mot kraven i varje annons.' },
  { rubrik: 'Utbildning', text: 'Examensnivå och inriktning. Vissa tjänster kräver en viss utbildning, andra ser den som meriterande. Vi räknar med båda.' },
  { rubrik: 'Plats', text: 'Vi vet var du bor och sorterar bort jobb som ligger orimligt långt bort. Radien ställer du själv, från 5 km till hela Sverige.' },
  { rubrik: 'Språk', text: 'Vilka språk du kan och på vilken nivå. Det avgör internationella roller och tjänster där svenska är ett krav.' },
  { rubrik: 'Erfarenhetsnivå', text: 'År i branschen och senioritet. Vi matchar inte en junior mot en chefsroll, och inte en senior mot en traineetjänst.' },
]

const VAD_DU_FAR = [
  { rubrik: 'Roller du inte tänkt på själv', text: 'Det är lätt att stirra sig blind på sin titel. Vi vet att en undersköterska också passar som stödassistent, vårdbiträde och boendestödjare, och visar tjänster du aldrig hade hittat med samma sökord som förra gången.' },
  { rubrik: 'Matchning i procent per annons', text: 'Varje jobb får ett tal mellan 0 och 100 som visar hur väl ditt CV svarar mot kraven. Du ser direkt var du har störst chans.' },
  { rubrik: 'Tusentals lediga jobb', text: 'Hela Arbetsförmedlingens annonsbas, Sveriges största samling lediga tjänster, från offentlig sektor till privata bolag.' },
  { rubrik: 'Avstånd du väljer själv', text: 'Sätt en radie från 5 km till hela Sverige. Du bestämmer om du vill pendla eller hålla dig nära hemmet.' },
  { rubrik: 'Uppdaterat varje dag', text: 'Nya jobb syns i din lista inom timmar efter att de publicerats. Tillsatta tjänster försvinner av sig själva.' },
  { rubrik: 'Bäst träff överst', text: 'Toppmatchningarna hamnar först. Du slipper bläddra igenom hundratals annonser för att hitta de få som passar.' },
]

export default function JobbmatchningSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai jobbmatchning',
    url: 'https://www.jobbcoach.ai/verktyg/jobbmatchning',
    description:
      'Hitta jobb som matchar ditt CV automatiskt. Vi söker bland tusentals lediga tjänster i Sverige från Arbetsförmedlingen och ger dig matchnings-procent per annons.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '3 fulla träffar med skälen gratis, ingen kortuppgift',
    },
    featureList:
      'Tusentals lediga jobb från Arbetsförmedlingen, matchnings-procent per annons, distans-filter, daglig uppdatering, sortering på relevans, alla branscher i Sverige',
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så hittar du jobb med Jobbcoach.ai jobbmatchning',
    description:
      'Fyra steg från aktiverat CV till sorterade jobbmatchningar: aktivera CV, vi extraherar yrkesdata, vi söker tusentals annonser, du får jobben sorterade efter relevans.',
    totalTime: 'PT3M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Aktivera ditt CV',
        text:
          'Ladda upp ett CV eller välj ett du redan sparat. Aktivering tar några sekunder.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Vi extraherar yrkesdata',
        text:
          'Vi läser ut yrkesroller, kompetenser, utbildning, plats och språk automatiskt.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Vi söker tusentals annonser',
        text:
          'Vi söker direkt mot Arbetsförmedlingens öppna API i hela Sverige.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Du får jobben sorterade',
        text:
          'Varje annons får matchnings-procent. Toppmatchningarna hamnar överst.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: JOBBMATCHNING_FAQ_ITEMS.map((item) => ({
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
      <RedirectLoggedIn to="/dashboard/jobbmatchning" />
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
          { name: 'Jobbmatchning', href: '/verktyg/jobbmatchning' },
        ]}
        eyebrow="Jobbmatchning · fler dörrar än din titel"
        h1="Hitta jobb som matchar ditt CV automatiskt"
        ingress="Aktivera ditt CV så söker vi bland tusentals lediga jobb från Arbetsförmedlingen."
        fet="Vi matchar dig också mot roller du inte tänkt på själv, så du får fler dörrar att knacka på än om du sökt på din titel."
        primar={{ text: 'Hitta jobb gratis', href: '/register' }}
        sekundar={{ text: 'Så fungerar det', href: '#sa-funkar-det' }}
        loften={[
          { tal: `${FREE_TIER_JOB_LIMIT} träffar`, text: 'gratis med skälen' },
          { tal: 'Varje dag', text: 'nya annonser in, tillsatta ut' },
          { tal: 'Hela Sverige', text: 'alla branscher' },
        ]}
        scen={<IlluScenMatch className="h-auto w-full" />}
        handling={<JobbmatchningLiveDemo />}
        handlingId="demo"
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress: 'Fyra steg från aktiverat CV till en lista sorterad efter hur väl du passar.',
          rader: howToSchema.step.map((s) => ({ rubrik: s.name, text: s.text })),
          lank: { text: 'Hitta jobb nu', href: '/register' },
        }}
        kontroll={{
          eyebrow: 'Vad vi läser ut',
          rubrik: 'Sex datapunkter ur ditt CV',
          ingress: 'Du fyller inte i något för hand. Vi hämtar allt matchningen behöver direkt ur ditt CV.',
          rader: DATAPUNKTER,
        }}
        extra={[
          {
            eyebrow: 'Vad du får',
            rubrik: 'Sex skäl att låta oss söka åt dig',
            ingress: 'Vi söker bredare än du hinner själv och visar tjänster du faktiskt har chans att få.',
            rader: VAD_DU_FAR,
          },
        ]}
        citat={{
          text: 'Jag hade scrollat genom Arbetsförmedlingen i veckor och blev bara mer förvirrad. Aktiverade mitt CV här och fick fyra jobb med över 80 procents matchning på första sökningen. Det kändes som att någon faktiskt hade läst mitt CV.',
          namn: 'Sofia, 29, Stockholm',
          roll: 'frontend-utvecklare, nu på Spotify',
        }}
        slut={{
          eyebrow: 'Allt-paketet',
          rubrik: 'Hitta ditt nästa jobb automatiskt.',
          text: `Aktivera ditt CV och se dina ${FREE_TIER_JOB_LIMIT} bästa träffar med skälen utskrivna, utan kortuppgift. Alla träffar, varje dag, ingår i Allt: ${PLAN_BY_KEY.all_week.amount} kr i veckan eller ${PLAN_BY_KEY.all_month.amount} kr i månaden, utan bindningstid.`,
          knapp: { text: 'Hitta jobb gratis', href: '/register' },
          sekundar: { text: 'Se CV-exempel först', href: '/cv-exempel' },
        }}
        faq={{
          rubrik: 'Vanliga frågor om att söka jobb',
          ingress: (
            <>
              Hittar du inte svaret?{' '}
              <a href="mailto:support@jobbcoach.ai" className="text-ink-1 underline decoration-kant-stark underline-offset-4">
                Hör av dig
              </a>
              .
            </>
          ),
          fragor: JOBBMATCHNING_FAQ_ITEMS,
        }}
      />
    </>
  )
}

/**
 * /verktyg/cv-mallar på verktygsmallen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5).
 *
 * SEO-roll: produkt-/funktionsdemo, INTE huvudsidan för "cv mall"-sökintent.
 * Den huvudsidan är /cv-mallar (kortare URL, optimerad för sökord).
 * Därför sätter vi canonical till /cv-mallar så Google förstår att
 * /verktyg/cv-mallar är en alternativ vy och inte ska konkurrera om ranking.
 *
 * h1, metadata och schemat (ItemList dynamisk från SIMPLE_TEMPLATES, HowTo,
 * FAQPage) är oförändrade; bara ramen och sektionernas form är nya.
 */
import type { Metadata } from 'next'
import { SIMPLE_TEMPLATES, TEMPLATE_COUNT, FREE_TEMPLATE_COUNT } from '@/lib/cv/simple-templates'

export const metadata: Metadata = {
  title: 'CV-mallar: välj, fyll i och ladda ner | Jobbcoach.ai',
  description:
    'Välj bland professionella CV-mallar, fyll i dina uppgifter och ladda ner som PDF. Gratis att börja, ATS-säkra och byggda för svenska arbetsgivare.',
  alternates: {
    canonical: 'https://www.jobbcoach.ai/cv-mallar',
  },
  robots: { index: true, follow: true },
}
import VerktygsSida from '@/components/verktyg/VerktygsSida'
import CVMallarLiveDemo from './components/CVMallarLiveDemo'
import CVMallarGalleri from './components/CVMallarGalleri'
import { CV_MALLAR_FAQ_ITEMS } from './components/cv-mallar-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { IlluScenMallar } from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY } from '@/lib/plans/plans'

const CV_VECKAN = PLAN_BY_KEY.cv_week

const STEG = [
  { rubrik: 'Välj en mall', text: 'Bläddra bland modern, traditionell och kreativ stil. Klicka på den som passar din bransch och din stil bäst.' },
  { rubrik: 'Fyll i dina uppgifter', text: 'Formuläret leder dig genom varje avsnitt. Du kan hämta uppgifter från LinkedIn eller utgå från ett befintligt CV.' },
  { rubrik: 'Vi flyttar in innehållet', text: 'Allt du fyller i hamnar automatiskt på rätt plats i mallen. Byter du mall efteråt följer innehållet med, utan att du fyller i något på nytt.' },
  { rubrik: 'Ladda ner som PDF eller Word', text: 'Exportera ditt CV när du är nöjd. Det sparas i ditt konto, så du kan komma tillbaka och redigera när som helst.' },
]

const FUNKTIONER = [
  { rubrik: 'Byggda för rekryteringssystem', text: 'Alla mallar är gjorda för de rekryteringssystem svenska arbetsgivare sorterar med. Rena rubriker, vanlig text och ingen formatering som förvirrar systemet.' },
  { rubrik: 'PDF och Word', text: 'Ladda ner ditt CV i båda formaten. PDF för de flesta ansökningar, Word när annonsen ber om ett redigerbart format.' },
  { rubrik: 'Profilbild där det passar', text: 'Vissa av mallarna i CV-paketet har plats för profilbild. Det passar i branscher där det personliga intrycket räknas, som vård, utbildning och service.' },
  { rubrik: 'LinkedIn synligt i sidhuvudet', text: 'I flera av mallarna i CV-paketet syns din LinkedIn-profil tydligt. Då kan rekryteraren enkelt kontrollera dina meriter.' },
  { rubrik: 'Redigera när du vill', text: 'Allt sparas i ditt konto. Kom tillbaka, lägg till ett nytt jobb eller byt mall utan att börja om.' },
  { rubrik: 'Fungerar i mobilen', text: 'Hela CV-byggaren fungerar lika bra i telefonen som på datorn. Börja på bussen och fortsätt hemma vid skrivbordet.' },
]

export default function CVMallarSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

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
        // Google föredrar raster (webp/png) framför SVG för produktbilder.
        // SVG:n används fortfarande i appens UI; här pekar vi på webp-versionen.
        image: `https://www.jobbcoach.ai${tpl.imagePath.replace(/\.svg$/, '.webp')}`,
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
      <RedirectLoggedIn to="/dashboard/cv-mallar" />
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

      <VerktygsSida
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Verktyg', href: '/funktioner' },
          { name: 'CV-mallar', href: '/verktyg/cv-mallar' },
        ]}
        eyebrow="CV-mallar · välj, fyll i, ladda ner"
        h1="Professionella CV-mallar för svenska arbetsgivare"
        ingress="Välj mellan modern, traditionell och kreativ stil. Alla mallar läses rätt av rekryteringssystemen och är redo att fyllas i."
        fet="Du behöver inte börja från ett tomt papper."
        primar={{ text: 'Bygg ditt CV gratis', href: '/register' }}
        sekundar={{ text: 'Se alla mallar', href: '#mall-galleri' }}
        loften={[
          { tal: `${TEMPLATE_COUNT}`, text: 'mallar i tre stilar' },
          { tal: `${FREE_TEMPLATE_COUNT}`, text: 'helt gratis' },
          { tal: 'PDF + Word', text: 'redo att skicka' },
        ]}
        scen={<IlluScenMallar className="h-auto w-full" />}
        handling={<CVMallarLiveDemo />}
        handlingId="valj-mall"
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress: 'Fyra steg från val till färdig PDF. Du fyller i dina uppgifter en gång och byter mall när du vill.',
          rader: STEG,
          lank: { text: 'Bygg ditt CV nu', href: '/register' },
        }}
        kontroll={{
          eyebrow: 'Vad du får',
          rubrik: 'Mer än en snygg layout',
          ingress: 'Varje mall hjälper dig genom hela ansökan, inte bara med hur sidan ser ut.',
          rader: FUNKTIONER,
        }}
        fritt={<CVMallarGalleri />}
        citat={{
          text: 'Jag hade suttit i två veckor och försökt få Word att se rätt ut. Jag bytte till en av era mallar, fyllde i mina uppgifter på tjugo minuter och hade tre intervjuer bokade veckan efter.',
          namn: 'Anna, 28, Malmö',
          roll: 'ekonomiassistent, nu på SEB, från två veckor till tjugo minuter',
        }}
        slut={{
          eyebrow: CV_VECKAN.name,
          rubrik: 'Välj din mall och bygg ditt CV.',
          text: `Tjugo minuter från val till färdig PDF. ${FREE_TEMPLATE_COUNT} mallar är gratis, utan kortuppgift. Alla ${TEMPLATE_COUNT} mallar, hela CV-analysen och nedladdning i Word och PDF ingår i ${CV_VECKAN.name}, ${CV_VECKAN.amount} kr i veckan.`,
          knapp: { text: 'Bygg mitt CV gratis', href: '/register' },
          sekundar: { text: 'Se CV-exempel först', href: '/cv-exempel' },
        }}
        faq={{
          rubrik: 'Det du undrar om CV-mallarna',
          ingress: (
            <>
              Hittar du inte svaret?{' '}
              <a href="mailto:support@jobbcoach.ai" className="text-ink-1 underline decoration-kant-stark underline-offset-4">
                Hör av dig
              </a>
              .
            </>
          ),
          fragor: CV_MALLAR_FAQ_ITEMS,
        }}
      />
    </>
  )
}

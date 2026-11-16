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
import { WORD_TEMPLATE_COUNT, WORD_TEMPLATE_COUNT_ORD, wordMallarSomText } from '@/lib/cv/template-antal'

export const metadata: Metadata = {
  title: 'CV-mallar: välj, fyll i och ladda ner | Jobbcoach.ai',
  description:
    'Välj bland professionella CV-mallar, fyll i dina uppgifter och ladda ner som PDF. Gratis att börja, ATS-säkra och byggda för svenska arbetsgivare.',
  alternates: {
    canonical: 'https://www.jobbcoach.ai/cv-mallar',
  },
  robots: { index: true, follow: true },
}
import VerktygsMall from '@/components/publikt/VerktygsMall'
import CVMallarGalleri from './components/CVMallarGalleri'
import ProvaProvider from '@/components/cv/Dokument/prova/ProvaKontext'
import Uppladdning from '@/components/cv/Dokument/prova/Uppladdning'
import ProvaArbetsyta from '@/components/cv/Dokument/prova/ProvaArbetsyta'
import { MALL_KATALOG, MALL_ANTAL, GRATIS_ANTAL, WORD_ANTAL } from '@/lib/cv/mallval/katalog'
import { prisInfo } from '@/lib/cv/mallval/pris.server'
import { CV_MALLAR_FAQ_ITEMS } from './components/cv-mallar-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { PLAN_BY_KEY, SALD_PLAN, paketKort, paketMedPris, paketNamn } from '@/lib/plans/plans'

/**
 * Avsnittet "CV-mallar för Word" med ankaret #word (docs/plan-cv-word-2026-11-15.md
 * avsnitt 8.2): artiklarna om Word-mallar länkar hit. En rad per mall, med
 * målgruppen och det som gör Word-versionen till sig själv.
 */
const WORD_RADER = [
  { rubrik: 'Norrsken', text: 'Alla yrken och tjänstemän. Calibri med orange accent på rubrikerna.' },
  { rubrik: 'Student', text: 'Studenter och nyexaminerade. Utbildning och projekt först, cyan linje under namnet.' },
  { rubrik: 'Tidlös', text: 'Juridik, bank och akademi. Garamond, centrerat huvud och en svart hårlinje.' },
  { rubrik: 'Myndighet', text: 'Offentlig sektor och handläggare. Arial, marinblå linjer och paragraftecken som punkter.' },
  { rubrik: 'Stack', text: 'Utvecklare, data och tech. Kompetenserna först, datum och kontakt i Consolas.' },
  { rubrik: 'Hantverkare', text: 'Bygg, el, VVS och praktiska yrken. Behörigheter och körkort i ett eget block.' },
]

const STEG = [
  { rubrik: 'Välj en mall', text: 'Bläddra bland modern, traditionell och kreativ stil. Klicka på den som passar din bransch och din stil bäst.' },
  { rubrik: 'Fyll i dina uppgifter', text: 'Formuläret leder dig genom varje avsnitt. Du kan utgå från ett befintligt CV, eller en PDF av din LinkedIn-profil, så läser vi ut uppgifterna åt dig.' },
  { rubrik: 'Vi flyttar in innehållet', text: 'Allt du fyller i hamnar automatiskt på rätt plats i mallen. Byter du mall efteråt följer innehållet med, utan att du fyller i något på nytt.' },
  { rubrik: `Ladda ner som PDF, eller Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna`, text: 'Ladda ner ditt CV när du är nöjd. Det sparas i ditt konto, så du kan komma tillbaka och redigera när som helst.' },
]

const FUNKTIONER = [
  { rubrik: 'Byggda för rekryteringssystem', text: 'Alla mallar är gjorda för de rekryteringssystem svenska arbetsgivare sorterar med. Rena rubriker, vanlig text och ingen formatering som förvirrar systemet.' },
  { rubrik: 'PDF, och Word i utvalda mallar', text: `Alla mallar laddas ner som PDF, och ${WORD_TEMPLATE_COUNT_ORD} av dem finns också som Word-fil i ${paketKort()}. PDF för de flesta ansökningar, Word när du vill ändra själv eller när annonsen ber om ett redigerbart format.` },
  { rubrik: 'Profilbild där det passar', text: 'Vissa av mallarna i Premium har plats för profilbild. Det passar i branscher där det personliga intrycket räknas, som vård, utbildning och service.' },
  { rubrik: 'LinkedIn synligt i sidhuvudet', text: 'I flera av mallarna i Jobbcoach Premium syns din LinkedIn-profil tydligt. Då kan rekryteraren enkelt kontrollera dina meriter.' },
  { rubrik: 'Redigera när du vill', text: 'Allt sparas i ditt konto. Kom tillbaka, lägg till ett nytt jobb eller byt mall utan att börja om.' },
  { rubrik: 'Fungerar i mobilen', text: 'Hela CV-byggaren fungerar lika bra i telefonen som på datorn. Bygg och spara i telefonen, så ligger CV:t i ditt konto när du sätter dig vid skrivbordet.' },
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
          price: tpl.tier === 'free' ? '0' : String(PLAN_BY_KEY[SALD_PLAN].amount),
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
      'Fyra steg från val till färdig PDF: välj mall, fyll i, vi flyttar in innehållet, ladda ner.',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    // Samma data som de synliga stegen, så att schemat och sidan säger samma sak.
    step: STEG.map((st, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: st.rubrik,
      text: st.text,
    })),
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

      {/* Ägarens punkt 9 och skissens yta 1: uppladdningen utan konto högst
          upp i hjälten, resultatet på samma sida direkt under (UX:s
          datorlayout: arket 600 px, mallkolumnen 336 px, fast rad 64 px). */}
      <ProvaProvider katalog={MALL_KATALOG} surface="mallsida" pris={prisInfo()}>
      <VerktygsMall
        rum="cv"
        telefon={<Uppladdning />}
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Verktyg', href: '/funktioner' },
          { name: 'CV-mallar', href: '/verktyg/cv-mallar' },
        ]}
        eyebrow="CV-mallar, välj, fyll i, ladda ner"
        h1="Professionella CV-mallar för svenska arbetsgivare"
        ingress={`Ladda upp ditt CV så ser du det i alla mallar direkt, utan konto. Alla ${MALL_ANTAL} har gått genom vår egen CV-läsare, och kontaktuppgifter, rubriker och ordning kom ut rätt i varje mall.`}
        sekundar={{ text: 'Se alla mallar', href: '#mall-galleri' }}
        loften={[
          { tal: `${MALL_ANTAL}`, text: 'ATS-säkra mallar, testade för rekryteringssystem' },
          { tal: `${GRATIS_ANTAL}`, text: 'gratis' },
          { tal: `${WORD_ANTAL}`, text: 'även som Word' },
        ]}
        handling={<ProvaArbetsyta />}
        handlingId="valj-mall"
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress: 'Fyra steg från val till färdig PDF. Du fyller i dina uppgifter en gång och byter mall när du vill.',
          rader: STEG,
          lank: { text: 'Bygg ditt CV nu', href: '/register?borja=cv' },
        }}
        kontroll={{
          eyebrow: 'Vad du får',
          rubrik: 'Mer än en snygg layout',
          ingress: 'Varje mall hjälper dig genom hela ansökan, inte bara med hur sidan ser ut.',
          rader: FUNKTIONER,
        }}
        extra={[
          {
            id: 'word',
            eyebrow: 'Word',
            rubrik: 'CV-mallar för Word',
            ingress: `Av våra mallar laddas ${WORD_TEMPLATE_COUNT_ORD} också ner som Word-fil: ${wordMallarSomText()}. Övriga mallar laddas ner som PDF, och Word-filen ingår i ${paketNamn(SALD_PLAN)}. Word vill du ha när du själv ska ändra i CV:t efteråt, eller när ett bemanningsföretag eller en arbetsgivare i offentlig sektor ber om ett redigerbart format för att klistra in CV:t i sina egna system.`,
            rader: WORD_RADER,
          },
        ]}
        fritt={<CVMallarGalleri mallar={MALL_KATALOG} />}
        slut={{
          eyebrow: paketMedPris(SALD_PLAN),
          rubrik: 'Välj din mall och bygg ditt CV.',
          text: `Tjugo minuter från val till färdig PDF. ${FREE_TEMPLATE_COUNT} mallar är gratis, utan kortuppgift. Alla ${TEMPLATE_COUNT} mallar, hela CV-analysen, PDF utan tak och Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna ingår i ${paketNamn(SALD_PLAN)}.`,
          knapp: { text: 'Bygg mitt CV gratis', href: '/register?borja=cv' },
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
      </ProvaProvider>
    </>
  )
}

/**
 * /verktyg/cv-mallar på verktygsmallen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5).
 *
 * SEO-roll: produkt-/funktionsdemo, INTE huvudsidan för "cv mall"-sökintent.
 * Den huvudsidan är /cv-mallar (kortare URL, optimerad för sökord).
 * Därför sätter vi canonical till /cv-mallar så Google förstår att
 * /verktyg/cv-mallar är en alternativ vy och inte ska konkurrera om ranking.
 *
 * h1 och metadata oförändrade. Schemat (ItemList ur MALL_KATALOG, HowTo,
 * FAQPage) läser katalogen sedan mallutbudet 2026-11-16; SEO-strategens beslut
 * samma dag: Product per mall, url till mallens ankare på /cv-mallar.
 */
import type { Metadata } from 'next'
import { WORD_TEMPLATE_COUNT_ORD, talSomOrd, wordMallarSomText } from '@/lib/cv/template-antal'

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
 * avsnitt 8.2): artiklarna om Word-mallar länkar hit. En rad per Word-mall i
 * katalogens ordning; en mall som stryks ur katalogen försvinner härifrån.
 * Raderna skrivna av SEO-strategen och copywritern 2026-11-16; saknas en rad
 * används katalogens stil.
 */
const WORD_TEXT: Readonly<Record<string, string>> = {
  linne: 'Gratismallen i en spalt, och Word-filen kostar inget extra. Georgia i namnet, Calibri i texten och en tunn linje under rubrikerna.',
  bjork: 'Gratismallen med foto, också den gratis som Word. Centrerat huvud med rund fotoplats och en accentstapel vid varje rubrik.',
  koppar: 'Färgat huvudband med namnet i vitt och rund fotoplats. Syns utan att tumma på läsbarheten.',
  kalksten: 'Ljusgrå sidospalt med eget fält för legitimation och behörigheter, kvadratiskt foto. Bra när intygen väger tungt.',
  granit: 'Mörkt huvudband som fortsätter i en mörk högerspalt, rund fotoplats. Kontrast som märks i högen.',
  kolumn: 'Garamond, med rubrikerna i en egen vänsterkolumn. Lugn och lätt att skumma.',
  arsring: 'Årtalen i vänsterkolumnen längs en lodrät accentlinje. Gör karriärstegen tydliga.',
  antikva: 'Times New Roman, centrerat huvud och dubbel linje. Den formella mallen för juridik, bank och offentlig sektor.',
  fasad: 'Stort namn i versaler bakom en accentkant, kvadratiskt foto. Rakt och tydligt.',
  raster: 'Verdana, rubrikerna som tonade band och kompetenserna i två spalter. Många kompetenser utan att det blir rörigt.',
  folio: 'Garamond, högerställt huvud och kursiva rubriker. Elegant utan att bli stel.',
  stal: 'Profilen i full bredd, sedan två spalter med accentlinjer. Rymmer lång erfarenhet och många uppdrag.',
}
const WORD_RADER = MALL_KATALOG.filter((m) => m.word).map((m) => ({ rubrik: m.namn, text: WORD_TEXT[m.id] ?? `${m.stil}.` }))

/** Word-mallarna i Premium, ur katalogen. */
const WORD_PREMIUM_ANTAL = MALL_KATALOG.filter((m) => m.word && m.niva === 'premium').length

/** Mallarna med fotoplats, ur katalogen. */
const FOTO_ANTAL = MALL_KATALOG.filter((m) => m.foto).length
const FOTO_GRATIS = MALL_KATALOG.filter((m) => m.foto && m.niva === 'gratis').map((m) => m.namn)
const versal = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
/** "Linne och Björk", ur katalogen. */
const GRATIS_NAMN = (() => {
  const n = MALL_KATALOG.filter((m) => m.niva === 'gratis').map((m) => m.namn)
  return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} och ${n[n.length - 1]}`
})()

/** Formfamiljen som svensk kategori i schemat (SEO-strategen 2026-11-16). */
const KATEGORI: Readonly<Record<string, string>> = {
  'en-spalt': 'CV-mall i en spalt',
  sidospalt: 'CV-mall med två spalter',
  marginal: 'CV-mall med marginalrubriker',
  konstnarlig: 'Konstnärlig CV-mall',
}

/** Formatet i schemats beskrivning: gratismallarna laddas ner gratis i båda formaten, Word i en premiummall ingår i Premium. */
function formatText(gratis: boolean, word: boolean): string {
  if (gratis) return word ? 'Gratis som PDF och Word-fil' : 'Gratis som PDF'
  return word ? 'PDF och Word-fil, ingår i Jobbcoach Premium' : 'PDF, ingår i Jobbcoach Premium'
}

const STEG = [
  { rubrik: 'Välj en mall', text: 'Bläddra bland mallar i en spalt, med sidospalt, med rubriker i marginalen eller i konstnärlig form. Alla passar alla yrken, så välj den du vill att rekryteraren ska se först, och byt när du vill.' },
  { rubrik: 'Fyll i dina uppgifter', text: 'Formuläret leder dig genom varje avsnitt. Du kan utgå från ett befintligt CV, eller en PDF av din LinkedIn-profil, så läser vi ut uppgifterna åt dig.' },
  { rubrik: 'Vi flyttar in innehållet', text: 'Allt du fyller i hamnar automatiskt på rätt plats i mallen. Byter du mall efteråt följer innehållet med, utan att du fyller i något på nytt.' },
  { rubrik: `Ladda ner som PDF, eller Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna`, text: `Ladda ner ditt CV som PDF när du är nöjd, eller som Word-fil i ${WORD_TEMPLATE_COUNT_ORD} av mallarna. I gratismallarna ${GRATIS_NAMN} väljer du fritt mellan de två formaten, Word i de övriga ingår i ${paketKort()}. CV:t sparas i ditt konto, så du kan komma tillbaka och ändra när som helst.` },
]

const FUNKTIONER = [
  { rubrik: 'Byggda för rekryteringssystem', text: `Varje mall har gått genom vår egen CV-läsare med korta och långa CV innan den fick plats i utbudet. Namn, kontaktuppgifter, rubriker och ordning kom ut rätt i alla ${MALL_ANTAL}, också i mallarna med sidospalt. En mall som inte klarar testet tar vi inte med.` },
  { rubrik: 'PDF, och Word i utvalda mallar', text: `Alla mallar laddas ner som PDF. ${versal(WORD_TEMPLATE_COUNT_ORD)} av dem finns också som Word-fil, gratismallarna ${GRATIS_NAMN} inräknade, så din gratisfil kan lika gärna vara en Word-fil. Word i de övriga Word-mallarna ingår i ${paketKort()}. PDF för de flesta ansökningar, Word när du vill ändra själv eller när annonsen ber om ett redigerbart format.` },
  { rubrik: 'Fyra färger och rubriker för din bransch', text: 'Varje mall finns i fyra färger, och rubrikerna väljer du ur tolv uppsättningar för olika branscher: "Klinisk erfarenhet" för vården, "Behörigheter och körkort" för bygg och hantverk, "System och verktyg" för IT. Passar ingen skriver du en egen rubrik.' },
  { rubrik: 'Ordningen du vill ha, på en sida', text: 'Sätt intygen, utbildningen eller kompetenserna först, beroende på vad rekryteraren ska se först i just din ansökan. Ligger CV:t strax över en sida drar valet Få plats på en sida ihop det utan att du behöver stryka något.' },
  { rubrik: 'Profilbild där det passar', text: `${versal(talSomOrd(FOTO_ANTAL))} av mallarna har plats för profilbild${FOTO_GRATIS.length ? `, bland dem gratismallen ${FOTO_GRATIS.join(' och ')}` : ''}. Det passar i branscher där det personliga intrycket räknas, som vård, utbildning och service.` },
  { rubrik: 'LinkedIn synligt i sidhuvudet', text: 'Kontaktraden har plats för LinkedIn och webbplats i alla mallar. Då kan rekryteraren enkelt kontrollera dina meriter.' },
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
      'Professionella CV-mallar i en spalt, med sidospalt, med marginalrubriker och i konstnärlig form. Testade mot rekryteringssystem och anpassade för svenska arbetsgivare.',
    numberOfItems: MALL_ANTAL,
    itemListElement: MALL_KATALOG.map((m, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: `CV-mall ${m.namn}`,
        description: `${m.stil}. ${formatText(m.niva === 'gratis', m.word)}. ATS-testad och passar alla yrken.`,
        // Miniatyren i webp, 300 x 424 px (över Googles minsta bildyta).
        image: `https://www.jobbcoach.ai${m.bild.stor}`,
        category: KATEGORI[m.familj] ?? 'CV-mall',
        // brand löser GSC-varningen "No global identifier" (Google accepterar
        // brand ELLER gtin; en digital CV-mall har ingen gtin). sku = stabil id.
        brand: { '@type': 'Brand', name: 'Jobbcoach.ai' },
        sku: m.id,
        // Ankaret på mallens miniatyr i galleriet på /cv-mallar (provsidan är noindex).
        url: `https://www.jobbcoach.ai/cv-mallar#mall-${m.id}`,
        offers: {
          '@type': 'Offer',
          price: m.niva === 'gratis' ? '0' : String(PLAN_BY_KEY[SALD_PLAN].amount),
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
        eyebrow="Se ditt CV i våra mallar"
        h1="Professionella CV-mallar för svenska arbetsgivare"
        ingress={`Ladda upp ditt CV så ser du det i alla ${MALL_ANTAL} mallar direkt, utan konto. Varje mall har gått genom vår egen CV-läsare innan den fick plats här, och namn, kontaktuppgifter, rubriker och ordning kom ut rätt i alla. Välj färg, typsnitt och rubriker för din bransch, och ladda ner som PDF när du är nöjd.`}
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
            ingress: `Behöver du en gratis CV-mall i Word? ${versal(WORD_TEMPLATE_COUNT_ORD)} av våra mallar laddas också ner som Word-fil (.docx): ${wordMallarSomText()}. Gratismallarna ${GRATIS_NAMN} hämtar du som Word utan att betala något, en fil per konto i det format du väljer. Word i de övriga ${talSomOrd(WORD_PREMIUM_ANTAL)} Word-mallarna ingår i ${paketNamn(SALD_PLAN)}. Word vill du ha när du själv ska ändra i CV:t efteråt, eller när ett bemanningsföretag eller en arbetsgivare i offentlig sektor ber om ett redigerbart format för att klistra in CV:t i sina egna system. Word-filen har gått genom samma läsning som PDF:en, så rubriker och ordning håller också där. De konstnärliga mallarna laddas ner som PDF.`,
            rader: WORD_RADER,
          },
        ]}
        fritt={<CVMallarGalleri mallar={MALL_KATALOG} />}
        slut={{
          eyebrow: paketMedPris(SALD_PLAN),
          rubrik: 'Välj din mall och bygg ditt CV.',
          text: `Tjugo minuter från val till färdig fil. ${GRATIS_NAMN} är gratis som PDF eller Word, en nedladdning utan kortuppgift. Alla ${MALL_ANTAL} mallar, nedladdning utan tak, Word-filen i alla ${WORD_TEMPLATE_COUNT_ORD} Word-mallar och hela CV-analysen ingår i ${paketNamn(SALD_PLAN)}.`,
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

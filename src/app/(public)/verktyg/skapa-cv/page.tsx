/**
 * /verktyg/skapa-cv på verktygsmallen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5). SEO-svepet 2026-11-17 (docs/plan-seo-cv-kluster-2026-11-17.md,
 * B1): texten, löftena, stegen och schemat beskriver nya byggaren "Direkt på
 * arket" i stället för de sju stegen. h1 står kvar (rankingsignal). Demon med
 * det gamla formulärflödet är borta (saas-leads P6); handlingen är en
 * stillbild av arket i förvalsmallen, länkad till provsidan.
 */
import Link from 'next/link'
import VerktygsMall from '@/components/publikt/VerktygsMall'
import SkarmSkapaCv from '@/components/publikt/telefon/skarmar/SkarmSkapaCv'
import { SKAPA_CV_FAQ_ITEMS } from './components/skapa-cv-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { MallMiniatyr } from '@/components/cv/MallMiniatyr'
import { ARTIKEL } from '@/components/cv/Dokument/texter'
import { SALD_PLAN, paketKort, paketMedPris } from '@/lib/plans/plans'
import { TEMPLATE_COUNT, FREE_TEMPLATE_COUNT, WORD_TEMPLATE_COUNT, WORD_TEMPLATE_COUNT_ORD, talSomOrd } from '@/lib/cv/template-antal'
import { FORVALD_MALL_ID, MALL_KATALOG, getMallKort } from '@/lib/cv/mallar/katalog'
import { FREE_CV_BYGG_AI_PER_ACCOUNT, PAID_CV_BYGG_AI_PER_DAY } from '@/lib/quota/quotaService'

const versal = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

/** Förslagen från Jobbcoachen, talen ur kvoterna (sälj S4: alltid "på ditt konto"). */
const FORSLAG_GRATIS = versal(talSomOrd(FREE_CV_BYGG_AI_PER_ACCOUNT))

const FUNKTIONER = [
  {
    rubrik: 'Mallar som rekryteringssystemen kan läsa',
    text: 'Alla mallar är byggda för systemen svenska arbetsgivare sorterar ansökningar med. Rena rubriker, läsbar struktur och ingen formatering som förvirrar maskinen.',
  },
  {
    rubrik: 'Arket är byggaren',
    text: 'Du skriver direkt i mallen. Tryck på ett avsnitt, fyll i och se raden landa där den ska stå. Grå exempeltext visar vad som brukar stå där och följer inte med i filen.',
  },
  {
    rubrik: 'Jobbcoachen skriver punkterna',
    text: `Tryck på Skriv punkter åt mig så föreslår Jobbcoachen punkter utifrån yrket och det du skrivit. Du väljer, ändrar eller hoppar över. ${FORSLAG_GRATIS} förslag ingår gratis på ditt konto. I Premium får du ${PAID_CV_BYGG_AI_PER_DAY} per dygn.`,
  },
  {
    rubrik: 'Rubriker som följer yrket',
    text: 'Skriv vilket jobb du söker så får avsnitten rubriker för din bransch, till exempel Klinisk erfarenhet i vården. Du kan också skriva en egen rubrik.',
  },
  {
    // Lagringsundantaget (ägarens besked 2026-11-17): beskriver hur nya
    // byggaren sparar, inget annat (ByggareClient.tsx, sparaServer).
    rubrik: 'Utkastet väntar på dig',
    text: 'CV:t sparas i ditt konto när du sparat första avsnittet, och sedan efter varje avsnitt. Du fortsätter där du slutade från Mina CV, på vilken enhet som helst.',
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

/** Förvalsmallen (Linne) som stillbild av arket (P6). */
const FORVALD = getMallKort(FORVALD_MALL_ID)!

const STEG = [
  {
    name: 'Skriv vilket jobb du söker',
    text: 'Yrkestiteln styr rubrikerna, den grå exempeltexten och Jobbcoachens förslag, så att CV:t talar branschens språk från början.',
  },
  {
    name: 'Ladda upp ett CV eller skriv från början',
    text: 'Har du ett CV i PDF eller Word, eller en PDF av din LinkedIn-profil, fyller vi i avsnitten åt dig. Annars börjar du på ett tomt ark.',
  },
  {
    name: 'Fyll i direkt på arket',
    text: 'Tryck på ett avsnitt och skriv. När du kommer till ett jobb trycker du på Skriv punkter åt mig så föreslår Jobbcoachen punkterna.',
  },
  {
    name: 'Välj mall och ladda ner',
    text: `Byt mall, färg och typsnitt utan att något försvinner, och ladda ner som PDF, eller som Word i de ${WORD_TEMPLATE_COUNT} Word-mallarna.`,
  },
]

export default function SkapaCvSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai CV-byggare',
    url: 'https://www.jobbcoach.ai/verktyg/skapa-cv',
    description: `Skapa CV gratis online med vår CV-byggare. Skriv direkt på arket i en färdig mall eller ladda upp ett CV du har, låt Jobbcoachen föreslå punkterna och ladda ner som PDF, eller Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna. Helt på svenska.`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Skapa CV helt gratis, ingen kortuppgift',
    },
    featureList: `CV-byggare direkt på arket, rubriker som följer yrket, förslag på punkter från Jobbcoachen, ATS-säkra mallar, PDF-nedladdning, Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna, uppladdning av befintligt CV, mobilanpassad`,
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så skapar du ett CV med Jobbcoach.ai',
    description: 'Fyra steg från yrkestitel till färdig fil: skriv vilket jobb du söker, ladda upp eller börja från början, fyll i direkt på arket och ladda ner.',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: STEG.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <VerktygsMall
        rum="cv"
        telefon={<SkarmSkapaCv />}
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Verktyg', href: '/funktioner' },
          { name: 'Skapa CV', href: '/verktyg/skapa-cv' },
        ]}
        eyebrow="Skapa CV, direkt på arket"
        h1="Skapa ditt CV gratis på minuter"
        ingress={`Skriv direkt på arket i den mall du valt, eller ladda upp ett CV du har så fyller vi i avsnitten. Jobbcoachen föreslår punkterna och du laddar ner som PDF, eller Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna.`}
        fet="Gratis att börja och helt på svenska."
        primar={{ text: 'Bygg mitt CV gratis', href: '/register?borja=cv' }}
        sekundar={{ text: 'Ladda upp ditt CV', href: '/cv-mallar#ladda-upp' }}
        loften={[
          { tal: 'På arket', text: 'du ser CV:t i mallen medan du skriver' },
          { tal: String(FREE_CV_BYGG_AI_PER_ACCOUNT), text: 'förslag på punkter från Jobbcoachen, gratis' },
          { tal: String(TEMPLATE_COUNT), text: `mallar, ${FREE_TEMPLATE_COUNT} gratis` },
        ]}
        handling={
          <Link
            href={`/cv-mallar/prova?mall=${FORVALD.id}`}
            data-cta-klick={`/cv-mallar/prova?mall=${FORVALD.id}`}
            className="pub-kort grid items-center gap-6 sm:grid-cols-[minmax(0,240px)_1fr]"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <MallMiniatyr
              mall={{ id: FORVALD.id, name: FORVALD.namn, imagePath: FORVALD.bild.stor, tier: 'free' }}
              under={ARTIKEL.mallrad(true, FORVALD.word)}
              className="mx-auto w-full max-w-[240px]"
            />
            <div>
              <p className="pub-kick">Så ser arket ut</p>
              <p className="pub-brod" style={{ marginTop: 8 }}>
                I byggaren skriver du direkt på arket i den mall du valt, här {FORVALD.namn}. Tryck på ett avsnitt och fyll i. Grå exempeltext
                visar vad som brukar stå där och följer inte med i filen.
              </p>
              <span className="pub-knapp" style={{ marginTop: 18 }}>
                Prova {FORVALD.namn} med ditt namn
              </span>
            </div>
          </Link>
        }
        handlingId="demo"
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress: 'Du skriver, vi sätter ihop. Inga krångliga Word-mallar att kämpa med.',
          rader: STEG.map((s) => ({ rubrik: s.name, text: s.text })),
          lank: { text: 'Skapa mitt CV gratis', href: '/register?borja=cv' },
        }}
        kontroll={{
          eyebrow: 'Vad du får',
          rubrik: 'Det här gör CV-byggandet enkelt',
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
            rubrik: 'Gör skillnad i varje ansökan',
            rader: [
              { rubrik: 'Ladda upp ditt gamla CV och börja där det slutade', text: 'Vi fyller i avsnitten åt dig, och du lägger tiden på att göra dem bättre.' },
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
          // S6: VerktygsMall tar text här, så raden står med ordinarie pris.
          eyebrow: paketMedPris(SALD_PLAN),
          rubrik: 'Skapa ditt CV gratis på minuter.',
          text: `Skriv direkt på arket, låt Jobbcoachen föreslå punkterna och ladda ner i en mall som systemen kan läsa. Du börjar gratis utan kortuppgift. Alla ${TEMPLATE_COUNT} mallar, Word i alla ${WORD_TEMPLATE_COUNT} Word-mallar, hela CV-analysen och nedladdning utan tak ingår i ${paketKort()}.`,
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

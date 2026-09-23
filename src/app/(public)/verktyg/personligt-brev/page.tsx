/**
 * /verktyg/personligt-brev på verktygsmallen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5). h1, title, description och schemat (WebApplication, HowTo,
 * FAQPage) är oförändrade; bara ramen och sektionernas form är nya.
 * Demon i heron ligger kvar som handlingen.
 */
import VerktygsSida from '@/components/verktyg/VerktygsSida'
import BrevLiveDemo from './components/BrevLiveDemo'
import { BREV_FAQ_ITEMS } from './components/brev-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { IlluScenBrev } from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY } from '@/lib/plans/plans'
import { LETTER_TEMPLATES } from '@/lib/letters/letter-templates'

/** Svensk text per brevmall. Antal och nivå kommer ur registret. */
const MALLTEXT: Record<string, { text: string; branscher: string }> = {
  classic: { text: 'Traditionell svensk standard.', branscher: 'Offentlig sektor, vård, utbildning' },
  minimalist: { text: 'Generösa marginaler och en lugn känsla.', branscher: 'Tech, design, konsult' },
  compact: { text: 'Kontaktuppgifterna på en rad och tät text.', branscher: 'Tech, fintech, moderna bolag' },
  modern: { text: 'Accentstreck och ett tydligt mottagarblock.', branscher: 'Marknadsföring, finans, konsult' },
  executive: { text: 'Sidofält för kontaktuppgifterna.', branscher: 'Bank, juridik, ledning' },
  creative: { text: 'Ett färgat sidhuvud som syns.', branscher: 'Design, reklam, media' },
  traditional: { text: 'Konservativ och med justerad text.', branscher: 'Bank, juridik, försäkring' },
}

const MALLAR = Object.values(LETTER_TEMPLATES)
const MALLANTAL = MALLAR.length
const GRATISMALLAR = MALLAR.filter((m) => m.tier === 'free').length

const SKRIVTIPS = [
  {
    rubrik: 'Använd annonsens egna ord',
    text: 'Står det "stakeholder management" i annonsen, skriv just den frasen och inte din egen variant. Rekryterare letar efter exakta termer när de skummar.',
  },
  {
    rubrik: 'Visa siffror, inte adjektiv',
    text: '"Drev försäljningen från 2 till 12 mkr på två år" säger mer än "duktig på försäljning". Konkreta resultat fastnar.',
  },
  {
    rubrik: 'Håll brevet under en sida',
    text: '250 till 350 ord räcker. Rekryteraren lägger runt 30 sekunder per ansökan, och korta brev blir lästa i högre grad än långa.',
  },
  {
    rubrik: 'Matcha företagets ton',
    text: 'En konsultbyrå behöver en annan ton än ett nystartat bolag. Läs deras webbplats: skriver de formellt eller lättsamt? Lägg dig nära det.',
  },
  {
    rubrik: 'Skriv tre stycken',
    text: 'Öppna med att visa att du läst annonsen. Förklara i mitten varför just du. Avsluta med ett tydligt nästa steg. Fler stycken gör brevet otydligt.',
  },
]

export default function PersonligtBrevSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai Personligt brev-verktyg',
    url: 'https://www.jobbcoach.ai/verktyg/personligt-brev',
    description:
      'Skräddarsy personliga brev som matchar jobbannonsen. Sju mallar, sex tonaliteter, ATS-optimerat. Export som PDF eller Word.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Första brevet gratis, sedan ett i veckan. Ingen kortuppgift',
    },
    featureList:
      '7 brevmallar, 6 tonaliteter, ATS-optimerat, PDF- och Word-export, sparade brev, jobbannons-matchning, svensk- och engelskspråkigt',
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så skapar du ett personligt brev med Jobbcoach.ai',
    description:
      'Fyra steg från tomt papper till färdig ansökan: välj CV, klistra in annons, välj mall och ton, ladda ner.',
    totalTime: 'PT4M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Välj ditt CV',
        text:
          'Ladda upp eller välj ett CV du redan sparat. Vår tjänst plockar ut din erfarenhet och dina styrkor.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Klistra in jobbannonsen',
        text:
          'Vi läser annonsen, identifierar nyckelkraven och matchar dem mot din bakgrund.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Välj mall och ton',
        text:
          'Sju mallar för olika branscher och sex tonalitetsval, från professionellt till entusiastiskt.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Ladda ner som PDF eller Word',
        text:
          'Granska, finjustera om du vill, exportera. Spara brevet i ditt konto för senare.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: BREV_FAQ_ITEMS.map((item) => ({
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
      <RedirectLoggedIn to="/dashboard/skapa-brev" />
      {/* Strukturerad data */}
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
          {
            name: 'Personligt brev',
            href: '/verktyg/personligt-brev',
          },
        ]}
        eyebrow="Personligt brev · skrivet mot annonsen"
        h1="Skräddarsy ditt brev till varje annons"
        ingress="Vi läser jobbannonsen och ditt CV, plockar ut nyckelorden som betyder något och skriver ett brev som låter som du. Mall, ton och språk väljer du själv."
        fet="Klart på några minuter."
        primar={{ text: 'Skapa ditt brev', href: '/register' }}
        sekundar={{ text: 'Så fungerar det', href: '#sa-funkar-det' }}
        loften={[
          { tal: '1 brev', text: 'gratis, utan kortuppgift' },
          { tal: '4 min', text: 'från annons till brev' },
          { tal: String(MALLANTAL), text: 'mallar, PDF och Word' },
        ]}
        scen={<IlluScenBrev className="h-auto w-full" />}
        handling={<BrevLiveDemo />}
        handlingId="demo"
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress: 'Fyra steg från tomt papper till färdig ansökan. Du gör valen, vi sätter ihop brevet.',
          rader: howToSchema.step.map((s) => ({ rubrik: s.name, text: s.text })),
          lank: { text: 'Börja skriva nu', href: '/register' },
        }}
        kontroll={{
          eyebrow: 'Mallar',
          rubrik: `${MALLANTAL} mallar, en för varje bransch`,
          ingress: `Alla mallar går att läsa för rekryteringssystemen svenska arbetsgivare använder. Byt mall utan att skriva om brevet. ${GRATISMALLAR} av dem är gratis och räcker långt för de flesta ansökningar, resten ingår i ${PLAN_BY_KEY.cv_week.name}, ${pris} kr i veckan.`,
          rader: MALLAR.map((m) => ({
            rubrik: m.name,
            text: (
              <>
                {MALLTEXT[m.id] ? `${MALLTEXT[m.id].text} Passar ${MALLTEXT[m.id].branscher.toLowerCase()}.` : m.description}{' '}
                <span className="text-ink-3">{m.tier === 'free' ? 'Gratis.' : `Ingår i ${PLAN_BY_KEY.cv_week.name}.`}</span>
              </>
            ),
          })),
        }}
        extra={[
          {
            eyebrow: 'Skrivtips',
            rubrik: 'Fem regler som höjer svarsfrekvensen',
            ingress: 'Vår tjänst följer dem automatiskt. Skriver du själv vet du nu vad rekryterare faktiskt reagerar på.',
            rader: SKRIVTIPS,
          },
          {
            eyebrow: 'Resultat',
            rubrik: 'När brevet svarar mot kraven har rekryteraren en anledning att ringa',
            rader: [
              { rubrik: 'Ett brev gratis', text: 'Sedan skriver du ett nytt i veckan, utan kortuppgift.' },
              { rubrik: 'PDF och Word', text: `Nedladdningen ingår i ${PLAN_BY_KEY.cv_week.name}.` },
              { rubrik: `${pris} kr för hela veckan`, text: `${PLAN_BY_KEY.cv_week.name}. Säg upp när du vill i ditt konto.` },
            ],
            lank: { text: 'Skriv ditt första brev gratis', href: '/register' },
          },
        ]}
        citat={{
          text: 'Jag hade fått fjorton avslag på rad. Skrev om brevet med Jobbcoach.ai för en roll på Klarna och kallades till intervju samma vecka. Det var inte CV:t som var fel. Det var att jag inte talade rekryterarens språk.',
          namn: 'Marcus, 34, Göteborg',
          roll: 'backend-utvecklare, från 14 avslag till intervju',
        }}
        slut={{
          eyebrow: `${PLAN_BY_KEY.cv_week.name}, ${pris} kr i veckan`,
          rubrik: 'Ditt nästa brev tar tre minuter, inte tre timmar.',
          text: `Första brevet är gratis och kräver ingen kortuppgift, sedan skriver du ett nytt i veckan. Personliga brev utan tak, alla mallar och nedladdning som PDF och Word ingår i ${PLAN_BY_KEY.cv_week.name}, ${pris} kr i veckan.`,
          knapp: { text: 'Skapa ditt brev gratis', href: '/register' },
        }}
        faq={{
          rubrik: 'Det du undrar om brevverktyget',
          ingress: (
            <>
              Hittar du inte svaret?{' '}
              <a href="mailto:support@jobbcoach.ai" className="text-ink-1 underline decoration-kant-stark underline-offset-4">
                Hör av dig
              </a>
              .
            </>
          ),
          fragor: BREV_FAQ_ITEMS,
        }}
      />
    </>
  )
}

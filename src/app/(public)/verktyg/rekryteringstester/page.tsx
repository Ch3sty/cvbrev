/**
 * /verktyg/rekryteringstester på verktygsmallen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5). h1, metadata och schemat (WebApplication, HowTo, FAQPage) är
 * oförändrade; bara ramen och sektionernas form är nya.
 */
import VerktygsSida from '@/components/verktyg/VerktygsSida'
import RekryteringstesterProvaKort from './components/RekryteringstesterProvaKort'
import { REKRYTERINGSTESTER_FAQ_ITEMS } from './components/rekryteringstester-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { IlluScenMatris } from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY } from '@/lib/plans/plans'

const TESTVECKAN = PLAN_BY_KEY.test_week

const STEG = [
  { rubrik: 'Välj test', text: 'Plocka ett av de tre gratistesterna. Grundnivån går att köra en gång per dygn och testtyp, och frågorna byts ut varje gång.' },
  { rubrik: 'Lös frågorna i din takt', text: 'Timern räknar uppåt så att du ser tempot, men ingenting bryter mitt i en fråga. Markera ditt svar och gå vidare.' },
  { rubrik: 'Se resultat och tid direkt', text: 'När du svarat klart ser du andel rätt, antal korrekta svar, total tid och snittid per fråga. Du väntar inte på något.' },
  { rubrik: 'Se vad du missade', text: 'Fråga för fråga jämför du ditt svar med facit. Du ser vilka mönster du missade och vet vad du ska träna mer på.' },
]

const FARDIGHETER = [
  { rubrik: 'Mönsterigenkänning', text: 'Hitta progressioner, rotationer och mängdoperationer i abstrakta former. Det är den förmåga matrislogik mäter, och den blir tydligt bättre med repetition.' },
  { rubrik: 'Logiskt tänkande', text: 'Dra slutsatser från regler du själv har hittat. Rekryteringstester belönar den som tänker steg för steg, inte den som chansar.' },
  { rubrik: 'Läsförståelse', text: 'Plocka ut vad texten faktiskt säger, inte vad du tror att den säger. Där går gränsen mellan rätt och fel i verbalt resonemang.' },
  { rubrik: 'Kritiskt tänkande', text: 'Skilj på vad ett påstående bevisar och vad det bara antyder. Testerna har ofta tre svarsalternativ, sant, falskt och går inte att avgöra, just för att fånga förhastade slutsatser.' },
  { rubrik: 'Snabbräkning', text: 'Räkna procent, kvoter och skillnader i huvudet eller på papper. Du behöver ingen avancerad matematik, men du måste hinna räkna utan att tappa precisionen.' },
  { rubrik: 'Tabelltolkning', text: 'Hitta rätt cell snabbt i en tabell med fem rader och fyra kolumner. Den som läser av tabellen smart får mer tid över till själva räknandet.' },
]

const TESTTYPER = [
  { rubrik: 'Matrislogik', text: 'Hitta mönstret i en 3×3-matris med abstrakta former. Tränar mönsterigenkänning och logiskt tänkande i samma format som SHL Inductive Reasoning och Cut-e Scales. Grundnivå: 15 frågor, cirka 20 minuter. Avancerad nivå: 15 frågor, cirka 25 minuter.' },
  { rubrik: 'Verbalt resonemang', text: 'Läs en kort text och avgör om ett påstående är sant, falskt eller inte går att avgöra. Tränar läsförståelse och kritiskt tänkande utan att förkunskaper spelar in. Grundnivå: 48 påståenden, cirka 20 minuter. Avancerad nivå: 48 påståenden, cirka 25 minuter.' },
  { rubrik: 'Numeriskt resonemang', text: 'Tolka tabeller och diagram med ekonomiska siffror och svara på frågor om procent och beräkningar. Tränar tabelltolkning och snabbräkning under tidspress. Grundnivå: 24 frågor, cirka 20 minuter. Avancerad nivå: 24 frågor, cirka 25 minuter.' },
]

const BIG_FIVE = [
  { rubrik: 'Öppenhet', text: 'Kreativitet och nyfikenhet.' },
  { rubrik: 'Noggrannhet', text: 'Struktur och disciplin.' },
  { rubrik: 'Extraversion', text: 'Social energi och initiativ.' },
  { rubrik: 'Vänlighet', text: 'Samarbete och tillit.' },
  { rubrik: 'Känslostabilitet', text: 'Stresstålighet och lugn.' },
]

const INGAR = [
  { rubrik: 'Grundnivån är gratis', text: 'En gång per dygn och testtyp. Ingen kortuppgift, du börjar direkt.' },
  { rubrik: 'Rapport efter varje pass', text: 'Resultat, tid och en genomgång fråga för fråga med rätt svar.' },
  { rubrik: `${TESTVECKAN.name} tar bort taket`, text: `Alla nivåer, tidsatt provläge och hela din resultathistorik, ${TESTVECKAN.amount} kr i veckan.` },
]

export default function RekryteringstesterSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai Rekryteringstester',
    url: 'https://www.jobbcoach.ai/verktyg/rekryteringstester',
    description:
      'Träna på rekryteringstester och bygg din personlighetsprofil innan arbetsgivaren testar dig. Matrislogik, verbalt resonemang, numeriskt resonemang och Big Five-baserad personlighetsanalys.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Alla grundnivåtester gratis, en gång per dag, utan kortuppgift',
    },
    featureList:
      'Matrislogik 3x3-grid, verbalt resonemang med sant/falskt/går ej att avgöra, numeriskt resonemang med tabeller och procent, Big Five-baserad personlighetsprofil med 50 eller 120 frågor, score och tid direkt efter varje pass, fråga-för-fråga-genomgång med rätt svar, obegränsat antal försök med Premium',
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så tränar du på rekryteringstester med Jobbcoach.ai',
    description:
      'Fyra steg från val av test till färdig rapport: välj test, lös frågor i din takt, få score och tid direkt, se vad du missade.',
    totalTime: 'PT20M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Välj test',
        text:
          'Plocka ett av tre gratistester: matrislogik, verbalt resonemang eller numeriskt resonemang.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Lös frågor i din takt',
        text:
          'Markera ditt svar och gå till nästa fråga. Timern räknar tempot men avbryter aldrig.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Få score och tid direkt',
        text:
          'När du svarat klart visas procent korrekta, total tid och snitt-tid per fråga.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Se vad du missade',
        text:
          'Fråga för fråga ser du ditt svar mot facit och förstår vilka mönster du kan träna mer på.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: REKRYTERINGSTESTER_FAQ_ITEMS.map((item) => ({
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
      <RedirectLoggedIn to="/dashboard/tester" />
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
            name: 'Rekryteringstester',
            href: '/verktyg/rekryteringstester',
          },
        ]}
        eyebrow="Rekryteringstester · kom förberedd till provet"
        h1="Träna på rekryteringstester innan arbetsgivaren testar dig"
        ingress="Matrislogik, verbalt resonemang och numeriskt resonemang i samma format som SHL, Cut-e och Assessio använder."
        fet="Tre tester gratis, ingen kortuppgift, och du ser rätt och fel direkt efter varje pass."
        primar={{ text: 'Starta gratis test', href: '/register' }}
        sekundar={{ text: 'Se alla tester', href: '#testtyper' }}
        loften={[
          { tal: '3 tester', text: 'gratis på grundnivå' },
          { tal: '20 min', text: 'per pass' },
          { tal: '5 frågor', text: 'att prova utan konto' },
        ]}
        scen={<IlluScenMatris className="h-auto w-full" />}
        handling={<RekryteringstesterProvaKort />}
        handlingId="prova"
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress: 'Från första frågan till färdig rapport. Ingen registrering innan du provar, du börjar inom 30 sekunder.',
          rader: STEG,
          lank: { text: 'Starta gratis test', href: '/register' },
        }}
        kontroll={{
          eyebrow: 'Vad du tränar på',
          rubrik: 'Sex färdigheter som avgör testet',
          ingress: 'Det här är vad arbetsgivaren faktiskt mäter. Träna upp dem innan du sätter dig framför det skarpa testet.',
          rader: FARDIGHETER,
        }}
        extra={[
          {
            id: 'testtyper',
            eyebrow: 'Kognitiva tester',
            rubrik: 'Tre testtyper, alla gratis att börja',
            ingress: `Grundnivån är alltid gratis, en gång per dygn och testtyp. Vill du köra utan tak, gå vidare till avancerad nivå och expertnivå och öva i tidsatt provläge ingår det i ${TESTVECKAN.name} för ${TESTVECKAN.amount} kr i veckan.`,
            rader: TESTTYPER,
            lank: { text: 'Starta gratis test', href: '/register' },
          },
          {
            eyebrow: 'Personlighetsprofil',
            rubrik: 'Ta reda på vad rekryteraren ser i dig',
            ingress: `De flesta arbetsgivare utgår från Big Five när de mäter personlighet i rekrytering. Bygg din egen profil och se var du hamnar på de fem dimensionerna. Det finns inga rätta svar, och resultatet kan du använda inför intervjun. Gratis: 50 frågor, cirka 10 minuter. I ${TESTVECKAN.name}: 120 frågor och 30 delfaktorer, cirka 25 minuter.`,
            rader: BIG_FIVE,
            lank: { text: 'Testa din personlighet och se vad rekryteraren ser', href: '/register' },
          },
          {
            eyebrow: 'Vad som ingår',
            rubrik: 'Träning som syns på resultatet',
            rader: INGAR,
          },
        ]}
        citat={{
          text: 'Jag hade aldrig gjort ett rekryteringstest före Klarnas urvalsprocess och fick total panik första gången jag provade. Jag tränade två veckor med matrislogiken och det numeriska testet här, klarade det skarpa testet och fick tjänsten.',
          namn: 'Linus, 28, Stockholm',
          roll: 'Junior Data Analyst på Klarna, klarade urvalstestet efter två veckor',
        }}
        slut={{
          eyebrow: TESTVECKAN.name,
          rubrik: 'Träna nu. Kom förberedd sen.',
          text: `Tre tester gratis på grundnivå, ingen kortuppgift, och en rapport efter varje pass. Alla nivåer, provläget och din historik ingår i ${TESTVECKAN.name}, ${TESTVECKAN.amount} kr i veckan.`,
          knapp: { text: 'Starta gratis test', href: '/register' },
          sekundar: { text: 'Se hur det fungerar', href: '#sa-funkar-det' },
        }}
        faq={{
          rubrik: 'Vanliga frågor om rekryteringstester',
          ingress: (
            <>
              Hittar du inte svaret?{' '}
              <a href="mailto:support@jobbcoach.ai" className="text-ink-1 underline decoration-kant-stark underline-offset-4">
                Hör av dig
              </a>
              .
            </>
          ),
          fragor: REKRYTERINGSTESTER_FAQ_ITEMS,
        }}
      />
    </>
  )
}

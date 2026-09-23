/**
 * /verktyg/linkedin-optimering på verktygsmallen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5). h1, title, description och schemat (WebApplication, HowTo,
 * FAQPage) är oförändrade; bara ramen och sektionernas form är nya.
 */
import VerktygsSida from '@/components/verktyg/VerktygsSida'
import LinkedinOptimeringLiveDemo from './components/LinkedinOptimeringLiveDemo'
import { LINKEDIN_OPTIMERING_FAQ_ITEMS } from './components/linkedin-optimering-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { IlluScenLinkedin } from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY } from '@/lib/plans/plans'

/** Stegtexterna på sidan. Schemats HowTo-text ligger kvar oförändrad nedan. */
const STEG_TEXT = [
  'Kopiera din nuvarande rubrik, om mig-text och erfarenhet från LinkedIn. Har du sparat ett CV hos oss fyller vi i fälten åt dig i stället.',
  'Klistra in texten i fälten Rubrik, Om mig, Erfarenhet, Utbildning och Kompetenser, eller välj ditt sparade CV som källa. Inget fält är obligatoriskt.',
  'Vi bearbetar alla fem sektioner parallellt med svensk arbetsmarknad som ram, branschens sökord och anpassning för rekryteringssystem. Det tar 30 till 60 sekunder.',
  'Din nuvarande text står bredvid den optimerade. För varje sektion ser du poängen före och efter och exakt vad som ändrats. Inget händer som du inte godkänt.',
  'En knapp kopierar hela paketet eller en sektion åt gången. Du klistrar in på LinkedIn själv och sparar. Vi rör aldrig din profil.',
]

const SEKTIONER = [
  { rubrik: 'Rubrik, högst 220 tecken', text: 'Vi bygger en rubrik med yrkesroll, specialområden och målgrupp. Är fältet tomt skriver vi en från grunden utifrån din erfarenhet.' },
  { rubrik: 'Om mig, 250 till 350 ord', text: 'Visar den röda tråden i din karriär: varifrån du kommer, vad du gör nu och vart du är på väg. Tonen anpassas efter om du är junior, erfaren eller senior.' },
  { rubrik: 'Erfarenhet i STAR-format', text: 'Skriver om varje roll som situation, uppgift, handling och resultat. Vi börjar med handlingsverb och sätter siffror där det går. Ingenting hittas på.' },
  { rubrik: 'Utbildning, valfritt', text: 'Ger den som är junior en utbyggd version med examensarbete och relevanta kurser. Den som är senior får en kort lista som inte tar fokus från yrkeserfarenheten.' },
  { rubrik: 'Kompetenser i 3 till 4 grupper', text: 'Samlar dina kompetenser i tematiska grupper och lyfter dem som matchar målrollen. Tomma modeord som "lagspelare" rensas bort.' },
]

const VARFOR = [
  { rubrik: 'Rekryterare söker på sökord', text: 'Rekryterare hittar inte kandidater genom att bläddra bland miljontals profiler. De söker. Saknar profilen de branschord rekryteraren skriver i sökrutan dyker du aldrig upp i resultatet.' },
  { rubrik: 'Rubriken avgör om du visas', text: 'Du har 220 tecken till rubriken på LinkedIn. De flesta använder färre än 30. En rubrik som bara säger "Marknadsförare" rankar lågt mot mer specifika sökningar som "B2B-marknadsförare SaaS Stockholm".' },
  { rubrik: 'Algoritmen belönar fullständighet', text: 'LinkedIns algoritm prioriterar profiler som är kompletta: rubrik, om mig, erfarenhet, utbildning och kompetenser. En halvfärdig profil hamnar längre ner i sökresultatet, oavsett hur duktig du är.' },
]

const LAGEN = [
  {
    rubrik: 'Stå ut i mängden',
    text: 'Välj det när du är öppen för flera typer av roller i din bransch. Vi bygger en bred profil som syns i många olika rekryterarsökningar. Ingen enskild roll låser profilen, men sökorden håller dig synlig för flera arbetsgivare och nischer.',
  },
  {
    rubrik: 'Sikta på en specifik roll',
    text: 'Välj det när du vet exakt vilken titel du går efter. Du skriver in målrollen, till exempel "Senior backendutvecklare" eller "Marknadschef B2B SaaS", och vi anpassar rubrik, om mig och erfarenhet till det språk rekryterare använder för just den tjänsten och dess senioritet. Du kan göra om optimeringen mot en annan roll senare.',
  },
]

export default function LinkedinOptimeringSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai LinkedIn-optimering',
    url: 'https://www.jobbcoach.ai/verktyg/linkedin-optimering',
    description:
      'Optimera din LinkedIn-profil för rekryterares sökningar. Vi förbättrar rubrik, om-mig, erfarenhet, utbildning och kompetenser samtidigt. Du copy-pastar in din text och får optimerad version tillbaka, vi loggar aldrig in på din LinkedIn.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '1 optimering gratis per vecka, ingen kortuppgift',
    },
    featureList:
      'Optimering av rubrik, om-mig, erfarenhet, utbildning och kompetenser, score-rapport före och efter per sektion, två lägen (stå ut eller specifik roll), CV-autofyll från sparat CV, copy-paste-flöde utan LinkedIn-inloggning, STAR-format på erfarenhet, ATS-optimering med branschkeywords',
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så optimerar du din LinkedIn-profil med Jobbcoach.ai',
    description:
      'Fem steg från copy-paste till uppdaterad LinkedIn-profil: hämta din profiltext, klistra in eller välj sparat CV, vi optimerar fem sektioner, jämför före och efter, kopiera tillbaka till LinkedIn.',
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Hämta din profiltext från LinkedIn',
        text:
          'Kopiera din nuvarande rubrik, om-mig och erfarenhet från LinkedIn. Eller välj ett sparat CV som källa.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Klistra in i fem fält',
        text:
          'Klistra in texten i fälten Rubrik, Om mig, Erfarenhet, Utbildning och Kompetenser. Inga obligatoriska fält.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Vi optimerar fem sektioner samtidigt',
        text:
          'Karriärguidens AI bearbetar alla fem sektioner parallellt med svensk arbetsmarknadskontext, branschkeywords och ATS-anpassning på 30-60 sekunder.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Jämför före och efter',
        text:
          'Split-view visar din nuvarande text bredvid den optimerade. Per sektion ser du score-deltan och vad som ändrats.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Kopiera tillbaka till LinkedIn',
        text:
          'En knapp kopierar hela paketet eller en sektion åt gången. Du klistrar in på LinkedIn manuellt och sparar.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: LINKEDIN_OPTIMERING_FAQ_ITEMS.map((item) => ({
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
      <RedirectLoggedIn to="/dashboard/linkedin-optimizer" />
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
            name: 'LinkedIn-optimering',
            href: '/verktyg/linkedin-optimering',
          },
        ]}
        eyebrow="LinkedIn-optimering · syns när rekryteraren söker"
        h1="Hamna i rekryterarnas sökresultat på LinkedIn"
        ingress="Du klistrar in din profiltext, vi optimerar fem sektioner samtidigt och ger dig en bättre version att klistra tillbaka."
        fet="Vi loggar aldrig in på din LinkedIn, du behåller full kontroll."
        primar={{ text: 'Optimera gratis', href: '/register' }}
        sekundar={{ text: 'Så fungerar det', href: '#sa-funkar-det' }}
        loften={[
          { tal: '1 gratis', text: 'optimering varje vecka' },
          { tal: '5', text: 'sektioner samtidigt' },
          { tal: '5 min', text: 'tills profilen är uppdaterad' },
        ]}
        scen={<IlluScenLinkedin className="h-auto w-full" />}
        handling={<LinkedinOptimeringLiveDemo />}
        handlingId="exempel"
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress:
            'Inga inloggningar på LinkedIn och ingen automatisk publicering. Du kopierar in, vi optimerar, du kopierar tillbaka. Klart på fem minuter.',
          rader: howToSchema.step.map((s, i) => ({ rubrik: s.name, text: STEG_TEXT[i] })),
          lank: { text: 'Optimera din LinkedIn gratis', href: '/register' },
        }}
        kontroll={{
          eyebrow: 'Vad vi optimerar',
          rubrik: 'Fem sektioner i ett pass',
          ingress:
            'Vi optimerar alla fem sektioner samtidigt, med samma röda tråd genom hela profilen. För varje sektion ser du poängen före och efter, så du vet exakt vad som blev bättre.',
          rader: SEKTIONER,
        }}
        extra={[
          {
            eyebrow: 'Bakgrunden',
            rubrik: 'Varför du inte syns i dag',
            ingress: 'Du är inte osynlig. Din profil talar bara inte samma språk som rekryterarens sökruta.',
            rader: VARFOR,
          },
          {
            eyebrow: 'Två lägen',
            rubrik: 'Bred eller skarp inriktning',
            ingress:
              'Du väljer läge i steg ett och kan göra om optimeringen i det andra läget när som helst om du byter strategi.',
            rader: LAGEN,
          },
        ]}
        citat={{
          text: 'Jag hade inte fått ett enda meddelande från en rekryterare på LinkedIn på två år. Jag optimerade rubriken och om mig-texten på en eftermiddag och fick åtta meddelanden de följande två veckorna. Två blev intervjuer.',
          namn: 'Anna, 31, Göteborg',
          roll: 'UX-designer inom B2B SaaS, från noll till åtta meddelanden på två veckor',
        }}
        slut={{
          eyebrow: PLAN_BY_KEY.cv_week.name,
          rubrik: 'Sluta vara osynlig. Börja synas i dag.',
          text: `En optimering i veckan är gratis, utan kortuppgift och utan inloggning på din LinkedIn. Vill du optimera fler gånger, till exempel mot olika roller, ingår LinkedIn-optimeringen i ${PLAN_BY_KEY.cv_week.name}, ${PLAN_BY_KEY.cv_week.amount} kr i veckan, tillsammans med full CV-analys och alla mallar.`,
          knapp: { text: 'Optimera din LinkedIn gratis', href: '/register' },
          sekundar: { text: 'Se hur det fungerar', href: '#sa-funkar-det' },
        }}
        faq={{
          rubrik: 'Vanliga frågor om LinkedIn-optimering',
          ingress: (
            <>
              Hittar du inte svaret? Mejla{' '}
              <a href="mailto:support@jobbcoach.ai" className="text-ink-1 underline decoration-kant-stark underline-offset-4">
                support@jobbcoach.ai
              </a>
              .
            </>
          ),
          fragor: LINKEDIN_OPTIMERING_FAQ_ITEMS,
        }}
      />
    </>
  )
}

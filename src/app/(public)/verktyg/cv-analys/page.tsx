/**
 * /verktyg/cv-analys på verktygsmallen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5). Texterna enligt textbeslutet i publikt omgång 3
 * (docs/publikt-omgang3/textbeslut.md): läsbarhetspoängen i sju delar,
 * delarnas namn och maxpoäng ur poängmodellen.
 */
import VerktygsMall from '@/components/publikt/VerktygsMall'
import SkarmCvAnalys from '@/components/publikt/telefon/skarmar/SkarmCvAnalys'
import CVAnalysMini from './components/CVAnalysMini'
import { CV_ANALYS_FAQ_ITEMS } from './components/cv-analys-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { SALD_PLAN, paketKort, paketMedPris } from '@/lib/plans/plans'
import { KATEGORIER as POANG_DELAR, ROLLER_SOM_RAKNAS } from '@/lib/cv/poang/modell'
import { TEMPLATE_COUNT, WORD_TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { talOrd } from '@/components/publikt/talord'

/** Delarnas texter (textbeslut CVA-1). Namn och maxpoäng läses ur poängmodellen. */
const DELTEXT: Record<(typeof POANG_DELAR)[number]['id'], string> = {
  kontakt: 'Namn, e-postadress, telefonnummer och ort. Det låter självklart, men saknas en av dem vet rekryteraren inte hur du nås eller var du finns.',
  profil: 'Din öppning. Den ska vara lagom lång, säga vilken roll du har och innehålla något man kan räkna: år, antal eller resultat.',
  erfarenhet: `Den tyngsta delen. Varje roll behöver titel, arbetsgivare och period, två till åtta punkter som börjar med vad du gjorde och minst en siffra. "Ansvarig för försäljning" blir "Ökade försäljningen 40 procent på 8 månader". De ${talOrd(ROLLER_SOM_RAKNAS)} första rollerna i CV:t räknas.`,
  kompetenser: 'Ett eget avsnitt med lagom många kompetenser, skrivna som korta, sökbara termer. "Budgetansvar" går att söka på. En hel mening gör det inte.',
  utbildning: 'Minst en utbildning, med namn, skola och år eller period. Rekryteraren vill se vad du läste, var och när. Mer än så behövs sällan.',
  sprak: 'Språken står med, och varje språk har en nivå. "Engelska, flytande" säger mer än bara "Engelska", och nivån är det rekryteraren letar efter.',
  format: 'Perioder som går att läsa, samma datumformat genom hela CV:t, senaste rollen först, korta punkter och ett CV som är lagom långt.',
}

const KATEGORIER = POANG_DELAR.map((d) => ({ rubrik: d.namn, bricka: `${d.max} poäng`, text: DELTEXT[d.id] }))

const SKRIVTIPS = [
  { rubrik: 'Kvantifiera dina resultat', text: 'Siffror övertygar mer än adjektiv. "Ökade omsättningen 40 procent på 8 månader" säger mer än "duktig på försäljning".' },
  { rubrik: 'Börja varje punkt med ett verb', text: 'Drev, byggde, ledde, införde. Aktiva verb visar handlingskraft; passiva formuleringar gör att du försvinner i mängden.' },
  { rubrik: 'Använd annonsens egna ord', text: 'Står en term i annonsen, skriv den exakt så i CV:t. Rekryteringssystemen letar efter exakta termer, inte synonymer.' },
  { rubrik: 'En sida räcker ofta', text: 'Under fem års erfarenhet: en A4. Mer erfarenhet: högst två. Akademiska CV med publikationer kan vara längre, men då av en anledning.' },
  { rubrik: 'Hoppa över bilden', text: 'I Sverige är standard ett CV utan bild, och innehållet väger tyngre än utseendet. Lägg platsen på det som säljer dig. Vill du ändå ha foto finns det mallar med plats för det.' },
]

export default function CVAnalysSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai CV-analys',
    url: 'https://www.jobbcoach.ai/verktyg/cv-analys',
    description:
      'CV-analys som ger en läsbarhetspoäng från 0 till 100, en genomgång i sju delar och Jobbcoachens förslag på nya formuleringar. Anpassad för svenska arbetsgivare.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Läsbarhetspoängen och genomgången i sju delar gratis för varje CV, ingen kortuppgift',
    },
    featureList:
      'Läsbarhetspoäng 0-100, genomgång i sju delar (kontaktuppgifter, personbeskrivning, erfarenhet, kompetenser, utbildning, språk, datum, ordning och längd), Jobbcoachens förslag med nuvarande text och förslag bredvid varandra, byggd för svenska CV',
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så analyserar du ditt CV med Jobbcoach.ai',
    description:
      'Fyra steg från uppladdat CV till starkare ansökan: ladda upp, vi går igenom sju delar, se läsbarhetspoängen, hämta Jobbcoachens förslag.',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Ladda upp ditt CV',
        text:
          'Ladda upp ditt CV som PDF eller Word, eller välj ett du redan har sparat. Är din PDF inskannad läser vi av bilden när du är inloggad, och bildläsningen läser svenska. Analysen är byggd för svenska CV.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Vi går igenom sju delar',
        text:
          'Kontaktuppgifter, personbeskrivning, erfarenhet, kompetenser, utbildning, språk och till sist datum, ordning och längd. Varje del har sina poäng, och tillsammans blir de 100.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Se läsbarhetspoängen och vad som saknas',
        text:
          'Du får en läsbarhetspoäng från 0 till 100 och ser vad som saknas i varje del, utmärkt direkt på ditt CV. Du ser också hur många poäng som återstår till 100 och i vilka delar de sitter.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Hämta Jobbcoachens förslag',
        text: `Jobbcoachen skriver förslag på nya formuleringar där du tappar poäng. Du väljer vilka som följer med, sparar och ser poängen räknas om. Sedan väljer du en av ${TEMPLATE_COUNT} mallar och laddar ner CV:t som PDF, eller som Word i ${WORD_TEMPLATE_COUNT} av mallarna.`,
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CV_ANALYS_FAQ_ITEMS.map((item) => ({
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
      <RedirectLoggedIn to="/dashboard/cv-analys" />
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

      <VerktygsMall
        rum="cv"
        telefon={<SkarmCvAnalys />}
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Verktyg', href: '/funktioner' },
          { name: 'CV-analys', href: '/verktyg/cv-analys' },
        ]}
        eyebrow="Gratis för varje CV"
        h1="CV-analys med läsbarhetspoäng: se var ditt CV tappar, del för del"
        ingress="Vi går igenom ditt CV i sju delar, från kontaktuppgifter till datum, ordning och längd, och räknar en läsbarhetspoäng av 100."
        fet="Du ser var varje tappad poäng sitter och hur du tar tillbaka den."
        primar={{ text: 'Analysera mitt CV', href: '#mini-analys' }}
        sekundar={{ text: 'Så fungerar det', href: '#sa-funkar-det' }}
        loften={[
          { tal: String(POANG_DELAR.length), text: 'delar i genomgången' },
          { tal: '100', text: 'poäng att nå' },
          { tal: '0 kr', text: 'för poängen, varje CV' },
        ]}
        handling={<CVAnalysMini />}
        handlingId="mini-analys"
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress: 'Fyra steg från uppladdat CV till en starkare ansökan.',
          rader: howToSchema.step.map((s) => ({ rubrik: s.name, text: s.text })),
          lank: { text: 'Analysera mitt CV', href: '#mini-analys' },
        }}
        kontroll={{
          eyebrow: 'Vad vi kontrollerar',
          rubrik: 'Sju delar som ger din läsbarhetspoäng',
          ingress: 'Varje poäng går att peka på i ditt CV. Fler ord ger aldrig fler poäng. Så här fördelas de hundra.',
          rader: KATEGORIER,
          not: 'Läsbarhetspoängen visar hur lätt ditt CV är att läsa för en rekryterare och för rekryteringssystemen. Vi räknar den själva, ur det som står i ditt CV.',
        }}
        extra={[
          {
            eyebrow: 'Skrivtips',
            rubrik: 'Fem saker som lyfter vilket CV som helst',
            rader: SKRIVTIPS,
          },
        ]}
        slut={{
          eyebrow: paketMedPris(SALD_PLAN),
          rubrik: 'Alla förslag, och nya när du har ändrat.',
          text: `Läsbarhetspoängen och genomgången i sju delar är gratis för varje CV. Alla förslag från Jobbcoachen, nya förslag efter varje ändring, alla mallar och personliga brev utan tak ingår i ${paketKort()}.`,
          knapp: { text: 'Analysera mitt CV gratis', href: '#mini-analys' },
          sekundar: { text: 'Se CV-exempel först', href: '/exempel' },
        }}
        faq={{
          rubrik: 'Frågor om CV-analysen',
          ingress: (
            <>
              Hittar du inte svaret? Mejla{' '}
              <a href="mailto:support@jobbcoach.ai" className="text-ink-1 underline decoration-kant-stark underline-offset-4">
                support@jobbcoach.ai
              </a>
              .
            </>
          ),
          fragor: CV_ANALYS_FAQ_ITEMS,
        }}
      />
    </>
  )
}

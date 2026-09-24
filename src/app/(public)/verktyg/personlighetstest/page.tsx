/**
 * /verktyg/personlighetstest (docs/design/rod-trad-prov-spec-2026-09-24.md,
 * Del A). Personlighetsprovet som huvudinnehåll på verktygsmallen: samma
 * panel som i artiklarna personlighetstest-jobb-guide och
 * map-test-personlighetstest, i heron där de andra verktygssidorna har sin
 * direkta handling. Sidans h1 är mallens; panelens rubrik förblir ett p.
 *
 * Inloggade skickas till hela testet med 50 påståenden: smakprovet visas
 * inte inloggat (spec avsnitt 6).
 */
import VerktygsSida from '@/components/verktyg/VerktygsSida'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { IlluScenIntervju } from '@/components/illustrations/PriserScener'
import { Personlighetsprov } from '@/components/artiklar/mdx-klient'
import { SIDA } from '@/components/artiklar/personlighetsprov/personlighetsprov-copy'
import { GRUNDTEST_HREF } from '@/lib/intervju/lankar'
import { PLAN_BY_KEY, paketMedPris } from '@/lib/plans/plans'

const URL = 'https://www.jobbcoach.ai/verktyg/personlighetstest'

const STEG = [
  {
    rubrik: 'Svara på tjugo påståenden',
    text: 'Fyra per faktor, på samma femgradiga skala som MAP och de flesta test i svensk rekrytering. Tänk på hur du är på jobbet och ta första rimliga svaret.',
  },
  {
    rubrik: 'Se profilen direkt',
    text: 'Du får de fem faktorerna med ett bandord (hög, mitt emellan eller låg) och en mening per faktor om hur en rekryterare läser den.',
  },
  {
    rubrik: 'Spara den med ett gratiskonto',
    text: 'Då ser du profilen läst mot sex vanliga kravprofiler, vad du kan säga på intervjun och vilka påståenden som var omvända.',
  },
  {
    rubrik: 'Gör hela testet',
    text: 'I kontot finns hela testet med femtio påståenden, gratis. Det ger profilen du kan ta med dig till intervjun.',
  },
]

const FAKTORER = [
  { rubrik: 'Samvetsgrannhet', text: 'Struktur, noggrannhet och att göra klart det man lovat. Väger tungt i ekonomi, administration och ledarroller.' },
  { rubrik: 'Utåtriktning', text: 'Var du hämtar energi: i möten med människor eller i eget arbete. Väger tungt i sälj och kundkontakt.' },
  { rubrik: 'Stabilitet', text: 'Hur du hanterar press och motgångar. Hög stabilitet är detsamma som låg särbarhet i testets egna termer.' },
  { rubrik: 'Vänlighet', text: 'Samarbete, omtanke och hur rakt du säger ifrån. Väger tungt i vård, omsorg och team med mycket samarbete.' },
  { rubrik: 'Öppenhet', text: 'Nyfikenhet på nya arbetssätt och idéer. Väger tungt där verktyg och metoder byts ofta, som i IT.' },
]

const FAQ = [
  {
    q: 'Är personlighetstestet gratis?',
    a: 'Ja. Provet med tjugo påståenden kräver inget konto. Med ett gratiskonto sparar du profilen och får hela tolkningen, och hela testet med femtio påståenden ingår också gratis.',
  },
  {
    q: 'Vilken modell bygger testet på?',
    a: 'Femfaktormodellen, även kallad Big Five. Det är samma modell som MAP från Assessio och de flesta personlighetstest i svensk rekrytering bygger på. Faktorerna är samvetsgrannhet, utåtriktning, stabilitet, vänlighet och öppenhet.',
  },
  {
    q: 'Räcker tjugo påståenden för en profil?',
    a: 'Tjugo påståenden ger en riktning, inte ett exakt tal. Därför visar vi bandord i stället för poäng. Vill du ha en profil du kan lita på gör du hela testet med femtio påståenden i kontot.',
  },
  {
    q: 'Vad är omvända påståenden?',
    a: 'Hälften av påståendena är formulerade åt andra hållet, så att "stämmer inte" ger högt värde på faktorn. Det är så ett test ser om du svarar konsekvent. Efter att du skapat ett konto ser du vilka tio som var omvända och hur konsekvent du svarade.',
  },
  {
    q: 'Kan jag öva inför ett skarpt personlighetstest?',
    a: 'Du kan vänja dig vid formatet, och det är värt det. Svaren ska däremot vara ärliga: de flesta test har en indikator som flaggar tillrättalagda svar, och den som svarar sig in i fel roll hamnar på en arbetsplats där hen trivs sämre.',
  },
  {
    q: 'Vad ingår om jag betalar?',
    a: `Grundtestet med femtio påståenden är gratis. Med ${paketMedPris('test_week')} eller ${PLAN_BY_KEY.all_week.name}, ${PLAN_BY_KEY.all_week.amount} kr i veckan, ingår det fördjupade testet med 120 påståenden och 30 delfaktorer, och intervjuprovet utan tak.`,
  },
]

export default function PersonlighetstestSida() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai Personlighetstest',
    url: URL,
    description: SIDA.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'SEK', description: 'Gratis, utan konto' },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <>
      <RedirectLoggedIn to={GRUNDTEST_HREF} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <VerktygsSida
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Verktyg', href: '/funktioner' },
          { name: 'Personlighetstest', href: '/verktyg/personlighetstest' },
        ]}
        eyebrow="Personlighetstest · femfaktormodellen"
        h1={SIDA.h1}
        ingress="Tjugo påståenden på samma modell som MAP och de flesta test i svensk rekrytering. Du får din profil direkt och en rad per faktor om hur en rekryterare läser den."
        fet="Inget konto, ungefär två minuter."
        primar={{ text: 'Gör testet', href: '#provet', dataCta: 'personlighetstest-hero' }}
        sekundar={{ text: 'Så fungerar det', href: '#sa-funkar-det' }}
        loften={[
          { tal: '20', text: 'påståenden' },
          { tal: '2 min', text: 'ungefär' },
          { tal: '5', text: 'faktorer i profilen' },
        ]}
        scen={<IlluScenIntervju className="h-auto w-full" />}
        handling={
          <div className="[&>aside]:my-0">
            <Personlighetsprov slug="verktyg/personlighetstest" />
          </div>
        }
        handlingId="provet"
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress: 'Från tjugo kryss till en profil du kan ta med dig in i intervjun.',
          rader: STEG,
        }}
        kontroll={{
          eyebrow: 'Vad testet mäter',
          rubrik: 'De fem faktorerna och vad rekryteraren ser i dem',
          ingress: 'Ingen faktor är bra eller dålig i sig. Det som avgör är hur profilen möter kravprofilen för rollen.',
          rader: FAKTORER,
        }}
        slut={{
          eyebrow: 'Hela testet',
          rubrik: 'Femtio påståenden, gratis i kontot',
          text: 'Provet ger en riktning. Hela testet ger profilen rekryteraren faktiskt jämför med, och den sparas inför intervjun.',
          knapp: { text: 'Skapa konto gratis', href: '/register?borja=tester' },
          sekundar: { text: 'Gör provet först', href: '#provet' },
        }}
        faq={{
          rubrik: 'Vanliga frågor om personlighetstestet',
          fragor: FAQ,
        }}
      />
    </>
  )
}

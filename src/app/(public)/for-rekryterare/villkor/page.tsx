import { Metadata } from 'next';
import PubliktSida from '@/components/publikt/PubliktSida';
import Textmall from '@/components/publikt/innehall/Textmall';
import Link from 'next/link';
import { VILLKOR_VERSION } from '@/lib/recruiter/villkor';

// Villkor för rekryterare. Lydelserna godkända av ägaren 2026-11-22,
// ordagrant. Sidan är öppen utan inloggning eftersom registreringen länkar
// hit. Versionen (VILLKOR_VERSION) är densamma som registreringen och
// portalen sparar i recruiter_profiles.villkor_version.

const TITEL = 'Villkor för rekryterare | jobbcoach.ai';
const BESKRIVNING =
  'Villkoren för dig som använder kandidatpoolen på jobbcoach.ai: vad poolen får användas till, vem som ansvarar för uppgifterna och urval utan diskriminering.';

export const metadata: Metadata = {
  title: TITEL,
  description: BESKRIVNING,
  alternates: {
    canonical: '/for-rekryterare/villkor',
  },
  openGraph: {
    title: TITEL,
    description: BESKRIVNING,
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/for-rekryterare/villkor',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITEL,
    description: BESKRIVNING,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/** Innehållsförteckningen: sidans h2 med id. */
const RUBRIKER = [
  { id: 'vem-villkoren-galler', text: '1. Vem villkoren gäller' },
  { id: 'vad-kandidatpoolen-far-anvandas-till', text: '2. Vad kandidatpoolen får användas till' },
  { id: 'kandidaten-ar-anonym', text: '3. Kandidaten är anonym tills hen tackar ja' },
  { id: 'ansvaret-for-uppgifterna', text: '4. Ansvaret för uppgifterna' },
  { id: 'urval-utan-diskriminering', text: '5. Urval utan diskriminering' },
  { id: 'ingen-automatisk-insamling', text: '6. Ingen automatisk insamling' },
  { id: 'kandidaten-bestammer', text: '7. Kandidaten bestämmer' },
  { id: 'kostnad-och-andringar', text: '8. Kostnad och ändringar' },
  { id: 'svensk-ratt-och-fragor', text: '9. Svensk rätt och frågor' },
];

export default function VillkorForRekryterarePage() {
  return (
    <PubliktSida>
      <Textmall titel="Villkor för rekryterare" smula="Villkor för rekryterare" andrad={VILLKOR_VERSION} rubriker={RUBRIKER}>
        <section>
          <p>
            De här villkoren gäller dig som använder kandidatpoolen i Bli upptäckt på jobbcoach.ai. De gäller utöver våra allmänna{' '}
            <Link href="/anvandarvillkor">användarvillkor</Link> och vår <Link href="/integritetspolicy">integritetspolicy</Link>.
          </p>
        </section>

        <section>
          <h2 id="vem-villkoren-galler">1. Vem villkoren gäller</h2>
          <p>
            Villkoren gäller dig som har ett rekryterarkonto som vi har godkänt. Kontot är personligt och får inte delas. Uppgifterna om dig och företaget ska vara sanna och hållas aktuella. Bryter du mot villkoren kan vi stänga kontot.
          </p>
        </section>

        <section>
          <h2 id="vad-kandidatpoolen-far-anvandas-till">2. Vad kandidatpoolen får användas till</h2>
          <p>
            Du får använda poolen för att hitta och kontakta kandidater till verkliga tjänster, hos ditt eget företag eller hos en namngiven uppdragsgivare. Du får inte använda uppgifterna för marknadsföring, bygga egna register av dem, sälja dem eller lämna dem vidare, eller träna AI-modeller på dem.
          </p>
        </section>

        <section>
          <h2 id="kandidaten-ar-anonym">3. Kandidaten är anonym tills hen tackar ja</h2>
          <p>
            Innan kandidaten har tackat ja får du inte försöka ta reda på vem hen är, och du får inte ta kontakt på annat sätt än genom en förfrågan i tjänsten.
          </p>
        </section>

        <section>
          <h2 id="ansvaret-for-uppgifterna">4. Ansvaret för uppgifterna</h2>
          <p>
            Vi ansvarar för kandidatpoolen. Det du får veta om en kandidat efter ett ja, i meddelanden och i dina egna anteckningar ansvarar ditt företag självt för enligt dataskyddsförordningen. Använd det bara för den rekrytering det gäller, lämna det inte vidare utanför den och radera det när det inte längre behövs. Delningslänken är till för kollegor i samma rekrytering. Den öppnas utan inloggning och gäller i fjorton dagar, så skicka den bara till den som ska läsa.
          </p>
        </section>

        <section>
          <h2 id="urval-utan-diskriminering">5. Urval utan diskriminering</h2>
          <p>
            Diskrimineringslagen gäller i ditt urval. Filtren hjälper dig att hitta kandidater, de är inga skäl att välja bort någon. Styrkor och arbetsstil beskriver hur någon arbetar, inte hur bra. Använd dem bara när de har med tjänstens krav att göra. Låt aldrig ett filter eller ett testresultat ensamt avgöra om någon går vidare. Det beslutet fattar en människa.
          </p>
        </section>

        <section>
          <h2 id="ingen-automatisk-insamling">6. Ingen automatisk insamling</h2>
          <p>
            Du får inte hämta uppgifter med skript eller andra automatiska verktyg, kopiera dem i klump eller exportera poolen.
          </p>
        </section>

        <section>
          <h2 id="kandidaten-bestammer">7. Kandidaten bestämmer</h2>
          <p>
            Kandidaten kan när som helst dölja sin profil, och kan ångra ett ja genom att säga det till dig eller till oss. Då slutar du använda uppgifterna du har fått från oss, om de inte redan behövs i en pågående rekrytering som kandidaten själv deltar i.
          </p>
        </section>

        <section>
          <h2 id="kostnad-och-andringar">8. Kostnad och ändringar</h2>
          <p>
            Kandidatpoolen är kostnadsfri under lanseringsperioden. Ändrar vi villkoren får du ett mail innan ändringen börjar gälla.
          </p>
        </section>

        <section>
          <h2 id="svensk-ratt-och-fragor">9. Svensk rätt och frågor</h2>
          <p>
            Svensk rätt gäller för villkoren. Frågor ställer du till <a href="mailto:hej@jobbcoach.ai">hej@jobbcoach.ai</a>.
          </p>
        </section>
      </Textmall>
    </PubliktSida>
  );
}

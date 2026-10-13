import { Metadata } from 'next';
import PubliktSida from '@/components/publikt/PubliktSida';
import Textmall from '@/components/publikt/innehall/Textmall';
import Link from 'next/link';
import { SALD_PLAN, paketNamn } from '@/lib/plans/plans';

const PREMIUM = paketNamn(SALD_PLAN);

export const metadata: Metadata = {
  title: 'Integritetspolicy | jobbcoach.ai',
  description: 'Läs vår integritetspolicy för att förstå hur jobbcoach.ai samlar in, använder och skyddar dina personuppgifter när du använder vår tjänst.',
  alternates: {
    canonical: '/integritetspolicy',
  },
};

/** Innehållsförteckningen: sidans h2 med id. */
const RUBRIKER = [
  {
    id: "introduktion",
    text: "1. Introduktion"
  },
  {
    id: "vilka-personuppgifter-samlar-vi-in",
    text: "2. Vilka personuppgifter samlar vi in?"
  },
  {
    id: "hur-anvander-vi-dina-personuppgifter",
    text: "3. Hur använder vi dina personuppgifter?"
  },
  {
    id: "delning-av-personuppgifter",
    text: "4. Delning av personuppgifter"
  },
  {
    id: "cookies",
    text: "5. Cookies och liknande tekniker"
  },
  {
    id: "datasakerhet",
    text: "6. Datasäkerhet"
  },
  {
    id: "datalagring",
    text: "7. Datalagring"
  },
  {
    id: "dina-rattigheter",
    text: "8. Dina rättigheter"
  },
  {
    id: "andringar-i-denna-integritetspolicy",
    text: "9. Ändringar i denna integritetspolicy"
  },
  {
    id: "kontakta-oss",
    text: "10. Kontakta oss"
  }
];

export default function PrivacyPolicyPage() {
  const lastUpdatedDate = "2026-10-11"; // *** UPPDATERA detta datum när policyn ändras ***

  return (
    <PubliktSida>
      <Textmall titel="Integritetspolicy för jobbcoach.ai" smula="Integritetspolicy" andrad={lastUpdatedDate} rubriker={RUBRIKER}>

        {/* Introduktion */}
        <section>
          <h2 id="introduktion">1. Introduktion</h2>
          <p>
            Välkommen till jobbcoach.ai ("vi", "oss", "vår"). Vi värnar om din integritet och är måna om att skydda dina personuppgifter. Denna integritetspolicy förklarar hur vi samlar in, använder, lagrar, delar och skyddar dina personuppgifter när du besöker vår webbplats (www.jobbcoach.ai) och använder våra tjänster (Tjänsten).
          </p>
          <p>
            Genom att använda Tjänsten godkänner du insamling och användning av information i enlighet med denna policy. Om du inte godkänner villkoren i denna policy, vänligen använd inte Tjänsten.
          </p>
        </section>

        {/* Vilken data samlar vi in? */}
        <section>
          <h2 id="vilka-personuppgifter-samlar-vi-in">2. Vilka personuppgifter samlar vi in?</h2>
          <p>
            Vi kan samla in följande typer av information:
          </p>
          <ul>
            <li>
              <strong>Kontoinformation:</strong> Din e-postadress och ett hashat lösenord för att du ska kunna logga in. Namn och telefonnummer samlas endast in om du frivilligt väljer att ange detta i din profil.
            </li>
            <li>
              <strong>Betalningsrelaterad Information (för {PREMIUM}):</strong> Vi använder den externa och pålitliga betalningstjänsten Stripe.com för att hantera prenumerationer. Vi samlar <strong>inte</strong> in eller lagrar dina kortuppgifter. När en betalning är genomförd via Stripe sparar vi det kund-ID och den prenumerationsstatus (t.ex. aktiv period, om medlemskapet är avslutat) som Stripe tillhandahåller. Detta gör vi för att kunna hantera din tillgång till {PREMIUM}.
            </li>
            <li>
              <strong>CV-filer och Innehåll:</strong> När du laddar upp ett CV sparas den oredigerade originalfilen samt en textversion (som du kan redigera i tjänsten) i vår säkra databas hos Supabase.
            </li>
             <li>
              <strong>Jobbannonser och Genererade Brev:</strong> Texten från jobbannonser du klistrar in samt de personliga brev som genereras och eventuellt sparas av dig via Tjänsten.
            </li>
             <li>
              <strong>Viktigt om CV-innehåll och Personuppgifter:</strong> Vi har <strong>ingen avsikt</strong> att samla in eller behandla känsliga personuppgifter (såsom personnummer, fullständig adress, etc.) som finns i ditt CV. <strong>Innan du laddar upp ditt CV måste du intyga att du har tagit bort sådana personuppgifter.</strong> Även om du tekniskt kan redigera bort uppgifter i textversionen senare, uppmanar vi dig starkt att göra detta <em>innan</em> uppladdning. Se avsnitt 3 för mer information om varför detta är viktigt.
            </li>
            <li>
              <strong>Användningsdata (Exempel):</strong> Vi kan samla in information om hur du använder Tjänsten, t.ex. IP-adress, webbläsartyp, vilka sidor du besöker, för att förbättra tjänsten. Användningsstatistiken samlas in med PostHog (EU). Själva tjänsten drivs hos Vercel.
            </li>
            <li>
              <strong>Kommunikation:</strong> Om du kontaktar oss (t.ex. via e-post) kan vi spara korrespondensen för att kunna hjälpa dig.
            </li>
            <li>
              <strong>Cookies och spårningstekniker:</strong> Se avsnitt 5.
            </li>
          </ul>
        </section>

        {/* Hur använder vi din data? */}
        <section>
          <h2 id="hur-anvander-vi-dina-personuppgifter">3. Hur använder vi dina personuppgifter?</h2>
          <p>
            Vi använder den insamlade informationen för följande ändamål:
          </p>
          <ul>
            <li>
              <strong>För att tillhandahålla Tjänstens kärnfunktion:</strong> Lagra dina CV-filer (original och textversion) och sparade brev. Framför allt använder vi <strong>textinnehållet från ditt (redigerade) CV och texten från jobbannonsen för att skapa personliga brev, analysera CV:t och matcha jobb via Google (Gemini API).</strong>
            </li>
            <li>
              <strong>Viktig information om AI och CV-innehåll:</strong> För att AI:n ska kunna skapa ett relevant och användbart personligt brev, skickas textinnehållet från ditt CV (den redigerbara textversionen) samt texten från jobbannonsen du angett till Google (Gemini API). För personliga brev och CV-analysen byter vi först ut namn, e-postadress, telefonnummer, personnummer, gatuadress och postnummer mot platshållare, så att de uppgifterna inte följer med. När du låter oss skriva om CV:t, matcha jobb, optimera LinkedIn-profilen eller bifogar CV:t till Jobbcoachen skickas texten utan den maskeringen, och en inskannad PDF utan textlager läses av med samma tjänst innan något kan maskas. Eftersom vi inte har för avsikt att behandla eller skicka vidare känsliga personuppgifter som du kan ha i ditt CV, är det <strong>avgörande att du följer vår uppmaning och intygar vid uppladdning att du har tagit bort sådana uppgifter.</strong> Vi ansvarar inte för personuppgifter som du själv väljer att lämna kvar i den text som skickas till Google (Gemini API) för generering.
            </li>
            <li>För att hantera ditt konto och din eventuella prenumeration (baserat på information från Stripe).</li>
            <li>För att förbättra och optimera Tjänsten (genom analys av t.ex. användningsdata).</li>
            <li>För att kommunicera med dig (t.ex. svara på supportärenden).</li>
            <li>För att uppfylla legala krav och förhindra missbruk av Tjänsten.</li>
            {/* Ta bort punkt om träning av AI-modeller om ni inte gör det internt */}
          </ul>
        </section>

        {/* Hur delar vi din data? */}
        <section>
          <h2 id="delning-av-personuppgifter">4. Delning av personuppgifter</h2>
          <p>
            Vi säljer inte dina personuppgifter. Vi kan dela dina uppgifter med noggrant utvalda tredje parter under följande omständigheter:
          </p>
          <ul>
            <li>
              <strong>Tjänsteleverantörer:</strong>
              <ul>
                  <li>
                    <strong>Supabase:</strong> Används för säker hosting av vår databas där din kontoinformation, CV-filer (original och text), sparade brev och annan nödvändig data lagras.
                  </li>
                  <li>
                    <strong>Stripe.com:</strong> Vår betalningspartner som säkert hanterar alla betalningstransaktioner för {PREMIUM}. Vi delar endast information som är nödvändig för att identifiera och hantera din prenumeration (t.ex. kund-ID från Stripe).
                  </li>
                  <li>
                    <strong>Google (Gemini API):</strong> Textinnehållet från ditt redigerade CV och jobbannonsen skickas till Googles Gemini API för att skapa personliga brev, CV-analysen och jobbmatchningen. Före personliga brev och CV-analysen byts namn, e-postadress, telefonnummer, personnummer, gatuadress och postnummer ut mot platshållare.
                  </li>
              </ul>
               <p>Dessa tjänsteleverantörer har endast tillgång till den information som krävs för att utföra sina uppgifter åt oss och är kontraktsmässigt bundna att skydda din information och inte använda den för andra ändamål.</p>
            </li>
             <li>
              <strong>Legala krav:</strong> Om det krävs enligt lag eller som svar på giltiga förfrågningar från myndigheter.
            </li>
            <li>
              <strong>Affärsöverlåtelse:</strong> Vid en eventuell fusion, förvärv eller försäljning av jobbcoach.ai kan dina uppgifter överföras. Vi meddelar dig i så fall innan detta sker.
            </li>
             <li>
              <strong>Med ditt samtycke:</strong> För andra ändamål endast om vi har ditt uttryckliga samtycke.
            </li>
          </ul>
        </section>

        {/* Cookies */}
        <section>
          <h2 id="cookies">5. Cookies och liknande tekniker</h2>
          <p>
            Vi använder cookies och liknande tekniker för att Tjänsten ska fungera korrekt och för att förbättra din användarupplevelse. Detta kan inkludera:
          </p>
           <ul>
               <li><strong>Nödvändiga cookies:</strong> Krävs för grundläggande funktioner som inloggning och sessionshantering.</li>
               <li><strong>Analys (PostHog, lagring inom EU):</strong> Hjälper oss förstå hur Tjänsten används så att vi kan förbättra den, till exempel vilka sidor som besöks och hur många som startar ett test.</li>
           </ul>
           <p>
            Så styr ditt val i cookie-rutan analysen:
          </p>
           <ul>
               <li><strong>Acceptera:</strong> PostHog sparar ett anonymt id i en cookie och i din webbläsares lagring, så att vi kan se hur Tjänsten används över flera besök.</li>
               <li><strong>Innan du har valt:</strong> vi räknar sidvisningar och klick utan cookies och utan att något sparas i din webbläsare. Id:t lever bara så länge fliken är öppen.</li>
               <li><strong>Avvisa:</strong> ingen analys alls. PostHog laddas inte och ingenting om ditt besök skickas dit. Vi sparar bara ditt val, så att vi inte frågar igen.</li>
           </ul>
           <p>
            Du kan ändra ditt val genom att rensa cookies för jobbcoach.ai i din webbläsare, så visas cookie-rutan igen.
          </p>
        </section>

        {/* Datasäkerhet */}
        <section>
          <h2 id="datasakerhet">6. Datasäkerhet</h2>
          <p>
            Säkerheten för dina uppgifter är viktig för oss. Vi använder etablerade tjänsteleverantörer som Supabase och Stripe som vidtar omfattande säkerhetsåtgärder. Vi använder även tekniska åtgärder som [Exempel: SSL/TLS-kryptering, hashade lösenord].
          </p>
          <p>
            Dock är ingen metod för dataöverföring eller lagring 100% säker. Vi uppmanar dig också att skydda ditt konto med ett starkt lösenord och att följa vår rekommendation om att inte inkludera känsliga personuppgifter i dina uppladdade CV-filer.
          </p>
        </section>

        {/* Datalagring */}
         <section>
          <h2 id="datalagring">7. Datalagring</h2>
          <p>
             Vi lagrar din kontoinformation och prenumerationsstatus (via Stripe kund-ID) så länge ditt konto är aktivt hos oss, och en rimlig tid därefter för administrativa ändamål eller om det krävs enligt lag.
          </p>
          <p>
            Dina uppladdade CV-filer (original och textversion) samt dina sparade personliga brev lagras i vår databas (Supabase) och är kopplade till ditt konto. Du kan när som helst radera dessa filer och brev via ditt konto. Om du raderar ditt konto kommer även denna data att raderas [Specificera eventuell fördröjning eller backup-policy om relevant].
          </p>
          <p>
            Svar du skriver i intervjuprovet i våra artiklar sparas i sju dagar tillsammans med bedömningen, så att du kan hämta hela återkopplingen. Det gäller också när du skapat ett konto och svaret kopplats till det. Efter sju dagar raderas svaret automatiskt. Vi sparar inte din IP-adress, bara en envägskodad version som används för att begränsa antalet prov per dygn.
          </p>
        </section>

        {/* Dina rättigheter (GDPR) */}
        <section>
          <h2 id="dina-rattigheter">8. Dina rättigheter</h2>
          <p>
            I enlighet med GDPR och annan tillämplig lagstiftning har du rättigheter gällande dina personuppgifter:
          </p>
          <ul>
            <li>Rätt till tillgång, rättelse, radering, begränsning av behandling, invändning mot behandling och dataportabilitet.</li>
            {/* Behåll de mer detaljerade punkterna från förra versionen om du föredrar det */}
          </ul>
           <p>
            Du kan hantera mycket av din information (t.ex. radera CV/brev, uppdatera profil) direkt via dina kontoinställningar. För övriga förfrågningar, vänligen kontakta oss via e-postadressen nedan. Vi kan behöva verifiera din identitet. Du har även rätt att lämna in klagomål till Integritetsskyddsmyndigheten (IMY).
          </p>
        </section>

        {/* Ändringar i policyn */}
        <section>
          <h2 id="andringar-i-denna-integritetspolicy">9. Ändringar i denna integritetspolicy</h2>
          <p>
            Vi kan uppdatera denna policy. Ändringar publiceras här med ett uppdaterat datum högst upp. Vid väsentliga ändringar kan vi även meddela dig via e-post eller via Tjänsten.
          </p>
        </section>

        {/* Kontaktinformation */}
        <section>
          <h2 id="kontakta-oss">10. Kontakta oss</h2>
          <p>
            Om du har frågor om denna integritetspolicy, vänligen kontakta oss:
          </p>
          <ul className="list-none">
            <li>Via e-post: <a href="mailto:support@jobbcoach.ai">support@jobbcoach.ai</a></li>
          </ul>
        </section>

      </Textmall>
    </PubliktSida>
  );
}

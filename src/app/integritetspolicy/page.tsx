import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Integritetspolicy | CVbrev.se',
  description: 'Läs vår integritetspolicy för att förstå hur CVbrev.se samlar in, använder och skyddar dina personuppgifter när du använder vår tjänst.',
  alternates: {
    canonical: '/integritetspolicy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdatedDate = "2024-07-27"; // *** UPPDATERA detta datum när policyn ändras ***

  return (
    <div className="bg-navy-900 py-16 lg:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
          Integritetspolicy för CVbrev.se
        </h1>
        <p className="text-center text-gray-400 mb-10 text-sm">
          Senast uppdaterad: {lastUpdatedDate}
        </p>

        {/* Introduktion */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">1. Introduktion</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Välkommen till CVbrev.se ("vi", "oss", "vår"). Vi värnar om din integritet och är måna om att skydda dina personuppgifter. Denna integritetspolicy förklarar hur vi samlar in, använder, lagrar, delar och skyddar dina personuppgifter när du besöker vår webbplats (www.cvbrev.se) och använder våra tjänster (Tjänsten).
          </p>
          <p className="text-gray-300 leading-relaxed">
            Genom att använda Tjänsten godkänner du insamling och användning av information i enlighet med denna policy. Om du inte godkänner villkoren i denna policy, vänligen använd inte Tjänsten.
          </p>
        </section>

        {/* Vilken data samlar vi in? */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">2. Vilka personuppgifter samlar vi in?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Vi kan samla in följande typer av information:
          </p>
          <ul className="list-disc list-inside space-y-3 mb-4 text-gray-300 pl-4">
            <li>
              <strong className="font-semibold text-white">Kontoinformation:</strong> Din e-postadress och ett hashat lösenord för att du ska kunna logga in. Namn och telefonnummer samlas endast in om du frivilligt väljer att ange detta i din profil.
            </li>
            <li>
              <strong className="font-semibold text-white">Betalningsrelaterad Information (för Premium):</strong> Vi använder den externa och pålitliga betalningstjänsten Stripe.com för att hantera prenumerationer. Vi samlar **inte** in eller lagrar dina kortuppgifter. När en betalning är genomförd via Stripe sparar vi det kund-ID och den prenumerationsstatus (t.ex. aktiv period, om medlemskapet är avslutat) som Stripe tillhandahåller. Detta gör vi för att kunna hantera din Premium-åtkomst.
            </li>
            <li>
              <strong className="font-semibold text-white">CV-filer och Innehåll:</strong> När du laddar upp ett CV sparas den oredigerade originalfilen samt en textversion (som du kan redigera i tjänsten) i vår säkra databas hos Supabase.
            </li>
             <li>
              <strong className="font-semibold text-white">Jobbannonser och Genererade Brev:</strong> Texten från jobbannonser du klistrar in samt de personliga brev som genereras och eventuellt sparas av dig via Tjänsten.
            </li>
             <li>
              <strong className="font-semibold text-white">Viktigt om CV-innehåll och Personuppgifter:</strong> Vi har **ingen avsikt** att samla in eller behandla känsliga personuppgifter (såsom personnummer, fullständig adress, etc.) som finns i ditt CV. **Innan du laddar upp ditt CV måste du intyga att du har tagit bort sådana personuppgifter.** Även om du tekniskt kan redigera bort uppgifter i textversionen senare, uppmanar vi dig starkt att göra detta *innan* uppladdning. Se avsnitt 3 för mer information om varför detta är viktigt.
            </li>
            <li>
              <strong className="font-semibold text-white">Användningsdata (Exempel):</strong> Vi kan samla in information om hur du använder Tjänsten, t.ex. IP-adress, webbläsartyp, vilka sidor du besöker, för att förbättra tjänsten. [Specificera om ni använder analysverktyg som Vercel Analytics/Google Analytics].
            </li>
            <li>
              <strong className="font-semibold text-white">Kommunikation:</strong> Om du kontaktar oss (t.ex. via e-post) kan vi spara korrespondensen för att kunna hjälpa dig.
            </li>
            <li>
              <strong className="font-semibold text-white">Cookies och spårningstekniker:</strong> Se avsnitt 5.
            </li>
          </ul>
        </section>

        {/* Hur använder vi din data? */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">3. Hur använder vi dina personuppgifter?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Vi använder den insamlade informationen för följande ändamål:
          </p>
          <ul className="list-disc list-inside space-y-3 mb-4 text-gray-300 pl-4">
            <li>
              <strong className="font-semibold text-white">För att tillhandahålla Tjänstens kärnfunktion:</strong> Lagra dina CV-filer (original och textversion) och sparade brev. Framför allt använder vi **textinnehållet från ditt (redigerade) CV och texten från jobbannonsen för att generera personliga brev via OpenAI:s API.**
            </li>
            <li>
              <strong className="font-semibold text-white">Viktig Information om OpenAI och CV-innehåll:</strong> För att AI:n ska kunna skapa ett relevant och användbart personligt brev, skickas textinnehållet från ditt CV (den redigerbara textversionen) samt texten från jobbannonsen du angett till OpenAI:s tjänst via deras API. Eftersom vi inte har för avsikt att behandla eller skicka vidare känsliga personuppgifter som du kan ha i ditt CV, är det **avgörande att du följer vår uppmaning och intygar vid uppladdning att du har tagit bort sådana uppgifter.** Vi ansvarar inte för personuppgifter som du själv väljer att lämna kvar i den text som skickas till OpenAI för generering.
            </li>
            <li>För att hantera ditt konto och din eventuella Premium-prenumeration (baserat på information från Stripe).</li>
            <li>För att förbättra och optimera Tjänsten (genom analys av t.ex. användningsdata).</li>
            <li>För att kommunicera med dig (t.ex. svara på supportärenden).</li>
            <li>För att uppfylla legala krav och förhindra missbruk av Tjänsten.</li>
            {/* Ta bort punkt om träning av AI-modeller om ni inte gör det internt */}
          </ul>
        </section>

        {/* Hur delar vi din data? */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">4. Delning av personuppgifter</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Vi säljer inte dina personuppgifter. Vi kan dela dina uppgifter med noggrant utvalda tredje parter under följande omständigheter:
          </p>
          <ul className="list-disc list-inside space-y-3 mb-4 text-gray-300 pl-4">
            <li>
              <strong className="font-semibold text-white">Tjänsteleverantörer:</strong>
              <ul className="list-[circle] list-inside space-y-2 mt-2 ml-4">
                  <li>
                    <strong className="font-semibold">Supabase:</strong> Används för säker hosting av vår databas där din kontoinformation, CV-filer (original och text), sparade brev och annan nödvändig data lagras.
                  </li>
                  <li>
                    <strong className="font-semibold">Stripe.com:</strong> Vår betalningspartner som säkert hanterar alla betalningstransaktioner för Premium-prenumerationer. Vi delar endast information som är nödvändig för att identifiera och hantera din prenumeration (t.ex. kund-ID från Stripe).
                  </li>
                  <li>
                    <strong className="font-semibold">OpenAI:</strong> Textinnehållet från ditt redigerade CV och jobbannonsen skickas till OpenAI:s API för att möjliggöra genereringen av det personliga brevet.
                  </li>
              </ul>
               <p className="mt-2 text-sm text-gray-400">Dessa tjänsteleverantörer har endast tillgång till den information som krävs för att utföra sina uppgifter åt oss och är kontraktsmässigt bundna att skydda din information och inte använda den för andra ändamål.</p>
            </li>
             <li>
              <strong className="font-semibold text-white">Legala krav:</strong> Om det krävs enligt lag eller som svar på giltiga förfrågningar från myndigheter.
            </li>
            <li>
              <strong className="font-semibold text-white">Affärsöverlåtelse:</strong> Vid en eventuell fusion, förvärv eller försäljning av CVbrev.se kan dina uppgifter överföras. Vi meddelar dig i så fall innan detta sker.
            </li>
             <li>
              <strong className="font-semibold text-white">Med ditt samtycke:</strong> För andra ändamål endast om vi har ditt uttryckliga samtycke.
            </li>
          </ul>
        </section>

        {/* Cookies */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies och liknande tekniker</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Vi använder cookies och liknande tekniker för att Tjänsten ska fungera korrekt och för att förbättra din användarupplevelse. Detta kan inkludera:
          </p>
           <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300 pl-4">
               <li><strong className="font-semibold text-white">Nödvändiga cookies:</strong> Krävs för grundläggande funktioner som inloggning och sessionshantering.</li>
               <li><strong className="font-semibold text-white">Prestanda/Analys cookies (om tillämpligt):</strong> Hjälper oss förstå hur Tjänsten används så vi kan förbättra den (t.ex. via [Namnge verktyg om ni använder]).</li>
           </ul>
           <p className="text-gray-300 leading-relaxed">
            Du kan hantera dina cookie-inställningar via din webbläsare.
          </p>
        </section>

        {/* Datasäkerhet */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">6. Datasäkerhet</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Säkerheten för dina uppgifter är viktig för oss. Vi använder etablerade tjänsteleverantörer som Supabase och Stripe som vidtar omfattande säkerhetsåtgärder. Vi använder även tekniska åtgärder som [Exempel: SSL/TLS-kryptering, hashade lösenord].
          </p>
          <p className="text-gray-300 leading-relaxed">
            Dock är ingen metod för dataöverföring eller lagring 100% säker. Vi uppmanar dig också att skydda ditt konto med ett starkt lösenord och att följa vår rekommendation om att inte inkludera känsliga personuppgifter i dina uppladdade CV-filer.
          </p>
        </section>

        {/* Datalagring */}
         <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">7. Datalagring</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
             Vi lagrar din kontoinformation och prenumerationsstatus (via Stripe kund-ID) så länge ditt konto är aktivt hos oss, och en rimlig tid därefter för administrativa ändamål eller om det krävs enligt lag.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Dina uppladdade CV-filer (original och textversion) samt dina sparade personliga brev lagras i vår databas (Supabase) och är kopplade till ditt konto. Du kan när som helst radera dessa filer och brev via ditt konto. Om du raderar ditt konto kommer även denna data att raderas [Specificera eventuell fördröjning eller backup-policy om relevant].
          </p>
        </section>

        {/* Dina rättigheter (GDPR) */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">8. Dina rättigheter</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            I enlighet med GDPR och annan tillämplig lagstiftning har du rättigheter gällande dina personuppgifter:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300 pl-4">
            <li>Rätt till tillgång, rättelse, radering, begränsning av behandling, invändning mot behandling och dataportabilitet.</li>
            {/* Behåll de mer detaljerade punkterna från förra versionen om du föredrar det */}
          </ul>
           <p className="text-gray-300 leading-relaxed">
            Du kan hantera mycket av din information (t.ex. radera CV/brev, uppdatera profil) direkt via dina kontoinställningar. För övriga förfrågningar, vänligen kontakta oss via e-postadressen nedan. Vi kan behöva verifiera din identitet. Du har även rätt att lämna in klagomål till Integritetsskyddsmyndigheten (IMY).
          </p>
        </section>

        {/* Ändringar i policyn */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">9. Ändringar i denna integritetspolicy</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Vi kan uppdatera denna policy. Ändringar publiceras här med ett uppdaterat datum högst upp. Vid väsentliga ändringar kan vi även meddela dig via e-post eller via Tjänsten.
          </p>
        </section>

        {/* Kontaktinformation */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">10. Kontakta oss</h2>
          <p className="text-gray-300 leading-relaxed">
            Om du har frågor om denna integritetspolicy, vänligen kontakta oss:
          </p>
          <ul className="list-none space-y-2 mt-4 text-gray-300">
            <li>Via e-post: <a href="mailto:support@cvbrev.se" className="text-pink-500 hover:text-pink-400 underline">support@cvbrev.se</a></li>
          </ul>
        </section>

      </div>
    </div>
  );
}
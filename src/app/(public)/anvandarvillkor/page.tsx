import { Metadata } from 'next';
import Link from 'next/link'; // Kan behövas för länkar i texten

export const metadata: Metadata = {
  title: 'Användarvillkor | jobbcoach.ai',
  description: 'Läs användarvillkoren för jobbcoach.ai innan du använder vår tjänst för att skapa personliga brev och CV:n med AI.',
  alternates: {
    canonical: '/anvandarvillkor',
  },
};

export default function TermsOfServicePage() {
  const lastUpdatedDate = "2024-07-27"; // *** UPPDATERA detta datum när villkoren ändras ***

  return (
    <div className="bg-navy-900 py-16 lg:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
          Användarvillkor för jobbcoach.ai
        </h1>
        <p className="text-center text-gray-400 mb-10 text-sm">
          Senast uppdaterad: {lastUpdatedDate}
        </p>


        {/* 1. Godkännande av Villkoren */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">1. Godkännande av Villkoren</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Välkommen till jobbcoach.ai ("Tjänsten"), som drivs av jobbcoach.ai ("vi", "oss", "vår"). Dessa Användarvillkor ("Villkoren") styr din åtkomst till och användning av vår webbplats (www.jobbcoach.ai) och de tjänster vi erbjuder, inklusive generering av personliga brev och CV-relaterade funktioner med hjälp av artificiell intelligens (AI).
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            Genom att registrera ett konto, få åtkomst till eller använda Tjänsten, bekräftar du att du har läst, förstått och godkänner att vara bunden av dessa Villkor samt vår <Link href="/integritetspolicy" className="text-pink-500 hover:text-pink-400 underline">Integritetspolicy</Link>. Om du inte godkänner dessa Villkor, får du inte använda Tjänsten.
          </p>
          <p className="text-gray-300 leading-relaxed">
          </p>
        </section>

        {/* 2. Beskrivning av Tjänsten */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">2. Beskrivning av Tjänsten</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            jobbcoach.ai tillhandahåller en plattform där användare kan ladda upp sitt CV, klistra in jobbannonser och använda vår AI-teknologi för att generera utkast till personliga brev. Tjänsten kan erbjudas i olika nivåer, inklusive en gratisversion med begränsad funktionalitet och en eller flera betalda prenumerationsnivåer ("Premium") med utökade funktioner och/eller högre användningsgränser.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Vi strävar efter att Tjänsten ska vara tillgänglig och funktionell, men vi garanterar inte oavbruten eller felfri drift. Vi förbehåller oss rätten att ändra, uppdatera, avbryta eller begränsa Tjänsten eller dess funktioner när som helst, med eller utan förvarning.
          </p>
        </section>

        {/* 3. Användarkonton */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">3. Användarkonton</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            För att använda de flesta funktionerna i Tjänsten måste du registrera ett konto. Du samtycker till att:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300 pl-4">
            <li>Tillhandahålla korrekt, aktuell och fullständig information under registreringsprocessen.</li>
            <li>Uppdatera din kontoinformation vid behov för att hålla den korrekt.</li>
            <li>Skydda ditt lösenord och hålla det konfidentiellt. Du är ensam ansvarig för all aktivitet som sker under ditt konto.</li>
            <li>Omedelbart meddela oss om du misstänker obehörig åtkomst till ditt konto via <a href="mailto:[support@jobbcoach.ai]" className="text-pink-500 hover:text-pink-400 underline">support@jobbcoach.ai</a>.</li>
          </ul>
          <p className="text-gray-300 leading-relaxed">
             Vi förbehåller oss rätten att stänga av eller avsluta konton som bryter mot dessa Villkor eller som vi anser vara inaktiva under en längre period [Specificera eventuell tidsram].
          </p>
        </section>

        {/* 4. Användarinnehåll och Ansvar */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">4. Användarinnehåll och Ansvar</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Du är ensam ansvarig för all information, text (inklusive CV-innehåll och jobbannonser) och filer som du laddar upp, klistrar in, genererar, sparar eller på annat sätt gör tillgänglig via Tjänsten ("Användarinnehåll").
          </p>
           <p className="text-gray-300 leading-relaxed mb-4">
            <strong className="font-semibold text-white">Viktigt om Personuppgifter i CV:</strong> Som beskrivet i vår Integritetspolicy, använder Tjänsten OpenAI:s API för att generera brev. Detta innebär att textinnehållet från ditt CV (den redigerbara versionen) skickas till OpenAI. För att skydda din integritet och undvika att oavsiktligt skicka känsliga personuppgifter till tredje part, **kräver vi att du, innan du laddar upp ditt CV, noggrant granskar och tar bort alla känsliga personuppgifter (såsom personnummer, fullständig adress, etniskt ursprung, hälsodata etc.). Du måste intyga att du har gjort detta vid uppladdning.** Du ansvarar fullt ut för det innehåll du lämnar kvar i den textversion av ditt CV som används för generering och skickas till OpenAI. Vi tar inget ansvar för personuppgifter som du själv väljer att inkludera i ditt Användarinnehåll som behandlas av AI-tjänsten.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            Genom att tillhandahålla Användarinnehåll ger du oss en begränsad, global, icke-exklusiv, royaltyfri licens att använda, lagra, reproducera och bearbeta ditt Användarinnehåll (inklusive att skicka det till AI-tjänster som OpenAI) **uteslutande i syfte att tillhandahålla och förbättra Tjänsten åt dig.** Du behåller äganderätten till ditt ursprungliga CV och de brev som genereras baserat på din input.
          </p>
           <p className="text-gray-300 leading-relaxed">
            Du garanterar att ditt Användarinnehåll inte bryter mot lag, upphovsrätt, sekretess eller andra rättigheter tillhörande tredje part.
          </p>
        </section>

         {/* 5. Tillåten Användning */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">5. Tillåten Användning</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Du samtycker till att endast använda Tjänsten för lagliga ändamål och i enlighet med dessa Villkor. Du får inte:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300 pl-4">
            <li>Använda Tjänsten på ett sätt som bryter mot någon tillämplig lokal, nationell eller internationell lag eller förordning.</li>
            <li>Ladda upp eller generera innehåll som är olagligt, skadligt, hotfullt, kränkande, ärekränkande, obscent, eller inkräktar på annans integritet eller immateriella rättigheter.</li>
            <li>Försöka få obehörig åtkomst till, störa, skada eller förstöra någon del av Tjänsten, dess servrar eller nätverk.</li>
            <li>Använda robotar, spindlar eller andra automatiserade medel för att få åtkomst till Tjänsten för något ändamål utan vårt uttryckliga skriftliga medgivande (t.ex. scraping).</li>
            <li>Försöka dekompilera, bakåtkompilera eller på annat sätt försöka utvinna källkoden till Tjänsten.</li>
             <li>Utge dig för att vara någon annan person eller enhet.</li>
          </ul>
        </section>

         {/* 6. Immateriella Rättigheter */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">6. Immateriella Rättigheter</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Tjänsten och dess ursprungliga innehåll (exklusive Användarinnehåll), funktioner och funktionalitet (inklusive men inte begränsat till all mjukvara, text, grafik, logotyper, ikoner och den underliggande AI-metodiken) är och förblir den exklusiva egendomen tillhörande jobbcoach.ai och dess licensgivare. Tjänsten är skyddad av upphovsrätt, varumärkesrätt och andra lagar i både Sverige och andra länder.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Du beviljas en begränsad, icke-exklusiv, icke-överlåtbar licens att få åtkomst till och använda Tjänsten för dina personliga, icke-kommersiella jobbsökarändamål i enlighet med dessa Villkor.
          </p>
        </section>

        {/* 7. Premiumtjänster och Betalning */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">7. Premiumtjänster och Betalning</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Om du väljer att prenumerera på våra Premiumtjänster, godkänner du att betala de avgifter som anges vid köptillfället.
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300 pl-4">
            <li>
              <strong className="font-semibold text-white">Betalningshantering:</strong> Alla betalningar hanteras säkert via vår tredjepartsleverantör, Stripe.com. Genom att göra ett köp godkänner du även Stripes användarvillkor och integritetspolicy. Vi lagrar inga kortuppgifter.
            </li>
            <li>
              <strong className="font-semibold text-white">Prenumerationsperiod och Förnyelse:</strong> Premium-prenumerationer faktureras i förskott på återkommande basis (t.ex. månadsvis eller årsvis), enligt den period du valt. Din prenumeration förnyas automatiskt vid slutet av varje period om du inte avbryter den.
            </li>
            <li>
              <strong className="font-semibold text-white">Avbokning:</strong> Du kan avbryta din Premium-prenumeration när som helst via din "profilsida" eller "genom att kontakta support"]. Avbokningen träder i kraft vid slutet av den innevarande faktureringsperioden. Du har tillgång till Premium-funktionerna fram till dess.
            </li>
             <li>
              <strong className="font-semibold text-white">Återbetalningar:</strong> Betalda prenumerationsavgifter är generellt sett inte återbetalningsbara, förutom där det krävs enligt lag. [Justera detta om ni har en annan policy]. Vi erbjuder inga återbetalningar eller krediter för delvis använda prenumerationsperioder.
            </li>
             <li>
              <strong className="font-semibold text-white">Prisändringar:</strong> Vi förbehåller oss rätten att ändra priserna för våra Premiumtjänster. Eventuella prisändringar träder i kraft vid nästa förnyelseperiod efter att vi har meddelat dig om ändringen via e-post och i webbappen. 
            </li>
          </ul>
        </section>

         {/* 8. Friskrivningar */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">8. Friskrivningar (Disclaimers)</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            TJÄNSTEN TILLHANDAHÅLLS "I BEFINTLIGT SKICK" OCH "I MÅN AV TILLGÅNG", UTAN NÅGRA GARANTIER AV NÅGOT SLAG, VARKEN UTTRYCKLIGA ELLER UNDERFÖRSTÅDDA.
          </p>
           <p className="text-gray-300 leading-relaxed mb-4">
            VI GARANTERAR INTE ATT TJÄNSTEN KOMMER ATT VARA FELFI, SÄKER, OAVBRUTEN ELLER TILLGÄNGLIG VID NÅGON SPECIFIK TIDPUNKT ELLER PLATS. VI GARANTERAR INTE HELLER ATT RESULTATEN (T.EX. DE GENERERADE PERSONLIGA BREVEN) KOMMER ATT VARA KORREKTA, PÅLITLIGA, LÄMPLIGA FÖR DITT SPECIFIKA ÄNDAMÅL ELLER ATT DE KOMMER ATT LEDA TILL EN ANSTÄLLNINGSINTERVJU ELLER ETT JOBB. DU ANVÄNDER TJÄNSTEN OCH DE GENERERADE TEXTERNA HELT PÅ EGEN RISK OCH ANSVARAR SJÄLV FÖR ATT GRANSKA OCH ANPASSA ALLT INNEHÅLL INNAN DU ANVÄNDER DET I EN JOBBANSÖKAN.
          </p>
          <p className="text-gray-300 leading-relaxed">
            VI FRISKRIVER OSS FRÅN ALLA GARANTIER, INKLUSIVE, MEN INTE BEGRÄNSAT TILL, UNDERFÖRSTÅDDA GARANTIER OM SÄLJBARHET, LÄMPLIGHET FÖR ETT VISST ÄNDAMÅL OCH ICKE-INTRÅNG.
          </p>
        </section>

        {/* 9. Ansvarsbegränsning */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">9. Ansvarsbegränsning</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            I DEN UTSTRÄCKNING DET ÄR TILLÅTET ENLIGT LAG SKA jobbcoach.ai, DESS ANSTÄLLDA, STYRELSELEDAMÖTER ELLER PARTNERS UNDER INGA OMSTÄNDIGHETER VARA ANSVARIGA FÖR NÅGRA INDIREKTA, OFÖRUTSEDDA, SÄRSKILDA, FÖLJDSKADOR ELLER STRAFFSKADOR, INKLUSIVE MEN INTE BEGRÄNSAT TILL, FÖRLUST AV VINST, DATA, ANVÄNDNING, GOODWILL ELLER ANDRA IMMATERIELLA FÖRLUSTER, SOM RESULTAT AV:
          </p>
           <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300 pl-4">
               <li>Din åtkomst till eller användning av, eller oförmåga att få åtkomst till eller använda Tjänsten.</li>
               <li>Något uppförande eller innehåll från tredje part på Tjänsten (inklusive AI-svar från OpenAI).</li>
               <li>Något innehåll som erhållits från Tjänsten.</li>
               <li>Obehörig åtkomst, användning eller ändring av dina överföringar eller ditt innehåll.</li>
           </ul>
           <p className="text-gray-300 leading-relaxed">
             [Eventuellt: Vårt totala ansvar gentemot dig för alla anspråk som uppstår ur eller relaterar till dessa Villkor eller din användning av Tjänsten ska inte överstiga det belopp du har betalat till oss för Tjänsten under de [t.ex. sex] månader som föregår händelsen som gav upphov till anspråket, eller 500 SEK, beroende på vilket som är högst.]
          </p>
        </section>

         {/* 10. Skadeslöshållande (Indemnification) */}
         <section className="mb-8">
           <h2 className="text-2xl font-semibold text-white mb-4">10. Skadeslöshållande</h2>
           <p className="text-gray-300 leading-relaxed mb-4">
             Du samtycker till att försvara, gottgöra och hålla jobbcoach.ai och dess licensgivare och licenstagare, samt deras respektive anställda, entreprenörer, agenter, tjänstemän och styrelseledamöter, skadeslösa från och mot alla anspråk, skador, skyldigheter, förluster, ansvar, kostnader eller skulder och utgifter (inklusive men inte begränsat till advokatarvoden), som härrör från eller uppstår ur a) din användning och åtkomst av Tjänsten, av dig eller någon person som använder ditt konto och lösenord; b) ett brott mot dessa Villkor, eller c) Användarinnehåll som du publicerar på Tjänsten.
           </p>
         </section>

         {/* 11. Uppsägning */}
         <section className="mb-8">
           <h2 className="text-2xl font-semibold text-white mb-4">11. Uppsägning</h2>
           <p className="text-gray-300 leading-relaxed mb-4">
             Vi kan säga upp eller stänga av ditt konto och din åtkomst till Tjänsten omedelbart, utan föregående meddelande eller ansvar, enligt eget gottfinnande, av vilken anledning som helst och utan begränsning, inklusive men inte begränsat till, om du bryter mot Villkoren.
           </p>
           <p className="text-gray-300 leading-relaxed mb-4">
             Om du vill avsluta ditt konto kan du göra det genom att [Beskriv hur man avslutar kontot, t.ex. "använda funktionen för kontoborttagning i dina inställningar" eller "kontakta support"].
           </p>
           <p className="text-gray-300 leading-relaxed">
             Vid uppsägning upphör din rätt att använda Tjänsten omedelbart. Alla bestämmelser i Villkoren som till sin natur bör överleva uppsägning ska överleva uppsägning, inklusive, utan begränsning, äganderättsbestämmelser, garantifriskrivningar, skadeslöshållande och ansvarsbegränsningar.
           </p>
         </section>

        {/* 12. Tillämplig Lag och Tvistlösning */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">12. Tillämplig Lag och Tvistlösning</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Dessa Villkor ska regleras och tolkas i enlighet med svensk rätt, utan hänsyn till dess lagvalsprinciper.
          </p>
           <p className="text-gray-300 leading-relaxed">
            Eventuella tvister som uppstår i samband med dessa Villkor eller Tjänsten ska i första hand försöka lösas genom förhandlingar mellan parterna. Om en överenskommelse inte kan nås ska tvisten avgöras av allmän svensk domstol, med [Ange tingsrätt, t.ex. Stockholms tingsrätt] som första instans.
          </p>
        </section>

        {/* 13. Ändringar av Villkoren */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">13. Ändringar av Villkoren</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Vi förbehåller oss rätten att, efter eget gottfinnande, ändra eller ersätta dessa Villkor när som helst. Om en ändring är väsentlig kommer vi att försöka meddela [Ange tidsram, t.ex. minst 30 dagar] i förväg innan de nya villkoren träder i kraft [Ange hur ni meddelar, t.ex. "genom att publicera de uppdaterade villkoren på denna sida" eller "via e-post"]. Vad som utgör en väsentlig ändring avgörs efter vårt eget gottfinnande.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Genom att fortsätta att använda Tjänsten efter att eventuella ändringar har trätt i kraft, godkänner du att vara bunden av de reviderade villkoren. Om du inte godkänner de nya villkoren måste du sluta använda Tjänsten.
          </p>
        </section>

        {/* 14. Kontaktinformation */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">14. Kontakta oss</h2>
          <p className="text-gray-300 leading-relaxed">
            Om du har några frågor om dessa Användarvillkor, vänligen kontakta oss:
          </p>
          <ul className="list-none space-y-2 mt-4 text-gray-300">
            <li>Via e-post: <a href="mailto:[support@jobbcoach.ai]" className="text-pink-500 hover:text-pink-400 underline">support@jobbcoach.ai</a></li>
          </ul>
        </section>

      </div>
    </div>
  );
}
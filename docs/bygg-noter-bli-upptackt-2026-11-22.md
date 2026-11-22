# Bli upptäckt: rättningarna efter klicktestet på live (2026-11-22)

Gren `design/publikt-omgang3`, arbetskopian `C:\Users\chris\cvbrev-publikt3`. Underlag: `docs/publikt-omgang3/bygg/logg-qa-live-4.md`. Ingen push.

## Överst: vad ägaren måste göra

1. **KÖRD 2026-11-22 kväll** (ägarens besked "Gör vad ni rekommenderar"). Kontrollerat: 8 profiler, 8 olika id, inget lika med kontots; den riktiga koden i `candidateAccess.ts` mot produktionen ger `public_id` som id för de synliga profilerna, kontots id ger ingen profil, och `public_id` leder tillbaka till rätt konto. Ursprunglig punkt: köra migreringen `supabase/migrations/20261123100000_candidate_profiles_public_id.sql`. Den lägger till `candidate_profiles.public_id` (slumpad uuid, unik). Tills den är körd pekar rekryteraren fortfarande ut kandidaten med kontots id, som förut. Koden känner av kolumnen själv inom fem minuter efter körningen, ingen ny driftsättning behövs. Efter körningen ger gamla adresser med kontots id 404.
2. **Läsa samtyckesraderna nedan** som inte längre stämmer ordagrant med vad koden gör. Inga samtyckestexter är ändrade.
3. **Bestämma om godkännanden direkt i databasen ska ge mail.** Mailet "Ditt rekryterarkonto är godkänt" går när kontot godkänns i adminen (Innehåll, fliken Rekryterare). Sätts `status = 'approved'` direkt i databasen går inget mail.
4. **Två synliga kandidatprofiler saknar CV** i dag (läsfråga 2026-11-22: 4 synliga, 2 utan `cv_id`, 8 rader totalt). De syns inte längre i poolen. Inga rader ändrade.

## Punkt 1: vägarna där kandidatuppgifter når en rekryterare

All kandidatdata till en rekryterares webbläsare formas av en vitlista, `src/lib/recruiter/recruiterView.ts` (`toRecruiterCard`, `toRecruiterDetail`). Funktionerna bygger ett nytt objekt fält för fält, så ett fält som läggs till i `candidateData.ts` når aldrig webbläsaren förrän någon skriver in det i vitlistan. Profilerna läses bara genom `src/lib/recruiter/candidateAccess.ts`.

| Väg | Vad den skickar | Går genom | Test |
|---|---|---|---|
| Poolen och sökningen, `GET /api/recruiter/pool` | träffkort | `toRecruiterCard` | `vagar-fore-ja.test.ts` |
| Filter och sortering (samma rutt) | träffkort; percentilfiltret, sorteringen och matchförklaringen ser bara placeringar över mitten | `poolSearch.ts`, `placering.ts` | ja |
| Detaljsidan, förhandspanelen och jämförelsen, `GET /api/recruiter/candidate/[candidateId]` | detaljprofil | `recruiterDetailFor` → `toRecruiterDetail` | ja |
| RSC-svaret för `/rekryterare/kandidat/[candidateId]` | bara adressens id (sidan är en klientkomponent) | – | klicktestet |
| Inkorgen, `GET /api/recruiter/interests` | intresse + träffkort | `recruiterCardsFor` | ja |
| Projekt, `GET /api/recruiter/projects/[projectId]` | träffkort | `recruiterCardsFor` | ja |
| Projektets kandidater (POST/PATCH/DELETE) | bara kandidatens id och status | `findVisibleProfile`, `userIdForRef` | ja (id) |
| Sparade sökningar, `/api/recruiter/saved-searches` | bara filtren, ingen kandidatdata | – | – |
| Bevakningsmejlet (morgonslotten i `api/cron/pricing-sync`) | roll, region, år, testmärkets etikett | `runPoolSearch` | ja |
| Anteckningar, `/api/recruiter/notes` | bara rekryterarens egen text | `userIdForRef` | ja |
| Delningslänken, `/delad/kandidat/[token]` (publik, server component) | detaljprofil med skaparens åtkomst, aldrig e-post | `getSharedCandidate` → `recruiterDetailFor` | ja |
| Intresset, `POST /api/recruiter/interest` | intresseraden | `findVisibleProfile` | ja (id) |
| Notis och mail till rekryteraren när kandidaten svarar, `POST /api/candidate/interests/respond` | namn bara vid ja, ingen CV-text | oförändrad | ja |
| Chatten, `/api/interests/[interestId]/messages` | meddelandena, avsändarnamn bara efter ja | oförändrad | – |
| Exporter | finns inga | – | – |

**Utöver den kända läckan** (`experience[].description`) skickades före ja också: `education[].school` (lärosätet), `experience[].period` med exakta datum, `activeSince` och testdatum med klockslag, `userId` (kontots id) och placeringen för resultat under mitten ("topp 64 %"). Delningslänken visade dessutom kandidatens e-post för den som öppnade länken efter ja (vyn ritade den inte, men den låg i sidans data). Allt detta är stängt.

### Fält för fält, före och efter ja

| Fält | Före ja (anonym) | Efter ja | Öppen profil utan ja | Delningslänken |
|---|---|---|---|---|
| Kandidatens id | `candidateId` (public_id när kolumnen finns) | samma | samma | samma |
| Yrkesroll, senaste titel och längd, titlar i historiken | ja | ja | ja | som skaparen |
| Titel per anställning | ja | ja | ja | som skaparen |
| Anställningens tid | längd i ord ("8 år") | perioden med datum | perioden | som skaparen |
| Arbetsgivare | nej, "Visas efter accepterad kontakt" | ja | ja | som skaparen |
| Beskrivning per anställning | nej, "Beskrivningen visas efter accepterad kontakt" | ja (högst 200 tecken) | ja | som skaparen |
| Utbildningens nivå och inriktning | ja | ja | ja | som skaparen |
| Lärosäte | nej, "Lärosätet visas efter accepterad kontakt" | ja | ja | som skaparen |
| Examensår | nej | ja | ja | som skaparen |
| Kompetenser, språk, region, villkor | ja | ja | ja | ja |
| Pitch och kontexttaggar (kandidatens egna ord i Bli upptäckt) | ja | ja | ja | ja |
| Testmärken | placering bara över mitten, annars bara nivån | samma | samma | samma |
| Personlighet | styrkor i ord och arbetsstil bara med kandidatens kryss | samma | samma | samma |
| Intervjuguide, onboarding | nej | ja | ja | som skaparen |
| Namn | nej | ja | ja | som skaparen |
| E-post | nej | ja | nej | aldrig |
| Sammanfattning/personbeskrivning ur CV:t, telefon, adress, länkar, foto, projekt, referenser | aldrig | aldrig | aldrig | aldrig |
| Lönespann | aldrig (bara filter i SQL) | aldrig | aldrig | aldrig |
| Råpoäng, Big Five-värden | aldrig | aldrig | aldrig | aldrig |
| Datum | bara dag, aldrig klockslag | samma | samma | samma |

### Kvarvarande risk

- **Titlar kan innehålla arbetsgivarens namn** ("Platschef på X", "Butikschef ICA Maxi"). Vi skickar titelfältet som det står i CV:t och tvättar det inte maskinellt. Samma gäller utbildningens inriktning ("Civilingenjör KTH").
- **Pitch och kontexttaggar** är kandidatens egna ord för rekryterare och följer med i alla lägen. Skriver kandidaten sin arbetsgivare där syns den.
- **Kompetenser** kommer ur CV:t och kan i sällsynta fall vara ett egennamn.
- **Kontots id** når rekryteraren tills migreringen för `public_id` är körd (punkt 2).
- **Klienten skriver `candidate_profiles` direkt under RLS.** En kandidat kan sätta `visibility` utan CV via API:t; poolen filtrerar bort sådana rader på servern, men raden kan stå som synlig. En databasregel kräver en migrering.
- **Organisationsnumret kontrolleras bara i webbläsaren** (raden skrivs därifrån under RLS). En databasregel kräver en migrering.

## Punkt 2: kontots id

`candidate_profiles` har inget eget id (primärnyckeln är `user_id`). Migreringen `20261123100000_candidate_profiles_public_id.sql` är skriven och **inte körd**. Koden (`candidateAccess.ts`) använder `public_id` när kolumnen finns, annars kontots id som förut. Rutterna heter nu `[candidateId]`, och alla rekryterarrutter tar och ger `candidateId`. Testat i enhetstest med och utan kolumnen; i klicktestet mot produktionen fanns kolumnen inte, så där syntes kontots id som förväntat.

## Punkt 3: synlig utan CV

Läsfrågan 2026-11-22: **4 synliga profiler, varav 2 utan valt CV** (8 rader totalt, inga rader ändrade). Poolen, detaljen, inkorgen, projekten, intresset och delningen visar inte längre profiler utan valt CV och yrkesroll.

## Punkt 4: testens placering

Placeringen visas bara vid topp 50 % eller bättre (`src/lib/recruiter/placering.ts`). Under mitten, och under 25 testade, står bara att testet är genomfört på nivån. Texterna "Placering visas vid 25 testade" och "Placering väntar" är ersatta med "Genomfört", så att de två fallen inte går att skilja åt. Kandidatens förhandsvisning visar rekryterarens egna märken.

## Punkt 5: vägen till ett godkänt rekryterarkonto

- Mailet till oss går till `support@jobbcoach.ai`, samma mottagare och mönster som kontaktformuläret. `KONTAKT_MOTTAGARE` kan styra om det till Resends testadresser. Ingen ny miljövariabel.
- 556677-8899 håller både form och kontrollsiffra och stoppas därför som exempelnummer, tillsammans med 556123-4567.
- Stavningen i rekryterardelen är **mail** (sju ställen mot tre för mejl).

## Samtyckesrader som inte stämmer ordagrant med koden

Inga texter ändrade. Raderna, ordagrant, och vad koden gör:

1. `delas.ts`, "Det här visas": **"Verifierade testresultat med percentiler"**. Koden visar placeringen bara över mitten; annars bara att testet är genomfört.
2. `delas.ts`, "Det här visas aldrig": **"Nuvarande arbetsgivare"**. Koden visar arbetsgivarna, också den nuvarande, efter kandidatens ja och i läget Öppen profil (så var det före den här omgången också).
3. `delas.ts`, "Det här visas aldrig": **"Ditt rå-CV eller personnummer"**. Efter ja och i Öppen profil visas beskrivningarna per anställning, som är CV:ts rader (högst 200 tecken var).
4. `delas.ts`, "Det här visas aldrig": **"Kontaktuppgifter"**. Efter ja delas namn och e-post (det huvudsamtycket inte nämner).
5. `ConsentModal.tsx`, personlighetsraden: **"Eget samtycke, kan bockas ur utan att synligheten påverkas."** Rutan är nu tom från början; "bockas ur" förutsätter att den är ikryssad.
6. `VisibilityModeCard.tsx`, Öppen profil: **"Namn syns direkt. Snabbare kontakt, mindre kontroll."** Öppen profil visar också arbetsgivare, beskrivningar och lärosäten direkt.
7. CV-uppladdningens samtycke: **"Ditt CV används bara för att skapa brev och analyser åt dig. Vi delar det aldrig med tredje part."** Samma CV driver profilen som rekryterare ser (anmärkt redan i loggen 2026-11-22).

`ConsentModal`, beskrivningen **"Vi skapar en kandidatprofil av ditt valda CV."** stämmer nu: synligheten går inte att slå på utan valt CV.

## Commits

| Punkt | Commit |
|---|---|
| 1 Läckan, vitlistan | `58977a50` |
| 2 Kontots id, migreringen (ej körd) | `ca6b94cf` |
| 3 Synlig utan CV | `fcaf92a8` |
| 4 Testens placering | `2e2356eb` |
| Personlighetssamtycket tomt från början (ägarbeslut under passet) | `4546a441`, följdrättning `aa8d4d99` |
| 5 Vägen till godkänt rekryterarkonto | `31deda03` |
| 6 Småfelen | `213b4a6d`, följdrättning `9e856660` (längden räknar med månaden) |
| Loggen från klicktestet på live | `4d34cb87` |

## Grindar

- `npx tsc --noEmit`: 0 fel.
- Hela vitest: 414 filer gröna, 3 hoppade; 5 067 test gröna, 13 hoppade. En tidigare körning fick ett fel i `FigurserieTrana.test.tsx` (tidsberoende under last); testet går grönt ensamt och i omkörningen.
- `next build --webpack` (`NODE_OPTIONS=--max-old-space-size=6144`): grönt två gånger, 804 av 804 sidor. Den opushade omgången `f8e3f088` till `255d1b30` bygger alltså grönt på grenen. De två nya artiklarna (`aktivitetsrapport-arbetsformedlingen.mdx`, `cv-och-personligt-brev-samma-mall.mdx`) var parkerade under bygget och ligger tillbaka oförändrade (sha256 kontrollerad).

## Klicktestet (lokalt `next start` mot produktionens databas, 1440 och 412)

Testkonton `qa-bu-kand-…@jobbcoach-qa.test` och `qa-bu-rek-…@jobbcoach-qa.test`. Servern körde med `KONTAKT_MOTTAGARE=delivered@resend.dev`, så mailet om ansökan gick till Resends testadress. AI-anrop: 2 (CV-inläsningen: `/api/cv/upload` och `/api/cv/quick-score`). Kännetecken i CV:t: arbetsgivarna Kvartsbo Bygg AB och Lövnäs Entreprenad AB, Zelinkahallen och Ormkärrsviadukten i beskrivningarna, lärosätet Hagbyhöjdens tekniska högskola, meningen med Tranbergsmetoden i profiltexten, namn, telefon och adress.

1. Kandidat utan CV på Bli upptäckt: "Innan du kan synas behöver profilen ett CV och en yrkesroll." med "Ladda upp ett CV", Kom igång avstängd.
2. CV:t laddat upp. Profilen fick **namn**, telefon och ort ur CV:t.
3. Tillbaka: det enda CV:t förvalt, Kom igång påslagen. Samtyckesdialogen: **båda rutorna tomma**. Huvudsamtycket kryssat, personlighetsrutan lämnad tom, Aktivera. Profilen synlig, anonym, CV sparat, `show_personality` falsk. "Tre av fem steg klara" utan räknare i kortet bredvid. Skärmläsarnamnen "Synlighetsläge, klart" och så vidare.
4. Förhandsvisningen: "Verbalt · Grundnivå" (resultat under mitten, inget tal), "Numeriskt · Grundnivå · topp 7 %", inga styrkor.
5. Rekryteraren registrerade sig: 556677-8899 gav "Det där är ett exempelnummer…", 559912-3452 gav "Organisationsnumret stämmer inte…", 559912-3451 godtogs. Ingen platshållare i fältet. "Ansökan mottagen: Tack! Vi granskar ansökan inom en till två arbetsdagar. Du får ett mail när kontot är godkänt." `POST /api/recruiter/ansokan` 200, mailet "Ny rekryteraransökan: QA Testbolaget Bli upptäckt AB" loggat till delivered@resend.dev. Godkänd på egen rad med servernyckeln.
6. Poolen, sökningen "Projektledare", detaljsidan (direkt med testkandidatens id ur databasen), klientnavigering dit från poolen (RSC-svaret), delningslänken öppnad utan inloggning: **ingen träff** på arbetsgivare, beskrivningar, lärosäte, profiltexten, namn, e-post, telefon, adress, datum, lön, råpoäng eller personlighetsvärden i något sparat svar. Längd i år per anställning, "Visas efter accepterad kontakt", "Beskrivningen visas…", "Lärosätet visas…". Kontots id fanns i `candidateId`, adressen och RSC-svaret: väntat, migreringen för `public_id` är inte körd.
7. Rekryteraren visade intresse med meddelande. Kandidaten: "Dina meddelanden (1)" och meddelandeikonen i toppraden i 1440, ikonen i 412; klockan "Notiser, 1 olästa" öppnar en ruta ovanför innehållet i båda bredderna, som stängs med klick utanför (**Escape stänger den inte**, se nedan). Engångsrutan "Här dyker rekryterare upp" stängdes med Uppfattat.
8. Kandidaten accepterade på Meddelanden och skrev ett meddelande; rekryteraren svarade i inkorgen. Båda meddelandena syns i tråden.
9. Efter ja: detaljsidan visar namn, e-post, arbetsgivare, beskrivningar med Zelinkahallen och lärosätet; profiltexten, telefon och adress fortfarande aldrig. Delningslänken efter ja: arbetsgivare, beskrivningar, lärosäte och namn, men **inte e-posten**.
10. Kandidaten slog på "Visa dina två främsta styrkor" (det nya reglaget för grundtestare): förhandsvisningen och rekryterarens detaljsida i 1440 och 412 visar Strukturerad och Samarbetsvillig, inga personlighetsvärden i svaren, ingen sidledsrullning i 412.
11. Kandidaten slog av synligheten (`visibility = off`).
12. Gamla adressen med kontots id ger 404 bara när kolumnen finns; mot produktionen gick det inte att pröva. Täcks av enhetstestet.

Bilder och sparade svar: `C:\Users\chris\AppData\Local\Temp\claude\dceaf5763afec129\2f505274-a60e-456c-8335-21ea685ee053\scratchpad\bli-upptackt\` (`bilder\`, `svar\fore`, `svar\fore2`, `svar\fore-delad`, `svar\efter`, `svar\efter-delad`, `svar\styrkor`).

### Fynd utanför punkterna

- Klockans notisruta stängs inte med Escape (klick utanför och på klockan fungerar). Delad komponent i toppraden, inte ändrad här.
- Inkorgens kort förblir anonymt ("Projektledare") efter ja; namnet syns på profilen. Inte ändrat.

## Städningen

Räknat först, sedan raderat per de två kontonas id och adresser (alla uuid-kolumner i public plus adressfälten, aldrig tidsfönster): user_activities 32, email_log 5, email_confirmations 2, email_schedule 2, notifications 3, logic_test_v4_sessions 2 (inlagda), user_personality_profile 1 (inlagd), candidate_interests 1, candidate_profile_views 1, candidate_profiles 1, cv_texts 1, recruiter_profiles 1, recruiter_share_links 1, user_ui_preferences 1, ai_usage_costs 1, profiles 2, filer under `users/<id>/` i `cvs` 2, användare i auth 2. Meddelanden och lästa trådar följde med intresset. Kontrollen efteråt: 0 på allt, också meddelanden, notiser, länkar och mejlloggen. `public_rate_limits` inte rörd. Synliga profiler i poolen efteråt: 4, som före.

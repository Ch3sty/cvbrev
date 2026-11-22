# Konsekvensbedömning för Bli upptäckt (utkast 2026-11-22)

Utkast till konsekvensbedömning enligt artikel 35 i dataskyddsförordningen (GDPR) för funktionen Bli upptäckt i jobbcoach.ai. Skrivet för ägaren och för den jurist som granskar. Inget i utkastet är juridisk rådgivning.

**IMY:s mall gick inte att läsa.** Adressen `https://www.imy.se/globalassets/dokument/mallar/mall-for-konsekvensbedomning-enligt-dataskyddsforordningen.pdf` gav 404 den 2026-11-22. Utkastet följer därför artikel 35.7: beskrivning av behandlingen och ändamålen, nödvändighet och proportionalitet, risker för de registrerade och åtgärder. Juristen bör stämma av ordningen mot IMY:s aktuella mall.

Så läser du utkastet:
- **Belagt** betyder att vi har läst det i koden, i databasens regler eller i ett beslutsdokument. Varje avsnitt har en källrad.
- **Tolkning** betyder ägarens genomgång eller vår läsning, inte fastställd rätt.
- **ATT FYLLA I (ägaren)** och **ATT BEDÖMA (jurist)** är luckor vi inte kan fylla.

## 1. Grunduppgifter

| Uppgift | Innehåll |
|---|---|
| Personuppgiftsansvarig (bolagets namn, organisationsnummer) | ATT FYLLA I (ägaren) |
| Kontaktperson för dataskydd, dataskyddsombud | ATT FYLLA I (ägaren). Om ett dataskyddsombud krävs: ATT BEDÖMA (jurist) |
| Vem har tagit fram utkastet | Kodgenomgång 2026-11-22 på uppdrag av ägaren |
| Behandlingens status | I drift men utan riktiga rekryterare. Åtta kandidatprofiler, fyra synliga, fem visar styrkor, ett rekryterarkonto (uppgift från ägarens genomgång 2026-11-22) |
| Nästa översyn | ATT FYLLA I (ägaren), senast innan första externa rekryterare godkänns |

## 2. Behövs en konsekvensbedömning?

IMY:s sida "När ska en konsekvensbedömning genomföras?" ger enligt en maskinell sammanfattning av sidan exemplet "Rekryteringsföretag som inrättar kandidat- eller kompetensdatabaser (kriterium 1 och 4)" och huvudregeln att en konsekvensbedömning ska göras när minst två av nio kriterier i IMY:s förteckning är uppfyllda. Kriterium 1 ska enligt samma sammanfattning börja "utvärderar eller poängsätter människor". **Ordalydelsen är obekräftad**: hämtningen gav bara en sammanfattning av den delen av sidan, och förteckningen (pdf) lästes inte.

Tolkning: Bli upptäckt utvärderar kandidater (testplaceringar, styrkor ur ett personlighetstest) och samlar uppgifter av personlig karaktär (CV, personlighet, löneanspråk) i en databas som rekryterare söker i. Vi utgår från att en konsekvensbedömning krävs. Om förhandssamråd med IMY enligt artikel 36 behövs: ATT BEDÖMA (jurist).

Källa: imy.se, sidan ovan (hämtad 2026-11-22, endast sammanfattning).

## 3. Beskrivning av behandlingen

### 3.1 Ändamål

Att låta en jobbsökande som själv valt det bli hittad av verifierade rekryterare, och att låta rekryteraren visa intresse och ta kontakt först när kandidaten tackat ja.

### 3.2 De registrerade

- **Kandidater**: användare med konto som slagit på synligheten. Kan vara anställda som söker i tysthet.
- **Rekryterare**: kontaktperson hos ett företag som ansökt och godkänts.
- Indirekt: personer som nämns i en kandidats CV (till exempel arbetsgivare som är enskild firma). ATT BEDÖMA (jurist) om det behöver tas upp.

### 3.3 Uppgifterna och var de kommer ifrån

| Uppgift | Källa | Hur den tas fram |
|---|---|---|
| Yrkesroll, kompetenser, titlar, anställningar, beskrivningar, utbildning, lärosäte, språk | Kandidatens valda CV | CV:t läses in till strukturerade uppgifter med Googles Gemini (AI). Policyn uppger att namn, e-post, telefon, personnummer, födelsedatum, adress och länkar byts mot platshållare innan text skickas |
| Testmärken (familj, nivå, placering) | Våra rekryteringstester | Placering visas bara vid topp 50 % eller bättre, annars "Genomfört" |
| Styrkor (två av Strukturerad, Samarbetsvillig, Utåtriktad, Nyfiken, Stresstålig) och arbetsstil | Vårt personlighetstest (Big Five, 30 facetter) | Regelbaserad härledning, ingen AI. "Stresstålig" är låg neuroticism, inverterad |
| Pitch och kontexttaggar | Kandidaten skriver själv i Bli upptäckt | Fritext |
| Villkor: tillträde, arbetsplats, omfattning, anställningsform, region, körkort | Kandidaten väljer | Strukturerat |
| Lönespann | Kandidaten anger frivilligt | Används bara som filtervillkor i databasfrågan, lämnar aldrig servern |
| Namn och e-post | Kontot | Visas först efter kandidatens ja (namn även i Öppen profil) |
| Samtycke | Kandidaten | Tidpunkt och version (`consent_version: 'v1'`) sparas |
| Intressen, meddelanden, rekryterarens anteckningar, projekt, delningslänkar, profilvisningar | Rekryterarens och kandidatens handlingar | Sparas i egna tabeller |
| Rekryterarens företag, organisationsnummer, kontaktperson, roll, webbplats | Rekryterarens ansökan | Skrivs från webbläsaren med status "pending" |

### 3.4 Flödet

1. Kandidaten väljer ett CV och en yrkesroll. Utan CV går synligheten inte att slå på.
2. Samtyckesdialogen: ett obligatoriskt huvudsamtycke och ett frivilligt samtycke till styrkor och arbetsstil. Båda rutorna är tomma från början. Ett tredje frivilligt samtycke gäller hela arbetsstilsrapporten för den som gjort det fördjupade testet.
3. Läge: Anonym först (rekommenderas) eller Öppen profil.
4. En godkänd rekryterare söker i poolen med fritext och filter: senioritet, region, tillträde, arbetsplats, omfattning, anställningsform, placering i test, **personlighetsstyrka, arbetsstil**, utbildningsnivå, lönebudget och körkort. Sortering på relevans, senioritet, aktivitet eller testplacering. Sökningar kan sparas och ge ett bevakningsmejl.
5. Rekryteraren visar intresse (högst tio per dygn) med ett meddelande på högst 500 tecken. Kandidaten får mejl och notis.
6. Kandidaten tackar ja eller nej. Efter ja syns namn, e-post, arbetsgivare, beskrivningar, lärosäte, examensår och datum.
7. Rekryteraren kan skapa en delningslänk som öppnas utan inloggning, gäller 14 dagar och aldrig visar e-post.

### 3.5 Vad rekryteraren ser före och efter ja

All kandidatdata till rekryteraren formas av en vitlista som bygger varje svar fält för fält.

| Fält | Anonym, före ja | Efter ja | Öppen profil utan ja |
|---|---|---|---|
| Yrkesroll, titlar, längd i hela år | ja | ja, med datum | ja, med datum |
| Arbetsgivare, beskrivningar (högst 200 tecken), lärosäte, examensår | nej | ja | ja |
| Kompetenser, språk, region, villkor, pitch, taggar | ja | ja | ja |
| Testmärken | placering bara över mitten | samma | samma |
| Styrkor och arbetsstil | bara med kandidatens kryss | samma | samma |
| Namn | nej | ja | ja |
| E-post | nej | ja | nej |
| Telefon, adress, foto, referenser, CV-fil, sammanfattning ur CV:t | aldrig | aldrig | aldrig |
| Lönespann, råpoäng, Big Five-värden | aldrig | aldrig | aldrig |

### 3.6 Mottagare och leverantörer

- Godkända rekryterare och den som öppnar en delningslänk.
- Supabase (databas och fillagring, Irland), Vercel (drift, serverfunktioner i Irland), Google Gemini (CV-inläsningen), Resend (mejl till kandidat och rekryterare, bevakningsmejl), PostHog (statistik, EU).
- Biträdesavtal med respektive leverantör och om Google behandlar uppgifterna inom EU: ATT FYLLA I (ägaren). Om överföring till tredje land sker: ATT BEDÖMA (jurist).

### 3.7 Lagring och radering

- Raderas kontot försvinner kandidatprofilen, intressen, meddelanden och profilvisningar via databasens kaskadregler. Rekryterarens anteckningar, projektrader och delningslänkar om kandidaten saknar koppling till kontot och raderas uttryckligen per kontots id.
- Slår kandidaten av synligheten sätts `visibility = 'off'`. Raden, intressen, meddelanden och rekryterarens anteckningar står kvar. Poolen, detaljsidan, inkorgens kort och delningslänken visar inte längre profilen.
- Lagringstid för en avstängd profil, för rekryterarens anteckningar och för ett avslutat rekryterarkonto: finns inte i kod eller policy. ATT FYLLA I (ägaren).

Källa: `src/lib/recruiter/recruiterView.ts`, `candidateAccess.ts`, `candidateData.ts` (rad 84-87, 694-796), `poolSearch.ts`, `placering.ts`, `shareLinks.ts`, `src/lib/candidate/strengthConstants.ts`, `src/app/api/recruiter/interest/route.ts`, `src/app/rekryterare/components/FilterPanel.tsx` och `types.ts` (rad 119-125), `src/app/dashboard/bli-upptackt/components/ConsentModal.tsx`, `delas.ts`, `VisibilityModeCard.tsx`, `TermsCard.tsx`, `BliUpptacktClient.tsx` (rad 202-218), `src/app/rekryterare/registrera/page.tsx`, `src/lib/konto/raderaKonto.server.ts` (rad 134-149), `src/app/(public)/integritetspolicy/page.tsx` (avsnitt 3, 4, 7), `docs/bygg-noter-bli-upptackt-2026-11-22.md`, databasens främmande nycklar (läst 2026-11-22).

## 4. Rättslig grund, nödvändighet och proportionalitet

### 4.1 Rättslig grund

Funktionen bygger på samtycke (artikel 6.1 a), med separat samtycke för personlighetsuppgifterna. Lydelse:

> Jag samtycker till att Jobbcoach.ai visar min kandidatprofil för verifierade rekryterare. Jag kan när som helst återkalla samtycket, då raderas profilen ur poolen omedelbart.

> Visa mina främsta styrkor och min arbetsstil från personlighetstestet på profilen. Eget samtycke, valfritt. Du kan ändra dig senare utan att synligheten påverkas.

Öppna frågor:
- Samtyckesraden för styrkor säger "visa", inte att rekryterare kan **söka och filtrera** på styrkorna och arbetsstilen. Den som inte visar styrkor faller bort ur en filtrerad sökning. ATT BEDÖMA (jurist): är samtycket tillräckligt specifikt och informerat för filtrering?
- "raderas profilen ur poolen" stämmer med vad rekryteraren ser, men raden raderas inte i databasen. ATT BEDÖMA (jurist) om ordet "raderas" är vilseledande.
- Om "Stresstålig" (låg neuroticism) eller andra personlighetsuppgifter kan räknas som uppgifter om hälsa enligt artikel 9: ATT BEDÖMA (jurist). Tolkning: troligen inte, men i rekryteringssammanhang ligger det nära.

### 4.2 Information till de registrerade

Integritetspolicyn har inget avsnitt om kandidatpoolen, rekryterare som mottagare, personlighetsfilter eller delningslänkar. Sökning i policyn efter "rekryter" och "kandidat" ger noll träffar. Policyns rad om Gemini nämner inläsningen av CV:t men inte att resultatet blir en profil för rekryterare. Det enda kandidaten får veta står i samtyckesdialogen och på sidan Bli upptäckt. Rekryteraren får ingen information om behandlingen av sina egna uppgifter och godkänner inga villkor vid registreringen (inga träffar på villkor, sekretess eller personuppgifter under `src/app/rekryterare/`).

Byggnoterna anmärker att samtycket vid CV-uppladdningen sa "Vi delar det aldrig med tredje part" trots att samma CV driver profilen. Lydelsen hittades inte i `src/` vid vår sökning. ATT FYLLA I (ägaren): bekräfta nuvarande text.

### 4.3 Dataminimering och proportionalitet

- Vitlistan: inget fält når rekryteraren utan att uttryckligen skrivas in i `recruiterView.ts`. Testat i `vagar-fore-ja.test.ts` och `ingen-rapoang.test.ts`.
- Anonym först är förvalt och rekommenderat.
- Placering bara över mitten. Samma regel gäller filter, sortering och matchförklaringar.
- Känsliga facetter (depression, moral, åsikter med flera) används aldrig i härledningen. Bara positiv inramning.
- Lönespannet lämnar aldrig servern.
- Kandidaten pekas ut med ett slumpat `public_id`, inte kontots id (migreringen körd 2026-11-22 enligt filen).
- Profiler utan CV eller yrkesroll visas aldrig.

**Motsägelse i koden:** skyddsräcke 3 överst i `workStyle.ts` säger "Visning, aldrig filtrering: rekryterare kan läsa arbetsstilen men det finns medvetet inget sökfilter på den. Aldrig matchprocent, prediktion eller ranking på personlighetsdata." Filterpanelen har i dag både "Personlighetsstyrka" och "Arbetsstil", och `poolSearch.ts` filtrerar på båda. Ägaren har beslutat att filtren ska finnas kvar. Kommentaren och beslutet behöver stämmas av, och beslutet dokumenteras.

### 4.4 De registrerades rättigheter

Kandidaten kan slå av synligheten, avbocka styrkorna och radera kontot. Förhandsvisningen visar kandidatens profil som rekryteraren ser den. Rätt till tillgång och dataportabilitet för profil, intressen och visningar: hanteras via kontakt enligt policyn avsnitt 8. Om det räcker: ATT BEDÖMA (jurist).

Källa: `ConsentModal.tsx` (rad 104-116), `workStyle.ts` (rad 10-25), `FilterPanel.tsx` (rad 176-198), `poolSearch.ts` (rad 299-307), `integritetspolicy/page.tsx`, `docs/bygg-noter-bli-upptackt-2026-11-22.md` (samtyckesrad 7), `supabase/migrations/20261123100000_candidate_profiles_public_id.sql`.

## 5. Risker för kandidaterna

Bedömt ur kandidatens synvinkel. Sannolikhet och allvar i ord: låg, medel, hög.

| Nr | Risk | Sannolikhet | Allvar | Motivering | Åtgärd |
|---|---|---|---|---|---|
| R1 | Anonym kandidat känns igen av nuvarande arbetsgivare via titel eller utbildningens inriktning ("Butikschef ICA Maxi", "Civilingenjör KTH") | Medel | Hög | Titelfältet skickas som det står i CV:t och tvättas inte. En upptäckt jobbsökning kan kosta anställningen | Finns: arbetsgivare, lärosäte, beskrivningar och datum hålls inne före ja (`recruiterView.ts`). Saknas: varning till kandidaten, kontroll av titlar |
| R2 | Pitch och kontexttaggar röjer identitet eller arbetsgivare | Medel | Hög | Kandidatens egen fritext följer med i alla lägen och träffas av fritextsökningen (`poolSearch.ts` rad 115) | Finns: ingen maskinell. Saknas: varning vid inmatning |
| R3 | Kompetenser ur CV:t innehåller egennamn | Låg | Medel | Enligt byggnoterna sällsynt | Saknas |
| R4 | Kandidat som inte visar styrkor faller bort ur filtrerade sökningar utan att veta det | Hög om filtret används | Medel | Samtycket säger "visa", inte "sök". Kandidaten väljer bort synlighet utan att förstå det | Planerad: ny samtyckesrad, fråga igen till dem som kryssat i, rad i träfflistan om hur många som inte visar styrkor med möjlighet att se dem |
| R5 | Utsortering på personlighet ("Stresstålig", arbetsstil) som missgynnar till exempel personer med psykisk ohälsa eller funktionsnedsättning | Medel | Hög | Neuroticism samvarierar med psykisk ohälsa. Filtret gör en automatiskt framtagen etikett till ett urvalskriterium | Finns: känsliga facetter används aldrig, bara positiv inramning, separat samtycke. Planerad: se R4. ATT BEDÖMA (jurist): diskrimineringslagen |
| R6 | Oseriös aktör blir godkänd rekryterare och samlar profiler | Låg i dag, medel med volym | Hög | Organisationsnumret kontrolleras bara i webbläsaren, raden skrivs därifrån. Godkännandet är manuellt utan skriftliga kriterier. Rekryteraren godkänner inga villkor | Finns: status kan bara skrivas som "pending" av rekryteraren (databasregel), manuellt godkännande i adminen, tio intressen per dygn, uppgifter inlåsta före ja. Saknas: kontroll på servern, villkor för rekryterare, granskningsrutin |
| R7 | Delningslänk sprids vidare | Medel | Medel | Öppnas utan inloggning i 14 dagar. Efter ja visar den namn, arbetsgivare och beskrivningar (aldrig e-post) | Finns: länken slutar fungera om kandidaten döljer sig, kan återkallas av skaparen. Saknas: kontroll att skaparen fortfarande är godkänd (`shareLinks.ts` kontrollerar inte det) |
| R8 | Profilen står som synlig i databasen trots att villkoren inte är uppfyllda | Låg | Låg | Kandidaten skriver `candidate_profiles` direkt under radnivåsäkerhet (RLS) och kan sätta `visibility` utan CV | Finns: poolen filtrerar bort profiler utan CV och roll på servern. Saknas: databasregel |
| R9 | Kandidaten tror att profilen raderas när synligheten slås av | Hög | Låg | Raden, intressen och rekryterarens anteckningar står kvar utan angiven lagringstid | Saknas: lagringstid, rättad text |
| R10 | Felaktig profil efter AI-inläsningen (fel roll, fel kompetenser) | Medel | Medel | Gemini kan tolka fel. Rekryteraren ser resultatet som fakta | Finns: förhandsvisning för kandidaten. ATT FYLLA I (ägaren): kan kandidaten rätta rollen och kompetenserna? |
| R11 | CV-text till Google med uppgifter som inte maskas | Medel | Medel | Policyn säger själv att ort inte maskas och att ovanligt skrivna uppgifter kan följa med | Finns: maskning enligt policyn. Inte kontrollerat i koden i detta utkast |
| R12 | Rekryteraren ser kandidatens ordning i testplacering | Låg | Låg | Sorteringen ser bara placeringar över mitten | Finns: `placering.ts` |

Fynd som rör rekryterare snarare än kandidater: tabellen `candidate_profile_views` har en läsregel för kandidaten på radnivå, och rollen `authenticated` har läsrätt på kolumnen `recruiter_user_id`. Kommentaren i `profileViews.ts` säger att kandidaten aldrig ser vem som tittat, men en kandidat som frågar databasen direkt kan läsa rekryterarens konto-id (inte namnet). Bör stängas.

Källa: `docs/bygg-noter-bli-upptackt-2026-11-22.md` (kvarvarande risk), `poolSearch.ts`, `shareLinks.ts`, `src/app/api/recruiter/ansokan/route.ts`, `src/app/api/admin/recruiters/route.ts`, `src/lib/recruiter/profileViews.ts`, databasens RLS-regler och kolumnrättigheter (läst 2026-11-22), `integritetspolicy/page.tsx` avsnitt 3.

## 6. Åtgärder

### 6.1 Genomförda

| Åtgärd | Var |
|---|---|
| Vitlista för all kandidatdata till rekryterare | `src/lib/recruiter/recruiterView.ts` |
| En enda ingång för att läsa profiler, aldrig profiler utan CV och roll | `src/lib/recruiter/candidateAccess.ts` |
| Slumpat kandidat-id mot rekryteraren | `candidateAccess.ts`, migreringen `20261123100000` |
| Placering bara över mitten | `src/lib/recruiter/placering.ts` |
| Skyddsräcken för personlighetshärledningen | `src/lib/recruiter/workStyle.ts` rad 10-25 |
| Separata samtycken, tomma från början, sparade med tid och version | `ConsentModal.tsx`, `BliUpptacktClient.tsx` |
| Rekryterare måste vara godkända för varje rekryterarrutt | `src/lib/recruiter/auth.ts` |
| Rekryteraren kan bara ansöka med status "pending" | RLS-regeln "Users apply as recruiter" |
| Tak för intressen | `src/app/api/recruiter/interest/route.ts` |
| Delningslänk utan e-post, 14 dagar, återkallningsbar | `src/lib/recruiter/shareLinks.ts` |
| Radering av rekryterartabellernas rader om kandidaten | `src/lib/konto/raderaKonto.server.ts` rad 145-147 |
| Lönespannet bara som villkor i databasfrågan | `poolSearch.ts` rad 247-251 |

### 6.2 Planerade (ägarens beslut 2026-11-22, inte byggda)

- Samtyckesraden för styrkor ska säga att rekryterare kan söka på styrkorna. De som redan kryssat i får frågan igen.
- Träfflistan får en rad om hur många som inte valt att visa styrkor, med möjlighet att se dem.
- Integritetspolicyn får ett avsnitt om kandidatpoolen och rekryterare. Texten ändras bara med ägaren.

### 6.3 Föreslagna (inte beslutade)

- Organisationsnumret kontrolleras på servern, helst med en databasregel.
- Databasregel som hindrar `visibility` utan `cv_id`.
- Villkor för rekryterare (ändamålsbegränsning, ingen vidarespridning, radering) som godkänns vid registreringen, och skriftliga kriterier för godkännande.
- Delningslänken kontrollerar att skaparen fortfarande är godkänd.
- Varning vid titel, pitch och taggar om att inte skriva arbetsgivarens namn.
- Lagringstid för avstängda profiler och för rekryterarens anteckningar.
- Läsrätten på `candidate_profile_views.recruiter_user_id` stängs för kandidaten.
- Kommentaren i `workStyle.ts` och ägarens beslut om filtren stäms av.

## 7. AI-förordningen och tolkningsfrågor

**Tolkning, ur andrahandskällor, inte fastställd rätt:**
- Filtren på styrkor och arbetsstil är regelbaserade och är troligen inget AI-system i förordningens mening.
- CV-inläsningen använder AI men liknar Kommissionens exempel på undantag enligt artikel 6.3 d (förberedande uppgift).
- Gränsen går vid AI som rankar eller poängsätter kandidater. Relevanssorteringen i `poolSearch.ts` är regelbaserad (titelträff 3, kompetens 2, pitch 1).
- Högriskreglerna för rekrytering uppges vara uppskjutna till 2 december 2027.

**Tre frågor till juristen:**
1. Hur ska CV-inläsningen (AI) och personlighetsprofileringen (regelbaserad) bedömas tillsammans enligt AI-förordningen, när den AI-framtagna rollen och de regelbaserade styrkorna hamnar i samma sökbara profil?
2. Artikel 22 efter EU-domstolens dom C-634/21 (SCHUFA): kan en rekryterares filtrering på ett automatiskt framtaget underlag (styrkor, testplacering) göra vår härledning till ett automatiserat beslut, när underlaget i praktiken avgör vem som syns?
3. Diskrimineringslagen: gäller förbuden en privat förmedlingstjänst som vår, och kan filter som "Stresstålig" ge indirekt diskriminering på grund av funktionsnedsättning?

Källa: `poolSearch.ts` rad 6-12, `workStyle.ts`, ägarens genomgång 2026-11-22.

## 8. Öppet före riktiga rekryterare

I prioritetsordning:

1. **Integritetspolicyn får ett avsnitt om kandidatpoolen och rekryterare** (planerad). I dag saknas all information om mottagarna.
2. **Samtycket för styrkor täcker sökning och filtrering**, med ny fråga till dem som redan kryssat i, och raden i träfflistan (planerad).
3. **Juristens svar på de tre frågorna** i avsnitt 7, och bedömningen av artikel 9 för "Stresstålig".
4. **Villkor och verifiering för rekryterare**: kontroll av organisationsnummer på servern, skriftliga kriterier för godkännande, villkor som rekryteraren godkänner.
5. **Grunduppgifterna**: personuppgiftsansvarig, organisationsnummer, kontaktperson, biträdesavtal med Supabase, Vercel, Google, Resend och PostHog, och var Google behandlar CV-texten (ATT FYLLA I, ägaren).
6. **Lagringstider** för avstängda profiler, intressen, meddelanden och rekryterarens anteckningar, och ordet "raderas" i huvudsamtycket.
7. **Identifieringsrisken via titel, pitch och taggar**: varning till kandidaten.
8. **Kommentaren i `workStyle.ts` mot beslutet om filtren** stäms av och beslutet dokumenteras.
9. **Databasregler**: `visibility` kräver CV, läsrätten på `recruiter_user_id` i profilvisningarna stängs, delningslänken kontrollerar skaparens status.
10. **Förhandssamråd med IMY enligt artikel 36**: ATT BEDÖMA (jurist) när riskerna ovan är hanterade.

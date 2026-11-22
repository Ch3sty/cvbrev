# Konsekvensbedömning för Bli upptäckt (utkast 2026-11-22)

Utkast till konsekvensbedömning enligt artikel 35 i dataskyddsförordningen (GDPR) för funktionen Bli upptäckt i jobbcoach.ai. Skrivet för ägaren.

**Ingen jurist är anlitad.** Ägarens besked 2026-11-22: "Vi har ingen jurist, läs på och följ det du tolkar." De rättsliga bedömningarna nedan är våra egna, gjorda 2026-11-22 ur de källor som anges, och märkta **VÅR TOLKNING**. De bör prövas av en jurist om verksamheten växer eller om IMY frågar.

**IMY:s mall gick inte att läsa.** Adressen `https://www.imy.se/globalassets/dokument/mallar/mall-for-konsekvensbedomning-enligt-dataskyddsforordningen.pdf` gav 404 den 2026-11-22. Utkastet följer därför artikel 35.7: beskrivning av behandlingen och ändamålen, nödvändighet och proportionalitet, risker för de registrerade och åtgärder.

Märkning:
- **Belagt** betyder läst i koden, i databasens regler eller i ett beslutsdokument. Varje avsnitt har en källrad.
- **VÅR TOLKNING** betyder vår läsning av rättsläget, med det vi gör till följd av den.
- **ATT FYLLA I (ägaren)** är uppgifter bara ägaren har.

## 1. Grunduppgifter

| Uppgift | Innehåll |
|---|---|
| Personuppgiftsansvarig (bolagets namn, organisationsnummer) | ATT FYLLA I (ägaren) |
| Kontaktperson för dataskydd | ATT FYLLA I (ägaren) |
| Vem har tagit fram utkastet | Kodgenomgång 2026-11-22 på uppdrag av ägaren |
| Behandlingens status | I drift men utan riktiga rekryterare. Åtta kandidatprofiler, fyra synliga, fem visar styrkor, ett rekryterarkonto (ägarens genomgång 2026-11-22) |
| Nästa översyn | ATT FYLLA I (ägaren), senast innan första externa rekryterare godkänns |

## 2. Behövs en konsekvensbedömning?

IMY:s sida "När ska en konsekvensbedömning genomföras?" ger enligt en maskinell sammanfattning exemplet "Rekryteringsföretag som inrättar kandidat- eller kompetensdatabaser (kriterium 1 och 4)" och huvudregeln att en bedömning ska göras när minst två av nio kriterier är uppfyllda. **Ordalydelsen är obekräftad**: hämtningen gav bara en sammanfattning, och förteckningen (pdf) lästes inte.

VÅR TOLKNING: Bli upptäckt utvärderar kandidater (testplaceringar, styrkor ur ett personlighetstest) och samlar uppgifter av personlig karaktär i en databas som rekryterare söker i. En konsekvensbedömning krävs.

Källa: imy.se, sidan ovan (hämtad 2026-11-22, endast sammanfattning).

## 3. Beskrivning av behandlingen

### 3.1 Ändamål

Att låta en jobbsökande som själv valt det bli hittad av verifierade rekryterare, och att låta rekryteraren visa intresse och ta kontakt först när kandidaten tackat ja.

### 3.2 De registrerade

- **Kandidater**: användare med konto som slagit på synligheten. Kan vara anställda som söker i tysthet.
- **Rekryterare**: kontaktperson hos ett företag som ansökt och godkänts.
- Indirekt: personer som nämns i en kandidats CV. VÅR TOLKNING: ingen egen behandling av dem, de skyddas av att arbetsgivare och beskrivningar hålls inne före ja.

### 3.3 Uppgifterna och var de kommer ifrån

| Uppgift | Källa | Hur den tas fram |
|---|---|---|
| Yrkesroll, kompetenser, titlar, anställningar, beskrivningar, utbildning, lärosäte, språk | Kandidatens valda CV | Läses in till strukturerade uppgifter med Googles Gemini (AI). Policyn uppger att namn, e-post, telefon, personnummer, födelsedatum, adress och länkar byts mot platshållare innan text skickas |
| Testmärken (familj, nivå, placering) | Våra rekryteringstester | Placering visas bara vid topp 50 % eller bättre, annars "Genomfört" |
| Styrkor (två av Strukturerad, Samarbetsvillig, Utåtriktad, Nyfiken, Stresstålig) och arbetsstil | Vårt personlighetstest (Big Five, 30 facetter) | Regelbaserad härledning, ingen AI. "Stresstålig" är låg neuroticism, inverterad |
| Pitch och kontexttaggar | Kandidaten skriver själv | Fritext |
| Villkor: tillträde, arbetsplats, omfattning, anställningsform, region, körkort | Kandidaten väljer | Strukturerat |
| Lönespann | Kandidaten anger frivilligt | Bara filtervillkor i databasfrågan, lämnar aldrig servern |
| Namn och e-post | Kontot | Efter kandidatens ja (namn även i Öppen profil) |
| Samtycke | Kandidaten | Tidpunkt och version (`consent_version: 'v1'`) |
| Intressen, meddelanden, anteckningar, projekt, delningslänkar, profilvisningar | Rekryterarens och kandidatens handlingar | Egna tabeller |
| Rekryterarens företag, organisationsnummer, kontaktperson, roll, webbplats | Rekryterarens ansökan | Skrivs från webbläsaren med status "pending" |

### 3.4 Flödet

1. Kandidaten väljer CV och yrkesroll. Utan CV går synligheten inte att slå på.
2. Samtyckesdialogen: obligatoriskt huvudsamtycke, frivilligt samtycke till styrkor och arbetsstil, och för den som gjort det fördjupade testet ett frivilligt samtycke till hela arbetsstilsrapporten. Alla rutor är tomma från början.
3. Läge: Anonym först (rekommenderas) eller Öppen profil.
4. En godkänd rekryterare söker med fritext och filter: senioritet, region, tillträde, arbetsplats, omfattning, anställningsform, testplacering, **personlighetsstyrka, arbetsstil**, utbildningsnivå, lönebudget, körkort. Sortering på relevans, senioritet, aktivitet eller testplacering. Sökningar kan sparas och ge bevakningsmejl.
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
- Supabase (databas och fillagring, Irland), Vercel (drift, serverfunktioner i Irland), Google Gemini (CV-inläsningen), Resend (mejl), PostHog (statistik, EU).
- Biträdesavtal med respektive leverantör och var Google behandlar CV-texten: ATT FYLLA I (ägaren).

### 3.7 Lagring och radering

- Raderas kontot försvinner kandidatprofilen, intressen, meddelanden och profilvisningar via databasens kaskadregler. Rekryterarens anteckningar, projektrader och delningslänkar om kandidaten raderas uttryckligen per kontots id.
- Slår kandidaten av synligheten sätts `visibility = 'off'`. Raden, intressen, meddelanden och anteckningar står kvar, men poolen, detaljsidan, inkorgens kort och delningslänken visar inte längre profilen.
- Lagringstid för en avstängd profil, för rekryterarens anteckningar och för ett avslutat rekryterarkonto: ATT FYLLA I (ägaren).

Källa: `src/lib/recruiter/recruiterView.ts`, `candidateAccess.ts`, `candidateData.ts` (rad 84-87, 694-796), `poolSearch.ts`, `placering.ts`, `shareLinks.ts`, `src/lib/candidate/strengthConstants.ts`, `src/app/api/recruiter/interest/route.ts`, `src/app/rekryterare/components/FilterPanel.tsx`, `src/app/dashboard/bli-upptackt/components/ConsentModal.tsx`, `delas.ts`, `VisibilityModeCard.tsx`, `BliUpptacktClient.tsx` (rad 202-218), `src/app/rekryterare/registrera/page.tsx`, `src/lib/konto/raderaKonto.server.ts` (rad 134-149), `src/app/(public)/integritetspolicy/page.tsx`, `docs/bygg-noter-bli-upptackt-2026-11-22.md`, databasens främmande nycklar (läst 2026-11-22).

## 4. Rättslig grund, nödvändighet och proportionalitet

### 4.1 Rättslig grund och samtycke

Funktionen bygger på samtycke (artikel 6.1 a), med separat samtycke för personlighetsuppgifterna. Lydelse i dag:

> Jag samtycker till att Jobbcoach.ai visar min kandidatprofil för verifierade rekryterare. Jag kan när som helst återkalla samtycket, då raderas profilen ur poolen omedelbart.

> Visa mina främsta styrkor och min arbetsstil från personlighetstestet på profilen. Eget samtycke, valfritt. Du kan ändra dig senare utan att synligheten påverkas.

- **Sökbarheten.** Raden för styrkor säger "visa", inte att rekryterare kan söka och filtrera på dem. VÅR TOLKNING: samtycket är inte tillräckligt specifikt för filtrering. Planerad åtgärd: raden säger att styrkorna är sökbara, och de som redan kryssat i får frågan igen.
- **"raderas".** Profilen tas ur poolen direkt, men raden finns kvar tills kontot raderas. Förslag: "då försvinner profilen ur poolen omedelbart". Lydelse som ägaren ska godkänna.

### 4.2 Artikel 9 och "Stresstålig"

VÅR TOLKNING: styrkorna är etiketter för personlighetsdrag, inte uppgifter om hälsa. Vi härleder inga diagnoser, de känsliga facetterna (bland annat depression) är spärrade i `workStyle.ts`, bara närvaron av en styrka visas (aldrig frånvaron eller ett värde), och bara med kandidatens eget kryss. Artikel 9 är därför inte tillämplig. Stresstålig är den etikett som ligger närmast och ska omprövas om härledningen ändras.

### 4.3 Information till de registrerade

Integritetspolicyn har inget avsnitt om kandidatpoolen, rekryterare som mottagare, personlighetsfilter eller delningslänkar (sökning efter "rekryter" och "kandidat" ger noll träffar). Planerad åtgärd: ett sådant avsnitt, med ägarens godkännande. Rekryteraren godkänner i dag inga villkor. Planerad åtgärd: rekryterarvillkor tas fram i kväll för ägarens godkännande, och registreringen får en kryssruta.

Byggnoterna anmärker att samtycket vid CV-uppladdningen sa "Vi delar det aldrig med tredje part". Lydelsen hittades inte i `src/` vid vår sökning. ATT FYLLA I (ägaren): bekräfta nuvarande text.

### 4.4 Dataminimering och proportionalitet

- Vitlistan: inget fält når rekryteraren utan att skrivas in i `recruiterView.ts`. Testat i `vagar-fore-ja.test.ts` och `ingen-rapoang.test.ts`.
- Anonym först är förvalt. Placering bara över mitten, också i filter, sortering och matchförklaringar.
- Personlighetshärledningen: känsliga facetter används aldrig, bara positiv inramning. Skyddsräcke 3 i `workStyle.ts` lyder sedan 2026-11-22 (commit 413973ae): "Sökbart bara på det kandidaten valt att visa ... Aldrig matchprocent, prediktion eller ranking på personlighetsdata, och testets värden går varken att se eller söka på." Sidan För rekryterare säger detsamma.
- Lönespannet lämnar aldrig servern. Kandidaten pekas ut med ett slumpat `public_id`. Profiler utan CV eller yrkesroll visas aldrig.
- Kvar att rätta: träffordningens kompletthetspoäng ger en poäng för visade styrkor (`poolSearch.ts` rad 138-145). Det är ranking på personlighetsdata i liten skala och strider mot skyddsräcke 3. Planerad: poängen tas bort.

### 4.5 De registrerades rättigheter

Kandidaten kan slå av synligheten, avbocka styrkorna, radera kontot och se profilen som rekryteraren ser den. Begäran om tillgång och dataportabilitet hanteras via kontakt enligt policyn avsnitt 8. VÅR TOLKNING: det räcker i nuvarande skala.

Källa: `ConsentModal.tsx` (rad 104-116), `workStyle.ts` (rad 10-27), `poolSearch.ts`, `src/app/(public)/for-rekryterare/page.tsx` (rad 130-131), `integritetspolicy/page.tsx`, `docs/bygg-noter-bli-upptackt-2026-11-22.md`.

## 5. Risker för kandidaterna

Sannolikhet och allvar i ord: låg, medel, hög.

| Nr | Risk | Sannolikhet | Allvar | Motivering | Åtgärd |
|---|---|---|---|---|---|
| R1 | Anonym kandidat känns igen av nuvarande arbetsgivare via titel eller utbildningens inriktning ("Butikschef ICA Maxi", "Civilingenjör KTH") | Medel | Hög | Titelfältet tvättas inte. En upptäckt jobbsökning kan kosta anställningen | Finns: arbetsgivare, lärosäte, beskrivningar och datum hålls inne före ja. Föreslagen: varning till kandidaten |
| R2 | Pitch och kontexttaggar röjer identitet eller arbetsgivare | Medel | Hög | Egen fritext följer med i alla lägen och träffas av fritextsökningen | Föreslagen: varning vid inmatning |
| R3 | Kompetenser ur CV:t innehåller egennamn | Låg | Medel | Sällsynt enligt byggnoterna | Ingen |
| R4 | Kandidat som inte visar styrkor faller bort ur filtrerade sökningar utan att veta det | Hög om filtret används | Medel | Samtycket säger "visa", inte "sök" | Planerad: ny samtyckesrad, ny fråga, rad i träfflistan med antalet som inte visar styrkor och möjlighet att se dem |
| R5 | Indirekt missgynnande via styrkefilter, till exempel av personer med funktionsnedsättning | Medel | Hög | Ett automatiskt framtaget underlag blir urvalskriterium | Finns: spärrade facetter, positiv inramning, separat samtycke. Planerad: se R4, rekryterarvillkor, hjälprad i filterpanelen (avsnitt 7) |
| R6 | Oseriös aktör blir godkänd rekryterare | Låg i dag, medel med volym | Hög | Organisationsnumret kontrolleras bara i webbläsaren. Godkännandet är manuellt utan skriftliga kriterier | Finns: rekryteraren kan bara skriva status "pending", manuellt godkännande, tio intressen per dygn. Planerad: villkor med kryssruta. Föreslagen: kontroll på servern, kriterier |
| R7 | Delningslänk sprids vidare | Medel | Medel | Öppnas utan inloggning i 14 dagar, visar efter ja namn och arbetsgivare | Finns: slutar fungera om kandidaten döljer sig, återkallningsbar. Föreslagen: kontroll att skaparen fortfarande är godkänd |
| R8 | Profilen står som synlig i databasen utan CV | Låg | Låg | Kandidaten skriver `candidate_profiles` direkt under radnivåsäkerhet (RLS) | Finns: servern filtrerar bort sådana. Föreslagen: databasregel |
| R9 | Kandidaten tror att profilen raderas när synligheten slås av | Hög | Låg | Raden står kvar utan angiven lagringstid | Planerad: ny lydelse (4.1). ATT FYLLA I (ägaren): lagringstid |
| R10 | Felaktig profil efter AI-inläsningen | Medel | Medel | Rekryteraren ser resultatet som fakta | Finns: förhandsvisning. ATT FYLLA I (ägaren): kan kandidaten rätta roll och kompetenser? |
| R11 | CV-text till Google med uppgifter som inte maskas | Medel | Medel | Policyn säger att ort inte maskas och att ovanligt skrivna uppgifter kan följa med | Finns: maskning enligt policyn, inte kontrollerad i koden här |

Fynd som rör rekryterare: rollerna `authenticated` och `anon` har läsrätt på hela tabellen `candidate_profile_views`, och RLS-regeln släpper igenom kandidatens egna rader. En kandidat som frågar databasen direkt kan alltså läsa `recruiter_user_id` för den som tittat, i strid med kommentaren i `profileViews.ts`. Bekräftat mot databasen 2026-11-22. Tabellen har noll rader. En migrering som tar bort läsrätten och ger kolumnvis läsrätt på övriga kolumner är skriven och väntar på ägarens ja.

Källa: `docs/bygg-noter-bli-upptackt-2026-11-22.md`, `poolSearch.ts`, `shareLinks.ts`, `src/app/api/recruiter/ansokan/route.ts`, `src/app/api/admin/recruiters/route.ts`, `src/lib/recruiter/profileViews.ts`, databasens RLS-regler och kolumnrättigheter (läst 2026-11-22).

## 6. Åtgärder

### 6.1 Genomförda

| Åtgärd | Var |
|---|---|
| Vitlista för all kandidatdata till rekryterare | `src/lib/recruiter/recruiterView.ts` |
| En ingång för profiler, aldrig profiler utan CV och roll | `src/lib/recruiter/candidateAccess.ts` |
| Slumpat kandidat-id mot rekryteraren | `candidateAccess.ts`, migreringen `20261123100000` |
| Placering bara över mitten | `src/lib/recruiter/placering.ts` |
| Skyddsräcken för personlighetshärledningen, omskrivna efter ägarbeslutet | `src/lib/recruiter/workStyle.ts` rad 10-27 |
| Separata samtycken, tomma från början, med tid och version | `ConsentModal.tsx`, `BliUpptacktClient.tsx` |
| Bara godkända rekryterare når rekryterarrutterna | `src/lib/recruiter/auth.ts` |
| Rekryteraren kan bara ansöka med status "pending" | RLS-regeln "Users apply as recruiter" |
| Tak för intressen | `src/app/api/recruiter/interest/route.ts` |
| Delningslänk utan e-post, 14 dagar, återkallningsbar | `src/lib/recruiter/shareLinks.ts` |
| Radering av rekryterartabellernas rader om kandidaten | `src/lib/konto/raderaKonto.server.ts` rad 145-147 |

### 6.2 Planerade

- Samtyckesraden för styrkor säger att styrkorna är sökbara. De som redan kryssat i får frågan igen.
- Träfflistan visar hur många som inte valt att visa styrkor och låter rekryteraren se dem.
- Kompletthetspoängen för visade styrkor tas bort ur träffordningen.
- Rekryterarvillkor (utkast i kväll, ägaren godkänner) med kryssruta vid registreringen. Villkoren förbjuder att ett filter eller testresultat ensamt avgör, och kräver att styrkor bara används när de hör till tjänstens krav.
- Diskret hjälprad i filterpanelen om samma sak.
- Integritetspolicyn får ett avsnitt om kandidatpoolen och rekryterare, med ägarens godkännande.
- Ny lydelse "försvinner profilen ur poolen", med ägarens godkännande.
- Migreringen för `candidate_profile_views`, med ägarens ja.

### 6.3 Föreslagna (inte beslutade)

- Organisationsnumret kontrolleras på servern och skriftliga kriterier för godkännande.
- Databasregel som hindrar `visibility` utan `cv_id`.
- Delningslänken kontrollerar att skaparen fortfarande är godkänd.
- Varning vid titel, pitch och taggar om att inte skriva arbetsgivarens namn.

## 7. Våra tolkningar av AI-förordningen, artikel 22 och diskrimineringslagen

**AI-förordningen. VÅR TOLKNING:** filtren och rankningen i `poolSearch.ts` är regelbaserade (titelträff 3, kompetens 2, pitch 1) och räknas enligt Kommissionens riktlinjer om definitionen av AI-system inte som AI-system. CV-inläsningen är ett AI-system men motsvarar Kommissionens exempel på undantag enligt artikel 6.3 d: att ordna CV-uppgifter i en databas som rekryterare söker i. Personlighetsprofileringen görs utan AI. Högriskreglerna för rekrytering uppges gälla från 2 december 2027. **Beslut:** ingen AI får ranka, poängsätta eller välja bland kandidater utan att detta dokument görs om och systemet behandlas som högrisk.

**Artikel 22 (automatiserade beslut), med hänsyn till EU-domstolens dom C-634/21 (SCHUFA). VÅR TOLKNING:** rekryteraren väljer själv filter och fattar själv beslutet, och kandidaten ligger kvar i poolen. Inget beslut fattas enbart automatiskt. **Åtgärder som stöder det:** samtycket säger att styrkorna är sökbara, träfflistan visar och öppnar dem som inte visar styrkor, kompletthetspoängen för styrkor tas bort, och rekryterarvillkoren förbjuder att ett filter eller testresultat ensamt avgör.

**Diskrimineringslagen. VÅR TOLKNING:** 2 kap. 9 § (arbetsförmedling utan offentligt uppdrag) kan gälla oss. Personlighet är ingen diskrimineringsgrund, men ett filter kan missgynna indirekt, till exempel personer med funktionsnedsättning. **Beslut:** alla fem styrkor står kvar som filter (ägarens beslut), rekryterarvillkoren kräver att styrkor bara används när de hör till tjänstens krav, och filterpanelen får en diskret hjälprad om det.

**Förhandssamråd med IMY (artikel 36). VÅR TOLKNING:** behövs bara om hög risk kvarstår efter åtgärderna. Vi bedömer att den inte gör det när de planerade åtgärderna i 6.2 är byggda. Omprövas om riktiga rekryterare tillkommer i större antal.

Källa: `poolSearch.ts` rad 6-12 och 138-145, `workStyle.ts`, ägarens genomgång och besked 2026-11-22. Kommissionens riktlinjer och domen är inte lästa i original i detta utkast.

## 8. Öppet före riktiga rekryterare

I prioritetsordning:

1. **Integritetspolicyn** får avsnittet om kandidatpoolen och rekryterare (planerad, ägaren godkänner).
2. **Samtycket för styrkor** säger att de är sökbara, med ny fråga till dem som kryssat i, och lydelsen "försvinner profilen ur poolen" (planerad, ägaren godkänner).
3. **Rekryterarvillkoren** med kryssruta, regeln om filter och testresultat, och hjälpraden i filterpanelen (planerad, ägaren godkänner villkoren).
4. **Träfflistan** visar dem som inte visar styrkor, och kompletthetspoängen för styrkor tas bort (planerad).
5. **Migreringen för `candidate_profile_views`** körs (väntar på ägarens ja).
6. **Grunduppgifterna**: personuppgiftsansvarig, organisationsnummer, kontaktperson, biträdesavtal med Supabase, Vercel, Google, Resend och PostHog, och var Google behandlar CV-texten (ATT FYLLA I, ägaren).
7. **Lagringstider** för avstängda profiler, intressen, meddelanden och anteckningar (ATT FYLLA I, ägaren).
8. **Verifieringen av rekryterare**: organisationsnumret på servern och skriftliga kriterier (föreslagen).
9. **Identifieringsrisken** via titel, pitch och taggar: varning till kandidaten (föreslagen).
10. **Databasregler och delningslänken**: `visibility` kräver CV, länken kontrollerar skaparens status (föreslagen).
11. **Prövning av en jurist** av tolkningarna i avsnitt 4 och 7 om verksamheten växer eller IMY frågar.

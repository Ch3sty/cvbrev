# Överlämning: Jobbsöket omgång 1, det som återstår

Skriven 2026-11-21 till den agent som tar över. Läs hela filen innan du gör något.

## Ditt uppdrag

Jobbsöket (det inloggade rummet under `/dashboard`) byggdes om 2026-11-21 och ligger live på main, commit `280ec592`. Bygget är färdigt, men kontrollen avbröts innan den var klar. Du ska:

1. Testa det som inte är testat (avsnitt 3).
2. Rätta det som är känt fel och det du hittar (avsnitt 4).
3. Lägga fram besluten som är ägarens, utan att fatta dem själv (avsnitt 5).
4. Uppdatera de publika sidorna som beskriver funktionerna (avsnitt 6), efter ägarens besked där det krävs.

Rapportera rakt: vad som fungerar, vad som inte gör det, vad du inte har prövat.

## 1. Läget

**Live i produktion:** hela ombyggnaden enligt skissen "Jobbsöket, omgång 1: nya sidor" (https://claude.ai/artifact/481CXkvutonTNGEVgLWAPM, 23 skärmar, godkänd av ägaren).

**Det nya i flödet (F1 till F9):**
- F1. Fyra flikar i väggen: Översikt, Matchade jobb, Sökta tjänster, Inför intervjun. Jobbcoachen, Bli upptäckt, Meddelanden och Arbetsstil har tillbakalänk i stället för flik.
- F2. "Att göra nu" på Översikt: högst tre handlingar. Ordning: Hur gick intervjun, kommande intervju inom 14 dagar, övrigt efter datum, "Sök en tjänst till" sist.
- F3. "Ska sökas": sparad annons med sista ansökningsdag. Gratis. Räknas aldrig i statistik eller rapport.
- F4. Veckans mål: förval 3, går att ändra 1 till 10. Gratis. Ingen svit.
- F5. Uppföljningsmejl för en sökt tjänst som varit tyst i tolv dagar. Utkastet skrivs av AI utan personuppgifter, med en mall som reserv. Öppnas i användarens egen e-post (`mailto`), vi skickar aldrig själva. Första utkastet per konto är gratis, sedan Premium (402 från servern, betalväggsvarianten `uppfoljning`). "Jag har redan skickat det" är gratis för alla.
- F6. Intervjun hör till den sökta tjänsten: dag, tid och plats när kallelsen loggas, "Förbered intervjun" på tjänstens sida, "Intervjuer på gång" under Inför intervjun, "Hur gick intervjun?" dagen efter.
- F7. Matchade jobb: annonsen bredvid listan från 1280 px, sista ansökningsdag, kompetenser en och en, handlingarna Skriv brev, Spara till Ska sökas, Markera som sökt.
- F8. Sökta tjänster läser `?vy=statistik|rapport`, `?filter=`, `?logga=1` (med förifyllda fält) och de gamla parametrarna.
- F9. Jobbcoachen föreslår frågor utifrån läget i de sökta tjänsterna.
- `/dashboard/introduktion` omdirigerar permanent till `/dashboard`.

**Databasen (körda i produktion 2026-11-21 med ägarens ja, bara tillägg):**
- `20261121180000_jobbsoket_omgang1`: tabellerna `job_saved_ads` och `job_application_followups`, kolumnerna `interview_at` och `interview_place` på `job_application_events`, `profiles.weekly_application_goal`.
- `20261121200000_jobbmatchning_sammanfattning`: tabellen `job_matching_summaries` (de 25 bästa träffarna per konto, så att sidorna slipper läsa hela körningen på 3,3 MB).

**Var koden ligger:**
- CSS: `src/app/jobb3.css`, `jobb3-b.css`, `jobb3-c.css` (prefix `j3-`)
- Kit och vyer: `src/components/jobb3/` (kitsida på `/jobb3-kit`, 404 i produktion)
- Regler och laddare: `src/lib/jobbsok/`, `src/lib/jobmatching/`
- Rutter: `/api/jobbsok/*`, `/api/jobbmatchning/*`
- Kontrakt, egna beslut och hur man backar: `docs/bygg-noter-jobbsoket.md` plus delfilerna `-kit`, `-a`, `-b`, `-c`. **Läs avsnitten "Kvar att kontrollera" och "Backa" där.**

**Fel som fanns före bygget och rättades på vägen:**
- Avståndsfiltret i matchningen släppte igenom annonser som nämnde distans (Stockholm överst för ett CV i Umeå), och annonsens ort stod som skäl oavsett var användaren bor.
- Sidorna läste hela matchningskörningen vid varje laddning (1,5 till 6,6 sekunder, ibland timeout).
- En sökt tjänst som loggades strax efter midnatt fick gårdagens datum (UTC).

## 2. Det som är prövat

- `npx tsc --noEmit`, hela vitest (4 171 gröna), `npm run build`.
- Motorns alla rutter och laddare mot databasen, en gång, inklusive ett riktigt AI-utkast och gratisspärren (första utkastet går, nästa tjänst ger 402).
- Varje vy granskad som bild mot skissen i 1440 och 412, mot en dev-server.
- Klicktest som Premium, mot dev-server: Översikt (primärknappen, Att göra nu, Ändra veckans mål, Logga sökt tjänst, telefonens fyra flikar) och Matchade jobb (välj annons, bakåt, Spara till Ska sökas, Markera som sökt, Skriv brev).
- I produktion efter push: nya rutter svarar, startsidan och `/verktyg/jobbmatchning` ger 200, inloggade sidor skickar utloggade till inloggningen.

**Ingen har loggat in och klickat i produktion.** Allt nedan är oprövat i webbläsare och ligger live.

## 3. Att testa, i prioritetsordning

Testa mot produktion (`https://www.jobbcoach.ai`) i en riktig webbläsare, 1440×900 och Pixel 7 (412), med ett gratiskonto och ett Premiumkonto. Ta en skärmbild per steg.

1. **Gratisnivån i Matchade jobb.** Sidan ska bara skicka de tre öppna annonserna i HTML:en. Fem dolda rader ska bara visa matchgraden. En ny sökning eller ändrad sökprofil ska ge en ny sammanfattning och aldrig visa den gamla. Betalväggen ska visas med dagens pris (och Black Week-priset 23 till 29 november, se avsnitt 5).
2. **Sökta tjänster, listan.** Logga via arket (både "Jag har sökt" och "Jag ska söka"), öppna arket förifyllt via `?logga=1&tjanst=…&arbetsgivare=…&ort=…&lank=…`, "Markera som sökt" på en Ska sökas-rad, "Sökt ändå" och "Ta bort" på en rad med passerad sista dag, växeln Lista, Statistik, Rapport, ett filter (adressen ska följa med och bakåtknappen fungera), sök i listan.
3. **En sökt tjänst.** Lägg till "Kallad till intervju" med dag, tid och plats. Kallelseraden ska visa dagen kallelsen kom och raden "Intervju" intervjutiden. Ändra tid, Rätta en händelse, Redigera, Ta bort tjänsten (bara en du själv skapat).
4. **Hur gick intervjun?** Skapa en tjänst med intervjutid i går. Frågan ska stå först i Att göra nu, i listan och på tjänstens sida. Svara "Den är genomförd" och kontrollera att den loggas på intervjudagen. Pröva också "Den blev flyttad" och "Den blev inställd".
5. **Uppföljningsmejlet, Premium.** Öppna utkastet på en tyst tjänst, ändra texten och se att den sparas, "Skriv om kortare" en gång, "Kopiera mejlet", svara ja på "Skickade du mejlet?", se "Följde upp" bland händelserna och att tjänsten lämnar Följ upp, Ångra. Läs `mailto`-länkens ämne och text.
6. **Uppföljningsmejlet, gratis.** Första utkastet ska gå. På nästa tjänst ska betalväggen visas med "Jag har redan skickat det" bredvid. Köpknappen ska leda till köpsteget med `plats=uppfoljning`. Genomför inget köp.
7. **Rapporten.** Byt månad, Kopiera som text, skapa och återkalla en delningslänk, öppna den publika delningssidan (se också avsnitt 4, punkt 1), gratisnivåns lås på radlistorna.
8. **Inför intervjun.** "Nästa fråga" till svaret, skriv ett kort svar, "Bedöm mitt svar" på en fråga som redan har ett prov ("upp från" ska synas), tillbaka till hubben, "Uppdatera" på en tjänst som väntar besked, gratisgränsen ett prov per dygn.
9. **Jobbcoachen.** Ett förslag ska hamna i fältet utan att skickas. Skicka en fråga, kontrollera källraden, "Nytt samtal". Gratis: kvotprickarna och spärren efter tio meddelanden.
10. **Bli upptäckt, Meddelanden, Arbetsstil.** Bli upptäckt före och efter samtycke. Meddelanden är aldrig sedd med en riktig förfrågan: det kräver ett rekryterarkonto som skickar en. Omdirigeringen från `/dashboard/introduktion`.
11. **Dina brev.** Listan "Börja med ett jobb som passar ditt CV" byttes till samma källa som Översikt (rätt ort, liten läsning). Sidan är inte öppnad efter ändringen.
12. **Översikt utan CV** och **Översikt med CV men utan sökta tjänster.** Bara sedda med en tillfällig lokal växel, aldrig med ett riktigt konto.
13. **Tomma lägen** (Sökta tjänster utan rader, statistik utan data, rapport utan månad) och **mörkt läge** på alla sidor.
14. **Prestanda.** Aldrig mätt på det nya. Kör `scripts/perf-inloggat.ts` på `/dashboard`, `/dashboard/sokta-tjanster`, en tjänst, `/dashboard/intervju`, `/dashboard/jobbcoachen`, `/dashboard/bli-upptackt`, `/dashboard/jobbmatchning`. Budget: LCP under 1,5 s för översikter och 2,0 s för tunga vyer, CLS 0. Få körningar.
15. **Mätningen.** De nya händelserna (sparad till Ska sökas, utkast öppnat, uppföljning loggad, intervjutid satt, veckans mål ändrat, betalväggen `uppfoljning`) är skickade men aldrig kontrollerade i PostHog.

## 4. Att rätta

**Känt fel**
1. **Den publika delningssidan visar det gamla.** `src/app/dela/sokta-tjanster/[token]/page.tsx` ritar fortfarande `SankeyChart` (rubriken "Flödesdiagram") och gamla `FunnelBars` i den gamla orange stilen. I rummet är Sankey ersatt av tratten. Sidan ska få samma tratt och form som Statistik.
2. **Renderingsvarning** i webbläsaren: "A tree hydrated but some attributes didn't match". Syns sporadiskt på Jobbsökets sidor och på Skriv brev. Orsaken är okänd. En liknande på Bli upptäckt är rättad.
3. **En tunn linje** nertill i det mörka frågekortet på en sökt tjänst och i STAR-brickan T på det bedömda svaret. Syns i helsidesbilder i 1440. Troligen ett fel i bildtagningen: avgör med deviceScaleFactor 1 och 2.
4. **"Skriv om kortare" ger fel om användaren skrivit in sitt telefonnummer i texten** (maskningen fäller anropet). Texten är orörd och meddelandet "Det gick inte att skriva om just nu. Din text är kvar." visas, men funktionen borde klara det.
5. **Edge-funktionen `match-jobs`** får ibland statement timeout när den sparar körningen (3,3 MB jsonb) men loggar "Cached". Sidorna klarar det nu via sammanfattningen, men felet finns kvar. Äldre än bygget, inte rört.
6. **Triggern på händelserna** sätter `status_updated_at` även när bara intervjutiden ändras. Kontrollera om någon summering fortfarande räknar tystnad på det fältet.

**Avvikelser från skissen som går att bygga**
7. Raden Bli upptäckt på Översikt visar inte "12 rekryterare har sett din profil" och "1 väntar": talen finns inte i summeringen.
8. "Sedan du tittade i tisdags" visas inte över de nya träffarna.
9. Veckobrevets uppföljningsruta (`src/lib/email/lifecycle/templates/weekly-digest.ts:188–207`) och notisen i appen (`src/lib/notifications/followUp.ts:142–144`) länkar till listan, inte till utkastet. Länka till tjänstens uppföljning (`tjanstHref(id, 'folj-upp')`).
10. Rutnätet med avatarer i Bli upptäckt och "Det här har rekryteraren sett av dig" i Meddelanden är inte byggda: datan finns inte lagrad.

**Städning**
11. De inslagna lokala grenarna (`feat/jobbsoket-a`, `-b`, `-c`, `-kit`, `-omgang1`) är borttagna i städningen 2026-11-21. Inget kvar att göra här.
12. Oanvända filer som fanns före bygget: `PaywallIllustrations`, `PriserIllustrations`, `useDeviceType`, `use-exam-deadline`.
13. Produktfacit (i minnesfilen `project_faktagranskning_2026_11.md`) saknar Sökta tjänster, Ska sökas, veckans mål och uppföljningsmejlet. Fyll på så att nästa faktagranskning utgår från det nya.

## 5. Beslut som är ägarens

Lägg fram dem med en rekommendation. Fatta dem inte själv.

1. **Bli upptäckt och testresultaten.** Skissen sa att testpoäng aldrig visas. Dagens samtyckestext säger "Verifierade testresultat med percentiler". Bygget behöll samtyckestexten ordagrant. Vilket ska gälla?
2. **Gratisnivån i matchningen är inte tät på servern.** `/api/jobbmatchning/pool` lämnar de 120 bästa annonserna till alla inloggade, som den gamla sidan också gjorde. Den som letar i nätverkstrafiken ser mer än tre. Ska servern spärra?
3. **Black Week (23 till 29 november, 30 november).** Kontrollera med ägaren att kampanjpriset ska synas även på den nya betalväggen för uppföljningsmejlet. Den använder samma köpknapp och samma prislogik, men är aldrig sedd under kampanj.
4. **Prissidan och listorna över vad som ingår.** Uppföljningsmejlet är en ny Premiumfördel, och Ska sökas och veckans mål är nya gratisfördelar. Hur de ska stå på prissidan och i Premiumlistan avgör ägaren (texter om pris och paket ändras bara med ägaren).
5. **Skärmdumpen `public/Skärmbild 2025-09-26 220531.jpg`.** En gammal bild av dashboarden med ett riktigt kontonamn. Nås publikt, används ingenstans. Rekommendation: ta bort.
6. **Kampanjmejlet "Ny funktion: Sökta tjänster"** (`src/lib/email/campaign-sokta-tjanster.ts`): ska det skickas igen i ny version, eller pensioneras?
7. **Påståendet att matchningen körs när man öppnar sidan** står på flera publika ställen. Sidan visar senaste körningen och söker om först på knappen. Ändra texten eller beteendet?
8. **`/funktioner` lägger jobbmatchningen under "Bara i Jobbcoach Premium"** fast tre träffar är gratis. Äldre fel.
9. **Tolv dagar eller en vecka.** Produkten påminner efter tolv dagar. Artikeln `uppfoljning-efter-intervju.mdx` säger "efter ungefär en vecka".
10. **Testdatan på QA-kontona** (se avsnitt 7): ska den ligga kvar för fortsatt test eller städas?
11. **Avläsning.** Ingen är bokad och inget utgångsläge är mätt. Föreslå datum och mått (andel som loggar en sökt tjänst, sparade under Ska sökas, öppnade utkast, köp från betalväggen `uppfoljning`).

## 6. Publika sidor att uppdatera

Kartlagt 2026-11-21. Inget är ändrat.

**Säger något som nu är fel**
- `/dela/sokta-tjanster/<token>`: se avsnitt 4, punkt 1.
- `src/lib/email/campaign-sokta-tjanster.ts:75–76, 97`: "ett flödesdiagram över hela resan" och "Helt gratis, för alla konton" (rapportens radlistor är Premium).
- `src/app/(public)/funktioner/FunktionerSida.tsx:336–347`: "ett personligt brev från en träff hamnar där av sig självt". Det sparas när användaren klickar.

**Saknar nyheterna** (Ska sökas, veckans mål, uppföljningsmejlet, intervjun på tjänsten, de nya handlingarna på en träff)
- `/priser`: `src/app/(public)/priser/components/priser-data.ts:156–178` (gruppen "Jobb och coachning"), rad 194 (frågan "Vad ingår i Jobbcoach Premium?"), rad 222 (metabeskrivningen).
- Premiumlistan `HELA_PAKETET_RADER` i `src/lib/plans/plans.ts:93–99`. Läses av startsidan, prissidan och mejlet `quota_wall`.
- Gratislistan i `src/lib/plans/gratis-copy.ts:51–99`. Läses av gratiskortet, `/priser`, registreringen, startsidans frågor och mejlet om gratisnivån.
- Funktionskorten i `src/components/pricing/paket-copy.ts:239–256` (Matchade jobb, Jobbcoachen). Det finns inget kort för Sökta tjänster eller Inför intervjun.
- `/funktioner`: Sökta tjänster saknas i ankarraden och i "Alla verktyg" (rad 50–72).
- Startsidan `src/components/publikt/start/Startsidan.tsx`: rad 99–105 (Sökta tjänster), 262–277 (jobbmatchningen), 303 (Jobbcoachen).
- `/verktyg/jobbmatchning` (`src/app/(public)/verktyg/jobbmatchning/page.tsx`): rad 49–56, 92–93 (`featureList` i schemat), 194–202, 298–309.
- `/verktyg/jobbcoachen`: `page.tsx:15–17` och `components/jobbcoachen-faq-data.ts:20–22`.
- Registreringen `src/components/registrering/registrering-copy.ts:244–270` (valen "jobb" och "intervju").
- Mejlen `komigang.ts` och `campaign-gratisniva.ts` i `src/lib/email/lifecycle/templates/`.
- Artiklarna `content/artiklar/vad-ar-en-jobbcoach.mdx` (rad 23, 641–655, 884–897), `jobbcoach-online.mdx` (44–52, 370, 886–899), `din-digitala-jobbcoach.mdx` (161, 173–175), `ai-jobbmatchning.mdx` (49–57, 118–120).
- Naturliga ställen att nämna uppföljningsmejlet: `soka-jobb-via-mail.mdx` och `uppfoljning-efter-intervju.mdx`.

**Tecknade telefonskärmar av gamla vyer** (`src/components/publikt/telefon/skarmar/`)
- `SkarmBana.tsx`: startsidans hjälte, "Mitt jobbsök, tre av fem steg klara". Motsvarar inte Översikt med flikar och Att göra nu.
- `SkarmMatchning.tsx`: listan utan sista ansökningsdag och utan annonsen bredvid. Används på startsidan, `/funktioner` och `/verktyg/jobbmatchning`.
- `SkarmAktivera.tsx`: "CV:t är aktiverat", med steget "Aktivera ditt CV" i HowTo-schemat på `/verktyg/jobbmatchning` (rad 108–133). Nya Matchade jobb har "Byt CV" med automatisk inläsning.

**Sökt utan träffar:** hjälpcentret, `/verktyg/bli-upptackt`, sitemap, appbutikens texter. Alla artiklar är inte lästa i sin helhet, bara sökta med nyckelord.

## 7. Testkonton och testdata

- QA-kontona (ett gratis, ett Premium) ligger i `scripts/.qa-jobbsoket-konton.json` (filen har BOM och ignoreras av git). Flyttad dit ur temp-mappen 2026-11-21, när temp-mappen rensades. Finns den inte kvar: fråga ägaren.
- På kontona ligger testdata från bygget. Premium: sju sökta tjänster i olika lägen, två rader under Ska sökas, veckans mål 4, två utkast, CV:t "Sara Testsson", två intervjuprov, samtycke i Bli upptäckt (synligheten avslagen), sökprofilen satt till Umeå. Gratis: tre sökta tjänster, en Ska sökas-rad, ett utkast, en "redan skickat", samma CV.
- Gratiskontot har redan använt sitt enda gratisutkast. För att pröva första utkastet från noll behövs ett nytt gratiskonto.

## 8. Regler som gäller

- **Kontona ska ligga kvar.** Radera aldrig konton. Kontot som slutar på `+jobbcoach-qa-play@gmail.com` rörs aldrig. Radera bara egna rader, per id, aldrig med tidsfönster.
- **Databasen är produktion på Supabase gratisnivå.** Enstaka klick är ofarligt. Inga loopar, inga stora matriser, få prestandakörningar, en agent åt gången. Driftstoppet 2026-11-20 berodde på omkring 3 000 tester på kort tid.
- **Migreringar** körs bara med ägarens uttryckliga ja för just den migreringen. Bara tillägg.
- **Ändra aldrig** priser, kampanjlogik eller texter om datalagring, samtycke, GDPR och villkor utan ägaren.
- **Text:** svenska med svenska facktermer, inga talstreck, aldrig Sparkles-ikonen, aldrig emoji, aldrig rött i Jobbsöket. "Sökt tjänst", "personligt brev", "Jobbcoachen", "Premium". Lön skrivs aldrig ut. Data som bild, inte som textrad med tre tal.
- **Roller:** designbeslut och säljytor tas av Fable, ren implementation och QA görs av Opus 5.5. Större designändringar godkänns i en skiss före bygge.
- **Git:** rör inte ocommittade filer från andra sessioner i `C:\Users\chris\cvbrev` (`mobilapp/`, `video/`, `next.config.ts` med flera). Lägg till uttryckliga sökvägar, aldrig `-A`. Arbetskopian `C:\Users\chris\cvbrev-qa-b` togs bort i städningen 2026-11-21 (allt låg i main vid 280ec592). Behöver du bygga: skapa en ny arbetskopia bredvid rotmappen enligt reglerna som visas vid sessionsstart (`node scripts/arbetsyta.mjs`). Pusha först när ägaren har sagt det.
- **Test före klart:** riktig webbläsare, 1440 och Pixel 7, skärmbild per steg. Bygge, hela vitest och prestanda en gång före push, inte per rättning.
- Nekar behörighetssystemet något: gå inte runt det. Säg vad som hände.

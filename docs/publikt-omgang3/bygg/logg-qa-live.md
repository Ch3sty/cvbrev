# Klicktest på live efter dagens två driftsättningar (2026-11-22)

Kört mot https://www.jobbcoach.ai (main `7c54bc66`) från `C:\Users\chris\cvbrev-publikt3`, 10:20 till 10:58 svensk tid. Ingen lokal server, inget bygge. Inget av koden är ändrat; filen är ocommittad.

## Så gjordes det

- `arbetsyta.mjs` före start: 3,9 av 15,8 GB ledigt, inga servrar igång, en arbetskopia.
- En headless Chrome (fjärrstyrd, egen profil i scratchpad), en flik, ett flöde i taget. Varje förfrågan med huvudet `Next-Router-Prefetch` avbröts (480 stoppade), liksom PostHog och Google Analytics. 73 sidladdningar mot live totalt (dokument, inklusive omladdningar när telefonvyn sattes).
- Gatewayens logg (`edge_logs`) under passet: som mest 864 anrop per fem minuter, inga 5xx.
- Testkonton skapade i registreringsformuläret, ett i taget, adresser `qa-live-<flöde>-<tid>@jobbcoach-qa.test`. Id skrevs till en fil direkt efter varje registrering.
- Testfiler: en påhittad CV-PDF för "Test Testsson" med markerbar text (ritad av webbläsaren) och en andra version med en rad till. Ingen DOCX behövdes.
- Skärmbilderna ligger i scratchpad: `C:\Users\chris\AppData\Local\Temp\claude\dceaf5763afec129\2f505274-a60e-456c-8335-21ea685ee053\scratchpad\qa-live\bilder\` (nedan kallad `bilder\`). 1440 per steg, slutläget i 412.
- Om telefonbilderna: puppeteer laddar om sidan när telefonläget (isMobile) slås på. Där en omladdning hade suddat ut det som skulle visas (B5, B7, B8) togs 412-bilden med 412 px bredd utan omladdning.

## Domen i korthet

| Punkt | Dom |
|---|---|
| A CV-lagringen | Fungerar. Konto 2 nekat på alla fem försök; konto 1 når sina egna filer. Ingen väg i vyn till originalfilen |
| B1 Jobbmatchning | Fungerar. Fel F1 (telefonnumret) gäller tolkningen här också; orten följer inte med |
| B2 /cv-mallar | Fungerar. Fel F1 syns i mallen |
| B3 Brevet med Björk | Fungerar. Fel F2 (texten "gratis, även som Word" mot spärren) |
| B4 Sökta tjänster, Jag ska söka | Fungerar. Ingen tjänst eller arbetsgivare i någon adress |
| B5 Jobbcoachen | Fungerar. Adressen bär bara `?fraga=1` |
| B6 Skapa CV, startbladet | Fungerar |
| B7 Provet utan konto | Fungerar, ett prov (numeriskt), fem uppgifter till resultatet |
| B8 Mini-analysen | Fungerar, 89 av 100, samma som i kontot |
| C Dagens sidor | Fungerar. Liten anmärkning om loggan på Glömt lösenordet |
| D Inloggning och fellägen | Fungerar alla fyra |
| E Mejlen | Två fel: F3 (tom rund ikon i lösenordsmejlet), F4 (kuvertemoji kvar i bekräftelsen); samt F5 (båda bredare än 600 px) och anmärkningar |

## A. CV-lagringen efter regelbytet

**Konto 1** (`eaae1e54-6e46-4fdf-bc44-602d7e0867ae`, skapat i B6).

1. Ditt CV (`/dashboard/profil/cv`), Välj fil, samtycket, Ladda upp CV: `POST /api/cv/upload` 200 på 12 s, sedan `quick-score`. Ditt CV öppnades med `?cv=<id>`, 89 av 100. `A-01` till `A-03`.
2. Analys: 89 av 100, "11 poäng kvar till 100", genomgången i sju delar. `A-04`.
3. Originalfilen: **vyn har ingen väg till originalfilen** (ingen nedladdning eller öppning av den uppladdade filen i Ditt CV, Analys eller Mallar; ingen kod anropar `createSignedUrl` eller laddar ner ur `cvs` åt användaren). Som ersättning kontrollerade jag med konto 1:s egen åtkomsttoken mot lagrings-API:t: listan över `users/` gav bara den egna mappen, den egna mappen gav `.placeholder` och de två CV-filerna, och filen gick att hämta (200, 52 521 byte). Det är kontrollfallet för intrångsförsöken nedan.
4. Version till: först nekat med `EMAIL_NOT_VERIFIED` ("Du måste verifiera din e-post för att ladda upp fler CV:n"), som regeln säger för obekräftade gratiskonton (`A-08`). Jag bekräftade kontots e-post med kontots egen bekräftelselänk (token läst ur `email_confirmations` för kontots id, öppnad i webbläsaren; landade på `/login?confirmed=true`, "Din e-post är bekräftad", `A-09`). Sedan gick versionen igenom: samma filnamn, annat innehåll, sparad som `users/<id>/test-testsson-cv__vmwrn0zla.pdf` (`A-10`). Alltså fungerar uppladdning med den nya regeln för `insert`.
5. Jobbcoachen: "Välj dokument att dela", valde CV:t, skrev en kort fråga och skickade (det enda meddelandet). `POST /api/jobbcoachen/chat` 200, bilagan syns som bricka i frågan, svaret kom. `A-11` till `A-15`. (Bilagan i Jobbcoachen läser CV-texten ur `cv_texts`, inte filen i lagringen; rutten `/api/jobbcoachen/upload` anropas inte av vyn.)
6. Radera: Byt CV, Ta bort på CV:t som visades, bekräfta. `DELETE /api/cv/delete` 200, nästa CV öppnades. Filen var borta ur lagringen (konto 1:s listning: `.placeholder` och versionen kvar). `A-16` till `A-18`, slutläget `A-19-ditt-cv-slutlage-412.png`.

**Konto 2** (`3a684b50-127b-48e5-a91d-d39bd89eddc9`, skapat i B1), samma webbläsare efter utloggning av konto 1. Direkta anrop mot `…/storage/v1` med konto 2:s åtkomsttoken ur sessionens cookie (nycklar och token aldrig utskrivna), mot konto 1:s kvarvarande fil:

| Försök | Svar |
|---|---|
| Lista `users/` | 200, tom lista |
| Lista `users/<konto 1>/` | 200, tom lista |
| Hämta `users/<konto 1>/test-testsson-cv__vmwrn0zla.pdf` | 400, "Object not found" |
| Ladda upp `users/<konto 1>/qa-intrang.txt` | 400, "new row violates row-level security policy" |
| Skriva över konto 1:s fil (upsert) | 400, samma RLS-nej |
| Radera konto 1:s fil | 200 med tom lista (inget raderat) |
| Signerad länk till filen (extra) | 400, "Object not found" |

Efteråt i databasen: konto 1:s fil står kvar orörd (52 819 byte, samma tid), ingen `qa-intrang.txt`. **Dom: fungerar.**

Extra kontroll: konto 1 lämnade `jobbcoachen_conversation_id` i webbläsarens `localStorage` efter utloggningen. Med konto 2 inloggat i samma webbläsare visade Jobbcoachen inte konto 1:s samtal (`A-20`). Bra. Se också anmärkning om `sessionStorage` under "Övrigt".

## B. Flödena som bär arbete in i kontot

### B1. /verktyg/jobbmatchning
Prova-ytan, PDF:en: `POST /api/public/cv/tolka` 200. "Det här läste vi ur ditt CV": yrkesroller (Projektledare, Biträdande projektledare), kompetenser, utbildning. **Plats visas inte**, fast CV:t säger Göteborg (P4-loggen lovar plats). "Se mina träffar" gick till `/register?redirect=%2Fdashboard%2Fjobbmatchning`, utkastet i `jc_jobb_prova`. Konto 2 skapat; landade i Matchade jobb med CV:t valt (`test-testsson-cv.pdf`, 2 roller, 15 kompetenser, 1 utbildning), "Ingen ort vald". `B1-01` till `B1-06`. **Dom: fungerar.** Matchningen kördes inte (inte i uppdraget).

### B2. /cv-mallar
PDF:en lades in: tolkningen 200, CV:t i Linne. **Telefonnumret är fel i mallen: "+46 70-000 000" för "070-000 00 00"** (fel F1). Bytte till Kalksten: "Kalksten, 4 av 40", knappen "Ladda ner PDF i Kalksten, Premium 149 kr i månaden". Ladda ner i Kalksten: dialogen "Skapa ett konto, så följer ditt CV med. När kontot är klart går du till kassan. Premium ger dig Kalksten …" (Premium-spärren för besökare). "Ladda ner gratis i Linne" bytte till Linne; Ladda ner PDF: "Ditt CV i Linne, gratis. Filen kommer direkt när kontot är klart." Logga in i dialogen (`/login?redirect=/cv-mallar/prova?hamta=1`) med konto 1: filen `cv-linne-test-testsson.pdf` (53 640 byte) laddades ner direkt efter inloggningen, och "Klart. Ditt CV är nedladdat." visades. Ett andra tryck på Ladda ner gav `402` från `/api/cv/generate-formatted` (en gratisfil per konto, `free_cv_exports_used` = 1), som gratisnivån säger. Vad vyn visade för just 402:an gick inte att avgöra, eftersom efterdialogen ("Ditt CV i en annan mall?") låg över. `B2-01` till `B2-10`. **Dom: fungerar.**

Ingen ny konto skapades här; den nedladdade filen är flyttad från Hämtade filer till scratchpad.

### B3. Brevet med Björk
`/personligt-brev-exempel/projektledare`, Byt mall, Björk, "Använd som mall" till `/skapa-brev/start?yrke=projektledare&mall=bjork`. Startflödet: "MALLEN DU VALDE Björk. Gratis, även som Word.", tjänsten förifylld. Fyllde arbetsgivare (Nordhaga Bygg AB), erfarenhet, tonen Professionell och en kort påhittad annons. "Skriv mitt brev": `POST /api/public/letter-draft` 200, spärren med första stycket, "Brevet sparas i Björk, mallen du valde", "Nedladdning som PDF och Word ingår i Premium". **Under arket står samtidigt "Björk, mallen du valde. Den är gratis, även som Word."** (fel F2). Konto 3 skapat via "Skapa konto och läs brevet" (`/register?draft=<token>`); landade på `/dashboard/mina-brev/<id>` med brevet i Björk. Raden i `letters`: `mall_id` bjork, `tonality` professional, `language` sv, annonsen sparad (160 tecken). Brevet syns i Dina brev med länk. Ladda ner PDF: Premium-spärren "Nedladdning ingår i Premium", "Köp Premium, 149 kr i månaden" (inget köp). `B3-01` till `B3-12`. **Dom: fungerar**, med F2.

### B4. /verktyg/sokta-tjanster, Jag ska söka
Arket, "Jag ska söka", Testledare QA hos Provföretaget QA, sista dag 2026-12-15, "Spara till Ska sökas" (en länk). Adresser under vägen: `/register?redirect=%2Fdashboard%2Fsokta-tjanster%3Flogga%3Dska-soka`, `/dashboard/valkommen`, `/dashboard/sokta-tjanster?filter=ska-sokas&fran=publikt-sokta`. **Ingen adress bär tjänst eller arbetsgivare.** Utkastet låg i `jc_sokt_prova` och var borta efteråt. Konto 4 landade i filtret Ska sökas med posten (sista dag tis 15 dec, 23 dagar kvar). `B4-01` till `B4-06`. **Dom: fungerar.**

### B5. /verktyg/jobbcoachen
Skrev en egen fråga i fältet och skickade. Adressen: `/register?redirect=%2Fdashboard%2Fjobbcoachen%3Ffraga%3D1`; frågan låg i `localStorage` under `jc_coach_fraga`. Konto 5 landade på `/dashboard/jobbcoachen?fraga=1` med frågan i fältet, och lagringens nyckel var tömd. Inget skickat till Jobbcoachen. `B5-01` till `B5-05`. **Dom: fungerar.**

### B6. /verktyg/skapa-cv
Startbladet: yrket Projektledare, "skriv själv", "Bygg mitt CV gratis" till `/register?redirect=/dashboard/skapa-cv?fran=registrering&titel=Projektledare&borja=1`. Konto 1 skapat; landade i byggaren (avsnitt Kontakt) med Yrkestitel Projektledare och e-posten ifyllda. `B6-01` till `B6-05`. **Dom: fungerar.** 412-bilden är tagen efter en omladdning, och då är titeln borta (den kom bara ur adressen och var inte sparad än); det är omladdningen, inte flödet.

### B7. Provet utan konto
Testsidans lyfta kort, typen Siffror och tabeller (numerisk), Starta provet: `/verktyg/rekryteringstester/prova?typ=numerisk`, startskärmen, Starta provet, fem uppgifter (1 av 5 till 5 av 5, första svarsalternativet varje gång), resultatet "1 av 5 rätt" med första missen förklarad öppet och kontogränsen för de andra. Två `POST /api/public/test-session`, båda 200. Ett prov; IP-gränsens rad är inte rörd. `B7-01` till `B7-06`. **Dom: fungerar.**

### B8. /verktyg/cv-analys
Inte räknad som körd i A (A gick genom kontots rutt). PDF:en en gång: `POST /api/public/quick-score` 200, 89 av 100, "Det viktigaste att ändra först", "I kontot ser du", kontogränsen. `B8-01` till `B8-03`. **Dom: fungerar.**

## C. Sidorna som ändrades i dag

`/integrationer`, `/auth/forgot-password`, `/verktyg/bli-upptackt`, `/for-rekryterare` i 1440 och 412 (Pixel 7), hela sidan, efter att ha rullat igenom för lata bilder. Alla: 200 (304 i andra varvet), en h1, ingen sidledsrullning, inga element utanför kanten, inga trasiga bilder, inga konsolfel, inga tankstreck, ingen emoji. Bilder `C-<sida>-1440.png` och `-412.png`.

Anmärkning: på Glömt lösenordet (och registreringen och inloggningen) står loggan i sidhuvudet som "Jobbcoach  .ai" med ett synligt mellanrum före ".ai", i båda bredderna (`C-auth-forgot-password-1440.png`, `-412.png`). I sidfoten är den hel.

Inloggat:
- **Kom igång** (konto 1): raden "CV-analysen, gratisnivån / Poängen och vad som saknas, del för del", ordagrant som `komigang.ts`. 1440 från sidomenyn, 412 från raden på Jobbsökets hemvy (på telefon nås listan bara från Jobbsökets Översikt). `C-kom-igang-1440.png`, `C-kom-igang-412.png`. Anmärkning: raden står obockad fast kontot har sett sin poäng och genomgången; den bockas av när analysen "körs" i den gamla meningen.
- **Sökta tjänster med arket öppet** (`?logga=1`, konto 4): arket öppnas i båda bredderna, ingen sidledsrullning. `C-sokta-arket-oppet-1440.png`, `-412.png`.

**Dom: fungerar.**

## D. Inloggning och fellägen

- Fel lösenord på /login: `400` från auth, raden "Fel e-postadress eller lösenord." `D-01-fel-losenord-1440.png`.
- /register med konto 2:s adress: `422` från signup, "Det finns redan ett konto med den adressen. Logga in i stället, så kommer du rätt. Ditt val följer med." `D-02-kontot-finns-1440.png`.
- Glömt lösenord med konto 2:s adress: `POST /api/auth/forgot-password` 200, "Klart, kolla din inkorg … Till: <adressen>". Mejlet gick till en domän som inte finns, som i tidigare QA. `D-03-glomt-losenord-svar-1440.png`.
- Google (från `/login?redirect=/dashboard/sokta-tjanster`): knappen ledde till `accounts.google.com/v3/signin/identifier`; `redirect_uri` är `https://mnlrpfidyzuaxxlftruf.supabase.co/auth/v1/callback`, och `redirect_to` i parametrarna är `https://www.jobbcoach.ai/auth/callback?next=/dashboard/sokta-tjanster`. Ingen inloggning gjord. `D-04-google-sida-1440.png`.

**Dom: fungerar.**

## E. Mejlen

Ritade lokalt genom att anropa mallfunktionerna med `tsx` (skript `scratchpad\qa-live\mejl\rita.ts`, `server-only` stubbad, databasen en stubbe som svarar tomt, inga nycklar till mejltjänsten). HTML i `scratchpad\qa-live\mejl\html\`, bilder `bilder\E-<mall>-600.png` i 600 px bredd, text granskad i `scratchpad\qa-live\mejl\granskning.json`.

Ritade: kvotväggen (M1 till M3), engångsköpet slut, gratisnivåns kampanj (M4 till M8), uppsägningen (M9), Kom igång-mejlet för paketen cv, tester och allt (M10 till M16; med tom databas blir det profilbrickan i alla tre), kvoten tillbaka för brev, test, cv_analysis och chat_message (M20, M21), rekryterarens intresse (M22, M23), nytt lösenord (M24 till M26 och dagens emoji), bekräftelsen (M27).

Stämmer med beslutet: Premiumlistans sex rader i kvotväggen; gratisnivåns rader (två fria mallar och en nedladdning, läsbarhetspoängen i sju delar, ett brev var sjunde dag och de två senaste går att ändra, tio meddelanden per konto); uppsägningen med listans ord; cv_analysis och chat_message får standardtexten ("Nu kan du fortsätta där du slutade"); rekryterarmejlets två meningar om vad som delas; lösenordsmejlet säger 24 timmar, "Viktigt att veta:", ingen 💡, inget lås, ingen varningstriangel; bekräftelsen "Jobbcoach.ai. Länken gäller i 24 timmar." utan år. Inga tankstreck någonstans, inga "fynd", "nyckelord" eller "utan tak". Mittpunkten finns bara i sidfotens "Avregistrera dig · jobbcoach.ai" (befintlig layout).

Fel och anmärkningar, se F3 till F5 och "Övrigt".

**Dom: fungerar som beslutat, med två fel i ikonerna och bredden.**

## Felen

### F1. Telefonnumret tappar sista siffran i den publika CV-tolkningen
- Steg: `/cv-mallar`, lägg in en PDF där telefonnumret står "070-000 00 00" (samma för `/verktyg/jobbmatchning`, som går genom samma rutt `/api/public/cv/tolka`).
- Väntat: "070-000 00 00" (eller "+46 70-000 00 00").
- Faktiskt: "+46 70-000 000" i mallen och i `jc_cv_prova`, en siffra saknas.
- Orsak (läst i koden, inte rättad): `src/lib/cv/swedish-cv-content-parser.ts:114`, `/(\+46|0046|0)[\s-]?[1-9][\d\s-]{7,10}/`. Efter "07" får bara tio tecken med, och "0-000 00 00" är elva. Kontrollerat med regexen i node: "070-123 45 67" blir "070-123 45 6", "070 123 45 67" blir "070 123 45 6"; "0701234567" klarar sig. Det är det vanligaste svenska skrivsättet. Följer med in i kontot när CV:t hämtas efter registreringen. Kontots egen uppladdning (A) läste numret rätt.
- Skärmbild: `bilder\B2-02-cv-i-mallen-1440.png` (raden under titeln).

### F2. Startflödet säger både "gratis, även som Word" och "Nedladdning ingår i Premium" om Björk
- Steg: `/skapa-brev/start?yrke=projektledare&mall=bjork`, skriv utkastet.
- Väntat: en sanning om nedladdningen. I kontot är nedladdningen av brevet Premium (spärren i B3).
- Faktiskt: mallraden före utkastet "Björk. Gratis, även som Word." och raden under arket efter utkastet "Björk, mallen du valde. Den är gratis, även som Word." står mot spärrens "Nedladdning som PDF och Word ingår i Premium" på samma skärm.
- Skärmbild: `bilder\B3-04-startflodet-bjork-1440.png`, `bilder\B3-06-sparren-1440.png`, spärren i kontot `bilder\B3-10-ladda-ner-sparr-1440.png`.

### F3. Lösenordsmejlet har en tom rund ikon kvar
- Steg: rita `generatePasswordResetEmailHTML`.
- Väntat (M25): spannet med låset borta helt om det bara bar ikonen.
- Faktiskt: den rosa-lila cirkeln (ikonens platta) står kvar, tom, under rubriken.
- Skärmbild: `bilder\E-M24-26-nytt-losenord-600.png`.

### F4. Bekräftelsemejlet har kvar en kuvertemoji
- Steg: rita `generateConfirmationEmailHTML`.
- Väntat: inga emojier i mejlen (M25:s princip; beslutet nämner inte just den här).
- Faktiskt: ✉ (U+2709) i cirkeln överst.
- Skärmbild: `bilder\E-M27-bekraftelse-600.png`.

### F5. Lösenords- och bekräftelsemejlet är 630 px breda
- Steg: öppna HTML:en i 600 px bredd.
- Väntat: ryms i 600 px som de andra mallarna.
- Faktiskt: `scrollWidth` 630, kortet med skugga går utanför; sidled i en smal läsruta.
- Skärmbild: samma två bilder som F3 och F4.

## Övrigt (inga fel i uppdragets mening, värda att titta på)

- Den publika tolkningen (B1, B2) läser inte ut orten; Matchade jobb står på "Ingen ort vald" och mallen saknar Göteborg. "bygg- och" blev "byggoch" i mallen (avstavningen i PDF:ens text slogs ihop).
- Originalfilen kan inte öppnas eller laddas ner i vyn (A steg 3). Om det ska gå är det en ny funktion.
- Kontot ser Jobbcoachens "Brevet är skrivet mot annonsen och ditt CV" i Dina brev, fast konto 3 inte har något CV (`bilder\B3-12-dina-brev-1440.png`). Kom igång står på 0 av 6 efter brevet från startflödet (känt sedan P3b).
- `sessionStorage` behåller `dashboard_summary_v1_<id>` för båda de tidigare kontona efter utloggning i samma flik; `localStorage` behåller `jobbcoachen_conversation_id`. Inget av det läcktes till nästa konto i vyerna jag såg, men det ligger kvar i webbläsaren. Dessutom finns nycklarna `setItem` och `getItem` i `localStorage`, vilket tyder på att någon kod skriver `localStorage['setItem']`.
- Kvotväggens ämne säger "tre gånger den här veckan", brödtexten "tre gånger de senaste dagarna".
- Gratisnivåmejlet: "Det här ändras:" följs av knappen, och listan kommer först efter knappen (`bilder\E-M4-8-gratisniva-kampanj-600.png`).
- Kom igång-mejlet har brickans titel "Profilen ifylld" som rubrik, i dåtid, i ett mejl som ber henne fylla i profilen (`bilder\E-M10-16-komigang-cv-600.png`).
- Arket i kontots Sökta tjänster har platshållaren "Volvo Cars" (ett riktigt företag).
- React-fel #418 (hydrering) på 404-sidan för `/dashboard/cv` (en adress jag skrev fel; sidan finns inte).
- Inloggad på `/cv-mallar/prova?hamta=1` visar sidhuvudet fortfarande "Logga in" och "Skapa konto".

## Testkonton och AI-anrop

| Konto | Id | Användes för |
|---|---|---|
| 1 | `eaae1e54-6e46-4fdf-bc44-602d7e0867ae` | B6, A (konto 1), B2 (inloggning), C Kom igång, D (fel lösenord) |
| 2 | `3a684b50-127b-48e5-a91d-d39bd89eddc9` | B1, A (konto 2), D (kontot finns, glömt lösenord) |
| 3 | `94930453-ce61-4ba1-a3f2-49294431b94c` | B3 |
| 4 | `cccf827c-300e-44ae-9c59-35b19e4ab3d5` | B4, C Sökta tjänster |
| 5 | `c4ad882c-0399-4f20-bd97-d60010a68300` | B5 |

AI-anrop, sju, inget gjort två gånger: A uppladdningens tolkning (med den automatiska poängen), A versionens tolkning, A ett meddelande till Jobbcoachen, B1 tolkningen, B2 tolkningen, B3 brevutkastet, B8 mini-analysen. (A:s version krävdes av uppdraget och var ett eget flöde i samma konto.)

## Städningen

Räknat först, sedan raderat per id, token och adress (`scratchpad\qa-live\stada.mjs`, logg `stadning-torr.json` och `stadning-kord.json`): alla uuid-kolumner i alla tabeller i `public` mot de fem id:na, `email_confirmations` och `email_log` per adress, `email_events` per `payload->>'to'`, utkastet per token, provet per token.

| Vad | Räknat | Raderat |
|---|---|---|
| `user_activities` | 75 | 75 |
| `email_schedule` (schemalagda mejl) | 10 | 10 |
| `email_confirmations` | 4 | 4 |
| `cv_texts` | 3 | 3 |
| `active_cv_for_matching` | 1 | 1 |
| `ai_conversations` | 1 | 1 (`ai_messages`, 2, följde med) |
| `ai_usage_costs` | 1 | 1 |
| `formatted_cv_downloads` | 1 | 1 |
| `job_saved_ads` | 1 | 1 |
| `letters` | 1 | 1 |
| `public_letter_drafts` (token `07ec4e20…`) | 1 | 1 |
| `anon_test_sessions` (token `bbad2886…`) | 1 | 1 |
| `email_events`, `email_log` | 0 | 0 |
| Filer i `cvs` under `users/<konto 1>/` | 2 | 2 (via lagrings-API:t med service role) |
| `profiles` | 5 | 5 |
| Användare i auth | 5 | 5 |

Kontrollen efteråt: 0 profiler, 0 användare, 0 filer under kontonas mappar, 0 schemalagda mejl, 0 utkast; en ny torrkörning gav 0 rader och 0 filer. Inte rört: raderna i `public_rate_limits` (IP-gränsen; de kan inte skiljas från andras med säkerhet). Kvar utanför databasen: fem bekräftelsemejl och ett lösenordsmejl gick till `@jobbcoach-qa.test`, som inte finns; skulle Resends webhook skriva studsar till `email_events` efter städningen ligger de där med de adresserna. Chrome är stängd, profilen och filerna ligger i scratchpad.

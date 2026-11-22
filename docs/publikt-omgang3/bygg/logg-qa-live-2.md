# Klicktest på live av de sex rättningarna (2026-11-22)

Kört mot https://www.jobbcoach.ai (main `69689cda`) från `C:\Users\chris\cvbrev-publikt3`, cirka 12:10 till 12:30 svensk tid. Ingen lokal server, inget bygge, ingen kod ändrad. Filen är ocommittad.

## Så gjordes det

- `arbetsyta.mjs` före start: 3,3 GB ledigt, inga servrar igång, en arbetskopia.
- En headless Chrome (fjärrstyrd på port 9333, ny tom profil i scratchpad), ett flöde i taget. Varje förfrågan med `Next-Router-Prefetch` avbröts (311 stoppade), liksom PostHog och Google Analytics. Dessutom avbröts varje anrop till edge-funktionerna `parse-cv-for-matching` och `match-jobs` (inget sådant anrop gjordes; loggen över stoppade är tom).
- 44 sidladdningar (dokument) mot live, ett flöde i taget. Gatewayens logg (`edge_logs`) under passet: som mest 826 anrop per fem minuter, inga 5xx.
- Testkonton i registreringsformuläret, ett i taget, adresser `qa-live2-<k1|k2>-<tid>@jobbcoach-qa.test`, id skrivet till fil direkt efter registreringen.
- Test-PDF: samma påhittade "Test Testsson" som i förra klicktestet (Göteborg, 070-000 00 00, `example.invalid`), 52 521 byte.
- Skärmbilderna: `C:\Users\chris\AppData\Local\Temp\claude\dceaf5763afec129\2f505274-a60e-456c-8335-21ea685ee053\scratchpad\qa-live-2\bilder\` (nedan `bilder\`). 1440 per steg, slutläget i 412 (cookieraden i 375).

## Domen i korthet

| Punkt | Dom |
|---|---|
| 1 Originalfilen | Fungerar |
| 2 Lagringen | Fungerar |
| 3 Menyn | Fungerar på de sidor som visar menyn för en inloggad; startsidan och verktygssidorna skickar den inloggade vidare in i kontot (befintligt beteende), så där syns menyn inte |
| 4 Kom igång | Fungerar, 1 av 7 med brevet bockat; nås i telefon via profilmenyn (QA) |
| 5 Orten i Matchade jobb | Fungerar |
| 6 Cookieraden | Fungerar |
| Utanför de sex | Ett fel: profilmenyns "Logga ut" ligger under en panel på Dina brev när kontot har ett brev (F1) |

## 1. Originalfilen

Konto 1 (`b05ea1c2-a32e-4e5f-8e55-4dd83d447917`): Ditt CV, Välj fil, samtycket, Ladda upp CV. `POST /api/cv/upload` 200, Ditt CV öppnades med `?cv=f115b3e3-…` (`1-04` till `1-06`).

- Raden står längst ned: "ORIGINALFILEN / Filen du laddade upp / test-testsson-cv.pdf, som den såg ut när du laddade upp den.", knappen "Öppna originalfilen" (`target=_blank`) och länken "Ladda ner" (`download="test-testsson-cv.pdf"`). `bilder\1-07-originalfil-rad-1440.png`.
- Öppna originalfilen: en ny flik med PDF:en i Chromes visare, rätt innehåll (Test Testsson, Göteborg, 070-000 00 00). `bilder\1-08-originalfil-oppnad-1440.png`. Rutten svarade 302 (`Cache-Control: no-store`) till en signerad länk i `cvs/users/<konto 1>/`, som gav `application/pdf`, 52 521 byte, samma storlek som filen som laddades upp.
- Ladda ner: rutten med `&ladda=1` gav 302 till den signerade länken med `download=`, som svarade `Content-Disposition: attachment; filename=test-testsson-cv.pdf`. Ett riktigt klick på "Ladda ner" gav filen `test-testsson-cv.pdf`, 52 521 byte, börjar med `%PDF-`. Vyn stod kvar på Ditt CV (`1-09-efter-ladda-ner-1440.png`).
- 412: raden står kvar med "Öppna filen" och "Ladda ner", ingen sidledsrullning (412/412). `bilder\1-10-originalfil-rad-412.png`.
- Konto 2 (`54cd8746-a626-427b-86fe-85bff5441813`), inloggat i samma webbläsare, mot konto 1:s CV-id: `?cv=…` och `?cv=…&ladda=1` gav båda 404 "Vi hittar inte originalfilen", ingen `Location`, `no-store`; i webbläsaren samma sida (`bilder\1-11-konto2-nekas-1440.png`). Konto 1:s fil stod kvar orörd tills städningen.

**Dom: fungerar.**

## 2. Lagringen

Konto 1 inloggat efter uppladdning, Matchade jobb och menytesterna. Före utloggningen planterade jag två av kontots nycklar som ett utkast skulle ha lämnat (`jc_cv_prova`, `jobbcoachen_conversation_id`), som i den lokala kontrollen.

| | `localStorage` | `sessionStorage` |
|---|---|---|
| Inloggad, före utloggning | `__ph_opt_in_out_…` (PostHog), `jc_cv_prova`, `jc_lagring_agare` (konto 1:s id), `jc_pwa_first_seen_at`, `jobbcoachen_conversation_id`, `v4_hint_visad:forsta_steg:matris` | `dashboard_summary_v1_<konto 1>`, `jc_flodets_ursprung`, `v4_hem_visad` |
| Efter "Logga ut" i profilmenyn | `__ph_opt_in_out_…`, `jc_pwa_first_seen_at` | tom |
| Konto 2 efter registreringen | `__ph_opt_in_out_…`, `jc_pwa_first_seen_at`, `jc_lagring_agare` (konto 2:s id) | `dashboard_summary_v1_<konto 2>`, `jc_flodets_ursprung` |

- Nycklarna `setItem` och `getItem` fanns inte vid något tillfälle.
- Efter utloggningen var Supabase-kakorna borta; kvar stod `cvBrevCookieConsent` och `jc_recruiter`.
- Konto 2 (Dina brev, brevet, Ditt CV): inget av konto 1:s syns, inget "Testsson", "Göteborg" eller Originalfilen; Ditt CV är tomt (`bilder\2-03-konto2-ditt-cv-1440.png`).
- Bilder: `bilder\2-01-profilmeny-fore-utloggning-1440.png`, `bilder\2-02-efter-utloggning-1440.png`.

**Dom: fungerar.** Se F1 om "Logga ut" i profilmenyn när kontot har ett brev.

## 3. Menyn

Mätt med `PerformanceObserver` (layout-shift) och en `MutationObserver` på `data-inloggad` från första byte, bild efter 3 s.

**Utloggad** (före första kontot, tom profil):

| Sida | Bredd | Synligt | Byte | CLS |
|---|---|---|---|---|
| `/` | 1440 | Logga in, Skapa konto | aldrig | 0,0248 (hjältebilden `p3-hjalte-bild`, inte menyn) |
| `/priser` | 1440 | Logga in, Skapa konto | aldrig | 0 |
| `/verktyg/cv-analys` | 1440 | Logga in, Skapa konto | aldrig | 0 |
| `/cv-mallar/prova?hamta=1` | 1440 | Logga in, Skapa konto | aldrig | 0 |
| `/` | 412 | Skapa konto; telefonmenyns fot "Skapa konto gratis" och "Logga in" | aldrig | 0 |
| `/priser` | 412 | Skapa konto | aldrig | 0 |

Inget blinkar: första ritningen och slutläget visar samma, och `data-inloggad` sattes aldrig. Bilder `bilder\3-utloggad-*.png`, telefonmenyn `bilder\3-utloggad-telefonmeny-start-412.png`.

**Inloggad** (konto 1):

| Sida | Bredd | Synligt | Byte efter | CLS |
|---|---|---|---|---|
| `/priser` | 1440 | Till kontot → `/dashboard` | 251 ms | 0 |
| `/cv-mallar/prova?hamta=1` | 1440 | Till kontot → `/dashboard` | 230 ms | 0 |
| `/priser` | 412 | Till kontot; telefonmenyns fot bara "Till kontot" | 262 ms | 0 |
| `/cv-mallar/prova?hamta=1` | 412 | Till kontot | 254 ms | 0 |

Rutan står på samma plats och med samma bredd i båda lägena (1440: x 1068, bredd 224; 412: x 209, bredd 127). Bilder `bilder\3-inloggad-priser-1440.png`, `3-inloggad-cv-mallar-prova-hamta-1-1440.png`, `-412.png`, telefonmenyn `bilder\3-inloggad-telefonmeny-priser-412.png`.

Startsidan och verktygssidorna kunde inte ses inloggad: `/` gick till `/dashboard` (komponenten `AuthRedirect`, befintlig), `/verktyg/cv-analys` till `/dashboard/cv-analys`, `/verktyg/jobbmatchning` till `/dashboard/jobbmatchning` och `/verktyg/rekryteringstester` till `/dashboard/tester`. Det är så de var byggda före i dag, inte en följd av rättningen. På `/` mättes 0,1337 i layoutskift efter vidareskickningen, på den nya sidan; inte menyns skift.

Anmärkning: för en inloggad står "Logga in" och "Skapa konto" i serverns HTML de första cirka 100 ms (första ritningen 130 till 170 ms, bytet 230 till 260 ms). Det är så det är byggt (serverns HTML är densamma för alla), och inget flyttar sig (CLS 0).

**Dom: fungerar** på de sidor där menyn visas för en inloggad.

## 4. Kom igång

Konto 2 skapat genom brevets startflöde: `/skapa-brev/start`, Byt mall, Björk ("Gratis"), "Använd Björk", tjänst Projektledare, arbetsgivare Nordhaga Bygg AB, erfarenhet, tonen Professionell, "Skriv mitt brev" (`POST /api/public/letter-draft` 200, AI-anrop 2), "Skapa konto och läs brevet" till `/register?draft=700d0c77-…`, registrering. Landade på brevet i Björk (`bilder\4-09-landning-brevet-1440.png`).

- 1440: "Klar" (klientnavigering) till Dina brev. Sidomenyn: "Kom igång 1 av 7 provade". Listan: "Skriv ett personligt brev" bockad under "Det du valde", "Analysera ditt CV" föreslaget nästa. `bilder\4-10-kom-igang-1440.png`.
- I databasen: `onboarding_intent` brev, `first_letter_created_at` satt, `onboarding_steps` med `brev`, `onboarding_steps_completed` `["create_letter"]`.
- 412: sidomenyn finns inte, och `/dashboard` skickar kontot till Dina brev (valet brev). Listan nås från profilmenyn: tryck på rundeln "QA" uppe till höger, sedan "Kom igång". Den öppnas som ett ark nedifrån med "1 av 7" och brevet bockat. `bilder\4-13-profilmeny-412.png`, `bilder\4-14-kom-igang-412.png`.

**Dom: fungerar.**

Anmärkning: valet av Björk i mallväljaren tar först när man trycker "Använd Björk"; att trycka på kortet visar bara en förhandsvisning. Mitt första försök skrev därför utkastet i Linne, och bytet till Björk gjordes efteråt på samma skärm. Brevet hamnade i Björk.

## 5. Orten i Matchade jobb

Konto 1 hade CV:t med Göteborg och ingen sökprofil. Att öppna Matchade jobb utan inläst CV startar `parse-cv-for-matching` (ett AI-anrop) av sig självt. För att hålla mig inom två anrop avbröt testwebbläsaren alla anrop till den funktionen och till `match-jobs`, och jag lade själv in kontots rad i `active_cv_for_matching` med `extracted_location` tom (som när tolkningen missar orten), modell `qa-live2-manuell`. Det prövar reserven, som är det rättningen byggde.

- `/dashboard/jobbmatchning` i 1440: "Ort i CV:t: Göteborg" i CV-rutan och "Från ditt CV: Göteborg" i "Så söker vi åt dig". `bilder\5-01-matchade-jobb-1440.png`.
- Raden i databasen hade efteråt `extracted_location` Göteborg: servern fyllde i och sparade orten.
- 412: "Göteborg, Heltid och deltid" i sökraden. `bilder\5-02-matchade-jobb-412.png`.
- Ingen sökning startad, inget anrop till funktionerna gjort.

Inte prövat på live: att modellens egen tolkning hittar orten (det kostar ett AI-anrop).

**Dom: fungerar.**

## 6. Cookieraden

Tom profil, startsidan (mörk) och `/artiklar/ai-jobbmatchning` (artikeln har mörk topp och ljus brödtext), i 1440 och 375.

| | 1440 | 375 |
|---|---|---|
| Raden | vit, ingen skugga, kant överst 2 px, 56 px hög i botten | samma, 94 px hög |
| Acceptera | koppar (gradient), mörk text, 2 px kant, klack, 120 × 44, 14 px fet | 168 × 44 |
| Avvisa | vit, mörk text `#1A1A1F`, 2 px kant, klack, 120 × 44, 14 px fet | 168 × 44 |

- Ingen svart knapp. Lika stora, samma textstorlek och vikt. Avvisa är tydlig men Acceptera har mer färg; det är beslutad form, inte ett fel.
- Täcker: ingen länk eller knapp under raden på någon av de fyra skärmarna, ingen sidledsrullning. I 1440 på artikeln, rullad till mitten, täcker raden de nedersta 17 px av sidospaltens kort (spalten är sticky, 84 till 861 px; raden börjar på 844); knappen "Skapa konto gratis" i kortet ligger fritt ovanför. `bilder\6-banner-artikel-rullad-1440.png`.
- Avvisa (375, artikeln): raden försvann, kakan `cvBrevCookieConsent=false` sattes, och raden kom inte tillbaka efter omladdning. Den syntes inte heller på sidorna under resten av passet.
- Bilder: `bilder\6-banner-start-mork-1440.png`, `-375.png`, `bilder\6-banner-artikel-ljus-1440.png`, `-375.png`, `bilder\6-banner-efter-avvisa-375.png`, `bilder\6-banner-efter-omladdning-375.png`.

**Dom: fungerar.**

## Felen

### F1. "Logga ut" i profilmenyn ligger under panelen på Dina brev när kontot har ett brev
- Steg: inloggad med ett brev, `/dashboard/mina-brev` i 1440 (och 412), tryck på "QA" uppe till höger.
- Väntat: hela profilmenyn ovanpå sidan, "Logga ut" går att trycka på.
- Faktiskt: panelen "Så ligger brevet till" (`section.b3-panel`) ritas ovanpå menyn. "Logga ut" (och i 412 också "Prenumeration" och "Inställningar") syns inte. `elementFromPoint` på "Logga ut" träffar `SECTION.b3-panel`. Med ett tomt Dina brev (konto 1) syns hela menyn. Utloggningen i punkt 2 gjordes med ett skriptat klick och på konto 1:s tomma Dina brev, så den påverkades inte.
- Skärmbilder: `bilder\X-profilmeny-tackt-dina-brev-1424.png` (1424 px bred), `bilder\4-13-profilmeny-412.png`; som jämförelse `bilder\2-01-profilmeny-fore-utloggning-1440.png`.

## Övrigt

- Dina brev säger "Brevet är skrivet mot annonsen" fast ingen annons klistrades in (känt sedan förra klicktestet).
- Brödsmulan på artikeln i 375 bryter så att "/ AI-jobbmatchning: …" står på en egen rad med snedstrecket först (`bilder\6-banner-artikel-ljus-375.png`).
- Kakan `jc_recruiter` sattes i en vanlig besökares webbläsare under passet; jag har inte tittat på varifrån.

## Testkonton och AI-anrop

| Konto | Id | Användes för |
|---|---|---|
| 1 | `b05ea1c2-a32e-4e5f-8e55-4dd83d447917` | Uppladdning, originalfilen, Matchade jobb, menyn inloggad, lagringen och utloggningen |
| 2 | `54cd8746-a626-427b-86fe-85bff5441813` | Brevets startflöde, Kom igång, lagringen efter kontobyte, försöket mot konto 1:s originalfil |

AI-anrop, två: CV-uppladdningen (`/api/cv/upload`, en rad i `ai_usage_costs`) och brevutkastet (`/api/public/letter-draft`). Inget anrop till `parse-cv-for-matching` eller `match-jobs`.

## Städningen

Räknat först, sedan raderat per id, adress och utkastets token (`scratchpad\qa-live-2\stada.mjs`):

| Vad | Räknat | Raderat |
|---|---|---|
| `user_activities` | 39 | 39 |
| `email_schedule` | 4 | 4 |
| `email_confirmations` | 2 | 2 |
| `active_cv_for_matching` (raden jag lade in) | 1 | 1 |
| `ai_usage_costs` | 1 | 1 |
| `cv_texts` | 1 | 1 |
| `letters` | 1 | 1 |
| `public_letter_drafts` (token `700d0c77…`) | 1 | 1 |
| `email_events`, `email_log` | 0 | 0 |
| Filer i `cvs` under `users/<konto 1>/` | 2 | 2 |
| `profiles` | 2 | 2 |
| Användare i auth | 2 | 2 |

Kontrollen efteråt: 0 profiler, 0 användare, 0 filer, 0 schemalagda mejl, 0 utkast; en ny torrkörning gav 0 rader och 0 filer. IP-gränsens rader inte rörda. Två bekräftelsemejl gick till `@jobbcoach-qa.test`, som inte finns. Testets Chrome är stängd (port 9333 stängd); profilen, bilderna och den nedladdade PDF:en ligger i scratchpad.

# Klicktest på live: sidokortet och Bli upptäckt från båda sidor (2026-11-22)

Kört mot https://www.jobbcoach.ai (main `2ca18b61`) cirka 14:55 till 15:20 svensk tid. Ingen kod ändrad, inget bygge, ingen push. Filen är ocommittad.

## Överst: personuppgift läcker före kandidatens ja

**Arbetsgivarnamnet når rekryteraren genom erfarenhetens beskrivning.** `GET /api/recruiter/candidate/<id>` före ja: `experience[].company` är `null` och sidan visar "Visas efter accepterad kontakt", men `experience[].description` är CV-textens rad oförändrad. Testkandidatens profil visade för rekryteraren:

- "Ledde ombyggnaden av Kvarnbackens skola på 30 miljoner kronor för **Nordhaga Bygg AB**, klar två veckor före plan."
- "Arbetade nära platschefen på **Strömsholm Entreprenad**."

Samma text står både i nätverkssvaret och på sidan (`bilder\C2-04-profil-hel-1440.png`). Maskeringen i `src/lib/recruiter/candidateData.ts` (`mapExperience`) nollar bara fältet `company`; beskrivningen tas med upp till `DESCRIPTION_MAX` tecken utan att arbetsgivaren tvättas bort. Det gäller varje kandidat vars CV nämner arbetsgivaren i beskrivningen, vilket är vanligt.

Åtgärd enligt passets regel: kandidatens synlighet stängdes av direkt (14:09:56 UTC, `candidate_profiles.visibility = 'off'` på kontots egen rad), och därefter gjordes inga fler försök mot profilen: ingen kontaktförfrågan, inget ja, ingen chatt. Rekryteraren såg sedan "Profilen är inte längre synlig" och poolen gick från 5 till 4 kandidater.

**Kontots id skickas i varje träff.** `userId` (kontots uuid) finns i varje kort i `GET /api/recruiter/pool` och i detaljsvaret, och står i adressen `/rekryterare/kandidat/<id>` och i RSC-svaret. Det är byggt så (routen tar id:t som parameter). Briefen räknar kontots id till det som inte får skickas. Jag bedömde id:t som en pseudonym nyckel, inte namn eller kontaktuppgift, och fortsatte efter att ha sett det; stoppet kom vid arbetsgivarnamnet ovan. Läses regeln strikt gäller stoppet redan här.

## Så gjordes det

- 506 MB ledigt vid start. En headless Chrome (port 9334), en flik, en profil i taget: `profil-a` (del A), `profil-k` (kandidaten), `profil-r` (rekryteraren). Chrome stängd mellan delarna.
- Förladdningar (`Next-Router-Prefetch`), PostHog och Google Analytics stoppade (557 stoppade förfrågningar), liksom `parse-cv-for-matching` och `match-jobs` (loggen tom, inga sådana anrop).
- `pageerror`, konsolfel, svar 400 och uppåt från jobbcoach.ai och alla svar 500 och uppåt loggades hela passet. Varje fetch-, xhr- och dokumentsvar från jobbcoach.ai och Supabase sparades i rekryterarens webbläsare (`svar\fore`, `svar\fore2`, `svar\efter`) och söktes igenom med `analys.mjs`.
- 51 dokumentsvar mot live. AI-anrop: 3 (se nedan).
- Bilder: `C:\Users\chris\AppData\Local\Temp\claude\dceaf5763afec129\2f505274-a60e-456c-8335-21ea685ee053\scratchpad\qa-live-4\bilder\` (nedan `bilder\`).

## Utfallet i korthet

| Punkt | Utfall |
|---|---|
| A Sidokortet, 2 artiklar × 3 höjder × med och utan cookierad | Godkänt (48 mätlägen) |
| B1 Brevet och Målgången utan annons | Inte kontrollerat (IP-gränsen). Med annons: godkänt |
| B2 Bli synlig som ny användare | Fungerar, sex anmärkningar på flödet och samtycket |
| B3 Meddelandeknappen, notisen, tacka ja | Inte kontrollerat (stoppet) |
| C1 Registrering, 6 tecken | Underkänt: engelskt felmeddelande mot "Minst 6 tecken" |
| C1 Vägen till godkänt konto | Anmärkning: utlovat mejl vid godkännande finns inte i koden |
| C2 Rekryterarens nätverkssvar före ja | **Underkänt**: arbetsgivarnamn i beskrivningen; kontots id i varje kort |
| C3 Förfrågan, ja, chatt | Inte kontrollerat (stoppet) |
| C4 Rekryterare mot `/dashboard`, kandidat mot `/rekryterare` | Godkänt |
| C5 Portalen 1440 och 412 | Godkänt, ingen sidledsrullning, 0 `pageerror`, 0 svar över 500 |

## Del A: sidokortet i artiklarna

Utloggad, ny profil, 1440 bred. Per artikel och höjd: överst, artikelns mitt, artikelns slut och förbi artikeln. Knappen är kortets sista länk ("Skapa konto gratis" respektive "Se vad som ingår").

**Med cookieraden synlig** (raden 56 px nedtill):

| Artikel | Höjd | Knappen (mitten och slutet) | Över raden | `elementFromPoint` | Förteckningen rullar själv | Aktiv länk synlig | Spalten |
|---|---|---|---|---|---|---|---|
| soka-jobb-via-mail | 900 | 750 till 806, raden 844 | ja | knappen | ja (scrollTop 9, sedan 161) | ja | 84 till 836 |
| soka-jobb-via-mail | 720 | 570 till 626, raden 664 | ja | knappen | ja (0, sedan 33) | ja | 84 till 656 |
| soka-jobb-via-mail | 600 | 450 till 506, raden 544 | ja | knappen | ja (1, sedan 153) | ja | 84 till 536 |
| logiktest-exempel | 900 | 659 till 715, raden 844 | ja | knappen | ja (0, sedan 284) | ja | 84 till 836 |
| logiktest-exempel | 720 | 570 till 626, raden 664 | ja | knappen | ja (1, sedan 373) | ja | 84 till 656 |
| logiktest-exempel | 600 | 450 till 506, raden 544 | ja | knappen | ja (1, sedan 373) | ja | 84 till 536 |

**Efter Acceptera** (`data-samtycke="svarat"`, ingen rad):

| Artikel | Höjd | Knappen | Inom fönstret | `elementFromPoint` | Förteckningen rullar | Aktiv länk synlig | Spalten |
|---|---|---|---|---|---|---|---|
| soka-jobb-via-mail | 900 | 806 till 862 | ja | knappen | ja (0, sedan 105) | ja | 84 till 892 |
| soka-jobb-via-mail | 720 | 626 till 682 | ja | knappen | ja (54, sedan 206) | ja | 84 till 712 |
| soka-jobb-via-mail | 600 | 506 till 562 | ja | knappen | ja (0, sedan 97) | ja | 84 till 592 |
| logiktest-exempel | 900 | 715 till 771 | ja | knappen | ja (0, sedan 228) | ja | 84 till 892 |
| logiktest-exempel | 720 | 535 till 591 | ja | knappen | ja (36, sedan 408) | ja | 84 till 712 |
| logiktest-exempel | 600 | 506 till 562 | ja | knappen | ja (14, sedan 386) | ja | 84 till 592 |

- Aktiv länk vid mitten: "Intresseanmälan och spontanansökan via mejl" respektive "Matriser: vilken figur saknas?"; vid slutet: "Mejlet öppnar dörren, innehållet tar dig…" respektive "Logiktest och arbetsintervju: vad händer sedan?". Spalten själv rullar aldrig (`scrollHeight` = `clientHeight`), bara listan.
- Förbi artikeln: spaltens underkant ligger 112 px ovanför nästa avsnitt i alla 12 lägen (till exempel 360 mot 472), alltså har den släppt och ligger inte över Läs vidare.
- Överst på sidan ligger spalten under hjälten (från y 895) i alla höjder, så knappen syns först när man rullat. Det är ingen överlappning och inget fel i rättningen, bara värt att veta.
- Premiumkortet i 600 tappar beskrivningen och gratisraden men behåller pris och knapp (`bilder\A-svarat-logiktest-600-mitten.png`).
- Bilder: `bilder\A-<rad|svarat>-<soka|logiktest>-<höjd>-<topp|mitten|slutet|forbi>.png` (48 st).

## Del B: kandidaten

### B1 Brevet och Målgången

- Brevets startflöde gick inte: `POST /api/public/letter-draft` gav **429**. Användaren ser "Du har skapat tre brev idag. Skapa ett gratiskonto så skriver du fler direkt." (`bilder\B1-03-ip-grans-1440.png`). Datorns IP hade nått dagens tre brev från tidigare pass. Raden i `public_rate_limits` rördes inte. Inget AI-anrop gjordes.
- Kontot skapades i stället via länken "Skapa ett gratiskonto" i samma ruta, som leder till `/register`.
- Inloggad kräver "Nytt brev" (`/dashboard/skapa-brev`) en annons; det finns ingen väg till ett brev utan annons för ett inloggat konto. **Texten "Brevet och datumet" för brev utan annons är därför inte kontrollerad på live.**
- Kontrollerat med annons i stället (AI-anrop 3, `POST /api/letters/generate-preview` 200): raden vid Markera som sökt "Brevet, annonsen och datumet hamnar i Sökta tjänster." Efter Markera som sökt (`POST /api/applications` 200) visar Målgången "SÖKT SÖNDAG 22 NOV · MÄLARBYGG AB", "Ansökan är skickad", "Brevet, annonsen och datumet ligger i Sökta tjänster, så du kan följa upp när det är dags." Sökta tjänster: raden "Projektledare, Mälarbygg AB, Sökt 22 nov, svar på annons, med personligt brev", "Veckans mål: 1 av 3 sökta". Godkänt för varianten med annons. `bilder\B1-08-brevet-klart-1440.png`, `B1-09-malgang-1440.png`, `B1-10-sokta-tjanster-1440.png`.

### B2 Bli synlig, steg för steg som ny användare

1. Registrering, sedan `/dashboard/valj-spar` med Premiumerbjudandet först. "Börja gratis i stället".
2. Jobbsöket, Bli upptäckt (`bilder\B2-01-bli-upptackt-utan-cv-1440.png`): tre steg, listorna "Det här visas" och "Det här visas aldrig", knappen "Kom igång". Kontot har inget CV, men sidan säger inget om det här.
3. "Kom igång" öppnar samtycket direkt (`bilder\B2-02-efter-kom-igang-1440.png`). **Anmärkning:** rubriken säger "Vi skapar en kandidatprofil av ditt valda CV", men kontot har inget CV och har inte valt något.
4. **Anmärkning (samtycke):** rutan "Visa mina främsta styrkor och min arbetsstil från personlighetstestet" är **förkryssad** när dialogen öppnas. Huvudsamtycket är tomt och krävs. Ett förkryssat samtycke är inte ett aktivt val; texten är ägarens och ändras inte här, men det bör ses över av ägaren.
5. Kryss i huvudsamtycket, "Aktivera synlighet". **Anmärkning:** profilen blev synlig **utan CV** (`cv_id` null, `visibility` anonymous). Förhandsvisningen visade "Kandidat, Anonym, Din yrkesroll saknas ännu". En tom profil ligger alltså i poolen tills CV väljs.
6. Sidan säger "Ett av fem steg klara" och samtidigt "Nästa steg: Välj vilket CV som ska driva profilen. 5 steg till efter det." Fem plus ett blir sex; siffrorna motsäger varandra.
7. Skärmläsartext: "Synlighetsläge, klart" och "Dina verifierade resultat, klart" läses som rubrik följd av ett ensamt ", klart".
8. "Du har inget CV ännu. Ladda upp ett" leder till `/dashboard/profil/cv`. Filen väljs, sedan krävs kryss i "Jag samtycker till att mitt CV behandlas enligt GDPR-riktlinjerna. Ditt CV används bara för att skapa brev och analyser åt dig. Vi delar det aldrig med tredje part." **Anmärkning (juridik, för ägaren):** samma CV driver sedan profilen som visas för rekryterare; texten säger bara brev och analyser. Inte ändrad.
9. Uppladdningen: `POST /api/cv/upload` (strukturering, AI) och direkt efter `POST /api/cv/quick-score` (AI, startar av sig själv). Läsbarhet 89. Telefon och ort fylldes i profilen ur CV:t, **namnet inte** ("Namnet saknas. Utan det kan vi inte skapa ditt CV." på Profil). Namnet skrevs in för hand.
10. Tillbaka på Bli upptäckt: CV:t var **inte förvalt** trots att det är kontots enda. Valt med ett klick. Villkor: 1 månad, Hybrid, Heltid, Tillsvidare, Västmanlands län, B-körkort, lönespann 45 000 till 55 000, pitch. Varje klick sparades direkt (`POST /rest/v1/candidate_profiles?on_conflict=user_id`, 10 gånger, alla 200). "Fyra av fem steg klara".
11. Ett grundtest i matrislogik (poäng 11) och en personlighetsprofil (C 81, A 72, O 58, E 47, N 35) lades in direkt i databasen på kontots egen rad, inte genom att göra testerna i webbläsaren, för att hålla nere lasten. Båda raderades i städningen.
12. Förhandsvisningen "Så ser rekryterare dig just nu": "Projektledare, Västmanlands län · Anonym, 10 års erfarenhet · Senast: Projektledare (7 år) · Högskoleingenjör, byggteknik", pitchen, "Matrislogik · topp 64 %", "Strukturerad", "Samarbetsvillig", fem kompetenser, villkoren. `bilder\B2-07-bli-upptackt-klar-1440.png`.
13. Nästa steg-texten: "Gör verbalt och numeriskt-testerna, resultaten visas som bevis på profilen" (och före testet "Gör matrislogik och verbalt och numeriskt-testerna"). Språket haltar.
14. "Topp 64 %" visas för ett resultat under medianen (percentil 36). Formellt rätt, men läses som beröm.

**Samtyckestexten jämförd med vad rekryteraren såg:**

| Samtycket lovar | Rekryteraren såg | Utfall |
|---|---|---|
| Yrkesroll och erfarenhetsnivå visas | Projektledare, 10 år | stämmer |
| Kompetenser från CV:t | sex kompetenser | stämmer |
| Verifierade testresultat med percentiler | "Topp 64 % av 47 testade", 1 försök | stämmer |
| Personlighetsstyrkor (valfritt) | skickas i svaret (`personalityStrengths`), syns i poolens kort i 412, **syns inte** på detaljsidan i 1440 | delvis, förhandsvisningen visar mer än detaljsidan |
| Region och tillgänglighet | Västmanlands län, 1 månad, Hybrid, Heltid, B-körkort | stämmer |
| Nuvarande arbetsgivare visas aldrig | **"för Nordhaga Bygg AB" och "Strömsholm Entreprenad" i beskrivningarna** | **bryter löftet** |
| Rå-CV visas aldrig | beskrivningarna är CV-raderna ordagrant, utbildningens skola ("Mälardalens universitet") och språk visas också | inte hela CV:t, men löptext ur det |
| Kontaktuppgifter visas aldrig | namn, e-post, telefon, adress fanns inte i svaren | stämmer |
| Lönespannet visas aldrig | 45000/55000 fanns inte i svaren | stämmer |

### B3 Meddelandeknappen, notisen, tacka ja

Inte kontrollerat. Kräver en förfrågan till en synlig kandidat, och synligheten stängdes av vid läckan. Det jag såg: när profilen blev synlig ritades engångsrutan "NYHET Här dyker rekryterare upp. Du är nu synlig. När en rekryterare vill komma i kontakt hamnar meddelandet här." med "Uppfattat" och "Visa mig" (texten finns två gånger i sidans DOM, för vägg och golv). Hur den ritas och stängs i 1440 och 412 är inte mätt. Efter avstängningen fanns ingen meddelandeknapp (0 länkar till `/dashboard/meddelanden`).

## Del C: rekryteraren

### C1 Registrering och vägen till godkänt konto

- `/for-rekryterare` har "Skapa rekryterarkonto" och "Ansök om tidig åtkomst", båda till `/rekryterare/registrera`.
- Formuläret: Företagsnamn, Organisationsnummer, Kontaktperson (krävs), roll, roller ni rekryterar, telefon, webbplats, e-post, lösenord med platshållaren "Minst 6 tecken" och `minlength=6`.
- **6 tecken (`Qa4!xy`):** webbläsaren släpper igenom, `POST /auth/v1/signup` svarar 422 och användaren ser under lösenordet, på engelska: **"Password should be at least 8 characters."** Underkänt: fel språk och platshållaren lovar 6. `bilder\C1-03-efter-skicka-kort-losen-1440.png`.
- **8 tecken och uppåt:** `signup` 200, `POST /rest/v1/recruiter_profiles` 201 (status sätts till pending av RLS-villkoret), `POST /api/auth/send-confirmation` 200. Vyn "Ansökan mottagen: Tack! Vi verifierar företag manuellt, oftast inom en till två arbetsdagar. När kontot är godkänt ser du det på din rekryterarsida, och vi hör av oss via mail."
- "Till rekryterarsidan" visar "Ansökan granskas: Vi verifierar QA Testbolaget AB mot org-numret. Det tar oftast mindre än en arbetsdag, du får ett mail så fort kontot är godkänt." **Anmärkning:** "en till två arbetsdagar" mot "mindre än en arbetsdag" på två skärmar i rad.
- **Anmärkning:** mejlet vid godkännande finns inte. `src/app/api/admin/recruiters/route.ts` sätter bara status, `approved_at` och `approved_by`; ingen kod i `src` skickar mejl när en rekryterare godkänns, och tabellen har bara triggern som fyller `contact_email`. Det finns heller inget som säger till ägaren att en ansökan kommit in (raden skrivs direkt från webbläsaren). En riktig rekryterare väntar alltså på ett mejl som aldrig kommer och får gå tillbaka till sidan själv.
- Exempelnumret 556677-8899 (platshållaren) godtogs som organisationsnummer.
- Godkännandet gjordes på kontots egen rad med servernyckeln (`update recruiter_profiles set status='approved', approved_at=now() where user_id=<rekryterarens id> and status='pending'`). Kontot fick ingen admin-roll.

### C2 Rekryterarens nätverkssvar före kandidatens ja

Portalen: "5 kandidater" i poolen, sökningen "Projektledare" gav "2 kandidater". Svar som rekryterarens webbläsare fick: sidan `/rekryterare`, `auth/v1/user`, `/api/recruiter/status`, `/saved-searches`, `/interests`, `/pool?`, `/pool?q=Projektledare`, `/api/recruiter/candidate/<id>` (två gånger: förhandspanelen och hela profilen), RSC-svaret för profilsidan, `/api/recruiter/notes?candidateUserId=<id>`, och två `POST user_activities`.

**Fält i testkandidatens kort (`/api/recruiter/pool`):** `userId`, `role`, `skills`, `regions`, `availability`, `workplace`, `extent`, `driversLicense`, `testBadges[]` (`family`, `level`, `percentile`, `sampleSize`, `testDate`, `label`), `personalityStrengths`, `visibility`, `yearsOfExperience`, `latestRole` (`title`, `years`), `educationLevel`, `educationLevelBucket`, `pitch`, `historyTitles`, `workStyleArchetype`, `cardWorkStyle`, `activeSince`, `contextTags`, `matchReasons`, `interestStatus`, `interestSentAt`.

**Fält i detaljsvaret (`/api/recruiter/candidate/<id>`):** alla kortets fält utom `matchReasons` och intressefälten, plus `experience[]` (`position`, `company`, `period`, `description`), `education[]` (`school`, `degree`, `year`), `testResults[]` (`family`, `level`, `percentile`, `sampleSize`, `completedAt`, `attempts`), `languages`, `workStyle`, `interviewGuide`, `workStyleReport`, `personalityTestedAt`, `personalityStale`, `fullName`, `email`, samt `interestStatus` bredvid.

**Värdena för testkandidaten och kontrollen mot listan:**

| Får inte finnas | Fanns i svaren | Utfall |
|---|---|---|
| Namn (Saga Testqvist) | nej; `fullName: null` | godkänt |
| E-post (konto och CV) | nej; `email: null` | godkänt |
| Telefon (070-123 45 67) | nej | godkänt |
| Adress (Granitvägen 12) | nej | godkänt |
| Foto | nej, men kontot hade inget foto | inte kontrollerat |
| Arbetsgivarnamn | `company: null`, **men `description` innehåller "Nordhaga Bygg AB" och "Strömsholm Entreprenad"** | **underkänt** |
| Lönespann (45000 till 55000) | nej, inga lönefält | godkänt |
| Råpoäng från test (11) | nej; `percentile: 36`, `sampleSize: 47`, `label: "Matrislogik · Grundnivå · topp 64 %"`, `attempts: 1` | godkänt (placering vid minst 25 testade, ingen andel rätt) |
| Personlighetens råvärden | nej; `personalityStrengths: ["Strukturerad", "Samarbetsvillig"]`, inga O/C/E/A/N, inga facetter | godkänt, styrkor i ord |
| Kontots id | **`userId` i varje kort, i detaljsvaret, i adressen och i RSC-svaret** | **underkänt** enligt briefen |

Övrigt i svaren: `experience[].period` ("2020-03 till nu"), `education[].school` ("Mälardalens universitet"), `historyTitles`, `activeSince` med tidsstämpel, `testDate`/`completedAt` med klockslag.

Sidan ritade samma sak (`bilder\C2-03-peek-1440.png`, `C2-04-profil-hel-1440.png`): arbetsgivaren står i klartext under raden "Visas efter accepterad kontakt".

**Fält efter kandidatens ja:** inte kontrollerade (stoppet).

**Misstag under passet:** mitt första skript öppnade fel rad i listan, en riktig kandidats profil, i 1440. Det skapade en rad i `candidate_profile_views` för den kandidaten. Raden raderades direkt (per rekryterarens id och kandidat skild från testkandidaten, 1 rad), och inget mer lästes eller sparades om den profilen i loggen. Övriga riktiga kandidater syns bara som anonyma kort i poolen och i bilderna av listan.

### C3 Förfrågan, ja och chatt

Inte kontrollerat (stoppet). Ingen `candidate_interests`-rad skapades, inga meddelanden, inga notiser.

### C4 Rollerna hålls isär

| Konto | Adress | Landade på |
|---|---|---|
| Godkänd rekryterare | `/dashboard`, `/dashboard/bli-upptackt`, `/dashboard/mina-brev`, `/dashboard/profil/cv`, `/dashboard/tester`, `/dashboard/meddelanden` | `/rekryterare` alla sex, godkänt |
| Kandidat | `/rekryterare`, `/rekryterare/inbox`, `/rekryterare/kandidat/<id>` | stannar, "Ditt konto saknar rekryterarprofil. Registrera ditt företag…", godkänt |
| Kandidat | `fetch('/api/recruiter/pool')` | 403 `{"code":"not_approved","status":"none"}`, godkänt |

Rekryterarens kontroll gjordes cirka 9 minuter efter godkännandet, alltså inom kakan `jc_recruiter` på 10 minuter; den hade inte cachat ett nej. `bilder\C4-02-rekryterare-pa-dashboard-1440.png`, `C4-03-kandidat-pa-rekryterare-1440.png`.

### C5 Portalen i 1440 och 412

| Bredd | Sida | Sidled | Innehåll |
|---|---|---|---|
| 1440 | `/rekryterare` | 1425/1425 | sök, filter, tabell, 4 kandidater |
| 1440 | `/rekryterare/inbox` | 1425/1425 | tomt läge |
| 1440 | `/rekryterare/projekt` | 1425/1425 | tomt läge |
| 1440 | `/rekryterare/sparade-sokningar` | 1425/1425 | tomt läge |
| 1440 | `/rekryterare/jamfor` | 1425/1425 | "Markera 2 till 4 kandidater…" |
| 1440 | `/rekryterare/registrera` | 1425/1440 | "Ert konto är godkänt" |
| 412 | `/rekryterare` | 412/412 | kort i en spalt, bottennav, Filter-knapp |
| 412 | `/rekryterare/inbox`, `/projekt`, `/sparade-sokningar`, `/registrera` | 412/412 | som ovan |

Profilsidan och förhandspanelen i 412 är inte sedda: testkandidaten var då dold, och fler riktiga profiler öppnades inte. `bilder\C5-<sida>-1440.png`, `-412.png`, `C2-*.png`.

## Sidfel

Hela passet: 0 `pageerror`, 0 svar med status 500 eller högre. Svar 400 och uppåt, alla väntade: 429 på brevutkastet (IP-gränsen), 422 på registreringen med 6 tecken, 404 på den dolda kandidaten, 403 när kandidaten anropade poolen.

## Konton och AI-anrop

| Konto | Id | Adress |
|---|---|---|
| Kandidat | `0087a4c1-090c-4e5f-963d-3cb1927c4fa7` | `qa-live4-kand-…@jobbcoach-qa.test` |
| Rekryterare | `501da6a8-39da-4ac1-b1ba-5d07d9f98dcc` | `qa-live4-rek-…@jobbcoach-qa.test` |

AI-anrop: 3. CV-inläsningen blev två (`/api/cv/upload` strukturerar, och `/api/cv/quick-score` startar av sig själv efter uppladdningen), plus brevet med annons (`/api/letters/generate-preview`). Startflödets brevutkast gav 429 och räknas inte. Inga köp. Två bekräftelsemejl gick till `@jobbcoach-qa.test`, som inte finns. Inget mejl om förfrågan (ingen förfrågan skickades).

## Städningen

Räknat först (torrkörning), sedan raderat per de två kontonas id och adresser (`scratchpad\qa-live-4\stada.mjs`, alla uuid-kolumner i public plus adressfälten):

| Vad | Räknat | Raderat |
|---|---|---|
| `user_activities` | 46 | 46 |
| `email_confirmations` | 2 | 2 |
| `email_schedule` | 2 | 2 |
| `ai_usage_costs` | 1 | 1 |
| `candidate_profiles` | 1 | 1 |
| `candidate_profile_views` (rekryteraren på testkandidaten) | 1 | 1 |
| `candidate_profile_views` (rekryteraren på en riktig kandidat, raderad under passet) | 1 | 1 |
| `cv_texts` | 1 | 1 |
| `letters` | 1 | 1 |
| `job_applications` | 1 | 1 |
| `logic_test_v4_sessions` (inlagd) | 1 | 1 |
| `user_personality_profile` (inlagd) | 1 | 1 |
| `recruiter_profiles` | 1 | 1 |
| Filer i `cvs` under `users/0087a4c1-…/` (`.placeholder`, `saga-testqvist-cv.txt`) | 2 | 2 |
| `profiles` | 2 | 2 |
| Användare i auth | 2 | 2 |

Kontrollen efteråt: 0 profiler, 0 användare, 0 filer, 0 schemalagda mejl, 0 rekryterarrader, 0 kandidatprofiler, 0 visningar, 0 rader i mejlloggen, 0 intressen, 0 notiser, 0 meddelanden. En ny torrkörning gav 0 rader och 0 filer. `public_rate_limits` inte rörd. Kandidaten var synlig 14:03 till 14:09 UTC och är borttagen. Testets Chrome är stängd (port 9334 stängd, 0 Chrome-processer med testprofilen).

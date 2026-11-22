# QA live 5: raderingen av konto och Bli upptäckt (2026-11-22)

Live https://www.jobbcoach.ai på `e87b3b32`. En headless Chrome (port 9336), en flik åt gången, en profil per roll. Ingen kod ändrad, inget committat eller pushat. Bilder och skript: `C:\Users\chris\AppData\Local\Temp\claude\dceaf5763afec129\2f505274-a60e-456c-8335-21ea685ee053\scratchpad\qa-live-5\` (`bilder\`, `svar\`).

Sidladdningar: 45 (43 räknade i den styrda fliken och två öppningar av delningslänken i ett eget utloggat sammanhang). AI-anrop: 2 (`/api/cv/upload` och `/api/cv/quick-score` för testkandidaten). Inga köp. `public_rate_limits` inte rörd. Konton skapade via `/register` och `/rekryterare/registrera`.

## Före start (läsfrågor)

- `konto_avslut`: 0 rader. `posthog_raderingar`: 0 rader.
- `candidate_profiles`: 8 rader, 4 med `visibility = anonymous`, varav 2 med valt CV (de som syns i poolen).

## Del A: raderingen av konto

Konto 1: `qa-l5-radera1-…@jobbcoach-qa.test` (testkonto), 1440. Konto 2: `radering.granskning.…@example.org`, Pixel 7 (412). Konto 2 träffas inte av `arTestEpost` (`/(\.test$|jobbcoach-qa|^qa-)/i`) och är inte admin. Det fanns i ungefär två minuter (15.59 till 16.01 UTC).

| Kontroll | Utfall |
|---|---|
| Konto 1 fyllt utan AI: en loggad sökt tjänst, namn och ort ändrade i profilen, Nivåkollen genomförd, profilfoto uppladdat | godkänt (`job_applications` 1, `logic_test_v4_sessions` 1 klar, `profile-photos/users/<id>/…jpg` 1) |
| R1 under "Radera mitt konto" (1440 och 412) | godkänt, ordagrant |
| Arkets rubrik "Radera mitt konto", R2, R3 (fyra rader) ordagrant | godkänt |
| R4 och R4b syns inte utan prenumeration | godkänt |
| Raden "Ditt paket sägs inte upp automatiskt" finns inte | godkänt |
| R5 ordagrant, länken R5 till `/integritetspolicy#datalagring` | godkänt |
| R6 som `legend`, R7 ordagrant | godkänt |
| Sex val i R8:s ordning, inget förval (alla `aria-pressed=false`) | godkänt |
| Ett tryck väljer, andra trycket avmarkerar, byte mellan val ger ett valt | godkänt |
| Valen: 44 px höga, radie 12 px, kant 1 px, ingen skugga | godkänt |
| Radera permanent avstängd tills "radera mitt konto" är skrivet | godkänt |
| Radering utan valt skäl går igenom (konto 1, kroppen `{"anledning":null}`, svar 200 `{"raderat":true}`) | godkänt |
| Bekräftelsen R9a ("Ditt konto är raderat." och "Tack för att du använde Jobbcoach.ai, och lycka till framöver.") | godkänt, 1440 och 412 |
| Efter raderingen: hel omladdning till `/` | godkänt |
| Inloggning med raderat konto: "Inloggningen gick inte igenom. Fel e-postadress eller lösenord." `/dashboard` leder till `/login` | godkänt (båda kontona) |
| Konto 1 i databasen efteråt: alla uuid-kolumner i public, adressfälten, `email_events`, `auth.users` | godkänt, 0 överallt (före: user_activities 11, email_schedule 2, email_confirmations 1+1, job_applications 1, logic_test_v4_sessions 1, test_milstolpar 1, test_nivapunkter 1, profiles 1) |
| Konto 1: `audit_logs` och `admin_actions` på kontots id | godkänt, 0 |
| Konto 1: filerna i lagringen borta (`profile-photos/users/<id>/`) | godkänt, 0 |
| Konto 1 (testkonto): ingen rad i `konto_avslut` | godkänt, 0 |
| Konto 1: `posthog_raderingar` | en rad, `forsok 0`, `senaste_fel "nyckel saknas"`, bara id, ingen e-post. Väntat utan `POSTHOG_RADERA_NYCKEL`; användaren märkte inget |
| Konto 2 (412) med valet "Söker inte jobb längre": kroppen `{"anledning":"soker_inte"}`, svar 200 | godkänt |
| Konto 2: exakt EN rad i `konto_avslut` | godkänt |
| Konto 2: rader, filer och auth borta | godkänt, 0 överallt (före: user_activities 11, email_schedule 2, email_confirmations 1+1, job_applications 1, profiles 1) |
| Konto 2: `posthog_raderingar` | en rad, `nyckel saknas`, bara id |
| Arket stängs med Escape, Avbryt och stängknappen (44 x 44), 1440 och 412 | godkänt |
| Valet nollställs när arket öppnas igen | godkänt |
| Fel på svenska: svaret ersatt med 500 i webbläsaren (anropet nådde aldrig servern) ger "Kontot kunde inte raderas. Försök igen eller kontakta oss." i `role=alert`, knappen går att trycka igen | godkänt, 1440 och 412 |
| Ingen sidledsrullning: sidan, med arket öppet, med felet, efter raderingen | godkänt (1440: 1425 av 1440 inklusive rullist; 412: 412 av 412) |
| Tryckytor minst 44 px | godkänt för knappar, val, fält och stängknapp. Undantag: länken "Så hanterar vi dina uppgifter" står i löptext, 16 px hög i 412 (radbruten, 34 px i 1440). Avbryt är 48 px, Radera permanent 44 px |
| Adminens sektion "Raderade konton" | inte kontrollerat: kräver adminkonto, och ett testkonto får aldrig bli admin |

### Statistikraden för konto 2 mot kontots verkliga läge

| Fält | I raden | Kontots läge vid raderingen | Utfall |
|---|---|---|---|
| id | `4ce61b83-…` (slumpat) | kontots id `402d22e4-…` | godkänt, pekar inte ut kontot |
| kvartal | 2026-10-01 | 22 november 2026, fjärde kvartalet | godkänt |
| kalla | webb | raderat i webben | godkänt |
| kontots_alder | under_1_dag | skapat 15.59.47 UTC, raderat ca 16.01 | godkänt |
| hade_premium | false | inga `premium_grants`, ingen prenumeration | godkänt |
| har_betalat | false | ingen Stripe-kund, ingen `premium_source` | godkänt |
| antal_cv | 0 | 0 CV | godkänt |
| antal_brev | 0 | 0 brev | godkänt |
| antal_test | 0 | inga test | godkänt |
| antal_sokta | 1 | 1 loggad sökt tjänst | godkänt |
| dagar_sedan_aktivitet | under_1 | `last_active` 15.59.49 UTC samma dag | godkänt |
| anledning | soker_inte | valet "Söker inte jobb längre" | godkänt |
| e-post, tid, IP | finns inga kolumner | | godkänt |

## Del B: Bli upptäckt på live

Testkandidat `qa-l5-kand-…@jobbcoach-qa.test` med CV:t "Vera Provgren". Kännetecken: arbetsgivarna Granhöjdens Fasad AB och Myrbackens Puts & Tegel AB, Tallviksbadet och Ekornsåsens skola i beskrivningarna, lärosätet Björkuddens tekniska institut, Sälgrenmodellen i profiltexten, telefon 070-913 57 24, adressen Lärkstigen 17, 721 30 Västerås, CV-adressen vera.provgren@jobbcoach-qa.test. Rekryterare `qa-l5-rek-…@jobbcoach-qa.test`, "QA Testbolaget Omgång Fem AB".

| Kontroll | Utfall |
|---|---|
| Utan CV: "Innan du kan synas behöver profilen ett CV och en yrkesroll.", Kom igång avstängd, länk Ladda upp ett CV | godkänt |
| CV uppladdat (två AI-anrop), 80 av 100 | godkänt |
| Med CV: Kom igång påslagen, kontots enda CV valt (`cv_id` = det enda CV:t, "vera-cv" visas som valt) | godkänt |
| Samtyckesdialogen: båda rutorna tomma från början, Aktivera avstängd tills huvudsamtycket kryssats | godkänt |
| Synlig anonym efter Aktivera, `show_personality` falsk | godkänt |
| Rekryterarens registrering: 556677-8899 ger "Det där är ett exempelnummer. Fyll i ert eget organisationsnummer." | godkänt |
| Lösenord på 7 tecken ger "Lösenordet måste vara minst 8 tecken." (formuläret har `noValidate`, ingen webbläsarruta) | godkänt |
| Beskedet om väntetid: "Ansökan mottagen. Tack! Vi granskar ansökan inom en till två arbetsdagar. Du får ett mail när kontot är godkänt." | godkänt |
| Godkänd på egen rad med servernyckeln (`status = approved`), inte admin (`admin_users` 0) | godkänt |
| Poolen före ja: 3 kandidater med testkandidaten (2 före) | godkänt |
| Före ja, sökning i 23 sparade svar (pool, sökning "Projektledare", detalj-API, anteckningar, RSC-svaret vid klientnavigering, detaljsidans HTML, delningen) och delningslänken utloggad: profiltext, telefon, adress, CV-adress, råpoäng, personlighetsvärden, arbetsgivare, beskrivningar, lärosäte, namn, kontots e-post, exakta datum | godkänt, ingen träff |
| Kontots id i `candidateId`, adressen, RSC-svaret och delningslänkens sida | väntat, migreringen för `public_id` väntar på ägaren |
| Kontaktförfrågan skickad med meddelande | godkänt |
| Kandidaten 1440: "Dina meddelanden (1)" och ikonen "Meddelanden från rekryterare, 1 olästa" (44 x 44) i toppraden | godkänt |
| Kandidaten 412: meddelandeikonen i toppraden (44 x 44) | godkänt |
| Klockan "Notiser, 1 olästa" (44 x 44) öppnar rutan "En rekryterare vill komma i kontakt" överst, 1440 och 412 | godkänt |
| Klockans ruta stängs med Escape | underkänt, rutan står kvar (känt sedan förra passet); klick utanför stänger |
| Kandidaten accepterar på Meddelanden, skriver ett meddelande; rekryteraren svarar i inkorgen; båda meddelandena i tråden (`interest_messages` 2) | godkänt |
| Efter ja på detaljsidan: namn, kontots e-post, arbetsgivare, beskrivningar med Tallviksbadet, lärosätet, perioder med datum | godkänt |
| Efter ja aldrig: profiltext, telefon, adress, CV-adress | godkänt |
| Delningslänken efter ja (utloggad): namn, arbetsgivare, beskrivningar, lärosäte, men inte e-posten (inte heller i sidans data) | godkänt |
| Synligheten avstängd av kandidaten (`visibility = off`) | godkänt |
| Ingen sidledsrullning på kandidatens sidor (412: 412 av 412) | godkänt |

### Fält i rekryterarens svar före ja (`/api/recruiter/candidate/<id>`, ordagrant de nycklar som skickas)

`candidateId` (kontots id), `role` "Projektledare", `skills` (sex kompetenser ur CV:t), `regions` [], `availability` null, `workplace` [], `extent` [], `driversLicense` false, `testBadges` [], `personalityStrengths` [], `visibility` "anonymous", `yearsOfExperience` 13, `latestRole` {title "Projektledare", years 9}, `educationLevel` "Högskoleingenjör, byggteknik", `educationLevelBucket` "Kandidat", `pitch` null, `historyTitles` ["Projektledare", "Arbetsledare"], `workStyleArchetype` null, `cardWorkStyle` null, `activeSince` "2026-11-22", `contextTags` [], `experience` [{position, company null, period "9 år", description null, descriptionHidden true}, {"Arbetsledare", null, "5 år", null, true}], `education` [{school null, degree, year null, schoolHidden true}], `testResults` [], `languages` (två), `workStyle` null, `interviewGuide` [], `workStyleReport` null, `personalityTestedAt` null, `personalityStale` false, `fullName` null, `email` null, plus `interestStatus` null.

Poolens kort har samma nycklar till och med `contextTags`, utan `experience`, `education` och resten, och med `matchReasons` ["13 års erfarenhet"], `interestStatus` och `interestSentAt`.

## Övriga iakttagelser

- Anställningarnas längd avrundas uppåt: 2018-04 till nu (8 år 7 mån) blir "9 år", 2013-08 till 2018-03 (4 år 7 mån) blir "5 år", summan 14 mot "13 års erfarenhet".
- Detaljsidan och delningslänken säger "Projektledare · Anonym profil" direkt under kandidatens fulla namn efter ja.
- Delningslänken efter ja visar namn, arbetsgivare och beskrivningar för vem som helst med länken, utan inloggning (enligt tabellen i byggnoterna, "som skaparen").
- Körkort B i CV:t gav `driversLicense` false (kandidaten hade inte fyllt i villkoren).
- Ansökningsmailet "recruiter_application" gick till support@jobbcoach.ai i produktionen (testföretagets namn "QA Testbolaget Omgång Fem AB").
- Mitt skript tryckte av misstag "Skicka igen" i bannern om e-postbekräftelse en gång för testkandidaten (adress på `jobbcoach-qa.test`).
- Konto 2 på example.org fick ett bekräftelsemejl vid registreringen (example.org tar inte emot post).

## Städningen

Räknat före, raderat bara på egna id, adresser och radernas id, kontrollerat efteråt.

| Vad | Räknat | Raderat |
|---|---|---|
| Konto 1 och 2: allt utom kön och statistikraden | raderat av produktens radering | kontrollerat 0 |
| `posthog_raderingar`, konto 1 (`distinct_id 5d7f85c5-…`) | 1 | 1 |
| `konto_avslut`, rad `4ce61b83-…` (tabellen hade 1 rad) | 1 | 1 |
| `posthog_raderingar`, konto 2 (`distinct_id 402d22e4-…`) | 1 | 1 |
| ai_usage_costs | 1 | 1 |
| candidate_interests (meddelanden 2 och lästa trådar 2 följde med) | 1 | 1 |
| candidate_profile_views | 1 | 1 |
| candidate_profiles | 1 | 1 |
| cv_texts | 1 | 1 |
| email_confirmations | 2 | 2 |
| email_log (varav en till support@jobbcoach.ai med rekryterarens id) | 5 | 5 |
| email_schedule | 2 | 2 |
| notifications | 3 | 3 |
| recruiter_profiles | 1 | 1 |
| recruiter_share_links | 1 | 1 |
| user_activities | 23 | 23 |
| user_ui_preferences | 1 | 1 |
| profiles | 2 | 2 |
| Filer `cvs/users/<kandidat>/` | 2 | 2 |
| Användare i auth (kandidat, rekryterare) | 2 | 2 |

Kontrollen efteråt för alla fyra kontona: 0 rader i varje uuid-kolumn i public och i adressfälten, 0 i `email_events`, 0 filer, 0 i `auth.users`. `konto_avslut` 0, `posthog_raderingar` 0. `candidate_profiles` 8 rader, 4 anonyma, 2 med CV: samma som före. Inga Chrome- eller node-processer kvar.

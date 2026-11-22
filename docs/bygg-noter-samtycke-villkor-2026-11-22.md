# Samtycket för sökbara styrkor, policyns avsnitt om Bli upptäckt och villkor för rekryterare (2026-11-22)

Gren `design/publikt-omgang3`, arbetskopian `C:\Users\chris\cvbrev-publikt3`. Ägarens beslut 2026-11-22, lydelserna ordagrant. Ingen push. Underlag: `docs/juridik/konsekvensbedomning-bli-upptackt-utkast-2026-11-22.md`.

## Överst: det som avviker eller ägaren bör veta

1. **Ingen migrering behövdes.** Avsluta kontakten använder det befintliga värdet `declined` på `candidate_interests.status` och en markör med tidpunkt i kandidatens egen rad i `user_ui_preferences` (`kontakt_avslutad:<intressets id>`, `{ avslutad_at }`), skriven av servern. Kandidaten kan i teorin radera sin markör under RLS; då visas samtalet som avböjt i stället för avslutat, men kontakten är fortfarande stängd och profilen anonym. Ett eget statusvärde (`ended`) i CHECK-villkoret vore renare och kräver en migrering.
2. **Det enda godkända rekryterarkontot i produktionen saknar godkända villkor.** Det stoppas vid nästa besök i portalen tills villkoren kryssats i, och alla poolens rutter svarar 403 `villkor_saknas` tills dess.
3. **Villkoren, punkt 7:** "kan ångra ett ja genom att säga det till dig eller till oss". Kandidaten kan nu också avsluta kontakten själv i Meddelanden. Texten införd som den står.
4. **Policyn, "Väljer du Öppen profil visas detta utom e-postadressen redan innan du tackat ja"** stämmer med koden (`accessFor`: Öppen profil låser upp arbetsgivare, beskrivningar, lärosäte, examensår, datum och namn, e-post kräver ja). Delningslänkens fjorton dagar stämmer (`SHARE_LINK_TTL_DAYS = 14`). Inga avvikelser i policytexten.
5. **Tidpunkten för villkoren** sätts av servern med Node-klockan (`new Date()`), inte databasens `now()`. Lokalt låg den 1,1 s före radens `created_at` (klockskillnad mellan maskinen och databasen).
6. **Texter jag lagt till utöver ägarens** (korta etiketter som funktionerna behöver): i kandidatens Meddelanden "Kontakten avslutad", pillret "Avslutad" och raden "Du har avslutat kontakten." i tråden; i rekryterarens inkorg märket "Avslutad"; i portalens villkorsruta rubriken "Villkor för rekryterare" och felraden "Det gick inte att spara. Försök igen."
7. **Ett test faller som inte är mitt:** `src/lib/plans/__tests__/nio-vakt.test.ts` hittar "nio kalkylatorer" i `src/lib/delningsbild.ts:35` (delningsbildernas commit `aba0b6f8`, den andra agentens område). Inte rättat.

## Del A, kandidaten (commit `4eff132f`, rättning `461b0288`)

- Punkt 1 till 4: dialogen, resultatkortet (båda raderna), `WORKSTYLE_DISCLAIMER` i `workStyle.ts` och taggkortet, ordagrant.
- Punkt 5, frågan: nya samtycken sparas med `consent_version = 'v2'` (`components/samtycke.ts`). Rutan visas när profilen visar styrkor, samtycket har en annan version än v2 och raden `user_ui_preferences.bli_upptackt_styrkor_sokbara` saknas. Svaret sparas där: `{ svar: 'fortsatt' | 'sluta', svarat_at, fraga: '2026-11-22', kalla: 'rutan' | 'kortet' }`. Sluta visa stänger av `show_personality` och `show_full_workstyle`. Slår en v1-kandidat på styrkorna i resultatkortet (med den nya texten) sparas svaret med `kalla: 'kortet'` och frågan ställs inte. Rutan ligger överst i panelen Bygg din profil, i den gröna tonen (`Notis ton="ton"`).
- Punkt 6, Avsluta kontakten: `POST /api/candidate/interests/end` kontrollerar att intresset är kandidatens eget och accepterat, skriver markören och sätter `declined` (409 annars, 404 för någon annans). `GET /api/interests/[id]/messages` läser en avslutad tråd och svarar `stangd: true`; POST kräver fortfarande `accepted`. Rekryterarens inkorg (`avslutadAt`), tråd och profilsida visar "Kandidaten har avslutat kontakten.". Knappen sitter i trådens huvud i Meddelanden (den enda listan över förfrågningar), bekräftelsen i `Ark`.

## Del B, publikt (commit `5eff1c61`)

Matchningsdemon (Annan styrka, raden Styrka, topp 25 och 10 %; utfallet detsamma: full träff, annan region miss, högre testkrav miss eftersom 15 > 10, annan styrka miss), FAQ-svaret, `/for-rekryterare` med länk till villkoren, policyns avsnitt 5 och omnumreringen (hänvisningarna till cookies är nu avsnitt 6). `lastUpdatedDate` stod redan på 2026-11-22.

## Del C, rekryterare (commit `13a13c27`)

- `/for-rekryterare/villkor`: Textmall, öppen sida, i sajtkartan som användarvillkoren (yearly, 0.3), egen title, description (156 tecken), canonical och openGraph. `VILLKOR_VERSION = '2026-11-22'` i `src/lib/recruiter/villkor.ts`.
- Registreringen: kryssrutan, knappen avstängd utan kryss. Efter ansökan anropas `POST /api/recruiter/villkor` som sätter tid och version med servernyckeln (utkastet före e-postbekräftelsen bär kryssat). Portalen: status-rutten svarar `villkorGodkanda`, layouten visar rutan med kryss och Fortsätt, `requireApprovedRecruiter` svarar 403 `villkor_saknas` (alla rekryterarrutter utom status, ansökan och villkoren).
- Hjälpraden under Arbetsstil (en rad under båda personlighetsgrupperna).
- `runPoolSearch(..., { inkluderaDolda })` räknar `utanPersonlighet`: klarar alla övriga krav, och för varje påslaget personlighetsfilter antingen träff eller ingen visad styrka respektive arbetsstil. Den som visar andra styrkor räknas inte. Bevakningsmejlet tar aldrig med dem. Raden i träfflistan i ental, flertal och visat läge.
- `completenessScore` utan styrkepoängen.
- Delningslänken: `getSharedCandidate` kräver att skaparens `recruiter_profiles.status` är `approved`.
- Anteckningar: GET och PUT kräver en synlig profil (`findVisibleProfile`), 404 annars; raden raderas inte.
- Tester: `vagar-fore-ja.test.ts` (Avsluta kontakten, delningslänken, anteckningen, räknaren, kompletthetspoängen) och `villkor.test.ts`.

## Grindar

- `tsc --noEmit`: 0 fel.
- Hela vitest: 421 filer gröna, 1 röd (nio-vakt, se Överst 7), 3 hoppade; 5 308 test gröna, 1 rött, 13 hoppade.
- `next build --webpack` (`NODE_OPTIONS=--max-old-space-size=6144`): grönt två gånger, 814 sidor.
- SEO-grinden mot `next start -p 3417`, 501 sidor i nio delar, jämfört med `publikt-omgang3-efter-live-6.json`: 501 av 501 svarade 200, **Fel 0**. Undantag i `scripts/seo-baslinje/villkor-rekryterare-2026-11-22-undantag.json`: 6 RUBRIK_BYTT (policyns omnumrering), 1 RUBRIK_NY (avsnitt 5), 1 LD_UNDANTAG (FAQPage på /verktyg/bli-upptackt). og:image-skillnaderna täcktes av delningsbildernas egna undantag. Rapport `docs/qa/seo-diff/villkor-rekryterare-2026-11-22-diff.md`, avtryck `...-efter.json`, nya sidan `...-ny-sida.json` (200, 9 h2, 15 länkar, 444 ord, ingen JSON-LD). `/integritetspolicy` 1 967 till 2 233 ord.

## Klicktestet (lokalt `next start` mot produktionens databas, 1440 och 412)

Konton: kandidat via `/register`, rekryterare via `/rekryterare/registrera`, en andra kandidat skapad med servernyckeln utan webbläsare (CV-raden kopierad från den första testkandidaten, inget AI-anrop). AI-anrop: 2 (en CV-uppladdning). Personlighetsprofilen inlagd på testkontots egen rad. Sökordet "Sälgrenmodellen" i testkandidaternas pitch så att bara de kunde träffas i räknartestet. Bilder: `C:\Users\chris\AppData\Local\Temp\claude\dceaf5763afec129\2f505274-a60e-456c-8335-21ea685ee053\scratchpad\villkor-qa\bilder\`.

- (a) `a01`, `a02`: dialogens rad ordagrant, båda rutorna tomma, aktiverad med styrkor: `consent_version v2`, ingen ruta efteråt. `a03`, `a04`: Nivå 1-raden och taggkortets rad.
- (b) Kontots egen rad satt till v1 med styrkor: rutan i 1440 och 412 (`b201`, avancerad text), Fortsätt visa sparade `{svar: fortsatt, svarat_at}` och rutan kom inte tillbaka efter omladdning. Grundtest och Sluta visa i 412 (`b301`): grundtextens mening, `show_personality` falsk, svaret `sluta` sparat, ingen ruta efter omladdning.
- (c) `c01` till `c04`: knappen avstängd utan kryss, Enter skickade inget, inget konto skapat; med kryss: ansökan mottagen, `villkor_godkanda_at` och `villkor_version 2026-11-22` sparade. Godkänt konto med villkoren nollade på egen rad: rutan i 412 och 1440 (`c05`), poolen 403 `villkor_saknas`, Fortsätt släppte in (`c07`), poolen 200, villkoren sparade. Hjälpraden (`c08`). Raden i ental (`c09-ental`, "1 kandidat till …", "Visa även den kandidaten" gav 2 kandidater och "Du ser också …", "Dölj dem" tillbaka till 1), flertal i 1440 och 412 (`c09-flertal`, `c10`, `c11`). Ingen sidledsrullning i 412.
- (d) Intresse, ja och meddelande; profilsidan efter ja visade arbetsgivare, beskrivning och e-post. Avsluta kontakten i 412 (`d05`, Avbryt stängde) och 1440 (bekräftad): `declined`, markören sparad. Rekryteraren: profilsidan anonym ("Visas efter accepterad kontakt", inga arbetsgivare) med raden (`d11`), inkorgen "Avslutad" och raden, tråden utan skrivfält med raden (`d09`), POST till tråden 409. Kandidaten: samtalet kvar i listan som Avslutad (`d10`).
- (e) Anteckning sparad via gränssnittet; profilen dold på kandidatens egen rad (inte via kandidatens reglage): GET 404, PUT 404, PUT tom 404, raden kvar i databasen (`e02`).
- (f) Delningslänken öppnades medan skaparen var godkänd; skaparens status satt till pending på egen rad: "Länken har upphört" i 1440 och 412 (`f-02-ej-godkand`), sedan godkänd igen.
- (g) En visning loggad. Bli upptäckt "1 visning av profilen" och översikten "Din profil har visats en gång." i 1440 och 412 (`g01` till `g03`). 0 rader med 42501 i serverns logg.

## Städningen

Räknat först, raderat bara på de tre kontonas id och adresser: ai_usage_costs 1, candidate_interests 1 (meddelanden och lästa trådar följde med), candidate_profile_views 1, candidate_profiles 2, cv_texts 2, email_confirmations 2, email_log 5, email_schedule 2, notifications 3, recruiter_candidate_notes 1, recruiter_profiles 1, recruiter_share_links 1, user_activities 79, user_personality_profile 1, user_ui_preferences 3, profiles 3, filer i `cvs` 3, användare i auth 3. Kontrollen efteråt: 0 överallt. Synliga profiler i poolen efteråt: 4, som före. `public_rate_limits` och `posthog_raderingar` inte rörda. Inga servrar eller Chrome kvar.

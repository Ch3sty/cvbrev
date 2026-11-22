# De fem rättningarna efter klicktestet på live (2026-11-22)

Underlag: `logg-qa-live.md` ("Övrigt") och `logg-qa-rattat.md` ("Det jag lät vara"). Ägarens beställning: "Fixa detta". Arbetskopia `C:\Users\chris\cvbrev-publikt3`, grenen `design/publikt-omgang3` från main `b66ebe61`. Inget pushat. **Ingen migrering behövs**: allt är löst med kolumnerna som finns. Inga priser, gränser, juridiska texter eller mejlmallar är rörda.

Skärmbilderna ligger i scratchpad: `C:\Users\chris\AppData\Local\Temp\claude\dceaf5763afec129\2f505274-a60e-456c-8335-21ea685ee053\scratchpad\fem\klick\bilder\` (nedan `bilder\`).

| Commit | Vad |
|---|---|
| `2f85c385` | Punkt 2: lagringen vid utloggning, nycklarna setItem och getItem |
| `8f96b1a0` | Punkt 1: originalfilen från Ditt CV |
| `f88468b6` | Punkt 3: Till kontot i menyn och flödesskalen |
| `0a19f85f` | Punkt 4: Kom igång och aktiveringen för det som följer med in i kontot |
| `ab07f9cc` | Punkt 5: Matchade jobb utgår från CV:ts ort |
| `180c8705` | Tillägget: cookieraden i grundens form |

## 1. Originalfilen

- **Orsak:** ingen kod skapade en länk till filen i den privata hinken `cvs`, så vyn hade ingen väg dit.
- **Byggt:** `GET /api/cv/originalfil?cv=<id>` (`src/app/api/cv/originalfil/route.ts`). Läser CV-raden med användarens session (RLS och filter på `user_id`), kräver att vägen ligger i kontots egen mapp `users/<id>/` och har en filändelse (`src/lib/lagring/originalfil.ts`), och skickar vidare (302, `no-store`) till en signerad länk som gäller i 60 sekunder, skapad med samma session så att lagringens regler prövar ägarskapet igen. `?ladda=1` ger nedladdning med filnamnet hon laddade upp. Annars 404 med en kort sida och "Tillbaka till Ditt CV" (länken öppnas i en egen flik). Utan inloggning: till `/login` med vägen tillbaka. Aldrig `getPublicUrl`.
- **I vyn:** Ditt CV får en rad bland raderna längst ned: "Originalfilen", "Filen du laddade upp", filnamnet, knappen "Öppna originalfilen" (ny flik; "Öppna filen" på telefon) och textlänken "Ladda ner". Raden visas bara när CV:t har en fil i kontots mapp; byggarens CV (`ai-improved/`), provsidornas (`prova/`) och CV utan väg får ingen knapp.
- **Kontroll:** konto 1 laddade upp klicktestets PDF. Raden syns (`1-13-originalfil-rad-1440.png`, `1-15-originalfil-rad-412.png`, ingen sidledsrullning). "Öppna originalfilen" öppnade PDF:en i en ny flik (`1-14-originalfil-oppnad-1440.png`): rutten svarade 302 till den signerade länken, som gav `application/pdf`, 52 521 byte. `?ladda=1` gav `Content-Disposition: attachment; filename=test-testsson-cv.pdf`. Den signerade länken svarade 400 när minuten gått. Konto 2, med konto 1:s CV-id: 404 "Vi hittar inte originalfilen" både för öppna och ladda ner, ingen länk skapad (`1-16-annat-konto-nekas-1440.png`). Test: `src/lib/lagring/__tests__/originalfil.test.ts`, `src/app/api/cv/originalfil/__tests__/route.test.ts`.

## 2. Lagringen vid utloggning, och nycklarna setItem och getItem

- **Orsak till setItem och getItem:** `src/lib/supabase/storage-sanitizer.ts` tilldelade nya funktioner till `setItem` och `getItem` direkt på `localStorage` och `sessionStorage` vid varje sidladdning. Ett Storage-objekt har en namngiven setter: tilldelningen blir en sparad nyckel med funktionens källkod som värde, och metoden på prototypen står kvar. Lappningen gjorde alltså inget utom att skriva nycklarna. Den är borttagen, och de kvarlämnade nycklarna tas bort när värdet är en funktions text (`rensaFelskrivnaNycklar`). Den oanvända `storage-adapter.ts` hade samma fel och är borttagen.
- **Orsak till nycklarna efter utloggning:** ingen utloggning rensade något.
- **Kartläggningen** (`src/lib/lagring/kontoLagring.ts`): varje nyckel appen skriver, ur 47 filer. Kontots (rensas): utkasten (`jc_cv_prova`, `jc_jobb_prova`, `jc_sokt_prova`, `jc_sokt_forifyllt`, `jc_coach_fraga`, `jc_brev_annons`, `jc_pending_*`, `jc_prova_resultat_v2`, `jc_smakprov_*`, `flow:*`, byggarens reserv, rekryterarens utkast, arbetsstilens svar, brevets förifyllning), Jobbcoachens samtal, summeringen per konto (`dashboard_summary_v1_*`), Matchade jobbs sparade sökning, Zustand-lagret `cv-store`, och val och stängda rutor i vyerna (`jobbcoach_uiflag_*`, `nasta-steg-*`, `feature-spotlight-dismissed-*`, `v4_*`, `jc_komigang_dold` med flera). Webbläsarens (står kvar): `tema`, hemskärmsfrågan (`jc_pwa_*`), registreringens ingång, besökarens demoräkning, appens notisfråga, startlänk och onboarding (`testklar.onboarding`), `kampanj_nu` och de stängda klisterknapparna. Cookiesamtycket är en cookie; Supabase (`sb-*`) och mätningen (`ph_*`) rörs inte.
- **Byggt:** AuthProvider rensar kontots nycklar vid `SIGNED_OUT`, och de fem utloggningsknapparna (profilmenyn, Inställningar, radera kontot, appen, rekryterarsidan) gör det direkt efter `signOut`. Nyckeln `jc_lagring_agare` bär kontots id: loggar ett annat konto in rensas först det förra kontots nycklar, och laddas en sida utan session medan en ägare står kvar (utloggad i en annan flik, sessionen gick ut) rensas de då, innan besökaren fyller i något nytt. Utan ägare står besökarens utkast kvar och följer med in i hennes nya konto.
- **Kontroll:** efter registreringen fanns inga nycklar `setItem` eller `getItem`. Före utloggningen hade konto 1 `jc_cv_prova` och `jobbcoachen_conversation_id` (planterade som det förra kontots utkast), `jc_lagring_agare`, `dashboard_summary_v1_<id>` och `jc_flodets_ursprung`; efter "Logga ut" i profilmenyn stod bara `jc_pwa_first_seen_at` och PostHogs nyckel kvar, och `sessionStorage` var tom (`2-01-profilmeny-fore-utloggning-1440.png`, `2-02-efter-utloggning-1440.png`). Konto 2 registrerades i samma webbläsare: lagringen hade bara den egna summeringen och ägaren med konto 2:s id, inget av konto 1:s (`2-05-konto2-landning-1440.png`). Test: `src/lib/lagring/__tests__/kontoLagring.test.ts` (rensningen, inloggning med annan ägare, besökarens utkast till nytt konto, utan session, de felskrivna nycklarna, och två test som läser källkoden: varje fil som skriver i lagringen ska vara känd och varje nyckel klassad, och ingen kod får tilldela något på lagringsobjektet).

## 3. Till kontot i menyn och flödesskalen

- **Orsak:** varken menyn (`LandingNavbar`), flödesskalet (`PubliktFlodesskal`), auth-sidornas kort eller provets startskärm frågade om någon var inloggad; länkarna var fasta.
- **Byggt:** `src/components/publikt/v3/Inloggad.tsx`. Inloggningen läses i klienten ur AuthProvider (som bara laddar Supabase när det finns en sessionscookie), så serverns HTML är densamma för alla och den som inte är inloggad ser inget byte. Båda lägena står i samma rutnätsruta och det dolda döljs med `visibility`, så rutan har samma bredd före och efter. I serverns HTML står kontorutan utan adress (ingen länk till `/dashboard` på varje sida för sökmotorerna). Inloggad ser "Till kontot" i menyn, i telefonmenyns fot (en knapp i full bredd), i toppraden på registreringen, inloggningen och auth-sidorna, och på provets startskärm.
- **Kontroll (inloggad, konto 1 och 2):** `/cv-mallar/prova?hamta=1` och `/priser` i 1440 och 412: synligt bara "Till kontot" till `/dashboard` (`3-inloggad-cv-mallar-prova-hamta-1-1440.png`, `-412.png`, `3-inloggad-priser-1440.png`, `-412.png`, telefonmenyn `3-inloggad-telefonmeny-412.png`). Bytet skedde 172 till 264 ms efter start. Rutan står på samma plats och med samma bredd i båda lägena (1440: x 1068, bredd 224; 412: x 209, bredd 127). Layoutskiften: 0 på `/priser` i 1440 och på båda sidorna i 412. Vid första besöket på `/cv-mallar/prova` i 1440 mättes ett skift på 0,0004 vid 221 ms, före bytet (264 ms) och samtidigt som typsnitten blev klara (228 ms); utloggad gav samma sidor 0 med typsnitten redan i cachen. Jag bedömer det som typsnittsbytet, inte kontorutan. Utloggad: "Logga in" och "Skapa konto" som förut, ingen flimmer, `data-inloggad` sattes aldrig (`3-utloggad-*.png`). Skalen inloggad: "Till kontot" på `/auth/forgot-password`, provets start och `/login` i båda bredderna (`3-skal-*-1440.png`, `-412.png`). Test: `src/components/publikt/v3/__tests__/inloggad.test.tsx` (serverns HTML utan kontolänk, båda lägena, telefonmenyn, skalen, CSS:en).
- **Inte ändrat:** provets resultatsida (`ProvResultatSida`). Dess "Logga in" bär provets token till kontot; byts den mot Till kontot tappar en inloggad besökare provet. Två publika sidor skickar dessutom en inloggad vidare till kontot (`/verktyg/cv-analys`, `/cv-mallar`), som förut.

## 4. Kom igång och aktiveringen

- **Orsak, två saker:** (a) gratislistan utan val (profil, sökt tjänst, CV, analys, mall, Nivåkollen) har ingen brevbricka, och den som kommer från startflödet registrerar sig i smakprovsläget och svarar aldrig på vad hon vill börja med; brevet räknades i underlaget men syntes aldrig, därav "0 av 6". (b) Claim-rutten satte varken `first_letter_created_at`, onboardingsteget `create_letter` eller brickan (`onboarding_steps` och PostHogs `onboarding_step_completed`).
- **Byggt:** `src/lib/onboarding/forsta-handling.server.ts` samlar kvitteringarna som kontots egna rutter gör. Claim-rutten kvitterar brevet (milstolpen, onboardingsteget, brickan och en rad `letter_created` med `kalla: publikt_startflode`). Valkommen-sidan sparar valet brev när brevet hämtats hem och kontot saknar ett val (`/api/onboarding/track` med `baraOmTomt`, som bara skriver där kolumnen är tom; rutten är fortfarande den enda som skriver kolumnen), och läser om summeringen efter hämtningen, eftersom layouten läste den innan något hämtats.
- **De andra flödena:** den sökta tjänsten kvitterades redan (`skapa.ts`, `ska-sokas`) och står i listan utan val. CV:t till matchningen och från `/cv-mallar` (`/api/cv/prova/hamta`) och byggarens första sparning (`save-improved` utan original, startbladet) räknades i Kom igång genom `cv_texts`, men satte varken milstolpen, onboardingsteget eller brickan, och `save-improved` kvitterade "uppdaterat efter genomgången" för ett nytt CV, också när sparningen misslyckades. Nu räknas de som kontots CV, efter att raden finns. De får inget härlett val: valen cv och jobb saknar `cv_upp`, så ett val hade flyttat det de gjort ur listan.
- **Kontroll:** konto 1 skrev ett brev i startflödet (Björk, Professionell, annonsen; ett AI-anrop), "Skapa konto och läs brevet", landade på brevet. I databasen: `onboarding_intent` brev, `first_letter_created_at` satt, `onboarding_steps` med `brev`, `onboarding_steps_completed` med `create_letter`, och raden `letter_created` med källan. Kom igång via klientnavigering (utan omladdning): "1 av 7", "Skriv ett personligt brev" bockad, "Analysera ditt CV" föreslaget nästa (`1-10-kom-igang-1440.png`). Från och med nu; inga historiska rader ändrade. Test: `src/lib/onboarding/__tests__/forsta-handling.test.ts`, `src/app/dashboard/valkommen/__tests__/hamtkedjan.test.ts`, `src/app/api/onboarding/track/__tests__/route.test.ts`, `src/app/api/cv/save-improved/__tests__/komigang.test.ts`, och claim-testet.
- **Inte i webbläsaren:** Kom igång i 412 (`/dashboard` skickar ett nytt gratiskonto vidare till Ditt CV, och jag hittade ingen annan väg till listan i telefonen under passet). Siffran står i sidomenyn i 1440 och kommer ur samma summering.

## 5. Matchade jobb utgår från CV:ts ort

- **Orsak:** vyn och matchningen faller redan tillbaka på CV:ts ort (`active_cv_for_matching.extracted_location`) när sökprofilen saknar ort, men den orten skrivs bara av modellens tolkning i `parse-cv-for-matching` och blev tom: CV:t från provsidan bar orten i strukturen men inte i texten (den publika tolkningen läste inte orten förrän i dag), och en ort utan postnummer kan modellen missa.
- **Byggt:** `src/lib/jobmatching/cvOrt.ts` läser orten lokalt, först strukturens kontaktfält och sedan kontaktblocket i texten (samma regel som den publika tolkningen), och godtar bara en av Sveriges kommuner. `cvOrt.server.ts` fyller i den på det aktiva CV:t när tolkningen lämnat den tom och sparar den på raden, så att `match-jobs` och de andra vyerna utgår från den. Sidan, `/api/jobbmatchning/*` och nya `GET /api/jobbmatchning/aktivt-cv` (som Matchade jobb läser efter att ett CV lästs in, i stället för tabellen direkt i webbläsaren) går genom den. Sökprofilens orter går alltid före och ändras som i dag ("Ändra").
- **Kontroll:** konto 1:s uppladdade CV lästes in för matchningen (ett AI-anrop); modellen hittade själv Göteborg, och vyn visade "Från ditt CV: Göteborg" (`5-01-matchade-jobb-1440.png`). För att pröva reserven satte jag `extracted_location` till null på testkontots egen rad och laddade om: servern fyllde i Göteborg ur CV:t, vyn visade "Ort i CV:t: Göteborg" och "Från ditt CV: Göteborg", och raden i databasen hade Göteborg igen (`5-02-matchade-jobb-ort-ur-cv-1440.png`, `5-03-matchade-jobb-412.png`). Matchningen kördes inte. Test: `src/lib/jobmatching/__tests__/cvOrt.test.ts`.

## Tillägget: cookieraden

- **Orsak:** på publika sidor hade raden trådens form: Acceptera var en bläckknapp (`--ink-1`, publikt `#1A1A1F`) på en panel med skugga.
- **Byggt:** i `globals.css`, bara på publika sidor (sidans färg, menyns gissning, flödesskalen, provets start): vit panel med kant överst och ingen skugga, Acceptera i koppar med klack, Avvisa vit med kant och klack. Samma ram, storlek, vikt och textstorlek på båda. Höjder, plats och avstånd orörda; text, länk och samtyckets logik orörda; inloggat oförändrat.
- **Kontroll:** startsidan och `/priser` (mörka) och `/integritetspolicy` (ljus) i 1440 och 375: raden 56 respektive 94 px hög i botten, som förut; båda knapparna 120 × 44 (1440) och 168 × 44 (375) (`banner-start-mork-1440.png`, `-375.png`, `banner-priser-ljus-1440.png`, `-375.png`, `banner-integritet-ljus-1440.png`, `-375.png`; `/priser` visade sig ha mörk topp, därför den tredje sidan). Test: `src/components/samtycke/__tests__/publikt-form.test.ts`.

## Testkonton och AI-anrop

| Konto | Id | Användes för |
|---|---|---|
| 1 | `0c836638-c693-4174-ad16-0ecb8741885b` | Brevet från startflödet, Kom igång, uppladdning och originalfilen, Matchade jobb, menyn inloggad, utloggningen |
| 2 | `14789f6e-ee98-47af-8dec-3fcccf90f270` | Lagringen efter kontobyte, intrångsförsöket på originalfilen, skalen inloggad |

AI-anrop, tre, ett per flöde: brevutkastet (`/api/public/letter-draft`), CV-uppladdningen (`/api/cv/upload`), inläsningen för matchningen (`parse-cv-for-matching`). 49 sidladdningar mot den lokala servern, ett flöde i taget; inga 5xx, bara de väntade 404:orna i intrångsförsöket.

## Städningen

Räknat först, sedan raderat per id, adress och utkastets token (samma skript som klicktestet på live, `scratchpad\fem\klick\stada.mjs`):

| Vad | Räknat | Raderat |
|---|---|---|
| `user_activities` | 41 | 41 |
| `email_schedule` | 4 | 4 |
| `email_confirmations` | 2 | 2 |
| `active_cv_for_matching` | 1 | 1 |
| `ai_usage_costs` | 1 | 1 |
| `cv_texts` | 1 | 1 |
| `letters` | 1 | 1 |
| `public_letter_drafts` (token `acc37b5c…`) | 1 | 1 |
| Filer i `cvs` under `users/<konto 1>/` | 2 | 2 |
| `profiles` | 2 | 2 |
| Användare i auth | 2 | 2 |

Kontrollen efteråt: 0 profiler, 0 användare, 0 filer, 0 schemalagda mejl, 0 utkast, 0 aktiviteter, 0 i `email_events` och `email_log`; en ny torrkörning gav 0 rader och 0 filer. IP-gränsens rad (`::1`) är inte rörd. Två bekräftelsemejl gick till `@jobbcoach-qa.test`, som inte finns.

## Grindarna

| Grind | Minne ledigt före | Resultat |
|---|---|---|
| `npx tsc --noEmit` | 1,8 GB (under 3 i två minuter, körd ändå) | 0 fel |
| `npx vitest run` | 3,4 GB | 394 filer gröna, 3 överhoppade (pglite); 4 871 test gröna, 13 överhoppade, 0 röda |
| `next build --webpack` (6 GB heap) | 3,2 GB | klart, slutkod 0, 237 s |
| `next start` på 3417, puppeteer-core med Chrome | 3,2 GB | allt ovan i 1440 och 412 (cookieraden också 375) |

Efteråt: servern och Chrome stängda (port 3417 och 9333 fria), `.next` borttagen. `arbetsyta.mjs`: 3,6 GB ledigt, en arbetskopia, ingen server igång.

## Det som återstår

- Ingen migrering, inget steg före push utöver det vanliga.
- Kontot får inget härlett val för CV-flödena och den sökta tjänsten (se punkt 4); de räknas i listan utan val.
- Ett brev från startflödet räknas inte mot veckans gratisbrev ("Ditt gratisbrev för veckan är inte använt" efter claim). Det är en gräns och lämnas till ägaren.
- På auth-sidornas kort står fortfarande "Kom du ihåg ditt lösenord? Logga in" inne i kortet också för en inloggad; det är kortets text, inte menyn.

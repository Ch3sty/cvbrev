# Logg P3b: det publika brevflödet fullt ut (publikt omgång 3)

Byggt 2026-11-22 på `design/publikt-omgang3` i `C:\Users\chris\cvbrev-publikt3`. Ingen commit, ingen push. Ingen dev-server, ingen build, ingen webbläsare, inga anrop mot produktionen eller databasen. Ersätter beslut 6 i `logg-p3.md` ("mallen följer INTE med"), som ägaren underkände.

**Migrering: ingen behövs.** `letters` har redan `mall_id`, `body_stycken`, `tonality`, `job_description` och `language` (brevrummet och generate-preview skriver dem). `public_letter_drafts` är orörd. Valet bärs i webbläsaren bredvid utkastets token, som CV-flödet gör (SEO:s besked 16: "mallen sparas bredvid utkastets token som för CV:t").

## Förebilden: så bär CV-flödet arbetet in i kontot

- `/cv-mallar/prova`: CV:t och mallen ligger bara i webbläsaren, `localStorage` under `jc_cv_prova` i 24 timmar (`src/lib/cv/mallval/utkast.ts`). Efter kontot, i samma flik, postar `ProvaArbetsyta` utkastet till `/api/cv/prova/hamta` (rad i `cv_texts`), och nedladdningen eller kassan fortsätter med samma mall.
- CV-starten: `"yrke:mall"` som smakprov (`cv_start`) i `sessionStorage` och i `/register?cv_start=`, genom cookien `jc_signup` och valkommen-sidan till `claimPendingCvStart`, som landar i `/dashboard/skapa-cv?mall=<id>&yrke=<yrke>`.
- Brevet före omgången: token i `sessionStorage` (`jc_pending_draft`) och `/register?draft=<token>`, cookien `jc_signup`, `/dashboard/valkommen` kör `claimPendingDraft`, och claim skrev brevet som ren text utan mall (öppnades i den gamla formen).

## Flödet steg för steg, som det fungerar nu

1. **Visaren** (exempelsidorna och artiklarna, `BrevVisare.tsx`): knappen heter "Använd som mall". Linne (första vyn, den i serverns HTML) ger samma adress som förut: `/skapa-brev/start?yrke=<yrke>` på exempelsidorna, `/skapa-brev/start` i artiklarna. Annan mall: `&mall=<id>` (redan byggt i P3, oförändrat). Hjältens och kommentarskortets länk på exempelsidorna är orörda, ordagrant `/skapa-brev/start?yrke=<yrke>`.
2. **Säljsidan** (`/verktyg/personligt-brev`, lyftkortet): annonsfältet är ett riktigt fält (`AnnonsFalt.tsx`). Trycket på "Skriv ett brev nu" (samma länk till `/skapa-brev/start` som förut, i serverns HTML) lägger annonsen i fliken, `sessionStorage` under `jc_brev_annons`. Ingenting i adressen, ingenting på servern.
3. **Startflödet** (`/skapa-brev/start`): `page.tsx` kontrollerar `?mall=` mot alla 40 i brevets katalog (okänd: Linne) och räknar listan med namn, nivå, filteregenskaper och miniatyr. `StartFlow` läser och tar bort annonsen ur fliken och fyller fältet ("Annonsen du klistrade in följde med."). Mallraden står alltid överst ("Mallen du valde" när mallen kom med eller byttes, annars "Mall" med Linne) med "Byt mall". Väljaren har alla 40, filtren och Gratis/Vald. Tonen väljs bland de fem (förval Balanserad, som i kontot). Arket i brett läge är besökarens brev i mallen, ritat av brevmotorn.
4. **Skriv mitt brev**: samma anrop till `/api/public/letter-draft` som förut, plus `ton`. Rutten tar bara emot de fem tonerna (auto, som ingår i Premium, och okända ger förvalet). IP-gränsen (`public_rate_limits`, tre per dygn), dygnstaket och minimilängden är oförändrade. Utkastet sparas i `public_letter_drafts` som förut, och bara första stycket kommer tillbaka.
5. **Spärren**: arket visar första stycket i mallen och tomma streck. Raden om mallen: "Brevet öppnas i Koppar, mallen du valde" (Premiummall), "Brevet sparas i Björk, mallen du valde" (vald gratismall), "Brevet sparas i Linne" (förvalet). "Byt mall" finns under arket också här. Token sparas som förut (`sessionStorage`, `/register?draft=`), och bredvid den **mall, ton och annons** i `localStorage` under `jc_pending_draft_val`, knutet till token, i sju dagar (utkastets livslängd). Byts mallen efter utkastet skrivs valet om. `localStorage` och inte `sessionStorage`, så att valet överlever en bekräftelselänk i en ny flik.
6. **Registreringen**: oförändrad (lösenord och Google, cookien `jc_signup`, `/dashboard/valkommen`).
7. **Claim** (`/dashboard/valkommen` kör `claimPendingDraft`): klienten läser valet för just den token och skickar `{ token, mall, ton, annons }`. Servern (`claim/route.ts`, regler i `claim-brev.ts`) validerar allt igen: mallen mot katalogen, tonen mot de fem, annonsen kapas vid 8000 tecken. Behörigheten läses med `userHasAccess(..., 'any')` som i brevrummet. Brevet skrivs i brevrummets format: `body_stycken` (utkastets text delad med `styckenFranText`, som generate-preview), `mall_id`, `tonality`, `job_description` (annonsen, så att kraven går att läsa ut i kontot), `language: 'sv'`, och `content` ritat i mallen med `ritaRad` (avsändaren ur profilen, efter alla AI-anrop). Valet tas bort efter svaret (inte vid 401, då försöker valkommen igen).
8. **Landningen**:
   - ingen mall, Linne eller Björk på gratisnivån, eller vilken mall som helst med betald behörighet: brevet sparas i mallen och kontot landar på `/dashboard/mina-brev/<id>`, där brevet ritas i `mall_id`;
   - Premiummall på gratisnivån: brevet sparas i Linne (`farSparaMall`, samma regel som brevrummet) och kontot landar på `/dashboard/mina-brev/mallar?brev=<id>&mall=<id>`, där brevrummet visar "Du provar mallen Koppar". Nedladdning kräver Premium som förut; inga nya gränser.
   - Samma konto som redan hämtat utkastet: samma brev, ingen ny rad, samma landning.

Vad som sparas var: annonsen från säljsidan i fliken tills startflödet öppnas; utkastet i `public_letter_drafts` (oförändrat); token i fliken och adressen; mall, ton och annons i webbläsarens `localStorage` tills claim; brevet i `letters` först efter kontot.

## Filer jag har ändrat

Inom paketet (P3):
- `src/app/(public)/skapa-brev/start/page.tsx`: alla 40 mallar med filter och miniatyr, `?mall=` mot katalogen, platshållaren i Arbetsgivare ur exempelbrevets arbetsgivare när yrket har en (SEO:s besked 16), texterna med tal ur katalogen.
- `src/app/(public)/skapa-brev/start/StartFlow.tsx`: mallen i state, mallraden med Byt mall, väljaren (egen `<dialog>`), tonvalet, annonsen från säljsidan, arket i mallen (iframe) med det enkla arket som reserv, valet bredvid token, spärrens rader, `template` och `ton` i mätningen.
- `src/app/(public)/skapa-brev/start/ark.ts` (ny): arket i mallen med platshållare och tomma streck, via `ritaArk` ur exempelrutten.
- `src/app/(public)/skapa-brev/start/skapa-brev-start.css`: mallraden, tonen, arket i mallen, väljaren.
- `src/app/(public)/verktyg/personligt-brev/page.tsx`: hjälten med sju krav (sex besvarade), numrerade i brevet och på lappen, Nordhaga Bygg; kravpanelen med samma sju krav och citat; annonsfältet; steg 2:s bild "+4 krav".
- `src/app/(public)/verktyg/personligt-brev/AnnonsFalt.tsx` (ny, klient): fältet och fångsten av trycket.
- `src/app/(public)/verktyg/personligt-brev/personligt-brev.css`: fältet, kravbilden.
- `src/components/publikt/brevvisare/texter.ts` (`anvand: 'Använd som mall'`), `BrevVisareArtikel.tsx` och `src/components/publikt/innehall/exempel/MallValjare.tsx` (knappens text), `BrevVisare.tsx` (kommentar).

Delad kod och motor (utanför paketets sidor):
- `src/app/api/public/letter-draft/claim/route.ts`: valet, brevrummets format, landningen (se ovan).
- `src/app/api/public/letter-draft/route.ts`: tar emot `ton` (bara de fem).
- `src/app/api/public/letter-draft/ark/route.ts` (ny): POST, ritar arket. Ingen AI, ingen databas, `no-store`.
- `src/lib/letters/public-draft.ts`: `ton` till `generateCoverLetter` (förval `professional`, som förut).
- `src/lib/letters/claim-brev.ts` (ny): reglerna för claim, rena och testade.
- `src/lib/letters/publikt-brev-val.ts` (ny): annonsen och valet i webbläsaren.
- `src/lib/letters/claim-draft-client.ts`: `claimPendingDraft` skickar valet och städar. Signaturen är oförändrad; utan sparat val skickas bara token, som förut.
- `src/lib/analytics/events.ts`: valfria `template` och `ton` på `sample_started`/`sample_completed`, `template` på `draft_claimed` (bara tillägg).

Inloggad kod: ingen ändrad. Brevrummet läses (Mallar med `?brev=&mall=`, `farSparaMall`, `ritaRad`, `hamtaBrevProfil`, `TONER`, `mallarKatalog`) men rörs inte.

## Besluten

1. **Bära valet utan ny kolumn**: `localStorage` bredvid token, som CV-provet (`jc_cv_prova`). En kolumn `mall_id` på `public_letter_drafts` hade gett statistik men krävt migrering; mätningen får i stället `template` i PostHog (`sample_started`, `sample_completed`, `draft_claimed`).
2. **Miniatyrerna för de 32 utan brevbild**: skriptet `scripts/brevmallar-miniatyrer.ts` startar Puppeteer (en headless Chrome), och byggbriefen förbjuder webbläsare under bygget, så det kördes inte. Att rita 40 ark i iframes i väljaren är för tungt. Väljaren visar därför brevets egen miniatyr för de åtta som har en och mallens CV-miniatyr för de 32 andra (samma proportioner, samma som brevrummets väljare gör i dag), med raden "Bilderna visar mallen på ett brev eller ett CV. Ditt brev får mallens huvud, typsnitt och färger." Det sanna brevet i mallen syns på arket bredvid så fort mallen valts (brett läge) och efter utkastet (alla bredder). **Före push, när datorn tål det**: `npx tsx scripts/brevmallar-miniatyrer.ts --prov <id,...> --ut <mapp>` kan rita de 32; då flyttas de till `public/mallar/brev/` och läggs in i `BREV_MINIATYRER` i `page.tsx`.
3. **Arket i mallen** ritas på servern (POST `/api/public/letter-draft/ark`) med `ritaArk` ur `/api/public/exempel/brev/rita.ts`, alltså samma ritning som visarens exempelbrev, och visas i en iframe (`srcdoc`). POST så att fälten aldrig hamnar i en adress. Hämtas bara när arket syns: från 1000 px i startläget, alltid efter utkastet. Medan det laddas och om rutten inte svarar står det enkla arket som förut. Platshållarna i avsändaren och tomma streck i stället för text; strecken sätts in efter ritningen, så att brevmotorn är orörd.
4. **Tonen** finns i startflödet: motorn för det publika utkastet tog redan en ton (`generateCoverLetter`), rutten tar nu emot en av de fem. Auto (Premium) visas inte och tas inte emot. Förval Balanserad, som kontot. Inga nya gränser: samma IP-gräns, samma tak. Det gör säljsidans "Du väljer ton innan brevet skrivs" sann också utan konto (Stämmer inte 51).
5. **Annonsen följer med till brevet** som `job_description`, så att brevrummet kan läsa ut kraven ur den som för ett brev skrivet i kontot. Annonsen sparades inte på servern före kontot förut och gör det inte nu.
6. **Väljaren** är en egen `<dialog>` (grunden säger att inloggade komponenter inte importeras): webbläsarens fokusfälla och Esc, fokus tillbaka till Byt mall. Ett tryck markerar, "Använd Koppar" (vit knapp) väljer. Inget lås och inget köpsteg, alla 40 går att välja och provas.
7. **Hjälten på säljsidan**: grundens `Brevpar` med sju krav, sex besvarade, Nordhaga Bygg (påhittad), brevets text ur `nytt-innehall.md` med numren i texten och på lappen (CSS-räknare, grunden orörd). Kravpanelen längre ned har samma sju krav och citat ur samma brev, så att bilderna säger samma sak (6 av 7). Steg 2:s bild "+4 krav".
8. **Ingen rad i undantagsfilen**: knapptexten i visaren byts från "Skriv ditt eget brev" till "Använd som mall" på 89 exempelsidor (bara när visaren är öppen, klientkod) och i 22 artiklar (första vyn i serverns HTML). Länkmålet är detsamma, och undantagsfilen säger att länktexter inte behöver rader. Ordantalet ändras med ett ord per artikel.

## Ny text utan godkännande

- "Bilderna visar mallen på ett brev eller ett CV. Ditt brev får mallens huvud, typsnitt och färger." (väljaren)
- "Brevet sparas i Linne" (spärren när ingen mall valts; nytt-innehall har bara formerna med "mallen du valde")
- Tonvalets etikett "Tonen" och de fem tonernas namn och underrader är kontots (`brev3/arbete/texter.ts`), inte nya.
- Säljsidans hjälte: kravlappens sju namn och brevets tre stycken är `nytt-innehall.md`:s, med Nordhaga Bygg i stället för Sweco.

Ur `nytt-innehall.md` (godkänt): mallraden ("Mallen du valde", "Mall"), raderna under arket, spärrens tre rader ("Hela brevet, att läsa, kopiera och ändra" med BRV-1), arkets `aria-label`, väljarens "Välj mall", "Stäng", "Filtrera mallar", filtren, raden om Linne och Björk, "Gratis", "Vald", "Använd Koppar", "Annonsen du klistrade in följde med.", annonsfältets etikett och platshållare, hjältens `aria-label`.

## Testat och hur

- `npx vitest run` på de berörda filerna, en process: 14 filer, 182 tester, alla gröna. Nya: `src/lib/letters/__tests__/claim-brev.test.ts` (11: mall, provad Premiummall, betald, ton, annons, format), `src/lib/letters/__tests__/publikt-brev-val.test.ts` (9: annonsen en gång, valet per token, sju dagar, claim-klienten skickar valet och städar, 401 behåller valet), `src/app/api/public/letter-draft/claim/__tests__/route.test.ts` (7: rutten med mockad Supabase, brevet ritat på riktigt), `src/app/(public)/skapa-brev/start/__tests__/ark.test.ts` (5: arket i mallen, strecken, escaping, spärrens rad). Uppdaterad: `BrevVisareArtikel.test.tsx` (knappen heter "Använd som mall", Linne ger `/skapa-brev/start` utan `mall=`). Körda för att se att inget annat gått sönder: `src/lib/letters` (motorn, brevmallarna, Word), `src/components/registrering`, `src/app/api/public/exempel`, `src/components/brev3/mallar`.
- `npx tsc --noEmit`, en gång i slutet (2,9 GB ledigt): inga fel.
- Inte gjort (byggbriefen): dev-server, build, webbläsare, SEO-diff, anrop mot databasen.

## Det slutgranskningen måste klicka igenom i en webbläsare

1. Exempelsidan för projektledare: Byt mall, välj Koppar, "Använd som mall". Adressen ska vara `/skapa-brev/start?yrke=projektledare&mall=koppar`. Med Linne vald: `/skapa-brev/start?yrke=projektledare`.
2. Startflödet på 1440: mallraden "Mallen du valde: Koppar", arket bredvid i Koppar med "Ansökan: Projektledare", tjänsten och arbetsgivaren följer fälten efter en kort paus. Arket ska fylla sin ruta utan rullning och utan vit kant (iframens skalning i `srcdoc`, typsnitten laddas).
3. Byt mall: dialogen öppnas med alla 40, filtren fungerar, Esc och Stäng stänger, fokus tillbaka på Byt mall. Pixel 7: dialogen nedifrån, rutnätet rullar, foten med "Använd ..." syns.
4. Tonvalet: fem knappar, en vald, ryms på 375 px.
5. Skriv ett brev (testkonto, lokal server, IP-gränsens egen rad): spärren visar första stycket i mallen på arket (också på telefon, arket först), "Brevet öppnas i Koppar, mallen du valde". Byt mall i spärren byter arket.
6. Skapa konto med lösenord: landningen ska vara Mallar med brevet och "Du provar mallen Koppar"; tillbaka till brevet ska det stå i Linne. Ladda ner ska visa Premiumspärren som i dag. Samma med Björk: landar på brevet i Björk. Samma via Google.
7. Säljsidan: klistra in en annons i lyftkortet, "Skriv ett brev nu": startflödet öppnas med annonsfältet utfällt och ifyllt och raden "Annonsen du klistrade in följde med." Adressen är `/skapa-brev/start` utan annonsen.
8. Säljsidans hjälte på 375, 412 och 1440: sju krav på lappen med nummer 1 till 7 (det sjunde streckat), numren i brevets text, brickan "6 av 7". Lappens rader får inte gå utanför på 375.
9. Brevrummet för ett vanligt inloggat brev (skriv brev, Mallar, prova en Premiummall): oförändrat.

## Kvar och för andra

- `src/components/registrering/registrering-copy.ts` (P1): smakprovets rad "Brevet sparas på kontot. Du landar på det direkt." är fortfarande sann (Premiummallen landar i Mallar med brevet öppet), men kunde säga mallen. Inte ändrad.
- Claim sätter fortfarande inte `first_letter_created_at` och onboardingsteget `create_letter` (som före omgången). Ett brev från startflödet räknas därför inte som första brev i aktiveringsmåtten. Inte ändrat, eftersom det påverkar mätningen bakåt; saas-lead bör ta ställning.
- `StartFlowIllustrations` används inte (P5 städar, som i `logg-p3.md`).

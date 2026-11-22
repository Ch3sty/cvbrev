# Rättningarna efter klicktestet på live (2026-11-22)

Underlag: `logg-qa-live.md` (felen F1 till F5 och "Övrigt"). Arbetskopia `C:\Users\chris\cvbrev-publikt3`, grenen `design/publikt-omgang3` från main `7c54bc66`. Inget pushat, inga konton, inga AI-anrop, inga mejl skickade, inget mot produktionen.

Kodändringarna ligger i en commit, `ec753134`. Det var tänkt som tre commits, men PowerShell 5.1 delade meddelandena vid citattecknen, så de två första misslyckades medan filerna redan låg i indexet, och den tredje fick med allt. Jag skrev om meddelandet (`--amend`, lokalt, aldrig pushat) så att det täcker alla ändringar. Ingen reset, checkout eller stash.

## Felen

### F1. Telefonnumret i den publika CV-tolkningen
- **Orsak:** `swedish-cv-content-parser.ts`, `/(\+46|0046|0)[\s-]?[1-9][\d\s-]{7,10}/` räknade tecken, inte siffror. "070-000 00 00" har elva tecken efter "07", och sista siffran föll bort. Sedan gjorde normaliseringen om numret till "+46 70-000 000".
- **Ändring:** ny `SVENSKT_TELEFONNUMMER` som räknar 7 till 9 siffror efter nollan (eller efter +46/0046, med valfritt "(0)"), högst ett mellanslag eller bindestreck mellan siffrorna, inget tal, plus, bindestreck, snedstreck eller punkt direkt före, och ingen siffra direkt efter. Ett postnummer eller årtal efter numret slukas inte: nio siffror är taket, och räcker inte siffrorna till ett helt tal backar mönstret. `normaliseraTelefon` behåller numret som det står (mellanrummen jämnade), grupperar bara ett mobilnummer helt utan mellanrum ("0701234567" blir "070-123 45 67") och skriver 0046 som +46. Siffrorna ändras aldrig.
- **Kontroll:** `src/lib/cv/__tests__/telefon-och-ort.test.ts`: "070-123 45 67", "070 123 45 67", "0701234567", "070-000 00 00", "+46 70 123 45 67", "+46 (0)70-123 45 67", "+46701234567", "0046 70 123 45 67", "08-123 456 78", "031-12 34 56" och "0480-123 45" läses hela, både fristående och mitt i en kontaktrad med lodstreck. Postnummer och årtal efter numret slukas inte. Datum, årtal, postnummer och personnummer blir inget nummer. Klicktestets egen PDF (`test-testsson-cv.pdf`) lästes också med `extractTextFromPdf` och `parseSwedishCVContent` via tsx: telefon "070-000 00 00", ort "Göteborg", texten "bygg- och". Rutten `/api/public/cv/tolka` provades **inte** lokalt: den skriver IP-gränsen i produktionsdatabasen och anropar Gemini. Testerna och PDF-körningen får räcka.

### Samma tolkning: orten
- **Orsak:** regelparsern läste bara ort med postnummer framför ("411 05 Göteborg"). Klicktestets CV hade "Projektledare | Göteborg | e-post | telefon". Kontots uppladdning läser orten med `extractContactLocally` (kontaktblocket mot Sveriges kommuner), och därför fungerade det där.
- **Ändring:** regelparsern tar orten med `extractContactLocally(text).city` när det inte finns något postnummer. `tolka.server.ts` lägger den redan i `personalInfo.address`, och `lastUrCv` på jobbmatchningen läser den därifrån.
- **Kontroll:** testet "läser telefonnumret hela och orten utan postnummer" (ger "Göteborg") och "behåller postnummer och ort när de finns" (ger "411 05 Göteborg").
- **Inte kontrollerat:** om Matchade jobb väljer orten av sig själv efter registreringen ("Ingen ort vald" i B1). Den väljs ur kontots egna preferenser, och den kedjan har jag inte rört.

### Samma tolkning: "byggoch"
- **Orsak:** `cleanExtractedText` (`src/lib/cv-parser/text-utils.ts`) slår ihop ord med bindestreck och mellanslag inom en rad, `(\w)-\s+(\w)`, för att laga avstavning. Svenska sammandragningar som "bygg- och anläggning" blev "byggoch". Samma regel finns i `docx-parser.ts`. Det gäller också kontots uppladdning, men där skrevs texten om av strukturen.
- **Ändring:** ingen ihopslagning när nästa ord är och, eller, samt, respektive, resp, som, till, med eller utan. Annan avstavning ("infra- struktur") slås fortfarande ihop. Samma regel i båda filerna.
- **Kontroll:** testerna i `telefon-och-ort.test.ts` ("bygg- och", "för- eller", "heltids- till" står kvar; "infra- struktur" och "projekt- ledare" slås ihop) och PDF-körningen ovan.

### F2. Startflödet för brev sade två saker om gratismallarna
- **Ändring:** ny `src/app/(public)/skapa-brev/start/mallrader.ts`. Mallraden för en gratismall är nu "Gratis att skriva och spara brevet i. Nedladdning som PDF och Word ingår i Premium." Den står i panelens mallrad, under arket (nu också för en vald mall i stället för "Den är gratis, även som Word.") och i väljarens fot. Premiummallarna har kvar "Ingår i Premium, även som Word.". Väljarens rad överst: "Linne och Björk är gratis att skriva och spara brev i. De övriga 38 ingår i Premium, och du provar dem med ditt eget brev. Nedladdningen ingår i Premium i alla mallar." Talen och namnen kommer ur katalogen och `paketKort()`. Mallvisarens `namnradMening` och raderna på exempelsidorna och i artiklarna är orörda.
- **Väljaren:** samma motsägelse fanns där ("Linne och Björk är gratis." och "Gratis, även som Word." i foten), och den är rättad. Brickorna "Gratis" på miniatyrerna och filtret "Gratis" står kvar: de är etiketter, och raden över dem förklarar dem.
- **Kontosteget:** `/register?draft=` säger "Skapa konto och läs hela brevet" och "Brevet sparas på kontot. Du landar på det direkt." Ingen motsägelse, inget ändrat.
- **Sant mot koden:** `api/letters/download` kräver `letter_download` för varje mall (402 annars).
- **Kontroll:** `__tests__/mallrader.test.ts` (ingen rad i katalogen säger "gratis, även som Word" eller "Den är gratis"; varje gratisrad säger "ingår i Premium"). Skärmbilder i 375 och 1440, före och efter att väljaren öppnats. Utkastet skrevs inte, eftersom det kräver ett AI-anrop. Raden under arket efter utkastet kommer ur samma `mall.rad` som raden före utkastet, som syns i bilderna.

### F3. Lösenordsmejlet hade en tom rund ikon
- **Ändring:** hela `<div>` med den runda plattan borta (M25).
- **Kontroll:** testet "har ingen tom rund ikonplatta kvar". Ritat i 600 px: ingen cirkel, och 0 element med `border-radius: 50%`.

### F4. Bekräftelsemejlet hade kvar kuvertemojin
- **Ändring:** plattan med ✉️ borta. Alla mallar i `src/lib/email/**` är genomsökta efter emoji och bildsymboler (också som HTML-entiteter). Det enda fyndet var ✉️. Typografiska tecken står kvar: pilen i knapparna (`&rarr;`, "→", husets knappstil i alla mallar), punkterna i listorna och mittpunkten i sidfoten. Interna mejl hade inga emoji. Textversionen av bekräftelsen hade "© 2024 Jobbcoach.ai" (fel år, samma sak som M27 rättade i HTML:en). Den raden är borttagen.
- **Kontroll:** testet "har ingen kuvertemoji och ingen ikonplatta", testet "textversionen har inget gammalt år" och en genomsökning i testet av varje `.ts`-fil under `src/lib/email` (utom testerna) efter emoji. Ritat i 600 px.

### F5. Lösenords- och bekräftelsemejlet var 630 px breda
- **Orsak:** huvudtabellen hade `width="600"` inne i en cell med 15 px utfyllnad på var sida.
- **Ändring:** `width="100%"` och `width: 100%; max-width: 600px`, samma mönster som livscykelmallarnas skal. Inga andra mallar har fast bredd (sökt efter `width="…"`). Livscykelskalet har max 560 och flytande bredd.
- **Kontroll:** 14 mallar ritade och fotograferade i 600 px: `scrollWidth` är 600 för alla 14, och ingen har emoji.

### 6. Loggan "Jobbcoach  .ai"
- **Orsak:** `.rg-logga` är `inline-flex` med `gap: 10px`, och "Jobbcoach" (en textnod) och `<span>.ai</span>` blev två flexdelar med 10 px emellan.
- **Ändring:** ordet i ett eget `<b>` som i menyn (`LandingNavbar`), i `AuthKortSkal.tsx` (Glömt lösenordet och de andra auth-sidorna) och `PubliktFlodesskal.tsx` (inloggning och registrering), plus `.rg-logga b { font-weight: inherit; }`.
- **Kontroll:** uppmätt i webbläsaren: avståndet mellan "Jobbcoach" och ".ai" är 0 px på /login, /register och /auth/forgot-password i både 375 och 1440. Bilderna visar loggan hel.

### 7. Ur "Övrigt"
- **Dina brev utan CV:** `nastaSteg` (`src/lib/letters/lage.ts`) säger "Brevet är skrivet mot annonsen." när kontot inte har något CV, och "… mot annonsen och ditt CV." när det har ett. Testet finns i `brevrummet-motor.test.ts`.
- **Kvotväggsmejlet:** koden skickar vid tredje träffen på sju rullande dagar (`recordQuotaWall`). Ämnet är nu "Du har slagit i taket tre gånger på sju dagar" och texten "… tre gånger de senaste sju dagarna." Det är ett utlöst mejl, ingen kampanj. Testet finns i `qa-live-mejl.test.ts`.
- **Gratisnivåmejlet:** listan står nu direkt efter "Det här ändras:" och före knappen, genom det nya valet `noteForeKnappen` i `layout.ts` (utan valet ser alla andra mallar ut som förut). Ämnesraden är orörd. Testet kontrollerar ordningen, och bilden visar den.
- **Kom igång-mejlet:** rubriken var brickans avbockade titel ("Profilen ifylld"; samma fel för "CV uppladdat" och "CV-analysen körd"). Nu används knappens ord som rubrik ("Fyll i profilen", "Ladda upp CV:t", "Kör CV-analysen") och kortformen i uppräkningen i mallmejlet (där stod förut "profilen ifylld" och "cv-analysen körd" bland det som var kvar). Titlarna i kontots lista är orörda. Testet finns i `qa-live-mejl.test.ts`, och bilden visar "Fyll i profilen".

## Det jag lät vara
- **Smaksaker:** platshållaren "Volvo Cars" i kontots Sökta tjänster (ett riktigt företag, men en platshållare). Avståndet mellan "Det här ändras:" och rutan i gratisnivåmejlet är något stort. Sidfötterna i lösenords- och bekräftelsemejlet har " - " mellan namnet och devisen ("Jobbcoach.ai - Din AI-drivna karriärpartner"), som läses som ett tankstreck. Det är gammal mejltext och lämnas till ägaren.
- **Utanför uppdraget, kräver beslut eller utredning:** originalfilen går inte att öppna i vyn (en ny funktion). `sessionStorage` och `localStorage` behåller nycklar efter utloggning, och nycklarna `setItem` och `getItem` i `localStorage` tyder på kod som skriver `localStorage['setItem']`. React-fel #418 på 404-sidan för en adress som inte finns. Sidhuvudet på `/cv-mallar/prova?hamta=1` visar "Logga in" fast man är inloggad. Kom igång står på 0 av 6 efter brevet från startflödet (känt sedan P3b). Raden "CV-analysen, gratisnivån" bockas inte av när poängen har setts. Matchade jobb väljer inte orten ur CV:t av sig själv.
- **Pilen i mejlknapparna** ("Bekräfta e-postadress →", `&rarr;` i de andra): husets knappstil och ingen bild. Den står kvar.

## Grindarna
`arbetsyta.mjs` kördes före varje grind.

| Grind | Minne ledigt före | Resultat |
|---|---|---|
| `npx tsc --noEmit` | 2,6 GB (under 3, körd ändå) | 0 fel |
| `npx vitest run` | 3,6 GB | 384 filer gröna, 3 överhoppade (pglite); 4 817 test gröna, 13 överhoppade, 0 röda |
| `next build --webpack` (6 GB heap) | 3,6 GB | klart, slutkod 0 |
| `next start` på port 3417 och puppeteer-core med Chrome | | 4 sidor i 375 och 1440, alla 200 (Glömt lösenordet 304 i andra varvet), ingen sidledsrullning; väljaren fotograferad i båda bredderna; 14 mejl i 600 px, alla 600 breda, 0 emoji, 0 runda plattor |

Efteråt: servern stoppad (port 3417 fri), Chrome stängd av skriptet, `.next` borttagen. `arbetsyta.mjs` visade 4,8 GB ledigt och en arbetskopia, och ingen server var igång. Bilderna och skripten ligger i scratchpad `rattat\` (`bilder\`, `foto.mjs`, `mejl\rita.ts`, `pdftext.ts`).

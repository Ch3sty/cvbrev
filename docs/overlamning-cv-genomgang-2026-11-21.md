# Överlämning: CV-genomgången, det som återstår

Skriven 2026-11-21 till den agent som tar över. Läs hela innan du gör något. Ägaren har stängt sessionen som byggde det här, så det som står här och i `docs/bygg-noter-cv-rummet.md` (tabellen "Efter genomgången") är allt underlag som finns.

## Läget i en mening

Webbappen är live på main `6c7ab596` (Vercel grön), men de tre edge-funktionerna är inte driftsatta, databasändringen är inte körd och inget är provat i produktion efter pushen.

## Vad som är byggt

- **Genomgången på Analys** (`/dashboard/cv-analys`): rubriken "{kvar} poäng kvar till 100", sju delar i dokumentordning med poäng per del, vad som saknas, Jobbcoachens förslag och "Öppna i CV:t". Kortet "Vägen till 100". Introt namnger vilket CV som analyseras.
- **Poängmodell version 2** (`src/lib/cv/poang/`, `docs/poangmodell-cv-analys.md`): kontaktuppgifterna läses som arket ritar dem, rimligare trösklar, "[antal] procent" räknas först när talet är ifyllt.
- **Inlästa roller** ritas och räknas på personens egna meningar (`rollensRader` i `src/lib/cv/poang/matt.ts`), och instruktionen till inläsningen i `src/lib/cv/cv-parser.ts` ber om meningarna ordagrant.
- **Låset på analysjobben:** `cv_analysis_jobs.result` läses bara med service role på servern. Migreringen finns men är inte körd.
- **Bildbaserad PDF** läses av på vår egen server med tesseract.js. Sidbilder skickas aldrig till modellen.
- **Sidfelet "Maximum update depth exceeded"** i arbetsläget är rättat (`src/app/dashboard/skapa-cv/blad/Ram.tsx`).

## Regler som gäller dig

- Produktionsdatabasen är liten och har gått ner av testlast. En webbläsare åt gången, inga parallella körningar, få analyser.
- Testkonton skapar du själv och raderar per user_id efter att ha räknat raderna. Aldrig radering med tidsfönster, aldrig andras rader.
- Driftsätt aldrig edge-funktioner med `--no-verify-jwt`.
- Rör aldrig texter om datalagring, integritet eller villkor utan ägarens uttryckliga ja i din session.
- I gränssnittet: svenska, aldrig ordet AI (produkten heter Jobbcoachen), inga tankstreck, aldrig Sparkles-ikonen.
- Arbetskopian `C:\Users\chris\cv-rls` och grenen `samlad/cv-genomgang-2026-11-21` togs bort i städningen 2026-11-21, allt låg i main. Behöver du en arbetskopia: skapa en ny bredvid rotmappen enligt reglerna som visas vid sessionsstart (`node scripts/arbetsyta.mjs`). Med node_modules som junction gäller: kör aldrig npm install där, och bygget kräver att `turbopack.root` och `outputFileTracingRoot` tillfälligt sätts till `C:/Users/chris` i `next.config.ts`. Återställ filen efteråt.

## 1. Släppet som återstår, i den här ordningen

Ordningen får inte ändras. Webbappen (steg 0) är redan ute.

1. **Driftsätt de tre funktionerna** `analyze-cv-background`, `optimize-linkedin` och `parse-cv-for-matching`:
   `SUPABASE_ACCESS_TOKEN=$SUPABASE_TOKEN_JOBBCOACH supabase functions deploy <namn> --project-ref mnlrpfidyzuaxxlftruf --use-api`
2. **Kör en riktig analys i produktion direkt efteråt.** `analyze-cv-background` tar nu bara emot anrop med servicenyckeln. Blir svaret 403 och loggen säger `nekat: anropet kom inte med servicenyckeln` skiljer sig `SUPABASE_SERVICE_ROLE_KEY` mellan Vercel och funktionsmiljön. Då fungerar ingen analys för någon, så rätta det genast (framåt, eller driftsätt den förra versionen av funktionen).
3. **Prova LinkedIn-optimeringen och jobbmatchningens CV-inläsning** en gång var. De tar nu användaren ur inloggningen i stället för ur anropets innehåll.
4. **Kör migreringen** `supabase/migrations/20261121120000_cv_analysis_jobs_serverlas.sql`. Ägarens ja finns ("1) Fixa", 2026-11-21). Supabase-verktyget kan neka `revoke` och `drop`. Då används Management API med `SUPABASE_TOKEN_JOBBCOACH`. Filen har ett avsnitt "Backa" med exakt SQL.
5. **Kör** `node scripts/verifiera-analysjobb-sparr.mjs`. Det ska avsluta med kod 0 och rapportera läget efter migreringen. Före migreringen visar det läckan i punkterna (a), (b) och (d), vilket är väntat.
6. **Kontrollera att Ditt CV, Mallar, Analys och startsidan i inloggat läge laddar** efter migreringen, och titta på databasens säkerhetsråd.

Tills steg 4 är gjort kan en gratisanvändare fortfarande läsa sina egna analysjobb direkt, förbi serverns spärr.

## 2. Att testa

Inget av det här är kontrollerat efter de nio sista commitsen. Det som är kontrollerat: typkontroll, hela vitest (4105 gröna, 0 röda) och produktionsbygget på `b34ff03c`, samt ett fullt klicktest på den tidigare commiten `392a0c66`.

1. **Prestanda**, tre körningar per sida med `scripts/perf-inloggat.ts` (Pixel 7, `--samtycke`), efter en uppvärmningsträff: Ditt CV under 1,0 s, Analys under 1,5 s, CLS 0. Den enda mätningen hittills var störd av andra servrar på maskinen och gav 2432 ms respektive 5880 ms. Tidigare mätt: 1008 och 1188 ms. Ligger Ditt CV kvar över budget: mät serverns del för sig. Frågorna i `src/app/dashboard/profil/cv/page.tsx` körs redan parallellt och admin-klienten återanvänds, så orsaken syns inte i koden.
2. **Inläsningen mot modellen.** Den nya instruktionen är aldrig provad. Ladda upp `docs/qa/cv-genomgang/testa-testsson-meningar.pdf` (flyttad ur temp-mappen 2026-11-21, ignoreras av git) (två roller i löpande meningar, en med punkter). Finns filen inte kvar, gör en ny med en påhittad person. Arket ska visa personens meningar ordagrant, inget omskrivet eller påhittat, inga platshållare som [NAMN]. Leta i serverloggen efter kapat svar eller reservinläsning (svarsgränsen är höjd till 4000 token).
3. **Genomgången.** Efter en analys: ingen roll med text får "ingen beskrivning", delarnas poäng summerar till totalen, och "I dag + Våra förslag + Du själv" blir 100. Som gratis: bara den tyngsta förslagstexten är öppen, men vad som saknas i varje del syns för alla.
4. **Löftet.** Som Premium: välj alla förslag, "Ersätt mitt nuvarande CV", och kontrollera att poängen blir exakt det utlovade. Fyll sedan i [antal] och kontrollera att den blir exakt "med dina siffror". Samma tal ska stå på Ditt CV, Mallar och Analys.
5. **Arbetsläget.** Skriv snabbt 80 till 100 tecken i en rollpunkt, på dator och på Pixel 7 med strypt processor. Inget sidfel, texten står rätt i fältet och på arket, sparandet fungerar, och skrivandet hackar inte (synken sker nu före målningen vid varje tangenttryck).
6. **Granska-steget** i analysflödet: "Kvantifierat" står bara när rollen har ett riktigt tal efter förslaget, "Har [antal] kvar" när platshållaren står kvar.
7. **Bildbaserad PDF i produktion.** Ladda upp `src/lib/cv-parser/__tests__/fixturer/bild-cv-erik-lindberg.pdf`. Vercel-loggen ska ha raden `[upload] ocr ok: ... konfidens ..., ... ms`. Står det `ocr avvisad: skäl=tekniskt_fel` följde wasm-filerna eller språkdatat inte med bygget. Kontrollera också tiden mot funktionens gräns (budget 40 s i koden, `maxDuration` 120 i rutten, `vercel.json` säger 60 s för api-rutter).
8. **PDF med bara ett foto.** Den ska avvisas med ett besked på svenska där de numrerade stegen står på egna rader, i 1440 och 412.
9. **Fasen under uppladdning.** Texten "Texten i ditt CV ligger som bild. Vi läser av den, det kan ta upp till en minut." ska synas både i uppladdningszonen och i arket "Ett CV till".
10. **Allmänt under klicktestet:** inga 5xx, inga nya konsolfel (hydreringsvarningen från cookie-bannern `jc-samtycke` är känd), ingen sidledsrullning i 412, mörkt läge och mellanbredd är aldrig tittade på för de nya ytorna.

Det som inte går att testa lokalt: Deno-funktionerna typkontrolleras inte av projektets tsc.

## 3. Att fixa

Kända fel som inte är rättade. Ordnade efter hur mycket de syns.

1. **Ort utan postnummer läses inte in vid uppladdning** (`src/lib/privacy/extractContact.ts` hittar bara ort ihop med postnummer). Följd: arket saknar orten och genomgången säger "Ort saknas" fast den stod i personens CV. Det strider mot regeln att poängen ska spegla det som står i dokumentet.
2. **Arket "Ett CV till" är för brett i 412** (högerkanten och "Börja skriva" klipps), `src/components/cv/rum3/NyttCvArk.tsx`. Fanns före den här omgången. Matcha ett ark som redan fungerar i samma bredd, teoretisera inte om CSS.
3. **Rollfynd öppnar arbetsläget på avsnittet, inte på rollen.** "Öppna i CV:t" från en roll i genomgången landar på Erfarenhet utan att rätt roll är öppen.
4. **Samma läcka på andra tabeller.** `logic_test_v4_sessions` (svar och metadata går att läsa direkt, om facit går att härleda är inte utrett) och `job_matchings_cache` (användaren kan läsa och skriva sin egen cache). Kräver databasändring och därmed ägarens ja per migrering.
5. **DELETE på `/api/cv/analysis/[id]` har aldrig fungerat.** Efter migreringen svarar den 500 i stället för att låtsas lyckas. Ta bort rutten eller låt den radera med service role och användarens id.
6. **Mindre:** "goda kunskaper" i ett språk blir "Konversation"; Kalkstens förhandsvisning säger "Sida 1 av 2" för ett ensidigt CV; `cv_text` efter Ersätt ligger omaskad i databasen (maskas före varje modellanrop); `.wasm.js`-filer följer med upload-funktionens bygge trots kommentaren i `next.config.ts` (ofarligt); länken "Se genomgången." på Ditt CV är 34 px hög (står i löptext).
7. **Omaskad död kod:** kompetensutvecklingens edge-funktion (pausad, ingen anropare) och `ingest-document` skickar text utan maskning. Ta bort eller maskera innan något börjar anropa dem.
8. **Städning när allt är klart:** arbetskopian `C:\Users\chris\cv-rls` och de lokala grenarna är redan borttagna (städningen 2026-11-21). Det du själv skapar tar du bort med `node scripts/arbetsyta.mjs stada --arbetskopior`. Uppdatera sedan projektminnet `project_cv_rummet_omgang1.md`.

## 4. Att ta ställning till (ägaren beslutar)

Lägg fram de här för ägaren med en rekommendation. Bestäm dem inte själv.

1. **Integritetspolicyn.** Ägaren har sagt "Uppdatera den", men ändringen av filen nekades av behörighetskontrollen i förra sessionen. Gör den bara om ägaren godkänner ändringen i din session, annars klistrar ägaren in texten själv. Fil: `src/app/(public)/integritetspolicy/page.tsx`.
   - Avsnitt 3, de två meningarna som börjar "För personliga brev och CV-analysen byter vi först ut" och slutar "innan något kan maskas." ersätts med:
     > Innan text ur ditt CV skickas byter vi ut namn, e-postadress, telefonnummer, personnummer, födelsedatum, gatuadress, postnummer och länkar (till exempel till din LinkedIn-profil) mot platshållare, så att de uppgifterna inte följer med. Det gäller personliga brev, inläsningen av ditt CV, CV-analysen, förslagen i CV-byggaren, LinkedIn-optimeringen, jobbmatchningen och dokument du bifogar till Jobbcoachen. Där det färdiga dokumentet behöver uppgifterna sätter vi tillbaka dem hos oss efteråt. En inskannad PDF utan textlager läser vi av på vår egen server, och sidbilderna skickas inte vidare. Maskningen är automatisk: ort maskas inte, och uppgifter som är skrivna på ett ovanligt sätt kan följa med. Det du själv skriver i fritext, till exempel till Jobbcoachen eller i intervjuövningen, skickas som du skrev det.
   - Avsnitt 4, punkten om Google: "Före personliga brev och CV-analysen byts namn, e-postadress, telefonnummer, personnummer, gatuadress och postnummer ut mot platshållare." ersätts med "Innan text ur ditt CV skickas byts namn, e-postadress, telefonnummer, personnummer, födelsedatum, gatuadress, postnummer och länkar ut mot platshållare."
   - `lastUpdatedDate` sätts till dagen då ändringen görs.
   - Texten stämmer först när bildbaserad PDF är bekräftad i produktion (test 7 ovan).
2. **Användarvillkoren** (`src/app/(public)/anvandarvillkor/page.tsx`, rad 138) har en snävare mening om maskning. Den är fortfarande sann. Ska den följa policyn?
3. **Ska genomgången visas för alla CV utan att en analys startas?** I dag startas den med knapp, och gratisnivån har en analys per konto. Poängen och vad som saknas räknas utan modell och kostar ingenting, bara förslagstexterna kostar. Att visa genomgången direkt skulle svara bäst på ägarens kritik ("det är inte tydligt hur man gör en analys"), men det ändrar vad gratisnivån är.
4. **Beslut som togs åt ägaren i den här omgången** och som kan ändras: förklaringen av poängen är öppen för gratis (bara förslagstexterna är låsta), bildläsningen kan bara svenska, suddiga skanningar avvisas hellre än läses fel (konfidens under 75), och poängmodellens nya trösklar (personbeskrivning 30 till 110 ord, längd 150 till 1100 ord, samtidiga roller i valfri ordning).
5. **Befintliga användares poäng har ändrats** med version 2, och gamla uppladdade CV kan se annorlunda ut på arket (meningar i stället för nyckelord). Ägaren har sagt att ändrade poäng är okej. Utseendet på gamla CV är inte uttryckligen nämnt.

## 5. Publika sidor som kan behöva uppdateras

Ingen publik text är ändrad i den här omgången. De här beskriver analysen som den såg ut förut. Kontrollera varje påstående mot produkten innan du ändrar, och håll SEO-reglerna (titel högst 60 tecken, beskrivning 110 till 158).

**`/verktyg/cv-analys`** (störst avvikelse)
- `src/app/(public)/verktyg/cv-analys/page.tsx`: "förslag i fyra delar (personbeskrivning, roller, kompetenser, allmänna råd)", talrutan "4 delar med förslag", HowTo-stegen och schemat. Inloggat är det sju delar.
- Samma fil och `layout.tsx`: "ATS-poäng" i rubriker, metatitlar och beskrivningar. Inloggat heter den läsbarhetspoäng. Sökordet "ats-poäng" kan vara värt att behålla, så det här är en avvägning mot SEO.
- `components/cv-analys-faq-data.ts`: svaret om gratisnivån säger "det tyngsta fyndet i klartext med åtgärd". Nu ser alla vad som saknas i alla sju delar, och bara förslagstexterna utom den tyngsta är låsta. Svaret om ATS-poängen beskriver inte de sju delarna.
- "Ladda upp ett befintligt CV som PDF": inskannade PDF:er fungerar nu också, om det ska nämnas.
- `components/CVAnalysMini.tsx`: kontrollera att mini-analysen på sidan ger samma poäng som inloggat för samma CV (version 2), och att texten under den stämmer.
- `opengraph-image.tsx`: kontrollera texten i bilden.

**`/funktioner` och `/priser`**
- Kortet "Poäng per område och varje fynd med åtgärd" och gratisraden "en CV-analys med poäng och det tyngsta fyndet" (`src/app/(public)/funktioner/FunktionerSida.tsx`, `src/app/(public)/priser/components/priser-data.ts`, och den gemensamma texten som hämtas med `kort('cv-analys')` och `funktion('cv-analys')`).
- Telefonskärmen `src/components/publikt/telefon/skarmar/SkarmCvAnalys.tsx` ritar den gamla analysvyn. Även `SkarmBana.tsx` nämner analysen.

**Startsidan**
- `src/components/publikt/start/Startsidan.tsx` nämner analysen på två ställen.

**Artiklar**
- `content/artiklar/jobbcoach-online.mdx` (29 omnämnanden) och `content/artiklar/vad-ar-en-jobbcoach.mdx` (16) beskriver analysen ingående.
- `din-digitala-jobbcoach.mdx`, `bra-cv-guide.mdx`, `hur-ska-ett-cv-se-ut.mdx`, `cv-och-personligt-brev.mdx`, `vanliga-cv-misstag.mdx` och `hitta-ratt-karriarvag.mdx` har tre till fyra omnämnanden var.
- Ett fyrtiotal artiklar till nämner analysen en gång, oftast som länk. Sök på "CV-analys" i `content/artiklar/` och läs bara de meningar som påstår något om hur den fungerar eller vad som är gratis.

**Exempelsidorna**
- `src/app/(public)/exempel/components/` säger att "en CV-analys ingår per konto". Det stämmer fortfarande.

**Juridiska sidor**
- Integritetspolicyn och användarvillkoren, se avsnitt 4. Rör dem inte utan ägaren.

**Produktfacit**
- Faktagranskningen i november tog fram ett produktfacit för all text om produkten. Uppdatera det med sju delar, läsbarhetspoäng, vad gratisnivån visar och att inskannade PDF:er läses, så att nästa textomgång utgår från rätt fakta.

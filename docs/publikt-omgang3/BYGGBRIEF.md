# Byggbrief: publikt omgång 3 (2026-11-22)

Ägaren har godkänt skisserna och gett uppdraget: bygg alla skisser och alla nya sidor, agenterna beslutar om allt, och när han kommer tillbaka ska allt gå att pusha till main. Ingenting får fastna. Den här filen gäller alla som bygger.

## Mandatet

- **Besluta själv.** Stöter du på något oklart: välj det som stämmer med skissen, produktfacit och SEO-kraven, skriv beslutet i din logg och gå vidare. Fråga inte ägaren och vänta inte på någon.
- **Fastnar du på en del:** gör den enklaste lösning som är sann och hel, skriv upp vad som återstår och bygg vidare på resten. En sida som är klar till 90 procent och hel är bättre än en som väntar.
- **Ingen push.** Allt ligger kvar lokalt på grenen `design/publikt-omgang3`.
- **Det här rörs aldrig**, och det är inget hinder, det lämnas bara som det är: priser och gränser, texter om datalagring, GDPR, integritetspolicy, villkor och samtycke, mejlmallar, kassan och Stripe, databasens schema, det inloggade läget (`src/app/dashboard`, `src/components/rum`, `brev3`, `jobb3`, `session`). Behöver en publik sida en inloggad komponents utseende: rita en egen publik variant, importera inte och ändra inte den inloggade.

## Var

- Arbetskopia: `C:\Users\chris\cvbrev-publikt3`. Rör aldrig `C:\Users\chris\cvbrev`.
- Flera agenter bygger samtidigt i samma arbetskopia. Därför:
  - Ändra bara filerna i ditt paket (se Paketen). Behöver du en ändring i någon annans fil eller i grunden: skriv den i `docs/publikt-omgang3/bygg/onskemal.md` (lägg till en rad, skriv inte över) och lös det lokalt i din egen fil så länge.
  - **Committa inte** om inte ditt uppdrag säger det. Kör aldrig `git add -A`, `git checkout`, `git stash`, `git reset` eller `git clean`.
  - Skriv din logg i `docs/publikt-omgang3/bygg/logg-<paket>.md`.

## Underlaget

- Skisserna: `docs/design/publikt-omgang3/sidor/<namn>.html` (källa), `kit.css` (grunden), `delar/` (delfiler), `noter/<namn>.md` (vad som ändras, vad som kräver beslut, vilka filer bygget rör, förslag till grunden). Bygg en skiss med `node docs/design/publikt-omgang3/bygg.mjs <namn>` och läs `ut/skiss-<namn>.html`. Renderade bilder finns i `docs/design/publikt-omgang3/bilder/<namn>-<bredd>-NN.png` om mappen finns kvar: titta på dem, de visar målet.
- `docs/design/publikt-omgang3/BRIEF.md`: formens regler, textreglerna och produktfacit.
- `docs/publikt-omgang3/textbeslut.md` (slutlig lydelse för allt som var osant), `textforslag.md`, `kartlaggning.md`, `seo-krav.md`.
- **`docs/publikt-omgang3/seo-besked-skisser.md`: SEO:s besked på varje rubrikbyte, nytt block och struket påstående i skisserna, sida för sida. SEO är chef över innehållet. Beskedet gäller före skissen och före den här filens beslut där de säger olika. Ett NEJ betyder att dagens text står kvar. Läs din sidas avsnitt innan du bygger den.**
- **`docs/publikt-omgang3/bygg/seo-baslinje.md`: hur SEO-grinden körs efter bygget och åtta fällor som fäller en sida (till exempel att varje artikel i dag länkar till `/skapa-brev/start` via reklamen, och att allt bakom "Visa alla" måste stå i serverns HTML). Läs den.**
- `docs/publikt-omgang3/bygglogg-text.md`: vad som redan är infört av textbeslutet (push 1 och 2) och vad som hoppades över. Det överhoppade som ligger i dina filer tar du.
- `docs/publikt-omgang3/nytt-innehall.md` (kommer under bygget): godkänd text för allt som är nytt. Finns den inte när du behöver den, se Texten nedan.
- `docs/designsystem.md` och inloggats kod, för hur de riktiga vyerna ser ut.

## Texten: den gamla texten på nya platser

Det här är den viktigaste regeln, eftersom organisk sök är enda trafikkällan.

1. **Sidans befintliga text stannar ordagrant.** Du bygger om formen runt texten som redan står i sidans kod: rubriker (H1 till H3), stycken, FAQ, HowTo, metadata, JSON-LD, interna länkar och ankartexter. Du flyttar text till skissens platser, du skriver inte om den och du stryker den inte.
2. **Skissens text är inte källan.** Den visar formen. Där skissens text skiljer sig från sidans befintliga text gäller den befintliga, utom i tre fall:
   - posten finns i `textbeslut.md`: då gäller textbeslutet, ordagrant;
   - blocket är nytt och finns i `nytt-innehall.md`: då gäller den;
   - skissen har en ny rubrik eller ett nytt block som inte finns i någon av dem: använd skissens lydelse om den är sann mot produktfacit, och lista det i din logg under "Ny text utan godkännande", så tar SEO det i slutgranskningen.
3. **Inget ordantal får sjunka mer än 2 procent** per sida, och inga rubriker, FAQ-frågor, länkar eller schemablock får försvinna. Varje avsiktligt byte ska ha en rad i `scripts/seo-baslinje/publikt-omgang3-undantag.json` (filen finns, lägg till).
4. HowTo-steg och FAQ-frågor i JSON-LD ska stämma ordagrant med det synliga. seoTitle högst 60 tecken, description 110 till 158.
5. Tal hämtas ur kodens konstanter (`TEMPLATE_COUNT`, `FREE_CV_EXPORTS`, `PLANS`, `BREV_MALL_ANTAL` och så vidare), aldrig för hand.
6. Inga tankstreck i text. Inga emoji. Inga engelska gränssnittsord. Aldrig gnistikonen.

## Exempel och påhittat

Skisserna innehåller exempel som agenter har hittat på. De får inte gå live som om de vore produktens:
- **Testuppgifter**: hämta riktiga uppgifter ur bankerna i koden eller använd de uppgifter den publika sidan redan visar. Går det inte: använd skissens uppgift bara om du har kontrollräknat den, och lista den i loggen.
- **Tonernas exempelmeningar, LinkedIn-talen, kurvor och poäng**: använd det sidan redan visar i dag, eller statiska exempel som tydligt är exempel ("Exempel") och som inte påstår något om verkliga utfall. Anropa aldrig AI-tjänster eller produktionen för att ta fram dem.
- **Källor och lagpåståenden** i Jobbcoachens exempel: använd ett svar som redan finns i koden (till exempel i den befintliga demon, utan lönebelopp) eller ett exempel utan källhänvisning till en namngiven regel.
- Exempelpersonen är Sara Lindström, projektledare. Befintliga exempeldata (de 89 breven, CV-exemplen, mallminiatyrerna) ändras inte.

## Formen

- Skissen är målet: samma uppbyggnad, samma hierarki, samma färger. `kit.css` är facit för mått och färger. Det ska inte finnas något beige och inget svart kvar på publika sidor. Premium är sidans mörkaste ton med kopparklack.
- Telefon först: 375 px utan sidledsrullning, tryckytor minst 44 px, minsta text 12 px.
- Serverkomponenter där det går. Ingen ny klientkod för sådant som går att göra i CSS. Inga nya beroenden.
- Prestanda: sidorna är statiska och cachade, håll dem så. LCP-elementet ska vara text eller en bild med fasta mått, CLS 0. Animationer bara med CSS och avstängda under `prefers-reduced-motion`.
- Tillgänglighet: ett h1 per sida, kontrast minst 4,5:1 för text, synlig fokusring, `aria-label` på bilder som bär information.
- Testramen, CV-arket, spåret, träffen och brevet är var sin komponent i grunden. Rita inte egna varianter.

## Datorn

- Lite minne och andra sessioner. Under bygget: starta ingen dev-server, inget `next build`, ingen webbläsare och ingen SEO-diff. Det gör integrationen i slutet, en process i taget.
- `npx tsc --noEmit` får du köra högst en gång i slutet av ditt paket, och bara om `node C:\Users\chris\cvbrev\scripts\arbetsyta.mjs` visar minst 2 GB ledigt på första raden. Annars hoppar du över den och skriver det i loggen.
- Inga anrop mot produktionen eller databasen.

## Paketen (vem äger vilka filer)

- **P0 Grunden**: `src/components/publikt/v3/**` (nya komponenter och CSS), menyn (`src/components/landing/LandingNavbar*`, `nav-data.ts`), foten (`src/components/Footer.tsx`), `src/app/(public)/layout.tsx`, kampanjraden, och färgerna i `src/components/publikt/publikt.css` och `globals.css` som gör publika sidor beiga eller svarta. Ingen annan ändrar de filerna.
- **P1 Hela sajten**: startsidan, `/funktioner`, `/priser`, `/om-oss`, `src/app/register`, `src/app/login`, `src/app/auth/**`, `src/components/registrering/**`, och de delade copyfilerna `src/components/pricing/paket-copy.ts`, `src/lib/plans/gratis-copy.ts`.
- **P2 Tester och CV**: `/verktyg/rekryteringstester` med undersidor, `/verktyg/personlighetstest`, `/verktyg/cv-analys`, `/verktyg/skapa-cv`, `/verktyg/linkedin-optimering`, `/cv-mallar` med undersidor, `/cv-exempel`.
- **P3 Personliga brev**: `/verktyg/personligt-brev`, `/personligt-brev-exempel` med kategori och yrkessidor (`src/components/publikt/innehall/exempel/**`), brevvisaren (`src/components/publikt/brevvisare/**`), `/skapa-brev/**`.
- **P4 Jobbsöket och artiklarna**: `/verktyg/jobbmatchning`, `/verktyg/jobbcoachen`, `/verktyg/bli-upptackt`, den nya sidan `/verktyg/sokta-tjanster` (med sajtkarta), `src/components/artiklar/**` (reklamen och artikelsidans skal), `src/app/(public)/artiklar/**`, och övriga publika sidor som bara ska få det nya skalet (`/hjalpcenter`, `/kontakt`, `/press`, `/karriar`, `/for-rekryterare`, `/integrationer`, `/rakna-ut`, `/jobbkartan`, `/exempel`).
- **P5 Integration**: slår ihop, kör grindarna, rättar, committar.

De gamla telefonskärmarna i `src/components/publikt/telefon/skarmar/` ersätts av grundens komponenter. Den som tar bort sista användningen av en skärm tar inte bort filen: P5 städar.

## Beslut som redan är tagna (bygg efter dem)

1. Menyn grupperas i fyra delar som i skissen `meny`. Dagens ankartexter står kvar, Priser behåller egen länk, Jobbcoachen står under Jobbsöket. Sökta tjänster länkar till den nya sidan.
2. Foten grupperas på samma sätt, inga länkar försvinner.
3. Hjältens telefon "Mitt jobbsök" byts mot startsidans fyra kort.
4. CV-analysen: H1 "CV-analys med läsbarhetspoäng: se var ditt CV tappar, del för del" enligt textbeslutet. Skissens lösning med första ledet som etikett inuti h1-elementet är tillåten.
5. "Vad vill du börja med?": bygg skissens val bara om valet går att koppla till landningen utan att röra inloggat. Annars behålls dagens val i den nya formen.
6. Brevvisarens knapp "Använd som mall" med mallen i adressen: bygg det om startflödet kan ta emot mallen utan ändring i brevmotorn eller databasen. Annars behålls "Skriv ditt eget brev" i den nya formen, och mallvalet visas i startflödet utan att sparas.
7. Kategorisidorna för brev och CV följer navets skiss.
8. Artikelsidans topp behåller klustrets färg som i dag, och menyn tar samma färg.
9. Reklamkortet för Jobbsöket visas i artiklar om att söka jobb. Övriga kort (mallkortet, coachkortet, räknarkortet, länkraden, provkorten) får samma form som de fyra ritade.
10. Sidor utan egen skiss får grundens skal, färger och komponenter, med sin text orörd.

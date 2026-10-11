# Beslut efter bygget av Provbladet (2026-10-11)

Art director, efter granskning av skärmdumparna i `lyft-alla/docs/qa/tester-lyft/alla`,
`lyft-resultat/docs/qa/tester-lyft/resultat` och `lyft-utveckling/docs/qa/tester-lyft/utveckling`
mot `skiss.html` och `riktning.md`. Mobil 360 och 412, dator 1280, ljust och mörkt.
Ägarens mandat: jag tar besluten så länge testansvarig stöder dem. Ägarens fasta regel
gäller överallt: tal radas aldrig upp i löptext, ett huvudtal eller en liten visualisering
bär budskapet.

Helhetsomdömet först: bygget följer skissen väl. Provbladets bilder sitter på papperet,
väggen är lägre för den vana, nivåsegmenten bär ett tal, resultatsidan avslöjas i fyra
steg och inget är rött. Det som återstår är dubbleringar av samma tal och några ställen
där ett kort fått mer tal än det tål.

## Besluten

### 1. Bryggan till CV:t: bort från resultatsidan, men två saker följer med

`TestResultBridgeContainer` och `TestResultBridge` kommer inte tillbaka på resultatsidan.
Skälen: resultatsidan har en kopparknapp (genomgången) och fyra steg som bygger upp till
den; bryggan är ett säljkort i det gamla formspråket (MarginPlate, platta med illustration,
sekundärknapp) och skulle hamna sist, under statusraden, där den konkurrerar med
"Samma nivå igen i morgon". Specen tog bort "nästa nivå" av samma skäl: resultatet ska
läsas som resultat.

Två saker måste överleva borttagningen:

- **Loggningen.** Bryggan loggade `test_completed` ("Testresultat visades") när den
  renderades, och `bridge_clicked`. Utan bryggan slutar `test_completed` registreras och
  adminvyerna och kohorterna tappar händelsen. Flytta `logUserActivity(userId,
  'test_completed', ...)` till `TestResultsPage` (en gång per visning, samma payload med
  slug). `bridge_clicked` utgår.
- **Steget vidare för den som saknar CV** (B6 i plan-konvertering, testsegmentet möter
  annars aldrig CV:t). Det får plats i statusraden längst ner, i samma form som i dag
  (prick, en mening, en länk): när `hasCv` är false blir länken "Ladda upp ditt CV" i
  stället för "Alla tester", och meningen "Resultatet syns i Din utveckling. Samma nivå
  igen i morgon. Nästa steg i jobbsöket är CV:t." Har användaren CV står raden som nu.
  Ingen variant för brevet, ingen variant för "tre test i dag"; kvottaket möter
  användaren redan på testsidan (`PaywallCard test-tak`) när hon försöker igen.

### 2. Väggens tal: ett huvudtal, ringen bär procenten, två tal bredvid

Rubriken "12 av 15 rätt, 80 %" följt av rutan "12 av 15 / rätt" är samma tal tre gånger
på fem rader. Det är precis mönstret ägaren förbjudit, bara utspritt. Beslut:

- Rubriken blir **"12 av 15 rätt"**. Procenten stryks ur texten.
- **Ringen bär procenten.** `Dagsring` fyller bågen till andelen rätt (80 % = 288 grader)
  i stället för hela varvet; bocken står kvar i mitten och säger "klart". Vid 1 av 15 blir
  det en kort kopparbit och en bock, vilket är sant. Minsta synliga båge 4 %.
  `aria-label` på ringen: "12 av 15 rätt, 80 procent".
- **Två tal i stället för tre:** tiden ("17:35 / av 20 min") och tempot ("4 av 15 / över
  80 s per fråga"). Rutan "rätt" försvinner. Antalet fel är Genomgångens rubrik ("Tre
  frågor att titta på") och ska inte stå på väggen också. På dator står de två till höger
  som i dag, på mobil i två kolumner.
- **Bästa-raden** står kvar men som hel mening. `RESULTAT.bast.nu` byts från "Ditt bästa
  resultat på nivån." (ett fragment) till "Det här är ditt bästa på nivån."
  `bast.tidigare` behålls.

### 3. Fyrstegsvisningen bara de första tio minuterna: ja

`nyss` (completed_at inom tio minuter, servern räknar) styr `.motion`, eyebrow i koppar
"Testet klart" mot datumet i dämpat, och ringens fyllanimering. Det är rätt gräns: den
som kommer från testet får avslöjandet, den som öppnar ett gammalt försök från listan får
ett daterat blad utan teater. Två villkor som redan uppfylls och ska fortsätta göra det:
utan `.motion` renderas s1 till s4 synliga direkt (ingen opacitet noll utan klass), och
`prefers-reduced-motion` stänger av allt även inom tio minuter.

### 4. Lyftkortet på testsidan: levelBlurb stannar, väggen slutar säga samma sak

`levelBlurb` är rätt text under frågan ("Vilken figur kommer härnäst?"): den säger vad
nivån gör med frågan. Problemet är att väggens rad (`config.description`, "Nivån där
mönstret bygger på en regel i taget") säger samma sak en gång till, tolv rader ovanför,
och att eyebrow "GRUNDNIVÅ", rubriken "Logiktest, grundnivå" och faktarutan "Grund /
nivå" nämner nivån tre gånger på samma skärm. Beslut:

- Kortet behåller `levelBlurb`.
- Väggens rad blir formatraden per testtyp, hämtad ur copywriterns hjälptexter
  (hjalp.md B2, B4, B6): "Samma format som Matrigma från Assessio, Alva Logic och SHL
  Verify." för logiken, motsvarande för verbalt och numeriskt. Det är ny information och
  det enda väggen behöver säga utöver titeln.
- Tredje faktarutan ("Grund / nivå") stryks på grund, avancerad och expert. Provet
  behåller "3 / nivåer", där är det en upplysning.

## Avvikelser att rätta före lansering

Viktigast först. Komponent, vad, hur.

1. **`ResultatVagg` + `Dagsring` + `RESULTAT.rubrik`/`bast.nu`: tredubblat huvudtal.**
   Som beslut 2: rubrik utan procent, ringen fyller till andelen, två tal i stället för
   tre, hel mening för bästa-raden.

2. **`TestKategori` (Alla tester, mobil): faktaraden står mellan bilden och eyebrow.**
   Läsaren får "15 frågor, 20 till 30 minuter, 3 nivåer" innan hon vet vilket test det
   är, och raden är centrerad medan resten är vänsterställd. Ordningen på mobil ska vara
   bild, eyebrow, fråga, brödtext, fakta (vänsterställd), segment. Commit bc3211b6 gjorde
   det på dator (`lg:col-start-1 lg:row-start-2`); gör samma sak under lg genom att lägga
   `Fakta` sist i textspalten i stället för under bilden.

3. **`BastaKort` (testsidan): samma tal i tre former.** "60 %" i display, femton rutor
   med nio ifyllda, och "9 av 15 rätt" i text. Skissens segmentregel gäller: "14 av 15"
   står i `title` och `aria-label`, aldrig som synlig text. Behåll display-talet och
   rutorna (rutorna är provbladet, de får vara kvar), ta bort textraden och låt
   bottenraden bara bära länken "Se genomgången".

4. **`ForsokKort` (testsidan): "2" i 48 px display över etiketten "försök".** Antalet
   försök är inget resultat och förtjänar inte vyns största tal; med två punkter säger
   kurvan heller inget. Ta bort display-talet, låt serien ta kortets bredd med senaste
   punkten i koppar och dess procent som enda etikett vid punkten, antalet försök i
   `aria-label` och i summary-raden ("Visa försöken", "Dölj försöken"). Listan under
   är bra som den är.

5. **`traning/utveckling/Tempo` (Din utveckling): tre tal i rad "58 s / 83 s / 3/9".**
   "83 s provets tid" är en konstant, inte ett resultat, och raden är det uppradade
   mönstret i rutform. Följ skissen (avsnitt 2, kortet Tempo): rubrik "Tre av nio över
   provets tid", brödtext "Snitt 58 s per fråga.", staplarna med den streckade
   budgetlinjen märkt "provets tid, 83 s" som på resultatsidan. Snitt per pass under
   får vara kvar.

6. **`TestHubPage` (testsidan, mobil): provbladets bild på väggen trycker ner lyftkortet.**
   Bilden står 96 px hög, vänsterställd, under ingressen, och "Starta testet" hamnar
   under vecket på 360. Riktningen säger att väggen bara har en scen på dator och att
   bilden står på papperet. Dölj `instrument` under lg (som `AllaTesterVagg` gör med
   scenen); dator behåller bilden till höger på väggen i 240.

7. **`GenomgangKort` (resultat, dator): tre miniatyrer och tom högerhalva.** Kortet
   spänner två spalter men innehållet stannar vid 420 px, och vid "Fjorton frågor att
   titta på" ser tre bilder ut som ett avbrott. På dator: visa upp till sex miniatyrer i
   en rad om 80 px när missarna är fler än tre, "Visa alla femton" står kvar. Mobil
   behåller tre.

8. **`MatrixQuestionReview`, `NumericalResultsBody`, `VerbalReview`: rubriken "Fråga för
   fråga" två gånger.** `TestResultsPage` sätter h2 "Fråga för fråga" och
   granskningskomponenterna sätter sin egen h2 med samma text direkt under. Ta bort den
   inre rubriken när komponenten renderas under sidans (prop `utanRubrik`, eller
   sr-only), så att en rubrik bär.

9. **`TesterTabs`/`Segment`: flikarna ser olika ut i de två flikarna.** På Alla tester är
   de två fristående rutor med mellanrum och mörk kant på den valda; på Din utveckling en
   sammanhängande full bredd-list med vit vald yta. Samma komponent, samma bredd
   (`sm:max-w-sm`) och samma utseende i båda, placerad direkt under lyftkorten som i
   skissen (på Din utveckling efter Var du står och Nivåerna, det är rätt).

10. **`Nivavagg` (Din utveckling): tre display-tal på väggen och samma tre värden som
    etiketter i kurvan.** "6,1 nivå i dag", "5,2 mätningen", "6,5 sikte" står som rutor och
    kurvan skriver ut "mätning 5,2", "6,1" och "Sikte 6,5" igen. Ett huvudtal räcker:
    behåll "6,1 / nivå i dag" i display till vänster om kurvan, låt mätning och sikte
    läsas i kurvan där de redan står, och lägg alla tre i kurvans `aria-label`.

## Utanför tiolistan, noterat

- Väggens rad på Alla tester för gratiskontot är paketets ingress ("...ingår i Premium")
  medan premiumkontot får rummets mening ("...i samma format som Assessio, cut-e och
  SHL"). Min regel är att väggen visar och inte säljer, och de låsta segmenten säger
  redan Premium fyra gånger per kort. Jag föredrar rummets mening för alla, men texten
  kommer ur `paket-rader.ts` och är saas-leads och copywriterns, så jag lämnar den som en
  rekommendation och inte ett krav.
- Länken "Visa ett exempel på en fråga" på lyftkortet (dator) står i skissen men saknas i
  bygget. Den kräver smakprovet i ett ark och är inte ett lanseringskrav. Lägg den i kön.
- De verbala miniatyrerna bröts mitt i ord i den första körningen ("Hos personalchefe");
  b1796725 rättade det och de senare skärmdumparna avstavar rätt. Ingen åtgärd.

Version 1.0, 2026-10-11, art-director.

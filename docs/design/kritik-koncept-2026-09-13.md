# Kritik: konceptet Tråden

Oberoende art director, 2026-09-13. Underlag: koncept-2026-09-13.md, rod-trad-preview.html med fyra renderingar på 375 px, designsystem-v2-utkast.md och skärmdumpen av dagens tonalitetssteg.

## 1. Helhetsbetyg: 6 av 10

Det här är ett kompetent systemarbete, inte ett vibekodat. Reglerna är skarpa, kontrasten är räknad, och skärmdumpens problem (orange platta, nätverk bakom text, badge, tre bockar, flaggor) är faktiskt lösta, inte omdekorerade. Det lyfter det från 4 till 6.

Det som hindrar det från att stå bredvid Linear eller Stripe är att konceptet är korrekt utan att vara igenkännbart. Linear har en typografisk röst och ett tempo, Stripe har ett färgsystem som kan bära allt från en knapp till en illustration. Tråden har en regelbok och en 3 px vänsterkant. Renderingarna ser ut som en välordnad Tailwind-app i varm gråskala. Ingen skulle kunna se en beskuren skärmdump och säga "det där är Jobbcoach". Och konceptet bryter redan mot sin egen huvudregel i sina egna renderingar, vilket säger att regeln är svårare att hålla än dokumentet låtsas.

## 2. Starkt, ska behållas

- **Problemanalysen.** "Ingen nivå, orange som yta, illustrationer bakom text" är exakt rätt diagnos, och den är verifierad mot skärmdumpen.
- **Orange högst tre gånger per skärm, och exakt en fylld yta.** Det är den regel som gör mest nytta. Håll den hårdare än konceptet självt gör.
- **Marginalplattan och "en platta per vy".** Att sekundära rader får naken ikon i ink-3 är rätt, och profilens tre sektioner som en lista i en panel är renderingens bästa yta.
- **Skelettet står stilla, bara linjen rör sig.** Ett laddningsmönster som ser likadant ut överallt är en riktig röd tråd. "Brevet skrivs" med rader som fylls i tur och ordning är det starkaste tillståndet i hela förhandsvisningen.
- **Flöden ställer en fråga** ("Hur ska brevet låta?"), fel utan rörelse, sparat som positiv hjälptext under fältet. Små beslut som Things skulle ha tagit.
- **Granskningsloggen.** Att första utkastet fälldes på "ikoner i rutor på rad" och "tråden som stolpe" visar att processen fungerar.

## 3. De fem största svagheterna

**1. De tre tonerna finns inte på en riktig skärm.** Mark #F6F3EE mot panel #FFFFFF är 1,11:1. Insunket fält #F1EDE6 mot mark är 1,05:1, alltså samma färg. Konceptets bärande idé, "tre toner i stället för tre skuggor", bygger på skillnader som en billig OLED-panel med nattläge eller en Android med sänkt ljusstyrka plattar ut till en yta. I ram 2 läses fälten som paneler med ram, inte som något som ligger lägre. Förslag: öka avstånden så att varje steg är minst 1,2:1. Mark #F3EFE8, panel #FFFFFF, insunket #ECE6DC, kant #DDD5C8. Behåll benvitheten men gör den till ett läsbart steg, och låt fältet dessutom ha en 1 px mörkare överkant (inset-kant) så att "insunket" har en fysisk förklaring.

**2. Tråden är redan en gimmick, och den bryter mot sin egen regel.** Ram 3 innehåller sju orange träffar: framstegslinjen, tråden på valkortet, plattans accent, bocken, etiketten "Rekommenderas", segmentets tråd och knappen. Ram 2 har fem: tråd, plattans accent, två fyllda orange toggles och den orange linjen i brevminiatyren. Reglen säger tre. Dessutom är en 3 px färgad vänsterkant redan ett etablerat tecken på webben: Notion-callout, Bootstrap-alert, blockcitat. På ett valt kort riskerar den att läsas som "observera" i stället för "valt". Förslag: ge tråden en enda betydelse, position (aktivt steg, aktiv sektion, laddning). Val markeras med kant-stark plus bock, ingen tråd. Toggles i ink-1, inte accent. Då finns det en linje kvar i systemet, och den är igenkännbar just för att den är ensam.

**3. Typografin har ingen karaktär.** Inter 400/500/600 i 12/14/16/18/24 är default-Tailwind, och renderingen bekräftar det: dashboarden ser ut som vilken admin som helst. Sidrubriken på 24 px är för liten för att bära en sida, och h2 "Pågår nu" på 18/600 skiljer sig inte från kortrubriken på 16/600. Stripe och Linear får sin röst av kontrast i skalan, inte av typsnittet. Förslag utan ny fil: h1 28/32 med -0.02em, stora tal 40/40 med vikt 500 (lättare tal ser dyrare ut än fetare), sektionsrubriker som 14/500 versaler-fria etiketter i ink-3 i stället för 18/600 (så som Things gör), och lägg ett tydligt steg mellan brödtext 14 och metadata 12 genom att låta metadata bli 13/18. Om metrik tillåter: en variabel Inter med `opsz`-axel ger rubriker med tätare, mer ritad känsla utan ny familj.

**4. Ikonerna är för små och för lika.** Nakna ikoner på 20 px med stroke 1,5 i ink-3 var rätt beslut för att slippa rutor, men i ram 3 är "Professionell" (en byggnad) och "Entusiastisk" (en pratbubbla) i praktiken två grå fläckar. Marginalplattans motiv (kuvert med punkt, dokument, urtavla) är generiska. Förslag: 24 px, stroke 1,75, ink-2, och ett motivspråk som skiljer sig från Lucide: bredare proportioner, en avsiktlig asymmetri per motiv, accentytan som en fylld form och inte en punkt. Rita de tio viktigaste motiven för hand innan fas 2 så att de bär identiteten, plattan gör det inte själv.

**5. Bekräftelsen känns inte.** Ram 4: en 96 px dokument-ikon, "Brevet är klart", en knapp. Framstegslinjen som går till 100 procent är 2 px och ligger i panelens överkant, praktiskt taget osynlig. Efter 20 sekunders väntan på ett brev är det för lite lön. Förslag: låt bekräftelsen vara det enda tillfället då systemet bryter sin egen ton, men på ett kontrollerat sätt: hela panelen glider upp 8 px, linjen som gick till 100 procent blir 3 px och stannar kvar som kortets överkant (tråden har nått sitt mål), bocken ritas i 480 ms i stället för 320, och rubriken säger vad som skapades ("Ditt brev till Klarna är klart"). Ingen konfetti, men ett tempo som skiljer sig från allt annat.

## 4. Färgbeslutet

Motiveringen håller på tre av fyra punkter: dagens #EA580C är underkänd (3,56:1), igenkänningen mot blåa konkurrenter är verklig, och kostnaden för ett hue-byte (logo, mail, Stripe, 100+ artikelbilder) är hög. Jag skulle inte byta hue.

Men #C84A0E på benvit mark är ett tegelbrunt som tappar det jobbsökaren behöver: energi. I ram 1 ser knappen ut som en "Radera"-knapp i en mörkare ton. Tråden på #C84A0E mot #F6F3EE ger 4,27:1, vilket är godkänt men dovt. Alternativet är inte annan färg utan en annan arbetsfördelning:

- **Primärknapp i ink-1 #1C1917** med vit text (17,5:1). Things, Linear och Arc gör så. Då är knappen alltid läsbar, alltid en, och orange slipper vara både "handling" och "position".
- **Orange enbart som linje och bläck.** Då kan accenten vara ljusare och varmare eftersom den aldrig bär vit text: `#D9480F` som tråd och framstegslinje (3,88:1 mot mark, klarar 3:1 för UI-grafik med marginal), `#9A3412` kvar som accent-bläck (6,6:1). Logotypens #F97316 känns då som samma familj i stället för en ljusare kusin.
- Om ägaren insisterar på orange knapp: `#BE4A0C` (5,03:1 med vit) ger marginal till AA i stället för att ligga på 4,73.

Konsekvens: publika CTA:er byter till ink-knapp också, eller behåller orange gradient tills den publika omgången görs. Det är samma öppna fråga som konceptet redan lämnar.

## 5. Tre saker som saknas helt

1. **Desktop.** Alla wireframes är 375 px. Var hamnar tråden när det finns en sidomeny: på menyraden, på innehållets panel eller båda? Hur bred är innehållskolumnen på 1440, och står dashboardens paneler i två kolumner? Ett system som bara bevisats på mobil är halvt.
2. **Betalvägg, prissida och trial-dag-5.** Utkastet avfärdar det med en rad ("panel med tråd, platta 56"). Men betalväggen är den vy där systemet måste sälja, och "ingen orange fyllning, en knapp, textlänk" kan bli den mest oansenliga betalväggen i branschen. Prissidan behåller hero-gradienten, vilket betyder att den mest besökta publika sidan och den inloggade produkten är två system.
3. **Mörkt läge och illustrationen på 240.** Tokens är light-only, och "papper på ett bord" har ingen mörk metafor. 240 px-hero på dashboard A finns i tabellen men inte i någon wireframe, rendering eller scen-regel. Det är just den ytan där illustrationer brukar bli AI-blobbar, och den är helt oprovad.

## 6. Rekommendation

Godkänn riktningen med ändringar: separera tonerna så att de syns, ge tråden en enda betydelse och flytta knappen till bläck, och rita typografi och ikoner med karaktär innan en rad produktkod skrivs.

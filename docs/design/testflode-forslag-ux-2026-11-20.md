# Testflödet: UX-förslag för en gemensam sessionsram

Datum: 2026-11-20. Författare: UX-designern (mobil först, interaktionsdesign). Underlag: `docs/rapporter/testflode-inventering-2026-11-19.md`, cirka 60 skärmdumpar (desktop 1400×900 och Pixel 7 412×915) och koden för `PassShell`, `FigurPassFlode`, `TestFlowShell`, `Startark`, `Regelpanel`, `Klocka`, `Segmentstapel`, `VnUppgift`. Ett av tre perspektiv (UX, saas-lead, art director) inför en gemensam plan som ägaren godkänner före bygge. Ingen kod är ändrad.

Ägarens krav i en mening: samma sak ska se ut och bete sig likadant överallt, det ska kännas som en app, och användaren ska aldrig behöva lära sig gränssnittet två gånger.

---

## 0. De tio viktigaste ställningstagandena

Här står det jag tror saas-lead eller art director kan tycka annorlunda om. Resten av dokumentet är detaljerna.

1. **En ram, byggd på `PassShell`, för alla femton flöden.** X till vänster, titel och undertitel i mitten, räknare och klocka till höger, en 4 px tidslinje under huvudet, fäst fot. `TestFlowShell` och de två inbyggda skalen (övningsprov, I-prov) pensioneras. Toppens höjd är 60 px i alla lägen, fotens 76 px plus safe area. Inget läge får egen geometri.
2. **Sidomenyn döljs under sessionen även på desktop.** I dag ligger sessionen till höger om sidomenyn (`lg:left-[248px]`). Ett test är ett läge, inte en sida. Duolingo, Alva och SHL visar ingen navigation under provet. Art director kan vilja behålla menyn som varumärkesram; jag säger nej, X i huvudet räcker.
3. **Ett enda svarsbeteende i alla testlägen: välj, sedan Nästa.** Auto-nästa försvinner ur nivåtesten (matris, figurserier, talserier, spatial, ordförråd) och ur I-provet. Svaret kan ändras tills man trycker Nästa. Skäl: SHL Verify, Aon scales, Alva Logic och Matrigma låter alla kandidaten själv gå vidare, och en feltryckning på mobil ska inte kosta en uppgift i ett läge som räknas. saas-lead kan oroa sig för tempo och genomförandegrad; se 2.2.
4. **Träna får ägarens inställningar, men som två kryssrutor på startskärmen, inte mitt i sessionen.** "Förklaring efter varje svar" (på som standard) och "Ett tryck räcker som svar" (av som standard). De sparas per konto. Båda saknas i Nivåkoll, nivåtest, övningsprov och I-prov, där beteendet alltid är provets. Se 2.4 för varför standarden är bekräfta, inte ett tryck.
5. **Klockan har exakt två betydelser, och formen avslöjar vilken.** Ring uppe till höger = gräns (tiden räknar ned, provet lämnas in självt). Tidslinje utan ring = referens (provets tid per uppgift, inget händer när den är full). Nivåtesten får därmed en riktig nedräkning från den tid startsidan lovar (20 minuter) med automatisk inlämning. I dag räknar de upp utan slut. Det här påverkar genomförandegrad och tempostatistik; saas-lead och testansvarig avgör.
6. **Frågerutnätet flyttar in i ett ark som öppnas från räknaren "3 / 15".** Rutnätet under svaren tar plats från uppgiften, har 22 px breda celler på desktop och syns inte på mobil utan scroll. Arket har 44×44 px celler och finns bara i lägen där man får gå tillbaka. Segmentstapeln i övningsprov och I-prov (16 px höga knappar) tas bort till förmån för samma ark.
7. **Verbalt nivåtest går över till ett påstående i taget**, som Nivåkoll, Träna och övningsprovet redan gör. Fyra påståenden under en lång text är det enda som inte passar "en uppgift per skärm" och det är varför första påståendet aldrig syns på mobil. Testansvarig kan tycka att formatet med fyra påståenden är närmare SHL; jag menar att texten fäst överst med egen scroll och påståendena ett i taget är närmare hur SHL faktiskt ser ut på skärm.
8. **Svaren ska alltid synas utan scroll, och det styr måtten på uppgiften, inte tvärtom.** Matrisen krymps till 336 px på desktop och 264 px på mobil, numeriskt underlag blir två kolumner på desktop och fäst med egen scroll på mobil. Art director kan tycka att matrisen blir liten; 88 px per cell är fortfarande större än Matrigmas egna.
9. **En resultatskärm, den som nivåtesten har i dag (`TestResultsPage`), för alla lägen.** Träna-kortlistan, Nivåkoll-väggen och övningsprovets vägg blir varianter av samma vägg och samma kort. "Gå igenom" finns alltid, även efter matrisens Nivåkoll.
10. **Uppgift, inte fråga.** Räknaren räknar uppgifter i alla typer. Verbalt: texten är underlaget, varje påstående är en uppgift. Typerna heter det de heter i Tester (Figurer och mönster, inte Logiktest). Nivåerna heter grundnivå, avancerad nivå, expertnivå i all text. Full lista i avsnitt 5. Copywritern kan ha synpunkter på enstaka ord; mönstret är det viktiga.

Två saker jag vill ta bort ur sessionen som art director eller testansvarig kan vilja ha kvar: reglaget "Förklarande text av" och svårighetsprickarna i matrisens nivåtest. Inget riktigt test visar svårighet under provet, och reglaget är en inställning mitt i ett läge som ska vara rent.

---

## 1. Sessionsramen

### 1.1 Geometri (samma i alla lägen, alla typer, alla enheter)

```
+----------------------------------------------------------+
| [X]  Figurer och mönster                 3 / 15   (ring) |  huvud 56 px, papper
|      Nivåtest, grundnivå                                  |
|==========================------------------------------- |  tidslinje 4 px
+----------------------------------------------------------+
|                                                          |
|  [underlag, om typen har ett]                            |  main, enda scrollytan
|  [uppgift]                                               |
|  [svar]                                                  |
|                                                          |
+----------------------------------------------------------+
| [‹]  [          Nästa                                  ] |  fot 52 px knapp + 12/12
+----------------------------------------------------------+
```

- **Lagret:** `fixed inset-0 z-50` i alla lägen, utan `lg:left-[248px]`. Sidomenyn, bottennavigeringen, e-postbannern och kakbannern är borta under hela sessionen (`data-flow-active` som i dag).
- **Kolumnbredd:** 560 px som standard. Figurserier 672 px (sex rutor på rad). Deduktiv, Ord och text, Siffror och tabeller 1000 px på desktop med två kolumner (underlag vänster 560, uppgift och svar höger 400, mellanrum 40). Huvud, tidslinje och fot följer alltid innehållskolumnen så att X, räknare och knapp inte flyttar mellan uppgift, genomgång och resultat.
- **Huvud 56 px:** X 44×44 till vänster (`aria-label` "Avbryt"), titel 15/600 ink-1 och undertitel 12/500 ink-3 i mitten, båda `truncate`. Till höger räknaren "3 / 15" 13 px tabular i en 44 px hög knapp (tryckbar bara där man får gå tillbaka, då med chevron) och därefter klockringen 40 px i gränslägen. På 412 px: 44 + 8 + titlar + 56 + 40 + 16 går ihop med titlar på upp till 230 px.
- **Tidslinjen 4 px** direkt under huvudet, hela bredden. Fylls alltid från vänster. Referensläge: per uppgift mot provets tid, koppar, står full när tiden passerat (som `Tidsrad` i dag men utan textraden; siffrorna ligger i `aria-label`). Gränsläge: provets eller uppgiftens hela tid, ink-2, byter till koppar de sista två minuterna, full = inlämning. Inga siffror under linjen i något läge; ringen bär siffran i gränslägen.
- **Main:** enda scrollytan, `overscroll-contain`, scrollas till toppen vid ny uppgift. Innehållet får `pb-[var(--flow-footer-h)]` så att förklaringen alltid kan scrollas fram helt.
- **Fot 76 px (+ safe area):** en rad, aldrig två. Vänster plats: antingen `‹` 52×52 (föregående uppgift) eller textknappen "Vet inte" 44 px hög med automatisk bredd, aldrig båda. Höger: primärknappen `flex-1`, 52 px, kopparknappen ur designsystemet. Foten är `flex-shrink-0` i kolumnen, aldrig `position: fixed` (iOS-tangentbordet).
- **Avbryt-dialog:** X öppnar alltid samma dialog (utom på resultatskärmen där X bara stänger). Rubrik "Avbryta nivåtestet?" (ordet byts per läge), en rad med konsekvensen, primärknapp "Fortsätt", textlänk "Avbryt". Esc stänger dialogen, inte sessionen.
- **Lämna in-dialog** (sista uppgiften i testlägen): "Lämna in?" med raden "3 uppgifter är obesvarade och räknas som fel." eller "Alla uppgifter är besvarade.", primärknapp "Lämna in", textlänk "Fortsätt".
- **Tangentbord (alla lägen, alla typer):** A till F eller 1 till 6 markerar alternativ (S, F, G för Sant, Falskt, Går inte att avgöra), Enter trycker på primärknappen, Backsteg eller vänsterpil går till föregående där det är tillåtet, Esc öppnar avbryt-dialogen. Lyssnaren är av när en dialog eller arket är öppet. Fokus flyttas till uppgiftens rubrik vid ny uppgift (`tabIndex -1`, utan synlig ring).
- **Skärmläsare:** huvudets räknare som `aria-live="polite"` text "Uppgift 3 av 15", klockan `role="timer" aria-live="off"`, förklaringen `role="status"`, alternativen som `role="radiogroup"` med `aria-checked`.
- **Fel och laddning:** samma `Meddelande`-kort som `FigurPassFlode` använder (sparfel med "Försök igen", startfel, betalvägg). Laddskelettet har exakt den färdiga layoutens höjder (huvud, tidslinje, en uppgiftsyta med samma mått, fot) så att CLS är 0.

### 1.2 Vad som är lika överallt och vad som får variera

| Del | Lika i alla lägen | Får variera |
|---|---|---|
| Huvud | X vänster, titel = typens namn, undertitel = läge och nivå, räknare "n / N" | Ringen finns bara i gränslägen; räknaren är tryckbar bara där man får gå tillbaka |
| Tidslinje | Finns alltid, 4 px, fylls från vänster | Referens (per uppgift, koppar) eller gräns (hela tiden, ink, koppar på slutet) |
| Uppgiftsyta | Underlag överst (fäst med egen scroll på mobil, egen kolumn på desktop), uppgift, svar; samma radhöjder och kortmått per innehållsform | Innehållsformen (avsnitt 3) |
| Svar | Tryck markerar, primärknappen bekräftar, svaret kan ändras tills dess | Träna med "Ett tryck räcker som svar" på |
| Fot | En rad, primärknapp höger | Vänsterplatsen: ‹ (testlägen med väg tillbaka), "Vet inte" (Nivåkoll, Träna), tom |
| Återkoppling | Samma `Förklaringen`-panel i samma ton, samma plats (under svaren, scrollas fram) | Direkt (Träna) eller i genomgången efteråt (alla andra) |
| Avbryt | Samma dialog, samma knappar | Ordet i rubriken och konsekvensraden |
| Resultat | Samma vägg, samma kortordning (avsnitt 4) | Huvudtalet och nästa steg |

---

## 2. Lägena och deras regler

### 2.1 Översikt

| | Nivåkoll | Nivåtest (grund/avancerad/expert) | Träna | Övningsprov | I-provet |
|---|---|---|---|---|---|
| Startskärm | Ja, kort (format + en regel + knapp) | Startsidan i Tester är startskärmen; tre regelrader läggs till i det lyfta kortet | Ja, kort, med de två kryssrutorna | Ja, dagens `Startark` oförändrat | Ja, dagens + mellanskärm per deltest |
| Klocka | Tidslinje, referens per uppgift | Ring + tidslinje, gräns, nedräkning från testets tid | Tidslinje, referens per uppgift | Ring + tidslinje, gräns (total eller per uppgift enligt format) | Ring + tidslinje, gräns per deltest |
| Räknare | "3 / 9", inte tryckbar | "3 / 15", tryckbar, öppnar uppgiftsarket | "3 / 6", inte tryckbar | "3 / 18", tryckbar i fasta format, inte i adaptiva | "Deltest 2 av 6" i undertiteln, "3 / 6" tryckbar inom deltestet |
| Svar | Välj + Nästa | Välj + Nästa | Välj + Svara, sedan Förklaringen, sedan Nästa (standard) | Välj + Nästa | Välj + Nästa |
| Ändra svar före Nästa | Ja | Ja | Ja | Ja | Ja |
| Gå tillbaka | Nej | Ja (‹ och arket) | Nej | Fasta format ja, adaptiva nej | Inom deltestet ja, mellan nej |
| Hoppa över | Nej, "Vet inte" i stället | Ja, Nästa utan val lämnar obesvarad (markeras i arket) | Nej, "Vet inte" i stället | Ja, som nivåtest | Ja, som nivåtest |
| Vet inte | Ja, i foten | Nej | Ja, i foten ("Vet inte, visa förklaringen") | Nej | Nej |
| Återkoppling | Efteråt | Efteråt | Direkt (standard), eller efteråt om kryssrutan är av | Efteråt | Efteråt |
| Sista knappen | "Visa resultatet" | "Lämna in" + dialog | "Visa resultatet" | "Lämna in" + dialog | "Avsluta deltestet" + dialog, sista "Lämna in" + dialog |
| X | Dialog "Avbryta Nivåkollen?" | Dialog "Avbryta nivåtestet?" | Dialog "Avbryta träningen?" | Dialog "Avbryta övningsprovet?" | Dialog "Avbryta övningsprovet?" |

### 2.2 Varför välj + Nästa i alla testlägen

Träningen ska förbereda för riktiga rekryteringstest. Så vitt vi vet, och enligt vad produkten redan påstår i `src/lib/ovningsprov/format.ts`:

- **SHL Verify** (verbal, numerisk, deduktiv): fast ordning, total nedräkning, svaret markeras och kandidaten trycker Nästa. Inget facit, ingen förklaring, i de flesta versioner ingen väg tillbaka.
- **Aon scales** (figurserier med mera): korta prov, nedräkning, kandidaten går själv vidare, ingen väg tillbaka, inget facit.
- **Alva Logic**: adaptivt, tid per uppgift, kandidaten bekräftar varje svar, ingen väg tillbaka, inget facit.
- **Matrigma** (klassisk och adaptiv): kandidaten väljer och går vidare själv, total tid eller tid per uppgift, inget facit.

Gemensamt: ingen av dem går vidare av sig själv på ett tryck, ingen visar rätt svar under provet, alla visar tiden och var man är. Vårt auto-nästa efter 150 ms är alltså inte "som provet", det är snabbare än provet, och på mobil betyder det att en feltryckning är ett låst fel. Prisfrågan är en extra tryckning per uppgift: 15 tryckningar på 20 minuter. Det är inte det som avgör genomförandegraden; svar under vecket och tre olika gränssnitt är det.

Testansvarig bör bekräfta leverantörsfakta ovan innan de hamnar i användartext; jag använder dem bara som skäl för beteendet.

### 2.3 Nivåkoll

- **Start:** kort startskärm på väggen: eyebrow "NIVÅKOLLEN", rubrik "Nivåkollen i figurserier", formatrad "Nio uppgifter, cirka fem minuter.", en regelrad "Ingen förklaring under tiden, den kommer efteråt.", knapp "Starta Nivåkollen" i det lyfta kortet. Sessionen skapas när knappen trycks, inte när sidan öppnas; första uppgiften kommer i samma svar och ritas direkt.
- **Tid:** referens. Tidslinjen fylls per uppgift mot provets tid. Ingen ring.
- **Svar:** välj + Nästa. "Vet inte" i fotens vänsterplats räknas som obesvarad och går vidare. Ingen väg tillbaka (matrisens Nivåkoll är adaptiv; de andra är fasta men mätningen ska vara likadan).
- **Räknaren** visar det verkliga antalet. Menyn och kortet i Tester måste säga samma antal som sessionen (i dag "tolv" mot 6 till 12). Det är saas-leads sak att välja om alla Nivåkoller ska vara tolv uppgifter eller om texten ska vara per typ; ramen klarar båda.
- **Slut:** "Visa resultatet" på sista uppgiften, inget inlämningssteg. Resultat enligt avsnitt 4 med nivån som huvudtal och "Gå igenom" alltid.
- **Öppnas igen samma dag:** resultatskärmen från i dag, med en rad "Du gjorde Nivåkollen i dag. Nästa kan du göra i morgon." i stället för att tyst visa gårdagens.

### 2.4 Träna

- **Start:** kort startskärm: eyebrow "TRÄNA", rubrik "Figurserier på grundnivå", formatrad "Fyra uppgifter. Ingen tid som räknas, men linjen visar provets tid per uppgift.", två kryssrutor (44 px rader):
  - "Förklaring efter varje svar" (på som standard)
  - "Ett tryck räcker som svar" (av som standard)
  Knapp "Starta träningen". Kryssrutorna sparas per konto (profilfält), gäller alla typer, och visas bara här. Ingen inställning i huvudet under sessionen.
- **De fyra kombinationerna:**
  - Förklaring på, ett tryck av (standard): tryck markerar, "Svara" bekräftar, Förklaringen glider in under svaren, knappen blir "Nästa".
  - Förklaring på, ett tryck på: tryck = svar, Förklaringen direkt, "Nästa". Det här är dagens figurserie-Träna, den bästa sessionen i inventeringen.
  - Förklaring av, ett tryck av: tryck markerar, "Nästa" bekräftar, nästa uppgift. Facit i genomgången. Provtempo med provets gest.
  - Förklaring av, ett tryck på: tryck = svar, 250 ms markering, nästa uppgift. Rent tempodrill.
- **Varför bekräfta är standard:** samma gest som i testlägena, så att den som tränat i fyra dagar inte möter en annan gest på provdagen, och ingen feltryckning på mobil. Den som vill ha fart kryssar i. Duolingo gör samma val: markera, sedan "Kontrollera".
- **Tid:** referens, tidslinje per uppgift. Ingen ring.
- **Vet inte:** i fotens vänsterplats, "Vet inte, visa förklaringen" med förklaring på, "Vet inte" med förklaring av. Räknas som fel.
- **Ingen väg tillbaka** (adaptivt urval i matrisen, och träningen är en i taget).
- **Förklaringen:** `Regelpanel` i dag, med eyebrow "FÖRKLARINGEN" i alla typer (i dag "REGELN" i figurtyperna och "FÖRKLARINGEN" i text och siffror). Raden överst "Rätt, 12 s" eller "Inte den här, 31 s", regeln i fetstil där banken har en, "Ditt misstag" under. Matrisens ifyllda lucka och talseriens markerade tal behålls. Panelen scrollas fram så att dess nederkant står 12 px över foten (finns).
- **Slut:** "Visa resultatet". Resultat enligt avsnitt 4 med "x av y rätt" som huvudtal och nivåförflyttningen som andra tal där den finns.
- **Matrisens lås "Gör Nivåkollen först"** står kvar som regel men visas som startskärmens variant med knappen "Gör Nivåkollen", inte som ett felkort.

### 2.5 Nivåtest (grund, avancerad, expert)

- **Start:** startsidan `TestHubPage` är startskärmen. Det lyfta kortet får tre regelrader under faktaraden "15 uppgifter · 20 minuter", samma tre som övningsprovet ("Klockan räknar ned", "Ingen hjälp under tiden", "Obesvarade räknas som fel"), och knappen "Starta testet". Finns en påbörjad session i dag visas "Fortsätt testet" med raden "Du har 9 uppgifter kvar." i stället för en ny start.
- **Tid:** gräns. Ring med minuter kvar, tidslinje som töms på hela testets tid, koppar sista två minuterna, automatisk inlämning vid noll. Tiden räknas från serverns starttid som i övningsprovet (`useExamDeadline`), så att en omladdning inte nollställer. Verbalt följer startsidans 20 minuter, inte 25.
- **Svar:** välj + Nästa. Nästa utan val lämnar uppgiften obesvarad och markerar den i arket. ‹ går tillbaka, arket hoppar fritt. Ett redan bekräftat svar kan ändras genom att gå tillbaka (som i vår fasta lista i dag).
- **Sista uppgiften:** "Lämna in" + dialog med antalet obesvarade.
- **Expert verbalt och numeriskt** (i dag låsta och linjära) får samma regler som övriga nivåtest. Det finns inget provskäl att just de ska vara låsta.
- **Bort ur sessionen:** "Förklarande text av", "Svårighet ●●●", den dubbla raden "Fråga 1 av 20 · Lätt" i numeriskt, "✓ 0 / 15".

### 2.6 Övningsprov

- **Start:** dagens `Startark` oförändrat i innehåll (det är mallen för alla andra startskärmar). Formatvalet (Alva, Matrigma, Vårt format) görs i Plan inför provet som i dag; startarket visar det valda.
- **Tid:** gräns. Total eller per uppgift enligt format. Per uppgift: ringen fylls om per uppgift och visar m:ss.
- **Svar:** välj + Nästa. Fasta format: ‹ och arket. Adaptiva: ingen väg tillbaka och räknaren är inte tryckbar.
- **Lämna in** får dialog (saknas i dag). X får dialog (saknas i dag).
- **Resultat** enligt avsnitt 4 med kurvan som andra kort.

### 2.7 I-provet

- **Start:** dagens startskärm med halva/hela provet. Mellanskärmen per deltest behålls, för det är så provet ser ut, men ritas som startarkets korta variant: eyebrow "DELTEST 2 AV 6", rubrik "Pappersvikning", formatrad "6 uppgifter på högst 5 minuter.", knapp "Starta deltestet".
- **Huvud:** titel "I-provet", undertitel "Deltest 2 av 6, pappersvikning", räknare "3 / 6" tryckbar inom deltestet, ring per deltest.
- **Svar:** välj + Nästa (auto 180 ms bort). ‹ och arket inom deltestet. "Avsluta deltestet" med dialog på sista uppgiften (finns), "Lämna in" med dialog efter sista deltestet.

### 2.8 Personlighetstestet (kort)

Samma ram, ingen klocka, räknare "12 / 50" tryckbar. Likert som fem lika breda knappar 56 px på en rad (desktop) och staplade 52 px (mobil), designsystemets färger utan gradient. Det enda undantaget från välj + Nästa: ett tryck går vidare efter 250 ms, för det finns inget rätt svar och 50 extra tryckningar är för många. ‹ finns alltid. Översikten med 67×15 px knappar ersätts av arket.

---

## 3. Layout per innehållsform

Regel: på desktop 1400×900 och mobil 412×915 ska alla svarsalternativ synas utan scroll i utgångsläget. Utrymmet är 900 − 60 − 76 = 764 px på desktop och 915 − 60 − 76 = 779 px på mobil (minus safe area på iPhone, räkna med 745). Mobilkolumnen är 412 − 32 = 380 px bred. Alla måtten nedan är satta för att hålla den regeln med marginal.

### 3.1 Gemensamma svarskomponenter

- **Svarsrad (text):** min-höjd 52 px, radie 12, `papper` med 1 px `kant`, bokstavsmärke 24×24 till vänster (12/600 ink-3), text 16/400 ink-1, 14 px inre marginal, 8 px mellan rader. Markerad: 2 px ink-1-kant. Efter rättning: det valda i ink, det rätta i koppar med kopparpunkt till höger, övriga nedtonade till 50 %, aldrig rött (som i dag).
- **Svarskort (bild):** kvadrat eller 4:3, radie 12, bokstav uppe till vänster 11/600, figur centrerad med 12 px marginal. Samma markering som raden. Min 96 px i varje led.
- **Tre fasta svar (Sant/Falskt/Går inte att avgöra):** tre lika breda knappar 56 px på en rad, 8 px mellan, text 14/600, alltid på en rad även på 360 px ("Går inte att avgöra" bryts på två rader inne i knappen).
- **Hover, fokus, aktiv:** hover `papper-2`, fokus 2 px `fokus`-ring med 2 px offset, aktiv (tryck) skala 0,98 i 120 ms. Alla träffytor minst 44×44.

### 3.2 Bildmatris (Figurer och mönster)

- Mobil: matris 264×264 (3 × 88 px celler) centrerad, radie 16, `papper`. Under: uppgiftsraden "Vilken figur passar i den tomma rutan?" 14/500, sedan sex svarskort i 3×2, (380 − 16)/3 = 121 px breda, 96 px höga. Totalt 264 + 12 + 20 + 12 + 200 = 508 px. Ryms med 270 px över.
- Desktop: kolumn 432. Matris 336×336, sex kort 3×2 à 133×104. Totalt cirka 600 px. Ryms.
- Samma lodräta ordning på båda enheterna, så att användaren känner igen sig.
- I Träna fylls luckan med rätt figur efter svaret (finns), Förklaringen under korten.

### 3.3 Figurserie och spatial figur

- Figurserie, mobil: serien som 3×2 rutor à 121×100 i en ram (som nivåtestet ritar i dag), sex svarskort 3×2 à 121×96. Cirka 450 px. Desktop (672): serien som en remsa med sex rutor à 104 px, svarskorten på en rad à 104 px. Cirka 260 px.
- Spatial: figurkortet överst (figuren 160 px bred till vänster, eyebrow och uppgiftstexten till höger, som i dag), fyra svarskort 2×2 à 186×150 på mobil, 4 på rad à 100 % / 4 på desktop. Ryms.
- Bryter-uppgiften i figurserier: samma rutor, men de sex rutorna i serien är själva svaren; etikett "Vilken figur bryter mönstret?" ovanför.

### 3.4 Text med premisser (Deduktiv slutledning)

- `DeduktivLayout` behålls: desktop två kolumner (premisser 560, uppgift och svar 400), mobil premisskortet fäst överst med `max-h-[42vh]` och egen scroll, uppgiften under.
- Premisskortet heter alltid "Villkor" (inte "Premisser" i vissa uppgifter). Hjälpraden "Utgå bara från det som står." står i startskärmen, inte ovanför varje uppgift.
- Svarsrader 52 px, fem rader = 292 px. Med premisskortet 42 vh (384) och rubrik: 384 + 24 + 44 + 292 = 744. Precis på gränsen på iPhone med safe area; därför får premisskortet `max-h-[38vh]` när det finns fem alternativ (ramen räknar).

### 3.5 Lång passage med påståenden (Ord och text)

- Mallen är `VnUppgift`: texten i en ram fäst överst, `max-h-[42vh]` på mobil och egen kolumn på desktop (560 bred, hela höjden med egen scroll), ett påstående i taget under med eyebrow "PÅSTÅENDE 2 AV 4 OM TEXTEN", påståendet 17/600, tre knappar 56 px.
- Nivåtestet går över till samma form (ställningstagande 7). Räknaren räknar påståenden: "6 / 40". Arket visar påståendena grupperade per text.
- Textrubriken och ämnesraden ("Arbetsliv · Svårighet ●○○") i nivåtestet: svårigheten bort, ämnet kvar som eyebrow.

### 3.6 Tabell och diagram (Siffror och tabeller)

- Desktop: två kolumner, underlaget (inledning + tabell eller diagram) vänster 560 med egen scroll, uppgiften och fyra svarsrader höger 400. Svaren står på y ≈ 200, inte 845.
- Mobil: underlaget fäst överst `max-h-[44vh]` med egen scroll (tabellen scrollar i sidled i sin ram, finns i `VnUppgift`), uppgiften 17/600 och fyra svarsrader 52 px under. 44 vh (403) + 24 + 48 + 232 = 707. Ryms.
- Diagrammets höjd låses till 240 px i underlaget (i dag upp till 450). Hela diagrammet finns i genomgången i full storlek.
- Flera uppgifter per underlag: underlaget står kvar, bara uppgiften och svaren byts (ingen scroll till toppen när underlaget är samma).

### 3.7 Talserie och ordförråd

- Talserie: talraden i en ram överst (sex rutor 56×48 med "?" sist, radie 10), eyebrow "VILKET TAL KOMMER HÄRNÄST?", fem svarsrader 52 px. Cirka 400 px. Ryms.
- Ordförråd: ordkortet överst (eyebrow "MOTSATSORD", ordet 28/700 versaler, hjälpraden), fem svarsrader. Cirka 380 px. Ryms.

### 3.8 Uppgiftsarket (ersätter rutnätet och segmentstapeln)

- Öppnas från räknaren i huvudet, som ett ark nedifrån på mobil (max 70 vh) och en popover under räknaren på desktop (360 px bred).
- Rubrik "Uppgifter", rad "9 av 15 besvarade". Celler 44×44, radie 10, 8 px mellan, fem per rad på mobil, åtta på desktop. Besvarad: `ton` med ton-ink-siffra. Aktuell: 2 px ink-kant. Obesvarad som man gått förbi: kopparkant. Kvar: `kant`.
- Tryck på en cell stänger arket och visar uppgiften. Esc eller tryck utanför stänger.
- Verbalt: grupperat per text med textens rubrik som mellanrubrik.

---

## 4. Resultatskärmen

En struktur, `TestResultsPage` som grund, med varianter bara i huvudtalet och nästa steg.

```
VÄGG (mörk)
  Topprad: [X]  Figurer och mönster          20 nov
            Nivåtest, grundnivå
  Eyebrow:  NIVÅTESTET KLART  (TRÄNINGEN KLAR / NIVÅKOLLEN KLAR / ÖVNINGSPROVET KLART)
  Huvudtal: 11 av 15 rätt        (Nivåkoll: "5 av 10" nivå; Träna: "3 av 4 rätt")
  Två tal:  14:20 av 20 min  |  2 över provets tid     (Träna: nivån +0,2  |  tempo)
  En mening om vad talet betyder (finns i Nivåkollen och Träna i dag)

GOLV
  Kort 1  GENOMGÅNG: "Femton uppgifter att titta på", tre miniatyrer, knapp "Gå igenom"
  Kort 2  VAR DU TAPPADE: mönster eller uppgiftstyp med stapel per rad
  Kort 3  TEMPO (gränslägen) eller KURVAN (Träna, Nivåkoll, övningsprov)
  Kort 4  NÄSTA STEG: en primärknapp per läge:
            Nivåkoll → "Träna på grundnivå"
            Träna → "Träna igen i morgon" (låst tills i morgon) eller "Gör Nivåkollen"
            Nivåtest → "Alla tester" (eller nästa nivå när den är öppen)
            Övningsprov → "Plan inför provet"
  Länk    "Tillbaka till Rekryteringstester"
```

- Kortordningen är fast. Ett kort som saknar data tas bort, det visas aldrig tomt.
- Genomgången är samma vy som sessionen (samma ram, räknaren "3 / 15", ‹ och Nästa i foten, Förklaringen under svaren), så användaren lär sig en skärm till, inte två.
- Två tal max på väggen, enligt regeln data som bild och inte text; resten i korten.
- Huvudtalet räknas upp 600 ms vid inträde (ingen animation vid `prefers-reduced-motion`).
- Eyebrow-orden följer mönstret "[Läget] klart" och ingenting annat ("Nivåkollen sparad, figurserier" och "KLART" försvinner).

---

## 5. Ordlista

En term per sak. Gäller all användartext i sessioner, startskärmar, resultat och Tester. Inga talstreck någonstans. Aldrig "pass" i användartext (Dagspasset är ett produktnamn och undantaget).

| Sak | Termen | Ersätter |
|---|---|---|
| Enheten | **uppgift** ("Uppgift 3 av 15", "15 uppgifter") | fråga, passage, text, underlag som räkneenhet |
| Verbalt | **texten** är underlaget, **påståendet** är uppgiften; räknaren räknar påståenden | passage |
| Numeriskt | **underlaget** (tabell eller diagram), uppgiften | graf, tabell som rubrikord |
| Typerna | Figurer och mönster, Figurserier, Deduktiv slutledning, Ord och text, Siffror och tabeller, Talserier, Spatial förmåga, Ordförråd (som i Tester) | Logiktest, Verbalt resonemang, Numeriskt test, matrislogik |
| Nivåerna | **grundnivå, avancerad nivå, expertnivå** (gemen i löptext, "Grundnivå" bara som eyebrow) | grund, Grund, nivå 3 som nivåord |
| Träningens nivå | "Träna, grundnivå" i undertiteln; den adaptiva nivån ("nivå 3,7") bara på kurvan och i resultatet | "Träna, nivå 3" |
| Lägena | **Nivåkollen, nivåtest, Träna, övningsprov, I-provet** | nivåmätning, mätning, prov, generalrepetition i användartext |
| Huvudets rader | titel = typens namn, undertitel = "[läge], [nivå]" eller "[läge], samma format som [namn]" | mönstrets namn som titel, "Vårt format" som undertitel |
| Gå vidare | **Nästa** | Nästa fråga, Nästa fråga →, Nästa uppgift, Svara och gå vidare |
| Bekräfta i Träna | **Svara** | |
| Sista steget | **Lämna in** (testlägen), **Visa resultatet** (Nivåkoll, Träna) | Avsluta testet, Avsluta och se resultat |
| Vet inte | **Vet inte** (Nivåkoll), **Vet inte, visa förklaringen** (Träna) | Vet inte, visa regeln / lösningen |
| Förklaringen | **Förklaringen** (eyebrow), med **Regeln** som fet första rad där banken har en, **Ditt misstag** under | Regeln som eyebrow, Rätt svar är C som rubrik |
| Tre fasta svar | **Sant / Falskt / Går inte att avgöra** | Kan ej avgöras |
| Tillbaka i foten | ‹ med aria "Föregående uppgift" | Föregående som text |
| X | aria **Avbryt**; dialog "Avbryta [nivåtestet / träningen / Nivåkollen / övningsprovet]?" med "Fortsätt" och "Avbryt" | Avsluta testet, Lämna testet, Avsluta träningen, Stäng |
| Inlämning | "Lämna in?" med "Lämna in" och "Fortsätt" | Lämna in testet?, Slutför testet?, Se min profil |
| Klart | "[Läget] klart" som eyebrow: Nivåtestet klart, Träningen klar, Nivåkollen klar, Övningsprovet klart | Testet klart, Träningen sparad, Klart, Nivåkollen sparad |
| Provets tid | **provets tid** (referensen per uppgift) | budget, tidsgräns i användartext |
| Startknappar | Starta testet, Starta Nivåkollen, Starta träningen, Starta övningsprovet, Starta deltestet; "Fortsätt …" när en session pågår; "Gör om testet" bara på startsidan efter ett avslutat försök | |
| Tillbaka från resultat | **Tillbaka till Rekryteringstester** | Alla tester, Till Alla tester, Tillbaka |
| Paywall-buggen | "Träna talserier ingår i Premium." (ingen `${NAMN}et`) | "Träna talserieret" |

Copywritern (svensk-ux-copywriter) äger de färdiga strängarna. Det här är mönstret och det som måste vara lika.

---

## 6. Övergångar och känsla

Målet är app-känsla utan att kosta LCP. Alla animationer är CSS-transforms och opacity, inga layoutanimationer, och alla stängs av under `prefers-reduced-motion`.

- **Byte av uppgift:** utgående innehåll 0 → −12 px, opacity 1 → 0 på 120 ms; inkommande +12 → 0 px, 0 → 1 på 160 ms, `ease-out`. Huvud, tidslinje och fot står stilla. Underlag som är samma (flera uppgifter per text eller tabell) står stilla, bara uppgiftsdelen byts.
- **Markering:** 120 ms skala 0,98 → 1 på tryck, kanten tonar in 120 ms. Lätt vibration 10 ms på Android via `navigator.vibrate` vid bekräftelse (iOS Safari stöder det inte, ingen fallback).
- **Bekräftelse i Träna:** rätt svar: kopparkant och kopparpunkt tonar in 160 ms, Förklaringen glider in nedifrån 200 ms och scrollas fram. Fel: det valda får ink-kant, det rätta koppar, samma panel. Ingen skakning, inget rött, inget ljud.
- **Tidslinjen:** bredden animeras 240 ms `ease-out` per tick i referensläge; i gränsläge uppdateras den per sekund med `transition: transform 1s linear` så att den glider.
- **Ringen:** `stroke-dashoffset` med 1 s linjär övergång, siffran byts utan animation. Koppar sista två minuterna, ingen blinkning.
- **Primärknappen:** inaktiv tills ett val gjorts i lägen som kräver val (Svara). Nästa är alltid aktiv i testlägen (hoppa över är tillåtet). Vid sparande visar knappen en 16 px spinner inne i texten, aldrig en helskärmsladdare, och knappen behåller sin bredd.
- **Optimistisk nästa:** i testlägen byts uppgiften direkt vid Nästa, svaret skickas i bakgrunden med kö och omförsök (`useRobustAnswerSaving`-mönstret). Misslyckas sparningen efter omförsöken visas en banner "Ett svar sparades inte" med "Försök igen" i foten, aldrig ett blockerande fel mitt i tiden. I Träna, där servern rättar, väntar vi på svaret: knappen visar spinnern, högst 250 ms innan skelettet för Förklaringen ritas.
- **Laddning:** sessionens första uppgift renderas på servern (eller kommer i startknappens POST-svar och ritas direkt). Skelett bara om data saknas, och då med den färdiga layoutens exakta mått. Verbalt och numeriskt nivåtest väljer uppgifter i klienten i dag; det flyttas till servern (seedat på sessions-id, samma urval) så att de får samma första målning som de andra.
- **Resultatskärmen:** väggen tonar in 200 ms, huvudtalet räknar upp 600 ms, korten kommer med 40 ms förskjutning var. Ingenting flyttar efter första målningen.
- **Prestandabudget:** LCP under 1,0 s för sessionsvyn (texten i första uppgiften eller matrisens SVG), CLS 0, inga webbfonter som blockerar. Inga nya bibliotek; framer-motion i personlighetstestet tas bort.

---

## 7. Byggordning

Varje steg ger synlig förbättring och går att skeppa för sig. Implementation på Opus enligt regeln; design godkänns i artefakt före steg 2.

1. **Ordlistan** (avsnitt 5). Bara strängar och titlar: typnamn, nivåord, knappar, dialogtexter, eyebrows. Rör ingen layout och ingen logik. Synligt överallt dag ett. Inkluderar paywall-buggen och verbalt 25 → 20 minuter.
2. **Sessionsramen** (avsnitt 1). En `Sessionsram`-komponent ur `PassShell` med huvud, tidslinje, fot, avbryt-dialog, inlämningsdialog, tangentbordslyssnare och uppgiftsarket. Alla femton flöden byter till den utan att ändra svarsbeteende: X vänster, räknare, ring eller tidslinje, sidomenyn borta, rutnät och segmentstapel ersatta av arket. Det här är steget som gör att "samma test ser lika ut oavsett dörr".
3. **Layouten per innehållsform** (avsnitt 3). Matrisens mått, numeriskt i två kolumner och fäst underlag, verbalt ett påstående i taget, deduktivt 38 vh vid fem alternativ, svarsrader 52 px överallt. Resultat: svaren syns utan scroll på båda enheterna.
4. **Svarsbeteendet** (avsnitt 2). Välj + Nästa i alla testlägen, Träna med de två kryssrutorna, "Vet inte" i foten där det hör hemma, expert verbalt och numeriskt öppnas upp. Kräver att passflödenas fem kopior av tillståndsmaskinen blir en (inventeringen avsnitt 4), vilket är samma arbete.
5. **Startskärmarna** (2.3 till 2.7). Startarket som komponent med kort och lång variant, "Fortsätt" när en session pågår, sessionen skapas vid knapptryck överallt. Kvotkontrollen följer med POST:en.
6. **Klockan** (ställningstagande 5). Nivåtesten får nedräkning och automatisk inlämning från serverns starttid. Eget steg eftersom det påverkar tempostatistik och Din utveckling och bör mätas för sig.
7. **Resultatskärmen** (avsnitt 4). `TestResultsPage` blir den enda med varianter per läge; sex resultatvyer pensioneras.
8. **Övergångar och mätning** (avsnitt 6). Animationer, optimistisk nästa, `session_startad`/`session_klar` med `test_kind`, `lage`, `niva`, `format` (de gamla händelsenamnen behålls). Legacy-sluggarna `*-prov` tas bort eller redirectas.

Klicktest i riktig webbläsare (Pixel 7 och desktop, skärmdump per steg) efter steg 2, 4 och 7, inte efter varje fix. Appen Testklar (`/app/tester/...`) ingår i klicktestet efter steg 2 eftersom ramen är `fixed inset-0`.

---

## 8. Öppna frågor till de andra två

- **saas-lead:** nedräkning med automatisk inlämning i nivåtesten (steg 6), antalet uppgifter i Nivåkollen (tolv för alla eller per typ), och om "Ett tryck räcker som svar" ska vara på som standard för den som redan tränat med dagens figurserie-Träna.
- **art director:** sidomenyn borta på desktop, matrisens mått (336/264), tidslinjen utan textrad, "Förklaringen" som eyebrow i stället för "Regeln", ringen 40 px i huvudet bredvid räknaren.
- **testansvarig (via saas-lead):** leverantörsfakta i 2.2 före användartext, verbalt nivåtest med ett påstående i taget, svårighetsprickarna bort ur matrisens nivåtest.

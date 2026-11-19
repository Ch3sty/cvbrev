# Granskning: ordförråd omgång 2, version 3 (103 uppgifter)

Testansvarig, 2026-11-19. Underlag: `docs/fragebank/ordforrad-2026-11-19-omg2.md`, de 103 raderna med `fran_version: 3` i `src/lib/ordforradV1/bank*.json` (samma innehåll som `kandidater/hand-2026-11-19-omg2.json`), granskningen av omgång 1 som standard, SO och SAOL via svenska.se:s sök-API (cachen från bygget plus egna uppslag för ett fyrtiotal ord: alla flaggade facit, flera Wiktionary-belägg och de distraktorer jag föreslår nedan) och `scripts/ordforrad-verifiera.mjs --natet --fran 3`, körd själv. Bankfiler och skript är inte ändrade.

## Beslut

**Godkänt med villkor.** Alla 103 facit är rätt betydelse i exemplet och belagda. Inget uppslagsord och inget facit finns redan i banken som uppslagsord eller facit, och inga dubbletter inom omgången. Inga tankstreck i facittexter, misstagstexter eller exempel. Nivåerna håller, med de anmärkningar som står nedan.

19 rader ska rättas i `kandidater/hand-2026-11-19-omg2.json` (och `HANDSKRIVET`/`MISSTAG` i `bygg-v3.mjs`) före aktivering. Ingen rättelse rör facit och ingen uppgift behöver strykas, så id-numren står kvar. Fördelning: tio facittexter eller misstagstexter, fyra exempel (två av dem med ny facittext), fem distraktorer.

## Rätta före aktivering

| Id | Problem | Rättelse |
|---|---|---|
| of-g-s-69 förmåga, kapacitet | Facittexten är SO:s text för uppslagsordet förmåga, inte för kapacitet, och slutar på "eller dylikt". | Handskriven: "möjlighet att prestera eller åstadkomma något". |
| of-g-s-73 dessutom, därtill | Facittexten "i tillägg till detta" är en norvagism. Samma uttryck står i misstagstexten för också i of-g-m-65. | Handskriven: "utöver det". |
| of-g-s-82 uppleva, erfara | Facit håller (SO uppleva 1 jämför erfara 1, SAOL uppleva "vara med om, erfara"), men "Vi fick erfara mycket under resan" är inte idiomatiskt. Erfara används om att få känna på eller bli varse något. | Nytt exempel: "Under första året fick hon uppleva hur det är att leda ett team." Facittexten står kvar. |
| of-g-m-62 köpare, säljare | Facittexten är SO:s yrkesbetydelse, "person som yrkesmässigt sysslar med försäljning". I exemplet är säljaren parten i en affär. | Handskriven: "den som säljer något". |
| of-g-m-65 inne, ute | Misstagstexten för också: "bland annat i tillägg". | "Också betyder även." |
| of-g-m-67 lugn, nervös | Facittexten "som har orolig läggning" är läggning, exemplet ("lugn inför intervjun") är ett tillfälligt tillstånd. | SO nervös, underbetydelse: "som tillfälligt är orolig". |
| of-g-m-72 levande, död | Distraktorn **lam** har SO-underbetydelsen "kraftlös" och kan läsas som motsats till levande i bildlig mening (en lam skildring mot en levande skildring). Samma skäl som elektrisk i omgång 1. | Byt lam mot **hes** (SO adjektiv, en förekomst på grund i of-g-m-50, blir två, inom OF7). Misstagstext: "Hes betyder som låter oren och skrovlig." |
| of-g-m-76 kvinnlig, manlig | Distraktorn **pratglad** ger en könsstereotyp i en uppgift om kön. Ingen kandidat ska behöva fundera på om testet antyder något. | Byt pratglad mot **vänsterhänt** (SO adjektiv, inte i banken). Misstagstext: "Vänsterhänt betyder som använder vänster hand mest och bäst." Pratglad finns kvar i of-g-s-85. |
| of-a-s-93 innovativ, nyskapande | Facittexten "som visar förmåga till nyskapande" förklarar ordet med sig självt. | Handskriven: "som skapar något nytt och originellt". |
| of-a-m-64 underordnad, överordnad | "Hon har en underordnad roll i projektet" betyder en oviktig roll. Där är framträdande motsatsen, inte överordnad ("en överordnad roll" säger ingen). Facittexten "placerad i en ställning av inflytande över" är dessutom stel. | Nytt exempel: "Hon är underordnad avdelningschefen." Facittext från SAOL överordnad: "högre i en hierarki". |
| of-a-m-65 skuld, fordran | Misstagstexten för bidrag är betydelsen "(arbets)insats som utgör del i större helhet". I en uppgift om pengar läser kandidaten bidrag som ekonomiskt stöd. | SO bidrag 2: "Bidrag betyder ekonomiskt stöd, vanligen i pengar." |
| of-a-m-68 invandring, utvandring | Facittexten "det att utvandra" förklarar ordet med sig självt. Distraktorn **bostadsbrist** bredvid invandring ger en politisk laddning som vi inte behöver i ett rekryteringstest. | Handskriven facittext: "det att flytta från sitt land för att bo i ett annat". Byt bostadsbrist mot **födelsetal** (SO substantiv, inte i banken). Misstagstext: "Födelsetal betyder antalet födda per tusen invånare och år." |
| of-e-s-85 emanera, härröra | Misstagstexten "Fluktuera betyder undergå fluktuation" förklarar ingenting. | "Fluktuera betyder växla upp och ned i storlek eller värde." |
| of-e-s-90 kompatibel, förenlig | SO och SAOL har bara den abstrakta betydelsen ("möjlig att samordna och få att överensstämma med något"). Datorexemplet ger "förenligt med äldre datorer", som ingen säger. | Nytt exempel: "Förslaget är inte kompatibelt med gällande regler." Facittexten står kvar. |
| of-e-s-91 preferens, företräde | I exemplet betyder preferens förkärlek (SO preferens: "något som man föredrar", jämför förkärlek). Företräde har inte den betydelsen i SO; "har ett tydligt företräde för svenska varor" är fel svenska. Den handskrivna facittexten beskriver preferens, inte företräde. Belägget (SAOL preferens: "företräde, förmånsrätt") gäller förtursbetydelsen. | Nytt exempel i förtursbetydelsen: "Medlemmar har preferens när platserna fördelas." Facittext från SO företräde 1: "rätt att komma i fråga i första hand". |
| of-e-m-13 deduktiv, induktiv | Facittexten "som bygger på induktion" förklarar ordet med sig självt. Induktiv är också det enda alternativet på -duktiv, så den som bara ser på formen hittar svaret. | Handskriven facittext: "som drar allmänna slutsatser utifrån enskilda fall". Byt spekulativ mot **produktiv** (SO adjektiv, inte i banken). Misstagstext: "Produktiv betyder som har stor förmåga att producera." |
| of-e-m-15 endogen, exogen | Distraktorerna **cyklisk** och **periodisk** är nära synonymer (SO cyklisk "som regelbundet upprepas", periodisk "som uppträder med jämna mellanrum", jämför regelbunden). Exogen är dessutom enda alternativet på -gen. | Byt periodisk mot **heterogen** (SO adjektiv, facit i of-e-m-06, blir två förekomster på expert, inom OF7; inte synonym eller motsats till endogen eller exogen). Misstagstext: "Heterogen betyder uppbyggd av olikartade beståndsdelar." |
| of-e-m-19 konvergera, divergera | Misstagstexten "Extrapolera betyder utföra extrapolation" förklarar ingenting. | "Extrapolera betyder uppskatta värden utanför ett känt område utifrån värdena inom det." |
| of-e-m-21 zenit, nadir | Exemplet "Solen står i zenit mitt på dagen" är fel i Sverige: solen når aldrig zenit norr om Kräftans vändkrets. | Nytt exempel: "I tropikerna kan solen stå i zenit mitt på dagen." |

Efter rättelserna: kör `bygg-v3.mjs --torr`, kontrollera att alla 103 går igenom med oförändrade id, sedan skarpt, och sedan verifieraren med `--natet --fran 3`.

## Skribentens flaggor

**De 26 belägg som bara vilar på Wiktionary och synonymer.se: godkända.** Alla är etablerade par i vardagssvenska, och för flera finns indirekt stöd i SO eller SAOL som stärker dem:

* trevlig och angenäm: SO trevlig har underbetydelsen behaglig, och SO angenäm har SYN behaglig 1. Tvåstegsbelägg inom SO.
* zenit och nadir: SO nadir definieras som punkten "diametralt motsatt zenit", och SO zenit har jämför nadir. I praktiken SO-belagt.
* rekrytera och värva: SAOL ger nästan samma definition ("skaffa nya medlemmar el. personal" mot "skaffa nya medlemmar el. anhängare").
* konsolidera och befästa: SAOL konsolidera "säkra, förstärka", SO befästa 2 "upprätthålla eller förstärka vissa rådande förhållanden". Exemplet (befästa sin position) är träffande.
* kompatibel och förenlig: SO:s definitioner överlappar ("få att överensstämma" mot "som överensstämmer"). Exemplet rättas ovan.
* essentiell och grundläggande: svagast av synonymerna. SO essentiell är "mycket väsentlig", med underbetydelsen livsviktig, som är den exemplet ("Vatten är essentiellt för allt liv") egentligen avser. "Grundläggande för allt liv" går att säga, så godkänt. Om exemplet skrivs om senare: "Goda kunskaper i svenska är essentiella för tjänsten."
* kvantitet och kvalitet är ett kontrastpar snarare än ett strikt motsatsord, men det används som motsatspar i vardagen ("kvalitet före kvantitet") och inget alternativ konkurrerar. Godkänt.
* lokal och global: SO lokal har motsats utbredd, men global är det motsatsord folk använder. Godkänt.

Övriga (köpare, plus, uppåt, ny, överst, stiga, levande, hungrig, natt, inåt, kvinnlig, ihop, underordnad, skuld, analog, högkonjunktur, makrokosmos, utopi) är självklara par där SO bara saknar MOTSATS-hänvisningen.

**Facit på grund som är ovanligare än uppslagsordet: godkända.** Angenäm (7 141) är ett ord de flesta vuxna känner igen ("angenäm resa"), har SO-stöd i två steg och fungerar i exemplet. Erfara (21 558) känns igen via erfarenhet och erfaren, och SO binder det till uppleva. Svagheten var exemplet, som rättas ovan. Olikhet, berömd och modifiera är okomplicerade. Läs av andel rätt på of-g-s-70 och of-g-s-82 efter 30 dagar, samma som för alldaglig i omgång 1.

**Fackordsparen på expert: godkända.** Hausse och baisse, endogen och exogen har SO MOTSATS, zenit och nadir är i praktiken SO-belagda (se ovan) och makrokosmos har jämför-hänvisning från mikrokosmos. Expert ska pröva bildningsord, och alla fyra går att lösa genom uteslutning eftersom distraktorerna är tydligt fel. Rättelserna ovan gäller exemplet för zenit och distraktorerna för endogen. Läs av andel rätt efter 30 dagar som skribenten föreslår.

**Debet och kredit på avancerad: godkänt.** SO debet har MOTSATS kredit. "Debet och kredit" är ett fast uttryck som många känner igen utan att ha arbetat med bokföring, och distraktorerna (aktie, ränta, moms, valuta) är inga motsatser. Kredit i vardagsbetydelsen lån gör ingen skada eftersom svaret är detsamma. Facittexten "högra sidan av ett konto i bokföringen" stämmer. Flytta till expert bara om andelen rätt blir låg.

## Anmärkningar (inte blockerande)

* **Form avslöjar svaret på expert.** Av de tolv nya motsatsorden på expert kan sex lösas på formen utan att man kan ordet, eftersom facit är enda alternativet med samma för- eller efterled: deduktiv, makrokosmos, endogen, konvergera, utopi och mikroskopisk. Hausse och baisse samt aktiva och passiva rimmar. Version 1 och 2 hade ett sådant par på expert (homogen). Rättelserna ovan bryter mönstret för deduktiv och endogen. För de andra hittade jag ingen distraktor som både delar formen och är säker (teleskopisk kan läsas som motsats till mikroskopisk), så de står kvar. Läs av andel rätt per uppgift; ligger någon över 90 procent på expert är det formen som löser den. På avancerad är fem av sexton formpar (intern, underordnad, invandring, maximum, högkonjunktur), i linje med version 1 (17 av 44).
* **Distraktorfamiljer på grund.** Kroppsliga tillstånd återkommer som distraktorer i adjektivuppgifterna (andfådd, sjösjuk, förkyld, solbränd, utvilad, rastlös, frusen, sömnig, svettig, yr), alla inom OF7. Den som gör många grunduppgifter kan lära sig att facit sällan är ett tillstånd. Variera nästa omgång.
* **Lätta för nivån.** Maximum och minimum på avancerad samt transparent och konsultera på expert är lättare än nivån. Inget är fel. Aktiva har höga popularitetstal eftersom ordformen också är plural av aktiv, men svaret blir passiva i båda läsningarna, så ingen tvetydighet.
* **Närliggande par på olika nivåer.** Legal och olaglig (avancerad) och legitim och laglig (expert). Tillåtet, olika ord.
* **Stela SO-texter som står kvar:** isär ("med upphävande av förbindelsen"), rättighet ("förmån som någon åtnjuter …"), analys ("… av abstrakt företeelses beståndsdelar"). Korrekta men tunga. Byt om bygget ändå körs: isär "så att delarna skiljs åt", rättighet "det man har rätt till".
* **Exempel med lätt ovana formuleringar:** "Fisken var fortfarande levande" (vanligare: levde fortfarande) och "Hissen tar maximum åtta personer" (vanligare: högst). Godtas.

## Verifieringen

`node scripts/ordforrad-verifiera.mjs --natet --fran 3`: version 3 har 103 uppgifter, inte aktiverad. "Uppslag från version 3: 0 fel." Banken klarar V1 till V9. De fem anmärkningarna om falska vänner gäller version 1 och är kända sedan tidigare.

Egna kontroller: inget uppslagsord eller facit i version 3 finns som uppslagsord eller facit i version 1 eller 2, och inga dubbletter inom omgången. Tankstreck: inga. De föreslagna nya distraktorerna (hes, vänsterhänt, födelsetal, produktiv, heterogen) finns i SO i rätt ordklass med definition och är inte synonymer eller motsatser till ord eller facit i sina uppgifter; bygget prövar dem ändå mot alla fyra källor.

## Godkända utan anmärkning

Alla id som inte står i tabellen under "Rätta före aktivering" är godkända: 84 av 103.

## Är aktiveringen säker?

Samma mekanik som version 2 (sessionerna pinnar `ord_version` respektive id-listor, `poolFor` filtrerar på `fran_version`), och skribentens steg 2 till 5 i omgångsdokumentet stämmer. Glöm inte changelogen: percentilen blandar version 1 till 3, och artiklarnas uppgift 1 kan skilja sig från det nystartade provet i upp till ett dygn.

Aktivering: nej, rätta de 19 raderna i tabellen ovan och kör bygget och verifieraren igen.

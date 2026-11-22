# Logg P2: tester och CV (publikt omgång 3, 2026-11-22)

Grenen `design/publikt-omgang3` i `C:\Users\chris\cvbrev-publikt3`. Inget är committat eller pushat. Inga migreringar. Inga anrop mot produktionen.

Kontroller: `npx tsc --noEmit` kördes en gång i slutet av paketet (2,4 GB ledigt enligt `arbetsyta.mjs`) och gick igenom utan fel för hela arbetskopian. `startval.test.ts` (6) och byggarens befintliga tester (13) kördes för skapa-cv och gick igenom. Ingen dev-server, inget bygge, ingen webbläsare och ingen SEO-diff: inget i paketet är sett renderat. Det är det som återstår för alla sidor: klicktest i 375, 412 och 1440 och grinden i integrationen.

Inga nya rader behövdes i `scripts/seo-baslinje/publikt-omgang3-undantag.json`: alla byten i paketet täcks av rader som redan fanns (`RUBRIK_BYTT` för "Lös uppgifterna i din takt", `LD_UNDANTAG` för rekryteringstester, linkedin, cv-mallar, cv-exempel/kategori/vard, `H1_BYTT`, `RUBRIK_BYTT`, `FAQ_BYTT` och `META_BYTT` för cv-analys). Grinden visar nya rubriker bara som information (`seo-diff-artiklar.ts` rad 919).

Ägarens besked "inga genvägar" (kom under bygget) är genomfört: provet utan konto startar från det lyfta kortet med vald testtyp, kravprofilvalet på personlighetstestet fungerar, startbladet på skapa-cv bär valet in i byggaren, uppladdningen på cv-analys och cv-mallar är den riktiga (cv-analys har nu också dra och släpp), filterchips, sök och "Visa alla" på cv-mallar fungerar.

---

## 1. /verktyg/rekryteringstester (skiss rekryteringstester)

Filer: `page.tsx` (omskriven), `rekryteringstester.css` (ny, prefix `rt-`), `components/ProvVal.tsx` (ny), `components/rekryteringstester-faq-data.ts` (fyra ordbyten).

**Byggt.** `Sida farg="tran"`, skissens ordning sektion för sektion:
- Hjälten med grundens `Testram` (förvalet, kontrollräknad matris, uppgift 9 av `T.matrisGrund.fragor`) och två `Svav`: resultatet "12 av {fragor}" och Förklaringen med matrisens regel. Svävarna är `aria-hidden`.
- Det lyfta kortet: "Gör ett prov direkt, utan konto" med typvalet "Vilket test vill du prova?". Valet är ett riktigt GET-formulär till `/verktyg/rekryteringstester/prova?typ=<typ>` med de nio typerna ur `PROV_TYPER` som radioknappar (Nio-glyferna), Matrislogik förvald. Det fungerar utan JavaScript; `ProvVal` är en liten klientkomponent bara för att behålla mätningen `article_cta_clicked` (position hero, target med typen). Bredvid: bilden av resultatet efteråt (role img, märkt Exempel) och bocklistan.
- Så fungerar det: filmen (`Produktfilm`, VideoObject oförändrat) bredvid rubriken, och de fyra stegen som fyra skärmar: startskärmen, talserien i ramen (uppgift 9), resultatet och uppgiftslistan med Förklaringen och Ditt misstag. Samma uppgift följer genom steg 2 till 4.
- Sex färdigheter med en liten bild var (`aria-hidden`).
- Åtta testtyper: nivåtrappan (Gratis, Premium, Premium) och ett kort per typ med en riktig uppgift i grundens `Testram`.
- Vilket test ska du göra: åtta inbjudningar med testtyperna som märken, guidelänken och provet som knapp (mätningen kvar).
- Personligheten som ö: profilen med de fem H3, kravprofilerna och frågorna, räknade ur tolkningen (se Beslut).
- Träning som syns: kurvan (märkt exempel, `aria-hidden`, inga tal), `Bankbredd` med raden om nivån, tre kort.
- Förbered dig: TRR-staplarna (58 och 67, staplar från noll) och Ingenjörens 20 procent, de sex råden som kort.
- Inför testet: tre guidekort med var sin bild, bara de som finns i bygget som förut.
- Guider per testtyp: tolv länkbrickor med h3 och glyf.
- `PremiumO` med priset ur plans.ts och fyra bockar, sedan frågorna i grundens `Faq` med knappen under.

**Uppgifterna ur bankerna** (id i koden vid varje konstant): talserie `ts-g-arit-01` (steg 2 till 4, med bankens regel och bankens misstag för svaret 50) och `ts-g-vaxel-01` (kortet), verbalt `v2-p10-aging-population` (de två första meningarna och första påståendet, som är sant ur just de meningarna), numeriskt `numv2-p01-q02` (månadsdatan som tabell), deduktivt `dd-g-d1-01`, figurserie `fs-g-vrid-01` (ritad med produktens `FigurV7`), spatial `sp-g-a-01` (ritad med `SpatialSvg`), ordförråd `of-g-s-01`. Matrisen i hjälten, i provresultatet och på matriskortet är grundens kontrollräknade förval. Skissens påhittade uppgifter (3, 7, 15, 31; kön med Ali, Britt och Cleo; skolmatsavtalet; Norr, Syd, Väst; UTFÖRLIG) används inte.

**Beslut.**
- Hjältens fetstil står kvar med ett ordbyte ("Fem uppgifter gratis här, ..."). Brickorna är dagens (åtta testtyper, {minuter} min per test, {provAntal} uppgifter utan konto); skissens "3 nivåer i varje testtyp" skrivs inte, eftersom alla typer inte har tre nivåer (talserier har grund och avancerad).
- Hjältens knapp går till provsidan som i dag (länkmålet står kvar); det lyfta kortet ligger direkt under.
- Stegtexterna: steg 2 och 3 har SEO:s nya lydelse, steg 1 står ordagrant, steg 4 har bara "Fråga för fråga" bytt mot "Uppgift för uppgift". HowTo, Offer och featureList följer ("lös uppgifterna", "Fem uppgifter utan konto", "uppgift för uppgift"), täckt av `LD_UNDANTAG`.
- FAQ: svaret om tid säger att klockan visar provets tid men inte stoppar (i stället för meningen om att pausa och att tiden räknar upp), svaret om gratis säger "Fem uppgifter ... och ser resultatet och förklaringen till en av dem", och "frågor per test" blir "uppgifter per test" i svaren om matrislogik och numeriskt. Alla frågor står.
- Ingressen till testtyperna: meningen om nivåtestet är ersatt med SEO:s "Grundnivån visar var du står i varje typ." Resten ordagrant.
- Premiumplattans text säger "Fem uppgifter gratis här ..." lokalt i sidan; `GRATIS_TESTRAD_PROV` i `gratis-copy.ts` är P1:s och har kvar "frågor" (P4 har redan önskat bytet).
- Personlighetsplattan räknas ur `smakprov-tolkning.ts` med exempelprofilen 88, 26, 72, 58, 52 (sidans egna värden i dag): `profilMening`, bandorden, `segment`, `kravUtfall` för Ledarskap och projektledning och Ekonomi och administration, och `LASNING` och `INTERVJU` för de två utslagen. Skissens egna formuleringar av frågorna används inte.
- Kurvan har inget tal (skissens 6,1 från 4,2 är struket); bankens tal visas genom `Bankbredd`.
- Testtypernas namn i ramarna är de publika (Matrislogik, Verbalt resonemang, Numeriskt resonemang).
- Rätt- och felfärgerna i resultatbilderna är två lokala tokens på `.rt-sida` med grundens värden ur `ram.css`.
- Den fasta knappraden i telefonen (`FastKnapprad`) är borta, som i skissen och på cv-analys.
- `/verktyg/rekryteringstester/prova` är orörd. Den är ett flödesskal med sessionsramens tokens (`data-rum="tran"`), och grundens färger lyfts medvetet inte på sidor med `data-rum` (`globals.css`, `:not(:has([data-rum]))`). Provets funktion och text är oförändrade.

**Ny text utan godkännande.** Etiketterna "Prova utan konto", "Från första uppgiften till genomgången", "Det här ser du efteråt", "Din profil, exempel", "Så läses profilen mot kravprofiler, exempel", "Frågor rekryteraren lär ställa, exempel", "Din utveckling, exempel", "Nivån i talserier över tre veckor", "Andel som fått göra test". Typvalets knapp "Starta provet" och etiketterna i valet. Nivåtrappans rader ("Ett test om dagen, valfri testtyp", "Svårare uppgifter, samma format", "Och övningsprov mot klockan"). Inbjudningarnas märken. Raden "Väger tungt: ..." under kravprofilerna (ur `vagerTungt`) och "Så kan du svara:". Länken "Se vad som ingår i Premium" till /priser. Premiums fyra bockar. Texterna i de ritade skärmarna (startskärmens regler, "Nivåtestet klart", tiderna, listans rader); de står i `role="img"` och är märkta Exempel.

**Avviker från skissen.** Brickorna (se Beslut). Kurvan utan tal. Fråga 3 och skissens frågeformuleringar ersatta av tolkningens meningar. Förbered dig behåller dagens hela ingress (med TRR-talen i texten) i stället för skissens kortade. Hjältens knapptext är dagens "Starta gratis test".

**Återstår.** Se sidan i webbläsare, särskilt de åtta ramarna i korten (figurserien med sex svar i 375), skärmarna i steg 1 till 4 och typvalet. Grunden behöver ta ReactNode-figurer i `Testram` (önskemål skrivet).

## 2. /verktyg/personlighetstest (skiss personlighetstest)

Filer: `page.tsx` (omskriven, lämnar `VerktygsMall`), `personlighetstest.css` (ny, prefix `pt-`).

**Byggt.**
- Hjälten med profilen som bild (Saras exempel genom tolkningen, bandord och femsegmentsskala utan siffror), "Ditt tydligaste drag" och "Rekryteraren lär fråga" (tolkningens mening för draget).
- Provet är det lyfta kortet: det fungerande `Personlighetsprov` ur artiklarna, oförändrat (`sida`), serverrenderat med fem svar i HTML:en. Bredvid: vad man får direkt och vad som väntar i gratiskontot.
- Så fungerar det: de fyra stegen som väg med en liten bild var.
- De fem faktorerna mot en kravprofil: sex radioknappar (KRAVPROFILER, Ledarskap och projektledning förvald). Varje faktorkort har sex mätare i HTML:en och CSS visar den som hör till valet, så valet fungerar utan JavaScript (utan `:has` syns det förvalda exemplet). Spannet är kravets band ur `bandFor` (hög från 70, mitt emellan eller hög från 40), Saras värde en kopparpunkt, axeln säger Låg, Mitt emellan, Hög. Inga siffror 1 till 5. Utfallet som chip; kortet där profilen ligger utanför får kopparkant.
- H3 "Frågor rekryteraren lär ställa" (SEO JA) på en ö med tolkningens två frågor och svar.
- Trappan 20, 50, 120 (tal ur konstanterna), med knapparna "Skapa konto gratis" och "Gör provet först" kvar.
- Frågorna ordagrant, med länken "Alla rekryteringstester" (SEO JA).

**Beslut.** Exemplet är samma profil som på testsidan. Där kravprofilen inte väger faktorn står "Inget krav i rollen". Trappans namn (Provet, Hela testet, Fördjupade testet) är stycken, inte nya H3. Provkomponentens form är P4:s (delas med två artiklar) och är inte ändrad; önskemål skrivet om skissens svarskort.

**Ny text utan godkännande.** "Från kryss till profil", "Din profil, exempel", "Fem faktorer med bandord", "Här är Saras profil, ett exempel, läst mot en av de sex kravprofilerna. Välj en annan roll så byts mätarna.", förklaringsraden, chipen "Passar kravprofilen", "Räkna med en fråga", "Inget krav i rollen", "Inför intervjun", öns två stycken, "Hela tolkningen följer med ett gratiskonto.", trappans rader och bocklista, "Det här får du" med fyra rader.

**Avviker från skissen.** Inga siffror på axeln (SEO). Fråga 3 (STAR, Premium) är inte ritad, eftersom frågan inte finns i koden. Provets svarskort har provets nuvarande form.

**Återstår.** Se sidan i webbläsare, särskilt provet i det lyfta kortet med resultatets två kolumner, och valet av kravprofil.

## 3. /verktyg/cv-analys (skiss cv-analys)

Filer: `page.tsx` (omskriven), `cv-analys.css` (ny), `components/CVAnalysMini.tsx` (formen, plus dra och släpp), `layout.tsx` (OG-beskrivningen).

**Byggt.** `Sida farg="cv"` i skissens ordning: hjälten med `CvArk` (poängen 93, chipet "7 poäng kvar till 100", fyndet Erfarenhet 30 av 35, maxpoängen ur poängmodellen); det lyfta kortet med uppladdningen och "Det här får du se"; stegen som `VagSteg` byggd ur HowTo-listan; de sju delarna med stapeln (`aria-hidden`) och delens text ordagrant; "Vägen till 100 poäng" på en vägg; skrivtipsen med före och efter; `PremiumO`; frågorna. WebApplication, HowTo och FAQPage oförändrade, BreadcrumbList av `Hjalte`.
- h1-elementets text är exakt "CV-analys med läsbarhetspoäng: se var ditt CV tappar, del för del" (`h1Etikett="CV-analys med läsbarhetspoäng:"`).
- "Samma CV ger alltid samma poäng" står ingenstans.
- OG-beskrivningen, 146 tecken: "Ditt CV får en läsbarhetspoäng av 100 i sju delar. Du ser var det tappar och vad som saknas i varje del. Poängen är gratis för varje CV du sparar."
- CVAnalysMini: samma logik, anrop, händelser, texter och id; ny markup med p3-klasser och grundens ikoner. Dra och släpp är byggt (inga genvägar): ytan tar emot en släppt fil och kör samma `handleFile`, "Släpp din CV-fil här" döljs på pekskärmar.

**Beslut.** Saras exempel tappar 5 poäng i Erfarenhet (punkter som inte börjar med vad hon gjorde) och 2 i Språk (textbeslut Del 4 punkt 2), raderna märkta "Exempel:". "Gratis" och "Premium" i vägen är stycken. Premiumkortets tredje rad är "Alla mallar och personliga brev utan tak" (skissens "Ersätt ditt nuvarande CV med ett tryck" gick inte att belägga). Brödsmulan Verktyg pekar på /funktioner som i dag.

**Ny text utan godkännande.** "Fyra steg"; "Det här får du se" med tre rader; meningen om inskannade PDF:er med länken "Skapa ett gratiskonto" (/register?borja=cv); de två exempelraderna; vägens etikett, rubrikstycke, förklaringslista och kort; före och efter i skrivtips 1 och 2; sjätte kortet "Se hur andra har gjort" till /exempel; Premiums tre bockrader (tal ur `TEMPLATE_COUNT`, `WORD_TEMPLATE_COUNT`).

**Avviker från skissen.** Hjältens textlänk är dagens "Så fungerar det". Skissens kortade stegtexter och FAQ-svar är inte använda; dagens text står.

**Återstår.** Webbläsare: ett riktigt släpp och en uppladdning.

## 4. /verktyg/skapa-cv (skiss skapa-cv)

Filer: `page.tsx` (omskriven), `skapa-cv.css` (ny), `startval.ts` (ny), `start/route.ts` (ny), `__tests__/startval.test.ts` (ny). Utanför de publika filerna, enligt mandatet (inloggad kod får ändras när en publik funktion kräver det): `src/app/dashboard/skapa-cv/page.tsx`, `ByggareClient.tsx`, `StartBlad.tsx`.

**Byggt.**
- Hjälten med etikett, H1 och ingress ordagrant, `CvArk` med Saras rader och chipet "Mallen Linne, gratis", och en `Svav` "Jobbcoachen föreslår" (märkt Exempel).
- Startbladet (inga genvägar): "Vilket jobb söker du?" är ett riktigt fält (`yrke`, högst 80 tecken) och ingångarna radioknappar ("Ladda upp ett CV du har" förvald, "Skriv från början"), i ett GET-formulär till `/verktyg/skapa-cv/start`. Rutten svarar 303 till `/register?redirect=/dashboard/skapa-cv?...`, och registreringens befintliga redirect-läge bär målet genom kontot (också via Google). Byggaren tar emot `?borja=1&titel=` (skriv: startbladet hoppas över, titeln ifylld, samma kontrakt som "Vilket jobb söker du?" i Ditt CV) och `?ladda=1&titel=` (titeln ifylld på byggarens startblad och uppladdningen uppfälld; filen hamnar i kontot med byggarens vanliga uppladdning). Utan titel öppnas byggarens startblad som vanligt. Inget sparas före kontot, databasen är orörd. Formuläret fungerar utan JavaScript.
- "Prova Linne med ditt namn" är ett GET-formulär till `/cv-mallar/prova?mall=linne&namn=`, som provsidan redan läser. Länken `/cv-mallar/prova?mall=linne` står kvar.
- Stegen som `VagSteg` med en bild per steg, plattan med fyra numrerade H3, ark och verktygsrad, fyra kort under (alla åtta H3 ordagrant), Linne, Björk och Koppar med raden "{TEMPLATE_COUNT - 3} mallar till", "Gör skillnad" med tre tal, `PremiumO`, frågorna. HowTo, WebApplication och FAQPage oförändrade, alla gamla länkmål kvar.

**Beslut.** Registreringens redirect-läge i stället för `?borja=cv`, så att registreringen (P1) inte ändras; nackdelen är att valet `cv` inte registreras i tratten på den här vägen. Hjältens ark är `CvArk` utan nålar (grunden har inget byggarark, önskemål skrivet). Premiums bockar bryter ut talen, men stycket står kvar ordagrant. "Utkastet väntar på dig" säger "under Ditt CV" som i koden.

**Ny text utan godkännande.** "Fyra steg", "Börja här", "Vilket jobb söker du?", "Yrkestiteln styr rubrikerna, den grå exempeltexten och Jobbcoachens förslag.", platshållaren "Till exempel projektledare", ingångarnas texter, "Gratis att börja, ingen kortuppgift.", "Hur vill du börja?" (dold legend), "Ditt namn" (dold etikett), "förslag på punkter, gratis" (SEO JA), raden "{n} mallar till / {n} finns också som Word, {n} har plats för foto.", Premiums fem bockrader, hjältebildens exempelrader.

**Avviker från skissen.** Inget byggarark med öppet avsnitt och "Skriv punkter åt mig" (finns inte i grunden). Plattans ark har inga nålar. Miniatyrerna i mallkorten länkar till provsidan.

**Återstår.** Klicktest hela vägen från sidan genom registreringen (e-post och Google) till byggaren. Ett renderingstest för `oppnaUppladdning` i StartBlad finns inte (kontraktet täcks av `startval.test.ts`).

## 5. /verktyg/linkedin-optimering (skiss linkedin)

Filer: `page.tsx` (omskriven), `linkedin.css` (ny), `components/LinkedinOptimeringLiveDemo.tsx` (nu en serverkomponent med ett stilla exempel), `components/linkedin-optimering-faq-data.ts` (ett ord).

**Byggt.** Hjälten med etiketten utanför h1 (H1 oförändrad), rekryterarens sökruta och Saras profil med utmärkta sökord och poängen 87 (Exempel), raden "Ingår i {paketMedPris}. Exemplet här nedanför ser du utan konto." Det lyfta kortet: före och efter med Sara (i stället för Anna Lindberg, Klarna och Voi), rubriken som stycke, rubrikens längd räknad ur texten, poängen `aria-hidden`. Fem steg som kort med bild, "Fem sektioner i ett pass" med profilarket och brickan "Ett pass, 30 till 60 sekunder", "Varför du inte syns i dag", "Bred eller skarp", `PremiumO`, tre länkbrickor med exakt ankartext "CV-analys", "Skapa CV", "CV-mallar", frågorna.

**SEO-beskeden.** Steg 2 "Om mig och Erfarenhet behövs, resten är valfritt." och språkmeningen "Profilen skrivs på svenska eller engelska, det väljer du själv." (Step1Mode har valet). "Många använder bara en bråkdel av dem." FAQ "fälten då är ifyllda". HowTo-stegen ordagrant de synliga. Det SEO sa nej till står kvar: "vi optimerar fem sektioner samtidigt", meningen om algoritmen, "Klart på fem minuter", "5 min", `totalTime PT5M`.

**Beslut.** Exemplet är statiskt, med motivering (inga genvägar): verktyget är bara Premium i koden (`FEATURES.linkedin`, rutten svarar 402), så en publik körning skulle ändra vad som är gratis, vilket inte rörs; skissen visar ett exempel, ingen funktion. Skissens "Kopiera alla sektioner" skulle bara kopiera exemplets text och är "Optimera min profil" till /register. Sökrutan i hjälten är en bild av rekryterarens sökning. "Varför du inte syns" är ritad som `.p3-vagg` i stället för `.p3-o` (grundens specificitetsfel, önskemål skrivet). Profilytan är sidans egen (`lnk-prof*`).

**Ny text utan godkännande.** Prisraden i hjälten; hela exemplet före och efter (Saras rubriker och Om-texter, "Exempel, Sara Lindström", "Så ser de två första raderna ut ...", rubrikens längd, "Ord en rekryterare kan söka på:", "+ Branschens sökord / + Tydlig specialisering / + Resultat i siffror", "Ingår i Premium"); "Fem steg, fem minuter"; brickan och "Poängen är Saras, som exempel: mörkt före, ljust efter."; profilarkets innehåll och bildtexterna (`aria-hidden`); chipen "Bred" och "Skarp"; Premiums tre bockar och "Utan Premium ser du exemplet ..."; "Mer för ditt CV" och länkbrickornas undertexter; språkmeningen.

**Avviker från skissen.** Etiketten utanför h1, exemplets knapp, skissens rad "280 ord" struken.

**Återstår.** Profilytan och `VagSteg` med fem kort till grunden (önskemål). Webbläsare.

## 6. /cv-mallar med undersidor (skiss cv-mallar)

Filer: `components/CvMallarPageContent.tsx`, `components/StilSida.tsx`, `components/mallar-produkt.ts`, `word/page.tsx`, `foto/page.tsx`, `enkla/page.tsx`, `prova/page.tsx`, `[yrke]/YrkesmallContent.tsx` och sju komponenter i `[yrke]/components/`; nya `components/MallDelar.tsx`, `components/YrkeSok.tsx`, `components/mallar-v3.css` (prefix `cvm-`).

**Byggt (huvudsidan).**
- Hjälten med åtta riktiga miniatyrer (`MallMiniatyr`, Gratis-chip på gratismallarna) och fyra talbrickor ur katalogen.
- Det lyfta kortet med dagens fungerande uppladdning (`Uppladdning ton="papper"`), situationsraden och dagens arbetsyta (`ProvaArbetsyta`), som bär CV och mall in i kontot som förut.
- De 74 yrkena i grupper ur `yrkesmall-data` (gruppnamnet ett stycke, antalet ett chip). Allt står i serverns HTML: yrke 9 och uppåt i `details` "Visa alla N i X", i telefonen döljs yrke 4 och uppåt med CSS tills gruppen fälls ut. Sökfältet "Sök ditt yrke" är en liten klientkomponent som bara döljer kort och fäller ut grupperna.
- Alla 40 mallar med filterchips som CSS-radioknappar (fungerar utan JavaScript), antalen ur katalogen, kort med stor bild, formatmärke och chip; `id="mall-<id>"` kvar.
- Premiumremsan, Word-ön med 26 kort (sex syns i telefonen, resten i `details` "Visa alla 26 Word-mallar"), stegen som `VagSteg`, åtta fördelskort, guiden, gratisavsnittet, PDF eller Word som duell, stilkorten, frågorna i v3 `Faq`, slutön med `CV_GALLERI.length` och `YRKESMALL_PUBLIKA.length`.
- Alla ankare kvar: `hjalte`, `valj-mall`, `ladda-upp`, `mall-galleri`, `mall-<id>`, `word`, `sa-funkar-det`, `gratis-cv-mall`, `pdf-eller-word`, `mallar-efter-stil`, `fragor`.

**Beslut.** Steg 2 heter "Du skriver direkt på arket, avsnitt för avsnitt." (HowTo följer, `LD_UNDANTAG` fanns). Premiumremsan har SEO:s lydelse; meningen "Du betalar först när du laddar ner en Premiummall." står, eftersom köpet sitter i nedladdningsknappen (`ProvaArbetsyta.tsx`). Kategorietiketten per yrkeskort är borta (gruppnamnet bär den), cirka 74 ord som vägs upp av nya rader och brickor. Slutbrickan säger "yrken med egen mallsida" med `YRKESMALL_PUBLIKA.length` (69), inte 74, eftersom piloten 308:ar till exemplen.

**Ny text utan godkännande.** Hjältens knappar "Ladda upp ditt CV" och "Se alla {N} mallar" och brickornas rader; etiketterna "Se ditt eget CV i mallarna", "{n} yrken i {g} grupper", "Hela utbudet", "Fyra steg"; filterchipsens namn, summary-texterna, "Gratis som Word"; remsans knapp "Se vad som ingår" (/priser); docx-raden, "Förvalet" och "När annonsen ber om det" (`aria-hidden`); sökningens tomrad.

**Avviker från skissen.** Arbetsytan står under uppladdningen i full bredd i lyftet (inte i en högerspalt), eftersom `ProvaArbetsyta` inte ska trängas utan test i webbläsare. Hjältens ingress har inga länkar på Linne och Björk.

**Stilsidorna (word, foto, enkla, `StilSida.tsx`).** Samma form som huvudsidan där mallen delas: hjälte med mallvägg, lyft med uppladdning och arbetsyta, mallkort med "Fyll i gratis" eller "Prova med ditt CV", Premiumplatta, v3-sektioner, länkbrickor med `data-cta-klick` kvar, frågor i v3-form. `pub-lank` bytt mot `cvm-lank`, texten orörd. Ny text: knapparna och lyftets etikett.

**Yrkessidorna (`[yrke]`, 69 sidor).** Dagens `MallVisningCv` på ett papperskort i hjälten, v3-sektioner och kort, sju komponenter nu serverkomponenter utan framer-motion och orange. Alla H2 och H3 i samma ordning, också "Vanliga frågor om X-CV" och "CV för x". Branschtermerna och frågorna står nu alla i HTML:en via `details` (förut bara den första): fler ord, inget försvinner. BreadcrumbList bara från page.tsx som i baslinjen. Ingen ny text.

**/cv-mallar/prova** (noindex): grundens skal, uppladdningen på väggen och arbetsytan i ett lyft. Text och funktion orörda.

**Återstår.** Webbläsare: lyftets höjd, filterchipsen och mallväggens lutning i 375.

## 7. /cv-exempel (navet, kategori och yrkessidorna)

Filer: `page.tsx`, `kategori/[kategori]/page.tsx`, `[yrke]/CVExempelPage.tsx`, `[yrke]/InteractiveCVPreview.tsx`; nya `components/CvExempelNav.tsx`, `components/CvExempelKategori.tsx`, `components/ExempelDelar.tsx`, `components/CvSok.tsx`, `components/exempel-v3.css` (prefix `cve-`), `[yrke]/CvExempelMall.tsx`.

**Navet.** En egen kopia av CV-grenen ur `GalleriPageContent` i navets form (skissen brev-exempelnav, beslut 7) i petrol: hjälten med tre riktiga mallar och en svävande bricka med antalet (`aria-hidden`), sökfältet (samma GET-formulär och filtrering som `HubbSok`, fungerar), situationsraden; branscherna störst först med stapel och "Alla yrken"; 89 kort med Linne-miniatyr och tomt alt (SEO 14); ön "Behöver du även personliga brev?"; guiden; frågorna; slutön. All text ordagrant dagens. Ny text: "Välj bransch", "Alla exempel", "yrken, ett färdigt CV var" (`aria-hidden`).

**Kategorisidorna.** Navets form med branschen vald, serverkomponent i stället för framer-motion. H1, de tre H2, länkar och texter kvar; korten har nu också yrkets rad ur galleriet. Vårdens "20+ yrken" är antalet ur datan via `kategoriIngress()`, synligt och i CollectionPage (`LD_UNDANTAG` fanns).

**Yrkessidorna (89).** CV-grenen ur `ExempelMall` i `BrevExempelMall`s form, i petrol (P3 lämnade över den). `CvPapper`, mallväljaren, piloten och Jobbkartan är dagens komponenter, importerade och orörda; slutet har `CvArk` i stället för den gamla telefonen (som var `aria-hidden`). Alla H1 till H4, FAQ, länkar och texter ordagrant. `InteractiveCVPreview.tsx` har tokens i stället för orange, slate och amber, logiken orörd.

**Återstår.** Se `CvPapper` i webbläsare (grundens återställning av listor kan påverka papperet). `ExempelMall.tsx` används inte längre av någon sida; P5 kan stryka den.

---

## Filer utanför paketets sidmappar

- `src/app/dashboard/skapa-cv/page.tsx`, `ByggareClient.tsx`, `StartBlad.tsx`: små, bakåtkompatibla tillägg så att startbladet på /verktyg/skapa-cv bär yrket och ingången in i byggaren (mandatet "inga genvägar", inloggad kod får ändras när en publik funktion kräver det). Byggarens befintliga tester gröna.
- `docs/publikt-omgang3/bygg/onskemal.md`: rader tillagda (inget överskrivet).
- Inga ändringar i grunden, menyn, foten, `gratis-copy.ts`, `paket-copy.ts`, registreringen eller artiklarnas komponenter.

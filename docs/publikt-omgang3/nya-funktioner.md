# Nya och kraftigt förbättrade funktioner, och vad de kan ranka på

Skrivet 2026-11-22 av SEO, för ägarens genomgång när han kommer tillbaka och väljer nya artiklar. Underlag: byggnoterna (`docs/bygg-noter-*.md`, också `bygg-noter-jobbsoket-omgang2.md` på main), överlämningarna (`docs/overlamning-*.md`), textbeslutet och Search Console för 2026-08-22 till 2026-11-19 (90 dagar) och 2026-10-23 till 2026-11-19 (28 dagar), hämtat i dag.

Så läser du sökorden: "v" är visningar, "k" klick, "p" position, alla på 90 dagar om inget annat står. Står det **bedömning** finns inget i vår egen data som belägger ordet, och vi har inga volymer från externa verktyg.

## Det jag rankar högst för nya artiklar

| # | Arbetstitel | Funktion | Varför |
|---|---|---|---|
| 1 | Aktivitetsrapport till Arbetsförmedlingen: vad som ska med och hur du för listan över sökta jobb | Sökta tjänster och månadsrapporten | Gratis för alla, löser en plikt varje arbetssökande med ersättning har, och den nya sidan behöver en artikel som länkar in. Bedömning: vi har noll visningar i dag. |
| 2 | Öva på intervjufrågor hemma: skriv svaret, få betyg och se vad som saknas | Inför intervjun | Intervjuklustret är vårt största efter testerna (242 frågor, 5 987 v), men inget av det leder till en funktion man kan prova. Vinkeln "öva" är bedömning. |
| 3 | CV och personligt brev i samma mall: så får ansökan en röd tråd | Samma 40 mallar för brev och CV | "personligt brev mall" 268 v p 23,8; "cv och personligt brev mall" 16 v p 31,9; "hjälp med cv och personligt brev" 76 v p 54,6. Ingen artikel äger vinkeln i dag. |
| 4 | Granska ditt CV själv: de sju delarna rekryteraren läser först | Läsbarhetspoängen i sju delar | "cv analys" 36 v p 6,1; "cv granskning" 24 v p 60,4; "ats cv" 65 v p 69,0. Liten volym, men den enda gratisfunktion för CV som går att prova utan konto. |
| 5 | Svara på kraven i annonsen: så bygger du det personliga brevet krav för krav | Kraven i brevrummet | "skriva personligt brev" 145 v p 16,8. Själva krav-vinkeln är bedömning (noll visningar på "krav" och "annons" ihop med "personligt brev"). |

Inte på listan men värt mer än en ny artikel: **omskrivningen av `rotation-test-guide` mot "spatial förmåga"** (745 v p 9,4, ett av de största enskilda sökorden vi har på sida ett, och testtypen är ny sedan 9 november). Se funktion 14.

---

## Funktionerna

### 1. Läsbarhetspoängen i sju delar (CV-analysen)

**Vad:** CV:t får en läsbarhetspoäng av 100, räknad i sju delar (Kontaktuppgifter, Personbeskrivning, Erfarenhet, Kompetenser, Utbildning, Språk, Datum ordning och längd), med vad som saknas i varje del, gratis för varje CV, och poängen räknas om när CV:t sparas. Live 2026-11-21 (poängmodell version 2, `docs/poangmodell-cv-analys.md`).

**Lyfts på:** /verktyg/cv-analys (görs), startsidan, /funktioner, /priser, reklamkortet i CV-artiklarna, `ats-vanligt-cv`, `nyckelord-i-cv`, `bra-cv-guide`, `hur-ska-ett-cv-se-ut`.

**Sökord:** "cv analys" 2 k, 36 v, p 6,1 (bär sidan); "cv granskning" 24 v, p 60,4 (går i dag till startsidan och /funktioner, inte till verktyget); "ats anpassat cv" 24 v, p 41,3; "ats cv" 65 v, p 69,0; "cv feedback" 1 v. "läsbarhet" har noll visningar: namnet är vårt, inte sökarens.

**Förslag:** artikel 4 ovan, "Granska ditt CV själv: de sju delarna rekryteraren läser först". Målord "cv granskning", "granska cv". Länkar till verktyget och provet utan konto.

### 2. Sökta tjänster med Ska sökas och veckans mål

**Vad:** Ett eget rum där man loggar varje jobb man har sökt, sparar annonser man ska söka med sista ansökningsdag, sätter ett mål per vecka (förval tre) och ser var ansökningarna tar stopp i en tratt och tre diagram. Gratis för alla. Live 2026-11-21 (`280ec592`).

**Lyfts på:** nya /verktyg/sokta-tjanster (görs), menyn och foten, startsidan, /funktioner, /priser, /verktyg/jobbmatchning, reklamkortet i artiklarna om att söka jobb.

**Sökord:** noll visningar på "sökta jobb", "ansökningar", "logga", "hålla koll" och "sista ansökningsdag" (90 dagar). Bedömning: "sökta jobb", "hålla koll på jobbansökningar", "lista över sökta jobb", "jobbansökningar excel".

**Förslag:** en del av artikel 1. Behöver ingen egen artikel utöver den; sidan själv tar verktygsorden.

### 3. Uppföljningsmejlet efter tolv tysta dagar, och efter intervjun

**Vad:** När en sökt tjänst har varit tyst i tolv dagar, eller när det gått sju dagar efter en intervju eller ett provjobb utan besked, skriver vi ett utkast till ett kort mejl som öppnas i användarens egen e-post; vi skickar aldrig själva. Första utkastet är gratis, sedan Premium. Omgång 1 live 2026-11-21, intervjuläget i omgång 2 (på main).

**Lyfts på:** /verktyg/sokta-tjanster, `soka-jobb-via-mail` (ART-17), `uppfoljning-efter-intervju` (ART-18), /priser (Premiumlistan), startsidans Premiumyta.

**Sökord:** de två artiklarna bär det. `soka-jobb-via-mail` 21 k, 2 343 v, p 8,2 ("hur skickar man cv via mail" 18 v p 14,9, "jobbansökan mail exempel" 10 v p 11,1). `uppfoljning-efter-intervju` 7 k, 1 247 v, p 9,4 ("tack för ett trevligt samtal" 8 v p 9,5). "följa upp jobbansökan via mail exempel" 2 v, "tackmail efter intervju" 3 v.

**Förslag:** ingen ny artikel. En artikel om att följa upp en ansökan skulle tävla med `soka-jobb-via-mail`, som redan står på sida ett. Länken i den artikeln räcker.

### 4. Månadsrapporten: underlaget till aktivitetsrapporten

**Vad:** Ett blad per månad med de sökta jobben i tre avsnitt (annonserade jobb, intresseanmälningar och spontanansökningar, intervjuer och provjobb), som underlag när man själv rapporterar till Arbetsförmedlingen. Gratis ser antalen; raderna, utskriften och kopieringen är Premium. Live 2026-11-21.

**Lyfts på:** /verktyg/sokta-tjanster, /priser (raden "rapport till Arbetsförmedlingen"), artikel 1.

**Sökord:** noll i vår data på "aktivitetsrapport" och "arbetsförmedlingen" ihop med rapport (19 v på hela sajten för allt med "arbetsförmedlingen"). Bedömning: "aktivitetsrapport" är mest ett navigerande ord som Arbetsförmedlingen äger, men "vad ska stå i aktivitetsrapporten", "aktivitetsrapport exempel" och "aktivitetsrapport sökta jobb" är informationsfrågor vi kan ta.

**Förslag:** artikel 1, "Aktivitetsrapport till Arbetsförmedlingen: vad som ska med och hur du för listan över sökta jobb". Varje regel källverifieras mot Arbetsförmedlingens sida med datum (seo-krav har tabellen), och artikeln säger aldrig att vi skickar rapporten. Granskas igen vid årsrevisionen i januari.

### 5. Intervjun hör till den sökta tjänsten

**Vad:** När man loggar en kallelse sparas dag, tid och plats på tjänsten, med "Förbered intervjun" på tjänstens sida, "Intervjuer på gång" under Inför intervjun och frågan "Hur gick intervjun?" dagen efter. Live 2026-11-21, "Sätt tiden" och intervjuläget i omgång 2.

**Lyfts på:** /verktyg/sokta-tjanster (egen H2), /funktioner (kortet Inför intervjun).

**Sökord:** bedömning; inga sökfrågor i vår data handlar om att planera intervjuer.

**Förslag:** ingen egen artikel. Tas med i artikel 2.

### 6. Inför intervjun och intervjuprovet

**Vad:** Man svarar skriftligt på en intervjufråga och får ett betyg av fem med vad som saknades (i kompetensfrågorna de fyra delarna i STAR), kan skriva om svaret och se om nivån lyfter; ett prov om dagen gratis, utan tak i Premium. Hubben efter högsta betyg byggdes i omgång 2.

**Lyfts på:** /funktioner och /priser (kortet Inför intervjun, textbeslut B-9), `kompetensbaserade-intervjufragor`, `kompetensbaserad-intervju-star-metoden`, `vanliga-intervjufragor-svar`, `klassiska-intervjufragor-lista`, `styrkor-svagheter-intervju`.

**Sökord:** intervjuklustret är stort: "styrkor och svagheter intervju exempel" 35 k, 450 v, p 5,0; "kompetensbaserad intervju frågor" 5 k, 361 v, p 15,8; "vanliga intervjufrågor" 189 v, p 30,2; "intervjufrågor" 157 v, p 36,2; "intervjufrågor och svar" 76 v, p 24,6. Artikeln `kompetensbaserade-intervjufragor` har 93 k och 4 049 v. Men "öva", "träna" och "förbereda" ihop med intervju har noll visningar: vinkeln är bedömning.

**Förslag:** artikel 2, "Öva på intervjufrågor hemma: skriv svaret, få betyg och se vad som saknas". Viktigare än artikeln: att intervjuartiklarna med trafik leder till provet. Det är där klicken finns.

### 7. Handlingarna på en träff i Matchade jobb

**Vad:** Varje träff visar matchgrad, sista ansökningsdag och "Därför passar du" (roll, kompetenserna en och en, ort), och har tre handlingar: Skriv brev, Spara till Ska sökas och Markera som sökt. Annonserna hämtas tre gånger per dygn och man söker om med ett tryck. Live 2026-11-21.

**Lyfts på:** /verktyg/jobbmatchning (görs), startsidan, /funktioner, /priser, `ai-jobbmatchning` (ART-12), reklamkortet för Jobbsöket.

**Sökord:** "jobbmatch ai" 2 k, 869 v, p 6,3 (till `ai-jobbmatchning` och startsidan); "jobbmatchning" 234 v, p 14,3; "jobbmatch.ai" 30 v, p 6,1. /verktyg/jobbmatchning 15 k, 955 v, p 12,7.

**Förslag:** ingen ny artikel. `ai-jobbmatchning` står på sida ett för "jobbmatch ai" och en till artikel om matchning skulle dela på den. Stycket "Matchningen i ett smart jobbsökarflöde" i den artikeln är rätt plats.

### 8. Samma 40 mallar för brev och CV

**Vad:** Personliga brev skrivs i samma 40 mallar som CV:t, så att ansökan ser likadan ut; Linne och Björk är gratis, PDF finns för alla och Word för 26. Mallarna live 2026-11-17, breven i mallarna 2026-11-21.

**Lyfts på:** /verktyg/personligt-brev, /cv-mallar, brevexemplen (länken "Se alla 40 brevmallar"), visaren i artiklarna, `personligt-brev-mall-gratis`, `personligt-brev-mall-word`, `cv-och-personligt-brev`.

**Sökord:** "personligt brev mall" 268 v, p 23,8; "personligt brev mall gratis" 227 v, p 23,3; "mall personligt brev" 97 v, p 25,7; "personligt brev mall word" 38 v, p 14,7; "cv mall" 300 v, p 54,8; "cv mallar" 239 v, p 47,8; "cv och personligt brev mall" 16 v, p 31,9; "hjälp med cv och personligt brev" 76 v, p 54,6.

**Förslag:** artikel 3, "CV och personligt brev i samma mall: så får ansökan en röd tråd". Målord "cv och personligt brev mall", "matchande cv och personligt brev".

### 9. Brevrummet: Kraven, tonerna, språket och sparade brev

**Vad:** Brevet skrivs mot annonsens krav, och panelen Kraven visar varje krav och var i brevet det besvaras, med de krav som saknas; fem toner (tonen vald åt dig i Premium), svenska eller engelska, och alla brev sparas av sig själva med de två senaste öppna att ändra gratis. Live 2026-11-21 (`1c1dda8c`).

**Lyfts på:** /verktyg/personligt-brev (görs: kravbilden i hjälten och kravpanelen), reklamkortet för brev, `skriva-personligt-brev-guide`, `personligt-brev-pa-engelska`, `cover-letter-sverige`.

**Sökord:** "skriva personligt brev" 145 v, p 16,8; "personligt brev ai" 25 v, p 16,4; "personligt brev engelska" 1 k, 295 v, p 13,2; "personligt brev på engelska" 220 v, p 15,7; "cover letter svenska" 4 k, 2 162 v, p 7,8. Krav-vinkeln har noll visningar: bedömning.

**Förslag:** artikel 5, "Svara på kraven i annonsen: så bygger du det personliga brevet krav för krav". Språket lyfts i de två engelska artiklarna, som redan rankar; ingen ny.

### 10. CV-byggaren där man skriver direkt på arket

**Vad:** Man skriver CV:t direkt i mallen, avsnitt för avsnitt, och Jobbcoachen föreslår punkter under arbetslivserfarenhet (tre förslag gratis per konto, 30 per dygn i Premium), med rubriker som följer yrket och nedladdning som PDF eller Word. Live 2026-11-16 (`f039f965`).

**Lyfts på:** /verktyg/skapa-cv (görs), /funktioner (H3 "Skriv CV:t direkt på arket"), /cv-mallar (steg 2), `online-cv-byggare-gratis`, `skapa-cv-med-ai`.

**Sökord:** klustret är stort men långt ned: "cv byggare" 125 v, p 41,2; "cv online gratis" 109 v, p 24,4; "skapa cv gratis" 98 v, p 54,8; "cv online" 97 v, p 23,1; "gratis cv-byggare" 94 v, p 39,4; "skriv cv online" 93 v, p 41,2; "skapa cv" 90 v, p 58,7; "cv-skapare" 74 v, p 55,8. Totalt 30 frågor och 1 095 v. `skapa-cv-med-ai` 3 k, 213 v, p 10,2.

**Förslag:** ingen ny artikel nu. `online-cv-byggare-gratis` skrevs om 2026-11-17 för just de här orden och har avläsning 8 och 14 december. Ny artikel först om den inte rör sig.

### 11. CV som Word

**Vad:** 26 av de 40 mallarna går att ladda ner som Word; i Linne och Björk är Word gratis. Live med mallarna 2026-11-17.

**Lyfts på:** /cv-mallar och /cv-mallar/word, /funktioner (H3 "Ladda ner som PDF eller Word"), /verktyg/skapa-cv, `cv-mall-word-gratis`.

**Sökord:** "cv mall word" 62 v, p 39,5; "modern cv mall word" 53 v, p 30,9; övriga under 5 v.

**Förslag:** ingen ny artikel; `cv-mall-word-gratis` och /cv-mallar/word finns.

### 12. Testets nya ram: uppgiftslistan och förklaringen

**Vad:** Alla test går i samma ram med klockan som visar provets tid utan att stoppa mitt i en uppgift, och efter testet en lista uppgift för uppgift med förklaringen (regeln och ditt misstag), namnet på mönstret man missade och en väg till riktad träning. Inloggat live 2026-11-20 (`475c513f`).

**Lyfts på:** /verktyg/rekryteringstester (görs: steg 2 till 4), /funktioner (H3 "Resultatet, uppgift för uppgift"), provkorten i testartiklarna, `stanine-testresultat`.

**Sökord:** "rekryteringstester öva gratis" 5 k, 69 v, p 6,9; "logiktest gratis" 132 v, p 12,6; "gratis logiktest" 2 k, 103 v, p 14,3; "matrigma test facit" 1 k, 31 v, p 11,3; "alva logiktest öva" 9 k, 187 v, p 7,3; "matrigma test gratis" 7 k, 322 v, p 11,1.

**Förslag:** ingen ny artikel. `logiktest-exempel-med-losningar` (27 k, 549 v, p 7,9) och `logiska-tester` täcker orden; en ny skulle tävla med dem. Lyft förklaringen i de artiklarna.

### 13. De publika proven: nio testtyper och ett öppet facit före konto

**Vad:** På /verktyg/rekryteringstester/prova och i testartiklarna gör man ett prov på fem uppgifter i valfri av nio typer utan konto och ser resultatet direkt, med rätt svar och regeln bakom en av uppgifterna. Live 2026-11-21 (`edd143e7`).

**Lyfts på:** /verktyg/rekryteringstester (lyftkortet med nio prov), reklamkortet för tester i artiklarna, sidokortet.

**Sökord:** som funktion 12; provsidan själv har `noindex`.

**Förslag:** ingen egen artikel.

### 14. De nya testtyperna: talserier, spatial förmåga, ordförråd och deduktiv slutledning

**Vad:** Fyra testtyper med egna träningar, nivåer och prov, live 9 till 10 november, i samma ram som de andra.

**Lyfts på:** /verktyg/rekryteringstester (åtta testtyper), /funktioner, artiklarna `talserier`, `rotation-test-guide`, `ordforstaelse-test`, `deduktivt-induktivt-test`, med provet för rätt typ i varje.

**Sökord:** "spatial förmåga" 1 k, 745 v, p 9,4 och "vad är spatial förmåga" 2 k, 106 v, p 7,0 (båda till `rotation-test-guide`); "talserier" 2 k, 323 v, p 7,7; "deduktiv slutledningsförmåga" 1 k, 107 v, p 12,2; "ordförståelse test" 30 v, p 10,3.

**Förslag:** ingen ny artikel, men en omskrivning: `rotation-test-guide` bär "spatial förmåga" med 851 visningar på de två frågorna och har en titel om rotation. En seoTitle och H1 med "spatial förmåga" först kan ta den upp från position 9. Det är en ändring i en artikel med trafik och görs som en egen post med baslinje och undantag.

### 15. Personlighetstestet i tre längder med kravprofiler och intervjufrågor

**Vad:** Femfaktormodellen (Big Five) med 20 påståenden utan konto, 50 gratis i kontot och 120 i Premium, där profilen läses mot sex kravprofiler och ger frågorna rekryteraren lär ställa. Omgång 2 och 3 i november.

**Lyfts på:** /verktyg/personlighetstest (görs: ny H3 "Frågor rekryteraren lär ställa"), /verktyg/rekryteringstester, `personlighetstest-jobb-guide`, `map-test-personlighetstest`.

**Sökord:** "map personlighetstest" 3 k, 251 v, p 8,9; "personlighetstest rekrytering" 208 v, p 44,1; "personlighetstest rekrytering exempel" 5 k, 184 v, p 31,0; "big five test svenska" 28 v, p 31,3.

**Förslag:** ingen ny artikel; `personlighetstest-jobb-guide` äger orden. Lyft kravprofilerna där.

### 16. Jobbcoachen föreslår frågor utifrån läget

**Vad:** Jobbcoachen föreslår frågor utifrån läget i de sökta tjänsterna (till exempel hur man följer upp en tyst ansökan eller svarar på lönefrågan inför en intervju), och svarar med källor när svaret bygger på kunskapsbasen. Live 2026-11-21.

**Lyfts på:** /verktyg/jobbcoachen (görs: nytt block), startsidan, /funktioner.

**Sökord:** /verktyg/jobbcoachen har 7 k och 154 v; "karriärcoaching" 36 v p 98. "jobbcoach" 1 k, 187 v, p 43,6 går till startsidan; "vad gör en jobbcoach" 17 v, p 5,4 till `vad-ar-en-jobbcoach`.

**Förslag:** ingen ny artikel.

---

## Det jag inte har tagit med

- **Testklar, testerna som app.** Ligger på en egen gren och är inte publik. Tas upp när den finns i Play Butik.
- **Kom igång-brickan "Logga en tjänst du har sökt"** och övriga inloggade lägen: inget att söka på.
- **Bildbaserade PDF:er i CV-analysen** (inskannade CV läses på vår egen server): en FAQ-fråga på /verktyg/cv-analys räcker, ingen sökvolym i vår data.
- **Bli upptäckt:** inga nya funktioner i den här perioden, bara nya bilder.

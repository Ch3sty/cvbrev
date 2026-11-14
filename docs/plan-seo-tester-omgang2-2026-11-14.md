# SEO-plan för testklustret, omgång 2 (14 november 2026)

SEO-strategen, 2026-11-14. Andra omgången efter `docs/plan-seo-nya-tester-2026-11-10.md`. Det här är bara en plan. Ingen kod är ändrad och inget är publicerat. Saas-lead och säljansvarig granskar först, och sedan beslutar ägaren. Inget i avsnitt 8 och 10 påbörjas före ägarens ja.

**Ägarens fråga:** "Kan vi göra något SEO-arbete till våra nya tester, eller tester i allmänhet, finns det luckor att täppa till eller fler besökare att få inom rekryteringstester, hur man tränar, vad man ska tänka på, mm?"

Förra planen täckte de nya testtyperna (spatial förmåga, talserier, ordförråd, I-provet). Allt i den är publicerat utom U8 (Matrigma, efter 7 dec) och N4 till N6, som väntar enligt beslut. Den här planen tar testklustret brett: förberedelse och tips, resultatet, arbetsgivare och myndigheter, leverantörer, och befintliga sidor som underpresterar.

**Underlag:**
- `docs/plan-seo-nya-tester-2026-11-10.md` med granskningarna `docs/beslut-seo-nya-tester-saas-lead-2026-11-10.md` och `docs/beslut-seo-nya-tester-salj-2026-11-10.md`
- `docs/plan-efter-analys-2026-11-08.md`, avsnitt B och G (vad som är live)
- `docs/plan-content-2026-q4.md` (videointervju-tips och tolka-testresultat ligger där)
- `docs/plan-huvudord-2026-12.md`
- Search Console, frågor plus sida:
  - 90 dagar: 14 aug till 11 nov.
  - 28 dagar: 15 okt till 11 nov.
  - Hämtad 14 nov med servicekontot, sparad i scratchpad `gsc.json`.
- URL-inspektion 14 nov: i-prov, talserier, ordforstaelse-test, deduktivt-induktivt-test, arbetspsykologiska-tester, matrigma-test, aon-cut-e-test och rotation-test-guide är alla "Submitted and indexed". U3:s indexproblem är löst.
- Googles autoförslag (hl=sv, gl=se), hämtade 14 nov, omkring 130 frön.
- Webbsök efter konkurrenterna och myndigheternas egna sidor, gjord 14 nov.
- Innehållet i `content/artiklar/`: 17 testartiklar, rubriker och frontmatter genomlästa.

**Om sökvolym:** samma regler som förra planen.
- Vi har inget sökordsverktyg. Efterfrågan anges som våra visningar i Search Console, om Googles autoförslag finns och vilka varianter som föreslås, och hur mycket konkurrenterna har byggt.
- Autoförslag visar att ordet söks i Sverige, inte hur ofta. Tomt autoförslag betyder liten eller ingen efterfrågan.
- Search Console döljer sällsynta frågor. Frågetalen är golv, inte tak.
- Klusterregexet i `agg.js` fångar några ord utanför testerna ("psykolog", "case"). Totalen är en uppskattning.
- Kolumnen "Rankar i dag" bygger på webbsök, inte på ett svenskt resultat avläst rad för rad. Kontrolleras i inkognito med svensk plats innan respektive sida skrivs.

---

## 1. Det viktigaste först

1. **Klustret syns men får inga klick.** Testfrågorna gav 12 015 visningar och 123 klick på 90 dagar (1,0 procent), och 8 067 visningar och 67 klick de senaste 28 (0,8 procent). Den snabbaste vinsten är inte nya sidor, utan klick på det vi redan visas för:
   - **alva-labs-logiktest:** 2 129 visningar och 29 klick på 28 dagar, position 10,7. Huvudfrågorna "alva logiktest" (489, pos 9,6) och "alva logiktest öva" (363, pos 7,0) ligger precis vid sida 1:s nederkant. Autoförslagen visar ett helt resultatkluster vi bara delvis svarar på ("alva labs logiktest resultat 6", "7", "8", "9", "10", "alva labs bra resultat", "alva labs göra om test", "alva labs dela resultat").
   - **numeriskt-test-guide och verbalt-test-guide:** 461 visningar på position 4 till 13 och noll klick på 28 dagar. "numeriskt test" ligger på 4,1. Titlarna slutar på "guide + öva gratis 2026", som ser ut som alla andra.
   - **"logiskt test figurer förklaring":** 267 visningar på position 9,8 och noll klick, på logiska-tester som inte förklarar figurer. Neurobics har en egen sida för exakt den avsikten.
2. **Förberedelse och tips saknar ägare.** Google föreslår "logiktest tips", "tips inför logiktest", "logiska tester tips", "hur klarar man logiktest", "kan man öva på logiktest", "kan man träna upp logiskt tänkande", "fuska på logiktest", "alva labs logiktest tips", "matrigma test tips", "personlighetstest tips" och "hur ska man svara på personlighetstest". Vi har avsnitt om förberedelse i fem artiklar men ingen sida som svarar på tipsfrågan, och Search Console visar noll visningar på orden. Konkurrenterna (JobTestPrep, SquidFactor, cv-mallar.net, logiktester.se) svarar med säljsidor eller korta stycken. Ingen har forskningen om övningseffekten.
3. **Resultatet är en egen avsikt.** "stanine" har tio autoförslag ("stanineskala", "stanine 1" till "9", "vad betyder stanine 3"), "logiktest resultat" och "matrigma resultat" har egna. Det svenska resultatet för "stanineskala" är svagt: Wikipedia på engelska, ett hjälpcenter och skoldokument. Det kopplar direkt till I-provet, där polisens krav är 4 på stanineskalan. Innehållsplanen för Q4 har redan "tolka-testresultat" i december. Den ersätts av N8 här.
4. **Myndigheterna söks med namn.** Google föreslår "arbetspsykologiska tester" plus Skatteverket, Kronofogden, Försäkringskassan och Migrationsverket, plus "vilka arbetspsykologiska tester använder skatteverket", "varbi tester", "säpo test", "iq test säpo", "tullverket tester" och "tester rekrytering arbetsförmedlingen". Vi syns inte alls. Flera myndigheter beskriver sin process på egen sida (Skatteverket, Kronofogden, Säkerhetspolisen), och Tullverket och Kustbevakningen använder I-provet. En sida som bara säger det myndigheten själv säger, och aldrig gissar leverantören, är både sann och ovanlig. JobTestPrep påstår vilka tester enskilda myndigheter använder. Det gör inte vi.
5. **Det vi inte ska göra är lika viktigt.** Allmänt "iq test gratis" och "mensa test" har underhållningsavsikt. Koncentrationstest har ingen produkt. Flygledare (FEAST), case-intervjuer och Hogan, Thomas, PI, Korn Ferry och TestGorilla har mest engelska autoförslag eller saknar produkt hos oss. Se avsnitt 9.

---

## 2. Sökordskarta

**Förklaringar till tabellerna:** som förra planen.
- Avsikten anges som I (informera), Ö (öva eller testa nu), K (kommersiell, vill köpa övning) och N (navigera till en viss tjänst).
- "GSC 28 d" är våra visningar, klick och position 15 okt till 11 nov. "GSC 90 d" är 14 aug till 11 nov.
- "Auto" betyder att Google föreslår ordet eller varianter av det.
- Chansen bedöms som hög, medel eller låg, efter vår position i dag, konkurrensen och om vi har produkten.

### 2.1 Förberedelse och tips

| Sökord | Belägg | Avsikt | Rankar i dag | Vår chans |
|---|---|---|---|---|
| logiktest tips, tips inför logiktest, tips för logiktest, logiska tester tips | Auto ja på alla. GSC 0 | I + Ö | JobTestPrep (säljsida), SquidFactor, cv-mallar.net (rekryteringstester-guide), logiktester.se (tips i Alva-sidan), cv-mallen.se | **Hög.** Ingen svensk sida är byggd för tipsfrågan med belägg. Vi har uppgifterna och provet |
| hur klarar man logiktest, kan man öva på logiktest | Auto ja, bara exakt fras. GSC 0 | I | Samma | Hög, samma sida |
| kan man träna upp logiskt tänkande, träna logiskt tänkande, träna på logiskt tänkande | Auto ja, delvis barn ("träna logiskt tänkande barn") | I + Ö | Blandat, skolsidor | Medel. Svaret är forskningen om övningseffekt, som ingen svensk konkurrent har |
| fuska på logiktest | Auto ja, exakt fras | I | Flashback | Medel. Ärligt H2, inte egen sida |
| alva labs logiktest tips | Auto ja. GSC "alva personlighetstest tips" 15 visn pos 8 | I + Ö | logiktester.se, diamondsweden.se, SquidFactor | Hög, ägs av alva-labs-logiktest |
| matrigma test tips | Auto ja. GSC "matrigma tips" pos 27 | I + Ö | logiktester.se, JobTestPrep | Medel, ägs av matrigma-test |
| personlighetstest tips, hur ska man svara på personlighetstest | Auto ja. GSC 0 | I | Clevry, chef.se, ledigajobb.se, logiktester.se/personlighetstest, cotf.se | Medel, ägs av personlighetstest-jobb-guide |
| nervös inför test, testångest, logiktest dyslexi, logiktest på mobil, logiktest engelska | Inga autoförslag | | | Bara som H2 eller FAQ i N7 |

### 2.2 Resultatet

| Sökord | Belägg | Avsikt | Rankar i dag | Vår chans |
|---|---|---|---|---|
| stanine, stanineskala, stanineskalan, stanine 1 till 9, vad betyder stanine 3, stanine betyder | Auto ja, tio varianter. GSC "stanineskala" pos 9 (28 d, enstaka visning) | I | en.wikipedia.org, Mindmore hjälpcenter, skolmaterial, Polistidningen | **Medel till hög.** Svag svensk konkurrens. Delvis skolavsikt ("stanine dyslexi", "stanineskala läsning"), som vi inte jagar |
| logiktest resultat, vad är ett bra resultat på ett logiktest, dåligt resultat på logiktest | Auto "logiktest resultat". GSC "dåligt resultat på logiktest" pos 13 | I | Leverantörssidor, Flashback | Medel |
| percentil test, percentil betyder, normgrupp | "percentil betyder" i auto, men mest lön ("percentiler lön sverige") | I (blandad) | Uppslagsverk, SCB | Låg som huvudord. Andraord i N8 |
| alva labs logiktest resultat (6, 7, 8, 9, 10), alva labs bra resultat, vad är ett bra resultat på alva labs, alva labs göra om test, alva labs dela resultat | Auto ja. GSC 28 d: "alva labs logiktest resultat" 45 visn pos 1,8, "resultat 7" 13 visn pos 2 | I | **Vi**, opinionsfokus.se, diamondsweden.se, testttalent | **Hög.** Vi är etta på huvudfrasen. Ägs av alva-labs-logiktest |
| matrigma resultat, matrigma resultat medel, vad är ett bra resultat på matrigma, assessio matrigma resultat | Auto ja. GSC "matrigma resultat" pos 2 (28 d) | I | matrigma-test | Hög, ägs av matrigma-test |
| c-skala | Auto handlar om musik och korsord | | | Ingen. Bara i text |

### 2.3 Myndigheter och arbetsgivare

| Sökord | Belägg | Avsikt | Rankar i dag | Vår chans |
|---|---|---|---|---|
| arbetspsykologiska tester skatteverket, vilka arbetspsykologiska tester använder skatteverket, rekryteringstester skatteverket, skatteverket rekryteringstest | Auto ja på alla. GSC 0 | I + Ö | skatteverket.se ("När du söker jobb hos oss"), JobTestPrep | **Medel till hög.** Myndigheten vinner på sin process, vi på samlad bild och övning |
| arbetspsykologiska tester kronofogden, kronofogden arbetspsykologiska tester | Auto ja | I + Ö | kronofogden.se ("Så här rekryterar vi") | Medel |
| arbetspsykologiska tester försäkringskassan, tester rekrytering försäkringskassan | Auto ja | I + Ö | JobTestPrep (påstår leverantör), finansonline.se | Medel. Försäkringskassan beskriver inte testerna på egen sida enligt sökningen 14 nov; kontrolleras före skrivning |
| arbetspsykologiska test migrationsverket, tester rekrytering arbetsförmedlingen, arbetsförmedlingen rekryteringstest | Auto ja | I + Ö | Samma typ | Medel till låg |
| varbi tester, varbi arbetspsykologiska tester, varbi iq test | Auto ja. GSC "varbi" pos 4 (enstaka) | I | Varbi | Medel. Varbi är rekryteringssystemet många myndigheter använder, inte en testleverantör. Ett stycke i N9 |
| säpo test, iq test säpo, arbetspsykologiska tester säpo, säpo rekryteringsprocess, begåvningstest säpo flashback | Auto ja | I | sakerhetspolisen.se ("Rekryteringsprocessen"), Flashback, Indeed | Medel. Säkerhetspolisen listar själv begåvningstest, personlighetstest, psykologbedömning och säkerhetsprövning |
| tullverket tester, tullverket fysiska tester | Auto ja | I | tullverket.se, Indeed, Flashback | Medel. Tullverket och Kustbevakningen använder I-provet enligt i-prov-artikelns källor; H2 i N9 som länkar till i-prov |
| kriminalvården test | Auto ja, exakt fras | I | kriminalvarden.se (nyhet feb 2026 om tester), Publikt | Låg till medel. Myndigheten utreder tester; vi skriver bara det |
| lidl rekryteringstest, aon rekryteringstest, bloom tester rekrytering | Auto ja | N + I | Leverantörer, Flashback | Låg. Ingen sida per företag (avsnitt 9) |
| tester rekrytering kritik, rekryteringstester kritik | Auto ja | I | Publikt, forskning | Låg. Ett H2 i navet senare, om alls |

### 2.4 I-provet som "IQ-test"

| Sökord | Belägg | Avsikt | Rankar i dag | Vår chans |
|---|---|---|---|---|
| iq test polis, iq test polis krav, iq test polis gratis, iq test polis prövning, iq test polisutbildning, iq test polishögskolan, intelligens test polis | Auto ja, tio varianter. GSC "iq test polis" pos 44 (90 d) | I + Ö | polisen.se, JobTestPrep, testttalent | **Medel till hög.** Ägs av i-prov. Ingen ny sida |
| begåvningstest polisutbildningen, begåvningstest polis flashback | Auto ja | I + Ö | Samma | Medel, i-prov |

### 2.5 Leverantörer som saknar sida

| Sökord | Belägg | Avsikt | Rankar i dag | Vår chans |
|---|---|---|---|---|
| cubiks test, cubiks test gratis, cubiks logiks, cubiks logiks test, talogy test, talogy logiks | Auto ja. GSC 0 | N + K | JobTestPrep, testttalent (20 svenska provpaket), Neurobics (Cubiks Logiks), Talogys egna övningstester | **Medel.** Betalda och starka konkurrenter, men vi har numeriskt, verbalt och figurserier. Talogy finns på Addas ramavtal 2024 |
| assessio test, assessio test gratis, assessio test exempel, assessio test öva, assessio bloom | Auto ja. GSC 28 d: "assessio test" 34 visn pos 55, "assessio personlighetstest" pos 10, "assessio test gratis" pos 13 | N + Ö | assessio.com, logiktester.se | Medel. **Ingen ny sida:** ägs av matrigma-test (Matrigma) och map-test-personlighetstest (MAP). Se 3.4 |
| shl test (förra planens N4) | Auto ja | N + K | Se förra planen | Januari, oförändrat |
| thomas international gia test, predictive index test, pi test jysk, hogan test, korn ferry test, talent q, testgorilla | Auto mest på engelska | N | Leverantörerna, engelska övningssajter | Låg. Inte nu |

### 2.6 Befintliga ord där vi syns utan klick

| Sökord | GSC 28 d | Sida i dag | Problem |
|---|---|---|---|
| alva logiktest, alva logiktest öva, alva labs logiktest öva, alva labs test gratis | 489 + 363 + 179 + 102 visn, 9 klick, pos 5 till 11 | alva-labs-logiktest | Position precis under topp 5, titeln säger inte "Alva logiktest" utan "Labs" |
| numeriskt test, numeriskt, numeriskt test gratis, numeriska tester | 26 + 15 + 14 + 13 visn, 0 klick, pos 4 till 10 | numeriskt-test-guide | Titeln "guide + öva gratis 2026" |
| verbalt, verbalt resonemang, kritiskt resonemangstest | 25 + 16 + 10 visn, 0 klick, pos 4,5 till 9 | verbalt-test-guide | Samma |
| logiskt test figurer förklaring | 267 visn, 0 klick, pos 9,8 | logiska-tester | Fel sida, ingen förklaring av figurer |
| logiskt tänkande test gratis | 147 visn, 0 klick, pos 10,2 | logiska-tester | Under avläsning till 7 dec |
| personlighetstest rekrytering exempel, personlighetstest rekrytering, personlighetstest jobb | 66 + 88 + 31 visn, 3 klick. "exempel" har stigit från pos 30 till 10,5 | personlighetstest-jobb-guide | Stiger. Rör inte titeln |
| rekryteringstester, rekryteringstest, begåvningstest gratis | 148 + 45 + 87 visn, 0 klick, pos 21 till 30 | /verktyg/rekryteringstester | Titelbytet prövas efter baslinjen 18 dec (beslut 2026-11-10) |
| arbetspsykologiska tester, arbetspsykologiska tester exempel | 15 + 77 visn, pos 70 och 25 på logiska-tester | logiska-tester, inte navet | Navet arbetspsykologiska-tester är indexerat sedan 9 nov. Avläses 7 dec, inga ändringar före |

---

## 3. Sidor

### 3.1 Principen

Samma som förra planen, oförändrad:
- **Artiklarna är landningssidorna.** Inga nya `/verktyg/`-undersidor. `/prova` förblir `noindex, follow`.
- **En sida per sökavsikt**, med ansvarstabellen i 3.4.
- **Inga slug-byten på sidor som rankar.**
- **Tips och resultat för en viss leverantör ägs av leverantörens sida.** Alva-tips och Alva-resultat ligger i alva-labs-logiktest, Matrigma-tips och Matrigma-resultat i matrigma-test. De allmänna sidorna N7 och N8 länkar dit med leverantörens namn och upprepar inte deras skalor.
- **Myndigheter och arbetsgivare beskrivs bara med det de själva publicerar.** Ingen sida får gissa vilket test en arbetsgivare använder.

### 3.2 Nya sidor

Numreringen fortsätter från förra planen. N4 (SHL), N5 (lokförare) och N6 (mönstring och polis) står kvar där.

| # | URL | Huvudord | Andraord | Innehåll som avgör | Prov och köpväg | Publiceras | Insats |
|---|---|---|---|---|---|---|---|
| N7 | `/artiklar/logiktest-tips` | logiktest tips, tips inför logiktest | logiska tester tips, hur klarar man logiktest, kan man öva på logiktest, kan man träna upp logiskt tänkande, fuska på logiktest | <ul><li>Snabbsvar: övning höjer resultatet, men måttligt. Metaanalysen Hausknecht m.fl. 2007 (50 studier, 107 urval, 134 436 personer) fann i snitt en fjärdedels standardavvikelse vid omtest, mer med vägledning och med samma testform.</li><li>Veckan före: ta reda på leverantören, lär regeltyperna, öva utan tid, sedan med tid. Länkar till varje leverantörs sida.</li><li>Testdagen: dator eller mobil, ostörd plats, instruktionerna och exempeluppgifterna, tidsstrategi, gissa eller hoppa.</li><li>"Går det att fuska?" Ärligt: kontrolltest, omtest på plats, och varför det skadar dig själv.</li><li>Om du har dyslexi eller svenska som andraspråk: be arbetsgivaren om anpassning.</li><li>Efter testet: länk till N8 om resultatet.</li><li>Personlighetstest: ett stycke och länk till personlighetstest-jobb-guide, inga egna personlighetstips.</li></ul> | Matrisprovet inbäddat (`ArtikelProv`), uppgift 1 efter snabbsvaret. Köpväg: prov, konto, "Mitt test" (Matrigma, Alva, SHL, Aon eller Annat via valrutorna), vägg, Premium | Vecka 48 (23 till 29 nov). Länken från logiska-tester väntar till efter 7 dec | M |
| N8 | `/artiklar/stanine-testresultat` | stanine, stanineskala | stanine 1 till 9, vad betyder stanine, logiktest resultat, vad är ett bra resultat på logiktest, percentil, normgrupp, sten | <ul><li>Snabbsvar: stanine är en niogradig skala med medel 5 och standardavvikelse 2. 4 till 6 är mitten, där drygt hälften hamnar.</li><li>Tabell (JSX) stanine 1 till 9 med andel och percentilintervall.</li><li>Percentil, C-skala (Matrigma), sten och 1 till 10 (Alva) i en jämförelsetabell, med länk till respektive leverantörssida för detaljerna.</li><li>Vad normgruppen är och varför samma poäng kan ge olika stanine.</li><li>Stanine i I-provet: polisens krav minst 4 med källa (Polistidningen 2025), spärrtid enligt polisen.se. Länk till i-prov.</li><li>Vad ett bra resultat är beror på jobbet: arbetsgivaren sätter gränsen, inte skalan.</li><li>Om det gick dåligt: spärrtider, omtest, vad du kan be om (återkoppling, rättigheter).</li><li>Varför vårt prov visar percentil mot andra som gjort provet men aldrig stanine.</li><li>En mening om skolans stanine (läsning) med att den här sidan handlar om arbetstester.</li></ul> | I-prov-smakprovet för den som har ett datum, matrisprovet för övriga. Köpväg: prov, konto med `mitt_test=iprov` från I-prov-rutan, provdatum, vägg (övningsprovet i Premium) | Vecka 49 (30 nov till 6 dec). Ersätter "tolka-testresultat" i Q4-planen | M |
| N9 | `/artiklar/tester-hos-myndigheter` | arbetspsykologiska tester myndighet, arbetspsykologiska tester skatteverket | kronofogden, försäkringskassan, migrationsverket, arbetsförmedlingen, säpo test, tullverket tester, varbi tester | <ul><li>Snabbsvar: många myndigheter skickar webbaserade tester efter första urvalet, oftast ett kapacitetstest och ett personlighetstest. Myndigheterna namnger sällan leverantören.</li><li>Ett H2 per myndighet som själv beskriver sin process, med citat och länk: Skatteverket ("Det är vanligt att du får göra ett eller flera webbaserade arbetspsykologiska test", granskade av oberoende tredje part), Kronofogden (tester efter första urvalet, personliga egenskaper och problemlösning), Säkerhetspolisen (begåvningstest, yrkesintervju, personlighetstester, psykologbedömning, säkerhetsprövning).</li><li>Tullverket och Kustbevakningen: I-provet, länk till i-prov.</li><li>Försäkringskassan, Migrationsverket, Arbetsförmedlingen och Kriminalvården bara om de publicerar något själva. Annars ett stycke "myndigheter som inte beskriver sina tester" utan gissning.</li><li>Vad Varbi är (rekryteringssystemet, inte testet).</li><li>Upphandlingen: kommuner och regioner köper test via Addas ramavtal Arbetspsykologiska tester 2024 (2026 till 2030), där bland andra Aon, Assessio, Talogy och Thomas är tilldelade. Vilka som får avropa kontrolleras i avtalets bilaga före skrivning. Statens inköpscentral kontrolleras på avropa.se.</li><li>Säkerhetsprövning och registerkontroll: länk till bakgrundskontroll-vid-anstallning.</li><li>Faktaruta: "Vi har ingen koppling till någon av myndigheterna. Vi vet inte vilket test en viss myndighet använder i en viss rekrytering, och det står i inbjudan."</li></ul> | Matrisprovet. Köpväg: prov, konto, "Mitt test" Annat eller den leverantör inbjudan nämner, vägg. Tullverket och Kustbevakningen till I-provets smakprov med `mitt_test=iprov` | Vecka 49 | M |
| N10 | `/artiklar/logiskt-test-figurer` | logiskt test figurer, logiskt test figurer förklaring | iq test figurer, iq test figurer förklaring, logiktest med figurer, figurserier, figurtest | <ul><li>Snabbsvar: figuruppgifterna styrs av ett fåtal regler (förflyttning, rotation, antal, addition och subtraktion, spegling, färg och fyllnad).</li><li>En löst uppgift per regel, ritad med testernas figurritare, med förklaringen steg för steg.</li><li>Figurserier mot matriser: skillnaden, och länk till matrislogik-test-guide för matriserna.</li><li>Hur du hittar regeln när två regler gäller samtidigt.</li><li>Var figurer förekommer: Aon (scales ix, cls), Alva, Matrigma, I-provet. Länk per leverantör.</li></ul> | Figurserieprovet inbäddat. Köpväg: prov, konto, Nivåkollen figurserier, vägg | Vecka 50 (7 till 13 dec), efter avläsningen av logiska-tester 7 dec | M |
| N11 | `/artiklar/cubiks-logiks-test` | cubiks test, cubiks logiks | cubiks test gratis, talogy test, talogy logiks, logiks advanced, logiks general intermediate | <ul><li>Vad Talogy (tidigare Cubiks) är, och delarna i Logiks: numeriskt, verbalt, abstrakt.</li><li>Intermediate och Advanced: antal uppgifter och tider bara med källa hos Talogy, annars "enligt övningsleverantörer".</li><li>En egen löst uppgift per del.</li><li>Länk till Talogys egna övningstester, som är gratis, och vad vi har som de inte har (nivåer, pass, progression).</li></ul> | Numeriskt prov. Köpväg som Aon. `mitt_test` saknar Cubiks; valet "Annat" tills ett eget val är beslutat (avsnitt 10) | Januari, från 7 jan, efter N4 SHL | M |

**Ska vänta eller inte byggas:**
- **Egen sida för personlighetstest-tips.** Nej. Avsikten ägs av personlighetstest-jobb-guide, som stiger (U12).
- **Egna sidor för Säpo, Skatteverket eller Tullverket.** Nej nu. Omprövas 9 feb bara om N9 får över 300 visningar på 28 dagar och ett namn står för mer än hälften.
- **Assessio-sida.** Nej. Assessio är Matrigma och MAP, som har varsin sida. Ordet läggs i matrigma-test (U8).
- **Flygledare, FEAST, case-intervju, videointervju.** Se avsnitt 9. Videointervju ligger kvar i Q4-planen som intervjuartikel.

### 3.3 Befintliga sidor som uppdateras

Numreringen fortsätter från förra planens U1 till U10.

| # | Sida | Varför | Ändring | När | Insats |
|---|---|---|---|---|---|
| U11 | `/artiklar/alva-labs-logiktest` | Klustrets största sida. 2 129 visningar och 29 klick på 28 dagar, pos 10,7. Ettan på "resultat" men saknar svaren per poäng | <ul><li>seoTitle: "Alva Labs logiktest: öva gratis och läs resultatet 1 till 10" (60 tecken). Alternativ: "Alva logiktest: öva gratis och förstå resultatet 1 till 10" om "alva logiktest" ska fram.</li><li>description med "Alva logiktest" tidigt, "öva gratis" och "vad 6, 7 eller 8 betyder".</li><li>Avsnittet om skalan får en JSX-tabell per steg 1 till 10 med vad det betyder, med källa hos Alva Labs eller "enligt Alva Labs hjälpcenter".</li><li>Nytt H2 "Kan man göra om Alva Labs logiktest?" med Alvas egen hjälpartikel som källa.</li><li>Nytt H2 "Tips inför Alva Labs logiktest" (fem råd, länk till N7 för resten).</li><li>FAQ: "Vad är ett bra resultat på Alva Labs?", "Kan arbetsgivaren se hur många jag fick rätt?".</li><li>H1 och title orörda enligt standarden. Inget tas bort.</li></ul> | Vecka 47 (16 till 22 nov). Inte under avläsning | S till M |
| U12 | `/artiklar/personlighetstest-jobb-guide` | Stiger: "personlighetstest rekrytering exempel" från pos 30 till 10,5. "personlighetstest rekrytering" pos 27,6. Tipsfrågorna saknar svar | <ul><li>Nytt H2 "Hur ska man svara på ett personlighetstest?" med sju råd (svara som du är på jobbet, inte mittenalternativet av försiktighet, konsekvens, ingen idealbild, läs påståendet en gång).</li><li>FAQ "Kan man misslyckas på ett personlighetstest?".</li><li>Länk till alva-labs-logiktest för Alvas personlighetstest och till map-test-personlighetstest.</li><li>**seoTitle och description rörs inte**, sidan stiger.</li></ul> | Vecka 50, efter avläsningen 7 dec | S |
| U13 | `/artiklar/i-prov` | "iq test polis" har tio autoförslag, pos 44 hos oss | <ul><li>Nytt kort H2 "Är I-provet ett IQ-test?": nej i strikt mening, ett test av generell problemlösningsförmåga på stanineskalan, med källa.</li><li>FAQ "Finns det ett gratis IQ-test för polisen?" som svarar ärligt (Polisen publicerar inga övningsuppgifter för I-provet, vi har smakprovet).</li><li>Länk till N8 med "stanineskalan".</li><li>Titeln orörd (sidan är fyra dagar gammal).</li></ul> | Vecka 50 | S |
| U14 | `/artiklar/logiska-tester` | Under avläsning till 7 dec. Tar "logiskt test figurer förklaring" och "logiskt tänkande test gratis" utan klick | <ul><li>Efter 7 dec: länkar till N7 ("tips inför logiktest") i "Så förbereder du dig", till N8 ("stanine och percentil") i "Så tolkas ditt resultat" och till N10 ("logiskt test med figurer") i "Typerna av logiska tester". En mening var, inget tas bort.</li><li>Titeln: bara om avläsningen 7 dec visar att positionen inte kommit tillbaka. Då prövas "logiskt tänkande" i description, inte i title.</li></ul> | Vecka 50 | S |
| U15 | `/verktyg/rekryteringstester` | Hubben, pos 21 till 30 på huvudorden | <ul><li>Nytt kort block "Inför testet" under "Vilket test ska du göra?" med tre länkar: tips (N7), resultatet (N8), myndigheter (N9).</li><li>FAQ "Vilka tester använder myndigheterna?" med länk till N9.</li><li>Title och description rörs inte (prövas efter 18 dec enligt beslutet 10 nov).</li><li>SEO-diffen körs.</li></ul> | Vecka 50 | S |
| U16 | `/artiklar/arbetspsykologiska-tester` | Navet. Avläses 7 dec | <ul><li>"Så förbereder du dig" får länk till N7, "Så tolkas ditt resultat" till N8, "Vilka verktyg används" en mening om myndigheterna och länk till N9.</li><li>Inget annat före avläsningen.</li></ul> | Vecka 50 | S |
| U17 | `/artiklar/numeriskt-test-guide` och `/artiklar/verbalt-test-guide` | 461 visningar på pos 4 till 13 och noll klick på 28 dagar | <ul><li>numeriskt: seoTitle "Numeriskt test: exempel med lösning och öva gratis" (50).</li><li>verbalt: seoTitle "Verbalt resonemang test: exempel med svar, öva gratis" (53).</li><li>description 110 till 158 tecken med provet (fem uppgifter, svar direkt) tidigt.</li><li>Bara metadata. Proven är redan inbäddade (våg 2, 10 nov).</li></ul> | Vecka 47 | S |
| U8 (utökad) | `/artiklar/matrigma-test` | Förra planens U8 efter 7 dec. "assessio test" 34 visn pos 55 på fel sida | Utöver förra planens U8: H2 "Assessios tester: Matrigma och MAP i samma utskick" byggs ut från "Matrigma kommer ofta tillsammans med MAP" så att sidan äger "assessio test" och "assessio test gratis". "matrigma test tips" och "matrigma resultat" ägs här och kräver ingen ny sida | Vecka 50 | S |
| U18 | `/artiklar/logiktest-exempel-med-losningar` | Äger redan "logiskt tänkande övningar med facit" (pos 5) | En mening i "Så använder du uppgifterna" med "logiskt tänkande", och länk till N10 från figurseriedelen. Inget mer | Med N10 | S |

**Inte i den här omgången:** map-test-personlighetstest (pos 2,6 på "map test", stabil), rotation-test-guide, talserier, ordforstaelse-test och deduktivt-induktivt-test (fyra dagar till två månader gamla, avläses 7 dec och 18 dec enligt förra planen), matrislogik-test-guide (bara förra planens U8).

### 3.4 Kannibaliseringsrisker och vem som äger vilket ord

Tabellen utökar förra planens 3.4. Raderna där gäller fortfarande.

| Ord | Ägare | Får inte konkurrera | Risk i dag |
|---|---|---|---|
| logiktest tips, tips inför logiktest, hur klarar man logiktest, kan man öva på logiktest, fuska på logiktest | N7 | logiska-tester ("Så förbereder du dig" behålls men slutar med länk), arbetspsykologiska-tester, matrislogik-test-guide ("Strategin som höjer ditt resultat") | **Medel.** Fem sidor har förberedelseavsnitt. Ingen av dem har ordet "tips" i titel eller rubrik i dag, och ingen syns på tipsorden. Rubrikerna där byts inte |
| alva labs logiktest tips, alva resultat 1 till 10, alva göra om | alva-labs-logiktest | N7, N8 | Låg. N7 och N8 nämner Alva med en mening och länk |
| matrigma test tips, matrigma resultat, assessio test | matrigma-test | N7, N8, map-test-personlighetstest (äger "assessio personlighetstest" och "assessio map") | Medel. "assessio test" ligger i dag på map-sidan pos 55 |
| personlighetstest tips, hur ska man svara på personlighetstest, personlighetstest rekrytering | personlighetstest-jobb-guide | N7, map-test-personlighetstest, /verktyg/personlighetstest | Låg |
| stanine, stanineskala, logiktest resultat, percentil i test | N8 | i-prov (äger "i-prov resultat" och polisens krav), alva, matrigma | **Medel.** i-prov har "Varför ett övningsprov inte kan ge dig en stanine". Den rubriken behålls; N8 förklarar skalan, i-prov kravet |
| arbetspsykologiska tester + myndighetsnamn, säpo test, tullverket tester, varbi tester | N9 | arbetspsykologiska-tester (äger ordet utan myndighet), i-prov (äger "i-prov" och polisen), bakgrundskontroll-vid-anstallning (äger "bakgrundskoll polis") | Medel. Navet nämner myndigheter med en mening och länk |
| iq test polis, begåvningstest polisutbildningen | i-prov | N8, N9, logiska-tester | Låg |
| logiskt test figurer (förklaring), iq test figurer, figurserier | N10 | logiska-tester (pos 9,8 i dag, noll klick), logiktest-exempel (figurseriedelen), matrislogik-test-guide (matriser) | **Medel till hög.** Google kan pendla mellan logiska-tester och N10 i fyra till sex veckor. Därför publiceras N10 efter avläsningen 7 dec, och logiska-tester länkar till N10 med "logiskt test med figurer" |
| cubiks test, talogy logiks | N11 | numeriskt-test-guide, verbalt-test-guide, logiska-tester (leverantörsavsnittet) | Låg |
| numeriskt test, verbalt resonemang | numeriskt-test-guide, verbalt-test-guide | matrislogik-test-guide (tar "numeriskt test" pos 31 i dag) | Låg. matrislogik-guidens enstaka träff försvinner när numeriskt-guidens CTR stiger |

---

## 4. Köpvägen per sida

Säljgranskningen 10 nov ville ha köpvägen från början. Kedjan är densamma för alla sidor: **artikel, prov (inbäddat), konto, "Mitt test", provdatum (bara I-provet och lokförare), vägg, köp.** Allt i kedjan finns i produkten sedan 10 nov: `ArtikelProv`, kakan `jc_provkalla`, `acquisition_source.kalla = smakprov:<slug>`, `mitt_test` från artikeln, provdatumskärmen och dag 2-mejlet för alla typer. Inget nytt behöver byggas för N7 till N10.

Utgångsläget (P2, 26 dagar, säljgranskningen): 273 provstarter, 85 procent slutför, 29 konton (18 procent av kontosteget, mål 30), 5 köp på 63 nya konton. Köp per nytt konto 3 till 8 procent. Alla tal nedan är hypoteser med avläsningsdatum.

| Sida | Vem kommer | Köpnärhet | Prov | `mitt_test` | Var Premium står | Köp per konto (hypotes) |
|---|---|---|---|---|---|---|
| U11 alva | Har inbjudan från en arbetsgivare med Alva, ofta inom några dagar | **Hög** | Matris | `alva` (finns) | Provets premiumrad: övningsprov i Alvas format, 20 uppgifter med två minuter var, i Premium | 5 procent |
| N7 tips | Har ett test framför sig, vet ofta inte vilket | Medel till hög | Matris | Valet på kontot ("Mitt test är …") | Efter provet, och i texten: pass varje dag fram till testet ingår i Premium | 5 procent |
| N8 stanine | Två grupper: före I-provet (datum) och efter ett test (resultat i handen) | Hög för I-provsgruppen, låg för skolgruppen | I-provets smakprov högt, matris lägre ner | `iprov` från I-provsrutan | I-provsrutan: hela övningsprovet i I-provets ordning med tid per deltest ingår i Premium | 10 procent i I-provsgruppen, 2 procent övriga |
| N9 myndigheter | Har en inbjudan från en myndighet | Medel till hög | Matris, I-provet för Tullverket och Kustbevakningen | Annat, eller `iprov` | Efter provet | 5 procent |
| N10 figurer | Blandat: söker förklaring, övar inför test | Låg till medel | Figurserier | Valet på kontot | Efter provet | 2 procent |
| N11 Cubiks | Har inbjudan från Talogy | **Hög** | Numeriskt | Annat (inget Cubiks-val) | Efter provet | 5 procent |
| U12 personlighet | Har fått personlighetstest | Låg | Personlighetsprovet (finns) | Ingen | Ingen vägg i personlighetsprovet | 0, kontomål räcker |
| U13 i-prov | Har datum | **Hög** | I-provets smakprov (finns) | `iprov` | Som N1 | 10 procent (som förra planen) |
| U17 numeriskt, verbalt | Har ofta inbjudan (SHL, Aon, Talogy) | Medel | Numeriskt, verbalt (finns) | Valet på kontot | Efter provet | 3 procent |

**Två saker för säljansvarig att väga:**
1. **N8:s skolgrupp.** "stanine dyslexi" och "stanineskala läsning" drar föräldrar och lärare. De köper inte. Snabbsvaret och första H2 ska tydligt säga att sidan handlar om arbetstester och I-provet, så att fel besökare lämnar snabbt i stället för att starta provet.
2. **Myndighetssökaren.** Den som söker "arbetspsykologiska tester skatteverket" har en inbjudan men vet inte leverantören. Kontots "Mitt test" har inget val för "myndighet". Förslag (kräver beslut, avsnitt 10): inget nytt val nu, utan "Annat" och kryssrutorna, och mätning av hur många från N9 som väljer vad.

---

## 5. Interna länkar

### 5.1 Från artiklarna till testerna

Oförändrat från förra planen: varje testartikel har det inbäddade provet, en textlänk i snabbsvaret med typens namn och "Se alla tester och nivåer" till hubben. Ankartexten är typens namn, aldrig "klicka här".

### 5.2 Mellan de nya sidorna och klustret

| Från | Till | Ankartext | Var |
|---|---|---|---|
| N7 | alva-labs-logiktest, matrigma-test, aon-cut-e-test, deduktivt-induktivt-test (SHL) | leverantörens namn plus "test" | Avsnittet "Ta reda på vilket test det är" |
| N7 | N8 | "så läser du resultatet" | Avsnittet efter testet |
| N7 | personlighetstest-jobb-guide | "hur du svarar på ett personlighetstest" | Ett stycke |
| N8 | i-prov | "polisens krav på I-provet" | Stanine i I-provet |
| N8 | alva-labs-logiktest, matrigma-test | "Alvas skala 1 till 10", "Matrigmas C-skala" | Jämförelsetabellen |
| N9 | i-prov | "I-provet" | Tullverket och Kustbevakningen |
| N9 | arbetspsykologiska-tester | "arbetspsykologiska tester" | Snabbsvaret |
| N9 | bakgrundskontroll-vid-anstallning | "säkerhetsprövning och registerkontroll" | Säkerhetspolisen |
| N10 | matrislogik-test-guide, logiktest-exempel-med-losningar | "matriser", "fler logiktest med lösning" | Figurserier mot matriser |
| logiska-tester (U14), arbetspsykologiska-tester (U16) | N7, N8, N10, N9 | "tips inför logiktest", "stanine och percentil", "logiskt test med figurer", "tester hos myndigheter" | En gång var, i befintligt avsnitt |
| alva-labs-logiktest (U11) | N7 | "fler tips inför logiktest" | Sist i tips-H2:n |
| i-prov (U13) | N8 | "stanineskalan" | "Är I-provet ett IQ-test?" |
| /verktyg/rekryteringstester (U15) | N7, N8, N9 | "Tips inför testet", "Så läser du resultatet", "Tester hos myndigheter" | Blocket "Inför testet" |

Högst en länk per målsida och avsnitt, som förut. Ingen sidfot med testlänkar.

---

## 6. Schema

| Schema | Var | Rimligt? | Varför |
|---|---|---|---|
| BlogPosting, FAQPage, BreadcrumbList, Speakable | N7 till N11 och uppdaterade sidor, automatiskt från frontmatter | Ja | 5 till 6 FAQ per ny sida, var och en med en synlig `<FAQItem>`. FAQ ger inget rich result för oss sedan 2023, men språkmodeller läser det |
| HowTo via `howto:` | N7, bara om "Veckan före testet" skrivs som en äkta stegföljd med dagar | Ja, med försiktighet | Tipslistor är inte HowTo. Testdagens råd är det inte heller |
| Tabeller | N8 (stanine 1 till 9, skalorna jämförda), U11 (Alva 1 till 10) | Ja, som JSX `<table>` | Markdowntabeller renderas som rå text. Tabellen är det GEO-svar språkmodeller citerar för "vad betyder stanine 3" |
| Quiz | | **Nej** | Som förra planen: kräver facit i HTML |
| GovernmentOrganization eller Organization för myndigheter och leverantörer | N9, N11 | **Nej** | Kan läsas som samarbete. Namnen står bara i löptext med källa |
| LearningResource | | Inte nu | Förra planens beslut: efter 9 feb, om alls |

---

## 7. Mätning

### 7.1 Vad mäts

Samma mått och händelser som förra planen (7.1), med nya kluster:

| Kluster | Regex i avläsningsskriptet (förslag) | Målsida |
|---|---|---|
| Tips | `tips|klarar man|öva på logiktest|träna upp logiskt|fuska` utan "brev", "cv", "intervju", "lön" | N7 |
| Resultat | `stanine|percentil|logiktest resultat|bra resultat` utan "alva", "matrigma" | N8 |
| Alva | `alva` | U11 |
| Myndigheter | `skatteverk|kronofog|försäkringskass|migrationsverk|arbetsförmedl.*test|säpo|säkerhetspolis|tullverk|kriminalv.*test|varbi` | N9 |
| Figurer | `figur` | N10 |
| Cubiks | `cubiks|talogy|logiks` | N11 |
| Personlighet | `personlighetstest` utan "map", "alva" | U12 |
| Numeriskt och verbalt | `numerisk|verbal` | U17 |
| IQ polis | `iq.*polis|begåvningstest polis` | U13 |

Köpkedjan per sida läses som säljgranskningen kräver: GSC-klick, `article_cta_clicked` (slug, variant `prov-<typ>`), `sample_started` och `sample_completed` med `test_kind`, `signup_completed` och `acquisition_source.kalla = smakprov:<slug>`, `mitt_test_valt`, `provdatum_satt`, `betalvagg_visad` och `paywall_cta_clicked` med `konto_kalla`, köp i Stripe med kontots id. Konton räknas i Supabase, ägaren och testkontona undantagna.

### 7.2 Avläsningsdatum

Samma kalender som förra planen. Julveckorna 21 dec till 6 jan räknas inte in i trendfönster.

| Datum | Vad läses av |
|---|---|
| 7 dec | Förra planens avläsning (logiska-tester, navet, U1, N1 till N3, ingången). Dessutom U11 och U17 efter tre veckor (tidig signal: CTR, inte position), indexering av N7 |
| 18 dec | **Baslinje före jul**, 28 dagar 20 nov till 17 dec. U11 och U17 första riktiga fönster. Indexering av N8 till N10 |
| 19 jan | Första fönstret efter jul (7 till 17 jan mot 7 till 17 dec) |
| 9 feb | **Huvudavläsningen**, 28 dagar 10 jan till 6 feb mot baslinjen. Beslut om egna myndighetssidor och om N11 ska få ett eget val i "Mitt test" |
| 9 mar | Andra avläsningen. Köpmålen bedöms här, inte före |

### 7.3 Mål

Målen gäller 28-dagarsfönster. Utgångsläget är 15 okt till 11 nov.

| Kluster | I dag (28 d) | 9 feb | 9 mar |
|---|---|---|---|
| Alva (alva-labs-logiktest) | 2 129 visn, 29 klick, pos 10,7 | 2 300 visn, 50 klick, pos under 8 | 70 klick, pos under 7 |
| Numeriskt och verbalt (U17) | 461 visn, 0 klick | 10 klick | 15 klick |
| Tips (N7) | 0 | 150 visn, 4 klick | 400 visn, 12 klick |
| Resultat och stanine (N8) | 0 (alva och matrigma räknas inte här) | 200 visn, 4 klick | 500 visn, 12 klick |
| Myndigheter (N9) | 0 | 100 visn, 3 klick | 300 visn, 10 klick |
| Figurer (N10 som visad sida) | 267 visn på fel sida, 0 klick | N10 visas, 6 klick | 10 klick, pos under 8 |
| Personlighetstest (U12) | 561 visn, 3 klick, pos 25,4 | pos under 15, 8 klick | 12 klick |
| IQ polis (U13, på i-prov) | några visn, pos 44 | pos under 20 | pos under 12 |
| **Testklustret totalt** | 8 067 visn, 67 klick (0,8 procent) | 1,3 procent CTR | 1,6 procent CTR, 150 klick |
| **Konton från N7 till N10 och U11** | 0 från nya sidor; alva mäts från 10 nov | 6 på 28 dagar | 15 på 28 dagar |
| **Köp från samma sidor** | | mät, inget mål | 1 till 2 |

**Hur målen räknats:**
- Alva: CTR på position 7 till 8 för en sida med prov och resultatsvar bör ligga kring 2 till 3 procent. 2 300 visningar gånger 2,2 procent ger 50.
- Nya sidor: samma storleksordning som förra planens N2 och N3, som också började från noll.
- Kontomålet bygger på dagens tratt (ett konto per omkring tio provstarter) och att hälften av klicken startar provet.
- Det är golv. Januari är jobbsökets högsäsong, och gratisnivån och priset påverkar mer än SEO.

**Omprövningsregler 9 feb:**
- N9 under 50 visningar på 28 dagar: inga fler myndighetssidor, och titeln ses över.
- U11 utan förbättring i position: titeln går tillbaka och innehållet ses över av art-director, som saas-lead föreslog för spatial.
- N10 och logiska-tester pendlar fortfarande: rör ingen titel, vänta till 9 mar.

---

## 8. Ordning, insats och effekt

| Ordning | Åtgärd | Insats | Förväntad effekt | Beroende |
|---|---|---|---|---|
| 1 | **U11: alva-labs-logiktest** med ny seoTitle, resultattabell 1 till 10, "Kan man göra om?", tips-H2 och FAQ | S till M | Största enskilda klickvinsten. Från 29 till 50 klick i månaden på klustrets största sida, med en köpbenägen besökare som redan får `mitt_test=alva` | Inget. Vecka 47 |
| 2 | **U17: seoTitle och description för numeriskt och verbalt** | S | 10 till 15 klick i månaden från 461 visningar som i dag ger noll. Proven finns redan på sidorna | Inget. Vecka 47 |
| 3 | **N7: /artiklar/logiktest-tips** med matrisprovet | M | Tar en avsikt som saknar ägare hos oss och hos konkurrenterna. Den är också navet för alla förberedelseavsnitt, så den skickar vidare till leverantörssidorna | Vecka 48 |
| 4 | **N8: /artiklar/stanine-testresultat** | M | Svag svensk konkurrens på "stanineskala". Matar I-provet med köpbenägna besökare. Ersätter tolka-testresultat i Q4-planen | Vecka 49, före 14 dec |
| 5 | **N9: /artiklar/tester-hos-myndigheter** | M | Ny efterfrågan med inbjudan i hand, och en sanningsprofil som ingen konkurrent har. Källorna måste kontrolleras myndighet för myndighet | Vecka 49, före 14 dec |
| 6 | **N10: /artiklar/logiskt-test-figurer** med figurserieprovet | M | 267 visningar på sida 1 som i dag ger noll klick. Väntar på avläsningen 7 dec | Vecka 50, före 14 dec |
| 7 | U12, U13, U14, U15, U16, U8 (utökad), U18: länkar och avsnitt | S var | Länkarna ger de nya sidorna kraft, och U12 och U13 tar personlighetstips och "iq test polis" | Vecka 50 |
| 8 | N11: /artiklar/cubiks-logiks-test | M | Medelstor, köpbenägen efterfrågan med starka betalkonkurrenter | Januari, efter N4 SHL |

**Innehållstakten.** November: N7, plus det som står kvar i Q4-planen (videointervju-tips). December: N8, N9 och N10 före 14 dec, plus soka-sommarjobb ur Q4-planen. Det ger fyra till sex nya sidor per månad tillsammans med Q4-planen, inom ägarens sex till tio. Hinner N10 inte till 14 dec väntar den till 7 jan, inte till mellandagarna.

**Arbetsflödet** för varje ny sida och omskrivning följer artikelstandarden:
- Search Console-analys
- källor verifierade (myndigheternas egna sidor för N9, Hausknecht m.fl. 2007 för N7, Polistidningen och polisen.se för stanine i N8, Alva Labs hjälpcenter för U11, Talogy för N11)
- copywriting utan AI-mönster och utan talstreck
- GEO-snabbsvar
- slop-kontroll
- egen SVG-bild
- tabeller som JSX
- SEO-diffen före push

---

## 9. Risker och vad vi inte gör

**Risker:**
1. **Att gissa vilket test en arbetsgivare använder.** N9 är den riskablaste sidan i planen. Varje påstående om en myndighet har en länk till myndighetens egen sida. Påståenden från övningsleverantörer ("Försäkringskassan använder Aon Scales") återges inte. Addas ramavtal säger vilka leverantörer som får säljas, inte vem som köper. Det ska stå så.
2. **Att verka ha koppling.** Inga logotyper, inget "officiellt", inget "samma test som". Faktarutan om att vi saknar koppling står på N9 och N11, som på i-prov.
3. **Fusk.** H2:n i N7 svarar ärligt att det inte går och varför. Den får inte bli en instruktion, och den nämner inga verktyg.
4. **Stanine.** N8 ger aldrig någon ett stanine-värde och skriver aldrig att vårt prov motsvarar en viss stanine. Percentilraden i vårt prov jämför med andra som gjort provet, och det står med de orden.
5. **Leverantörernas skalor.** Alvas 1 till 10 och Matrigmas C-skala beskrivs med leverantörens egen källa. Inga leverantörsuppgifter, exempelfrågor eller facit återges.
6. **Pendling mellan logiska-tester och N10.** Därför efter 7 dec, och inga titelbyten på någon av dem under fyra till sex veckor efter publicering.
7. **Skolavsikt på N8.** Mäts som andel som lämnar utan att starta provet. Snabbsvaret avgränsar.
8. **Löften före produkten.** N11 lovar inget Cubiks-prov. Den säger att vi har numeriskt, verbalt och figurserier i samma typ av uppgifter.
9. **Julen.** Publicera senast 14 dec eller vänta till 7 jan.

**Vi gör inte:**
- Sidor för allmänt "iq test", "iq test gratis", "mensa test", "testa din iq". Underhållningsavsikt, Mensa och quizsajter, och ingen köper övning.
- Koncentrationstest som SEO-sida. Ingen produkt (beslut 9 feb gäller via lokförarräknaren).
- Flygledare och FEAST. Autoförslagen finns ("flygledare tester", "feast tester flygledare") men vi saknar multitasking och spatial navigering i FEAST-form, och "avinor" är norskt. Omprövas om ett pilot- eller flygledarpaket blir ett produktbeslut.
- Case-intervju (revision, PwC, EY, Deloitte). Intervjuklustret, inte testklustret.
- Videointervju (Adecco, Jysk, EY). Ligger i Q4-planen som videointervju-tips. Dubblas inte här.
- En sida per företag ("lidl rekryteringstest", "klarna logiktest"). Tunna sidor som måste gissa testet.
- Hogan, Thomas GIA och PPA, Predictive Index, Korn Ferry, Talent Q och TestGorilla. Mest engelska autoförslag. Omprövas vid nästa omgång.
- Assessio-sida, egen personlighetstips-sida, egna sidor per myndighet. Se 3.2.
- Ändringar på sidor under avläsning före 7 dec (logiska-tester, arbetspsykologiska-tester, i-prov, talserier, ordforstaelse-test, rotation-test-guide).
- Titelbyte på hubben före 18 dec, och på personlighetstest-jobb-guide medan den stiger.
- Länkköp och utbyten med övningssajter.

---

## 10. Kräver ägaren

1. **Indexeringsbegäran i Search Console** för N7, N8, N9 och N10 samma dag som de publiceras, och för alva-labs-logiktest, numeriskt-test-guide och verbalt-test-guide efter U11 och U17. Servicekontot kan bara läsa. Bing via IndexNow kör agenten.
2. **N9 som sida över huvud taget.** Den är sann och efterfrågad, men den nämner myndigheter med namn. Ägaren avgör om risken (avsnitt 9, punkt 1 och 2) är godtagbar med reglerna i planen.
3. **N8 ersätter "tolka-testresultat" i Q4-planen**, med slugen `stanine-testresultat`.
4. **Ordningen:** U11 och U17 nu, N7 vecka 48, N8 och N9 vecka 49, N10 och länkarna vecka 50, alla senast 14 dec. N11 i januari efter SHL.
5. **"Mitt test" för myndigheter och Cubiks:** inget nytt val nu, "Annat" och mätning från N9 och N11 till 9 feb. Ett nytt val är en produktändring och beslutas då.
6. **Godkännande av målen i 7.3** och omprövningsreglerna, med julveckorna utanför.
7. **Push till main** för varje omgång, enligt arbetsreglerna.

---

## Källor

- Search Console:
  - jobbcoach.ai, frågor plus sida, 14 aug till 11 nov 2026 och 15 okt till 11 nov 2026.
  - URL-inspektion 14 nov 2026.
- Googles autoförslag (hl=sv, gl=se), 14 nov 2026.
- Skatteverket, När du söker jobb hos oss: https://www.skatteverket.se/omoss/jobbahososs/ledigajobb/nardusokerjobbhososs.4.71004e4c133e23bf6db800096725.html
- Kronofogden, Så här rekryterar vi: https://kronofogden.se/jobba-hos-oss/lediga-jobb/sa-har-rekryterar-vi
- Säkerhetspolisen, Rekryteringsprocessen: https://sakerhetspolisen.se/jobba-hos-oss/rekryteringsprocessen.html
- Kriminalvården, Forskare föreslår tester vid rekrytering (feb 2026): https://www.kriminalvarden.se/om-kriminalvarden/nyheter/2026/februari/forskare-foreslar-tester-vid-rekrytering/
- Tullverket, Så blir du tullaspirant: https://www.tullverket.se/jobbahososs/attjobbapatullverket/jobbahososs/jobbasomtullinspektor/sablirdutullaspirant.4.10448d116681449badc7.html (sidans text gick inte att läsa 14 nov; kontrolleras före N9)
- Adda, Arbetspsykologiska tester 2024 (tilldelning, avtalstid 2026-06-22 till 2030-06-21): https://www.adda.se/upphandling-och-ramavtal/planerade-och-pagaende-upphandlingar/rekryteringstjanster-2024-webbaserade-arbetspsykologiska-testverktyg-for-rekrytering-och-urval/
- Polistidningen, Vad har egentligen hänt med begåvningskravet? (2022): https://polistidningen.se/2022/06/vad-har-egentligen-hant-med-begavningskravet/
- Polistidningen, nytt begåvningstest från 5 maj 2025: https://polistidningen.se/2025/04/nytt-intelligenstest-i-polisprovningen/
- Hausknecht, Halpert, Di Paolo och Moriarty Gerrard (2007), Retesting in selection: a meta-analysis of coaching and practice effects for tests of cognitive ability, Journal of Applied Psychology 92, 373 till 385: https://ecommons.cornell.edu/entities/publication/97becf46-3c0a-4de4-a48f-79b715ba8446
- Alva Labs hjälpcenter, What if I'm not happy with my test results?: https://help.alvalabs.io/en/articles/5040186-what-if-i-m-not-happy-with-my-test-results
- Stanine, översikt: https://en.wikipedia.org/wiki/Stanine
- Konkurrenter:
  - logiktester.se: https://logiktester.se/ och https://logiktester.se/personlighetstest/
  - Neurobics, figurer med förklaring: https://www.neurobics.se/tester/logiska-tester/figurer-med-forklaring/
  - Neurobics, Cubiks Logiks: https://www.neurobics.se/tester/begavningstester/cubiks-logisk/
  - testttalent.se, Cubiks på svenska: https://testttalent.se/cubiks-tests-pa-svenska/
  - JobTestPrep: https://www.jobtestprep.se/logiktest, https://www.jobtestprep.se/cubiks-talogy-test, https://www.jobtestprep.se/jobba-pa-forsakringskassan
  - SquidFactor: https://learn.squidfactor.se/logiktest
  - cv-mallar.net: https://www.cv-mallar.net/rekryteringstester-guide/logiktester/
  - Talogy, övningstester: https://practicetests.cubiks.com/se/vara-bedomningar
  - Clevry, tips inför personlighetstest: https://www.clevry.com/sv/resurser/tips-infor-test/tips-infor-personlighetstest/
- Övriga källor om leverantörer och I-provet: se förra planens källor och `docs/rapporter/gap-testtyper-2026-11-09.md`.

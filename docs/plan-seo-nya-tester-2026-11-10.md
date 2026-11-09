# SEO-plan för de nya testerna (10 november 2026)

SEO-strategen, 2026-11-09 och 10. Det här är bara en plan. Ingen kod är ändrad och inget är publicerat. Saas-lead och säljansvarig granskar först, och sedan beslutar ägaren. Inget i avsnitt 7 och 9 påbörjas före ägarens ja.

**Underlag:**
- `docs/rapporter/gap-testtyper-2026-11-09.md`
- `docs/design/brief-tester-steg2-2026-11-09.md`
- `docs/design/spec-prov-fler-typer-2026-11-09.md`
- `docs/rapporter/analys-2026-11-08.md`
- `docs/plan-efter-analys-2026-11-08.md`
- `docs/plan-content-2026-q4.md`
- `docs/plan-huvudord-2026-12.md`
- Färsk Search Console-data per fråga och sida:
  - 90 dagar: 9 aug till 7 nov.
  - 28 dagar: 11 okt till 7 nov.
  - Hämtad med servicekontot 9 nov och sparad i scratchpad `seo-tester/qp.json`.
- URL-inspektion av åtta testsidor, gjord 9 nov.
- Googles autoförslag (hl=sv, gl=se), hämtade 9 nov.
- Webbsök efter konkurrenterna, gjord 9 nov.

**Om sökvolym:**
- Vi har inget sökordsverktyg. Därför anges efterfrågan på tre sätt:
  - våra egna visningar i Search Console
  - om Googles autoförslag finns och vilka varianter som föreslås
  - hur mycket konkurrenterna har byggt för ordet
- Autoförslag visar att ordet söks i Sverige, men inte hur ofta.
- Search Console döljer sällsynta frågor. Analysen 23 september visade att 86 procent av klicken saknar fråga, så våra frågetal är golv och inte tak.
- Kolumnen "Rankar i dag" bygger på webbsök och konkurrenternas egna sidor, inte på ett svenskt sökresultat som lästs av rad för rad. Den ska kontrolleras i ett inkognitofönster med svensk plats innan N1 till N3 skrivs.

---

## 1. Det viktigaste först

1. **Vi syns redan där vi saknar produkt.**
   - "spatial förmåga" gav 227 visningar på 90 dagar. Rotation-test-guide ligger på position 9,3 och har fått ett enda klick.
   - Klustret runt spatial förmåga gav 312 visningar och 2 klick på 90 dagar.
   - "lokförare test gratis" gav 42 visningar på position 8,9 på logiska-tester, som inte ens handlar om lokförare.
   - När Rumsuppfattning går live är det den billigaste vinsten i hela planen.
2. **I-prov, mönstring, polis, talserier och ordförråd ger noll visningar hos oss**, eftersom vi inte har något innehåll om dem. Efterfrågan finns ändå, och den syns i autoförslagen:
   - "i-prov 2025"
   - "i-prov polis"
   - "i-prov mönstring resultat"
   - "iprov polisen"
   - "mönstring test"
   - "mönstring iq test exempel"
   - "pliktverket iq test"
   - "talserier test"
   - "talserier övning"
   - "ordförståelse test polis"
   - "uniq test polis"

   Tre svenska aktörer har byggt egna sidor för I-provet: logiktester.se, testttalent.se och JobTestPrep, plus SquidFactor. Det är den största nya möjligheten.
3. **Deduktivt har en sida som Google inte har indexerat.**
   - `/artiklar/deduktivt-induktivt-test` publicerades 23 september. Enligt URL-inspektionen 9 nov har den status "Discovered, currently not indexed".
   - Frågorna om deduktivt gav 276 visningar på 90 dagar, och alla landade på logiska-tester.
   - Indexeringsbegäran kan bara ägaren göra.
4. **Provet utan konto är `noindex`.** `/verktyg/rekryteringstester/prova` ska vara kvar så, eftersom den är ett flöde. SEO-värdet ska i stället ligga i indexerbara sidor som visar en riktig uppgift i HTML och startar provet direkt på sidan.

---

## 2. Sökordskarta

**Förklaringar till tabellerna:**
- Avsikten anges som:
  - I: informera
  - Ö: öva eller testa nu
  - K: kommersiell, vill köpa övning
  - N: navigera till en viss tjänst
- "GSC 90 d" betyder våra visningar, klick och position från 9 aug till 7 nov.
- "Auto" betyder att Google föreslår ordet eller varianter av det.
- Chansen bedöms som hög, medel eller låg. Bedömningen bygger på vår position i dag, hur stark konkurrensen är och om vi har produkten när sidan publiceras.

### 2.1 Spatial förmåga (Rumsuppfattning i produkten)

| Sökord | Belägg | Avsikt | Rankar i dag | Vår chans |
|---|---|---|---|---|
| spatial förmåga | GSC 227 visn, 1 klick, pos 9,3 (28 d: 134 visn, pos 8,6). Auto med "test", "test gratis", "övningar", "betyder", "adhd", "autism" | I + Ö | Vi på sida 1 nederst; Neurobics, JobTestPrep, uppslagsverk | **Hög.** Vi rankar redan, CTR noll beror på att sidan inte erbjöd test |
| hög spatial förmåga, vad är spatial förmåga, spatialförmåga, spatiala förmåga | GSC 23 + 13 + 5 + 10 visn, pos 8 till 10 | I | Samma | Hög, samma sida |
| spatial förmåga test, spatial förmåga test gratis, test spatial förmåga | GSC 1 + 1 visn, pos 11. Auto ja | Ö | Neurobics (kubrotation gratis), JobTestPrep, engelska gratistester | **Hög** när ett smakprov finns på sidan |
| spatial förmåga övningar | GSC 10 visn, pos 11,5. Auto ja | Ö | Förskolesidor blandas in | Medel |
| rotationstest | GSC 10 visn, pos 1,6 | I + Ö | Vi | Hög, men liten volym. Auto domineras av tysk sjukvård (Rotationstest Knie) |
| rumsuppfattning | GSC 1 visn. Auto: "förskola", "matematik", "demens", "barn", "test", "övningar" | Blandad, mest skola och vård | Skolverket, förskolesidor | **Låg** som huvudord. Använd som andraord |
| pappersvikning test, pappersvikning iq test | Auto ja, GSC 0 | Ö | JobTestPrep, testttalent (I-prov) | Medel. Nisch, få har en sida |
| tärningar iq test, tärningstest, kubtest | "tärningar iq test" i auto. "kubtest" betyder hemtestet för graviditet (KUB) | Ö | JobTestPrep | Låg till medel. Ska inte ha egen sida, "kubtest" är fel avsikt |

**Namnet (öppen fråga 5 i briefen).** SEO-svaret är att publika rubriker, titlar och artiklar använder "spatial förmåga" och nämner "rumsuppfattning" som andraord. Det stöds av siffrorna: "spatial förmåga" har 227 visningar och "rumsuppfattning" en, och "rumsuppfattning" söks mest för förskola och demens. Produkten får gärna heta Rumsuppfattning inne i kontot. På testsidans kort och i provets rubrik: "Spatial förmåga (rumsuppfattning)". Ägaren avgör.

### 2.2 Talserier

| Sökord | Belägg | Avsikt | Rankar i dag | Vår chans |
|---|---|---|---|---|
| talserier, talserier test, talserier övning, talserier exempel, talserier iq test, talserier öva, talserier lösningar | Auto ja på alla, GSC 0 | Ö + I | Matteboken (skolmatte), JobTestPrep (Hucama), testttalent (I-prov), rustadsoldat | **Medel till hög.** Ingen svensk sida är byggd för "talserier test" med riktiga uppgifter och förklaring |
| talföljd, talföljder | Auto: "åk 1 till 5", "arbetsblad", "matte 5", "formel" | I (skola) | Matteboken, skolsidor | **Låg.** Skolavsikt. Använd ordet i brödtext, jaga det inte |
| sifferserier, nummerserier | GSC 0, inga autoförslag i urvalet | | | Bara i text |

### 2.3 Ordförråd (synonymer och motsatsord)

| Sökord | Belägg | Avsikt | Rankar i dag | Vår chans |
|---|---|---|---|---|
| ordförståelse test, ordförståelse test polis, ordförståelse test gratis | Auto ja, alla tre. GSC 0 | Ö | logiktester.se (ordförståelse), Neurobics, JobTestPrep språktest, högskoleprovssidor | **Medel.** "polis"-varianten passar I-prov-sidan exakt |
| ordförråd test, ordkunskap test, ord test | Auto ja, delvis högskoleprovet ("ord test hp") och SVT:s ordkunskapstest | Ö (blandad) | Studera.nu, SVT, HP-sajter | Låg till medel. HP-avsikten är inte vår |
| synonymer test, synonymtest | "synonymer test" i auto, "synonymtest" saknas | Ö | Synonymordböcker | Låg |
| motsatsord, synonymer | Mycket stora i auto, men korsord och ordbok ("motsatsord korsord 5 bokstäver") | N (ordbok) | synonymer.se, ordguru, synony | **Ingen.** Jaga inte. Se avsnitt 9 |

### 2.4 I-prov 2025, mönstring och polisen

| Sökord | Belägg | Avsikt | Rankar i dag | Vår chans |
|---|---|---|---|---|
| i-prov, i-provet, i prov, iprov | Auto: "i-prov mönstring", "i-prov test", "i-prov 2025", "i-prov polis", "i-prov resultat", "i prov 2025 flashback", "i provet exempel" | I + Ö | logiktester.se/i-provet ("Mönstring test: så fungerar I-provet, även för polisen"), testttalent.se (I-prov med gratisprov 17 frågor på 15 min), JobTestPrep, pliktverket.se, Flashback | **Medel till hög.** Fyra aktörer har sidor, men ingen har progression, nivåer och resultat per deltest. Vi har egna uppgifter i alla sex deltester |
| i-prov 2025, iprov 2025 | Auto ja | I + Ö | Samma | Medel till hög |
| i-prov övning, i-prov gratis | Auto som "i prov övning", "i prov gratis" | Ö | testttalent, logiktester.se | Medel |
| i-prov polis, iprov polisen, polis test iq, polis tester krav, uniq test polis | Auto ja. "uniq test polis flashback" visar att det gamla namnet fortfarande söks | I + Ö | polisen.se (Prövning och tester), Polistidningen, JobTestPrep, SquidFactor, testttalent | Medel. polisen.se ska vinna på krav och process, vi på övning |
| polisens antagningsprov, polisen antagningsprov | Auto bara på exakt fras, liten | I | polisen.se, Riksrevisionen | Låg. Bara som andraord |
| mönstring test, mönstring test resultat, mönstring test krav, mönstring vilka tester, psykologtest mönstring, mönstring iq test exempel | Auto ja på alla | I + Ö | logiktester.se, rustadsoldat.se, testttalent ("Mönstring 2026"), Pliktverket | Medel. Mönstring omfattar fysiska test och läkarundersökning, som vi inte ska skriva om på djupet |
| värnplikt test, värnplikt iq test, pliktverket test, pliktverket iq test, tester pliktverket polis | Auto ja | I + Ö | Pliktverket, SVT ("test värnplikt svt") | Medel |
| försvarsmakten test, försvarsmakten test online, lumpen test | Auto ja, men "försvarsmakten test befattning" och "militär test" visar att avsikten är blandad (lämplighet och befattning) | I (blandad) | Försvarsmakten, quizsidor | Låg till medel |
| mönstringsprov, försvarsmakten antagningsprov | Inga autoförslag | | | Bara i text |

**GSC visar noll på I-provets ord.** Det enda vi har nära är "bakgrundskoll polis" (18 visningar, position 22), och det är en annan avsikt.

### 2.5 Lokförare

| Sökord | Belägg | Avsikt | Rankar i dag | Vår chans |
|---|---|---|---|---|
| lokförare test gratis | GSC 42 visn, 0 klick, pos 8,9 på logiska-tester, utan att sidan handlar om lokförare | Ö | JobTestPrep (lokforare-test, MTR), Neurobics ("Bli lokförare: testerna du måste klara"), Flashback | **Medel.** Vi syns redan |
| lokförare test, lokförare tester svåra, lokförare psykolog test, tcc lokförare test, lokförare test 1/2 | Auto ja | I + Ö | Samma | Medel, men vi saknar koncentration (Aon e3+) och navigering (NAV), som är halva testet |
| lokförartest, lokförare antagningsprov | Inget autoförslag respektive bara exakt fras | | | Bara i text |

### 2.6 Deduktivt och SHL

| Sökord | Belägg | Avsikt | Rankar i dag | Vår chans |
|---|---|---|---|---|
| deduktiv slutledningsförmåga test gratis | GSC 79 visn, pos 7,2, 0 klick (logiska-tester) | Ö | logiktester.se/deduktiv-slutledningsformaga, Neurobics, JobTestPrep | **Hög.** Vi har pass och övningsprov sedan steg 1, och sidan finns men är inte indexerad |
| deduktiv slutledningsförmåga (test) | GSC 49 + 40 visn, pos 10 och 18 | I + Ö | Samma | Hög |
| deduktiv logik, deduktiv test, deduktivt test, deduktiv logisk slutledningsförmåga | GSC 31 + 27 + 24 + 25 visn, pos 8 till 12 | I + Ö | Samma. Auto på "deduktivt test": "gratis", "aon", "induktivt test", "deduktivt resonemang test" | Hög |
| shl test, shl tester, shl test svenska, shl test verify g+, shl test tips | Auto ja. GSC 0, vi har ingen SHL-sida | N + K | SHL:s svenska exempelsida, testttalent (gratis SHL-test), SquidFactor (Verify G+), JobTestPrep | **Medel.** Starka och betalda konkurrenter, men vi har deduktivt, induktivt, numeriskt och verbalt i SHL-format |
| shl deduktiv, shl deduktivt test | Inga autoförslag | | | Bara i text, inget eget mål |

### 2.7 Valen i "Mitt test är …" som saknar egen rad ovan

| Val | Målord och belägg | Målsida i dag | Läge |
|---|---|---|---|
| Matrigma | "matrigma test öva" 40, "matrigma test gratis" 37, "matrigma test" 15 (90 d), pos 23 till 55 på matrislogik-test-guide. Auto: "matrigma test exempel", "facit", "12 minuter" | matrigma-test (indexerad 9 nov, publicerad 8 nov) | Kannibalisering pågår, se 3.4 |
| Alva | Starkast i klustret: 2 347 visn och 46 klick på 90 d, pos 8 till 11 | alva-labs-logiktest | Ingen ny sida. CTR-arbete plus smakprov |
| Aon | "scales verbal test svenska" 6 visn. Auto "deduktiv test aon" | aon-cut-e-test (indexerad 9 nov) | Vänta på data |
| Personlighet | "map test" 273 visn, pos 3,1. "personlighetstest rekrytering" 152 visn, pos 44 | map-test-personlighetstest, personlighetstest-jobb-guide, /verktyg/personlighetstest | Utanför den här planen, bara länkar |
| Annat | "arbetspsykologiska tester exempel" 78 visn, pos 51 | arbetspsykologiska-tester (indexerad 9 nov) | Navet |

---

## 3. Sidor

### 3.1 Principen

- **Artiklarna är landningssidorna.**
  - De ger 79 procent av klicken (analysen 8 nov).
  - Verktygssidorna ligger på position 35 till 45 på huvudorden. "rekryteringstester" ligger på 34,6 och "rekryteringstest" på 40,5.
  - Artiklarna har det centrala schemasystemet.
  - Därför landar varje ny testtyp på en artikel med en riktig uppgift och ett inbäddat prov. Den får ingen ny `/verktyg/`-undersida.
- **En sida per sökavsikt.** Huvudordsplanen för december visar vad det kostar när fyra till sex sidor delar på samma ord. Därför finns en ansvarstabell i 3.4.
- **Inga slug-byten på sidor som rankar.** Rotation-test-guide behåller sin URL fast den nu ska bära "spatial förmåga".

### 3.2 Nya sidor

| # | URL | Huvudord | Andraord | Innehåll som avgör | Smakprov | Publiceras | Insats |
|---|---|---|---|---|---|---|---|
| N1 | `/artiklar/i-prov` | i-prov, i-provet, i-prov 2025 | i-prov polis, mönstring test, värnplikt test, pliktverket test, uniq test polis, ordförståelse test polis | <ul><li>Snabbsvar: vad provet är, sex deltester i provets ordning, ungefär 70 minuter, stanine 1 till 9.</li><li>Krav: polis minst 4 (belagt i Polistidningen); värnplikt och officer med källa eller "enligt uppgift".</li><li>En löst uppgift per deltest, ritad med testernas egna komponenter.</li><li>H2 för mönstringen och för polisprövningen.</li><li>Vad som ändrades från UNIQ.</li><li>Hur du övar på fyra veckor.</li><li>Varför ett övningsprov inte kan ge stanine.</li><li>Rättigheter och resultat.</li><li>Faktaruta: "Vi har ingen koppling till Plikt- och prövningsverket, Polisen eller Försvarsmakten."</li></ul> | Sex uppgifter, en per deltest, och direkt efter det I-prov-provet halvt med konto | När minst två av de tre motorerna och deras vyer är live, helst när I-prov-provet är live. Inte före | M |
| N2 | `/artiklar/talserier` | talserier, talserier test | talserier övning, talserier exempel, talserier iq test, talföljd (i text) | <ul><li>De åtta regelfamiljerna från generatorn med ett exempel var.</li><li>Två luckor som i I-provet.</li><li>Differensraden som teknik.</li><li>Tolv graderade uppgifter med lösning.</li><li>Var talserier förekommer: I-provet, Aon och tidigare UNIQ.</li></ul> | Fem talserier | När talserier är live | M |
| N3 | `/artiklar/ordforstaelse-test` | ordförståelse test | ordförståelse test polis, ordförståelse test gratis, synonymer test, motsatsord i test, ordförråd test | <ul><li>Formatet: ord i versaler och fem alternativ.</li><li>Distraktortyperna, där motsatsen ligger som fälla.</li><li>Hur man lär sig ord på fyra veckor utan att plugga listor.</li><li>Tjugo exempel med facit och exempelmening.</li><li>Kort om skillnaden mot högskoleprovets ORD, med länk till studera.nu.</li></ul> | Fem ord, blandat synonym och motsatsord | När ordförråd är live | M |

**Ska vänta:**
- **N4 `/artiklar/shl-test`.**
  - Målord: "shl test", "shl test svenska", "shl test verify g+" och "shl tester".
  - Vi har deduktivt, induktivt, numeriskt och verbalt i SHL-format, och deduktivt har nu pass och övningsprov.
  - Byggs i januari efter avläsningen av deduktivt (3.3, U3) och när G+-provpaketet finns enligt briefen avsnitt 5. Annars lovar sidan ett G+-prov som inte finns.
  - Insats M.
- **N5 `/artiklar/lokforare-test`.**
  - Det finns efterfrågan (42 visningar på position 8,9 utan någon sida).
  - Men vi saknar koncentration och navigering, som lokförarskolornas Aon-batteri bygger på.
  - Väntar på ägarens beslut om koncentrationsmodulen (gap-analysen punkt 4).
  - Under tiden lägger vi ett ärligt H2 om lokförartester i aon-cut-e-test (se 3.3, U6).
- **N6 separata sidor för "mönstring test" och "polis test".**
  - Ska bara byggas om Search Console efter åtta veckor visar att I-prov-sidan får båda kluster men har låg CTR på det ena.
  - Bygger vi dem nu delar vi på ett ord som ingen av sidorna äger ännu.

### 3.3 Befintliga sidor som uppdateras

| # | Sida | Varför | Ändring | När | Insats |
|---|---|---|---|---|---|
| U1 | `/artiklar/rotation-test-guide` | 227 visningar och 1 klick på "spatial förmåga". Sidan lovade ett test som inte fanns (rättat i punkt 28) | <ul><li>seoTitle: "Spatial förmåga test: öva gratis med svar direkt" (49 tecken), alternativt "Spatial förmåga: vad det är och test att öva gratis" (51).</li><li>description med "spatial förmåga test" tidigt och löftet om fem uppgifter med svar.</li><li>Smakprovet ovanför första H2 med fem uppgifter, blandat från form A, B och C.</li><li>Nya H2 "Pappersvikning med hål och klipp" och "Tärningar: samma tärning eller inte?" med varsin löst uppgift i `SpatialSvg`.</li><li>FAQ rättas tillbaka till att vi har testet, med nivåer.</li><li>Länk till N1 med ankartexten "spatial förmåga i I-provet".</li><li>H1 och title lämnas orörda enligt standarden.</li></ul> | Samma dag som Rumsuppfattning blir live | S |
| U2 | `/verktyg/rekryteringstester` | Hubben, och den sida "Mitt test" ska spegla publikt. Metadata och WebApplication-schema nämner bara matris, verbalt och numeriskt | <ul><li>Title och description får fler testtyper och I-prov: "Rekryteringstester: öva logik, I-prov och mer gratis" (53).</li><li>Ett nytt block "Vilket test ska du göra?" med de åtta valen som kort. Varje kort länkar till sin artikel och sitt prov (se 4.2).</li><li>Testkorten får de nya typerna.</li><li>FAQ-frågan "Kan jag öva på I-provet?".</li><li>featureList i schemat får de nya typerna.</li><li>SEO-diffen körs. Inget tas bort.</li></ul> | När den första nya typen är live, och sedan en rad per typ | S per gång |
| U3 | `/artiklar/deduktivt-induktivt-test` | Inte indexerad efter sju veckor. Logiska-tester tar alla deduktiva frågor | <ul><li>Ägaren begär indexering i Search Console.</li><li>Sidan nämner att deduktivt nu har pass och övningsprov i SHL Verify-format, och får ett provkort med Nivåkollen.</li><li>logiska-tester får en länk högt upp med ankartexten "deduktivt test", och arbetspsykologiska-tester och aon-cut-e-test får samma.</li><li>Kolla internlänkarna. I dag länkar sex artiklar dit, så antalet är inte problemet. Djupet från startsidan och sajtkartan ska kontrolleras.</li></ul> | Nu, indexeringen i dag | S |
| U4 | `/artiklar/logiktest-exempel-med-losningar` | Har talföljder (rad 94 till 157) och tar "logiktest exempel" | Avsnittet om talföljder får en mening och en länk till N2 med ankartexten "talserier test". Inget tas bort | Med N2 | S |
| U5 | `/artiklar/logiska-tester` | Tar "lokförare test gratis" och deduktivt utan att vara rätt sida. Har tappat och återhämtar sig (punkt 8, avläsning 7 dec) | <ul><li>Bara länkar: till U3 (deduktivt), N1 (i-prov) och rotation-test-guide (spatial förmåga), i avsnittet om testtyperna.</li><li>Inga nya avsnitt förrän positionen är avläst 7 dec.</li></ul> | Med respektive sida | S |
| U6 | `/artiklar/aon-cut-e-test` | Aon används av lokförarskolorna enligt gap-analysen | <ul><li>H2 "Aon-testet för lokförare". Där står ärligt vilka moduler skolorna använder och vilka vi har att öva på (ix, cls, numeriskt, verbalt, spatial) och inte har (e3+, NAV).</li><li>Fångar "lokförare test" tills N5 är beslutad.</li></ul> | December | S |
| U7 | `/artiklar/arbetspsykologiska-tester` | Navet för testklustret | En rad och en löst uppgift per ny typ (spatial, talserier, ordförråd), plus länkar till N1, N2 och N3 | Med varje ny sida | S |
| U8 | `/artiklar/matrigma-test` och `/artiklar/matrislogik-test-guide` | Kannibalisering på "matrigma test öva" och "gratis" (se 3.4) | <ul><li>matrislogik-test-guide får länken "Matrigma test" högt upp och en seoTitle utan "Matrigma".</li><li>matrigma-test är målet.</li><li>Ingen sammanslagning.</li></ul> | December, efter avläsningen 7 dec | S |
| U9 | `/funktioner` | Rankar inte på testord och har inga testord i dag | En rad om de nya testerna och I-prov-provet, med länk till hubben | Med U2 | S |
| U10 | numeriskt-test-guide och verbalt-test-guide | Får smakprov per typ enligt specen efter 23 nov | Det inbäddade provet ersätter provkortets länk till matrisprovet | Efter 23 nov | S |

### 3.4 Kannibaliseringsrisker och vem som äger vilket ord

| Ord | Ägare | Får inte konkurrera | Risk i dag |
|---|---|---|---|
| spatial förmåga, spatial förmåga test, rotationstest, pappersvikning test | rotation-test-guide | N1 (har bara ett kort avsnitt per deltest med länk), logiktest-exempel | Låg |
| i-prov, i-provet, mönstring test, i-prov polis, värnplikt test | N1 | rotation-test-guide, N2, N3, bakgrundskontroll-vid-anstallning | Låg nu, ökar om N6 byggs för tidigt |
| talserier, talserier test | N2 | logiktest-exempel (talföljder), numeriskt-test-guide, N1 | **Medel.** Logiktest-exempel har redan ett utförligt avsnitt. Avsnittet ska sluta på "talföljder" och länka med "talserier" |
| ordförståelse test (inklusive polis) | N3 | N1, verbalt-test-guide (läsförståelse) | Medel. N1 ska ha "ordförståelse test polis" som andraord i ett H2 som länkar till N3 |
| deduktivt test, deduktiv slutledningsförmåga | deduktivt-induktivt-test | logiska-tester | **Hög just nu.** logiska-tester tar 276 visningar för att målsidan saknas i indexet. När den indexeras kan Google pendla mellan dem i fyra till sex veckor. Det är väntat och ska inte mötas med fler ändringar |
| matrigma test, matrigma test öva, matrigma test gratis | matrigma-test | matrislogik-test-guide | **Hög.** Guiden tar orden på position 23 till 55 medan matrigma-test är en dag gammal i indexet |
| logiktest gratis, gratis logiktest | logiska-tester (artikel) och /verktyg/rekryteringstester (produkt) | alva-labs-logiktest | Medel. Pågår redan och ingår inte i den här planen |
| rekryteringstester | /verktyg/rekryteringstester | alla artiklar | Låg |

---

## 4. Provet utan konto som SEO-tillgång

### 4.1 Varför det behövs

- "logiktest gratis" och liknande vinns av sidor där man kan testa direkt. logiktester.se har allt gratis utan konto, och testttalent har ett I-prov-prov med 17 frågor.
- Vårt prov ligger på `/prova`, som är `noindex`. Länken från artiklarna fungerar (273 starter, 85 procent slutför, 29 konton på 26 dagar), men Google ser inte att artikeln själv har ett test.
- Intervjuprovet och personlighetsprovet är redan inbäddade i artiklar. Samma mönster ska gälla testerna.

### 4.2 Vad som ska finnas, per typ och plats

**Grundregeln är att uppgift 1 renderas på servern i artikelns HTML.** Den visas som en riktig figur, en riktig talserie eller ett riktigt ord, med alternativen synliga. Ett svar startar provet på sidan. Provet fortsätter i samma skal som `/prova?typ=` och slutar i samma kontosteg. Facit lämnar aldrig servern före kontot, precis som i dag.

| Typ | Antal | Var det bäddas in | Fortsättning | Status |
|---|---|---|---|---|
| Matrislogik | 5 | Redan via provkortet. Uppgift 1 inbäddad i alva-labs-logiktest, matrigma-test, logiska-tester, logiktest-exempel | Nivåkollen | Finns, bara länk i dag |
| Figurserier | 5 | aon-cut-e-test, deduktivt-induktivt-test (induktiva delen), logiktest-exempel | Nivåkollen figurserier | Spec 9 nov, efter 23 nov |
| Verbalt | 5 | verbalt-test-guide | Nivåkollen verbalt | Spec, efter 23 nov |
| Numeriskt | 5 | numeriskt-test-guide | Nivåkollen numeriskt | Spec, väntar på art-directors layoutbeslut |
| Deduktivt | 5 | deduktivt-induktivt-test, senare N4 | Nivåkollen deduktivt | **Saknas i specen, föreslås som tillägg** |
| Spatial förmåga | 5 (form A, B, C blandat) | rotation-test-guide (U1) | Rumsuppfattning grund | Ny, efter motorn och vyn |
| Talserier | 5 | N2 | Talserier grund | Ny |
| Ordförråd | 5 | N3 | Ordförråd grund | Ny |
| I-prov-smakprov | 6, en per deltest i provets ordning, utan tid | N1, och som kort på hubben | I-prov-provet halvt, som kräver konto | Ny. Kräver att alla tre typerna finns |
| Personlighet | 20 påståenden | Finns i två artiklar och på /verktyg/personlighetstest | | Oförändrat |

**Tre krav från SEO:**
1. `/prova` förblir `noindex, follow`. Om indexering släpps där konkurrerar den med artiklarna, och sidan saknar text.
2. Det inbäddade provet får inte skjuta ner artikelns snabbsvar och första H2 under vecket på mobil. Uppgift 1 ska ligga efter snabbsvaret, och LCP ska stanna under budgeten.
3. Artiklarnas utskrivna exempeluppgifter med lösning ska vara andra uppgifter än de som provet drar. Annars syns facit i klartext.

### 4.3 Kontot efter provet

- Kontosteget i ny design (grenen `feat/prov-konto-v2`) går live tidigast 23 nov. Alla nya smakprov byggs efter det, enligt specen.
- **Förslag, kräver beslut:** provet från N1 skickar med `mitt_test=iprov` till registreringen, så att kontot startar med valet Polisen eller Försvarsmakten satt. Matrigma, Alva och SHL fungerar på samma sätt från sina artiklar.
- Det är en produktändring, men den ger två saker:
  - Mätningen ser vilken artikel som ger vilket val.
  - Användaren slipper välja igen.

---

## 5. Interna länkar

### 5.1 Från artiklarna till testerna

- Varje testartikel har tre länkar till produkten:
  1. Det inbäddade provet, eller provkortet där inget prov finns.
  2. En textlänk i snabbsvaret med typens namn: "prova fem uppgifter i spatial förmåga".
  3. "Se alla tester och nivåer" till hubben, som redan finns (punkt 9).
- Ankartexten är aldrig "klicka här" eller "starta". Den är typens namn.
- Mätning: `article_cta_clicked` med `variant: 'prov-<typ>'`, som specen redan anger.

### 5.2 Från "Mitt test är …"

"Mitt test" är inloggat och syns inte för Google. Den publika motsvarigheten blir blocket "Vilket test ska du göra?" på hubben (U2). Varje val är ett kort med två länkar:

| Val | Artikel | Prov |
|---|---|---|
| Polisen eller Försvarsmakten | /artiklar/i-prov | I-prov-smakprovet |
| Matrigma | /artiklar/matrigma-test | Matrisprovet |
| Alva Labs | /artiklar/alva-labs-logiktest | Matrisprovet |
| SHL | /artiklar/deduktivt-induktivt-test (senare /artiklar/shl-test) | Deduktivt prov |
| Aon | /artiklar/aon-cut-e-test | Figurserieprovet |
| Lokförare | /artiklar/aon-cut-e-test#aon-testet-for-lokforare (senare N5) | Figurserieprovet |
| Annat eller vet inte | /artiklar/arbetspsykologiska-tester | Matrisprovet |
| Personlighet | /verktyg/personlighetstest | Personlighetsprovet |

I kontot: under "Ingår i ditt test" får varje deltest en liten länk "Så fungerar …" till sin artikel. Den länken spelar ingen roll för SEO, men den gör artikeln till hjälptext och ger användaren ett skäl att dela den.

### 5.3 Mellan testtyperna

- N1 länkar till rotation-test-guide, N2 och N3, en gång var i deltestets avsnitt.
- Alla tre länkar tillbaka till N1 med "I-provet".
- rotation-test-guide och N2 länkar till logiktest-exempel ("fler logiktest med lösning").
- deduktivt-induktivt-test och logiska-tester länkar till varandra med typens namn.
- arbetspsykologiska-tester länkar till alla. Det är navets roll.
- Högst en länk per målsida och avsnitt. Ingen sidfot full av testlänkar.

---

## 6. Schema

| Schema | Var | Rimligt? | Varför |
|---|---|---|---|
| BlogPosting, FAQPage, BreadcrumbList, Speakable | Alla artiklar, automatiskt från frontmatter | Ja, redan på plats | FAQ ger inte längre rich result för oss (Google begränsade det 2023 till myndigheter och vård), men språkmodeller läser det. 5 till 6 FAQ per ny artikel, var och en med en synlig `<FAQItem>` |
| HowTo via `howto:`-frontmatter | N1 ("Så övar du inför I-provet på fyra veckor") om avsnittet blir en äkta stegföljd | Ja, med försiktighet | Inget rich result sedan 2023, värdet är GEO. Bara för en verklig stegföljd, aldrig för en lista med tips |
| WebApplication och HowTo | /verktyg/rekryteringstester | Ja, uppdatera featureList (U2) | Finns redan |
| Quiz | Artiklarna med smakprov | **Nej** | <ul><li>Google visar Quiz bara för utbildningsinnehåll med flashkort, inte för urvalstest.</li><li>Schemat skulle kräva att vi skrev ut facit i HTML.</li><li>Det strider mot regeln att facit inte lämnar servern.</li></ul> |
| LearningResource (educationalUse "practice", teaches "spatial förmåga") | Artiklar med smakprov | Kanske, låg prioritet | Ofarligt och kan hjälpa språkmodeller att förstå att sidan har övning. Läggs i så fall centralt i `[slug]/page.tsx` via ett frontmatterfält, aldrig som `ld+json` i MDX. Det är en kodändring, så den beslutas separat |
| Organization- eller GovernmentOrganization-markering av Polisen, Pliktverket eller Försvarsmakten | | **Nej** | Kan läsas som samarbete. Myndigheterna nämns bara i löptext med källa |

---

## 7. Mätning

### 7.1 Vad mäts

| Mått | Källa | Uppdelning |
|---|---|---|
| Visningar, klick, CTR och position per kluster och per målsida | Search Console, frågor plus sida | Klustren i avsnitt 2 (reguljära uttryck sparas med avläsningsskriptet) |
| Vilken sida som visas för ägarordet | Search Console | Tabellen i 3.4. Målet är en sida per ord |
| Indexering av nya och uppdaterade sidor | URL-inspektion via servicekontot | N1 till N3, U3 |
| Klick från artikel till prov | PostHog `article_cta_clicked` | slug, variant `prov-<typ>`, target |
| Start och slutfört prov per typ | PostHog `sample_started`, `sample_completed` med `test_kind` | Typ, källsida |
| Kontosteg och konton | PostHog `signup_gate_shown`, `signup_completed` (entry smakprov). Supabase för antal | Typ, källsida, `acquisition_source` |
| Valet i "Mitt test" bland nya konton | Supabase `test_planer.mitt_test` | Per val, och för konton med en testartikel som källa |
| Köp | Stripe och Supabase | Nya konton från testklustret, I-prov för sig |

### 7.2 Avläsningsdatum

- Search Console ligger två dagar efter.
- **Julveckorna 21 december till 6 januari räknas inte in i trendfönster.** Jobbsök och tester sjunker, och mönstringen följer andra kalendrar. Varje jämförelse görs mellan fönster som slutar 18 december och fönster som börjar 7 januari.

| Datum | Vad läses av |
|---|---|
| 13 nov | U3 indexerad? Om inte: kontroll av sajtkartan och djupet från startsidan |
| 7 dec | Redan planerat: logiska-tester, CTR-omgången, punkt 28 (figurerna). Dessutom U1 om Rumsuppfattning gått live senast 23 nov, och indexering av N1 till N3 |
| 18 dec | **Baslinje före jul**, 28 dagar 20 nov till 17 dec, för alla kluster. Smakprov per typ: start till slutfört och kontosteg till konto, om de varit live i minst två veckor |
| 19 jan | Första fönstret efter jul (7 till 17 jan, jämförs dag för dag med 7 till 17 dec) |
| 9 feb | **Huvudavläsningen**, 28 dagar 10 jan till 6 feb mot baslinjen. Beslut om N4 SHL, N5 lokförare och N6 |
| 9 mar | Åtta veckor efter huvudavläsningen. Mål för mars |

### 7.3 Mål

Målen gäller 28-dagarsfönster. Utgångsläget är 11 okt till 7 nov.

| Kluster | I dag (28 d) | 9 feb | 9 mar |
|---|---|---|---|
| Spatial förmåga (rotation-test-guide) | 191 visn, 0 klick, pos 8,6 | 250 visn, 12 klick, pos under 8 | 300 visn, 20 klick |
| I-prov, mönstring, polis (N1) | 0 | 300 visn, 8 klick, pos under 20 på "i-prov" | 800 visn, 30 klick, pos under 12 |
| Talserier och ordförståelse (N2, N3) | 0 | 150 visn sammanlagt, 4 klick | 400 visn, 15 klick |
| Deduktivt (deduktivt-induktivt-test som visad sida) | 154 visn på fel sida, 1 klick | 150 visn på rätt sida, 6 klick | 200 visn, 10 klick |
| Lokförare (U6) | 42 visn, fel sida | rätt sida visas | |
| **Konton från de nya typernas prov och artiklar** | 0 | 8 på 28 dagar | 20 på 28 dagar |
| Valet Polisen eller Försvarsmakten bland nya konton | 0 | minst 10 procent | minst 15 procent |
| Provets tratt per ny typ | | Start till slutfört minst 80 procent; kontosteg till konto minst 30 procent (specens mål) | |

**Hur målen räknats:**
- Kontomålet bygger på dagens tratt: 273 starter gav 29 konton på 26 dagar.
- Det förutsätter att de nya sidorna når en tiondel av testklustrets klick i februari och en femtedel i mars.
- Det är ett golv. Gratisnivåns utformning och priset påverkar mer än SEO.

---

## 8. Ordning, insats och effekt

| Ordning | Åtgärd | Insats | Förväntad effekt | Beroende |
|---|---|---|---|---|
| 1 | **U3: indexeringsbegäran för deduktivt-induktivt-test** (ägaren), länkar med "deduktivt test" från logiska-tester, aon-cut-e-test och arbetspsykologiska-tester | S | Upp till 150 visningar i månaden flyttas till en sida som kan svara på avsikten. Deduktivt har pass och övningsprov sedan steg 1 | Ägaren, i dag |
| 2 | **U1: rotation-test-guide med smakprov, ny seoTitle och två nya H2** | S | Största enskilda vinsten: 130 till 230 visningar på sida 1 som i dag ger noll klick. 10 till 20 klick i månaden och de första kontona från spatial | Rumsuppfattning live |
| 3 | **U2: hubben med blocket "Vilket test ska du göra?"** och de nya typerna i metadata och schema | S | Testsidan ger 3,8 konton per 100 sessioner. Blocket gör hubben till fördelare för de åtta valen | Första nya typen live |
| 4 | **N1: /artiklar/i-prov med I-prov-smakprovet** | M | Ny efterfrågan som vi inte syns på alls. Fyra konkurrenter, men ingen med progression och resultat per deltest. Den sida som bäst motiverar ett köp (provdatum, krav 4) | I-prov-provet live, helst. Publiceras senast 14 dec så att indexeringen hinns före jul |
| 5 | **Smakprov per typ** enligt specen plus spatial, talserier, ordförråd, deduktivt och I-prov. Uppgift 1 inbäddad i artikeln | M | Gör artiklarna till "testa direkt"-sidor. Specens mål 30 procent kontosteg till konto | Efter 23 nov (prov-konto-v2) |
| 6 | N2 talserier och N3 ordförståelse test | M var | Medelstor efterfrågan, låg konkurrens för exakt avsikt. Stöder N1 | Typerna live |
| 7 | U4 till U10: länkar, lokförar-H2:n, Matrigma-ägarskapet, funktioner | S var | Kannibaliseringen minskar och lokförarsöket tas om hand | Efter 7 dec där det står så |

**Ska vänta:**
- N4 `/artiklar/shl-test`: januari, efter avläsningen av deduktivt och när G+-provet finns.
- N5 `/artiklar/lokforare-test`: väntar på beslutet om koncentrationsmodulen.
- N6 egna sidor för mönstring och polis: efter avläsningen 9 feb, och bara om data visar två skilda kluster.
- LearningResource-schemat: efter 9 feb, om alls.
- Allt arbete med "motsatsord" och "talföljder" som huvudord: aldrig.

**Innehållstakten.** N1 till N3 räknas in i ägarens mål om sex till tio sidor i månaden. Novembers kvar enligt plan-content-2026-q4 (videointervju-tips med flera) ligger kvar, men testsidorna går före när typerna går live.

**Arbetsflödet** för varje ny sida och omskrivning följer artikelstandarden:
- Search Console-analys
- källor verifierade (Pliktverket, Polistidningen, Riksrevisionen och polisen.se för I-provet)
- copywriting utan AI-mönster och utan talstreck
- GEO-snabbsvar
- slop-kontroll
- egen SVG-bild
- SEO-diffen före push
- tabeller som JSX

---

## 9. Risker och vad vi inte gör

**Risker:**
1. **Att verka ha koppling till myndigheterna.**
   - Polisen, Plikt- och prövningsverket och Försvarsmakten nämns som de som använder provet, aldrig som partner eller källa till våra uppgifter.
   - Inga logotyper.
   - Inget "officiellt", "godkänt" eller "samma uppgifter som".
   - Vi skriver "övningsprov i samma format och ordning som I-prov 2025".
   - N1 och resultatsidan har meningen om att vi saknar koppling.
2. **Löften före produkten.** Rotation-test-guide har redan lovat ett test som inte fanns. Ingen sida publiceras eller skrivs om med ett löfte om en testtyp innan flaggan i `steg2Status.ts` är satt i produktion.
3. **Stanine och krav.**
   - Vi ger aldrig ett värde på den niogradiga skalan och skriver aldrig "du klarar polisens krav".
   - Polisens krav (minst 4) står med källa.
   - Krav för värnplikt och officer står med "enligt uppgift" tills de är belagda hos myndigheten.
4. **Pliktverkets övningsuppgifter.** De får inte återges, ritas av eller parafraseras. Alla exempel är våra egna.
5. **Facit i klartext.** Varken schema, inbäddad HTML eller artikelexempel får avslöja svaren på provets uppgifter.
6. **Kannibalisering efter indexeringen av deduktivt.** Google kan pendla mellan sidorna i några veckor. Vi rör inte titlarna under den tiden.
7. **"Gratis" i titlar.** Grundnivån och provet är gratis, I-prov-provet halvt eller helt kräver konto och ovan grundnivån betalning. Titlar får säga "öva gratis" bara när sidan har ett gratis prov.
8. **Julen.** Sidor som publiceras efter 14 dec indexeras in i en låg period, och avläsningen blir missvisande. Publicera före, eller vänta till 7 jan.

**Vi gör inte:**
- Nya `/verktyg/`-undersidor per testtyp.
- Index på `/prova`.
- Quiz-schema.
- Manuella `ld+json`-block i MDX.
- Slug-byten på rotation-test-guide.
- Innehåll för "motsatsord", "synonymer" eller "talföljder" med skol- eller ordboksavsikt.
- Mekanisk förståelse, situationsbedömning eller koncentration som SEO-sidor innan produkten finns.
- Sidor som bara byter ett ord ("polisens test", "mönstringsprov", "försvarsmaktens test" som egna URL:er).
- Länkköp eller utbyten med övningssajter.

---

## 10. Kräver ägaren

1. **Indexeringsbegäran i Search Console** för `/artiklar/deduktivt-induktivt-test` nu, och för N1 till N3 och U1 samma dag som de publiceras. Servicekontot kan bara läsa.
2. **Namnet:** "spatial förmåga" publikt och "Rumsuppfattning" i kontot, som SEO-strategen rekommenderar, eller ett av namnen överallt (briefens öppna fråga 5).
3. **Ordningen:** att N1 (I-prov) går före resten av novembers innehållsplan när typerna är live, och att den publiceras senast 14 dec eller väntar till 7 jan.
4. **Produktändringar som SEO-planen bygger på:**
   - uppgift 1 inbäddad i artiklarna
   - smakprov för deduktivt, spatial, talserier, ordförråd och I-prov utöver specens tre
   - `mitt_test` från artikel till registrering

   De kräver design i artefakt enligt arbetsordningen. Saas-lead och säljansvarig bör väga dem mot gratisnivån.
5. **Lokförare:** besked om koncentrationsmodulen avgör om N5 byggs. Fram till dess gäller H2:n i aon-cut-e-test.
6. **Godkännande av målen i 7.3** och av avläsningsdatumen, särskilt att julveckorna lämnas utanför.

---

## Källor

- Search Console:
  - jobbcoach.ai, frågor plus sida, 9 aug till 7 nov 2026 och 11 okt till 7 nov 2026.
  - URL-inspektion 9 nov 2026.
- Googles autoförslag (hl=sv, gl=se), 9 nov 2026.
- logiktester.se/i-provet: https://logiktester.se/i-provet/
- logiktester.se, deduktiv slutledningsförmåga: https://logiktester.se/deduktiv-slutledningsformaga/
- testttalent.se:
  - I-prov: https://testttalent.se/iprov-och-neo-pi-r-test/
  - Mönstring 2026: https://testttalent.se/i-prov-monstring/
  - Polisens begåvningstest: https://testttalent.se/ova-dig-pa-polisens-begavningstest/
- JobTestPrep:
  - Polisen: https://www.jobtestprep.se/polisutbildning-uniq-neo-pi-r
  - Lokförare: https://www.jobtestprep.se/lokforare-test
  - Deduktiv slutledningsförmåga: https://www.jobtestprep.se/deduktiv-slutledningsformaga-test
- SquidFactor:
  - Polisen: https://learn.squidfactor.se/polisutbildning-uniq-neo-pi-r
  - SHL: https://shl.squidfactor.se/
- Neurobics:
  - Lokförare: https://www.neurobics.se/bli-lokforare-testerna-du-maste-klara/
  - Deduktiv slutledningsförmåga: https://www.neurobics.se/deduktiv-slutledningsformaga/
- rustadsoldat.se, mönstring test: https://rustadsoldat.se/artiklar/monstring-test
- Polisen, Prövning och tester: https://polisen.se/jobb-och-utbildning/bli-polis/provning-och-tester/
- Polistidningen, nytt begåvningstest från 5 maj 2025: https://polistidningen.se/2025/04/nytt-intelligenstest-i-polisprovningen/
- Riksrevisionen 2025:13: https://www.riksrevisionen.se/granskningar/granskningsrapporter/2025/antagningen-till-polisutbildningen.html
- Matteboken, talserier: https://www.matteboken.se/lektioner/matte-1/ovningsexempel/talserier
- Övriga källor om leverantörer och I-provets format: se gap-analysen avsnitt 8 och briefen avsnitt 1.

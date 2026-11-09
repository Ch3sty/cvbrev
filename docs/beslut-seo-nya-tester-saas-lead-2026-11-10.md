# Saas-leads beslut om SEO-planen för de nya testerna (10 november 2026)

Granskning av `docs/plan-seo-nya-tester-2026-11-10.md`. Ingen kod är ändrad. Säljansvarig granskar samtidigt ur konverteringsperspektiv; där våra områden överlappar står det utskrivet. Ägaren bekräftar besluten i avsnitt 1 och 2 och gör själv det som står i avsnitt 3.

Underlag: planen, `docs/rapporter/analys-2026-11-08.md`, `docs/rapporter/gap-testtyper-2026-11-09.md`, `docs/plan-efter-analys-2026-11-08.md` A till F, `docs/plan-content-2026-q4.md`, `docs/plan-huvudord-2026-12.md`, `docs/design/brief-tester-steg2-2026-11-09.md`, `docs/design/spec-prov-fler-typer-2026-11-09.md`, minnesfilerna om SEO-takten, testfokus, Rummen, publikt på Duolingo-nivå och beslutsordningen Fable beslutar, Opus bygger. Kontrollerat i kod: `src/lib/tester/steg2Status.ts` (alla tre flaggorna `false`, `IPROV_PROV_KLART` `false`), `src/lib/traning/gratisniva.ts` (`provlageGratis: false`), `src/lib/tests/sessionGate.ts` (övningsprov kräver `test_exam_mode`), `src/app/sitemap.ts` (alla artiklar ingår, 90-dagarsregeln styr bara prioritet), `prova/page.tsx` (`robots: index false, follow true`).

## 0. Sammanfattning

Planen är bra och stämmer med fattade beslut: testerna först (2026-10-10), 6 till 10 sidor i månaden med testklustret först (2026-09-23), artiklarna som landningssidor, inga nya `/verktyg/`-undersidor, `/prova` noindex. Jag säger ja till det mesta, med tre ändringar:

1. **Sanningskravet i N1.** Planen säger att I-prov-smakprovet leder till "I-prov-provet halvt med konto". I koden kräver alla övningsprov `test_exam_mode`, alltså Premium 149 kr i månaden, och `provlageGratis` är `false`. Artikeln och smakprovets kontosteg ska därför säga: konto ger grundnivån i alla sex deltester gratis, I-prov-provet ingår i Premium. Det är dessutom det starkaste köpskälet vi har (provdatum och krav 4), så det ska inte skänkas bort. Säljansvarig väger om det halva provet ska vara den första betalväggen efter konto.
2. **Smakproven inbäddade i artiklarna byggs i två vågor efter räckvidd**, inte alla nio typer på en gång. Våg 1 är matris (alva-labs har 2 347 visningar), spatial (U1) och deduktivt (U3). Våg 2 är specens tre plus talserier, ordförråd och I-prov. N2 och N3 publiceras med provkort till `/prova?typ=` när typen är live och får inbäddad uppgift i våg 2, så innehållstakten inte hänger på inbäddningen.
3. **Ett namn, inte två.** "Spatial förmåga" överallt, med "rumsuppfattning" som förklaring i parentes vid första omnämnandet och i kortets underrad. Motivering under 2.1. Namnet är ägarens att slå fast.

## 1. Beslut per åtgärd

Insats: S under en dag, M två till fyra dagar, L mer. Effekten är planens egen uppskattning där jag inte skriver annat; jag har inte bättre siffror.

### 1.1 Nya sidor

| # | Åtgärd | Beslut | Motivering | Insats | Effekt |
|---|---|---|---|---|---|
| N1 | `/artiklar/i-prov` med sex smakprovsuppgifter | **Ja, ändra kontosteget** | Enda klustret med ny efterfrågan vi inte syns på alls, och det som bäst motiverar ett köp; men texten ska säga att I-prov-provet ingår i Premium, inte att det följer med kontot (se 0.1). Publiceras när `IPROV_PROV_KLART` är sann, senast 14 dec, annars 7 jan. | M | 300 visn och 8 klick till 9 feb, 800 och 30 till 9 mar; första kontona med valet Polisen |
| N2 | `/artiklar/talserier` | **Ja** | Autoförslag på sju varianter, ingen svensk sida byggd för avsikten, motorn är klar. Publiceras med provkort till `/prova?typ=talserie` när `VY_KLAR.talserie` är sann; inbäddad uppgift i våg 2. | M | 150 visn för N2 och N3 ihop till 9 feb |
| N3 | `/artiklar/ordforstaelse-test` | **Ja** | Samma skäl, "polis"-varianten binder ihop med N1. Håll "motsatsord" och "synonymer" ur titeln, de är ordboksavsikt. | M | Som N2 |
| N4 | `/artiklar/shl-test` | **Vänta** | Lovar ett G+-prov som inte finns. Januari, efter deduktivt-avläsningen och när provpaketmotorn finns (briefen 5.3). | M | |
| N5 | `/artiklar/lokforare-test` | **Vänta** | Vi saknar halva testet (koncentration, navigering). U6 fångar söket till dess. Omprövas 9 feb mot två mätpunkter (se 2.4). | M | |
| N6 | Egna sidor för mönstring och polis | **Nej nu** | Delar ett ord ingen av sidorna äger. Omprövas 9 feb bara om N1 visar två kluster med olika CTR. | | |

### 1.2 Befintliga sidor

| # | Åtgärd | Beslut | Motivering | Insats | Effekt |
|---|---|---|---|---|---|
| U1 | rotation-test-guide: ny seoTitle, smakprov, två H2, FAQ tillbaka | **Ja** | 227 visningar på sida 1 utan klick för att sidan saknade produkten; detta är planens billigaste vinst. Går live samma dag som `VY_KLAR.spatial`, inte en dag före (rättelsen av det falska löftet får inte göras om). Titeln får säga "öva gratis" eftersom grundnivån är fri. | S | 10 till 20 klick i månaden, första spatial-kontona |
| U2 | Hubben: block "Vilket test ska du göra?", metadata, schema, FAQ | **Ja** | Hubben ger 3,8 konton per 100 sessioner och ska spegla "Mitt test" publikt. Blocket är ren navigering och ändrar inget i registreringen. SEO-diff före push. | S per typ | Fördelar hubbens trafik på åtta val |
| U3 | deduktivt-induktivt-test: indexering, länkar med "deduktivt test", provkort med Nivåkollen | **Ja, i dag** | 276 visningar landar på fel sida för att målsidan inte är indexerad. Sajtkartan är inte felet (alla artiklar ingår), så ägarens begäran och tre interna länkar är det som finns att göra. Rör inte titlarna under pendlingen efteråt. | S | Upp till 150 visn i månaden flyttar till rätt sida |
| U4 | logiktest-exempel: mening och länk "talserier test" till N2 | **Ja** | Stoppar kannibaliseringen innan den börjar. | S | |
| U5 | logiska-tester: bara länkar, inga nya avsnitt | **Ja** | Sidan är under avläsning till 7 dec (punkt 8). Länkar är allt vi rör. | S | |
| U6 | aon-cut-e-test: H2 "Aon-testet för lokförare" | **Ja, december** | Ärlig text om vad vi har och saknar, tar "lokförare test gratis" (42 visn) tills N5 är avgjord. | S | 42 visn visas på rätt sida |
| U7 | arbetspsykologiska-tester: rad och löst uppgift per ny typ, länkar | **Ja** | Navets roll. Med varje ny sida. | S | |
| U8 | Matrigma-ägarskapet | **Ja, efter 7 dec** | Guiden tar orden på position 23 till 55 medan matrigma-test är en dag gammal; vänta på första avläsningen innan vi rör guidens titel. | S | |
| U9 | /funktioner: en rad om testerna | **Ja, med U2** | Litet, ofarligt. | S | |
| U10 | numeriskt- och verbalt-guide: inbäddat prov | **Ja, våg 2** | Enligt specen, efter 23 nov och art-directors beslut om numeriskt på mobil (punkt 20). | S | |

### 1.3 Provet utan konto som SEO-tillgång (avsnitt 4)

| Åtgärd | Beslut | Motivering | Insats | Effekt |
|---|---|---|---|---|
| Uppgift 1 renderad på servern i artikelns HTML, svaret startar provet på sidan | **Ja, två vågor** | Samma mönster som intervjuprovet och personlighetsprovet, som redan ger konton. Våg 1 (efter 23 nov): matris i alva-labs, matrigma-test, logiska-tester, logiktest-exempel; spatial i U1; deduktivt i U3. Våg 2 (december): figurserier, verbalt, numeriskt (specens), talserier i N2, ordförråd i N3, I-prov i N1. Design i artefakt av art-director med testansvarig, SEO-agenten ställer kraven om snabbsvar före uppgiften och LCP inom budget. | M per våg | Specens mål 30 procent kontosteg till konto; artiklarna blir "testa direkt"-sidor i Googles ögon |
| `/prova` förblir noindex, follow | **Ja** | Flöde utan text, skulle konkurrera med artiklarna. | | |
| Facit lämnar aldrig servern, artikelns utskrivna exempel är andra uppgifter än provets | **Ja, krav** | Sanningskravet och spärrregeln. Testansvarig kontrollerar att bankens urval för smakprov exkluderar artikelns exempel-id. | | |
| Smakprov för deduktivt (saknas i specen) | **Ja** | Pass och övningsprov finns sedan steg 1, banken har 80 uppgifter, och 276 visningar väntar på rätt sida. Läggs till i specen som fjärde typ. | S | |
| IP-gränsen tre prov per dygn över alla typer | **Behåll** | Med nio typer blir den kännbar för den som vill prova flera, men det är precis då kontot ska vara svaret. Säljansvarig avgör om spärrens text ska säga det. | | |

### 1.4 Schema och länkar (avsnitt 5 och 6)

Allt ja utan ändring: BlogPosting, FAQPage, Breadcrumb och Speakable som i dag; HowTo i N1 bara om fyraveckorsplanen är en äkta stegföljd; inga Quiz-scheman; ingen Organization-markering av myndigheter; LearningResource efter 9 feb om alls. Länkreglerna i 5.1 till 5.3 gäller, med tillägget att länken "Så fungerar …" i kontot under "Ingår i ditt test" mäts som `article_viewed` med källa `konto`, så vi ser om artiklarna används som hjälptext.

### 1.5 Mätning och mål (avsnitt 7)

**Ja till måltabellen 7.3 och avläsningsdatumen**, med tre tillägg:

- Julveckorna 21 dec till 6 jan lämnas utanför alla trendfönster. Riktigt.
- Köp per konto med valet Polisen eller Försvarsmakten följs från första dagen, utan mål före 9 feb. Det är den mätpunkt som avgör om I-prov-sidan är värd mer bygge (G+, N6).
- Omprövningsregel 9 feb: har N1 under 100 visningar på 28 dagar byggs varken N6 eller G+-sidan, och vi ser över titeln. Har spatial fortfarande under 5 klick i månaden med smakprovet på plats är det inte SEO som brister utan sidan, och art-director får titta på den.

Kontomålet (8 på 28 dagar till 9 feb, 20 till 9 mar) är lågt satt och räknat på dagens tratt. Jag godtar det som golv.

## 2. Planens ägarfrågor

### 2.1 Namnet: spatial förmåga eller rumsuppfattning

**Rekommendation: "Spatial förmåga" överallt, med "rumsuppfattning" i parentes första gången och som underrad på testkortet.** Ägaren avgör, eftersom det är ett produktnamn.

Skäl: besökaren kommer med ordet "spatial förmåga" (227 visningar mot 1 för rumsuppfattning) och ska känna igen det på vägen artikel, smakprov, kontosteg, konto. Varje namnbyte i den övergången är friktion i den dyraste delen av tratten, och vi har redan en gång haft ett artikellöfte som inte matchade produkten på just den här sidan. Regeln från publikt v2 gäller: använd ord användaren redan känner, inga begrepp som kräver avkodning. "Rumsuppfattning" är en bra svensk fackterm och ska stå med, men som förklaring. I I-prov-provet heter deltesterna som i provet (pappersvikning, tärningar), så där är frågan inte aktuell.

Om ägaren hellre vill ha Rumsuppfattning i produkten går SEO-strategens kompromiss ("Spatial förmåga (rumsuppfattning)" på kort och i provets rubrik) att leva med. Det som inte går är två olika namn utan koppling.

### 2.2 Går I-prov-artikeln före resten av innehållsplanen?

**Ja, med villkor.** N1 till N3 går före videointervju-tips, uppsagningsbrev-mall och yrkesparen, för testerna är kärnan sedan 2026-10-10 och testsidor ger tio gånger fler konton per session än artiklar. Novembers takt: fyra sidor publicerade 9 nov plus N2 och N3 ger sex, N1 blir sju om provet hinner. Inom ramen 6 till 10.

Villkoren: N1 publiceras bara när `IPROV_PROV_KLART` är sann, senast 14 dec. Hinner provet inte dit väntar N1 till 7 jan, och december fylls med soka-sommarjobb och tolka-testresultat ur den gamla planen. N2 och N3 behöver bara sin egen flagga. Ingen av de tre skrivs om som löfte innan flaggan är satt i produktion (planens risk 2).

### 2.3 De tre produktändringarna

| Ändring | Beslut | Vem beslutar vad |
|---|---|---|
| Inbäddad uppgift 1 i artiklarna | **Ja, två vågor (1.3)** | Principen är min och säljansvarigs att bekräfta, designen art-directors med testansvarig (Fable beslutar, Opus bygger), ägaren behöver inte godkänna skissen enligt beslutsordningen 2026-10-10. Ägaren säger ja till principen här. |
| Fler typer i provet utan konto | **Ja, i den ordning 1.3 anger** | Redan beslutat för tre typer (F.34). Tillägget deduktivt, spatial, talserier, ordförråd och I-prov är min prioritering. Migreringen `test_kind` på `anon_test_sessions` och `prov_utfall` är additiv men körs bara med ägarens ja i manuellt läge. |
| `mitt_test` följer med från artikel till registrering | **Ja, som dold parameter, inget nytt steg** | Fråga 1 i registreringen togs bort 9 nov efter 61 till 65 procents tapp. Parametern får inte återinföra ett val i registreringen; den sätter `test_planer.mitt_test` tyst efter kontot och ingången visar valet som förvalt med "Ändra". Mätningen får då artikel till val, vilket vi saknar i dag. S. |

Gemensamt för alla tre: gratisnivån ändras inte. Smakproven är anonyma och fem uppgifter som i dag, grundnivån är fri som i dag, övningsproven ligger bakom Premium som i dag. Det enda planen behövde rättas på är formuleringen om det halva I-prov-provet (0.1).

### 2.4 Lokförarmodulen

**Nej till koncentrationsmodulen nu.** Gap-analysen själv säger: bygg efter att spatial mätts i sex veckor och bara om vi vill ha ett lokförar- eller pilotpaket. Våra sökdata visar 42 visningar, och valet Lokförare i "Mitt test" är live med den ärliga anmärkningen sedan 9 nov. Det ger två mätpunkter till 9 feb: antal konton med valet Lokförare, och klick på "lokförare test" till U6. Når de tillsammans inte 20 konton på 28 dagar byggs ingen modul. Når de det tar vi ställning till ett lokförarpaket som produktbeslut, och då är det ägarens, eftersom det kan påverka prisstegen.

### 2.5 Mål och avläsningsdatum

**Ja** till 13 nov, 7 dec, 18 dec, 19 jan, 9 feb och 9 mar, och till att julveckorna lämnas utanför. Tilläggen i 1.5.

## 3. Ägarens att göra, skilt från det jag beslutar

Ägaren kan bara göra det här själv:

1. **Indexeringsbegäran i Search Console** för `/artiklar/deduktivt-induktivt-test` i dag, och för N1, N2, N3 och U1 samma dag som de publiceras. Servicekontot läser bara. Bing via IndexNow kör agenten (`scripts/indexnow.ts`) efter deploy.
2. **Namnet** (2.1).
3. **Migreringen** `test_kind` på `anon_test_sessions` och `prov_utfall` (additiv, specen avsnitt 5), i manuellt läge.
4. **Push till main** för varje omgång, enligt arbetsreglerna.
5. **Bekräfta** besluten i avsnitt 1 och 2, särskilt 0.1 (I-prov-provet ingår i Premium) tillsammans med säljansvarigs granskning.

Det här beslutar jag inom mandatet, och ägaren behöver bara säga till om något ska ändras: prioriteringen och vågindelningen i 1.3, att N1 till N3 går före resten av innehållsplanen, nej till koncentrationsmodulen nu, måltabellen med tillägg, att `/prova` förblir noindex, och att designen för inbäddade uppgifter går till art-director och testansvarig utan ägarens godkännande av skissen (beslutsordningen 2026-10-10).

Till säljansvarig lämnar jag: texten i kontosteget efter I-prov-smakprovet (grundnivån gratis, provet i Premium), om det halva I-prov-provet ska vara första betalväggen efter konto, spärrtexten när IP-gränsen slår till, och ordvalen i U1:s och N1:s titlar där "gratis" står.

## 4. Genomförandeplan, fyra veckor

Allt bygge på Opus efter spec. Design till art-director med testansvarig. Text till copywritern. SEO-agenten granskar varje publik ändring och SEO-diffen körs före push.

**Vecka 1, 10 till 16 nov**
- Ägaren begär indexering av deduktivt-induktivt-test (i dag).
- U3: tre interna länkar med "deduktivt test" och provkortet med Nivåkollen. S, live i veckan.
- Vyerna för talserier, spatial och ordförråd (punkt 36) byggs och klicktestas; flaggorna sätts per typ när klicktestet är grönt.
- Art-director tar fram skissen för inbäddad uppgift 1 i artikel (matris, spatial, deduktivt, I-prov-raden) i artefakt, med SEO-agentens krav. Testansvarig stämmer av.
- N2 och N3 skrivs som utkast med källverifiering, publiceras inte.
- 13 nov: är U3 indexerad?

**Vecka 2, 17 till 23 nov**
- När `VY_KLAR.spatial` sätts: U1 samma dag, U2 första raden, U7 första uppgiften. Ägaren begär indexering.
- När `VY_KLAR.talserie` och `.ordforrad` sätts: N2 och N3 publiceras med provkort till `/prova?typ=`, U4 samtidigt. Ägaren begär indexering.
- 23 nov: provet och kontosteget i ny design (feat/prov-konto-v2) går live efter ägarens Google-test och rebase. Ingen inbäddning före det.
- Avläsningar som redan är planerade: Nivåkollen som första test efter provet, köpknappen i spärren, nivamatning_klar per typ.

**Vecka 3, 24 till 30 nov**
- Våg 1 av inbäddade uppgifter enligt skissen: matris i fyra artiklar, spatial i U1, deduktivt i U3. Migreringen `test_kind` körs först (ägaren, manuellt läge).
- `mitt_test` som dold parameter från artikel till konto. S.
- I-prov-provets vy (provpaketet, halvt och helt) byggs; `IPROV_PROV_KLART` sätts när klicktestet är grönt.
- Säljansvarigs texter i kontosteget efter smakproven läggs in.

**Vecka 4, 1 till 7 dec**
- N1 publiceras när flaggan är sann, med sex smakprovsuppgifter, U2 får I-prov-raden och FAQ, U7 och U9 uppdateras. Ägaren begär indexering. Hinner inte provet: N1 skjuts till 7 jan, och december får soka-sommarjobb i stället.
- Våg 2 av inbäddningen påbörjas: figurserier, verbalt (efter art-directors beslut om numeriskt), talserier i N2, ordförråd i N3.
- 7 dec: avläsning av logiska-tester, CTR-omgången, figurerna, U1 om den varit live två veckor, indexering av N1 till N3. Därefter U6 och U8.

Efter de fyra veckorna: 18 dec baslinje före jul, N4 och eventuell N5 avgörs 9 feb.

## Slutliga beslut 2026-11-10

Ägaren delegerade besluten till saas-lead samma dag ("låt agenten bestämma"). Vägt in: säljgranskningen `docs/beslut-seo-nya-tester-salj-2026-11-10.md` avsnitt 6 och 7, och vyagentens rapport att hela steg 2 är live på main (285621b6: `VY_KLAR` sann för talserie, spatial och ordforrad, `IPROV_PROV_KLART` sann, ordförrådet bakom `ordforradRedo`, QA i `docs/qa/tester-steg2-vyer-2026-11-09/`). Det ändrar tidsplanen i avsnitt 4: N1 till N3 och U1 väntar inte på flaggor längre och går först.

Två datafynd från i dag (Supabase, ägaren och testkontona undantagna): `test_planer` har 8 rader totalt, 2 med provdatum och 0 med `mitt_test`, mot 65 nya konton sedan Rummen 11 okt (5 köp). Säljgranskningens fråga om konton med provdatum köper oftare går alltså inte att besvara i data (n = 2), och det viktigare fyndet är att ingången, som skapar planen, nås av ungefär ett konto av åtta. Det stöder besluten 4 och 7 nedan och följs upp separat (se "Följs upp").

| # | Fråga | Beslut | Motivering |
|---|---|---|---|
| 1 | Ska övningsprovet för I-prov bara ingå i Premium? | **Ja.** Halvt och helt I-prov-prov bakom `test_exam_mode` som i koden. Gratis: smakprovet (6 uppgifter), grundnivån i varje typ, Nivåkollen där den finns, passet dag ett och dag 2-mejlet. | Det är den enda produkten ingen gratiskonkurrent har i den formen, och den som har ett datum vill ha just den. Ger vi bort halva provet finns inget att sälja före dag två. Premiumraden efter I-prov-smakprovet säger: "Hela övningsprovet i I-provets ordning, med tid per deltest, ingår i Premium, 149 kr i månaden" (pris ur `plans`, copywritern formulerar). Ett halvt prov gratis är en hypotes som kan prövas med flagga efter 9 mar, inte vid lanseringen. |
| 2 | Produktnamnet "Spatial förmåga (rumsuppfattning)"? | **Ja, med "Spatial förmåga" som namn och "rumsuppfattning" som underrad.** Kortets rubrik "Spatial förmåga", underrad "Rumsuppfattning: vridna figurer, pappersvikning, tärningar". I löptext parentesen första gången. I I-prov-provet heter deltesterna som i provet. Slugar och URL:er byts inte. | Besökaren kommer med ordet (227 visningar mot 1) och ska känna igen det hela vägen artikel, prov, konto. Två namn utan koppling på samma sak är friktion i den dyraste övergången. Fackordet står kvar som förklaring. |
| 3 | Dag 2-mejlet för fler testtyper än matrisen? | **Ja.** Utlösaren blir första Nivåkollen i vilken typ som helst (matris, figurserier, deduktivt, verbalt, numeriskt), och för konton med valet Polisen eller Försvarsmakten, som saknar Nivåkoll i sina typer, första avslutade grundtestet i spatial, talserier eller ordförråd. Mejlet nämner typen och länkar till typens pass. Taket två träningsmejl, `quota_emails_opt_out` och avregistreringen står kvar. | De mest köpbenägna kontona får i dag inget mejl alls. Mejlet är den billigaste återkomsten vi har och ingen gratisanvändare har gjort pass två olika dagar. Insats S till M (`nivakollen()` i `traning.ts` läser bara matrisens Nivåkoll i dag). Avläses 20 dec med väggen. |
| 4 | Provdatum som första fråga efter kontot? | **Ja, för konton som kommer med `mitt_test` iprov eller lokforare, som en egen skärm som går att hoppa över.** Inte i kontosteget (e-post och lösenord, som skissen). Skärmen tar variant (Polisen, värnplikt, officersprogrammet) och datum, med "Jag har inget datum än". Övriga konton landar som i dag. Art-director utformar inom befintliga mönster, testansvarig stämmer av. | Datumet är det som ger planen, generalrepetitionen och därmed väggen; utan datum finns inget Premium att motivera. Att ingången nås av ett konto av åtta säger att vi inte kan vänta på att användaren hittar dit. Lärdomen från fråga 1 i registreringen (61 till 65 procents tapp) gäller: inget obligatoriskt steg före kontot, och skärmen ska gå att hoppa över. Mäts som `provdatum_satt` med dagar kvar. |
| 5 | Additiv kolumn `test_kind` på `anon_test_sessions` och `prov_utfall`? | **Ja.** `text not null default 'matris'`, ingen ändring av befintliga rader, ingen backfyllning. | Specens avsnitt 5. Additiv och går att köra via MCP utan manuellt läge enligt säkerhetsreglerna; radantal kontrolleras före och efter. Körs först i våg 1 av inbäddningen, eftersom allt annat per typ hänger på den. |
| 6 | Mål och avläsning 9 feb och 9 mar, med säljgranskningens köpmål? | **Ja.** SEO-planens visnings- och klickmål i 7.3 står. Köpmål som hypoteser: I-prov 10 procent köp per konto (bedöms först vid minst 20 konton, alltså 9 mar), deduktivt 5 procent, spatial inget köpmål (bara konton och klick vidare till N1). Konton från de nya typerna 8 på 28 dagar 9 feb, 20 den 9 mar. Lokförare: minst 15 konton med valet till 9 feb öppnar beslutet om koncentrationsmodulen och N5, under det byggs inget. Julveckorna utanför. Omprövningsreglerna i 1.5 och säljgranskningens avsnitt 4 gäller. | Talen är små och ska sägas vara små: planen ger en mätbar kedja och de första tecknen på om I-prov-besökaren köper oftare, inte intäkt i februari. Satsningar efter 9 feb (N4, N5, N6) bygger på köp per konto per `mitt_test`, inte på klick. Mätningen som måste finnas före första publicering: `acquisition_source` med `smakprov:<slug>`, `mitt_test_valt` med surface artikel eller hubb, `provdatum_satt`, `betalvagg_visad` och `paywall_cta_clicked` med `mitt_test` och plats, köp kopplat till konto. |
| 7 | Ingången i två steg i stället för skissens tre? | **Ja.** "Mitt test" med valen och varianterna, sedan datum. "Annat eller vet inte" fäller ut kryssrutorna, så inget val försvinner. | Färre steg i en ingång som nås av ett konto av åtta är rätt riktning, och det är samma princip som när fråga 1 togs bort ur registreringen. Klicktestet 76 av 76 är gjort. Mät andel som fullföljer ingången per steg, avläsning 7 dec. |
| 8 | Ska `fraga_rapporter` få de nya typerna i villkoret? | **Nej, inte nu.** Rapporterna sparas som `matris` och skiljs via id-prefix som i dag. Adminvyn `/admin/fragor` ska härleda typen ur id:t, inte ur `test_kind`, så inget visas fel. Villkoret skrivs om i nästa migrering som ändå kräver manuellt läge. | Drop och återskapande av villkor kräver manuellt läge och ägaren vid tangentbordet, och ingen användarfunktion hänger på det. Samma lösning som figurserierna hade till 12 okt. |

### Byggordning efter besluten

Allt live på main gör att innehållet går först och inbäddningen efter 23 nov. Opus bygger, art-director och testansvarig beslutar design, copywritern texten, SEO-agenten granskar och SEO-diffen körs före varje push. Ägaren begär indexering per publicerad sida.

1. **Nu, vecka 10 till 16 nov.** U3 (länkar och provkort). U1 live med titeln "Spatial förmåga: vad det är och test att öva gratis" (51 tecken) tills smakprovet finns, då byts den till planens förstahandsval. Namnbytet enligt beslut 2 i vyerna (bara synlig text). U2 med blocket "Vilket test ska du göra?" och I-prov-raden, U7, U9. N2 och N3 skrivs och publiceras med provkort till typens grundtest och testsidan; U4 samtidigt. N1 skrivs enligt säljgranskningens 3.2 med Premiumtexten ur beslut 1 och publiceras så snart copy, källor och SEO-granskning är klara, senast 30 nov. `test_kind`-migreringen körs (beslut 5).
2. **17 till 23 nov.** `mitt_test` som dold parameter från artikel och hubbens kort till kontot, `acquisition_source` med `smakprov:<slug>`, händelserna i beslut 6. Provdatumskärmen efter kontot (beslut 4) skissas och byggs. Dag 2-mejlet för alla typer (beslut 3). 23 nov: prov-konto-v2 live efter ägarens Google-test.
3. **24 nov till 7 dec.** Våg 1 av inbäddade uppgifter: matris i fyra artiklar, spatial i U1, deduktivt i U3. I-prov-smakprovet med sex uppgifter i N1 och på hubben, med resultatet per deltest enligt säljgranskningen. Därefter våg 2: figurserier, verbalt (efter art-directors beslut om numeriskt), numeriskt, talserier i N2, ordförråd i N3. 7 dec: avläsning av logiska-tester, CTR-omgången, figurerna, U1, indexering av N1 till N3, ingångens fullföljande. Sedan U6 och U8.
4. **18 dec** baslinje, **9 feb** och **9 mar** avläsning enligt beslut 6.

### Följs upp utanför den här planen

Ingången nås av ungefär ett konto av åtta (8 planer på 65 konton). Det är större än något i SEO-planen och mäts från och med nu per steg; saas-lead tar upp det i veckorapporten efter 7 dec med förslag.

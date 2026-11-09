# Säljgranskning av SEO-planen för de nya testerna (10 november 2026)

Säljansvarig (inlånad från Begone), 2026-11-10. Granskar `docs/plan-seo-nya-tester-2026-11-10.md` ur en enda fråga: blir trafiken konton och köp av Premium, 149 kr i månaden? Saas-lead granskar prioritering och affärsvärde parallellt. Ingen kod är ändrad och inget är publicerat. Priser beslutar bara ägaren.

**Underlag:** SEO-planen, `docs/rapporter/analys-2026-11-08.md`, `docs/rapporter/gap-testtyper-2026-11-09.md`, `docs/plan-efter-analys-2026-11-08.md`, skissen `docs/design/skiss-prov-konto-2026-11-09.html` (commit ca44d8a0, går live tidigast 23 nov), `docs/design/brief-tester-steg2-2026-11-09.md`, `docs/design/spec-prov-fler-typer-2026-11-09.md`, `src/lib/tester/steg2Status.ts`.

**Tratten i dag (P2, 26 dagar):** 273 provstarter, 85 procent slutför, 158 såg kontosteget, 29 konton (18 procent, mål 30). 63 nya konton totalt, 5 köp. Väggarna nådde 17 personer, 3 köpte. Köp per nytt konto 3 till 8 procent. Alla tal nedan som gäller framtiden är hypoteser med avläsningsdatum, inte fakta.

---

## 1. Slutsatsen i korthet

1. **SEO-planen är byggd rätt för konton men saknar köpvägen.** Den räknar konton per kluster (mål 8 på 28 dagar till 9 feb) men sätter inget köpmål per sida och beskriver inte var och när Premium erbjuds den som kommer från en testartikel. Kontot är ett mellansteg. Det som ska mätas och optimeras är kedjan artikel, prov, konto, val av test, provdatum, vägg, köp.
2. **Den köpbenägna besökaren är den med ett datum.** I-prov (polis, mönstring, officer) och lokförare har ett riktigt prov framför sig, ett krav att klara och ett urval där de flesta inte går vidare. De söker inte "vad är spatial förmåga", de söker "i-prov 2025 övning". N1 är den enda sidan i planen som adresserar dem, och den ska byggas som en säljsida med ett prov att köpa övning inför, inte som en förklarande artikel med ett smakprov sist.
3. **Planen och briefen säger olika saker om vad kontot ger.** SEO-planen (3.2 och 4.2) skriver att I-prov-smakprovet fortsätter i "I-prov-provet halvt, som kräver konto". Briefen (5.1) säger att provpaketet kräver `test_exam_mode`, alltså Premium. Det måste avgöras före N1 skrivs, för det styr både löftet på sidan och var väggen står. Mitt förslag står i avsnitt 3.
4. **Spatial förmåga ger konton, inte köp.** Frågorna är "vad är", "hög spatial förmåga", "adhd", "autism". U1 är billig och ska göras, men kontomålet där ska inte förväxlas med intäkt. Köpmålet för U1 sätts lågt.
5. **Tre nya typer med fri grundnivå och fri Nivåkoll var breddar gratisnivån tre gånger.** Den som övar inför I-provet får tre grundtester, tre Nivåkollar och ett pass dag ett utan att betala. Det är rimligt för den som läser om spatial förmåga, men för I-prov-besökaren är det provpaketet med tid per deltest som är värdet, och det ska vara det som är Premium.

Rekommendationen i en mening: bygg N1 som planens enda säljsida, med I-prov-provet som Premiumvärde och provdatumet som utlösare, och mät köp per källsida redan från första dagen.

---

## 2. Åtgärd för åtgärd: leder den till konton och köp?

Avsikt enligt SEO-planens skala (I informera, Ö öva nu, K köpa övning, N navigera). "Köpnärhet" är min bedömning: hög betyder att besökaren har ett datum eller ett krav, låg att besökaren läser för att förstå.

| # | Åtgärd | Avsikt | Köpnärhet | Ger den konton? | Vad saknas för köp | Mäts per steg |
|---|---|---|---|---|---|---|
| U3 | Indexera deduktivt-induktivt-test, länkar "deduktivt test" | Ö ("test gratis") | Medel. SHL och Aon används i riktiga rekryteringar, besökaren har ofta en inbjudan | Ja, när provkortet pekar på deduktivt prov (saknas i specen, planen föreslår tillägg, jag stöder det) | Vägen från deduktivt prov till konto landar i dag i matrisens värld. Kontot ska öppna med Nivåkollen deduktivt och "Mitt test: SHL" förvalt | article_cta_clicked (slug, prov-deduktiv), sample_started/completed test_kind deduktiv, signup_completed, mitt_test_valt SHL, betalvagg_visad, köp |
| U1 | rotation-test-guide: smakprov spatial, ny seoTitle, nya H2 | I + Ö | Låg | Ja, smakprovet ger konton som matrisens gör (hypotes 18 till 30 procent av kontosteget) | Inget rimligt att lägga till. Sidan är en kontomaskin, inte en köpmaskin. Länken "spatial förmåga i I-provet" till N1 är den enda köpvägen och ska stå nära smakprovets resultat | Som ovan med test_kind spatial, plus klick på N1-länken |
| U2 | Hubben: blocket "Vilket test ska du göra?" | N + Ö | Medel till hög för korten Polisen och Lokförare | Ja. Testsidan gav 3,8 konton per 100 sessioner, blocket låter besökaren välja avsikt före kontot | Valet på kortet ska följa med till kontot (`mitt_test`), annars tappas avsikten vid kontosteget. Korten ska mätas var för sig | klick per kort (nytt: hub_val_klick med val), prov per typ, konto, mitt_test, köp |
| N1 | /artiklar/i-prov med sex uppgifter | I + Ö + K | **Hög** | Ja, om smakprovet står högt och kontosteget visar per deltest | Allt i avsnitt 3. Framför allt: vad kontot ger (halvt prov eller inte), var Premium nämns, provdatumet som första fråga efter kontot, dag 2-mejlet för I-prov-konton (gäller i dag bara matrisen) | Hela kedjan. N1 får egen rad i tratten |
| 5 | Smakprov per typ, uppgift 1 i HTML | Ö | Beror på typen | Ja, det är dagens motor i fler artiklar | Resultatsidans Premiumrad är skissens text ("när du sedan vill träna på din nivå varje dag"). För I-prov och lokförare ska raden i stället tala om provet: "Hela övningsprovet med tid per deltest ingår i Premium". Copy formulerar | Samma händelser med test_kind och källa, köp per källa |
| N2 | /artiklar/talserier | Ö + I (delvis skola) | Låg till medel | Ja, men delar av trafiken är skolelever som aldrig köper | N2 ska vara matarsida till N1. Smakprovets resultat ställer frågan "Övar du inför I-provet?" och skickar valet vidare | Som ovan, plus andel som väljer I-prov efter N2 |
| N3 | /artiklar/ordforstaelse-test | Ö (delvis högskoleprov) | Låg till medel. "polis"-varianten hög | Ja | Samma som N2. H2 om polisens ordförståelse ska länka till N1 med smakprovet, inte bara till texten | Som N2 |
| U4, U5, U7 | Länkar från logiktest-exempel, logiska-tester, arbetspsykologiska-tester | I | Låg | Indirekt | Inget. Ankartexterna är SEO:s. Räkna klicken så att vi ser vilka sidor som matar N1 | article_cta_clicked target |
| U6 | aon-cut-e-test: H2 "Aon-testet för lokförare" | Ö + K | **Hög** men vi saknar halva testet | Delvis. Den som läser att vi inte har koncentration och navigering kan gå till JobTestPrep i stället | Ett tydligt erbjudande om det vi har (figurserier i Aon-tempo, numeriskt, verbalt, deduktivt, spatial) och en räknare på hur många som väljer Lokförare i kontot. Det är mätpunkten för om koncentrationsmodulen ska byggas | klick på lokförar-H2:ns prov, mitt_test lokforare, köp bland dem |
| U8 | Matrigma-ägarskapet | Ö + K | Medel till hög (Matrigma är vanligaste testet, kandidaten har en inbjudan) | Ja via matrigma-test, som redan har provkort | Inget nytt | Finns |
| U9 | /funktioner får testrad | I | Låg | Nej | Inget. Gör det för helheten, mät inte | |
| U10 | Smakprov i numeriskt och verbalt | Ö | Medel | Ja | Inget utöver specen | Specens |
| N4 | /artiklar/shl-test, januari | N + K | Hög | Ja, när G+-provet finns | Rätt att vänta. Publicera inte före G+-provet, sidan säljer ett prov | |
| N5 | /artiklar/lokforare-test | Ö + K | Hög | Vänta, som planen säger | Koncentrationsmodulen. Beslut efter mitt_test-räkningen | |
| N6 | Egna sidor mönstring och polis | | | Vänta, som planen säger | | |

**Tre tillägg till planen som jag anser nödvändiga:**

1. **`mitt_test` från artikel till konto** (planens 4.3, kräver beslut). Ja, det är den viktigaste produktändringen i hela planen för köp. Den gör att kontot öppnar i rätt test, att dag 2-mejlet kan tala om rätt test och att köpet kan knytas till källsidan. Gäller N1 (iprov), matrigma-test (matrigma), alva-labs-logiktest (alva), deduktivt-induktivt-test (shl), aon-cut-e-test (aon, och lokforare från H2:n), U2:s kort.
2. **Provdatumet frågas direkt efter kontot när valet är I-prov eller lokförare.** Inte i kontosteget (det ska vara e-post och lösenord, som skissen), utan på första skärmen efter. Den som har ett datum får en plan och en generalrepetition, och det är då Premium motiveras. Mät andel som sätter datum. Hypotes: konton med datum köper oftare än konton utan. Det är prövbart i Supabase (`test_planer.provdatum` mot köp) redan på dagens konton, och bör prövas före bygget.
3. **Köp som rad i planens mätning per sida.** Planens 7.1 har "Köp: Stripe och Supabase, nya konton från testklustret, I-prov för sig". Det räcker inte. Varje konto bär redan `acquisition_source` (rättat 9 nov). Lägg artikelslug i källan när kontot kommer via smakprov (`smakprov:<slug>`), och läs köp per slug och per `mitt_test`.

---

## 3. Sidorna närmast köp, och hur de ska byggas

### 3.1 Ordning efter köpnärhet

| Plats | Sökavsikt | Vem | Varför nära köp | Sida |
|---|---|---|---|---|
| 1 | "i-prov 2025", "i-prov övning", "i-prov polis", "mönstring test", "uniq test polis" | Har kallelse till mönstring eller polisprövning, vet datumet, vet kravet (polis minst 4) | Datum, krav, stort urval, och ingen svensk aktör har progression med provdatum | N1 |
| 2 | "lokförare test gratis", "lokförare test", "tcc lokförare test" | Sökande till lokförarutbildning, Aon-batteri, 85 procent underkända | Datum och hårt urval, betalar redan hos JobTestPrep | U6 nu, N5 senare |
| 3 | "matrigma test öva", "shl test", "deduktiv slutledningsförmåga test gratis", "alva logiktest" | Kandidat med inbjudan från arbetsgivare, ofta några dagar | Datum, men kortare horisont och mindre insats | matrigma-test, deduktivt-induktivt-test, alva-labs-logiktest, N4 |
| 4 | "talserier test", "ordförståelse test" | Blandat: I-prov-övare, skolelever, högskoleprovet | Nära köp bara när det är I-prov | N2, N3 som matare till N1 |
| 5 | "spatial förmåga", "hög spatial förmåga", "vad är spatial förmåga" | Nyfiken, förälder, student | Läser för att förstå | U1 |

### 3.2 Så byggs N1 för den som har ett datum

Inom ramen Premium 149 kr i månaden. Inget nytt pris, inget paket, ingen rabatt. Copy äger orden, SEO äger title, H1, meta och ankartexter. Det här är ordning och budskap.

**Ovanför vikningen på mobil, i den här ordningen:**
1. Snabbsvaret (SEO:s krav, ska stå först).
2. Smakprovet: sex uppgifter, en per deltest, i provets ordning, utan tid. Startknappen syns utan rullning efter snabbsvaret. Det är planens krav 2 i 4.2 och jag håller med.
3. En rad om vad kontot och Premium ger, i text, innan provet startar. Besökaren ska veta vad som kommer efter sex uppgifter.

**Smakprovets resultat för I-prov** skiljer sig från matrisens: huvudtalet "X av 6" och sex små brickor med deltestets namn. Spärren "Se vad jag missade" leder till kontot som i skissen. Raderna i spärren:
- "Fråga N med rätt svar och tekniken bakom" (som skissen).
- "Nivåkollen i det deltest där du tappade mest" (gratis).
- "Planen fram till ditt provdatum, med ett pass om dagen" (gratis dag ett, sedan Premium).
- Premiumraden i text, som skissen, men med provet som innehåll: "Hela övningsprovet i I-provets ordning, med tid per deltest, ingår i Premium, 149 kr i månaden." Pris ur `plans`.

**Efter kontot:** `mitt_test=iprov` satt, variant frågas (Polisen, värnplikt, officersprogrammet) tillsammans med provdatumet på en skärm. Sedan Nivåkollen i deltestet där smakprovet gick sämst. Planen roterar deltesterna och lägger I-prov-provet som generalrepetition. Det är där väggen står: generalrepetitionen är Premium.

**Vad som är gratis och vad som är Premium för I-prov, mitt förslag (ägaren beslutar):**
- Gratis: smakprovet (6), grundnivån i varje typ, första Nivåkollen per typ, pass dag ett, dag 2-mejlet.
- Premium: avancerad och expert, pass från dag två, I-prov-provet (halvt och helt), riktade pass per deltest.
- Det halva provet ska alltså **inte** vara gratis med konto, som SEO-planen skriver. Skälet: det är den enda produkten ingen gratiskonkurrent har i den formen, och den som har ett datum vill ha just den. Ger vi bort det halva provet har vi inget kvar att sälja förrän dag två, och då har I-prov-övaren redan fått det som motsvarar testttalents 17-frågorsprov gratis.
- Motargument som ska vägas: ett halvt prov gratis kan ge fler konton och en starkare vägg efteråt. Det är en hypotes som kan prövas senare med en flagga, men inte vid lanseringen. Först mäter vi grundläget.

**Vad N1 inte får göra:** lova stanine, lova att man klarar kravet, visa Pliktverkets uppgifter, antyda samarbete. Planens risker 1 till 5 står fast. Ärligheten om att övningsprov inte ger stanine är en förtroendesignal, inte en säljnackdel, och ska stå kvar.

**Publiceringsvillkor för N1:** inte före I-prov-provet (minst halvt) är live. SEO-planen säger "när minst två av tre motorer är live, helst när I-prov-provet är live". Jag är strängare: den mest köpbenägna trafiken i hela planen ska inte landa på en sida vars huvudvärde inte går att köpa. Blir I-prov-provet inte klart före 14 dec väntar N1 till 7 jan, som planens julregel ändå säger. Det går att kompromissa: publicera N1 med smakprov och de tre typernas nivåtester före jul, och lägga till provpaketet när det finns. Då ska texten inte nämna provpaketet alls förrän det finns (planens risk 2).

### 3.3 Lokförare (U6, N5)

Köpnärheten är hög men vi har inte produkten. Planens ärliga H2 är rätt, men den ska avslutas med vad vi har och en väg in, inte med vad vi saknar. Valet Lokförare i kontot är räknaren. Beslutsregel till ägaren: om minst 15 konton har valt Lokförare till 9 feb byggs koncentrationsmodulen och N5. Under det väntar vi. Talet är en hypotes om vad som motiverar M-insatsen, inte en uppmätt gräns.

### 3.4 Matrigma, Alva, SHL, Aon

De har redan artiklar med provkort. Det som saknas är `mitt_test` från artikeln och att smakprovets resultatsida nämner rätt prov i Premiumraden ("övningsprov i Matrigmas format"). Det är S per artikel när mekanismen finns.

---

## 4. Konverteringsmål per sida och sökavsikt

28-dagarsfönster, avläsning 9 feb (första) och 9 mar (andra), som SEO-planen. Julveckorna utanför, som planen. Konton räknas i Supabase (PostHog underskattar, analysen 8 nov). Köp räknas i Stripe och Supabase per `acquisition_source` och `mitt_test`.

Grundantaganden ur P2: prov till konto 18 procent i dag, mål 30 efter 23 nov. Köp per nytt konto 3 till 8 procent totalt. För I-prov sätter jag hypotesen 10 procent köp per konto, för att besökaren har ett datum. Det är inte belagt och det är avläsningen 9 mar som avgör.

| Sida eller avsikt | Klick (SEO:s mål) | Prov startade av klick | Prov till konto | Konton 28 d | Köp per konto (hypotes) | Köp 28 d | Kill eller ändra om |
|---|---|---|---|---|---|---|---|
| N1 i-prov | 8 (9 feb), 30 (9 mar) | minst 50 procent (smakprovet står högt) | minst 30 procent | 1 till 2 (9 feb), 5 (9 mar) | 10 procent | 0 (9 feb), 1 (9 mar), sedan 1 per 10 konton | Prov startade under 30 procent av klicken: smakprovet ligger fel. Konton 0 av minst 10 prov: kontosteget. 0 köp av minst 20 konton till 9 mar: väggens plats eller budskap |
| U6 lokförare | rätt sida visas | mät | mät | mät | mät | mät | Minst 15 konton med valet Lokförare till 9 feb ger N5 och modulen |
| U3 deduktivt | 6 (9 feb), 10 (9 mar) | minst 40 procent | minst 30 procent | 1 (9 feb), 1 till 2 (9 mar) | 5 procent | 0 till 1 | Som N1 fast med lägre tal |
| U1 spatial | 12 (9 feb), 20 (9 mar) | minst 40 procent | minst 25 procent (lägre avsikt) | 1 till 2 (9 feb), 2 till 3 (9 mar) | 2 procent | 0 | Inget köpmål. Kontomålet räcker. Mät i stället klick till N1 från sidan |
| N2 och N3 | 4 (9 feb), 15 (9 mar) sammanlagt | minst 40 procent | minst 25 procent | 0 till 1 (9 feb), 2 (9 mar) | följer I-prov om valet görs | | Andel som väljer I-prov efter N2 och N3 under 20 procent: sidorna matar inte N1, se över frågan efter provet |
| U2 hubben, blocket | finns | per kort | per kort | hubben ger i dag 3,8 konton per 100 sessioner, mål oförändrat | | | Kort med under 2 procent klick av hubbens sessioner på 28 dagar byter plats eller text |
| Samtliga nya typer (SEO-planens rad) | | | | 8 (9 feb), 20 (9 mar), som planen | 5 procent blandat | 0 till 1 (9 feb), 1 till 2 (9 mar) | |

Talen för köp är små. Det är rätt att säga det: planen ger inte intäkt i februari, den ger en mätbar kedja och de första tecknen på om I-prov-besökaren köper oftare än andra. Beslutet om att satsa vidare (N4, N5, N6) ska bygga på köp per konto per `mitt_test`, inte på klick.

**Mätning som måste finnas före första publicering:**
- `acquisition_source` med artikelslug för konton via smakprov.
- `mitt_test` satt från artikel och hubbens kort, och `mitt_test_valt` med surface `artikel` eller `hubb`.
- `provdatum_satt` (ny händelse, eller läsning i Supabase) med dagar kvar.
- `betalvagg_visad` och `paywall_cta_clicked` med `mitt_test` och plats (testresultat, generalrepetition, dag2).
- Köp i Stripe med kontots id, så att Supabase kan koppla köpet till källa och val.
- En vy i admin-tratten per källsida: klick (GSC), prov, konto, val, datum, vägg, köp.

---

## 5. Risker: trafik utan konton eller köp

1. **"Gratis" i titlarna drar den som aldrig betalar.** logiktester.se är helt gratis utan konto. SEO vill ha "öva gratis" i seoTitle för U1, U2 och N1-klustret. Sälj accepterar det, för provet är gratis och ordet ger klicken, men då måste sidan tidigt säga vad som skiljer oss: progression, pass, provdatum, provpaket. Står det bara "gratis" tävlar vi på deras villkor och förlorar.
2. **Spatial förmåga ger informationstrafik.** 227 visningar, men frågorna är "vad är" och "hög spatial förmåga". U1 ger konton men knappast köp. Risken är att den syns som planens största vinst (det är den i klick) och tar fokus från N1 (det är den i köp). Håll U1 på S.
3. **Lokförare utan produkt.** U6 kan ge klick och en ärlig text som skickar besökaren till konkurrenten. Mät valet Lokförare och bygg bara efter räknaren.
4. **N1 publicerad utan provpaketet.** Se 3.2. Den köpbenägna trafiken landar då på nivåtester som konkurrenterna har gratis.
5. **Halvt prov gratis med konto** (SEO-planens formulering). Ger konton, tömmer väggen.
6. **Tre fria grundnivåer och tre fria Nivåkollar.** I-prov-övaren kan hålla på gratis i flera dagar innan väggen syns, särskilt om ägaren släpper dag 2-väggen (ägarbeslut 1 i analysen). Om dag 2-väggen släpps måste generalrepetitionen som Premium stå kvar, annars finns ingen vägg alls för I-prov.
7. **Kontosteget tappar avsikten.** I dag landar den som kommer från en artikel i ett konto som frågar om igen. Utan `mitt_test` från artikel upprepas tappet (16 av 29 provkonton hamnade i fel test i P2).
8. **Skolelever och högskoleprovet** på N2 och N3. De söker "talföljd" och "ord test hp". SEO har redan valt bort de orden. Risken kvarstår för "talserier övning". Mät andel som väljer I-prov efter provet, det är signalen.
9. **Mobil och längd.** I-prov-smakprovet har sex uppgifter varav pappersvikning och tärningar är tunga på 360 px. Slutförandet kan falla under matrisens 85 procent. Mät per deltest i smakprovet (var avbrotten sker) och korta till fyra om det behövs. Testansvarig och art-director avgör formen.
10. **Dag 2-mejlet gäller bara matrisen.** I-prov-konton får inget mejl dag två och ingen påminnelse om provet. Det är den billigaste återkomsten vi har, och den saknas för de mest köpbenägna. Kräver beslut (planens punkt 33, "beslut för ägaren").

---

## 6. Där sälj och SEO-planen skiljer sig

| Fråga | SEO-planen | Sälj | Vem avgör |
|---|---|---|---|
| Halvt I-prov-prov med konto | "kräver konto" (3.2, 4.2) | Premium, i linje med briefen 5.1 | Ägaren, med saas-lead |
| När N1 publiceras | När två av tre motorer är live, helst med provet | Inte före I-prov-provet (minst halvt), eller med en text som inte nämner provet | Ägaren |
| Köpmål per sida | Saknas, bara konton | Köp per källa och val från dag ett | Saas-lead |
| Premiumradens text efter smakprovet | Skissens generella rad | Per val: provet för I-prov och lokförare, formatet för Matrigma, Alva, SHL | Copy formulerar, ägaren godkänner i skissen |
| Provdatum direkt efter kontot | Inte med | Första skärmen efter kontot för I-prov och lokförare | Art-director i skiss, ägaren |
| "Gratis" i titlar | Ja där provet är gratis | Ja, med villkoret i risk 1 | Överens |

Allt annat i planen stöder jag: artiklarna som landningssidor, `/prova` kvar som noindex, uppgift 1 i HTML, en sida per avsikt, N4 till N6 får vänta, inga sidor för ord med skol- eller ordboksavsikt.

---

## 7. Kräver ägaren

1. Halvt I-prov-prov: gratis med konto eller Premium (avsnitt 3.2).
2. Publiceringsvillkoret för N1 (avsnitt 3.2).
3. `mitt_test` från artikel och hubbens kort till kontot (planens 4.3). Sälj säger ja.
4. Provdatum som första fråga efter kontot för I-prov och lokförare, i skiss.
5. Dag 2-mejlet för fler testtyper än matrisen.
6. Räknaren för lokförare: minst 15 konton med valet till 9 feb som villkor för modulen och N5, eller ett annat tal.
7. Köpmålen i avsnitt 4 som hypoteser med avläsning 9 feb och 9 mar.

## 8. Vad som bör prövas i data före bygget

- Köper konton med satt provdatum oftare än konton utan? Supabase `test_planer` mot köp, på dagens konton. Svaret avgör hur hårt provdatumet ska drivas.
- Köper konton från testartiklar oftare än konton från andra källor? `acquisition_source` är ifyllt på alla konton sedan 9 nov, så från omkring 7 dec finns fyra veckor.
- Var i det nya kontosteget (live tidigast 23 nov) faller besökaren, per `test_kind`? Avläsning fyra veckor efter driftsättning, som planen.

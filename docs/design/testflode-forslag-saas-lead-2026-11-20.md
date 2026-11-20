# Testflödet: förslag från saas-lead

Datum: 2026-11-20. Underlag till den gemensamma planen (saas-lead, mobile-ux-designer, art-director) som ägaren ska godkänna innan något byggs. Ingen kod, ingen artefakt. Bygger på `docs/rapporter/testflode-inventering-2026-11-19.md`, skärmdumparna i scratchpad/testflode, `src/lib/traning/gratisniva.ts`, `src/lib/quota/quotaService.ts` och siffror ur Supabase och PostHog hämtade i dag.

Mitt perspektiv är affär, aktivering, konvertering och risk. UX-designern äger flödet på skärmen, art director äger uttrycket. Där jag tror att vi kan tycka olika står det utskrivet.

---

## 0. Siffrorna som styr prioriteringen

Supabase, `logic_test_v4_sessions`, senaste 90 dagarna (22 aug till 20 nov), ägarens konto och testkonton bortfiltrerade via `admin_undantagna_konton()`. Slutförd = `completed_at` satt. "Utan svar" = avbruten med noll sparade svar.

| Dörr | Startade | Slutförda | Andel | Avbröt utan ett svar | Mediantid |
|---|---|---|---|---|---|
| Figurer och mönster, grundnivå (`matrislogik`) | 122 | 111 | 91 % | 2 | 6,5 min |
| Nivåkollen, matris (`matrislogik-matning`) | 44 | 31 | 70 % | 6 | 5 min |
| Verbalt, grundnivå | 38 | 24 | 63 % | 7 | 13 min |
| Träna, matris (`matrislogik-pass`) | 30 | 25 | 83 % | 0 | 6 min |
| Numeriskt, grundnivå | 27 | 9 | **33 %** | **11** | 16 min (snitt 23 min mot utlovade 20) |
| Matris avancerad + expert | 46 | 44 | 96 % | 0 | 7 resp. 9 min |
| Legacy `matrislogik-prov` | 14 | 7 | 50 % | 7 | |
| Figurserier grund | 12 | 11 | 92 % | 0 | 6 min |
| Verbalt expert | 9 | **0** | 0 % | 6 | |
| Legacy verbal/numerisk `-prov` | 13 | **0** | 0 % | 13 | |
| Deduktivt, talserier, spatial, ordförråd (grund) | 18 | 18 | 100 % | 0 | 1,5 till 10 min |
| Nivåkollen, figurserier + verbalt + deduktivt | 6 | 2 | 33 % | 4 | |

Konton: 114 konton gjorde en testsession på 90 dagar, 107 slutförde minst en, **21 (18 %) kom tillbaka en andra dag**, 12 (11 %) en tredje. Nya testkonton de senaste 60 dagarna (med minst tre dagars historik): 81, varav 8 (10 %) gjorde något efter dag 1 och 7 är Premium i dag.

PostHog, 30 dagar: `betalvagg_visad` 199 visningar hos 33 personer, `paywall_cta_clicked` 20 hos 14 personer (10 % per visning, 42 % per person). Mobil står för majoriteten av starterna (Nivåkollen 24 av 38, Träna 23 av 29) men betalväggen klickas sämre där: desktop 125 visningar, 15 klick (12 %); mobil 72 visningar, 5 klick (7 %). Publika provet utan konto: `sample_started` 966, `sample_completed` 441 (46 %), det är den största volymen i hela testprodukten men ligger utanför den här planen (eget avläsningsfönster till 8 dec).

Luckor i mätningen: inga klienthändelser alls inne i nivåtesten, inget för Träna utom matris, inget på I-provets eller personlighetens start. Var i ett test folk lämnar vet vi bara via antalet sparade svar.

---

## 1. Vad som kostar mest

Rangordnat efter mätbar förlust, sedan efter förtroendeskada.

1. **Numeriskt och verbalt nivåtest: underlaget före frågan och svaren under vecket.** 65 starter, 32 avbrott, 18 utan ett enda svar. Numeriskt tappar två av tre. Inventeringen visar varför: svaren ligger på y≈845 av 900 på desktop, på mobil syns inget påstående på första skärmen i verbalt. Det här är gratisnivåns ingång för två av åtta typer och det enda fyndet där siffrorna ensamma motiverar bygget. Nivåkoll/Träna löser samma problem med sticky underlag och egen scroll (`VnUppgift`), så lösningen finns i kodbasen.
2. **Ingen startskärm och ingen väg tillbaka in.** Nivåkollen skapar sessionen när sidan öppnas och visar ett laddskelett och sedan fråga 1 utan att säga antal, tid eller regler. 6 av 44 lämnade utan svar, i de nya typernas Nivåkoll 4 av 6. Nivåtesten har ingen "Fortsätt där du var": den som tappar nätet eller stänger fliken får börja om med en ny session. Avbrutna sessioner räknas inte mot dagskvoten, så kostnaden är inte kvoten utan att användaren tappar sitt arbete och sin tilltro.
3. **Döda dörrar.** Verbalt expert 0 av 9, legacy `*-prov` 0 av 13 (20 av 27 avbröt utan svar). Det är Premiumfunktioner som ser trasiga ut för den som betalat. Stäng eller bygg om, aldrig lämna.
4. **Fyra svarsmodeller.** Auto-nästa (matris, figurserie, steg2, I-prov), markera + "Svara" (deduktivt, Nivåkoll), välj + "Nästa fråga" låst (numeriskt, verbalt expert), tryck + förklaring + "Nästa" (Träna). Går inte att mäta i dag, men det är den punkt ägaren reagerar på och den som gör att ett nytt test alltid känns som en ny produkt. Kostnaden syns indirekt: 18 % återkomst dag 2 trots att 94 % slutför sin första session.
5. **Löften som koden inte backar.** "Tolv uppgifter, cirka åtta minuter" för Nivåkoller med 6 till 9 uppgifter, "Nivåkoll, 8 min" på kort där Nivåkollen inte finns, "Välj format: Alva Logic eller Matrigma" där valet inte finns, verbalt "20 minuter" på sidan men 25 i klockan, "✓ 0 / 15" som ser ut som antal rätt. Varje sådan rad är ett brott mot sanningskravet och ska bort oavsett ram (avsnitt 7).
6. **Betalväggen på mobil.** 7 % klick mot 12 % på desktop, med 72 visningar. För liten volym för att vara säker, men riktningen stämmer med att mobilens betalvägg ligger under annat innehåll och att sessionen inte är helskärm. Ramen ska ge betalväggen en fast, förutsägbar plats (avsnitt 2.3).

Det som fungerar och inte får gå sönder: matris, figurserier, deduktivt och steg2-typernas grundnivå slutförs till 91 till 100 %. Etapp 1 får inte sänka dem.

---

## 2. Lägesmodellen ur produktperspektiv

### 2.1 Fem lägen, en ram, tre beteendeprofiler

Användaren ska lära sig **ett** gränssnitt. Skalet, huvudet, svarsmodellen, klockan, X:et, bekräftelsen och resultatsidan är desamma överallt. Det som skiljer lägena är fyra flaggor som ramen läser, inte fyra komponenter.

| Läge | Vad det är till för | Återkoppling | Navigering | Tid | Vem |
|---|---|---|---|---|---|
| **Nivåkollen** | Mäta nivån en gång per typ, ge första punkten på kurvan och välja träningsnivå | Efter | Linjär (adaptiv i matris, fast urval i övriga), ingen väg tillbaka | Mjuk: mäts, visas, bryter inte | Gratis en gång per typ, därefter ommätning i Premium |
| **Nivåtest** (grund, avancerad, expert) | Göra ett helt test i lugn och ro och se var man står på en nivå | Efter, med full genomgång | Fri, rutnät, tillbaka | Mjuk: nedräkning från utlovad tid, går över i "över provets tid" i stället för att lämna in | Grund gratis ett om dagen över alla typer, avancerad och expert i Premium |
| **Träna** (passen) | Lära sig: svar, besked, regel, vidare | Direkt efter varje uppgift | Linjär | Ingen press: tiden mäts och visas i resultatet | Premium (grundpass dag 0 gratis, som i dag) |
| **Övningsprov** (leverantörsformat) | Öva under provets villkor | Efter | Fri inom provet (låst i adaptiva format) | Hård: serverstyrd deadline, auto-inlämning, obesvarade räknas fel | Premium |
| **I-provet** | Som övningsprov men sex deltester med egen tid | Efter | Fri inom deltestet, deltest kan inte öppnas igen | Hård per deltest | Premium |

Personlighetstestet ligger utanför profilerna (Likert, ingen rätt eller fel) men i samma skal, etapp 3.

Profilerna i kod blir `aterkoppling: 'direkt' | 'efter'`, `navigering: 'fri' | 'linjar'`, `tid: 'ingen' | 'mjuk' | 'hard'`, plus `nasta: 'knapp'` överallt (se 2.2). Ingen annan komponent får fatta egna beslut om de här fyra.

### 2.2 En svarsmodell överallt: tryck markerar, knappen bekräftar

Jag tar ställning för Duolingos modell: tryck på ett alternativ markerar det, primärknappen i foten går vidare. I test- och mätlägena heter knappen "Nästa" (sist "Lämna in"). I Träna heter den "Rätta", visar regeln, och blir sedan "Fortsätt". Ingen auto-nästa någonstans, inte heller 150 ms i matris.

Skäl: (1) på mobil ligger svarsraden i dag precis vid nederkanten i matris och felklick blir svar utan ångervägen; (2) matrisens Nivåkoll "auto-nästa" är i själva verket "vänta på servern", och en knapp som visar att den arbetar är ärligare än en frusen skärm; (3) deduktivt, Nivåkoll, numeriskt och Träna har redan knappen, så det är den modell som kräver minst ombyggnad; (4) tangentbord och skärmläsare får en förutsägbar sekvens (a till f markerar, Enter går vidare). Kostnaden är ett extra tryck per uppgift i matris, figurserier och steg2. Matris slutförs i dag till 91 % med auto-nästa, så etapp 1 mäter det här på matris sist (avsnitt 6).

**Här kan UX och art director tycka annorlunda** (auto-nästa känns snabbare och mer "spel"). Mitt motkrav är då att en auto-variant ändå aldrig får finnas i mätlägen, och att den i så fall är ramens flagga, inte en typs egen kod.

### 2.3 Gratis och Premium i ramen

Regel: **betalväggen bor på startskärmen och på resultatsidan, aldrig inne i en session.** Sessionen startar först när servern sagt ja (samma POST som i dag, med samma 402/429), så en användare kan inte komma till fråga 7 och mötas av en vägg. Tre fasta ytor:

1. **Startskärmen** (alla lägen, se 2.4). För ett låst läge byts "Starta" mot `PaywallCard` med pris ur `PLANS` (och `KampanjPris` under Black Week): "Träna ingår i Premium, 149 kr i månaden". För en slut dagskvot visas `QuotaLockCard` med nästa tillfälle ("Ditt gratis test i dag är gjort. Nästa i morgon.") och de andra typernas grundnivå är inte en utväg eftersom kvoten gäller över alla typer. Fortsätt-knappen för en påbörjad session syns alltid, kvoten räknar bara slutförda.
2. **Resultatsidans statusrad** (finns: "Köp Premium, 149 kr i månaden", mätt med `betalvagg_visad`, plats `testresultat`). Gratisanvändaren ser alltid hela resultatet och hela genomgången, det ligger fast (`genomgangGratis`).
3. **Lägesmenyn på Tester** med lås och pris på låsta lägen, aldrig döda knappar.

Inne i sessionen finns ingen Premium-text, inga lås, ingen "Lås upp". Tre exponeringar är tillräckligt, och alla tre mäts med samma händelse och olika `plats`.

### 2.4 Startskärmen, en för alla lägen

Övningsprovets `Startark` blir mallen: läge och typ, exakt antal uppgifter och tid **räknade ur config, aldrig som fast sträng**, tre regler (vad klockan gör, om du kan gå tillbaka, om du får hjälp), primärknapp, och under den "Fortsätt där du var, 7 av 15 besvarade" när en session utan `completed_at` finns från senaste dygnet. Träna får en kortad variant (en rad regler). I-provets mellanskärm per deltest är samma komponent med annan rubrik. Nivåtestens nuvarande startsida (`TestHubPage`) behåller korten "Ditt bästa" och "Dina försök" men ovanför dem ligger startarket.

Startskärmen är serverrenderad med initialdata (prestandabudgeten: flödessidor under 2,0 s, CLS 0) och är den enda plats där sessionen skapas.

### 2.5 Resultatsidan, en för alla lägen

`TestResultsPage` är redan gemensam för åtta typer och mest komplett. Den blir basen med fast ordning: huvudtal (antal rätt eller nivå), tempo mot provets tid, genomgång (alltid, även efter Nivåkollen där den saknas i dag), nästa handling (Träna, nästa nivå, i morgon), statusrad med sälj där det är relevant. Resultatet säger vad som gjordes med samma ord som startskärmen ("Nivåkollen, figurserier"). Art director bestämmer hur den ser ut, inte vad den innehåller.

---

## 3. Ägarens idé: en inställning för återkoppling och auto-avancera i Träna

Ställningstagande: **ja till en inställning, men bara en, bara i Träna, och först i etapp 2.**

- "Rätta efter varje uppgift" (på som standard). Av betyder att passet rättas i slutet med samma genomgång som i dag. Sparas per konto (ui-flaggor i profilen, samma mekanism som `Förklarande text`), gäller alla typer, syns på Träna-startskärmen som en rad, inte i en inställningssida. Kostnaden är nära noll eftersom det bara byter profilens flagga `aterkoppling`, och genomgången efter passet finns redan.
- Ingen inställning för auto-avancera, eftersom auto-nästa försvinner ur ramen (2.2). Finns inte två beteenden finns inget att bocka i.
- Ingen inställning i Nivåkollen, nivåtest eller prov. Där är "ingen återkoppling under tiden" själva poängen, och en valbar variant gör nivåer och tempo ojämförbara mellan användare.

Varför inte i etapp 1: Träna är Premium, volymen är 30 pass på 90 dagar, och ramen ska först bevisa sig på gratisnivån där avhoppen sitter. Mät `traning_aterkoppling_av` (andel pass med av) och avläs efter fyra veckor; under 10 % betyder att raden kan tas bort.

---

## 4. Mätning

### 4.1 Bevaras oförändrat (namn och egenskaper)

Klient: `pass_startat`, `nivamatning_startad`, `vet_inte_tryckt`, `betalvagg_visad`, `paywall_shown`, `paywall_cta_clicked`, `feature_blocked`. Server: `pass_klart`, `riktat_klart`, `nivamatning_klar`, `ommatning_klar`, `generalrepetition_klar`, `provpaket_klart`, `kalibreringsfraga_svarad`, `milstolpe_nadd`, `fraga_rapporterad`. Aktivitetslogg: `test_completed` via `logUserActivity` (adminens tratt läser den). Adminens `admin_daily_metrics` och `/admin/tratt` får inte ändra definitioner.

### 4.2 Nya händelser, skjuts av ramen (en gång, inte per typ)

| Händelse | När | Egenskaper |
|---|---|---|
| `test_start_viewed` | startskärmen renderad | `test_kind`, `lage`, `niva`, `format`, `fortsatt_tillganglig`, `sparrad` (none, quota, premium) |
| `test_session_started` | första uppgiften visad | + `session_id`, `antal`, `tid_budget_s`, `resumed` |
| `test_question_answered` | svaret sparat | + `index`, `elapsed_ms`, `via` (tap, keyboard), `vet_inte` |
| `test_session_abandoned` | X bekräftat eller sidan lämnad med osparad session | + `index`, `besvarade`, `elapsed_ms` |
| `test_session_completed` | inlämning bekräftad av servern | + `besvarade`, `elapsed_ms`, `over_tid` |
| `test_submit_blocked` | "Lämna in" med obesvarade, dialogen visad | + `obesvarade` |

`lage` är ett av `nivakoll`, `nivatest`, `trana`, `ovningsprov`, `iprov`, `personlighet`. `$device_type` följer med automatiskt. Aldrig `correct` i mätlägen (facit finns inte i klienten); i Träna får `test_question_answered` ha `ratt` eftersom servern svarar. Volymen är ungefär 200 sessioner gånger 15 uppgifter i månaden, utan betydelse för PostHog-kvoten.

Sanningen om slutförandegrad kommer fortfarande ur Supabase (tabellen ovan går att köra om med samma fråga). PostHog används för var i sessionen folk lämnar och tid per uppgift per enhet.

### 4.3 Avläsningar och mål

Baslinjen är tabellen i avsnitt 0, fryst i den här filen. Avläsning 14 dagar efter varje etapp, aldrig tidigare.

| Mätpunkt | Baslinje | Mål efter etapp 1 |
|---|---|---|
| Numeriskt grund, slutförda | 33 % | över 70 % |
| Verbalt grund, slutförda | 63 % | över 80 % |
| Nivåkollen (alla typer), slutförda | 70 % | över 85 % |
| Avbröt utan ett svar, alla lägen | 7 till 41 % per typ | under 5 % överallt |
| Matris, figurserier, deduktivt, steg2 grund | 91 till 100 % | inte under 90 % (vaktpunkt) |
| Betalvägg, klick per visning mobil | 7 % | i nivå med desktop, 12 % |
| Återkomst andra dagen bland testkonton | 18 % | 25 % efter etapp 2 (Träna), inte etapp 1 |

Datum: etapp 0 live senast 22 nov (före frysen) eller 1 dec. Etapp 1a (numeriskt, verbalt) live 1 till 2 dec, avläses 16 dec. Etapp 1b (övriga sex nivåtest och Nivåkollerna) live 8 till 9 dec, avläses 23 dec och, på grund av julen, en gång till 13 jan. Etapp 2 live vecka 2 i januari, avläses 27 jan. Etapp 3 avläses i februari. Black Week-avläsningen 1 dec påverkas inte av etapp 0 (bara text och en redirect).

---

## 5. Risker och hur de hanteras

| Risk | Vad som kan gå sönder | Hantering |
|---|---|---|
| **Sparning och återupptagning** | Nivåtesten postar per svar till `/api/<typ>/answer` utan kö; verbalt och numeriskt väljer frågor i klienten (seedat på sessions-id); Nivåkoll/Träna skriver via `/api/traning/*` och byter URL till `/pass/<id>` | Ramen rör inga routes och inga tabellformat. Den tar över `useRobustAnswerSaving` (kö, omförsök, amber-rad) som i dag bara legacy-proven använder. "Fortsätt" läser samma `GET ?id=` som rehydreringen redan har. Kontrakttest per motor som snapshotar POST-kroppen före och efter. E2E mot riktig data före merge; vi har redan bränt oss på `key={pathname}` plus `replaceState` som skapade 161 sessioner. |
| **Kvoter** | Ett grundnivåtest om dagen över alla typer räknar slutförda i `GRUND_KVOT_TEST_TYPER`; gratis Nivåkoll en gång per typ; 402/429 i startsidans POST och passmotorerna | Sessionen skapas bara från startskärmen med samma POST. Inga nya `test_type`. QA med ett gratis icke-adminkonto (admin passerar alla kvoter). Avbrutna sessioner fortsätter att inte räknas, och "Fortsätt" förhindrar att folk startar om för att slippa kvoten. |
| **Serverstyrda tider** | Övningsprov och I-prov: deadline på servern, 410 efter tid + 10 s; `timeSpent`/`tid` per svar används i tempo och `sessionstid` | Hård tid behåller `useExamDeadline` oförändrad. Nivåtestens klocka byter bara utseende (nedräkning från config) men skickar samma `timeSpent`. Verbalt byter från 25 till 20 min och slutar auto-lämna in (mjuk gräns): mediantiden är 13 min så få drabbas, och det är det enda beteendet som ändras i tidtagningen. |
| **Nivåberäkning** | `nastaAdaptivaFraga`, `valjPass`, `slutfor_traningssession`, `test_nivapunkter`, kalibreringen | Rörs inte. Ramen renderar och skickar; motorn bestämmer. Därför: inget "Vet inte" i Nivåkollen (se avsnitt 8, punkt 9), för att inte ändra svarsfördelningen som kalibreringen vilar på. |
| **Appen Testklar** | Proxyn skriver om `/dashboard/tester/*` till `/app/tester/*` via tvillingfiler; appen har egna flikvyer med egen copy (`src/lib/mobilapp/vyer.ts`, `UtvecklingVy.tsx`) | Inga nya rutter i etapp 1 (samma URL:er, sidan väljer renderare), så tvillingfilerna gäller. Sessionen är redan helskärm i appen; webben får samma. Appens copy rättas i etapp 0 tillsammans med webbens. Klicktest i emulatorn Pixel_8 ingår i QA för varje etapp. Push-notiser och anonym Nivåkoll är egna beslut och berörs inte. |
| **SEO, publika prov** | `/verktyg/rekryteringstester/prova` och uppgift 1 i tolv artiklar, kontosteget med kill-regel 8 dec | Rörs inte i etapp 0 till 2. I etapp 3 kan provet ta ramens svarskomponent, med `seo-diff` som grind och utan att ändra artiklarnas HTML-struktur. |
| **Prestanda** | Budget LCP 2,0 s för flödessidor, CLS 0; verbalt och numeriskt målar skelett före första frågan i dag | Startskärm och första uppgift serverrenderade; `npm run perf:inloggat` som grind före merge per etapp. |
| **Mätning** | Admin och tratt läser `test_completed`, `pass_klart`, `nivamatning_klar` | Namn och egenskaper bevaras (4.1); grep-test i CI på att de skjuts från ramen. |
| **Black Week** | Frysen 23 till 30 nov, kampanjpriser på betalväggar | Etapp 0 före frysen eller 1 dec. Allt annat byggs på gren under frysen. Betalväggen i ramen använder `KampanjPris` så kampanjregeln följer med automatiskt. |
| **Dubbel sanning under utrullning** | Två renderare för samma typ under flaggperioden | Flaggan ligger per `test_kind` på servern (ui-flaggor eller env), gamla komponenter raderas först efter avläsningen av etapp 1b. Max två veckor med båda per typ. |

---

## 6. Etappindelning

Princip: gratisnivåns dörrar först, för det är där avhoppen är mätta och där konverteringen avgörs. Ingen big bang: samma URL:er, en serverflagga per typ, en typ i taget, gammal kod kvar tills avläsningen är gjord.

### Etapp 0: uppenbara fel (S, 1 till 2 dagar, live senast 22 nov)

Avsnitt 7. Text, en redirect, två bekräftelsedialoger. Inga nya komponenter.

### Etapp 1: ramen på gratisnivån (M till L, cirka två veckors bygge under frysen)

Innehåll: den gemensamma ramen (`PassShell` som grund för huvudet, `Startark` som startskärm, en svarsmodell, en klocka med mjuk gräns, X till vänster med bekräftelse, `TestResultsPage` som resultat, helskärm utan sidomeny) tillämpad på de **åtta nivåtesten** (grund, avancerad, expert, inklusive verbalt expert som i dag är 0 av 9) och de **fem Nivåkollerna**. Underlag (verbalt, numeriskt, deduktivt) med sticky yta och egen scroll enligt `VnUppgift`/`DeduktivLayout`, så svaren alltid syns på första skärmen på Pixel 7 och 1400×900. "Fortsätt där du var". Händelserna i 4.2.

- **1a (live 1 till 2 dec):** numeriskt och verbalt, alla nivåer. Störst mätt förlust, lägst volym, lägst risk för det som fungerar.
- **1b (live 8 till 9 dec):** figurer och mönster, figurserier, deduktivt, talserier, spatial, ordförråd, samt alla Nivåkoller. Matris sist i 1b, med vaktpunkten 90 %.

Omfattning: ramen cirka 900 rader ny kod plus en innehållsadapter per typ (frågeytorna finns redan delade: logicV7, FigurserieRad, DeduktivFraga, Uppgifter, VnUppgift). Ersätter cirka 3 400 rader nivåtest och 1 100 rader Nivåkoll när flaggan är borta.

Inte i etapp 1: Träna, övningsprov, I-provet, personlighet, publika provet.

### Etapp 2: Träna, prov och städning (M, live vecka 2 i januari)

De fem passflödena in i ramen med profilen Träna (direkt återkoppling, "Vet inte", en resultatvägg i stället för två), inställningen "Rätta efter varje uppgift" (avsnitt 3), kortkommandon i alla lägen. Övningsprov och I-prov flyttas från sina egna skal (`OvningsprovFlode`, `IprovFlode`) till ramen med profilen hård tid; de ser redan ut som målet, så det är mest kodsammanslagning, och formatvalet (Matrigma, Alva) kommer in på startskärmen så menyns löfte blir sant. Radera: legacy `*-prov`-sessioner (1 100 rader), `logicV6`, `logicV4`-rester, `verbalV1` (cirka 500 rader), de dubblerade resultatvyerna.

### Etapp 3: resten (S till M, januari till februari)

Personlighetstestet i skalet (Likert som innehåll, översiktsknappar till 44 px, egen färgskala bort), publika provet på ramens svarskomponent efter avläsningen 8 dec och med `seo-diff`, matrisens "Gör Nivåkollen först"-lås omprövat mot data, skärmläsartest på riktigt, Testklar-specifika justeringar.

### Arbetsfördelning

Mobile-ux-designer: flödet skärm för skärm (startskärm, uppgift, bekräftelse, resultat, "Fortsätt") i artefakt. Art director: skalets uttryck, klockan, stapeln, resultatväggen, inom designsystemet v2. Svensk-ux-copywriter: ordlistan (avsnitt 8, punkt 10) och startskärmens regler. Opus bygger efter specen, en typ i taget, med klicktest i riktig webbläsare (Pixel 7 och desktop, gratis- och Premiumkonto) och emulatorn för Testklar före varje push. Saas-lead granskar mot planen och äger avläsningarna.

---

## 7. Uppenbara fel att rätta direkt (etapp 0)

Fil och rad enligt dagens main. Slutlig copy går via copywritern, men felet och riktningen är given.

1. `src/lib/tester/steg2/copy.ts:39`: `${NAMN[kind]}et ingår i Premium.` ger "Träna talserieret ingår i Premium". Bygg aldrig böjning med stränginterpolation: "Träna i talserier ingår i Premium, 149 kr i månaden" via `paketMedPris`.
2. "Nivåkoll, 8 min" på kort för typer utan Nivåkoll: `src/lib/tester/v4/copy.ts:117` (`nivakollOmatt`), `src/components/tester-v4/Nivaband.tsx:28`, `src/lib/mobilapp/vyer.ts:266`. `rutter.ts:121` har redan villkoret `NIVAKOLL_FINNS`; Nivåbandet och appen ska använda samma: "Nivåtest, 15 uppgifter" där Nivåkollen saknas.
3. "Tolv uppgifter, cirka åtta minuter" för alla typer: `src/lib/tester/v4/copy.ts:99`, `src/lib/mobilapp/vyer.ts:232`, `src/components/mobilapp/UtvecklingVy.tsx:53`, `src/lib/traning/pass-copy.ts:133`. Antal och tid räknas ur Nivåkollens config per typ (matris 12, figurserier 9, verbalt 8, numeriskt 8, deduktivt 6). Samma regel för `hem-copy.ts:71/102`, `utveckling/copy.ts:20-21` och `komigang.ts:320/395` där "8 min" bara gäller matris.
4. `src/lib/tester/v4/copy.ts:101` `ovningsprovMatrisText`: "Välj format: Alva Logic eller Matrigma" lovar ett val som inte finns på startarket. Tills etapp 2: "I samma format som Matrigma eller Alva, enligt din plan inför provet."
5. `src/components/tests/verbal/VerbalTestSession.tsx:64` `TOTAL_TIME = 25 * 60` mot sidans och resultatets 20 minuter. Sätt 20 ur config, en källa. "Kan ej avgöras" i nivåtestet byts till "Går inte att avgöra" som de fyra andra ytorna.
6. "✓ 0 / 15" i `TestMeterRow` ser ut som antal rätt: skriv "0 av 15 besvarade". Verbalt räknar påståenden men visar "/ 10" passager: räkna passager.
7. Numeriskt: "Fråga 1 av 20 · Lätt" i kortet upprepar huvudet, ta bort.
8. Rubriker: "Logiktest, grundnivå" i `MatrixTestSession` (hårdkodad) blir typens namn "Figurer och mönster, grundnivå"; `Steg2TestSession` bygger "Talserier, grund" själv, ska ge "grundnivå". Samma hjälpfunktion (`src/lib/traning/rubrik.ts` finns) för alla.
9. Legacy-sluggarna `matrislogik-prov`, `verbal-resonemang-prov`, `numeriskt-test-prov`: 0 av 13 slutförda på 90 dagar. 301 till `/dashboard/tester/ovningsprov/<typ>`. Komponenterna raderas i etapp 2.
10. Bekräftelse saknas vid X i numeriskt, verbalt expert, personlighet, Nivåkoll, Träna, övningsprov och I-prov, och vid "Lämna in" i övningsprov och verbalt expert. `ConfirmDialog` finns; koppla den med en gemensam text ("Avsluta testet?" / "Lämna in med 3 obesvarade?") i alla flöden. En felklickad "Lämna in" i övningsprovet kostar dagens enda prov.
11. Em-dash i personlighetens "ÖVERSIKT — KLICKA FÖR ATT HOPPA", och översiktsknapparna 67×15 px (desktop) och 32×14 px (mobil) får min-height 44 px tills etapp 3 gör om vyn.
12. Appens tvilling av Tester-menyn (`src/lib/mobilapp/vyer.ts`) får samma rättelser som punkt 2 till 4 samtidigt, annars säger appen och webben olika saker.

Avläsning: ingen, det är sanningsrättelser. Verifiering: tsc, berörda vitest (`hemvy.test.ts:158` och `milstolpar-form.test.ts:139` förväntar i dag "8 min" och ska uppdateras), skärmdump av Tester-menyn på mobil och desktop.

---

## 8. Mina tio viktigaste ställningstaganden

Där UX-designern eller art director kan tänkas tycka annorlunda står det i kursiv.

1. **En svarsmodell: tryck markerar, knappen bekräftar, ingen auto-nästa någonstans.** *UX kan vilja behålla auto-nästa i matris för tempo; art director kan vilja ha den för spelkänsla. Mitt minimikrav om de vinner: aldrig i mätlägen, och som ramens flagga.*
2. **Etapp 1 är gratisnivån (nivåtest och Nivåkoll), inte Träna.** *Art director kan vilja börja i Träna där Duolingo-känslan ligger närmast och Premium bor. Avhoppen är mätta på gratisnivån, och det är där konverteringen avgörs.*
3. **Betalväggen bor på startskärmen och resultatsidan, aldrig i sessionen.** Tre exponeringar, en händelse, olika `plats`.
4. **Klockan är en nedräkning från utlovad tid i alla lägen, men gränsen är mjuk i nivåtest och Nivåkoll och hård bara i prov.** *UX kan vilja ta bort klockan ur nivåtesten helt. Jag vill att "15 uppgifter, 20 minuter" på startskärmen betyder något, och tempo mot provets tid är ett säljargument.*
5. **Inställningen "Rätta efter varje uppgift" finns, men bara en, bara i Träna, standard på, etapp 2.** Ingen auto-avancera-inställning, för beteendet finns inte längre.
6. **Startskärm i alla lägen, alltid med antal och tid ur config, alltid med "Fortsätt där du var".** Ingen session skapas utan att användaren tryckt Starta.
7. **Utrullning per typ bakom serverflagga på samma URL:er, numeriskt och verbalt först, matris sist, med 90 % slutförda som vaktpunkt.** Gammal kod raderas först efter avläsning.
8. **Sessionen är helskärm också på desktop; sidomenyn försvinner.** *Art director kan vilja ha varumärket kvar i vänsterkanten. Inget annat testverktyg visar en meny under ett test, och det tar fokus från uppgiften.*
9. **Inget "Vet inte" i Nivåkollen, bara i Träna.** *UX kan tycka att "Vet inte" är ärligare än gissning. Men matrisens kalibrering bygger på svar utan "Vet inte", nivåerna ska vara jämförbara mellan typer, och riktiga test har inte knappen.*
10. **Sanningen om slutförande kommer ur Supabase, PostHog mäter var i sessionen folk lämnar.** Nya händelser skjuts av ramen, aldrig av typerna, och de gamla namnen bevaras ordagrant.

Utanför de tio men beslutat i förslaget: legacy-proven och verbalt experts linjära komponent dör; resultatsidan har en fast struktur oavsett utseende; personlighetstestet och publika provet väntar till etapp 3; inga prisändringar och inga nya `test_type`.

---

## 9. Vad ägaren behöver ta ställning till

Allt ovan är beslut med insats och datum. Det enda som kräver ägarens ord:

- Att etapp 0 får gå live 21 till 22 nov, före Black Week-frysen (annars 1 dec).
- Att etapp 1a får gå live 1 till 2 dec, mitt i Black Week-avläsningen (bara numeriskt och verbalt berörs, kampanjpriserna följer med via `KampanjPris`).
- Punkt 1 och 9 ovan om UX-designern eller art director inte håller med efter sin runda; då får ägaren välja mellan våra två förslag, inte ett öppet alternativ.

# Granskning av säljytorna, saas-lead, 2026-11-15

Underlag: `inventering.md` i samma mapp, PostHog (projekt 148688, 28 dagar till och med 15 nov), Supabase `profiles` med ägare och testkonton undantagna via `admin_undantagna_konton()`, och koden på main be2c78a1. Ingen kod är ändrad. Parallellt granskar testansvarig, svensk-ux-copywriter och art-director; avgörandet fälls i nästa runda.

Mätfönstret innehåller tre förändringar som påverkar siffrorna: variantattributet på korten kom 9 till 10 nov (klick före dess står utan variant), fråga 1 i registreringen togs bort 8 nov, och PostHog på publika sidor startar först vid interaktion, så visningar är underskattade och spärr-till-konto ser bättre ut i Supabase (79 konton) än i PostHog (66). Konverteringstal under är därför riktningar, inte decimaler.

## 1. Vad datan säger om ytorna

### Trafiken går till två kluster, och bara ett av dem säljer

Artikelvisningar per kluster, 28 dagar: test 785 (40 procent), interview 694 (35 procent), letter 172, cv 150, career 125, generic 44 (2 procent).

Konton 28 dagar: 79. Av de 43 med känd landning kom 27 från testartiklar eller testsidan, 4 från CV och brev, 1 från intervjuartiklar, 3 från startsidan. Köp sedan 29 september: 9. Sju av dem landade på en testartikel, testsidan eller startsidan med valet tester; två saknar attribution. Ingen har köpt från CV-, brev- eller intervjuvägen. Sex av nio köpte samma dag som kontot skapades, en på dag 1, en på dag 5.

Betalställen för de sju köpen som PostHog har `plats` på: priser 2, testniva 1, test_tak 1, kvot 1, analys 1, matning 1. Betalväggarna i testrummet står alltså för två köp, kvoten och analysen för ett var, prissidan för två.

### Vilka kort som faktiskt klickas (article_cta_shown mot article_cta_clicked)

| Yta | Visningar | Klick | Andel | Bedömning |
|---|---|---|---|---|
| Hjälteknappen test ("Prova fem frågor gratis") | 292 | 107 | 37 % | Bäst på sajten. Rör inte. |
| ProvKort inline test (efter andra stycket) | 327 | 82 (+162 omärkta före 9 nov) | 25 % | Motorn. Hela 189 av 282 signup_started kommer från /prova dit kortet leder. |
| Sticky test (mobil) | 152 | 14 | 9 % | Fungerar. |
| Inline interview, coach ("Träna intervjufrågor") | 323 | 13 (+24 omärkta) | 4 till 11 % | Går till /verktyg/jobbcoachen som gav 0 konton. |
| Sticky interview | 215 | 0 | 0 % | Död. |
| Sidokort interview allt | 154 | 0 | 0 % | Död. |
| Sidokort test | 146 | 1 | 0,7 % | Död. |
| Inline letter, brev | 106 | 0 (+7 omärkta) | 0 till 7 % | Svag. |
| Hjälte interview | 103 | 3 | 3 % | Svag. |
| Inline career, räknare | 96 | 1 | 1 % | Avsiktligt mjuk. |
| Inline cv, mallar | 91 | 5 (+9 omärkta) | 5 till 15 % | Okej. |
| Alla sidokort tillsammans | 474 | 1 | 0,2 % | Sidokolumnen säljer ingenting. |
| Alla slutkort tillsammans (final) | 44 | 0 | 0 % | Nästan ingen når slutet av texten. |
| GratisKort (generic sidebar 17, final 4, lista 2) | 23 | 0 | 0 % | Nästan osynligt. |
| TypProvKort i fem testartiklar | 69 | 5 | 7 % | Litet men riktigt: 5 klick gick till /register. |
| TestKort i styrkor-svagheter-intervju | 6 | 0 | | För litet för att dömas. |

### Publika säljsidor, sidvisningar 28 dagar

/verktyg/rekryteringstester/prova 554 (347 personer), /register 309 (263), startsidan 108, /verktyg/rekryteringstester 71, /verktyg/jobbcoachen 45, /verktyg/cv-mallar 39, /priser 23, /artiklar 18, /funktioner 8, /exempel 2.

Provet utan konto: 372 starter, 321 slutförda, 321 spärrar, 189 klick vidare till kontosteget. Det är den enskilt största konverteringsytan på sajten med mer än tio gånger prissidans trafik.

### Betalväggarna inloggat, 28 dagar

paywall_shown 94 (24 personer), paywall_cta_clicked 16 (11 personer).

| Variant | Visningar | Klick | Köp |
|---|---|---|---|
| testniva (/dashboard/tester, /alla, /pass) | 27 | 9 (33 %) | 1 |
| test-tak (grundnivån per typ, sju sidor) | 43 | 0 (0 %) | 1 via plats test_tak, före fönstret eller via annan knapp |
| onboarding_paket (välkommen steg 3) | 14 | 5 | |
| nedladdning (brev) | 6 | 0 | |
| kvot | 1 | 1 | 1 |
| analys-omkorning | 1 | 0 | 1 (plats analys) |

Test-tak är ytan som flest gratisanvändare möter i testrummet och den enda med noll klick på 43 visningar. Den säger "Dagens omgång är gjord" och "obegränsat antal försök", lovar fel sak och säljer ingen bredd.

## 2. Ägarens hypotes om GratisKortet

Hypotesen har rätt innehåll men pekar på fel kort.

GratisKortet visas bara i generic-klustret (2 procent av artikelvisningarna) och som plats 4 i /artiklar. 23 visningar, 0 klick på 28 dagar. Att byta sista raden där påverkar i praktiken ingen. Däremot återkommer samma problem, Nivåkollen som försäljningsargument utan att testbredden syns, på exakt de ytor som bär hela försäljningen:

1. **Kontopanelen efter provet på /prova** (`KONTO_PANEL`, registrering-copy.ts:313): raderna är "Rätt svar och regeln bakom", "Genomgång av alla fem frågor", "Nivåkollen, N minuter, räknar in de här svaren", och premiumraden "när du sedan vill träna på din nivå varje dag. Först Nivåkollen, gratis." Ingenstans står att det finns 29 tester i åtta kognitiva typer plus personlighet, eller övningsprov i Matrigmas, Alvas, SHL:s och I-provets format. Det är här 321 personer i månaden bestämmer sig.
2. **ProvKort** (reklam-copy.ts:111): "Nivåkollen och första passet gratis med konto." 327 visningar och kortet som leder till /prova.
3. **KONTO_GRATIS på /register** (registrering-copy.ts:347): "Nivåkollen. Var du står i rekryteringstesterna, med genomgång av varje fråga." 309 sidvisningar.
4. **Testsidans hjälte och ProvaKort** (/verktyg/rekryteringstester page.tsx:393 och 397): "Fem frågor gratis här och Nivåkollen gratis med konto."
5. **Startsidans station Tester**: "Nivåkollen, första passet och personlighetstestet gratis".
6. **STEG1 och STEG3 i registreringen**: "Matrislogik, verbalt, numeriskt och personlighet" respektive "Alla nivåer i matrislogik, verbalt och numeriskt". Tre till fyra typer av nio.

Testbredden är det argument koden backar bäst (29 tester, nio typer, tre nivåer, övningsprov i leverantörernas format, inventeringens avsnitt C) och det argument som nästan aldrig står utskrivet på de ytor som konverterar. Jämför raden som faktiskt konverterar till köp: testniva-väggen "Premium ger alla 19 tester, alla nivåer, övningsprov mot klockan..." har 33 procent klick, trots att talet är fel (ska vara 29). Bredd säljer; Nivåkollen är ett produktnamn ingen utanför produkten känner.

Slutsats: skriv om GratisKortets rad i samma svep, men prioritera ytorna 1 till 4 ovan. Nivåkollen får gärna stå kvar som handling ("Kolla din nivå, 8 minuter") men aldrig som enda löfte.

## 3. Prioritering

Effekt uppskattad på konto till köp, ordnat efter trafik gånger avstånd till köpet.

### Ändra nu (10 ytor)

| # | Yta | Fil | Varför | Insats |
|---|---|---|---|---|
| 1 | Kontopanelen efter provet på /prova (`KONTO_PANEL` rader och premiumRad) | registrering-copy.ts:313-344 | 321 spärrar per månad, 189 går vidare. Lägg till en rad om testbredden och leverantörsformaten. Premiumraden ska bära bredden, inte "Först Nivåkollen". | S |
| 2 | ProvKort text och paketrad (`INLINE_PROVA`, `INLINE.test.paketrad`) | reklam-copy.ts:69, 111 | 327 visningar, matar yta 1. "Nivåkollen och första passet gratis med konto" byts mot bredd. | S |
| 3 | Intervjuklustrets inline och sticky | ArtikelReklam InlineKort coach, StickyMobileCTA interview, SIDO.allt | 694 visningar, 1 konto, 0 köp. Coachen säljer inte. Ge intervjuartiklarna ProvKort/TestKort-vinkeln (TESTKORT_INTERVJU finns redan) som standard inline och sticky "Prova fem frågor gratis". Mät mot nuläget fyra veckor. | S till M |
| 4 | `KONTO_GRATIS` på /register | registrering-copy.ts:347 | 309 sidvisningar, 263 personer. Första raden ska säga rekryteringstesterna i bredd, med Nivåkollen som startpunkt. | S |
| 5 | PaywallCard test-tak | paywall-copy.ts | 43 visningar, 0 klick, lovar "obegränsat" (regelbrott) och säger inget om bredden. Skriv om med samma bredd som testniva. | S |
| 6 | PaywallCard testniva | paywall-copy.ts | Ytan som faktiskt konverterar (33 procent). Rätta "19 tester" till 29 och nämn leverantörsformaten. | S |
| 7 | Testsidans hjälte, ProvaKort och PremiumBlock | /verktyg/rekryteringstester/page.tsx:393, 397, 632, 730 | 71 visningar men 41 konton i P1 när korten pekade dit; sekundärlänken "Se alla tester och nivåer" leder hit igen. Stryk "Samma frågebank som i det skarpa testet" (löfte vi inte kan backa). Bredd i hjälten. | S |
| 8 | STEG1 tester och STEG3 tester | registrering-copy.ts:45-48, 230-240 | Säger tre till fyra typer av nio till alla som registrerar sig. Faktafel på köpsteget. | S |
| 9 | Startsidans station Tester och FAQ | Startsidan.tsx | 108 visningar, 3 konton, 1 köp (valet tester). Bredd i stationstexten. | S |
| 10 | GratisKort sista raden | reklam-copy.ts:253-266 | Ägarens ursprungliga fynd. Låg trafik, men samma princip och billigt. | S |

### Rätta bara fel, ingen ny säljvinkel

ListaSlutKort "Läs klart. gör sedan." (versal). ForslagSteg intervjuvalets rubrik "Var förberedd på testdagen" (kopierad från tester). paket-copy.ts:257 "samma fyra typer" och prisjämförelsen på /priser (23 visningar, 2 köp via plats priser, så sidan ska vara rätt men behöver ingen ny vinkel). ExempelCTABand "Ett brev om dagen och en CV-analys var tredje dag" (/exempel 2 visningar, men osant). Mittpunkter i löptext. "Fråga jobbcoachen" med litet j i kalkylatorerna. TypProvKort talserie/spatial/ordförråd säger "nivåtestet", deduktiv säger "Nivåkollen": ett ord.

### Lämna

Hjälteknappen test (37 procent). Sticky test. TypProvKort (rätt riktning, liten volym, mät vidare). Sidokorten: 474 visningar, 1 klick, men de kostar ingenting och bär intern länkkraft; om art-director vill göra något av sidokolumnen är det ett designbeslut, inte en copyfråga. Slutkorten: ingen når dem, rätta bara felen. Brev- och CV-inline: svaga men små, och CV- och brevvägen har gett 0 köp på två månader, så ingen ändring betalar sig förrän testvägen är uttömd. Bli upptäckt, LinkedIn, jobbmatchning: inga visningar att tala om.

## 4. Black Week 23 till 29 november och Cyber Monday 30 november

Vad som når kampanjpriset i dag: KampanjRadPublik på alla publika sidor, PremiumBlock (startsidan, verktygssidor, slutkorten), SidoPaketKort, ProvKort och InlineKort via MedKampanjPris, /priser, köpsteget valj-spar, ForslagSteg, KampanjRadInloggad, ProvTypSida inloggat.

Vad som inte når det, och som är ytorna köpen kommer från:

1. **PaywallCard**, alla varianter (paywall-copy.ts har ingen kampanjkoppling, inte heller `src/components/paywall/`). Under Black Week säger väggen "Köp Premium, 149 kr i månaden" och köpsteget ett klick senare "99 kr första månaden". Fyra av sju mätta köp kom från en betalvägg (testniva, test_tak, kvot, analys). Det här är den viktigaste kampanjluckan. Insats S: samma `KampanjVarianter`-mönster som PremiumBlock, eller läs aktiv kampanj på servern i dashboard-layouten och skicka ner.
2. **KONTO_PANEL på /prova** premiumraden: hårdkodad `prisPeriod(SALD_PLAN)`. 321 personer i månaden ser den. Kampanjpriset ska stå där under veckan.
3. **KONTO_GRATIS på /register** premiumraden: samma.
4. **Testrummets ImorgonKort och planens betalvägg** ("Månaden täcker hela vägen"): ingen kampanj i src/app/dashboard/tester förutom prov/[token].

`copy.kortText` renderas aldrig. Jag rekommenderar inget nytt kampanjkort; ett kort till på de publika sidorna hade konkurrerat med ProvKort som fungerar. Men texten i kortText ("Övningsprov med tid och ett pass om dagen fram till provet. Sedan 149 kr i månaden.") är den bästa säljraden vi har skrivit om testerna, för den beskriver vad man får i stället för produktnamn. Använd den som kampanjens underrad i PaywallCard testniva och test-tak och på KONTO_PANEL under veckan, så får nyckeln ett jobb. Cyber Monday-varianten täcker CV och brev också, passar kvot- och analysväggarna.

Livscykelmejlen campaign-kampanj.ts (D5) är inte inventerade och skickas på kampanjens första dag. De bör läsas av copywritern före 23 nov, med samma krav: bredd, inte Nivåkollen.

Priserna och datumen är ägarens och rörs inte.

## 5. Oanvända komponenter (D3)

Kontroll med grep över src, tester undantagna: CrossLinkCTA, exempel-shared/FinalCTA, NumericalStartCTA, VerbalStartCTA, rewards/ActivationModal, pricing/JamforelseTabell, PremiumNavbar (plus backup), FeatureMorphingCard, LiveAIDemo, PersonalizedUserJourney, StaticFeatureCard, InteractiveFunctionExplorer och CVGenerationModal importeras ingenstans. CompleteApplicationPackage importeras av AnsokanPar.tsx som importeras av ExempelMall.tsx, så den är i bruk och ska stå kvar i listan som fel.

Rekommendation: radera de tretton i ett eget städsteg efter denna omgång, inte i samma commit som copyändringarna. Skäl: de innehåller gammal säljcopy (trial, "7 dagar gratis", gamla kvoter, Sparkles-risk) som dyker upp i grep och i copywriterns sökningar och gör varje framtida sanningskontroll långsammare. Inget av dem har mätdata eftersom de inte renderas. Gör det med tsc och de 490 testerna som grind, och kör seo-diff om någon av dem råkar vara en server-komponent på en publik sida (ingen av dem är det enligt importkontrollen). Samma städsteg tar oanvända copynycklar i D4, utom `kortText` som får ett jobb enligt avsnitt 4, och `INLINE.test` som fortfarande används för paketraden på ProvKort och ska behållas.

## 6. Mätning att lägga till i samma omgång

- `KONTO_PANEL` och `KONTO_GRATIS` saknar visningshändelse utöver signup_gate_shown; lägg `variant` på signup_started från /prova så vi kan läsa effekten av ny copy mot gammal (datum räcker annars, eftersom allt deployas samtidigt).
- Sticky interview: 215 visningar och noll klick kan vara ett mätfel (sticky test har 14). Verifiera i riktig webbläsare att knappen på intervjuartiklar faktiskt syns och bär data-cta-klick innan vi dömer ut den.
- `plats=matning` på ett köp 15 nov är inte ett platsvärde i BetalvaggPlats-listan så vitt inventeringen visar; kontrollera var det skrivs så att köpliggaren i adminen får rätt plats.
- Avläsning av hela omgången: fyra veckor efter deploy, tidigast 20 december, med Black Week och Cyber Monday som egen period i rapporten.

## 7. Sammanfattning för avgörandet

Testvägen är hela försäljningen: 7 av 9 köp, 27 av 43 attribuerade konton, och provet på /prova är den största ytan med mer än tio gånger prissidans trafik. Ägarens hypotes stämmer i sak men gäller kontopanelen efter provet, ProvKort och /register, inte GratisKortet som 23 personer såg. Intervjuklustret är 35 procent av trafiken och säljer ingenting, så det ska få testvinkeln. Betalväggarna är blinda för Black Week trots att de står för flest köp. Rätta de åtta faktafelen, lämna hjälteknappen och allt som fungerar, radera de tretton döda komponenterna separat.

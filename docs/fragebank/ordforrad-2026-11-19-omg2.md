# Ordförråd omgång 2: 103 nya uppgifter (bankversion 3, inte aktiverad)

Datum 2026-11-19. Uppgifterna ligger sist i `src/lib/ordforradV1/bankGrund.json`, `bankAvancerad.json` och `bankExpert.json` med `fran_version: 3`. `ORD_VERSION` i `select.ts` står kvar på 2, så ingen session drar dem förrän version 3 aktiveras. Version 1 och 2 är orörda: diffen mot bankfilerna består bara av tillagda rader.

## Antal per nivå och typ

| Nivå | Synonymer | Motsatsord | Nya | Pool i version 2 | Pool i version 3 |
|---|---|---|---|---|---|
| Grund | 19 (substantiv 7, verb 5, adjektiv 4, adverb 3) | 16 (adjektiv 6, adverb 6, substantiv 3, verb 1) | 35 | 128 | 163 |
| Avancerad | 18 (adjektiv 7, substantiv 6, verb 5) | 16 (adjektiv 8, substantiv 8) | 34 | 137 | 171 |
| Expert | 22 (adjektiv 11, verb 6, substantiv 5) | 12 (substantiv 6, adjektiv 5, verb 1) | 34 | 87 | 121 |

Expert får tolv nya motsatsord och går från 12 till 24. Det var den tunnaste delen av banken.

Svårighet: samma frekvensband som tidigare omgångar, mätt på uppslagsordet med SO:s popularitetstal (grund minst 30 000, avancerad minst 500, expert mellan 50 och 300 000). Inom banden flyttade vi för hand där ordet kändes fel för nivån. Empati, innovativ, analog och amatörmässig hamnade på avancerad i stället för expert, och konsekvent ströks från expert eftersom ordet är för vanligt.

Arbetslivsord och ord som brukar finnas i rekryteringstester: kollega, förmåga, resultat, kompetens, befattning, arvode, rekrytera, samordna, effektiv, lojal, självständig, beslutsam, initiativrik, handledare, underrätta, intern, underordnad, debet, skuld, högkonjunktur, konsument, implementera, facilitera, kontinuerlig, konsultera, proaktiv, integritet, nepotism, prestige, renommé, aktiva, hausse och nominell.

## Hur uppgifterna togs fram

1. **Handskrivna kandidater**, `src/lib/ordforradV1/kandidater/hand-2026-11-19-omg2.json`: ord, ordklass, facit, fyra distraktorer och en exempelmening. Inga distraktorer fylls i automatiskt.
2. **Bygget**, `scripts/ordforrad/bygg-v3.mjs`. Det är en kopia av `bygg-v2.mjs` med skärpta regler efter granskningen av omgång 1. Varje ord slås upp i SO och SAOL via svenska.se:s sök-API, i svenska Wiktionary och på synonymer.se (`scripts/ordforrad/so.mjs`, cachat). En kandidat avvisas hel om något faller och skrivs då om för hand. Reglerna från version 2 gäller, plus de här:
   * Varken uppslagsord eller facit får redan finnas i banken som uppslagsord eller facit. Det gäller också artikelfigurerna och de andra nya kandidaterna.
   * Alla fyra distraktorer är ord ur samma fält (`samma_falt`). Omgången har inga motsats- eller synonymdistraktorer, så det finns inga märkningar som kan bli fel.
   * Ingen distraktor får vara synonym, motsats eller SO "jämför" till uppslagsordet i någon av de fyra källorna. Ingen får heller vara synonym eller motsats till facit.
   * Facit och varje distraktor ska finnas i SO eller SAOL i rätt ordklass, utan stilmarkering och med en definition (den blir misstagstexten).
   * Ett ord får vara alternativ högst två gånger per nivå, räknat på hela banken (OF7).
3. **Avvisat på vägen**: drygt 500 kärnpar (ord och facit) prövades med `--karna` och ungefär 380 föll. Många föll för att ordet redan fanns i banken (varm, stänga, explicit, homogen). Resten föll främst på
   * facit som bara synonymer.se har (möte och sammanträde, duktig och skicklig, delegera och överlåta, konsensus och samförstånd)
   * facit som SO bara har som "jämför" (kund och klient, chef och ledare, revidera och omarbeta)
   * stilmarkering (jobb, passiv, obsolet, pejorativ)
   * samma stam (arbetsgivare och arbetstagare, lönsam och olönsam).

   I första körningen med distraktorer föll 50 av 103 kandidater, de flesta på OF7 eller på distraktorer som saknar definition i SO. Alla skrevs om.
4. **Läst för hand**: varje uppgift lästes med facit, facittext, misstagstexter och exempel.
   * 21 facittexter är handskrivna eftersom SO:s första betydelse av facit inte passar exemplet. Utfall gav till exempel "häftigt verbalt angrepp", rykte gav "nyhet från osäker källa", sporra gav "driva på (häst) med sporrar", neka gav "hävda avsaknad av sanning", befästa gav "bygga försvarsanläggningar för" och matt gav "som saknar normal kraft". De står i `HANDSKRIVET` i `bygg-v3.mjs` och gäller nästan, resultat, åsikt, möjlighet, lämplig, plus, inne, stiga, blank, arvode, vägra, uppmuntra, empati, handledare, initiativrik, debet, skuld, konsolidera, renommé, preferens och nominell. Alla andra facittexter är SO:s eller SAOL:s egen text.
   * Elva distraktorer byttes. Tio gav en vilseledande misstagstext eller låg för nära ordet: motionera (riksdagsmotion), dokumentera två gånger ("styrka"), befordran ("förflyttning"), portfölj (väska), notering (anteckning), omsättning, revision, framme och solvarv. Rinna låg för nära sjunka ("förflyttas nedåt"). Dessutom fick levande och död distraktorn halt i stället för sjuk.
   * Två exempel skrevs om. Anspråkslös gäller nu en person ("talar sällan om sina framgångar") så att blygsam passar, och makrokosmos står nu i en mening där ordet betyder något.

## Källkontroller

Beläggen står i fältet `kalla` på varje uppgift: källa, beläggstext, SO:s lemma-id och datumet 2026-11-19. Första belägget per uppgift står i id-listan nedan.

| Belagt mot | Uppgifter |
|---|---|
| SAOL | 34 |
| SO | 29 |
| SO och SAOL | 11 |
| SO och Wiktionary (SO "jämför" plus Wiktionary synonym) | 3 |
| Wiktionary och synonymer.se (SO och SAOL saknar uppgiften) | 26 |

De 26 med två oberoende källor är nästan alla vanliga motsatspar där SO saknar MOTSATS-hänvisning: köpare och säljare, plus och minus, uppåt och nedåt, ny och begagnad, överst och underst, stiga och sjunka, levande och död, hungrig och mätt, natt och dag, inåt och utåt, kvinnlig och manlig, ihop och isär, lokal och global, underordnad och överordnad, skuld och fordran, analog och digital, högkonjunktur och lågkonjunktur, kvantitet och kvalitet, makrokosmos och mikrokosmos, utopi och dystopi samt zenit och nadir. Dit hör också fem synonympar: trevlig och angenäm, rekrytera och värva, konsolidera och befästa, essentiell och grundläggande samt kompatibel och förenlig.

Tre synonympar har SO "jämför" plus Wiktionary: dessutom och därtill, känd och berömd samt självständig och oberoende.

Fyra motsatsord är belagda i två steg inom SO:

* lugn och nervös: nervös förklaras med orolig, och orolig är motsats till lugn
* legal och olaglig: olaglig förklaras med illegal, och illegal är motsats till legal
* plikt och rättighet: plikt förklaras med skyldighet, och skyldighet är motsats till rättighet
* summarisk och utförlig: summarisk förklaras med kortfattad, och kortfattad är motsats till utförlig.

Varje distraktor finns i SO eller SAOL i samma ordklass och har en definition där, och den definitionen är misstagstexten.

## Verifieringen

* `node scripts/ordforrad/bygg-v3.mjs --torr`: 103 kandidater, 103 godkända, 0 avvisade.
* `node scripts/ordforrad-verifiera.mjs`: 455 uppgifter, 0 fel. Version 3 rapporteras som "INTE aktiverad (ORD_VERSION är 2)". Version 3 ger inga anmärkningar om falska vänner.
* `node scripts/ordforrad-verifiera.mjs --natet --fran 3`: 0 fel. `--natet` från version 2: 0 fel.
* `node scripts/validate-ordforrad.mjs` (OF1 till OF8 på alla 455): grön.
* `node scripts/artikel-steg2-check.mjs`: grön.
* vitest med `--exclude ".claude/**"` är grön i `src/lib/ordforradV1` (spärrarna, version2 och nya `version3.test.ts`), `src/lib/tester`, `src/lib/traningsmejl`, `src/components` och figurseriernas frågetest.
* `npx tsc --noEmit -p .`: inga fel i ordförrådets filer.

En testrad ändrades. `version2.test.ts` krävde att allt efter första version 2-raden var version 2. Nu krävs version 2 eller senare, eftersom version 3 ligger sist.

## Anmärkningar till granskningen

* **Facit under nivåns frekvens.** Banden mäter uppslagsordet, inte facit. På grund är angenäm (7 141), olikhet (10 378), berömd (13 885), modifiera (14 921) och erfara (21 558) ovanligare än uppslagsordet. Uppgifterna går att lösa genom uteslutning, men angenäm och erfara är de svagaste på grund.
* **Fackord på expert.** Hausse och baisse, zenit och nadir, makrokosmos och mikrokosmos samt endogen och exogen är tydliga motsatspar men hör hemma i ekonomi, astronomi och medicin. Vi valde dem för att expert behövde fler motsatsord. Läs av andel rätt efter 30 dagar.
* **Vardagliga ord på expert.** Integritet (130 438), syntes (146 059) och kapabel (59 811) ligger högt i bandet. De står kvar eftersom det är den svåra betydelsen som prövas: okränkbarhet, motsatsen till analys och duglig.
* **Lätta par på grund.** Natt och dag samt plus och minus är medvetet lätta, så att grund får några säkra uppgifter.
* **Debet och kredit** på avancerad. Paret är vanligt i ekonomijobb men ovanligt annars. Det kan flyttas till expert om andelen rätt blir låg.
* **Belägg från Wiktionary och synonymer.se.** 26 uppgifter vilar på de två källorna. Precis som i omgång 1 kan Wiktionary-relationen ligga på bara ena sidan, alltså att ena ordet listar det andra men inte tvärtom.

## Åtgärdat efter granskningen (2026-11-19)

Testansvarig godkände med villkor (`ordforrad-2026-11-19-omg2-granskning.md`). Alla 19 rättelser är gjorda i kandidatfilen och i `HANDSKRIVET` och `MISSTAG` i `bygg-v3.mjs`. Ingen uppgift ströks och inget facit ändrades, så id, ord och facit är desamma som före rättelserna.

* Distraktorer: lam blev hes (levande), bostadsbrist blev födelsetal (invandring), spekulativ blev produktiv (deduktiv), periodisk blev heterogen (endogen) och pratglad blev högerhänt (kvinnlig). Granskningen föreslog vänsterhänt, men det ordet är fem bokstäver längre än manlig och fäller OF4. Högerhänt har samma funktion och ryms.
* Exempel: uppleva, underordnad, kompatibel, preferens och zenit. Underordnad och preferens fick också ny facittext (högre i en hierarki, rätt att komma i fråga i första hand).
* Facit- och misstagstexter: förmåga, dessutom, köpare, lugn, innovativ, invandring och deduktiv fick nya facittexter. Också, bidrag, fluktuera och extrapolera fick nya misstagstexter.
* Granskningens frivilliga förslag för isär och rättighet är också gjorda ("så att delarna skiljs åt", "det man har rätt till").
* Kontroller efter rättelserna: bygget 103 av 103 godkända med samma id, verifieraren med `--natet --fran 3` 0 fel, validate-ordforrad grön, artikel-steg2-check grön och vitest grön i ordförrådet, tester, träningsmejl och figurserier.

## Så aktiveras version 3

1. Rätta eller stryk enligt granskningen. Ändra raden i `kandidater/hand-2026-11-19-omg2.json` och kör `node scripts/ordforrad/bygg-v3.mjs --torr`, sedan utan `--torr`. Bygget ersätter bara version 3-raderna och skriver avvisade till `kandidater/avvisade-2026-11-19-omg2.json`. Id-numren läggs om i följd vid varje körning, så stryk före aktivering och inte efter. Handskrivna facittexter och misstagstexter läggs i `HANDSKRIVET` och `MISSTAG` i `bygg-v3.mjs`.
2. Sätt `ORD_VERSION = 3` i `src/lib/ordforradV1/select.ts`. Nya sessioner får `ord_version: 3` i meta och drar ur den större poolen. Sessioner med version 1 och 2 drar exakt samma uppgifter som förut, eftersom `poolFor` filtrerar på `fran_version`.
3. Uppdatera testerna:
   * `version3.test.ts`: `ORD_VERSION` ska vara 3, och testet "inlagd men inte aktiverad" vänds så att version 3 ingår i `poolFor(n)`. Siffrorna i `ordforradAntal()` blir grund 86/77, avancerad 95/76 och expert 97/24.
   * `version2.test.ts`: testet "version 2 är aktiverad" kräver att `ORD_VERSION` är 2 och kontrollerar version 2-siffrorna. Byt till `poolFor(n, 2)` och siffrorna ovan, eller flytta kontrollen till `version3.test.ts`.
4. Kör `node scripts/ordforrad-verifiera.mjs --natet`, `node scripts/validate-ordforrad.mjs`, `node scripts/artikel-steg2-check.mjs` och `npx vitest run src/lib/ordforradV1 src/lib/tester --exclude ".claude/**"`.
5. Till changelogen: percentilen i "Var du står" blandar version 1, 2 och 3. Artiklarnas uppgift 1 kan i upp till ett dygn (CDN-cache) skilja sig från det nystartade provet, precis som vid version 2.

## Filer

* `scripts/ordforrad/bygg-v3.mjs` (nytt)
* `src/lib/ordforradV1/kandidater/hand-2026-11-19-omg2.json` (nytt, kandidaterna)
* `src/lib/ordforradV1/kandidater/avvisade-2026-11-19-omg2.json` (nytt, tom lista efter sista körningen)
* `src/lib/ordforradV1/bankGrund.json`, `bankAvancerad.json`, `bankExpert.json` (version 3-raderna sist)
* `src/lib/ordforradV1/__tests__/version3.test.ts` (nytt) och `version2.test.ts` (en rad ändrad)

## Id-lista

**Grund, synonymer**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-g-s-68 | kollega | arbetskamrat | SO kollega: förklaras med arbetskamrat ("arbetskamrat") |
| of-g-s-69 | förmåga | kapacitet | SAOL förmåga: förklaras med kapacitet ("duglighet, kapacitet") |
| of-g-s-70 | trevlig | angenäm | Wiktionary: trevlig och angenäm listas som synonymer |
| of-g-s-71 | nästan | nästintill | SO nästintill: förklaras med nästan ("") |
| of-g-s-72 | ändå | likväl | SO ändå: synonym likväl |
| of-g-s-73 | dessutom | därtill | SO dessutom: jämför därtill |
| of-g-s-74 | början | inledning | SAOL inledning: förklaras med början ("start, början; första del särsk. av bok") |
| of-g-s-75 | resultat | utfall | SAOL utfall: förklaras med resultat ("resultat") |
| of-g-s-76 | rätta | korrigera | SO rätta: synonym korrigera |
| of-g-s-77 | åsikt | uppfattning | SO åsikt: synonym uppfattning |
| of-g-s-78 | ordna | arrangera | SO arrangera: förklaras med ordna ("") |
| of-g-s-79 | ändra | modifiera | SAOL modifiera: förklaras med ändra ("jämka på, ändra; mildra") |
| of-g-s-80 | populär | omtyckt | SO omtyckt: synonym populär |
| of-g-s-81 | känd | berömd | SO känd: jämför berömd |
| of-g-s-82 | uppleva | erfara | SAOL uppleva: förklaras med erfara ("vara med om, erfara") |
| of-g-s-83 | skillnad | olikhet | SO skillnad: synonym olikhet |
| of-g-s-84 | möjlighet | chans | SO möjlighet: förklaras med chans ("") |
| of-g-s-85 | lämplig | passande | SAOL lämplig: förklaras med passande ("passande, tjänlig") |
| of-g-s-86 | påbörja | inleda | SAOL inleda: förklaras med påbörja ("påbörja, starta") |

**Grund, motsatsord**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-g-m-62 | köpare | säljare | Wiktionary: köpare och säljare listas som motsatsord |
| of-g-m-63 | plus | minus | Wiktionary: plus och minus listas som motsatsord |
| of-g-m-64 | uppåt | nedåt | Wiktionary: uppåt och nedåt listas som motsatsord |
| of-g-m-65 | inne | ute | SO inne: motsats ute |
| of-g-m-66 | ny | begagnad | Wiktionary: ny och begagnad listas som motsatsord |
| of-g-m-67 | lugn | nervös | SO nervös: synonym eller förklaring orolig |
| of-g-m-68 | mycket | lite | SO mycket: motsats lite |
| of-g-m-69 | överst | underst | Wiktionary: överst och underst listas som motsatsord |
| of-g-m-70 | stiga | sjunka | Wiktionary: stiga och sjunka listas som motsatsord |
| of-g-m-71 | blank | matt | SO blank: motsats matt |
| of-g-m-72 | levande | död | Wiktionary: levande och död listas som motsatsord |
| of-g-m-73 | hungrig | mätt | Wiktionary: hungrig och mätt listas som motsatsord |
| of-g-m-74 | natt | dag | Wiktionary: natt och dag listas som motsatsord |
| of-g-m-75 | inåt | utåt | Wiktionary: inåt och utåt listas som motsatsord |
| of-g-m-76 | kvinnlig | manlig | Wiktionary: kvinnlig och manlig listas som motsatsord |
| of-g-m-77 | ihop | isär | Wiktionary: ihop och isär listas som motsatsord |

**Avancerad, synonymer**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-a-s-78 | kompetens | behörighet | SAOL kompetens: förklaras med behörighet ("tillräcklig skicklighet; behörighet") |
| of-a-s-79 | befattning | tjänst | SAOL befattning: förklaras med tjänst ("tjänst, arbete") |
| of-a-s-80 | arvode | ersättning | SAOL ersättning: förklaras med arvode ("lön, arvode") |
| of-a-s-81 | rekrytera | värva | Wiktionary: rekrytera och värva listas som synonymer |
| of-a-s-82 | samordna | koordinera | SO samordna: synonym koordinera |
| of-a-s-83 | effektiv | verkningsfull | SAOL effektiv: förklaras med verkningsfull ("verkningsfull; verksam; dugande") |
| of-a-s-84 | lojal | trogen | SAOL trogen: förklaras med lojal ("som inte sviker, lojal") |
| of-a-s-85 | självständig | oberoende | SO självständig: jämför oberoende |
| of-a-s-86 | beslutsam | resolut | SAOL resolut: förklaras med beslutsam ("beslutsam, rask") |
| of-a-s-87 | anspråkslös | blygsam | SAOL anspråkslös: förklaras med blygsam ("blygsam, modest") |
| of-a-s-88 | underrätta | informera | SAOL underrätta: förklaras med informera ("informera, meddela") |
| of-a-s-89 | vägra | neka | SAOL neka: förklaras med vägra ("vägra") |
| of-a-s-90 | uppmuntra | sporra | SAOL uppmuntra: förklaras med sporra ("sporra, egga") |
| of-a-s-91 | avsikt | uppsåt | SAOL uppsåt: förklaras med avsikt ("avsikt, föresats") |
| of-a-s-92 | empati | inlevelse | SO empati: förklaras med inlevelse ("(förmåga till) inlevelse") |
| of-a-s-93 | innovativ | nyskapande | SAOL innovativ: förklaras med nyskapande ("nytänkande; nyskapande") |
| of-a-s-94 | handledare | mentor | SAOL mentor: förklaras med handledare ("handledare, uppfostrare") |
| of-a-s-95 | initiativrik | företagsam | SAOL företagsam: förklaras med initiativrik ("initiativrik, framåt") |

**Avancerad, motsatsord**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-a-m-61 | intern | extern | SO intern: motsats extern |
| of-a-m-62 | lokal | global | Wiktionary: lokal och global listas som motsatsord |
| of-a-m-63 | debet | kredit | SO debet: motsats kredit |
| of-a-m-64 | underordnad | överordnad | Wiktionary: underordnad och överordnad listas som motsatsord |
| of-a-m-65 | skuld | fordran | Wiktionary: skuld och fordran listas som motsatsord |
| of-a-m-66 | legal | olaglig | SO olaglig: synonym eller förklaring illegal |
| of-a-m-67 | vertikal | horisontell | SO vertikal: motsats horisontell |
| of-a-m-68 | invandring | utvandring | SO invandring: motsats utvandring |
| of-a-m-69 | plikt | rättighet | SO plikt: synonym eller förklaring skyldighet |
| of-a-m-70 | analog | digital | Wiktionary: analog och digital listas som motsatsord |
| of-a-m-71 | amatörmässig | professionell | SO amatörmässig: motsats professionell |
| of-a-m-72 | maximum | minimum | SO maximum: motsats minimum |
| of-a-m-73 | partiell | total | SO partiell: motsats total |
| of-a-m-74 | högkonjunktur | lågkonjunktur | Wiktionary: högkonjunktur och lågkonjunktur listas som motsatsord |
| of-a-m-75 | kvantitet | kvalitet | Wiktionary: kvantitet och kvalitet listas som motsatsord |
| of-a-m-76 | konsument | producent | SO konsument: motsats producent |

**Expert, synonymer**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-e-s-76 | implementera | genomföra | SAOL implementera: förklaras med genomföra ("förverkliga, genomföra") |
| of-e-s-77 | facilitera | underlätta | SAOL facilitera: förklaras med underlätta ("underlätta el. möjliggöra process, grupputveckling m.m.") |
| of-e-s-78 | legitim | laglig | SO legitim: synonym laglig |
| of-e-s-79 | kontinuerlig | fortlöpande | SO kontinuerlig: synonym fortlöpande |
| of-e-s-80 | konsolidera | befästa | Wiktionary: konsolidera och befästa listas som synonymer |
| of-e-s-81 | essentiell | grundläggande | Wiktionary: essentiell och grundläggande listas som synonymer |
| of-e-s-82 | konfiskera | beslagta | SAOL konfiskera: förklaras med beslagta ("beslagta, dra in till staten") |
| of-e-s-83 | prestige | anseende | SAOL prestige: förklaras med anseende ("anseende, inflytande, status") |
| of-e-s-84 | renommé | rykte | SO renommé: förklaras med rykte ("(gott) rykte") |
| of-e-s-85 | emanera | härröra | SAOL emanera: förklaras med härröra ("utgå, härröra") |
| of-e-s-86 | kapabel | duglig | SAOL kapabel: förklaras med duglig ("i stånd till ngt, duglig, skicklig") |
| of-e-s-87 | transparent | genomskinlig | SO transparent: förklaras med genomskinlig ("genomskinlig") |
| of-e-s-88 | kategorisk | ovillkorlig | SAOL kategorisk: förklaras med ovillkorlig ("bestämd, ovillkorlig") |
| of-e-s-89 | vederbörlig | tillbörlig | SO vederbörlig: förklaras med tillbörlig ("") |
| of-e-s-90 | kompatibel | förenlig | Wiktionary: kompatibel och förenlig listas som synonymer |
| of-e-s-91 | preferens | företräde | SAOL preferens: förklaras med företräde ("företräde, förmånsrätt; böjelse, sympati") |
| of-e-s-92 | nepotism | svågerpolitik | SO nepotism: synonym svågerpolitik |
| of-e-s-93 | kontroversiell | omstridd | SAOL kontroversiell: förklaras med omstridd ("som vållar tvist, omtvistad, omstridd") |
| of-e-s-94 | diskret | taktfull | SAOL diskret: förklaras med taktfull ("taktfull, finkänslig") |
| of-e-s-95 | integritet | okränkbarhet | SAOL integritet: förklaras med okränkbarhet ("orubbat tillstånd; okränkbarhet; oberoende") |
| of-e-s-96 | konsultera | rådfråga | SAOL konsultera: förklaras med rådfråga ("rådfråga; rådgöra") |
| of-e-s-97 | proaktiv | förutseende | SAOL proaktiv: förklaras med förutseende ("förebyggande, förutseende") |

**Expert, motsatsord**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-e-m-13 | deduktiv | induktiv | SO deduktiv: motsats induktiv |
| of-e-m-14 | makrokosmos | mikrokosmos | Wiktionary: makrokosmos och mikrokosmos listas som motsatsord |
| of-e-m-15 | endogen | exogen | SO endogen: motsats exogen |
| of-e-m-16 | syntes | analys | SO syntes: motsats analys |
| of-e-m-17 | hausse | baisse | SO hausse: motsats baisse |
| of-e-m-18 | nominell | reell | SO nominell: motsats reell |
| of-e-m-19 | konvergera | divergera | SO konvergera: motsats divergera |
| of-e-m-20 | utopi | dystopi | Wiktionary: utopi och dystopi listas som motsatsord |
| of-e-m-21 | zenit | nadir | Wiktionary: zenit och nadir listas som motsatsord |
| of-e-m-22 | aktiva | passiva | SO aktiva: motsats passiva |
| of-e-m-23 | mikroskopisk | makroskopisk | SO mikroskopisk: motsats makroskopisk |
| of-e-m-24 | summarisk | utförlig | SO summarisk: synonym eller förklaring kortfattad |

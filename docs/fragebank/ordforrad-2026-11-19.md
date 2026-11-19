# Ordförråd: 101 nya uppgifter (bankversion 2, aktiverad)

Datum 2026-11-19. Uppgifterna ligger sist i `src/lib/ordforradV1/bankGrund.json`, `bankAvancerad.json` och `bankExpert.json` med `fran_version: 2`. Testansvarig godkände med villkor (`ordforrad-2026-11-19-granskning.md`). Rättelserna är gjorda och `ORD_VERSION` i `select.ts` är 2 sedan 2026-11-19. Version 1 drar samma uppgifter som förut; fyra live-fel i version 1 är rättade på plats (se nedan).

## Antal per nivå och typ

| Nivå | Synonymer | Motsatsord | Nya | Pool i version 1 | Pool i version 2 |
|---|---|---|---|---|---|
| Grund | 19 (adjektiv 6, verb 6, substantiv 5, adverb 2) | 18 (adjektiv 7, verb 3, substantiv 6, adverb 2) | 37 | 91 | 128 |
| Avancerad | 22 (adjektiv 7, verb 11, substantiv 4) | 16 (adjektiv 9, verb 2, substantiv 5) | 38 | 99 | 137 |
| Expert | 21 (adjektiv 17, verb 2, substantiv 2) | 5 (adjektiv 4, substantiv 1) | 26 | 61 | 87 |

Fördelningen följer dagens bank (91, 99, 61): grund och avancerad får ungefär lika många synonymer som motsatsord, expert mest synonymer eftersom svåra ord sällan har ett entydigt motsatsord (ägarens beslut 2026-11-09). Expert får ändå fem nya motsatsord, från 7 till 12.

Svårighet: grundorden ligger i SO:s frekvensband för vanliga ord (popularitet minst 30 000), avancerad minst 500, expert mellan 50 och 300 000. Samma band som bygget av version 1.

## Hur uppgifterna togs fram

1. **Handskrivna kandidater**, `src/lib/ordforradV1/kandidater/hand-2026-11-19.json`: ord, ordklass, facit, fyra distraktorer i samma ordklass och en exempelmening. Inga distraktorer fylls i automatiskt.
2. **Bygget**, `scripts/ordforrad/bygg-v2.mjs` (nytt, samma regler som `bygg-bank.mjs`). Varje ord slås upp i Svensk ordbok och SAOL via svenska.se:s sök-API, i svenska Wiktionary och på synonymer.se (`scripts/ordforrad/so.mjs`, cachat). En kandidat avvisas hel om något faller och skrevs då om för hand:
   * facit ska vara belagt i SO eller SAOL (SYN, MOTSATS eller ordet ensamt i definitionen), annars i både Wiktionary och synonymer.se
   * ord och facit utan stilmarkering (vard., åld., nedsätt.) och i nivåns frekvensband
   * ingen distraktor får kallas synonym (motsatsord i en motsatsuppgift) till uppslagsordet av någon av de fyra källorna, ingen distraktor får vara synonym till facit och inga två distraktorer synonymer till varandra
   * en distraktor som är motsatsen märks och får "Det är motsatsen", bara från avancerad; en synonym som distraktor i en motsatsuppgift måste vara belagd och märks
   * samma ordklass i SO eller SAOL, SO-definition finns (misstagstexten), längd inom fyra bokstäver från facit, ingen gemensam stam, högst två förekomster per nivå (OF7)
   * uppslagsordet och ordparet finns inte i banken (åt något håll) eller i artikelfigurerna
3. **Avvisat på vägen**: ungefär 70 kandidater föll eller skrevs om under fyra rundor. Vanligast var facit som SO bara har som "jämför" (börja och starta, hus och byggnad, ödmjuk och anspråkslös), stilmarkering (tokig, närapå, jämt, enfaldig, nedrig) och distraktorer som någon källa kallar synonymer. Ingen sådan kandidat finns kvar.
4. **Läst för hand**: varje uppgift lästes med facit, misstagstexter och exempel. Fyra distraktorer byttes eftersom SO:s första betydelse gav en vilseledande misstagstext (resa, plan, glänsande, domare). För möta, kultiverad och införa används SO:s andra betydelse. Tre facittexter är handskrivna eftersom SO:s definition inte passar exemplet: erfordra ("behöva för att kunna genomföras"), förtroende ("tro på att någon är pålitlig och vill väl") och statisk ("som präglas av rörelse och förändring"). Där facits definition bara är uppslagsordet (profession: "yrke", dessvärre: "tyvärr", omtvistlig: tom) används uppslagsordets definition. Allt annat är SO:s egen text.

## Källkontroller

Beläggen står i fältet `kalla` på varje uppgift (källa, beläggstext, SO:s lemma-id, hämtad 2026-11-19). Första belägget per uppgift står i id-listan nedan.

| Belagt mot | Uppgifter |
|---|---|
| SO | 32 |
| SAOL | 36 |
| SO och SAOL | 17 |
| SO och Wiktionary (SO "jämför" plus Wiktionary synonym) | 3 |
| Wiktionary och synonymer.se (SO och SAOL saknar uppgiften) | 13 |

De 13 med två oberoende källor är nästan alla vanliga motsatspar där SO saknar MOTSATS-hänvisning: mottagare och avsändare, vinnare och förlorare, ökning och minskning, öster och väster, vakna och somna, fylla och tömma, dyr och billig, långsam och snabb, heltid och deltid, urban och lantlig, manuell och automatisk. Dessutom synonymparen enorm och kolossal samt bagatellisera och förringa. Två motsatsord är belagda i två steg inom SO: beröm och kritik (kritik förklaras med klander, klander är motsats till beröm) och artificiell och naturlig (artificiell förklaras med konstgjord, konstgjord är motsats till naturlig).

## Verifieringen

* `node scripts/ordforrad-verifiera.mjs` (ny, delar ingen kod med byggskripten): form och id (V1), exakt ett rätt svar (V2), unika id i följd (V3), inga dubbletter av uppslagsord eller ordpar i hela banken (V4), ordklass (V5), ingen stavningsvariant av facit (V6), versionerna och att version 2 inte är aktiverad (V7), belägg och märkning av motsats- och synonymdistraktorer (V8), exempel och tankstreck (V9). Med `--natet` slås varje uppgift upp igen i SO, SAOL och Wiktionary: facit belagt, ingen distraktor synonym eller motsats till ordet.
* Först körd på de 251 befintliga (git HEAD): 0 fel, anmärkningar nedan. Med `--natet --fran 1`: ett fynd (of-g-m-39).
* Efter tillägget: 352 uppgifter, 0 fel. `--natet --fran 2`: 0 fel.
* `node scripts/validate-ordforrad.mjs` (OF1 till OF8 på alla 352): grön.
* `node scripts/artikel-steg2-check.mjs`: grön.
* vitest: `src/lib/ordforradV1/__tests__/` (spärrarna och nya `version2.test.ts`), `src/lib/tester/steg2`, `src/lib/tester/v4` (steg2-niva, hintar), traningsmejl, TestBredd och HintSparning är gröna. Ett fel i `.claude/worktrees/publikt-v2` (figurserier i traningsmejl) hör till den arbetskopian.
* `npx tsc --noEmit -p .`: inga fel i ordförrådets filer.

Två små kodändringar: `types.ts` har `fran_version: number` i stället för `1`, och `status.ts` räknar bara aktiva versioner i `ordforradAntal()`, så att inlagda men inte aktiverade uppgifter inte påverkar kravet på 40 per nivå och typ.

## Anmärkningar på den befintliga banken (version 1, inte ändrad)

* **of-g-m-39** (tunn, motsats tjock): distraktorn smal är synonym till tunn enligt SO, SAOL eller Wiktionary och inte märkt så. Förslag: byt smal mot ett ord ur samma fält.
* **of-e-s-04** (anarki), **of-e-s-29** (apati), **of-e-s-39** (intrigant): `facit_betyder` är tomt, så genomgången visar ingen definition.
* Fem distraktorer liknar uppslagsordet i stavningen: of-g-m-05 städa (stänga), of-g-m-10 tom (torr), of-a-m-09 förstöra (försämra), of-e-s-21 häva (hävda), of-e-s-28 börs (börda). Det ser avsiktligt ut (falsk vän), så verifieraren räknar dem som anmärkning, inte fel.

## Åtgärdat efter granskningen (2026-11-19)

* of-a-m-52 manuell: distraktorn elektrisk bytt mot optisk.
* Facittexter i rätt betydelse: stringent ("logiskt följdriktig och exakt"), kompensera ("ge ekonomisk ersättning till"), skicka ("låta (något) gå till en mottagare"), ytlig ("(intellektuellt) inträngande eller grundläggande").
* tillträda: anträda är inte längre märkt synonym. Misstagstext: "Anträda betyder påbörja (en resa eller verksamhet)."
* Sex motsatsdistraktorer märkta antonym med "Det är motsatsen.": nedtona (betona), förkasta (förespråka), beständig (efemär), tvivelaktig (evident), bundsförvant (antagonist), torftig (magnifik). Regeln (bara synonymuppgifter från avancerad) håller. Undantagen står i `bygg-v2.mjs` (GRANSKAD_MOTSATS, GRANSKAD_INTE_SYNONYM, MISSTAG, HANDSKRIVET).
* Anmärkningar: fördel och nackdel flyttad från avancerad till grund. vanlig och alldaglig ligger kvar på grund, eftersom alldaglig redan är alternativ två gånger på avancerad (OF7). beröm: misstagstexten för lovord säger nu att den exakta motsatsen är klander.
* Version 1, rättat direkt i bankfilerna med samma id, facit och index: of-g-m-39 smal bytt mot blöt; facittexter för of-e-s-04 anarki, of-e-s-29 apati och of-e-s-39 intrigant enligt granskningen. Pågående sessioner påverkas inte (rättning går på id och index; ett svar på index 3 i of-g-m-39 var fel förut och är det fortfarande).
* Id-numren för version 2 lades om vid omkörningen (fördel blev of-g-m-44 och följande grundmotsatsord flyttades ett steg). Inga sessioner hade dragit version 2 före aktiveringen. Id-listan nedan är den aktuella.
* Kontroller efter rättelserna: verifieraren 0 fel (även `--natet --fran 2`), validate-ordforrad grön, artikel-steg2-check grön, tsc inga fel i ordförrådets filer, vitest grön i `src/lib/ordforradV1`, `src/lib/tester`, traningsmejl och TestBredd (tre fel finns bara i arbetskopian `.claude/worktrees/publikt-v2`).

Till changelogen: percentilen blandar version 1 och 2, och artiklarnas uppgift 1 kan i upp till ett dygn (CDN-cache) skilja sig från det nystartade provet.

## Så aktiverades version 2

1. Rätta eller stryk enligt granskningen: ändra raden i `kandidater/hand-2026-11-19.json` och kör `node scripts/ordforrad/bygg-v2.mjs` (först med `--torr`). Bygget ersätter bara version 2-raderna och skriver avvisade till `kandidater/avvisade-2026-11-19.json`. Id-numren läggs om i följd vid varje körning, så stryk före aktivering, inte efter. En uppgift som strukits efter aktivering får i stället `pensionerad_fran`.
2. Sätt `ORD_VERSION = 2` i `src/lib/ordforradV1/select.ts`. Nya sessioner får `ord_version: 2` i meta och drar ur den större poolen. Sessioner med version 1 drar exakt samma uppgifter som förut (`poolFor` filtrerar på `fran_version`).
3. Uppdatera `src/lib/ordforradV1/__tests__/version2.test.ts`: `ORD_VERSION` väntas vara 2 och testet "inlagd men inte aktiverad" vänds till att version 2 ingår i `poolFor(n)`. Siffrorna i `ordforradAntal()` blir 67/60, 77/61 och 75/12.
4. Kör `node scripts/ordforrad-verifiera.mjs --natet`, `node scripts/validate-ordforrad.mjs`, `node scripts/artikel-steg2-check.mjs` och `npx vitest run src/lib/ordforradV1 src/lib/tester`.
5. Percentilen delas inte per bankversion, så version 1 och 2 blandas i "Var du står". Det bör stå i changelogen.

## Id-lista

**Grund, synonymer**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-g-s-49 | nöjd | belåten | SAOL belåten: förklaras med nöjd ("nöjd") |
| of-g-s-50 | riktig | korrekt | SAOL riktig: förklaras med korrekt ("korrekt; sann, veritabel") |
| of-g-s-51 | enorm | kolossal | Wiktionary: enorm och kolossal listas som synonymer |
| of-g-s-52 | skicka | sända | SO skicka: synonym sända |
| of-g-s-53 | tvätta | rengöra | SO rengöra: jämför tvätta |
| of-g-s-54 | ganska | tämligen | SO ganska: synonym tämligen |
| of-g-s-55 | yrke | profession | SO yrke: synonym profession |
| of-g-s-56 | gåva | present | SO gåva: synonym present |
| of-g-s-57 | tillverka | producera | SO producera: förklaras med tillverka ("tillverka eller framställa") |
| of-g-s-58 | begära | kräva | SO begära: jämför kräva |
| of-g-s-59 | träffa | möta | SAOL träffa: förklaras med möta ("möta, råka") |
| of-g-s-60 | fara | risk | SO fara: förklaras med risk ("") |
| of-g-s-61 | tyvärr | dessvärre | SO tyvärr: synonym dessvärre |
| of-g-s-62 | lära | undervisa | SAOL lära: förklaras med undervisa ("undervisa") |
| of-g-s-63 | hat | avsky | SAOL hat: förklaras med avsky ("stark motvilja, avsky") |
| of-g-s-64 | grym | brutal | SAOL grym: förklaras med brutal ("hänsynslös, brutal") |
| of-g-s-65 | skräck | fasa | SAOL fasa: förklaras med skräck ("skräck") |
| of-g-s-66 | nyttig | hälsosam | SO nyttig: förklaras med hälsosam ("") |
| of-g-s-67 | vanlig | alldaglig | SAOL vanlig: förklaras med alldaglig ("frekvent förekommande; inte märkvärdig, alldaglig") |

**Grund, motsatsord**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-g-m-44 | fördel | nackdel | SO fördel: motsats nackdel |
| of-g-m-45 | mottagare | avsändare | Wiktionary: mottagare och avsändare listas som motsatsord |
| of-g-m-46 | vinnare | förlorare | Wiktionary: vinnare och förlorare listas som motsatsord |
| of-g-m-47 | ökning | minskning | Wiktionary: ökning och minskning listas som motsatsord |
| of-g-m-48 | bakåt | framåt | SO bakåt: motsats framåt |
| of-g-m-49 | sist | först | SO sist: motsats först |
| of-g-m-50 | trött | pigg | SO pigg: motsats trött |
| of-g-m-51 | öster | väster | Wiktionary: öster och väster listas som motsatsord |
| of-g-m-52 | smal | bred | SO smal: motsats bred |
| of-g-m-53 | vakna | somna | Wiktionary: vakna och somna listas som motsatsord |
| of-g-m-54 | fylla | tömma | Wiktionary: fylla och tömma listas som motsatsord |
| of-g-m-55 | dyr | billig | Wiktionary: dyr och billig listas som motsatsord |
| of-g-m-56 | långsam | snabb | Wiktionary: långsam och snabb listas som motsatsord |
| of-g-m-57 | heltid | deltid | Wiktionary: heltid och deltid listas som motsatsord |
| of-g-m-58 | börja | sluta | SO börja: motsats sluta |
| of-g-m-59 | tråkig | rolig | SO tråkig: motsats rolig |
| of-g-m-60 | vänster | höger | SO vänster: motsats höger |
| of-g-m-61 | yttre | inre | SO yttre: motsats inre |

**Avancerad, synonymer**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-a-s-56 | ihärdig | uthållig | SAOL ihärdig: förklaras med uthållig ("uthållig, trägen") |
| of-a-s-57 | förbrylla | förvirra | SAOL förbrylla: förklaras med förvirra ("förvirra, förvåna") |
| of-a-s-58 | erfordra | kräva | SO erfordra: förklaras med kräva ("kräva") |
| of-a-s-59 | förolämpa | kränka | SAOL förolämpa: förklaras med kränka ("kränka, såra") |
| of-a-s-60 | tillförsikt | förtröstan | SO tillförsikt: synonym förtröstan |
| of-a-s-61 | iaktta | observera | SAOL iaktta: förklaras med observera ("se på, observera") |
| of-a-s-62 | fullständig | komplett | SAOL komplett: förklaras med fullständig ("fullständig; fullkomlig") |
| of-a-s-63 | betona | framhäva | SAOL framhäva: förklaras med betona ("understryka, betona") |
| of-a-s-64 | nyckfull | oberäknelig | SAOL nyckfull: förklaras med oberäknelig ("oberäknelig, oförutsägbar") |
| of-a-s-65 | avskaffa | upphäva | SAOL avskaffa: förklaras med upphäva ("göra slut på; upphäva") |
| of-a-s-66 | medge | erkänna | SAOL medge: förklaras med erkänna ("hålla med om, erkänna") |
| of-a-s-67 | fullgöra | utföra | SAOL fullgöra: förklaras med utföra ("utföra; uppfylla") |
| of-a-s-68 | tillfällighet | slump | SO tillfällighet: synonym slump |
| of-a-s-69 | ståndaktig | orubblig | SAOL ståndaktig: förklaras med orubblig ("som håller stånd, fast, orubblig") |
| of-a-s-70 | förespråka | förorda | SAOL förespråka: förklaras med förorda ("tala för, förorda") |
| of-a-s-71 | expandera | utvidga | SO expandera: synonym utvidga |
| of-a-s-72 | förtroende | tillit | SAOL förtroende: förklaras med tillit ("tillit; tillitsfull information") |
| of-a-s-73 | välvillig | vänlig | SO välvillig: jämför vänlig |
| of-a-s-74 | arrogant | högdragen | SAOL arrogant: förklaras med högdragen ("högdragen, aggressiv") |
| of-a-s-75 | kompensera | ersätta | SAOL kompensera: förklaras med ersätta ("uppväga, ersätta; utjämna") |
| of-a-s-76 | ambition | strävan | SAOL ambition: förklaras med strävan ("strävan, anspråk; framåtanda") |
| of-a-s-77 | suverän | överlägsen | SO suverän: förklaras med överlägsen ("") |

**Avancerad, motsatsord**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-a-m-45 | muntlig | skriftlig | SO muntlig: motsats skriftlig |
| of-a-m-46 | inflation | deflation | SO inflation: motsats deflation |
| of-a-m-47 | sympati | antipati | SO sympati: motsats antipati |
| of-a-m-48 | spontan | genomtänkt | SO spontan: motsats genomtänkt |
| of-a-m-49 | tillträda | frånträda | SO tillträda: motsats frånträda |
| of-a-m-50 | fälla | frikänna | SO fälla: motsats frikänna |
| of-a-m-51 | urban | lantlig | Wiktionary: urban och lantlig listas som motsatsord |
| of-a-m-52 | manuell | automatisk | Wiktionary: manuell och automatisk listas som motsatsord |
| of-a-m-53 | abstrakt | konkret | SO abstrakt: motsats konkret |
| of-a-m-54 | beröm | kritik | SO kritik: synonym eller förklaring klander |
| of-a-m-55 | minoritet | majoritet | SO minoritet: motsats majoritet |
| of-a-m-56 | kollektiv | individuell | SO kollektiv: motsats individuell |
| of-a-m-57 | efterfrågan | utbud | SO efterfrågan: motsats utbud |
| of-a-m-58 | ytlig | djup | SO ytlig: motsats djup |
| of-a-m-59 | akut | kronisk | SO akut: motsats kronisk |
| of-a-m-60 | preliminär | slutgiltig | SO preliminär: motsats slutgiltig |

**Expert, synonymer**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-e-s-55 | efemär | kortlivad | SAOL efemär: förklaras med kortlivad ("kortlivad; förgänglig, flyktig") |
| of-e-s-56 | evident | uppenbar | SO evident: synonym uppenbar |
| of-e-s-57 | bagatellisera | förringa | Wiktionary: bagatellisera och förringa listas som synonymer |
| of-e-s-58 | antagonist | motståndare | SAOL antagonist: förklaras med motståndare ("motståndare") |
| of-e-s-59 | magnifik | storslagen | SAOL magnifik: förklaras med storslagen ("storslagen, storartad, ståtlig") |
| of-e-s-60 | tendentiös | partisk | SAOL tendentiös: förklaras med partisk ("med utpräglat syfte; partisk, snedvriden") |
| of-e-s-61 | stringent | strikt | SO strikt: förklaras med stringent ("") |
| of-e-s-62 | deskriptiv | beskrivande | SAOL deskriptiv: förklaras med beskrivande ("beskrivande") |
| of-e-s-63 | nonchalant | vårdslös | SAOL nonchalant: förklaras med vårdslös ("vårdslös; respektlös") |
| of-e-s-64 | fiktiv | uppdiktad | SAOL fiktiv: förklaras med uppdiktad ("inbillad; uppdiktad") |
| of-e-s-65 | diskutabel | omtvistlig | SAOL diskutabel: förklaras med omtvistlig ("omtvistlig, inte självklar") |
| of-e-s-66 | hegemoni | herravälde | SAOL hegemoni: förklaras med herravälde ("övervälde, herravälde, ledarskap") |
| of-e-s-67 | fatal | ödesdiger | SO fatal: synonym ödesdiger |
| of-e-s-68 | pompös | högtravande | SO pompös: förklaras med högtravande ("") |
| of-e-s-69 | profan | världslig | SAOL profan: förklaras med världslig ("inte kyrklig, lekmanna-, världslig") |
| of-e-s-70 | rigorös | noggrann | SO rigorös: förklaras med noggrann ("") |
| of-e-s-71 | vulgär | ohyfsad | SAOL vulgär: förklaras med ohyfsad ("simpel, grov, ohyfsad; i sammansättn. äv. alltför förenklad") |
| of-e-s-72 | abrupt | plötslig | SAOL abrupt: förklaras med plötslig ("tvärt avbruten, plötslig, tvär") |
| of-e-s-73 | approximativ | ungefärlig | SO approximativ: synonym ungefärlig |
| of-e-s-74 | fragil | bräcklig | SO fragil: förklaras med bräcklig ("") |
| of-e-s-75 | obstruera | hindra | SAOL obstruera: förklaras med hindra ("hindra, försvåra att ngt genomförs") |

**Expert, motsatsord**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-e-m-08 | konkav | konvex | SO konkav: motsats konvex |
| of-e-m-09 | artificiell | naturlig | SO artificiell: synonym eller förklaring konstgjord |
| of-e-m-10 | prolog | epilog | SO prolog: motsats epilog |
| of-e-m-11 | statisk | dynamisk | SO statisk: motsats dynamisk |
| of-e-m-12 | manifest | latent | SO manifest: motsats latent |


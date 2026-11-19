# Granskning: ordförråd version 2 (101 uppgifter)

Testansvarig, 2026-11-19. Underlag: `docs/fragebank/ordforrad-2026-11-19.md`, de 101 raderna med `fran_version: 2` i `src/lib/ordforradV1/bank*.json`, `scripts/ordforrad-verifiera.mjs` (körd själv, med och utan `--natet --fran 2`: 0 fel), SO/SAOL via svenska.se:s sök-API (ett femtiotal uppslag med WebFetch, alla 13 Wiktionary/synonymer.se-belägg plus ett trettiotal SAOL-, "jämför"- och tvåstegsbelägg) och svenska Wiktionary. Bankerna är inte ändrade.

## Beslut

**Godkänt med villkor.** Alla 101 har ett facit som är en etablerad synonym eller ett etablerat motsatsord i den betydelse exemplet avser. Ordklassen stämmer i SO eller SAOL för ord, facit och distraktorer. Inga stötande ord, inga varumärken. Inga dubbletter av uppslagsord eller ordpar mot version 1 (V4), och de ord som återkommer från version 1 gör det bara i andra par (vanlig, bred, snabb, sluta, rolig, konkret, djup, uppenbar, strikt, noggrann, ungefärlig, hindra, latent), vilket är tillåtet.

Sju rader ska rättas i `kandidater/hand-2026-11-19.json` före bygget körs om och `ORD_VERSION` sätts till 2. Ingen behöver strykas. Rättelserna gäller en distraktor och sex texter; ingen rör facit.

## Rätta före aktivering

| Id | Problem | Rättelse |
|---|---|---|
| of-a-m-52 manuell, motsats automatisk | Distraktorn **elektrisk** läses i vardagsspråk som motsats till manuell (manuell eller elektrisk tandborste, manuell eller elektrisk skrivmaskin). SO ger dessutom "maskinellt arbete" som motsats till manuell, så fältet är redan laddat. | Byt elektrisk mot **optisk** (SO adjektiv, "som har att göra med ljuset och dess lagar", ingen förekomst i banken). Misstagstext: "Optisk betyder som har att göra med ljuset och dess lagar." |
| of-e-s-61 stringent, synonym strikt | Belägget håller (SO strikt, underbetydelse "stringent" om resonemang och definitioner), men `facit_betyder` är SO:s första betydelse av strikt, "som ska följas på ett exakt sätt", som inte passar exemplet "Analysen var stringent". | Handskriven facittext: "logiskt följdriktig och exakt". |
| of-a-s-75 kompensera, synonym ersätta | `facit_betyder` "sätta (något) i stället för" är fel betydelse av ersätta för exemplet "kompenserade kunderna". SO kompensera jämför ersätta i betydelse 3. | Facittext från SO ersätta 3: "ge ekonomisk ersättning till". |
| of-g-s-52 skicka, synonym sända | `facit_betyder` "få (någon) att bege sig" gäller personer, exemplet är ett paket. | Handskriven facittext: "låta (något) gå till en mottagare". |
| of-a-m-59 ytlig, motsats djup | `facit_betyder` är den rumsliga betydelsen "stort avstånd mellan yta och botten", exemplet är "ytlig kunskap". | Facittext från SO djup 4: "(intellektuellt) inträngande eller grundläggande". |
| of-a-m-49 tillträda, motsats frånträda | Distraktorn **anträda** är märkt synonym med texten "betyder ungefär detsamma som tillträda". SO har anträda bara som jämför till tillträda och definierar det "påbörja verksamhet, särskilt förflyttning" (anträda en resa). Texten lär ut en synonymi som inte finns. | Märk anträda `samma_falt` med SO:s definition: "Anträda betyder påbörja (en resa eller verksamhet)." |
| of-a-s-63 betona, of-a-s-70 förespråka, of-e-s-55 efemär, of-e-s-56 evident, of-e-s-58 antagonist, of-e-s-59 magnifik | Distraktorerna nedtona, förkasta, beständig, tvivelaktig, bundsförvant och torftig är motsatser till uppslagsordet men märkta `annan`, så genomgången säger inte "Det är motsatsen" och `arMotsats` blir falskt, medan misströstan, förutsägbar, införa, överdriva, objektiv, normativ, sakral, kultiverad och underlätta i grannuppgifterna är märkta `antonym`. Inkonsekvent lärande. | Märk de sex `antonym` med "Det är motsatsen." först i misstagstexten, om byggskriptets regel (bara från avancerad, belagt) tillåter; annars lämna men notera i changelogen. |

## Anmärkningar (inte blockerande, beslut åt bygget)

* **Svårighet mot nivå.** Uppslagsorden ligger i banden, men banden gäller bara uppslagsordet (`bygg-v2.mjs` rad 83 mäter `O`), inte facit som dokumentet säger. Facit under grundbandet: kolossal (2 052), alldaglig (6 210), profession (9 945), belåten (16 026), rengöra (27 563). Uppgifterna är lösbara genom uteslutning och godtas, men **of-g-s-65 vanlig, alldaglig** är den svagaste på grund: alldaglig har en nedsättande bibetydelse ("föga originell") och är ovanligare än de flesta expertfacit. Flytta till avancerad om bygget tillåter, annars behåll.
* **För lätt för nivån:** of-a-m-57 fördel, nackdel (390 000 respektive 103 000) och of-a-m-45 muntlig, skriftlig är grundnivå. Expert har flera vardagliga uppslagsord: fiktiv (16 288), abrupt (13 555), nonchalant (24 801), antagonist, statisk. Inget är fel, men nivåskillnaden är det vi säljer. Förslag: flytta fördel till grund (grund motsats blir 18, avancerad 16, båda över 40) och läs av andel rätt per uppgift på expert efter en månad.
* **of-a-m-54 beröm, kritik.** Kritik kan vara positiv (SO betydelse 2: "både positiv och negativ kritik"), det strikta motsatsordet är klander (SO klander: motsats beröm). Kritik är det ord folk kan och tvåstegsbelägget håller, så godkänt, men lovord-distraktorn gör uppgiften bra först när genomgången förklarar att klander är den exakta motsatsen. Lägg till det i misstagstexten för lovord om utrymme finns.
* **of-e-s-71 vulgär, ohyfsad.** Bara SAOL binder dem ("simpel, grov, ohyfsad"). SO vulgär: "brist på smak och bildning", jämför smaklös, tarvlig; SO ohyfsad handlar om uppträdande. Svagaste synonymparet på expert men belagt och rimligt i exemplet "vulgärt språk". Alternativ om det byts senare: tarvlig.
* **of-a-m-60 akut, kronisk:** distraktorn skarp (märkt synonym) är belagd i SAOL akut ("skarp, häftig; överhängande"), inte i SO. Godkänd.
* **Wiktionary-beläggen** (13 uppgifter) stämmer vid egen kontroll med en nyans: för enorm/kolossal och fylla/tömma ligger relationen bara på den ena sidan (kolossal listar enorm, tömma listar fylla). SO bagatellisera definieras "förringa betydelsen av", så den uppgiften har i praktiken SO-stöd också.
* **Kräva** är facit två gånger (of-g-s-58 begära, of-a-s-58 erfordra), på olika nivåer. Tillåtet, men den som gör båda nivåerna ser samma facit. Ingen åtgärd.
* **Fem uppslagsord från version 1 återkommer som facit eller tvärtom** (listan ovan). Tillåtet och pedagogiskt rimligt. Ingen åtgärd.

## Den befintliga banken (version 1)

| Id | Problem | Rättelse |
|---|---|---|
| of-g-m-39 tunn, motsats tjock | Distraktorn **smal** är synonym till tunn (SAOL tunn förklaras med smal) och är inte märkt så. Rätt fynd av agenten. | Byt smal mot **blöt** (SO adjektiv, pop 95 066, en förekomst på grund i of-g-m-35, blir två, inom OF7; inte synonym eller motsats till tunn eller tjock, inte synonym till mjuk, strålande eller fattig). Misstagstext: "Blöt betyder helt genomdränkt av eller överdragen med vatten." Observera att SO även ger grov och tät som motsatser till tunn; ingen av dem finns bland alternativen. Eftersom uppgiften är aktiv i version 1 och sessioner drar den efter id: byt distraktorn på plats utan nytt id (facit och index oförändrade), svar som redan lagts på index 3 räknas fortsatt som fel, vilket är rätt. |
| of-e-s-04 anarki, laglöshet | `facit_betyder` tomt. Laglöshet finns bara i SAOL utan definition. | Handskriven: "tillstånd där lagar inte upprätthålls och samhällsordningen brutit samman". |
| of-e-s-29 apati, likgiltighet | `facit_betyder` tomt. Likgiltighet finns bara i SAOL utan definition. | Handskriven: "brist på intresse, känslor och engagemang". |
| of-e-s-39 intrigant, ränkfull | `facit_betyder` tomt. Ränkfull finns bara i SAOL (pop 9). | Handskriven: "som smider ränker, alltså i hemlighet planerar för att skada andra eller vinna fördelar". Ränkfull är nästan okänt även för expert; behåll (belagt i SAOL), men läs av andel rätt. |

Dessa fyra ändringar rör version 1 och ska göras direkt i bankfilen (inte via bygg-v2), med `scripts/ordforrad-verifiera.mjs` grön efteråt. Textändringar på facit_betyder är ofarliga för pågående sessioner.

## Är aktiveringen säker?

Ja, kontrollerat mot koden och databasen:

* **Nivåtestet.** `ordMeta()` skriver `ord_version` i session.meta sedan första commit (dc216285), och `ordInnehall()` drar med `ordVersion(session.meta)`. Alla tre ordforrad-grund-sessioner i prod har `ord_version: 1`. Rättning och genomgång går via `hittaOrd`/`allaOrd()` (alla versioner). Pågående och avslutade sessioner påverkas inte.
* **Passen.** `skapaSteg2Pass` sparar `fragor` (id-lista) och `version` i meta; vyn läser id:na. Den enda ordforrad-pass-sessionen i prod har `fragor` och `version: 1`.
* **I-provet inloggat** (`iprov.server.ts`) sparar `delar[].ids` vid start. Pinnat.
* **Publika provet och I-prov-provet** (`api/public/test-session`) sparar `questions: refs` i `anon_test_sessions` vid skapandet och rättar mot dem. Pinnat.
* **Artiklarnas uppgift 1** (`artikelUppgift`, `ArtikelProv`, `/verktyg/rekryteringstester/prova`) räknas om från artikelns fasta frö mot den **aktuella** poolen vid varje rendering. När poolen växer byter uppgift 1 i ordförråds- och I-prov-artiklarna. Provet som startas från artikeln sparar sina refs, så rättningen är korrekt, men i upp till ett dygn (CDN-cache på publika sidor) kan artikelns cachade HTML visa en annan uppgift 1 än det nystartade provet. Acceptera och nämn i changelogen, eller rensa CDN-cachen för berörda artiklar vid deployen. `artikel-steg2-check.mjs` (inget artikelord i banken) är grön med de 101 inräknade.
* **ordforradRedo** med version 2: 67/60, 77/61, 75/12, över kraven. `status.ts` räknar bara aktiva versioner, så tröskeln inte påverkas av inlagda men inaktiva rader.
* **Percentilen** blandar version 1 och 2 i "Var du står", som dokumentet säger. Med tre sessioner i prod är det i praktiken en nystart. Ska stå i changelogen.

## Ordning

1. Rätta de sju raderna ovan i `kandidater/hand-2026-11-19.json`, kör `bygg-v2.mjs --torr`, sedan skarpt. Besluta anmärkningarna (flytt av fördel och alldaglig) i samma körning, eftersom id-numren läggs om.
2. Rätta de fyra version 1-raderna direkt i bankfilerna.
3. `ORD_VERSION = 2`, uppdatera `version2.test.ts`, kör verifieraren med `--natet`, `validate-ordforrad.mjs`, `artikel-steg2-check.mjs` och vitest enligt dokumentets steg 4.
4. Avläsning: andel rätt per uppgift på expert och på of-g-s-65 efter 30 dagar.

## Åtgärdat (motoragenten, 2026-11-19)

Alla sju rättelser och de fyra version 1-raderna är gjorda, fördel är flyttad till grund, lovord har fått klander i misstagstexten och `ORD_VERSION` är 2. vanlig och alldaglig ligger kvar på grund, eftersom alldaglig redan är alternativ två gånger på avancerad (OF7). Detaljer och kontroller i `ordforrad-2026-11-19.md`, avsnittet "Åtgärdat efter granskningen".

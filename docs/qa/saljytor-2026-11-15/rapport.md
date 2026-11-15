# QA av säljytorna, 2026-11-15

Grenen `feat/saljytor`, sju commits efter `d4e1974b` plus sju rättningar i den här omgången. Facit: `docs/design/saljytor-2026-11-15/beslut.md` och EFTER-texten i `skiss-fore-efter.html`.

Skärmdumpar och rådata ligger utanför git, i
`C:\Users\chris\AppData\Local\Temp\claude\c--Users-chris-cvbrev\088e1f5f-94a5-4067-87a2-dbdf8502d44c\scratchpad\qa-saljytor\`
(`<läge>-<form>-<nr>-<steg>.png`, `resultat.jsonl`, `radering.json`; loggarna `kor-bw.log`, `kor-cm.log` och `kor-ingen.log` ligger en nivå upp). Tidigare körningar ligger i undermapparna `forsta-korning`, `andra-korning` och `tredje-korning`.

## Så testades det

- `next build` och sedan `next start` lokalt, en server per läge: `KAMPANJ_NU=2026-11-23T10:00+01:00` (Black Week), `2026-11-30T10:00+01:00` (Cyber Monday) och inget datum. På publika sidor sattes `localStorage.kampanj_nu` till samma tid. `TRANING_FORHANDSVISNING=1` gav förhandsvisningen M1 av ImorgonKort under dashboard-layouten.
- Skriptet är `scripts/qa-saljytor.mjs` (puppeteer-core med systemets Chrome). Formerna är Pixel 7 (412 x 915, DPR 2,625, touch) och dator 1280 x 800.
- Varje steg ger en skärmdump och kontrollerar att primär handling ligger i fönstret, konsolfel, 4xx och 5xx, CLS och horisontell scroll.
- Konton: `qa-saljytor-1794749398993-{gratis,forre,prov}@jobbcoach-qa.test`.
  - gratis har aldrig betalat.
  - forre har `subscription_status canceled` och är alltså en före detta kund.
  - prov hämtar ett prov per IP-adress till ett testkonto, så att `spara_prov_utfall` undantar QA-proven ur `prov_utfall`.
  - Provkörningarna gick med egna dokumentationsadresser i `x-forwarded-for`.
- Städning: allt raderades per id (`radering.json`).
  - Tre konton, med rader i test_planer, user_activities, logic_test_v4_sessions, test_nivapunkter och test_milstolpar.
  - 20 rader i anon_test_sessions, raderade per token.
  - 7 rader i public_rate_limits, raderade per exakt ip_hash.
  - Inget svep efter tidsfönster.

Resultat i sista körningen: Black Week 86 OK och 7 FEL, Cyber Monday 79 OK och 4 FEL, utan kampanj 191 OK och 12 FEL. Alla FEL som står kvar förklaras under "Kvar, inte rättat". Inget av dem gäller pris eller copy.

## Testmatrisen

| # | Yta | Resultat |
|---|-----|----------|
| 1 | Kampanj, gratiskontot | Black Week: testnivåväggen, testtaket, ImorgonKort (en riktig Nivåkoll och M1), raden i TesterHub, premiumraden i kontopanelen efter provet och /register (på dator, raden finns bara från 900 px) visar alla "99 kr första månaden, sedan 149 kr i månaden". Cyber Monday visar 49 kr på samma ytor. Utan kampanj visar alla 149 kr och inget "första månaden". OK |
| 1 | Kampanj, före detta kund | Ser aldrig 99 eller 49 kr: inte på väggarna, inte i ImorgonKort, TesterHub, /register, /priser eller panelen efter provet. Cookien `jc_kampanj_ej=1` sätts av inloggat läge. OK |
| 2 | Betalväggarna | Nio-raden har nio glyfer, ingen klippt, och den låsta typen (matris) är markerad. Prisraden står på två rader, med "Säg upp när du vill." för sig. På 412 px bryts kampanjmeningen av bredden till en tredje visuell rad, vilket är väntat. OK |
| 3 | /register, bar och efter provet | Glyfraden ligger inom panelen (marginal 73 till 188 px), och panelen är centrerad (16/16 px på mobil). På dator är panelen och formuläret centrerade som grupp: 113 px till vänster och 112 px till höger, räknat mot sidbredden utan rullningslistens fåra. OK |
| 4 | Artiklar | ProvKort (matrigma-test) och TypProvKort (i-prov visar rutnät med tre markerade och "Sex deltester, tre testtyper", deduktivt och talserier har raden). Intervjukortet och stickyn på mobil leder till /prova i klassiska-intervjufragor-lista och styrkor-svagheter-intervju. GratisKort i ai-jobbmatchning finns inline och i sidokolumnen; på mobil är ordningen rubrik, bild, lista, knapp. OK |
| 5 | /priser, startsidan, /verktyg/rekryteringstester | Rutnätsplattan "Grundnivån i alla nio", Tester-stationen och tabellens rad 1 är OK. Startsidans station Brev säger "var sjunde dag", och FAQ-svaret kommer ur gratis-copy. Hjälten har talraden och 16 px (mobil) respektive 36 px (dator) luft under knappen. Fel: hjälteknappen låg på 814 px i 1280 x 800, rättat i 59a2713c |
| 6 | Solfjädern på mobil | Telefonen börjar 73 px under texten i alla sex artiklar. OK |
| 7 | Testrummets hemvy, F18 | "Börja med Nivåkollen, åtta minuter som visar var du står. Vet du när provet är, ..." syns i tomt läge (plan utan datum), på båda formerna. OK |
| 8 | Mörkt läge, 412 px | Testnivåväggen och /register: läsbara, nio-raden hel, primärknappen synlig. OK |
| 9 | Husregler (grep i ändrade filer) | Två talstreck och en mittpunkt i löptext hittades. Nivåkollen stod utan förklaring i PROV_TYP_PANEL och i två publika FAQ-svar. Allt rättat, se nedan |

## Fynd och rättningar

| Commit | Vad |
|--------|-----|
| efe8c0c7 | Del 1. a) "Gratis att prova" på /verktyg/rekryteringstester läser GRUNDNIVAN_ALLA. b) "sedan ett var sjunde dag" i premiumavslutet på /verktyg/personligt-brev. c) "Premium täcker hela vägen" i övningsprovets betalvägg (ovningsprov/copy.ts) och i träningsmejlet (templates/traning.ts plus testet). d) Jobbmatchningen ger FREE_TIER_JOB_LIMIT = 3 träffar (`src/lib/jobmatching/freeLimit.ts`, som `api/jobs/redact` klipper med). "tio matchade jobb gratis per sökning" stod bara i `content/artiklar/ai-jobbmatchning.mdx`, på rad 20 (FAQ-frontmatter och därmed schemat), 56, 96 och 118. Där står nu "dina tre bästa träffar gratis, med skälen utskrivna". "tre bästa" i paywall-copy.ts:311 stämmer redan. |
| cc3602da | PROV_TYP_PANEL rad 3 (panelen efter provet för de nya testtyperna) sa "Nivåkollen, cirka n minuter, räknar in ..." utan förklaring. Den har nu samma lydelse som KONTO_PANEL: "visar var du står och räknar in de här svaren". |
| 75f91020 | Talstreck i två funktionstips (useUnusedFeatures.ts), ersatta med kommatecken. |
| 011d07f4 | Mittpunkten i övningsprovets eyebrow ("Talserier · dagen före provet") ersatt med kommatecken. |
| b4034aa6 | Två publika FAQ-svar låg utanför omgången och sa fortfarande "Nivåkollen och ett första träningspass" och "ett i veckan": /funktioner (FunktionerSida.tsx) och Jobbcoachens FAQ. Båda läser nu GRUNDNIVAN_ALLA och säger "var sjunde dag". |
| ec78ec1f | **Kampanjraden i TesterHub syntes aldrig för gratiskonton.** testHuvud gav scope null en egen ingress ("En nivåkoll med genomgång och ett första träningspass ingår gratis", en gammal copy), och villkoret `!huvud.ingress` dolde då S14-raden med kampanjpriset (K4). Ingressen är borttagen för gratis, så raden syns. Hjältens standardtext säger nu bredden ur ANTAL_TESTTYPER ("Åtta testtyper och personlighetstestet ...") i stället för "Logik, verbalt, numeriskt och personlighet". |
| 59a2713c | Hjälten på /verktyg/rekryteringstester: ingressen och den feta meningen (S8) blev en rad längre, och "Starta gratis test" hamnade under 800 px på dator. Hjälten har nu 24 px topp på den sidan. Mobilen är oförändrad. |

Varje rättning kördes med tsc och berörda vitest. Sista `next build` (efter 59a2713c) är grön. Hela vitest ger 3 röda, samma som före grenen: kandidater.test och två i admin/fragor/data.test.

## Kvar, inte rättat

- **CLS på testnivåväggen**: 0,14 på mobil och 0,05 på dator, i alla lägen. Orsaken är `isLocked` i TestHubPage, som väntar på `!profileLoading`. Startknappen ritas först och byts sedan mot väggen. Felet fanns före grenen, som bara lade till `testTyp`. Det behöver serverläst scope och är en egen uppgift.
- **Solfjädern på dator**: den vänstra telefonens ram går ända fram till punktlistans högerkant i SlutKortet. Ingen text täcks på skärmdumparna. Desktop-CSS:en är inte ändrad i grenen.
- Följande FEL är artefakter i skriptet, inte fel på sidorna: CLS i "start-faq", där skriptet själv öppnar `<details>`. "nio-raden" i panelen på /prova finns inte, eftersom raden står i /register-panelen enligt S1. Premiumraden på /register på mobil är dold under 900 px enligt designen.
- Ingen Stripe-kassa testades. Den ingick inte i matrisen och testades i qa-kampanj 2026-11-13.

## Redo att pushas?

Ja, med de två punkterna ovan som kända och redan befintliga. Ingen push och ingen merge är gjord.

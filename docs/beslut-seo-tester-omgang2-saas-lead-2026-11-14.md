# Saas-leads slutliga beslut om SEO-planen för testklustret, omgång 2 (14 november 2026)

Granskning av `docs/plan-seo-tester-omgang2-2026-11-14.md`, avgjord mot säljgranskningen `docs/beslut-seo-tester-omgang2-salj-2026-11-14.md`, `docs/plan-efter-analys-2026-11-08.md` och `docs/plan-huvudord-2026-12.md`. Besluten är slutliga och genomförs som avsnitt H i `docs/plan-efter-analys-2026-11-08.md`, där status förs. Rapporten till ägaren är `docs/rapporter/seo-tester-omgang2-2026-11-14.{html,pdf,md}`. Ägarens prioritet styr: konvertering och konton före besökare. Ingen kod är ändrad och inget är publicerat.

## Underlag

Planen, säljgranskningen, förra omgångens plan och granskningar 2026-11-10, `docs/plan-efter-analys-2026-11-08.md` (avsnitt C, E, G), `docs/plan-huvudord-2026-12.md`, `docs/plan-content-2026-q4.md`, minnesfilerna om Black Week 2026, Testklar, SEO-takten och testfokus.

Kontrollerat i kod:
- `src/lib/tester/steg2Status.ts`: alla typer som planen hänvisar till är live, `IPROV_PROV_KLART` sann.
- `src/lib/traning/gratisniva.ts`: gratis är smakprovet, Nivåkollen en gång och grundpasset dag 0. Provläge, ommätning, riktade pass och kurvans historik kräver Premium. Planens påståenden om gratis och Premium stämmer.
- `ArtikelProv` finns i tolv artiklar, tar vilken slug som helst, och står på alva-labs-logiktest redan ovanför resultattabellen. Två prov på samma sida är aldrig prövat. U10 är alltså gjord; rutan i G är rättad.
- `src/lib/traning/mittTest.ts` och `src/lib/analytics/provkalla.ts`: inget val för myndighet eller Cubiks; förval från de sju leverantörs- och I-prov-sidorna; provdatumskärmen bara för iprov och lokforare; I-provets smakprov sätter `mitt_test=iprov` själv.
- Övningsprovet i Alvas format finns i Premium (`PROVFORMAT.alva`). Premiumraden efter matrisprovet är generell.
- Kampanjen: `src/lib/kampanj/kampanj.ts` är enda klockan och kassan facit. `KampanjVarianter` och `KampanjPris` används redan i `PremiumBlock`. `TypProvKort` och `ArtikelReklam` visar 149 kr under kampanjen.
- Mätningen: `sample_started` har `test_kind` överallt utom för matrisprovet på `/prova` (`ProvaFlow.tsx`). `subscription_paid` i webhooken skickar `plan`, `scope`, `amount_sek` och `plats`, men inte `konto_kalla` och `mitt_test`, fast kassans metadata bär dem. `mitt_test_valt` från artikeln skjuts i `ValkommenClient` bara när `kalla.satt` är sann.
- `content/artiklar/i-prov.mdx`: Kustbevakningen saknar källa på sidan, Tullverket har Polistidningen.

Kontrollerat i data (Supabase, ägaren och testkontona undantagna): 25 nya konton sedan 10 nov, 17 med spårbar testkälla, störst Alva-smakprovet (4), ett köp. Säljgranskningens tal gäller: kontosteget 19 procent sedan 10 nov (74 visade, 14 konton) på fyra och en halv dag, sex köp på 28 dagar och inget direkt efter ett smakprov. Search Console är inte omkörd; planens siffror och `gsc.json` från 14 nov används. `NODE_TLS_REJECT_UNAUTHORIZED` är satt i shellmiljön; inget nätverksskript är kört genom den och ingen agent sätter den.

## 0. Sammanfattning

Ägarens regel 14 nov kväll gäller: allt som inte beror på en avläsning hos oss körs nu. Källkontroll ingår i artikelflödet, och kapacitet eller granskningsordning är inget skäl att skjuta upp. Kampanjfrysen 23 till 30 nov gäller komponentändringar, så komponentsteg ligger före 23 nov eller direkt efter 30 nov.

1. **En körkö i ordning efter köpnärhet**, i avsnitt H. Kod: mätningen, priskorten och registreringsfelen 16 till 20 nov, huvudordens titlar, länkar och tekniska grund och hubbens block 18 till 22 nov, galleriernas innehåll 1 till 3 dec. Artiklar: Alva och numeriskt och verbalt 16 nov, tips 17 till 19 nov, stanine 18 till 20 nov, i-prov 19 till 20 nov, myndigheter 20 till 22 nov, personlighetstestguiden 22 till 24 nov, Cubiks 24 till 26 nov, sommarjobb, videointervjuer, intervjufrågor i vården, uppsägningsbrev och tre yrkespar till och med 11 dec.
2. **Väntar på avläsning, och bara det:** länkarna på logiska-tester och navet samt Matrigma-utökningen (8 till 9 dec) och figursidan (8 till 11 dec) väntar på avläsningen 7 dec; kontostegets utformning och Dagspasset beslutas 8 dec.
3. **Enda undantaget:** sammanslagningarna M1 och M8 är 301 och ägarbeslut enligt huvudordsplanen.
4. **Kontostegets fel lagas nu, utformningen väntar.** 14 misslyckade registreringar saknar skäl; skälet läggs till, auth-loggen läses och fel rättas.
5. **Mätningen lagas, byggs inte ut.** Det som läggs till är källan på `subscription_paid` och skälet på `signup_failed`.

## 1. Beslut per åtgärd

Insats: S under en dag, M två till fyra dagar. Numren följer avsnitt H i `docs/plan-efter-analys-2026-11-08.md`.

| Nr | Åtgärd | Beslut | Motivering | Insats | När |
|---|---|---|---|---|---|
| K1 | Mätkontroll | **Kör** | `mitt_test_valt` 4 mot 16, `test_kind` på matrisprovets start, källa och test på `subscription_paid`. | S | 16 till 20 nov |
| K2 | Prisraderna följer kampanjen | **Kör** | Beslutat pris som visas. Kontostegets rad orörd. | S | 16 till 20 nov |
| K3 | Registreringsfelen | **Kör** | 14 misslyckade utan skäl, 65 öppnade mot 21 skickade. Utformningen orörd. | S | 16 till 20 nov |
| K4 | Huvudorden: titlar, länkar, teknisk grund | **Kör, före frysen** | Visningarna x3 till x4, 0 till 1 klick, sida 3 till 8, kannibalisering. | S, S, S | 18 till 22 nov |
| K5 | Hubbens block | **Kör, före frysen** | Leder till de nya sidorna. | S | 20 till 22 nov |
| K6 | Galleriernas innehåll | **Kör, direkt efter frysen** | Konkurrenternas gallerier har text. | M | 1 till 3 dec |
| K7 | Underlag om kontosteget | **Kör** | Före och efter K3. | S | till 8 dec |
| A1 | Alva-sidan | **Kör** | Säljsidan, säljs backningsregel. | S till M | 16 nov |
| A2 | Numeriskt och verbalt | **Kör** | 461 visningar, noll klick. | S | 16 nov |
| A3 | Tipssidan | **Kör** | Elva autoförslag, ingen ägare. | M | 17 till 19 nov |
| A4 | Stanine-sidan | **Kör** | Tio autoförslag, väg till I-provet. | M | 18 till 20 nov |
| A5 | Tillägg på i-prov | **Kör** | Högst köpvilja per besökare; Kustbevakningen ska beläggas eller strykas. | S | 19 till 20 nov |
| A6 | Myndighetssidan | **Kör** | Köpnärmaste nya sidan. Källorna kontrolleras när den skrivs; det som inte går att belägga skrivs inte. | M | 20 till 22 nov |
| A7 | Personlighetstestguiden | **Kör** | Sidan stiger men svarar inte på tipsfrågorna. | S | 22 till 24 nov |
| A8 | Cubiks-sidan | **Kör** | Inbjudan i hand; lovar inget Cubiks-prov. | M | 24 till 26 nov |
| A9 | Sommarjobb | **Kör** | Ska ranka före ansökningstoppen. | M | 26 till 28 nov |
| A10 | Videointervjuer | **Kör** | Search Console kontrolleras när den skrivs. | M | 29 nov till 1 dec |
| A11 | Intervjufrågor i vården | **Kör** | Ägarens ja i september; "Kommer snart"-korten ska levereras. | M | 2 till 4 dec |
| A12 | Uppsägningsbrevsmall | **Kör** | Mallavsikt på fel sida i dag. | S | 5 till 6 dec |
| A13 | Tre yrkespar | **Kör** | Hantverksyrkena saknas. | M | 7 till 11 dec |
| V1 | Länkar på logiska-tester och navet, Matrigma | **Väntar** | Avläsningen 7 dec. | S | 8 till 9 dec |
| V2 | Figursidan | **Väntar** | Avläsningen 7 dec av logiska-tester. | M | 8 till 11 dec |
| V3 | Kontostegets utformning | **Väntar** | Avläsningen 8 dec. | M | beslut 8 dec |
| V4 | Dagspasset | **Väntar** | Avläsningen från 23 nov. | S | beslut 8 dec |
| | M1 och M8 | **Ägarbeslut** | 301, ägarbeslut enligt huvudordsplanen; inga 301 under julen. | | |

## 2. Avgöranden där plan, sälj och saas-lead skilde sig

| Fråga | Avgörande | Skäl |
|---|---|---|
| Vad som väntar | Bara det som beror på en avläsning hos oss | Ägarens regel 14 nov kväll. |
| U11:s titel | "Alva logiktest: öva gratis och förstå resultatet 1 till 10" | Övningen först som sälj ville, och de största frågorna (852 visningar mot 281). |
| U11:s ordning | Provet ovanför tabellen (redan så), "göra om" slutar med provet och valet Alva | Säljs. |
| Backning av U11 | Minus 30 procent klick på 14 dagar vid visningar inom 20 procent, läses 2 dec | Säljs regel. |
| Prov på stanine-sidan | Ett, I-provets | Två prov på en sida är oprövat. |
| Prisraden under kampanjen | Artiklarna följer kampanjen, kontostegets rad orörd | Visning av beslutat pris; kontosteget mäts. |
| Kampanjköp | Räknas för sig, köpmålen bedöms utan | Säljs. |
| Kontosteget | Felen nu, utformningen 8 dec | Säljs. |
| Komponentsteg | Före 23 nov eller direkt efter 30 nov | Frysen gäller komponenter, inte ren MDX. |
| Kontomål | Alva 1,5 gånger takten före 16 nov; tips, stanine och myndigheter 6 konton 9 feb; de nya testsidorna 15 den 9 mar | Räknat på dagens 19 procent. |
| Köpmål 9 mar | 3 till 6 köp på 28 dagar, utan kampanjköp | Säljs. |

## 3. Avläsningar

Som i H: 22 till 23 nov dag 2-väggen och köpknappen, 2 dec Alva, 7 till 8 dec kontosteget före och efter felrättningen, namnfältet, sidorna och Dagspasset, 18 dec baslinje med och utan kampanjköp, 23 och 30 dec kampanjköparna, 19 jan efter jul och huvudorden, 9 feb huvudavläsningen, 9 mar köpen. Julveckorna 21 dec till 6 jan räknas inte in i trender.

## 4. Ägarens handgrepp

1. Begära indexering i Search Console: alva-labs-logiktest, numeriskt-test-guide och verbalt-test-guide 16 nov; varje ny sida och huvudordens målsidor samma dag de publiceras.
2. Push till main enligt datumen i H: kodens första omgång senast 20 nov, huvudorden och hubben senast 22 nov, artiklarna löpande. Inget som ändrar publika komponenter 23 till 30 nov.

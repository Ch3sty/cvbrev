# Faktagranskning: content/artiklar/hur-ofta-byta-jobb.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, artikeln vilar på två siffror och båda behöver rättas: SCB-meningen blandar två källor från olika år, och Riksbankssiffran saknar år och säger mer om unga än källan.

## Fynd att åtgärda

| Rad | Citat ur texten | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 14, 31, 36, 90, 106 | "Enligt SCB ligger snittet i storleksordningen kring fem år, vilket faktiskt är kortare än EU-genomsnittet. Sverige hör till de länder i Europa där rörligheten på arbetsmarknaden är störst." | fel | Meningen blandar två källor. "Fem år" kommer från SVT 2018 som hänvisar till SCB ("I snitt stannar anställda inte längre än fem år på en och samma arbetsplats"), utan EU-jämförelse. EU-jämförelsen kommer från en SCB-undersökning för DU & Jobbet 2010 som angav sju år ("I Sverige stannar vi på samma jobb i snitt sju år, vilket är lägre än EU-genomsnittet"), och rörlighetsmeningen från EU-rapporten "Mobility in Europe", inte från SCB. Stryk EU-jämförelsen eller ersätt med OECD:s statistik över anställningstid (enligt sekundära utdrag drygt 8 år för Sverige 2021, kortare än Tyskland, Frankrike, Italien; verifiera i OECD Data Explorer innan publicering). Om fem år behålls: "enligt SCB, återgett av SVT 2018". | https://www.svt.se/nyheter/lokalt/vasterbotten/vi-byter-jobb-allt-oftare ; https://www.ingenjoren.se/2010/05/06/svenskar-byter-jobb-ganska-ofta/ |
| 16, 44, 91, 110 | "Enligt Riksbanken har de som byter jobb i snitt omkring tre procentenheter högre löneutveckling än de som stannar kvar, och skillnaden är ännu större för yngre och högutbildade" | fel (delvis) | Riksbanken, Ekonomiska kommentarer nr 10, 2018: de som bytt arbete 1998–2016 hade "i genomsnitt haft nästan 3 procentenheter högre löneinkomstutveckling". Premien är "större ju högre utbildningsnivå", och för ålder bara att det är "vanligare med större premier i unga år" (fotnot: unga ökar också sina arbetstimmar). Ersätt med: "Riksbanken fann 2018 att de som bytte jobb 1998–2016 i snitt hade nästan tre procentenheter högre löneinkomstutveckling än de som stannade, och att premien var större ju högre utbildning de hade." | https://www.riksbank.se/globalassets/media/rapporter/ekonomiska-kommentarer/svenska/2018/vilka-byter-arbete-och-ar-lonepremien-for-att-byta-arbete-konjunkturellt-normal.pdf |
| 126 | Källrad: "statistik om rörlighet på arbetsmarknaden från SCB" med länk till scb.se startsida | obelagt | Länken går till SCB:s startsida och belägger inget. Byt till den faktiska källan (se ovan) eller stryk. Byt även Kollega mot Riksbankens original. | Se ovan |
| 12, 31, 102 | "en vanlig tumregel är ungefär vartannat till vart femte år" | obelagt | Ingen källa. Formuleras som tumregel; skriv "vår tumregel" eller stryk "vanlig". | Ingen |

## Belagda påståenden
- Lönen förhandlas friast vid nyanställning är rimligt resonemang, inte siffra; ingen källa krävs.
- Interna länkar /rakna-ut/lon-efter-skatt och /rakna-ut/loneforhandling finns (src/app/(public)/rakna-ut/).
- Högre lönepremie ju högre utbildning (rad 44): Riksbanken 2018, URL ovan.

## Rättning (omgång 1, 2026-11-15)
- Rad 14, 31, 36, 90, 106 SCB/EU: EU-jämförelsen och meningen om rörligheten i Europa strukna överallt (brödtext och FAQ i frontmatter och brödtext, lika). Fem år behållet med korrekt källa: "enligt SCB-siffror som SVT återgav 2018" (kontrollerat i SVT-artikeln 2026-11-15: "I snitt stannar anställda inte längre än fem år på en och samma arbetsplats"). Brödtexten fick tillägget att siffran har några år på nacken. Sammanfattningen: "Svenskar stannar i snitt kring fem år enligt SCB-siffror från 2018". OECD-siffran lades inte till (inte verifierad i förstahandskälla).
- Rad 16, 44, 91, 110 Riksbanken: rättat till "Riksbanken fann 2018 att de som bytte jobb åren 1998–2016 i snitt hade nästan tre procentenheter högre löneinkomstutveckling än de som stannade kvar, och att premien var större ju högre utbildning de hade". "yngre" struket. FAQ lika på båda ställena. Rad 91 (bara "högre löneutveckling") stämmer och lämnades.
- Rad 126 källraden: SCB:s startsida och Kollega ersatta med Riksbankens original (Ekonomiska kommentarer nr 10, 2018) och SVT 2018.
- Rad 12, 31, 102 "en vanlig tumregel": ändrat till "vår tumregel" (FAQ lika).
- Bilden omgjord: underlaget citerade "omkring tre procentenheter högre löneutveckling" och visade "+3". Nu summa "≈ 3" med källa "nästan tre procentenheter högre löneinkomstutveckling" och summaText "procentenheter högre löneinkomstutveckling än de som stannade kvar". alt ändrad:
  - före: "Lönekort om hur ofta man ska byta jobb: tre procentenheter högre löneutveckling vid byte"
  - efter: "Lönekort om hur ofta man ska byta jobb: nästan tre procentenheter högre löneutveckling vid byte"
  imageAlt och CustomImage-alt uppdaterade lika. `npx tsx scripts/artikelbild/artikelbild.ts hur-ofta-byta-jobb` gick utan fel; QA-bilden granskad.
- updated: "2026-11-15" tillagt. Ingen rubrik, FAQ-fråga, title eller description ändrad. Inga interna länkar borttagna.

## Andra granskningen (2026-11-15)
GODKÄND. Kontrollerat: SVT 12 nov 2018 "I snitt stannar anställda inte längre än fem år på en och samma arbetsplats" i en artikel byggd på SCB-data; Riksbanken, Ekonomiska kommentarer nr 10 2018: "sysselsatta personer som bytt arbete under perioden 1998-2016 har i genomsnitt haft nästan 3 procentenheter högre löneinkomstutveckling än de som inte bytt arbete ... större ju högre utbildningsnivå". EU-jämförelsen och "yngre" är borta överallt. Bilden visar "≈ 3" och "procentenheter högre löneinkomstutveckling än de som stannade kvar", imageAlt och CustomImage-alt lika. Strecket i "1998–2016" är ett intervall, inget talstreck.

## Svar till samordnaren
hur-ofta-byta-jobb, GODKÄND, inga brister.

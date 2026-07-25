# Plan: /rakna-ut, kalkylatorhubb som länkmagnet

Planerad 2026-07-25. Syfte: verktygssidor byggda för att hittas, rankas och få
länkar. Egna URL:er per verktyg (inbäddade komponenter drar inga länkar till
sig själva), inget konto, ingen kvot. Namnet /rakna-ut matchar sökmönstret
"räkna ut X".

## Struktur

- `/rakna-ut` hubb, grupperad "För dig som söker jobb" / "För dig som anställer"
- `/rakna-ut/[verktyg]` en sida per verktyg: verktyget överst, metodsektion
  ("Så räknar vi", med källor och årtal), synlig FAQ + FAQPage-schema,
  relaterade artiklar. Klientkomponenter i `src/components/rakna/`,
  data som statisk JSON per år i `src/data/`.

## Verktygen (prioritetsordning)

1. **lon-efter-skatt** – flaggskeppet. Bygger på Skatteverkets RIKTIGA
   skattetabeller 2026 (kolumn 1/3, månadslön), inte formelapproximationer,
   plus kommunvalet ur Skatteverkets öppna data (290 kommuner).
   Differentiering mot Ekonomifakta m.fl.: jämförelseläget (två löner eller
   två kommuner, dvs. jobbytes-/förhandlingsvinkeln). Över tabellens tak
   (80 000 kr) extrapoleras med tabellens toppmarginal, redovisat i metod.
2. **uppsagningstid** – LAS 11 § (verifierad ordagrant): minst 1 mån,
   arbetsgivarens uppsägning 2/3/4/5/6 mån vid 2/4/6/8/10 års anställningstid,
   egen uppsägning 1 mån. Provanställning: besked, ingen uppsägningstid (6 §).
   Kollektivavtalsdisclaimer alltid synlig.
3. **timlon-till-manadslon** – 174-timmarsschablonen (40 h/v), justerbar.
4. **semesterersattning** – semesterlagen: procentregeln 12 % (16 b §),
   semestertillägg 0,43 %/dag vid månadslön (16 a §), semesterersättning
   enligt samma grunder (28-29 §§).
5. **vad-kostar-en-anstalld** – arbetsgivaravgift 31,42 % (20,81 % upp till
   25 000 kr/mån för 18-22-åringar apr 2026-sep 2027), ITP1-premier per
   Avtalat (4,5 % upp till 52 125 kr/mån, 30 % däröver; TGL ~0,09 %,
   TFA 0,02 %, TRR netto 0,25 %), särskild löneskatt 24,26 % på
   pensionspremier, semestertillägg. Rekryteringsbryggan: länkar
   vakanskostnad/vad-kostar-en-rekrytering i insikterna.
6. **loneforhandling** – ackumulerad effekt av en höjning över 5/10/20 år,
   inga externa datapåståenden, användarens egna antaganden.

Standalone-sidor som lyfter befintliga B2B-komponenter (redan byggda, får
egna länkbara URL:er): **felrekrytering**, **sourcing**, **traffsakerhet**.

## Verifierade dataparametrar (2026)

- Prisbasbelopp 59 200 kr, skiktgräns 643 000 kr, brytpunkt 660 400 kr
  (under 66), förstärkt jobbskatteavdrag, avtrappningen slopad.
- Skattetabeller: Skatteverkets fil allmanna-tabeller-manad (fixed width:
  3 tecken dgr, 2 tabellnr, 7+7 inkomstintervall, 6×5 kolumner).
  Sanity-checkad: tabell 33 vid 34 601-34 800 ger 7 084 kr (kolumn 1),
  toppmarginal 53 % ≈ kommunalskatt + statlig.
- Kommunalskatt: Skatteverkets rowstore-API år 2026, 290 kommuner,
  riksgenomsnitt 32,38 % (SCB). Tabellnr = summa skattesatser avrundad
  (inkl. begravningsavgift + kyrkoavgift för medlemmar).
- Inkomstbasbelopp 83 400 kr (7,5 ibb = 52 125 kr/mån, matchar Avtalat).

## SERP-läget

Lön efter skatt: trång nisch med dedikerade domäner; vi vinner inte på
"kalkylator" ensamt utan på jämförelsevinkeln + riktiga tabeller + sajtens
lön/karriärkluster runt om. Vad kostar en anställd: Fortnox/verksamt/
Driva Eget; vår vinkel är rekryteringskopplingen. Uppsägningstidräknare:
nästan tom SERP, snabbast vinst.

## Inbäddningar i befintligt innehåll

- saga-upp-sig + provanstallning: UppsagningstidRaknare
- loneforhandling: LoneforhandlingsKalkylator
- byta-jobb-praktiska-tips, loneansprak-intervju, hur-ofta-byta-jobb:
  textlänkar till relevanta verktyg
- Insikterna vad-kostar-en-rekrytering/vakanskostnad länkar
  vad-kostar-en-anstalld (och omvänt)

## Underhåll och räcken

- Årsrevision i januari: nya skattetabeller, kommunsatser, basbelopp,
  avgifter. Årtal i rubrik och metodtext på varje sida.
- Ungdomsnedsättningen upphör 30 sep 2027, revideras då.
- Bara myndighetsdata och namngivna källor, disclaimern "vägledning, inte
  rådgivning" på juridik/skatt. Inga påhittade siffror.
- Sitemap: statiska poster. GSC-filter på /rakna-ut/ från dag ett,
  avstämning 3-4 veckor per våg. Footer-/navlänk tas när volymen motiverar.

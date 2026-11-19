# Säljs granskning av textdäcket 2026-11-19

Säljansvarig för rekryteringstesterna. Jämfört med genomgang-salj-2026-11-19.md, mejlmallen src/lib/email/campaign-kampanj.ts, paywall-copy.ts och TypProvKort.tsx. Ingen kod och inget däck är ändrat. Allt nedan gäller svepet före 23 november.

## Sammanfattning

| Punkt | Beslut |
|---|---|
| T1 Gratisraden med dagsgränsen | Godkänd, med en ändring (FAQ-svaret) |
| T2 Åtta testtyper och personlighetstestet | Godkänd, med en ändring (rubrikGratis) |
| T3 Träning utan tak | Godkänd, med en ändring (Startsidan) och ett test som saknas |
| Mejlen, stycke 2 | Ändring. Ny text nedan |
| T6 Typbeskrivningar | Godkänd |
| Öppen fråga 3, spatialkortets rubrik | SEO:s väg. Ny rubrik nedan |
| T8 Bankbredden | Godkänd |
| T9 Play-butiken | Godkänd med tre ändringar, inom Googles policy |
| T11 "Dagens grundnivåtest är gjort" | Godkänd |
| Saknas i däcket | F4, sekundärknappen på testväggen |

## T1. Gratisraden med dagsgränsen

Säljer och är sann. Dagsgränsen gör gratisnivån tydligt mindre än Premium, och det hjälper Black Week. Inget löfte vi inte kan hålla.

**Ändring, rekryteringstester-faq-data.ts:103.** `GRUNDNIVAN_ALLA_DAG + ', i vilken testtyp du vill'` blir "grundnivån i alla åtta testtyperna, ett test om dagen, i vilken testtyp du vill". Det säger samma sak två gånger. Stryk `, i vilken testtyp du vill` i just den meningen.

## T2. Åtta testtyper och personlighetstestet

Godkänd. "3 av 8 mätta, alla nivåer öppna" håller och följer beslutet.

**Ändring, hem/copy.ts:98 (rubrikGratis).** "Åtta testtyper, ett grundnivåtest om dagen gratis" har ordet "gratis" sist och läses tungt. Ny text: `${antal} testtyper, ett gratis grundnivåtest om dagen`. HemVy.test.tsx:91 följer samma text.

## T3. Träning utan tak i stället för "ett pass om dagen"

Godkänd. Det här är den viktigaste rättelsen före Black Week, och testväggens nya brödtext är bättre än mitt eget F3 eftersom den också säger "träning på din nivå utan tak".

**Ändring, Startsidan.tsx:231.** "träningen följer din nivå och tar det du tappar" är otydligt. Ny text: `träningen följer din nivå och lägger tiden där du tappar`.

**Saknas i däcket:** PaywallCard.kampanj.test.tsx:96 väntar sig den gamla test-tak-texten ("... träning utan tak, varje dag."). Den ska få den nya texten, annars faller testet.

## Black Week-mejlens stycke 2

Ägarens beslut: inga tal i stycke 2 förrän en konstant finns. "Åtta" kommer ur ANTAL_TESTTYPER och får stå, men ska hämtas via `TESTTYPER_ORD` i koden, inte skrivas in för hand.

Däckets text har fyra problem i sitt sammanhang:

1. **För lång.** Stycke 1 har redan tre meningar om pris och övningsprov. Det nya stycket blir fyra meningar och skjuter ned priset och knappen.
2. **Listan av uppgiftstyper.** Min regel är att de nya uppgiftstyperna visas som bild, inte som lista i löptext. "Sanningssägare och lögnare" säger inget utan exempel.
3. **"Uppgifterna är fler sorter än förut"** är klumpigt, och "än förut" utgår från att läsaren har tränat hos oss. Mejlet går till gratiskonton, och många av dem har aldrig tränat.
4. **Mätregeln saknas.** Det är vårt starkaste argument som inte behöver något tal, och det står inte i mejlet.

**Black Week, ny text:**

> Du tränar på din nivå så ofta du vill, i alla åtta testtyperna, och nivån räknas bara på uppgifter du inte sett den senaste månaden. Vill du ha struktur lägger vi upp en plan fram till ditt provdatum. CV, personliga brev, Jobbcoachen och jobbmatchningen ingår också. Allt inför ansökan på ett ställe, hela veckan till och med söndag.

**Cyber Monday:** godkänd utan den andra meningen. Det är ett mejl med en enda dag på sig, och nyheterna tar fokus från priset. Ny text:

> Gör övningsprovet med tid, se var du tappar poäng och träna på din nivå så ofta du vill tills det är dags på riktigt. CV, personliga brev och Jobbcoachen följer med.

Båda texterna lovar bara det som koden gör: Premium har inget tak för träning, och regeln om 30 dagar finns i settInomFonstret. Planen fram till provdatum fanns redan i den gamla texten. docs/kampanj/copy-black-week-2026.md får samma text.

## T6. Typbeskrivningar

Godkänd. Spatial, deduktivt, matris och figurserier säger nu vad som finns i banken, och inget löfte går utöver facit. Typkorten på testsidan är en av våra största ytor, så det är bra att de kommer med före frysen.

## Öppen fråga 3. Rubriken på spatialkortet i TypProvKort

Jag ändrar mig och går på SEO:s linje. Knappen går till `/dashboard/tester/spatial-grund`, där kropparna finns. Rubriken ska beskriva det läsaren får när hon klickar, inte I-provets deltest. "Kroppar" ensamt säger inget, så produkttermen ska stå med.

**Ny rubrik, TypProvKort.tsx:72:** `Vridna figurer, pappersvikning, tärningar och kroppar av kuber`

Texten på rad 73 står kvar.

Knapparna för talserier, spatial och ordförråd säger "Gör nivåtestet i ...", men Nivåkollen finns inte i de typerna och knappen leder till grundnivån. Det hör till nästa omgång, men det bör stå "Gör grundnivån i ...".

## T8. Bankbredden

Godkänd. Texten följer mina regler: "över 3 000" visas bara som bild, aldrig 3 533, aldrig "ingen samma uppgift". Mätregeln står ensam tills bilden finns.

## T9. Play-butiken

Inom Googles policy. Texten har inga superlativ, ingen uppmaning av typen "ladda ner nu", inga omdömen och inget kampanjpris. Priset på 149 kr står bara i beskrivningen, och där är det tillåtet. Båda felen från min genomgång ("låser upp alla testtyper", "dagens grundpass") är rättade.

Tre ändringar:

1. **Kort beskrivning.** Däckets text tappar ordet "rekryteringstest", som är vårt viktigaste sökord i butiken. Ny text: `Öva rekryteringstest och I-provet. Åtta testtyper, regeln efter varje svar.` (75 tecken)
2. **"Samma format som proven arbetsgivare använder."** Det är ett påstående utan belägg i butiken. Ny text: `I de format som arbetsgivarnas tester brukar ha.` Byt också "figurer och mönster" i uppräkningen mot `matrislogik`, så att namnen stämmer med appen och webben.
3. **"Tio minuter om dagen räcker långt."** Det lovar en effekt. Ny text: `Tio minuter om dagen på din nivå.`

Påminnelsen finns i koden (src/lib/mobilapp/notis.ts), så den raden kan stå kvar. Kontrollera ändå att den finns i den AAB som skickas in.

## T11. Rubriken "Dagens grundnivåtest är gjort" på test-tak

Godkänd. Den har samma ord som Hem, är sann både i v4 och i den äldre TestHubPage, och lovar inget. Brödtexten under (T3) säljer.

## Saknas i däcket: F4

Sekundärknappen "Kör grundnivån igen" på testväggen (paywall-copy.ts:282) leder rakt in i kvotspärren när dagens grundnivåtest är gjort. Det är testvägen som står för 7 av 9 köp. Knappen ska visa `Se vad som ingår` när grundKvarIdag är 0. Det behövs ingen ny text, bara ett villkor. Ta med det i samma svep.

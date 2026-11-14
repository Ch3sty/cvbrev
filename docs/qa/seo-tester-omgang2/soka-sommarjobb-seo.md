# SEO-granskning: /artiklar/soka-sommarjobb (A9, plan-content rad 13)

Granskat 2026-11-14 av SEO-strategen. Bara läst, inget ändrat i innehållsfilerna.

## Utlåtande: UNDERKÄND

Underkänd bara för att titeln och två H2:or säger emot kannibaliseringsbeslutet. Felen 1 till 3 är fyra radändringar. När de är gjorda är sidan godkänd och behöver ingen ny SEO-granskning. Allt annat håller, och innehållet slår alla tre sidorna i benchmarken.

## Fel att rätta

**1. seoTitle konkurrerar om "sommarjobb cv" (rad 3)**

> `seoTitle: "Söka sommarjobb 2027: datum, regler, lön och CV"`

Titeltaggen är den starkaste signalen vi har, och "CV" i den gör artikeln till en fjärde URL för "sommarjobb cv". Search Console delar redan visningarna på tre sidor. Byt "CV" mot skatt, som är ett eget delämne utan exempelsida:

> `seoTitle: "Söka sommarjobb 2027: datum, regler för unga, lön och skatt"` (59 tecken)

"regler för unga" fångar också autoförslagen "sommarjobb regler 15 år" och "sommarjobb 16 år regler".

**2. H2:n matchar "cv för sommarjobb" ordagrant (rad 142)**

> `## Hur skriver du ett CV för sommarjobb?`

Det är exakt den fras som /cv-mallar/sommarjobb ska ta (pos 19,3). Avsnittet är kort och skickar läsaren vidare till exemplen, och det är rätt upplägg. Rubriken ska däremot inte konkurrera:

> `## Vad vill arbetsgivaren se i din ansökan?`

Brödtexten, CVExample och länkarna på rad 144 till 162 behåller du som de är.

**3. H2:n matchar "personligt brev sommarjobb" och är inte frågeformad (rad 164)**

> `## Personligt brev till sommarjobb: kort och konkret`

Brevexemplet ligger på pos 33 för den frasen. Rätta till:

> `## Hur kort ska det personliga brevet vara?`

**4. H2 som inte är frågeformad (rad 172)**

> `## Så sticker du ut när många söker samma jobb`

Rätta till:

> `## Hur sticker du ut när många söker samma jobb?`

**5. description lovar CV-svaret (rad 5).** Det här felet är litet men hör ihop med fel 1.

> `... ungdomslönen och hur CV:t ska se ut.`

Rätta till (145 tecken, sökordet först):

> `description: "Söka sommarjobb 2027? Se när kommuner och regioner öppnar, hur mycket du får jobba som 15- eller 16-åring, ungdomslönen och när du slipper skatt."`

## Kannibaliseringsbeslutet

**Beslutet håller.** Skälen:

- "sommarjobb cv", "cv för sommarjobb" och "cv sommarjobb" är mall- och exempelfrågor. Den som söker vill ha ett CV att utgå från, inte en guide. /cv-mallar/sommarjobb ligger redan närmast sida ett (pos 17,8 till 19,7) och är rätt sida att lyfta.
- Problemet för "sommarjobb cv" är inte att en sida saknas. Problemet är att Google visar fel sida: 80 av 114 visningar går till brevexemplet på pos 58,6. En artikel med CV i titeln skulle sprida signalen ännu mer.
- Planens mätpunkt bygger på äldre siffror (307 visningar, pos 46 på 100 dagar). Med 0 klick på 230 visningar finns det ingen CV-trafik att ta från exempelsidorna, bara en risk att dra ner dem.
- "söka sommarjobb" har noll visningar hos oss. Den luckan, och autoförslagen om 2027, orter, regler per ålder och lön, är artikelns egen mark. Ingen av exempelsidorna kan ta den.

**Taggarna (rad 8) ska stå kvar som de är.** Taggar påverkar inte rankningen. I vår kod styr de tre saker: "personligt brev sommarjobb" ger brevkortet som CTA, vilket är planens val. Tas den bort faller klustret till career via "lön sommarjobb", och då blir det ingen produkt-CTA alls (`clusterHasProductCta`). "cv sommarjobb" lägger in CVTemplateShowcase mitt i texten, och det vill vi ha. De styr också relaterade artiklar. Att de dessutom hamnar i schemats `keywords` spelar ingen roll, för Google läser inte det fältet.

## Ny mätpunkt (ersätter "sida ett för 'cv för sommarjobb' före 1 februari")

Avläses enligt SEO-planens datum 19 januari, 9 februari och 9 mars:

1. **9 februari:** sidan har minst 300 visningar på sommarjobbsfrågor utan "cv" eller "brev" i frågan, och topp 20 för minst en av "söka sommarjobb", "sommarjobb 2027", "sommarjobb 16 år regler" eller "lön sommarjobb 16 år".
2. **9 mars:** minst 30 klick på sidan sedan publicering, och PostHog visar klick från artikeln vidare till någon av de tre exempelsidorna eller till /verktyg/skapa-cv.
3. **Kannibaliseringsvakt vid varje avläsning:** /artiklar/soka-sommarjobb ska inte vara URL:en som rankar för "sommarjobb cv" eller "cv för sommarjobb", och /cv-mallar/sommarjobb får inte tappa från pos 17,8. Om artikeln dyker upp på CV-frågorna ska rubrikerna ses över igen.

## Kontroller

| Kontroll | Resultat |
|---|---|
| seoTitle | 47 tecken, sökordet först. Underkänd på innehållet (fel 1), inte på längden |
| description | 143 tecken, "Söka sommarjobb 2027" först. Se fel 5 |
| Taggar | 8 st, OK |
| FAQ | 6 i frontmatter, 6 synliga FAQItem, frågor och svar identiska tecken för tecken |
| Snabbsvar | Rad 30, direkt efter ingressen |
| Frågeformade H2:or | 6 av 9. Rad 164 och 172 rättas i fel 3 och 4. Rad 188 är frågeformad |
| Interna länkar | Alla 14 finns: sex artiklar i content/artiklar, /cv-exempel/sommarjobb och /cv-exempel/gymnasieelev (publicerad.ts), /personligt-brev-exempel/sommarjobb (publicerad.ts), /cv-mallar/sommarjobb (yrkesmall-data.ts), /rakna-ut/timlon-till-manadslon, /rakna-ut/lon-efter-skatt, /verktyg/skapa-cv, /verktyg/personligt-brev |
| Tabeller | Tre tabeller, alla som JSX `<table>` |
| Kampanjord | Inga (inget pris, ingen rabatt, inget "gratis") |
| Talstreck och mittpunkter | 0 |
| Bild | soka-sommarjobb.webp finns, 79 kB, alt-text beskriver bilden och innehåller sökordet |
| Längd | Omkring 2 400 ord, i nivå med jobbsafari (2 200) och jobbland (2 500) |

## Konkurrensjämförelse

- **jobbsafari.se:** gammal skattegräns, inga AFS-hänvisningar, inga avtalslöner. Vi har 2026 års gräns, AFS 2023:2 kapitel 8 och två avtal med belopp per ålder.
- **jobbland.se:** står kvar på 2026. Vi har 2027 i titeln och sex ansökningsdatum för 2027.
- **sommarjobb.se/lagar-och-regler:** korrekt om AFS men saknar lön, skatt och datum. Vi har alla tre. sommarjobb.se rankar dessutom startsidan på "Sommarjobb 2027 för unga".
- **Ny konkurrent som inte fanns i benchmarken:** firstbemanning.se/sommarjobb-2027, med titeln "Sommarjobb 2027: ansökningsdatum, lön och åldersgränser". Det är nästan exakt vår vinkel. Ett bemanningsföretag har inte samma källhänvisning som vi, men räkna med att den ligger före oss i januari.

## Länken från cv-exempel-student-nyexaminerad (rad 142)

> Ska du söka sommarjobb? I guiden [söka sommarjobb 2027](/artiklar/soka-sommarjobb) går vi igenom ...

Godkänd. Ankartexten är exakt huvudsökordet, länken står där läsaren just har sett sommarjobbsprofilen, och samma mening skickar CV-frågan vidare till /cv-exempel/sommarjobb. Det stärker beslutet. Inget är borttaget.

## Förslag (frivilliga)

1. **Länka tillbaka från exempelsidorna.** Ingen av /cv-exempel/sommarjobb, /personligt-brev-exempel/sommarjobb eller /cv-mallar/sommarjobb länkar till guiden. En mening i deras seoIntro gör klustret komplett: guiden tar helheten och exemplen tar CV:t och brevet.
2. **Separat uppgift för exempelsidornas metadata (utanför A9).** cv-exempel har `metaTitle: 'CV Exempel Sommarjobb 2026 - Professionell Mall | Jobbcoach.ai'` och brevexemplet har `'Personligt Brev Sommarjobb - Exempel & Mallar för Unga 2026'` och "Perfekt för studenter!" i description. Byt till 2027 i december och ge /cv-mallar/sommarjobb "CV för sommarjobb" först i titeln. Det är där "sommarjobb cv" ska vinnas.
3. **Skriv ut 15 år.** Autoförslagen säger "cv sommarjobb 15 år" och "sommarjobb regler 15 år". I åldertabellen (rad 89) kan "13 år och uppåt, tills du är ungdom" bli "13 till 15 år, tills du är ungdom".
4. **Göteborg på rad 58.** Tabellen har Göteborgs sommarvikariat, men rad 58 säger att Göteborg inte publicerat datum. Skriv "Göteborgs feriejobb för unga" så att läsaren förstår att det gäller det andra programmet.
5. **Ortsfrågorna.** "sommarjobb 2027 stockholm/göteborg/malmö" finns bland autoförslagen. Orterna står redan i tabellen, men en mening i brödtexten under tabellen som nämner alla tre ger dem textstöd.
6. **Fler avtal.** Konkurrenterna har ofta med lager och e-handel (Handels lageravtal). En tredje rad i lönetabellen skulle ta "lön sommarjobb lager", om beloppet kan bekräftas hos Handels.
7. **Uppdatera skattegränsen i januari.** Rad 17, 136 och 140 och FAQ 4 säger att 2027 års gräns saknas. Lägg in den vid revisionen i januari, före ansökningstoppen.

## Runda 2

Granskat 2026-11-14 av SEO-strategen. Bara läst, inget ändrat i innehållsfilerna.

### Utlåtande: GODKÄND

Alla fem fel är rättade ordagrant enligt rättelserna ovan.

| Fel | Resultat |
|---|---|
| 1. seoTitle | "Söka sommarjobb 2027: datum, regler för unga, lön och skatt", 59 tecken, "CV" borta. OK |
| 2. H2 rad 148 | "Vad vill arbetsgivaren se i din ansökan?" Brödtext, CVExample och länkar orörda. OK |
| 3. H2 rad 170 | "Hur kort ska det personliga brevet vara?" OK |
| 4. H2 rad 178 | "Hur sticker du ut när många söker samma jobb?" OK |
| 5. description | Slutar med "när du slipper skatt", 145 tecken, sökordet först. OK |

Nu är alla nio H2:or frågeformade, och ingen av dem matchar "cv för sommarjobb" eller "personligt brev sommarjobb". Två av de frivilliga förslagen är också gjorda: förslag 3 (rad 89, "13 till 15 år") och förslag 4 (rad 58, "Göteborgs sommarjobb för unga"). Talstreck: 0.

**Notering, inte krav:** H1:n (`title`, rad 2) slutar fortfarande på "lön och CV". Det spelar mindre roll än titeltaggen, och jag flaggade det inte i runda 1. Om kannibaliseringsvakten vid avläsningen 19 januari visar att artikeln dyker upp på "sommarjobb cv" är det första stället att ändra, då till "lön och skatt" som i seoTitle.

Mätpunkterna och kannibaliseringsvakten ovan gäller oförändrat.

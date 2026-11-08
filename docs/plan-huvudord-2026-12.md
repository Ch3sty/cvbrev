# Plan för huvudorden till december 2026: "cv mall", "personligt brev", "cv exempel"

Skriven 2026-11-08 efter analysen samma dag (punkt 13 i `docs/plan-efter-analys-2026-11-08.md`). Bara plan. Inget byggs, slås ihop eller omdirigeras förrän ägaren har sagt ja till avsnitt 4.

Underlag: Search Console per fråga och sida, P1 = 14 sep till 11 okt, P2 = 12 okt till 6 nov (`scratchpad/analys-2026-11-08/gsc/raw-qp.json`), och sökresultatet för de tre orden 8 nov.

## 1. Läget

| Fråga | Visningar P1 → P2 | Klick P2 | Våra sidor som syns (visningar P2, position) |
|---|---:|---:|---|
| cv mall | 41 → 157 | 0 | cv-mall-gratis-guide (65, 75), /cv-mallar (49, 31), /exempel (27, 61), skriva-cv-guide (15, 90) |
| cv mallar | 35 → 96 | 0 | cv-mall-gratis-guide (36, 84), /verktyg/cv-mallar (31, 65), /exempel (28, 64) |
| gratis cv mall / cv mall gratis | 49 → 118 | 0 | cv-mall-gratis-guide (113, 73 till 75) |
| personligt brev | 84 → 340 | 0 | vad-ar-ett-personligt-brev (139, 66), skriva-personligt-brev-guide (86, 18), cv-och-personligt-brev (52, 67), personligt-brev-jobbansokan (35, 28), hur-skriver-man-ett-personligt-brev (10, 88) |
| personligt brev mall | 7 → 210 | 0 | skriva-personligt-brev-guide (115, 26), personligt-brev-mall-gratis (53, 17), rubrik-for-personligt-brev (24, 87) |
| personligt brev exempel | 176 → 388 | 1 | /personligt-brev-exempel/student (93, 30), personligt-brev-exempel-generella (75, 58), personligt-brev-jobbansokan (64, 19), /personligt-brev-exempel (42, 27), bra-personligt-brev (34, 86) |
| cv exempel | 84 → 327 | 1 | /cv-exempel (112, 32), /exempel (111, 44), cv-exempel-yrken (47, 54), skriva-cv-guide (29, 92), fardigheter-cv-exempel (27, 78) |

Tre saker syns i tabellen:

1. **Efterfrågan växer snabbt** (×3 till ×4 visningar på fyra veckor), men vi står på sida 3 till 8.
2. **Vi delar upp oss själva.** Varje huvudord visas med fyra till sex olika sidor, och ingen av dem är tydligt utsedd. Google byter sida mellan perioderna (cv mall: P1 nästan bara guiden, P2 fyra sidor). Det är kannibalisering, och den är huvudskälet till att ingen sida når upp.
3. **Fel sidtyp vinner hos oss.** Sökresultatet för "cv mall" och "cv exempel" domineras av galleri- och verktygssidor (Unionen, cvkungen, cv-mallen.se, cv-mall.com, cv-mallar.se). För "personligt brev" toppar Wikipedia, Akavia, Vision och Academic Work med guider. Hos oss är det ofta artiklar som visas för galleriorden och en definitionssida för brevordet.

## 2. Målsida per huvudord (en sida, inte fem)

| Huvudord och nära varianter | Målsida | Varför | Stödsidor som ska länka till målsidan med ordet i ankartexten |
|---|---|---|---|
| cv mall, cv mallar, gratis cv mall | **/cv-mallar** | Bäst position (31) och rätt sidtyp: ett galleri, som konkurrenterna i topp. | cv-mall-gratis-guide, cv-mall-word-gratis, cv-mall-pdf-gratis, /exempel, /verktyg/cv-mallar, startsidan |
| personligt brev, hur skriver man ett personligt brev | **/artiklar/skriva-personligt-brev-guide** | Bäst position (18) och guide, som Akavia och Vision i topp. | vad-ar-ett-personligt-brev, cv-och-personligt-brev, personligt-brev-jobbansokan, hur-skriver-man-ett-personligt-brev, tips-pa-personligt-brev, bra-personligt-brev |
| personligt brev mall | **/artiklar/personligt-brev-mall-gratis** | Mallavsikt; ligger på 17 trots att guiden får fler visningar. | skriva-personligt-brev-guide, personligt-brev-mall-word |
| personligt brev exempel | **/personligt-brev-exempel** | Galleriet med alla yrkesexempel är det bästa svaret på avsikten. | personligt-brev-exempel-generella, personligt-brev-jobbansokan, yrkessidorna |
| cv exempel | **/cv-exempel** | Bäst position (32), galleri med alla yrkesexempel. | /exempel, cv-exempel-yrken, exempel-pa-cv-guide, skriva-cv-guide |

## 3. Åtgärder utan ägarbeslut (december, i den här ordningen)

1. **Titel och h1 på målsidorna.** Huvudordet först, löfte om det sökaren vill ha: antal mallar, gratis, Word och PDF, antal yrken. Kontroll mot SEO-diffen och undantag med datum.
2. **Innehåll ovanför vecket på galleriorna (/cv-mallar, /cv-exempel, /personligt-brev-exempel).** I dag är de tunna jämfört med konkurrenterna. Lägg till ett kort snabbsvar, filter efter situation (student, utan erfarenhet, karriärbyte, chef), en kort guide längre ner (300 till 600 ord) och FAQ. Behåll allt som finns.
3. **Intern länkning.** Varje stödsida i tabellen ovan får en länk till målsidan med huvudordet i ankartexten, högt upp. Stödsidornas egna titlar skärps mot sina långsvansfrågor (till exempel "cv mall word", "vad är ett personligt brev") så att de slutar konkurrera om huvudordet.
4. **Galleriernas tekniska grund.** Kontrollera att yrkessidorna länkar tillbaka till galleriet med ordet "CV-exempel" respektive "personligt brev exempel", att /exempel inte tar huvudorden (den ska vara hubb, inte mål), och att galleriernas schema (ItemList) är komplett.
5. **Mät.** Avläsning 4 och 8 veckor efter varje steg på de sju frågorna i avsnitt 1: vilken sida som visas, position och klick. Målet till januari: en sida per huvudord i Search Console och position under 20 på minst två av de tre orden.

Insats: steg 1 och 3 är små (en dag), steg 2 är medel (två till tre dagar för tre gallerier), steg 4 är litet.

## 4. Kräver ägaren

- **Sammanslagningar.** Innehållsplanen för Q4 har redan M1 (cv-mall-pdf-gratis till /cv-mallar), M8 (tre "så skriver du"-sidor till skriva-personligt-brev-guide) och M9. De ligger uppskjutna enligt ägarbeslut 2026-09-23. Huvudorden är det starkaste skälet att ta dem nu, eftersom det är exakt de sidorna som delar på "personligt brev" och "cv mall". Förslag: M8 och M1 i december efter steg 1 till 3, med 301, uppdaterade interna länkar och avläsning efter fyra veckor.
- **Startsidans roll.** Startsidan syns inte på något av orden. Ska den bära ett av dem (till exempel "cv mall" via mallarna i hjälten) eller vara kvar som varumärkessida? Rekommendation: kvar som varumärkessida, huvudorden ligger på galleriorna.

## 5. Vad vi inte gör

- Inga nya sidor för huvudorden. Problemet är för många sidor, inte för få.
- Inga titlar som lovar mer än sidan har ("100 mallar" när det är 30).
- Ingen omdirigering eller sammanslagning utan ägarens ja.

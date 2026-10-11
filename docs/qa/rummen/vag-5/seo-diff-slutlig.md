# SEO-diff, slutlig (design/rummen-klar mot origin/main)

2026-10-11. Före = `origin/main` (e158144f), byggd lokalt med webpack (Turbopack vägrar en länkad node_modules utanför roten). Efter = `design/rummen-klar` efter småfixarna (a4f715e1), byggd med Turbopack. Båda mätta med `scripts/seo-diff-artiklar.ts ta` mot lokala produktionsbyggen och jämförda med `jamfor`. Rå rapport: `seo-diff-slutlig-ra.txt` i samma mapp.

50 sidor, alla 200 före och efter: de 20 mest klickade artiklarna (GSC-urvalet, där de två intervjuartiklarna med intervjuprovet ingår), tre testartiklar med reklamkort, startsidan, /artiklar, /funktioner, /om-oss, /priser, /kontakt, /integritetspolicy, /anvandarvillkor, alla tio /verktyg/*, /cv-mallar, tre /cv-mallar/[yrke], /cv-mallar/start, /skapa-brev/start, /cv-exempel/sjukskoterska, /personligt-brev-exempel/sjukskoterska och /rakna-ut.

Fält per sida: title, meta description, h1, canonical, og:image, h2/h3, interna länkar (innehåll och ram för sig), alla JSON-LD-block och första bilden.

## Flaggat: title, h1 och canonical

| Sida | Fält | Före | Efter | Bedömning |
|---|---|---|---|---|
| /priser | title | Priser: en vecka som bär hela jobbsöket \| Jobbcoach.ai | Priser: Jobbcoach Premium, 149 kr i månaden \| Jobbcoach.ai (58 tecken) | Avsiktligt, ägarens beslut 17.3 och 17.4. Redovisat i `seo-diff.md`. |
| /priser | h1 | En vecka som bär hela jobbsöket. | Jobbcoach Premium, 149 kr i månaden | Avsiktligt, samma beslut. |
| /cv-mallar | h1 | CV-mallar för svenska yrken gratis och premium | CV-mallar för svenska yrken gratis eller i Premium | Avsiktligt (copy-vag5, produktnamnet). Seo-agenten bör se den: sidan rankar på "gratis och premium". |

**Canonical: ingen ändring på någon av de 50 sidorna.** Ingen annan title och ingen annan h1 har ändrats.

## Flaggat: interna länkar

| Sida | Borta | Varför |
|---|---|---|
| / | `/verktyg/personlighetstest` ("Gör provet utan konto") | Länken satt i Träningspaketets rad i paketlistan på startsidan, som togs bort med paketen (a62bcd57). Personlighetstestets verktygssida tappar därmed sin enda länk från startsidan. Förslag till seo-agenten: lägg tillbaka länken i en rad som finns kvar. Inte gjort här, eftersom det är en innehållsändring på startsidan. |

Inga andra innehållslänkar har försvunnit. Ramens länkar (header och footer) är oförändrade.

## Meta description

| Sida | Före | Efter |
|---|---|---|
| /priser | CV-paketet och Träningspaketet 79 kr i veckan, Hela paketet 99 kr. Allt öppet direkt, ingen bindningstid, säg upp med ett klick. Gratisnivån ligger kvar. | Jobbcoach Premium kostar 149 kr i månaden. CV-analys, personliga brev, rekryteringstester, jobbmatchning och Jobbcoachen ingår. Säg upp när du vill. (148 tecken) |
| /verktyg/bli-upptackt | ... Ingår i Hela paketet, 99 kr i veckan. | ... Ingår i Jobbcoach Premium, 149 kr i månaden. (146 tecken) |

## Strukturerad data

Alla ändringar är paketnamn och pris (Hela paketet, CV-paketet och Träningspaketet med veckopris blev Premium, 149 kr i månaden ur PLANS) och gratisnivån enligt 23.3. Ingen typ har försvunnit utom på /priser.

- **/priser:** fristående `AggregateOffer` över sex paket (49 till 299 kr) ersatt av `Product` "Jobbcoach Premium" med `AggregateOffer` (offerCount 1, 149 kr, UnitPriceSpecification per månad). FAQPage står kvar med nya frågor. Inga betyg eller recensioner.
- **FAQPage-svar om pris:** /verktyg/cv-analys (2 svar), cv-mallar, skapa-cv, personligt-brev (2), jobbmatchning, jobbcoachen (2), linkedin-optimering, bli-upptackt, personlighetstest, rekryteringstester och /cv-mallar.
- **/verktyg/rekryteringstester:** FAQ-svaret om gratis säger nu "Fem frågor med facit utan konto, en nivåmätning och ett första träningspass med gratiskonto" i stället för "grundnivån en gång per dag" (23.3). HowTo steg 1 och WebApplication `offers.description` följer samma sak.
- **/verktyg/linkedin-optimering:** `offers.price` och `HowTo.estimatedCost` 79 till 149.
- **/verktyg/bli-upptackt:** `Service.offers.price` 99 till 149, beskrivningarna säger Jobbcoach Premium.
- **/cv-exempel/sjukskoterska och /personligt-brev-exempel/sjukskoterska:** bara `datePublished`, som sätts vid bygget (byggtid, inte innehåll).

## Brus som inte är ändringar

- **og:image-adressens hash** (`?5f285c...` mot `?54a5f7...` och liknande) skiljer på 26 sidor (två av dem är de tomma nedan). Hashen sätts av byggverktyget, och före byggdes med webpack, efter med Turbopack. Bildvägen är densamma på alla.
- **og:image saknas på /verktyg/bli-upptackt och /verktyg/personlighetstest** i efter-bygget. Det gör den också i produktion i dag (kontrollerat mot www.jobbcoach.ai: ingen og:image på någon av sidorna), så det är ett befintligt fel i Turbopack-bygget, inte en följd av Rummen. Före-bygget (webpack) ärver bilden från `/verktyg/opengraph-image`. Värt en egen rättelse: ge sidorna en egen `opengraph-image` eller `openGraph.images`.
- **Sektionsrubriker (h2/h3)** har ändrats på startsidan, /om-oss, /priser, /anvandarvillkor, /verktyg/personligt-brev, /verktyg/rekryteringstester och /cv-mallar/[yrke]. Skriptet godtar det för omritade ytor. Det som ändrats är paketnamn i rubriker: startsidans "Tre paket ..." med CV-paketet, Träningspaketet och Hela paketet blev "Allt i Premium"; /om-oss "Du betalar för veckorna du söker" blev "Du betalar bara när du behöver mer"; villkoren "7. Paket och betalning" blev "7. Prenumeration och betalning"; /verktyg/personligt-brev "79 kr för hela veckan" blev "149 kr i månaden"; /verktyg/rekryteringstester "Grundnivån är gratis" och "Träningspaketet tar bort taket" blev "Gratis att prova" och "Premium tar bort taket"; yrkessidorna "CV-paketets mall lägger till foto" blev "{Mall} med foto ingår i Premium"; /priser har nya sektionsrubriker.

## Oförändrat

Alla 23 artiklar (de 20 mest klickade och tre testartiklar), /rakna-ut: title, description, h1, canonical, rubriker, länkar och schema identiska.

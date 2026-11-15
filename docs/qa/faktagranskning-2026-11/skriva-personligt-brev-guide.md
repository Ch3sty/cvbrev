# Faktagranskning: content/artiklar/skriva-personligt-brev-guide.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Inledningen vilar på en anonym rekryteraranekdot som inte går att belägga och som krockar med artikelns egen FAQ. Nielsen Norman-forskningen generaliseras för hårt, och flera procent- och utfallssiffror saknar källa.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 49–51 | "En rekryterare jag pratade med berättade att hon lägger elva sekunder på första genomläsningen" | påhittat | Ett anonymt samtal i jagform från en författare som är "Teamet", utan namn eller källa. Det framställs som verkligt och bär hela inledningen. Det krockar dessutom med FAQ:n (rad 12/295: "30–90 sekunder"). Stryk anekdoten och öppna med det belagda: rekryterare skummar ansökningar på sekunder (Ladders 2018: 7,4 s för CV i första genomläsningen). Skriv inte ut en egen sekundsiffra för brev. | – |
| 12, 295 | "Rekryterare lägger 30-90 sekunder på första genomläsningen" | obelagt | Ingen källa. Stryk siffran eller formulera utan tal. | – |
| 61, 65 | "Forskning från Nielsen Norman Group ... visar att ögat följer ett F-mönster" | fel (generalisering) | NN/g beskrev F-mönstret 2006. Enligt NN/g är det inte universellt: det är ett av flera skanningsmönster och uppstår när texten saknar formatering, läsaren vill vara effektiv och inte är tillräckligt engagerad. Forskningen gäller webbsidor och inte brev. Skriv "läsare på skärm skannar ofta i ett F-mönster när texten är oformaterad". Dubbelstycket på rad 61 och 65 säger samma sak två gånger. | https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/ |
| 263 | "Tre fjärdedelar gör det." (inleder med "Jag söker härmed") | obelagt | Ingen källa. Stryk andelen. | – |
| 239 | "skillnaden mellan att söka tjugo jobb utan svar och söka åtta jobb och få fyra intervjuer" | obelagt | Det ser ut som ett mätt utfall men har ingen källa. Formulera som ett råd utan siffror. | – |
| 53 | "konkurrensen om varje annonserad tjänst kan vara fyrsiffrig" | obelagt | Ingen källa. Skriv "ofta hundratals sökande" eller lägg till en källa. | – |
| 161 | Mall 2: "Jag har följt er sedan ni lanserade reuse-konceptet förra året" (Lindex) | obelagt | Ett faktapåstående om ett verkligt företag i en mall som läsare kopierar. Det är inte kontrollerat och blir inaktuellt med "förra året". Byt till ett fiktivt företag, eller formulera utan datum och koncept. | – |
| 176 | Mall 3: "Jag har följt era tankar i Personaltidningen" | obelagt | Kunde inte bekräfta att en tidning med det namnet finns (branschtidningen heter Personal & Ledarskap). Byt till en verklig titel eller en generisk formulering. | – |
| 16, 239 | FAQ "Det tar 15-20 minuter" mot brödtextens "30-45 minuter per ansökan" | obelagt (inkonsekvent) | Två olika tidsangivelser för samma arbete. Välj en, utan att påstå en mätning. | – |

## Belagda påståenden
- Arbetsförmedlingens råd: max en A4-sida, konkreta exempel i stället för egenskaper, undvik klyschor som "stresstålig" och "utåtriktad". Källa: https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-personligt-brev
- Nielsen Norman Group har studerat läsning på skärm i över två decennier (F-mönstret identifierades 2006). Källa: NN/g, länken ovan.
- Personligt brev-exempel för 89 yrken. Källa: `BREV_GALLERI` (89) i src/app/(public)/exempel/components/galleri-data.ts.
- Brevverktyget skriver ett utkast utifrån CV:t och annonsen. Källa: src/app/(public)/priser/page.tsx rad 259 ("svarar på annonsens krav med exempel ur ditt CV").
- Mallbreven (BDO, Lindex och så vidare) är tydligt märkta som mallar. Personerna påstås inte vara verkliga, med undantag för Lindex-detaljen ovan.

## Rättning (omgång 1, 2026-11-15)
- Rad 49–51 (påhittat): rekryteraranekdoten ("elva sekunder") struken. Inledningen öppnar nu med det belagda: rekryterare skummar på sekunder, Ladders ögonrörelsestudie 2018 (7,4 sekunder för ett CV i första genomläsningen, länkad). Ingen egen sekundsiffra för brev; "hon" ersatt med "rekryteraren"; "inom tio sekunder" ersatt med "syns direkt".
- Rad 12, 295 (obelagt): "30-90 sekunder" struket i båda FAQ-svaren, nu "Rekryterare skummar snabbt vid första genomläsningen".
- Rad 61, 65 (fel, generalisering): stycket på rad 61 skrivet om utan NN/g-påståendet. Stycket på rad 65 säger nu att NN/g beskrev F-mönstret 2006, att det inte är universellt, att det uppstår främst vid oformaterad text och en läsare som vill bli klar snabbt, och att forskningen gäller webbsidor och inte brev. NN/g-artikeln länkad. Dubbleringen borta.
- Rad 263 (obelagt): "Tre fjärdedelar gör det" ändrat till "Väldigt många gör det".
- Rad 239 (obelagt): "tjugo jobb utan svar ... fyra intervjuer" struket, ersatt med ett råd utan siffror.
- Rad 53 (obelagt): "fyrsiffrig" ändrat till "populära tjänster kan få hundratals sökande".
- Rad 161 (obelagt): Lindex-detaljen om reuse-konceptet "förra året" ersatt med en generisk formulering om hållbarhetsarbetet på webbplatsen.
- Rad 176 (obelagt): "Personaltidningen" ersatt med "hur ni skriver om HR-frågor på er webbplats".
- Rad 16, 239 (inkonsekvent): båda tidsangivelserna ersatta med samma "ungefär en halvtimme per ansökan", i frontmatter-FAQ, FAQItem och brödtext, utan anspråk på mätning.
- `updated: "2026-11-15"` tillagd. Inga rubriker, FAQ-frågor eller description ändrade. Underlagets rader för artikelbilden är oförändrade och finns kvar i artikeln, bilden inte omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Kontrollerat: den påhittade rekryteraranekdoten är borta; Ladders 2018 (7,4 sekunder för ett CV) återges som CV-siffra och inte som brevsiffra. NN/g-stycket stämmer med NN/g:s artikel: F-mönstret beskrevs 2006, är "not always" formen, är ett av flera mönster (layer-cake, spotted, marking, bypassing, commitment) och uppstår när texten saknar formatering, läsaren vill vara effektiv och inte är engagerad. Tidsangivelsen "ungefär en halvtimme per ansökan" är nu densamma i frontmatter-FAQ, FAQItem och brödtext. Lindex- och HR-mallarna innehåller inte längre påståenden om verkliga lanseringar eller tidningar. Inga siffror utan källa i ändrade rader, inga tankstreck i ändrade rader.

## Svar till samordnaren
skriva-personligt-brev-guide, GODKÄND, inga brister.

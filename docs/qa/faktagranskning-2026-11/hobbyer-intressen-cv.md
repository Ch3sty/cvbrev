# Faktagranskning: content/artiklar/hobbyer-intressen-cv.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: OK. Artikeln består nästan bara av råd. Fynden gäller en överdrift, ett produktpåstående och en källista som inte bär innehållet.

## Fynd att åtgärda

1. **Rad 27 och 110 (FAQ rad 16)**, "Raden står i vartannat svenskt CV" / "som står i vartannat CV". **Obelagt.** Det finns ingen källa för andelen. Förslag: "Raden är en av de vanligaste i svenska CV:n".
2. **Rad 96**, "Vår CV-analys flaggar utfyllnadsrader i hela dokumentet, intressesektionen inkluderad". **Obelagt (produkt).** Vi har inte kunnat bekräfta i koden att CV-analysen specifikt flaggar utfyllnadsrader eller intressesektionen (inget träffat i src/lib/cv eller src/app/api/cv). Förslag: "Vår CV-analys pekar ut det svagaste i dokumentet" eller motsvarande formulering som stämmer med analysens faktiska utdata.
3. **Rad 130 (källor)**, Arbetsförmedlingen "Writing a CV" och TSL:s sida om personligt brev. **Obelagt (källorna bär inte innehållet).** Arbetsförmedlingens sida tar inte upp hobbyer eller intressen. Den nämner bara att man kan ha egna rubriker som "Associations". TSL:s sida handlar om personligt brev och nämner föreningsengagemang i CV:t i förbigående. Förslag: behåll gärna, men formulera källraden som "allmänna råd om CV:ts uppbyggnad", eller ersätt med en källa som faktiskt behandlar intressen i CV.

## Belagda påståenden
- Arbetsförmedlingen: man kan ha egna rubriker utöver jobb och utbildning, t.ex. Associations (arbetsformedlingen.se/other-languages/english-engelska/cv-application-and-interview/writing-a-cv).
- TSL: föreningsengagemang räknas som merit i CV:t (tsl.se/privatperson/inspiration/saa-skriver-du-personligt-brev).
- Exempelraderna (P10-lag, maraton, torprenovering) är tydligt märkta som exempel och är OK.

## Rättning (omgång 1, 2026-11-15)
1. "Vartannat CV": rättat till "en av de vanligaste raderna/i svenska CV:n" i ingressen och i FAQ-svaret (frontmatter och FAQ-blocket).
2. CV-analysen "flaggar utfyllnadsrader ... intressesektionen inkluderad": omskrivet till "går igenom hela dokumentet och pekar ut vad som kan bli bättre", vilket stämmer med analysens förbättringsförslag per område (api/cv/analyze, detailedImprovements). Länken till /verktyg/cv-analys står kvar.
3. Källraden: behållen men omformulerad till "Källor för allmänna råd om CV:ts uppbyggnad", med vad varje källa faktiskt bär (egna rubriker; föreningsengagemang som merit).
Inga rubriker, FAQ-frågor eller description ändrade. updated: "2026-11-15" tillagt. Bildunderlaget citerar inga ändrade meningar, bilden inte omgjord. Inga interna länkar borttagna.

## Andra granskningen (2026-11-15)
GODKÄND.

"Vartannat CV" är mjukat till "en av de vanligaste raderna i svenska CV:n" på alla tre ställen. Det är fortfarande ett påstående utan källa, men det anger ingen andel och har låg risk. CV-analysen beskrivs nu som att den "går igenom hela dokumentet och pekar ut vad som kan bli bättre", vilket stämmer med produkten (bara CV:t, ingen annonsjämförelse). Källraden säger nu vad varje källa bär. FAQ i frontmatter och FAQ-blocket är likalydande. Inga talstreck i ändrade rader.

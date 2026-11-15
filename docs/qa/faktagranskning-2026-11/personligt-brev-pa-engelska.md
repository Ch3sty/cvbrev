# Faktagranskning: content/artiklar/personligt-brev-pa-engelska.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Artikeln bygger på skrivkonventioner, inte på statistik; de enda fynden gäller vad vårt eget brevverktyg påstås göra.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 93 | "Är annonsen på engelska skriver vi ett första utkast på engelska" | fel (produkt) | Verktyget känner inte av annonsens språk. Användaren väljer själv språk (svenska eller English) i steget för ton och språk, och svenska är förvalt. Ersätt med: "Välj engelska i språksteget så skriver vi ett första utkast på engelska utifrån ditt CV och annonsen." | src/app/dashboard/skapa-brev/components/steps/TonalityLanguageStep.tsx (rad 36, 92-95), CreateLetterClient.tsx rad 217 (`useState<Language>('sv')`) |
| 396 | "skriver ett utkast på idiomatisk engelska ... anpassat till brittisk eller amerikansk stil" | obelagt (produkt) | Det finns inget val mellan brittisk och amerikansk engelska i koden, bara `'sv' \| 'en'`. Stryk "anpassat till brittisk eller amerikansk stil", eller skriv "på engelska; justera själv stavning och avslutningsfras efter UK eller US enligt tabellen ovan". | Grep efter British/American/en-GB/en-US i src och supabase: inga träffar |
| 87 | "Engelskspråkiga rekryterare förväntar sig siffror tidigare och tätare än svenska" | obelagt | En generalisering utan källa. Den ingår i en råddel, så det går att göra den mjukare: "Engelska brev brukar lägga siffrorna tidigare än svenska". | - |

## Belagda påståenden
- Exempelbrevet (UK) är "knappt 250 ord": 242 ord inklusive header, 209 i själva brevtexten (räknat i filen).
- Konventionerna i tabellen (Dear Ms/Ms., Yours sincerely/faithfully, Sincerely, datumformat, stavning, A4/Letter, CV/resume) stämmer med vedertagen brittisk och amerikansk affärsbrevspraxis. De är skrivkonventioner, inte påståenden som kräver studiekälla.
- Länkade interna mål (/verktyg/personligt-brev, /verktyg/cv-analys, /artiklar/...) är tjänster och artiklar som finns.

## Rättning (omgång 1, 2026-11-15)
- Rad 93 (fel, produkt): rättat. Texten säger nu att användaren väljer engelska i språksteget och att svenska är förvalt; ingen automatisk språkavkänning utifrån annonsen.
- Rad 396 (obelagt, produkt): "anpassat till brittisk eller amerikansk stil" och "idiomatisk" struket. Ersatt med att utkastet skrivs på engelska när man väljer engelska, och att man själv justerar stavning och avslutningsfras efter UK eller US enligt tabellen.
- Rad 87 (obelagt): omskrivet till "Engelska brev brukar lägga siffrorna tidigare och tätare än svenska".
- Rubriker, FAQ-frågor och description oförändrade. `updated: "2026-11-15"` tillagt.
- Bilden berördes inte (underlaget citerar inga ändrade meningar), inte omgjord.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rad 381: "Vill du dessutom se hur väl ditt CV matchar annonsen kan du köra det genom vår [CV-analys](/verktyg/cv-analys)." Problem: fel produktuppgift som första omgången missade. CV-analysen tar bara emot CV:t, ingen annons, och jämför mot de kompetenstermer som annonser för yrket brukar efterfråga (supabase/functions/analyze-cv-background/index.ts rad 235 ff.; src/app/dashboard/cv-analys/components/steps.config.ts). Krävs: skriv om utan annonsjämförelse, till exempel "Vill du dessutom få en andra läsning av ditt CV kan du köra det genom vår CV-analys".
- Rättningarna på rad 88, 94 och 397 är kontrollerade mot koden (Language = 'sv' | 'en' i TonalityLanguageStep.tsx rad 36, useState<Language>('sv') i CreateLetterClient.tsx rad 217) och håller.

## Rättning omgång 2 (2026-11-15)
- Rad 381: "Vill du dessutom se hur väl ditt CV matchar annonsen kan du köra det genom vår CV-analys" ändrat till "Vill du dessutom få en andra läsning av ditt CV kan du köra det genom vår CV-analys". Ingen annonsjämförelse kvar; länken till /verktyg/cv-analys står kvar.
- Inga rubriker, FAQ-frågor eller description ändrade. updated: "2026-11-15". Underlaget för artikelbilden citerar inte raden; bilden inte omgjord.

## Tredje kontrollen (2026-11-15)
GODKÄND. Rad 381: "Vill du dessutom få en andra läsning av ditt CV kan du köra det genom vår CV-analys", ingen annonsjämförelse. Inga talstreck.

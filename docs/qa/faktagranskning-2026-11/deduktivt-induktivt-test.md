# Faktagranskning: content/artiklar/deduktivt-induktivt-test.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, leverantörsuppgifterna stämmer genomgående men gratisnivån för deduktivt beskrivs för generöst, och SHL-källan för 12/18 saknas i källistan.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 20 (FAQ frontmatter), 249 (FAQ synlig) | "För deduktiv logik är Nivåkollen en gång och grundnivån gratis med konto" | fel | Gratis är Nivåkollen en gång med full genomgång och ett grundpass samma dag; från dag 1 kräver grundpasset Premium. Ersätt med "För deduktiv logik är Nivåkollen och ett första träningspass samma dag gratis med konto, och övningsprovet med SHL:s antal uppgifter och tid ingår i Premium." | src/lib/traning/gratisniva.ts (grundpassVarjeDag: false, provlageGratis: false); src/app/(public)/priser/page.tsx rad 156, 200 |
| 208 | "och Nivåkollen en gång och grundnivån är gratis med konto" | fel | Som ovan: "Nivåkollen och ett första träningspass samma dag är gratis med konto". | gratisniva.ts |
| 110 | "samma antal uppgifter och samma tid som SHL Verify deduktiv: tolv uppgifter på arton minuter" | belagt, källa saknas | Stämmer med SHL:s faktablad för Verify Interactive – Deductive Reasoning (högst 12 frågor, 18 minuter, adaptivt, interaktivt drag-och-släpp). Lägg till faktabladet i källistan rad 227 och skriv "högst tolv uppgifter". Notera i texten att SHL:s test är interaktivt (du placerar namn i schema), vårt är flerval, vilket koden redan säger (src/lib/ovningsprov/format.ts rad 112). | https://www.shl.rs/wp-content/uploads/2022/03/Verify-Interactive-Deductive-Reasoning.pdf |
| 110 vs 208 | "tolv uppgifter på arton minuter" (provet) och "tolv uppgifter på femton minuter" (nivåerna) | belagt men förvirrande | Båda stämmer med koden (nivåerna 12/15 i testConfig.ts, provet 12/18 i ovningsprov/format.ts), men läsaren ser två tider för "deduktivt". Förtydliga att 15 minuter gäller nivåpassen och 18 minuter övningsprovet. | src/app/dashboard/tester/testConfig.ts rad 267–311; src/lib/ovningsprov/format.ts rad 110, 139 |
| 206 | "Aon rekommenderar dator i stället för mobil, en stabil uppkoppling och en uppdaterad webbläsare." | delvis belagt | Aons kandidatsida säger "we highly recommend taking the assessment on a PC, laptop or notebook"; stabil uppkoppling och uppdaterad webbläsare hittades inte i den hämtade sidan. Behåll dator-rådet, stryk resten eller formulera som eget råd. | https://www.aon.com/en/capabilities/talent-and-rewards/prepare-for-your-online-assessment |

## Belagda påståenden
- SHL Verify G+: högst 30 frågor, 10 numeriska, 10 deduktiva, 10 induktiva, 36 minuter, flerval, adaptivt; deduktiv förmåga "draw logical conclusions based on information provided, identify strengths and weaknesses of arguments, and complete scenarios using incomplete information"; induktiva frågorna "completely non-verbal", "detect regularities, patterns, and generalizations and infer rules": https://www.shl.com/assets/documents/product-factsheet-verify-g-plus.pdf
- SHL:s deduktiva exempel med Jane, Susan, röd bil, Ohio och blå bilar (rätt svar D, Susans bil drar 33 mpg) (rad 188): samma faktablad, sida 2.
- Aon gapChallenge 6 min, deduktivt-logiskt, fyll den tomma rutan; switchChallenge 6 min, fyrsiffriga sekvenser; scales cls 12 min, 12 uppgifter, sortera nya bilder; scales clx 6 min, så många som möjligt; scales ix 5 min, 20 uppgifter, hitta den som inte passar i en serie om 9 (tabell rad 143–165, rad 124, 186): https://www.aon.com/en/capabilities/talent-and-rewards/prepare-for-your-online-assessment
- Matrigma: 12 minuter, adaptivt, antal uppgifter anges inte (rad 175): https://assessio.com/candidates-students/
- Alva Labs logiktest: 20 uppgifter, högst 2 minuter per uppgift, adaptivt, 3x3-matriser (rad 51, 180): https://help.alvalabs.io/en/articles/3135413-how-alva-s-logic-test-work
- Deduktiva nivåer i våra tester: grund, avancerad, expert, 12 uppgifter, 15 minuter (rad 110, 208): testConfig.ts.
- Övningsprovet ingår i Premium: gratisniva.ts (provlageGratis: false).
- Fem matrisfrågor utan konto (rad 20, 126): gratisniva.ts ("smakprovet (anonymt, fem frågor)"), /verktyg/rekryteringstester/prova.
- Uppgifterna 1–6 är egna och märkta som sådana (rad 94); lösningarna är logiskt korrekta (D, B, A, C; 38; pil rakt ned med fem streck; triangeln).

## Rättning (omgång 1, 2026-11-15)
- Rad 20 och 249 (FAQ "Hur övar man på slutledningsförmåga gratis?", frontmatter och synlig): rättat till "För deduktiv logik är Nivåkollen och ett första träningspass samma dag gratis med konto, och övningsprovet med SHL:s antal uppgifter och tid ingår i Premium." Frågan oförändrad.
- Rad 208: rättat till "Nivåkollen och ett första träningspass samma dag är gratis med konto", plus att övningsprovet på arton minuter ingår i Premium.
- Rad 110: "högst tolv uppgifter på arton minuter" med SHL:s namn Verify Interactive, och tillägg om formatskillnaden (SHL drag-och-släpp i schema, vårt prov flerval). SHL:s faktablad för Verify Interactive Deductive Reasoning tillagt i källraden.
- Rad 110 mot 208: förtydligat att nivåpassen är tolv uppgifter på femton minuter och övningsprovet arton minuter.
- Rad 206: Aon-rådet begränsat till dator i stället för mobil ("rekommenderar starkt"); uppkoppling och webbläsare omskrivet till eget råd.
- `updated: "2026-11-15"` tillagt. Rubriker, description oförändrade. Bilden inte berörd. Inga interna länkar borttagna.

## Andra granskningen (2026-11-15)
GODKÄND. Gratisnivån stämmer nu med src/lib/traning/gratisniva.ts (mätning en gång, grundpass bara dag 0, provläget Premium) på alla tre ställen. SHL:s faktablad för Verify Interactive Deductive Reasoning bekräftat: 18 minutes, maximum 12 questions, adaptive, Interactive/Activity-based. Formuleringen om att placera namn i ett schema står inte i faktabladets text (exemplet är en bild) men stöds av SHL:s beskrivning "activity-based" och flera förberedelsesajter; godtas. Aons sida säger faktiskt "highly recommend taking the assessment on a PC, laptop or notebook", "a stable internet connection" och "latest browser version", så även meningen om uppkoppling och webbläsare håller.

## Svar till samordnaren
deduktivt-induktivt-test, GODKÄND.

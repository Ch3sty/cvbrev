# Faktagranskning: content/rekryterare/kognitiva-tester-rekrytering-forskning.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, forskningssiffrorna (Sackett 2022, Schmidt & Hunter 1998) stämmer, men ett produktpåstående om personlighetsfilter motsägs av koden och två forskningsdetaljer är fel.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 70 | "I vår egen pool visas personlighet därför enbart som styrkor i ord, aldrig som råpoäng, och den går inte att filtrera på." | fel (produkt) | Rekryterarvyn har filtren "Personlighetsstyrka" och "Arbetsstil" (src/app/rekryterare/components/FilterPanel.tsx rad 176–203; API-param `strengths` och `archetypes` i src/app/api/recruiter/pool/route.ts, filtreras i src/lib/recruiter/poolSearch.ts rad 301). Antingen tas filtren bort i produkten, eller texten ändras till "visas enbart som styrkor i ord, aldrig som råpoäng och aldrig som poänggolv". Beslut för saas-lead/ägaren. Samma påstående finns i ai-forordningen-rekrytering rad 101. | koden |
| 40 | "medan ostrukturerade intervjuer, år av erfarenhet räknade i sig, och intressen presterar svagt, precis som tidigare" | fel | Intressen är en av de prediktorer som steg i revideringen: från 0,10 (Schmidt & Hunter 1998) till 0,24 hos Sackett m.fl. 2022, över ostrukturerade intervjuer. Stryk "och intressen", eller skriv "medan ostrukturerade intervjuer och antal år i yrket presterar svagt". | https://www.siop.org/tip-article/is-cognitive-ability-the-best-predictor-of-job-performance-new-research-says-its-time-to-think-again/ |
| 64 | "poängen stiger en tredjedels standardavvikelse per försök utan att förmågan ändras" | fel | Metaanalysen (Scharfen, Peters & Holling 2018, Intelligence, 50 studier) visar ungefär en tredjedels standardavvikelse från första till andra försöket, ungefär en halv från första till tredje, och sedan planar det ut. Ersätt med "poängen stiger ungefär en tredjedels standardavvikelse redan till andra försöket, och upp mot en halv till det tredje". (Kontrollera samma formulering i insikten forsta-testforsoket-raknas.) | https://www.sciencedirect.com/science/article/abs/pii/S0160289617303276 |

## Belagda påståenden
- Sackett, Zhang, Berry & Lievens (2022), Journal of Applied Psychology 107, 2040–2068, överkorrigering för range restriction (rad 32). SIOP-artikeln ovan.
- Uppföljande tillämpningsartikel 2023 i Industrial and Organizational Psychology (rad 32, källraden). Cambridge-länken i artikeln.
- Strukturerade intervjuer 0,42, högst i den reviderade genomgången (rad 11, 36). SIOP.
- Kognitiv förmåga 0,31, ner från Schmidt & Hunters 0,51 (1998) (rad 13, 26, 38). SIOP / Sackett 2022.
- Arbetsprover (0,33), kunskapstest (0,40) och integritetstest (0,31) i det övre skiktet (rad 40). Sackett 2022.
- Ingen metod når 0,5 ensam (rad 17, 42). Sackett 2022 (högst 0,42).
- Produkt (rad 64): första genomförda försöket räknas och antal försök visas för rekryteraren: `firstCompleted()` och `attempts` i src/lib/recruiter/candidateData.ts, "N försök" i src/app/rekryterare/components/profile/ProfileSections.tsx.
- AI-förordningen klassar rekryterings-AI som högrisk med krav som fasas in (rad 21, 70): stämmer, inga datum anges.

## Rättning (omgång 1, 2026-11-15)
- Rad 70 (fel, produkt): produkten ändras inte, texten anpassad efter koden (FilterPanel.tsx, poolSearch.ts, candidateData.ts). Nu: personlighet visas bara i ord, kandidatens två tydligaste styrkor vägda mot kandidatens egen profil och inte mot andras, och när underlaget räcker en arbetsstil. Råpoäng visas aldrig och det går inte att sätta poänggolv för personlighet. Rekryteraren kan välja att filtrera på en styrka eller en arbetsstil, men det är rekryterarens val, inte en sortering systemet gör själv. Interna länken till personlighet-i-urval kvar.
- Rad 40 (fel): "och intressen" struket; nu "ostrukturerade intervjuer och antal år i yrket, räknade i sig, presterar svagt".
- Rad 64 (fel): omtagseffekten rättad till "ungefär en tredjedels standardavvikelse redan till andra försöket och upp mot en halv till det tredje". Insikten forsta-testforsoket-raknas kontrollerad: den säger redan rätt (en tredjedel till andra, en halv till tredje); inte ändrad (ej min fil).
- updated: "2026-11-15" tillagt.
- Rubriker/FAQ-frågor/description: oförändrade. Bild: ej omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rad 41: "medan ostrukturerade intervjuer och antal år i yrket, räknade i sig, presterar svagt, precis som tidigare." Fel för ostrukturerade intervjuer: Schmidt & Hunter 1998 gav dem 0,38, Sackett m.fl. 2022 gav 0,19; de presterade alltså inte svagt tidigare (år i yrket: 0,18 till 0,07). Krävs t.ex.: "medan ostrukturerade intervjuer föll från 0,38 till 0,19 och antal år i yrket, räknat i sig, ligger kvar lågt." Källa: Sackett, Zhang, Berry & Lievens 2023 (redan i källraden), https://ink.library.smu.edu.sg/context/lkcsb_research/article/8187/viewcontent/revisiting_the_design_of_selection_systems_in_light_of_new_findings_regarding_the_validity_of_widely_used_predictors.pdf
- Rad 71: "I vår egen pool visas personlighet därför enbart i ord: kandidatens två tydligaste styrkor ... och när underlaget räcker en arbetsstil." Rekryterarens profilvy visar också arbetsstilsspektrum som en punkt på en femstegsskala (src/app/rekryterare/components/WorkStyleSpectrum.tsx via profile/WorkStyleCard.tsx i ProfileSections.tsx). Inga siffror, men inte "enbart i ord". Krävs t.ex.: "visas personlighet aldrig som siffror eller råpoäng: kandidatens två tydligaste styrkor i ord ... och när underlaget räcker en arbetsstil, med läget på ett par skalor markerat utan siffror."
- Övrigt kontrollerat och korrekt: omtagseffekten (Scharfen, Peters & Holling 2018: en tredjedel SD till andra, en halv till tredje försöket, sedan platå), "och intressen" struket (0,10 till 0,24), styrkorna är kandidatens två högsta domäner (candidateData.ts strengthsFromDomains), filtren är medlemskap utan poänggolv (poolSearch.ts rad 301–306).

## Rättning omgång 2 (2026-11-15)
- Rad 41: "medan ostrukturerade intervjuer och antal år i yrket, räknade i sig, presterar svagt, precis som tidigare" -> "medan ostrukturerade intervjuer föll från 0,38 till 0,19 och antal år i yrket, räknat i sig, ligger kvar lågt". Källa Sackett, Zhang, Berry & Lievens, redan i källraden.
- Rad 71: "I vår egen pool visas personlighet därför enbart i ord: kandidatens två tydligaste styrkor, ..., och när underlaget räcker en arbetsstil. Råpoäng visas aldrig, och det går inte att sätta något poänggolv för personlighet." -> "I vår egen pool visas personlighet därför aldrig som siffror eller råpoäng: kandidatens två tydligaste styrkor i ord, ..., och när underlaget räcker en arbetsstil, med läget på några skalor markerat som en punkt utan siffror. Det går inte heller att sätta något poänggolv för personlighet." Kontrollerat i WorkStyleSpectrum.tsx (band 1-5 som punkt, inga siffror) och WorkStyleCard.tsx (flera spektra). Meningen om att rekryteraren kan filtrera på styrka eller arbetsstil står kvar enligt samordnarens beslut.
- Rubriker, FAQ-frågor och description oförändrade. Ingen artikelbild med underlag (rekryterarartikel).

## Produktsvep (2026-11-15)
- Stycket om AI-förordningen: personlighet i vår pool visas bara om kandidaten själv valt att visa den (tillagt), i övrigt oförändrat (styrkor i ord, arbetsstil som punkt utan siffror).
- Inga rubriker, FAQ-frågor eller description ändrade.

## Tredje kontrollen (2026-11-15)
GODKÄND. Inga brister.
- Rad 41 (omgång 2): "ostrukturerade intervjuer föll från 0,38 till 0,19 och antal år i yrket, räknat i sig, ligger kvar lågt" stämmer med Schmidt & Hunter 1998 och Sackett m.fl. 2022 (0,38 till 0,19 samt 0,18 till 0,07). Bristen från andra granskningen är åtgärdad.
- Rad 71 (omgång 2 och produktsvep): "bara om kandidaten själv har valt att visa den", "aldrig som siffror eller råpoäng", två styrkor i ord, arbetsstil som punkt på skalor utan siffror, inget poänggolv och filtrering som rekryterarens val stämmer med produktfacit och koden (show_personality, WorkStyleSpectrum.tsx, poolSearch.ts). Bristen från andra granskningen är åtgärdad.
- Rad 65: omtagseffekten (en tredjedel SD till andra, upp mot en halv till tredje) stämmer med Scharfen m.fl. 2018 och den länkade insikten.
- Inga tankstreck i ändrade rader; inget FAQ-block i brödtexten; frontmatter-FAQ har inga produktpåståenden som motsäger stycket.

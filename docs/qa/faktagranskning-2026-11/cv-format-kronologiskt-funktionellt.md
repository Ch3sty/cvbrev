# Faktagranskning: content/artiklar/cv-format-kronologiskt-funktionellt.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, artikeln är mest råd, men källorna i slutet stöder inte de påståenden de står under, och två absoluta formuleringar om ATS och om våra mallar håller inte.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 144 | "Våra CV-mallar finns i både klassiskt och hybridupplägg, alla byggda för att parsas felfritt." | obelagt (produkt) | Inget i src/lib/cv/simple-templates.ts eller cv-metadata.ts märker mallar som "hybrid", och flera mallar har två-kolumns body, sidopaneler, tre-kolumns header och "tabellär kolumn-layout" (simple-templates.ts rad 113, 316, 343–408), alltså precis det Arbetsförmedlingens ATS-artikel råder bort ("Undvik tabeller, grafik, symboler"). Stryk "alla byggda för att parsas felfritt"; skriv t.ex. "Våra CV-mallar har en tydlig kompetenssektion och omvänt kronologisk erfarenhet, och de enspaltiga är de säkraste för rekryteringssystem." | koden; https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig |
| 12, 33, 152 | "läses felfritt av rekryteringssystemen" / "som rekryteringssystemen parsar felfritt" | obelagt (överdrift) | Ingen källa säger att något format parsas felfritt. Ersätt med "läses säkrast av rekryteringssystemen". | — |
| 5, 12, 27, 33, 152 | "Omvänt kronologiskt är standarden i Sverige" / "vad svenska rekryterare förväntar sig" | obelagt (källan säger det inte) | Påståendet är rimligt och allmänt vedertaget, men ingen av artikelns två källor säger det: Arbetsförmedlingens engelska CV-sida skriver bara att strukturen "will depend on what job you are applying for", och AI-artikeln tar inte upp kronologi alls. Lägg till en källa som uttryckligen rekommenderar senaste först, eller formulera som vår bedömning. | https://arbetsformedlingen.se/other-languages/english-engelska/cv-application-and-interview/writing-a-cv |
| 20, 89, 168 | "Funktionella CV:n är svårare ... kan systemet inte bygga din arbetshistorik korrekt" | obelagt | Rimligt resonemang om hur parsning fungerar, men den angivna källan (AF:s ATS-artikel) säger inget om funktionella CV:n; den talar om enkel layout, standardrubriker och vanligt typsnitt. Formulera som en risk ("riskerar att parsas sämre") eller ange källa. | AF-artikeln ovan |
| 180 | Källraden | (komplettering) | Behåll AF:s ATS-artikel som källa för layoutråd (enkel layout, standardrubriker "Arbetslivserfarenhet", "Utbildning", "Kompetenser", vanligt typsnitt). | — |

## Belagda påståenden
- ATS-läsning gynnas av enkel layout och standardrubriker (rad 81 m.fl., i sak): Arbetsförmedlingen 2026-02-10, "Använd rubriker som systemen känner igen" och "Håll layouten enkel och lättläst". Länk ovan.
- Exempel-CV:t (undersköterska, Attendo Västerås, Region Västmanland, Cosmic) är märkt som exempel, inte framställt som verklig person. OK.

## Rättning (omgång 1, 2026-11-15)
- Rad 144 (obelagt, produkt): "finns i både klassiskt och hybridupplägg, alla byggda för att parsas felfritt" ersatt med granskarens formulering: mallarna har en tydlig kompetenssektion och omvänt kronologisk erfarenhet, och de enspaltiga är de säkraste för rekryteringssystem. Länken /verktyg/cv-mallar kvar.
- Rad 12, 33, 152 (överdrift): "läses/parsar felfritt" ersatt med "läses säkrast"/"läser säkrast".
- Rad 5, 12, 27, 33, 152 (källan säger det inte): ingen förstahandskälla hittad (Arbetsförmedlingens svenska CV-sida gav 404, sökning gav bara sekundärkällor). Formulerat som vår bedömning i FAQ-svaret ("enligt vår bedömning vad svenska rekryterare förväntar sig"), i Snabbsvaret och i inledningen ("Vår bedömning är att de inte är det"). Description och H2 "Därför är omvänt kronologiskt standarden" lämnade: påståendet är inte fel, bara obelagt, och artikeln anger nu att det är vår bedömning.
- Rad 20, 89, 168 (obelagt): omskrivet som risk: funktionella CV:n "riskerar att parsas sämre", systemet "får svårare att bygga din arbetshistorik", matchningen "kan bli lidande"; i brödtexten "kan förvärra", "är svåra att bygga en arbetshistorik av", "riskerar att bli ofullständig".
- Rad 180: källraden lämnad med AF:s ATS-artikel.
- updated: "2026-11-15" tillagt.
- Rubriker/FAQ-frågor/description: oförändrade. Bild: ej omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rad 34 (Snabbsvar): "Det funktionella formatet ... parsas sämre av ATS" och rad 64 (tabellen): "Väcker misstankar, parsas dåligt". Första granskningen klassade påståendet som obelagt, och FAQ/brödtext (rad 21, 90, 169) säger nu "riskerar att parsas sämre". Snabbsvaret och tabellen säger fortfarande mer än källan och motsäger de rättade raderna. Krävs: rad 34 "och riskerar att parsas sämre av ATS", rad 64 "Väcker misstankar, riskerar sämre parsning". Källa saknas (AF:s ATS-artikel säger inget om funktionella CV:n).
- Övrigt rättat korrekt: "felfritt" borta, "vår bedömning" markerat, mallmeningen stämmer med koden (både enspaltiga och flerspaltiga mallar finns).

## Rättning omgång 2 (2026-11-15)
- Rad 34 (Snabbsvar): "väcker ofta misstankar om att något döljs och parsas sämre av ATS" -> "... och riskerar att parsas sämre av ATS".
- Rad 64 (tabellen): "Väcker misstankar, parsas dåligt" -> "Väcker misstankar, riskerar sämre parsning". Nu i linje med FAQ och brödtext (rad 21, 90, 169).
- Rubriker, FAQ-frågor och description oförändrade. Underlaget citerar inte raderna, bilden inte omgjord.

## Tredje kontrollen (2026-11-15)
GODKÄND. Rad 34 och 64 säger nu "riskerar att parsas sämre"/"riskerar sämre parsning", i linje med FAQ och brödtext. FAQ identiska, inga talstreck.

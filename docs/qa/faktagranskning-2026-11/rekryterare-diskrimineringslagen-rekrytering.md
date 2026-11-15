# Faktagranskning: content/rekryterare/diskrimineringslagen-rekrytering.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: OK, lagbeskrivningen stämmer med diskrimineringslagen och DO:s statistik; bara en liten precisering av lagtexten föreslås.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 13, 44 | "skriftlig uppgift om utbildning, yrkeserfarenhet och andra meriter" | fel (smärre) | Lagtexten säger "andra särskilda meriter", och omfattar den som inte tagits ut till "anställningsintervju eller annan prövning för anställning". Justera ordvalet. | Diskrimineringslag (2008:567) 2 kap. 4 §, https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/diskrimineringslag-2008567_sfs-2008-567/ |

## Belagda påståenden
- De sju diskrimineringsgrunderna (DL 1 kap. 1 och 5 §§).
- Direkt och indirekt diskriminering enligt definitionerna (DL 1 kap. 4 §). Missgynnande som har samband med graviditet räknas som direkt diskriminering på grund av kön (1 kap. 4 §). Föräldraledighetslagen har ett eget missgynnandeförbud som även gäller vid anställning (16 §).
- Delad bevisbörda (DL 6 kap. 3 §).
- Diskrimineringsersättning med avskräckande syfte ("syftet att motverka sådana överträdelser", DL 5 kap. 1 §).
- Aktiva åtgärder för alla arbetsgivare i samverkan, och skriftlig dokumentation från 25 arbetstagare (DL 3 kap. 13 §).
- Talefrist på två år som huvudregel, vilket stöder att underlaget sparas "i praktiken upp till två år" (DL 6 kap.).
- DO, fackförbund och den enskilde kan föra talan (DL 6 kap. 2 §).
- "Rekryteringsärenden hör till de vanligaste i DO:s anmälningsstatistik": 2025 gällde 24 % av anmälningarna om arbetslivet rekrytering, näst efter "ledning och fördelning av arbete" med 33 % (DO via TT/pressmeddelande 2026; DO:s årsredovisning 2025).
- Svenska korrespondensstudier visar ungefär 50 % fler återkopplingar för svenskklingande namn vid identiska meriter (Carlsson & Rooth 2007). Påståendet återges via länkad insikt.
- Strukturerade intervjuer visar mindre gruppskillnader än ostrukturerade (Huffcutt & Roth 1998).
- Källänkarna (riksdagen, do.se, DO:s forskningsöversikt som PDF) fungerar.

## Rättning (omgång 1, 2026-11-15)
- Rad 13 (FAQ) och 44 (smärre fel): justerat till lagtextens ordval i 2 kap. 4 §: "inte anställdes eller inte togs ut till anställningsintervju eller annan prövning för anställning" och "andra särskilda meriter".
- Rad 62 (produkt, kandidatpoolen): "verifierade meriter" preciserat till "testresultat som visas som placering ("topp X %") i stället för råpoäng", i linje med portalen (candidateData.ts, PercentileDots.tsx).
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden inte berörd.

## Andra granskningen (2026-11-15)
GODKÄND. 2 kap. 4 § återges nu med lagens ordval (anställningsintervju eller annan prövning för anställning, andra särskilda meriter). Kandidatpoolen på rad 63 stämmer med koden: rekryteraren ser placering som "topp X %" (PercentileDots.tsx, Profilkort.tsx) och inte råpoäng, och poolen är anonym först.

## Produktsvep (2026-11-15)
- "testresultat som visas som placering (topp X %) i stället för råpoäng" blev placering när minst 25 gjort testet och annars andel rätt.
- Inga rubriker, FAQ-frågor eller description ändrade.

## Tredje kontrollen (2026-11-15)
GODKÄND. Inga brister.
- Rad 13 och 44 (omgång 1) återger 2 kap. 4 § med lagens ordval ("anställningsintervju eller annan prövning för anställning", "andra särskilda meriter"). Källa: diskrimineringslag (2008:567), riksdagen.se.
- Rad 63 (produktsvep): "placering ("topp X %") när minst 25 har gjort testet och annars som andel rätt" stämmer med produktfacit och koden (MIN_PERCENTILE_SAMPLE = 25 i src/lib/candidate/strengthConstants.ts). Inget "aldrig råpoäng" kvar.
- Inga tankstreck i ändrade rader. Artikeln har inget FAQ-block i brödtexten, så ingen avvikelse mot frontmatter-FAQ. Inga produktmotsägelser.

# Faktagranskning: content/artiklar/verifierade-testresultat-vs-cv.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, forskningsläget och DO-hänvisningen håller i huvudsak, men Sackett-rangordningen sträcks ut till CV-bedömning som inte finns i studien, och gratisträningen beskrivs som obegränsad.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 57 | "Du kan träna anlagstester kostnadsfritt hos oss, så många gånger du vill" | fel (produkt) | Gratis är Nivåkollen (nivåmätningen en gång) med genomgång och ett första träningspass. Fortsatt träning, provläge och riktade pass kräver Premium (149 kr/mån). Skriv "Du kan göra Nivåkollen och ett första träningspass gratis". | src/lib/traning/gratisniva.ts (grundpassVarjeDag: false, provlageGratis: false); priser/page.tsx rad 200 |
| 22, 100 | "Du kan träna anlagstester kostnadsfritt hos oss och, om du vill, skapa en Bli upptäckt-profil" | fel (produkt, delvis) | Samma gratisgräns som ovan. Bli upptäckt ingår dessutom bara i Premium enligt featuretabellen, vilket texten låter förstå som gratis. Ange att profilen ingår i Premium. | src/lib/access/features.ts (`bli_upptackt: ['allt']`) |
| 12, 41, 80 | "medan fri CV-bedömning ... förutsäger arbetsprestation dåligt" / "Långt ner ...: ostrukturerade intervjuer, år av erfarenhet ..., och helhetsintryck av ansökningshandlingar" | obelagt | Sackett m.fl. skattar inte validiteten för CV-granskning eller "helhetsintryck av ansökningshandlingar". Ostrukturerade intervjuer och antal års erfarenhet ligger lågt, det stämmer. Stryk CV-bedömningen ur rangordningen eller skriv det som egen slutsats. | https://www.cambridge.org/core/journals/industrial-and-organizational-psychology/article/revisiting-the-design-of-selection-systems-in-light-of-new-findings-regarding-the-validity-of-widely-used-predictors/A20984B138319E3D432E643978BF026D |
| 41 | "kognitiva test i det övre skiktet" | obelagt (överdrivet) | I Sacketts reviderade skattning hamnar kognitiv förmåga (.31) i mellanskiktet, under strukturerade intervjuer, arbetsprover och kunskapstest. Skriv "kognitiva test fortfarande med god träffsäkerhet". | Samma |
| 108 | Källrad "Sackett m.fl. 2022 (Cambridge, IOP)" | fel (detalj) | Den länkade IOP-artikeln publicerades 2023 (vol. 16, nr 3). 2022-studien är Sackett, Zhang, Berry & Lievens i Journal of Applied Psychology. Ändra årtalet för länken eller länka JAP-artikeln. | Samma |

## Belagda påståenden
- Strukturerade intervjuer i topp, ostrukturerade intervjuer och år av erfarenhet lågt, revidering av forskningsläget från 1998 (Schmidt & Hunter) (rad 41): Sackett, Zhang, Berry & Lievens, IOP 16(3) 2023, länk ovan.
- DO:s forskningsöversikt visar att sökande med arabiskklingande namn kallas till intervju mer sällan vid likvärdiga meriter (rad 45): Oxford Research för DO, "Forskningsöversikt om rekrytering i arbetslivet", avsnitt om fältexperiment med arabisk- respektive svenskklingande namn (Carlsson, Rooth, Agerström m.fl.). https://www.do.se/download/18.277ff225178022473141e2b/1618941270328/rapport-forskningsoversikt-diskriminering-rekrytering.pdf
- I kandidatpoolen räknas första genomförda försöket, inte bästa (rad 16, 55, 73): src/app/(public)/for-rekryterare/components/rekryterare-faq-data.ts ("Vi räknar kandidatens första slutförda försök").
- Bli upptäckt anonymt tills kandidaten godkänner kontakt, personlighet som styrkor i ord (rad 22, 65): samma fil.

## Rättning (omgång 1, 2026-11-15)
- Rad 57: "träna anlagstester kostnadsfritt ... så många gånger du vill" rättat till att Nivåkollen och ett första träningspass är gratis och fortsatt träning ingår i Jobbcoach Premium. Länken /verktyg/rekryteringstester kvar (länktexten nu "våra rekryteringstester"). Underlagets rader "Gör testet när du är utvilad" och "Öva innan, i övningsläge" står kvar ordagrant.
- Rad 22, 100 (FAQ-svaret "Var kan jag göra tester som rekryterare faktiskt ser?", frontmatter och FAQ-blocket): gratisnivån rättad som ovan, och Bli upptäckt-profilen anges ingå i Jobbcoach Premium, 149 kr i månaden utan bindningstid.
- Rad 12, 80 (FAQ-svaret "Varför använder arbetsgivare tester ...", båda ställena): "fri CV-bedömning" struken ur Sackett-rangordningen; nu strukturerade intervjuer, kunskapstest och arbetsprover högst, kognitiva test "fortfarande god träffsäkerhet", ostrukturerade intervjuer och år av erfarenhet lågt. "Svag grund" gäller nu fria, ostrukturerade bedömningar.
- Rad 41: "kognitiva test i det övre skiktet" och "helhetsintryck av ansökningshandlingar" i rangordningen rättat; att ett fritt helhetsintryck av CV och brev inte mäts separat men är samma sorts ostrukturerade bedömning står som egen slutsats.
- Rad 108 (källraden): 2022 i texten avser nu rätt studie: Sackett, Zhang, Berry och Lievens 2022 i Journal of Applied Psychology (doi.org/10.1037/apl0000994, kontrollerat), och IOP-artikeln står kvar märkt 2023.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte.

## Andra granskningen (2026-11-15)
GODKÄND. Gratisnivån (Nivåkollen och ett första träningspass) stämmer med paket-copy.ts, Bli upptäckt ligger i Premium (HELA_PAKETET_RADER i plans.ts), 149 kr/mån utan bindningstid. Sackett-rangordningen säger inte längre något om CV-bedömning som källa, egen slutsats är märkt som sådan; kunskapstest och arbetsprover högt och kognitiva test med god träffsäkerhet håller mot Sackett m.fl. 2022. Källraden har nu rätt år för båda artiklarna. FAQ i frontmatter och FAQ-block är identiska. Inga talstreck.

## Svar till samordnaren
verifierade-testresultat-vs-cv, GODKÄND.

## Produktsvep (2026-11-15)
- FAQ "Var kan jag göra tester som rekryterare faktiskt ser?" (frontmatter och FAQItem): Bli upptäckt kopplas inte längre till Premium; "dina styrkor visas i ord, aldrig som råpoäng" ersatt med korrekt beskrivning: testresultat som topp X procent när minst 25 gjort testet, annars andel rätt, och personlighet bara om kandidaten väljer det, som styrkor i ord.
- Avsnittet om verifierade mätpunkter: personlighetsdata visas bara om du väljer det.
- Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte.

## Tredje kontrollen (2026-11-15)
GODKÄND. Produktsvepet stämmer med facit: Bli upptäckt kopplas inte till Premium, testresultaten beskrivs som topp X procent när minst 25 gjort testet och annars andel rätt, personlighet bara om kandidaten väljer det. Gratisnivån (Nivåkollen och ett första träningspass) och Premium 149 kr utan bindningstid stämmer. Frontmatter-FAQ och FAQ-block lika, inget "aldrig råpoäng" kvar, inga talstreck.

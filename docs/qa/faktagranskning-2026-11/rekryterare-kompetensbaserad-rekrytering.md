# Faktagranskning: content/rekryterare/kompetensbaserad-rekrytering.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, forskningsläget och DO-översikten återges korrekt, men källraden har fel år och diskrimineringslagens rätt till uppgifter beskrivs oprecist.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 80 | "Sackett m.fl. 2022 om urvalsmetodernas validitet (Cambridge, IOP)" | fel | Den länkade artikeln är Sackett, Zhang, Berry & Lievens, "Revisiting the design of selection systems ...", Industrial and Organizational Psychology vol. 16 nr 3, september **2023**. Metaanalysen från 2022 är en annan artikel (Journal of Applied Psychology 2022). Ändra källraden till "Sackett m.fl. 2023 (IOP)", eller länka till JAP-artikeln från 2022 om texten ska säga 2022. Själva påståendet på rad 32 håller. | https://www.cambridge.org/core/journals/industrial-and-organizational-psychology/article/revisiting-the-design-of-selection-systems-in-light-of-new-findings-regarding-the-validity-of-widely-used-predictors/A20984B138319E3D432E643978BF026D |
| 50 | "den dag en förbigången kandidat begär motivering, vilket diskrimineringslagen ger utrymme för" | fel (oprecist) | Diskrimineringslagen 2 kap. 4 § ger en sökande som inte anställts rätt att på begäran få skriftlig uppgift om **vilken utbildning, yrkeserfarenhet och andra särskilda meriter** den anställda har. Det är inte en rätt till motivering. Föreslagen text: "... den dag en förbigången kandidat begär uppgift om den anställdas meriter, vilket diskrimineringslagen (2 kap. 4 §) ger rätt till." | https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/diskrimineringslag-2008567_sfs-2008-567/ |
| 40 | "forskning om annonsspråk visar att långa kravlistor avskräcker fullt kvalificerade sökande selektivt, och att könskodade ord gör det också" | obelagt (första ledet) | Att könskodade ord påverkar vem som söker är belagt (Gaucher, Friesen & Kay 2011, JPSP). Att långa kravlistor avskräcker vissa grupper selektivt bygger oftast på HP-siffran om att kvinnor söker först vid 100 % matchning, som är en intern uppgift och inte en studie. Antingen anger vi en studie för första ledet i insikten om jobbannonser, eller så skriver vi "... och könskodade ord avskräcker selektivt (Gaucher m.fl. 2011)". | Gaucher m.fl. 2011, doi:10.1037/a0022530 |

## Belagda påståenden
- Strukturerade intervjuer har högst validitet bland enskilda metoder (rad 32): medelvaliditet .42, "cognitive ability is no longer the stand-out predictor", Sackett m.fl. 2022/2023 (se ovan).
- Kombinationer av metoder slår enskilda metoder (rad 32): composites i snitt .47 mot .42 för bästa enskilda metod, samma IOP-artikel.
- DO:s forskningsöversikt: kandidater med utländskt (arabiskt/afrikanskt) klingande namn kallas mer sällan till intervju vid likvärdiga meriter, och sorteringen sker tidigt (rad 13, 34): DO/Oxford Research 2012, "Forskningsöversikt om rekrytering i arbetslivet", bl.a. Carlsson & Rooth 2007 (svenskklingande namn kallades 50 % oftare) och Bursell. https://www.do.se/download/18.277ff225178022473141e2b/1618941270328/rapport-forskningsoversikt-diskriminering-rekrytering.pdf (notera att översikten är från 2012).
- Kandidatpoolen: verifierade testresultat (första försöket, inte bästa), anonym tills kandidaten tackar ja (rad 76): src/app/(public)/for-rekryterare/components/rekryterare-faq-data.ts.

## Rättning (omgång 1, 2026-11-15)
- Rad 80 (källraden): rättat till "Sackett m.fl. 2023 om urvalsmetodernas validitet (Cambridge, IOP)", samma länk. I brödtexten rad 32 ändrat "(Sackett med kollegor, 2022)" till "(Sackett med kollegor, 2022 och 2023)", eftersom det reviderade facit är metaanalysen 2022 och den länkade genomgången 2023.
- Rad 50: rättat till "den dag en förbigången kandidat begär uppgift om den anställdas meriter, vilket diskrimineringslagen (2 kap. 4 §) ger rätt till." Lagen tillagd i källraden.
- Rad 40: första ledet (långa kravlistor avskräcker selektivt) struket som forskningspåstående. Omskrivet: könskodade ord påverkar vilka som söker (Gaucher m.fl. 2011), och varje onödigt krav ger en kvalificerad sökande ytterligare en anledning att avstå (resonemang, inget forskningsanspråk). Gaucher m.fl. 2011 tillagd i källraden (doi.org/10.1037/a0022530). Länken till insikten om jobbannonser kvar.
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Insikten har inget artikelbildsunderlag, ingen bild omgjord.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rättningarna på rad 33 och 81 håller: Sackett m.fl. 2022 (JAP-metaanalysen) och 2023 (den länkade IOP-artikeln, vol. 16 nr 3) är rätt år för respektive arbete. Rad 50 håller: diskrimineringslagen 2 kap. 4 § ger den som inte anställts (eller inte kallats till intervju) rätt att på begäran få skriftlig uppgift om utbildning, yrkeserfarenhet och andra särskilda meriter hos den som fick jobbet; "uppgift om den anställdas meriter" säger inte mer än lagen. Källraden har lagrummet och Gaucher. Inga talstreck i ändrade rader.
- Rad 41: "Forskningen om annonsspråk visar till exempel att könskodade ord påverkar vilka som söker (Gaucher m.fl. 2011)". Problem: säger mer än källan. Gaucher, Friesen & Kay 2011 (JPSP 101(1), 109-128) visar att maskulint kodade annonser förekommer mer i mansdominerade yrken och att kvinnor bedömer sådana tjänster som mindre lockande, förmedlat av lägre upplevd tillhörighet. Studien mätte attraktivitet, inte faktiska ansökningar. Krav: "... visar till exempel att maskulint kodade ord gör tjänsten mindre lockande för kvinnor (Gaucher m.fl. 2011)". Källa: https://doi.org/10.1037/a0022530 (PubMed 21381851).

## Svar till samordnaren
rekryterare-kompetensbaserad-rekrytering, UNDERKÄND, rad 41 säger att könskodade ord "påverkar vilka som söker" men Gaucher m.fl. 2011 mätte bara hur lockande tjänsten upplevs, skriv "gör tjänsten mindre lockande för kvinnor".

## Rättning omgång 2 (samordnaren, 2026-11-15)
Gaucher m.fl. 2011: maskulint kodade ord gör tjänsten mindre lockande för kvinnor.

## Tredje kontrollen (2026-11-15)
GODKÄND. Inga brister.
- Rad 41 (omgång 2): "maskulint kodade ord gör en tjänst mindre lockande för kvinnor (Gaucher m.fl. 2011)" säger inte mer än studien (upplevd attraktivitet, inte faktiska ansökningar). Bristen från andra granskningen är åtgärdad. "varje onödigt krav ger ytterligare en anledning ... att avstå" är resonemang utan forskningsanspråk. Källa: https://doi.org/10.1037/a0022530.
- Rad 33, 50 och källraden (omgång 1) håller: Sackett 2022 (JAP) och 2023 (IOP), diskrimineringslagen 2 kap. 4 §.
- Rad 77 (produkt, oförändrad): verifierade testresultat och anonym tills kandidaten tackar ja stämmer med produktfacit (namn och mejl först vid accepterad intresseanmälan).
- Inga tankstreck i ändrade rader; inget FAQ-block i brödtexten.

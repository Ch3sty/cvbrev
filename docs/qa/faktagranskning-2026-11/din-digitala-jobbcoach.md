# Faktagranskning: content/artiklar/din-digitala-jobbcoach.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, men brådskande: avsnittet "Varför metodiken ger resultat" bär påhittade användarsiffror, och produktbeskrivningen har en funktion som inte finns och fel tonlägen. Resten (jämförelsen digital/mänsklig coach) håller och kan stå kvar.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 182 | "Användare som skräddarsyr sina ansökningar med vår metodik har 2,6 gånger högre intervjufrekvens ... 92% av Premium-användarna får svar från arbetsgivare inom 30 dagar" | påhittat | Ingen mätning finns i koden, docs eller rapporterna; tjänsten registrerar inte arbetsgivarsvar (Sökta tjänster-trackern infördes september 2026, efter artikeldatumet). Samma siffror står i fardiga-personliga-brev. Stryk hela stycket "Vår interna data ...". | Sökning i content/, src/ och docs/ på "2,6 gånger" och "92 %": inga träffar utanför artiklarna |
| 152–154 | "Stöttar din långsiktiga utveckling (Premium): Vår AI jämför din profil mot specifika roller ... pekar ut kompetensgap ... föreslår relevanta kurser, certifieringar" | fel (produkt) | Funktionen finns inte i produkten: ingen rutt i src/app/dashboard, Kompetensutveckling är pausad. Stryk avsnittet. Även howto-steg 6 (rad 23) och steg 6 i listan (rad 176) "låt verktyget peka ut kompetensgap" ska strykas eller bytas mot jobbmatchningen. | src/app/dashboard (ingen kompetensutvecklingsrutt); /kompetensutveckling pausad |
| 156–158 | "Finslipar din kommunikation (Premium): ... välja tonläge (formell, entusiastisk, kreativ eller datadriven)" | fel (produkt) | Tonlägena är Professionell, Entusiastisk, Kreativ, Självsäker och Balanserad, och de ingår gratis. Bara "Vi väljer ton åt dig" kräver Premium. Ersätt med "välja tonläge (professionell, entusiastisk, kreativ, självsäker eller balanserad), eller med Premium låta oss välja ton efter annonsen". | src/app/dashboard/skapa-brev/components/steps/TonalityLanguageStep.tsx (STANDARD_TONES, isPremium spärrar bara 'auto') |
| 178 | "uppgradera till Premium för obegränsad användning, djupgående CV-analys och anpassningsbar tonalitet" | fel (produkt) | Tonalitet är gratis (se ovan). Ersätt "anpassningsbar tonalitet" med t.ex. "nedladdning av breven och alla CV-mallar". Gärna pris: 149 kr i månaden, ingen bindningstid. | Som ovan; src/lib/access/features.ts |
| 148 | "Hjälper dig öva inför rekryteringen (Premium)" | fel (produkt, ofullständigt) | Nivåkollen med genomgång och ett första träningspass ingår gratis (vilket artikeln själv säger på rad 196). Ändra etiketten till "(mer i Premium)". | src/app/(public)/priser/page.tsx |
| 57 | "Den bearbetar ... mönster från lyckade ansökningar" | obelagt (produkt) | Inget i koden visar att tjänsten tränats på eller jämför mot lyckade ansökningar. Stryk "mönster från lyckade ansökningar". | – |
| 192 | "En privat jobbcoach kostar vanligtvis mellan 800 och 1500 kronor i timmen" | obelagt | Ingen källa. Ange källa eller skriv "ofta flera hundra kronor i timmen och uppåt". | – |
| 49 | "minst varannan vecka, enligt Coachförbundet" | (källbyte) | Uppgiften stämmer i sak men källan går inte att nå (403). Arbetsförmedlingen, förstahandskälla: "Var fjortonde dag har du ett individuellt möte med din handledare och minst var fjärde vecka har du ett fysiskt möte hos leverantören." Byt länk till Arbetsförmedlingen och "coach" mot "handledare". | https://arbetsformedlingen.se/for-arbetssokande/extra-stod/stod-a-o/rusta-och-matcha |

## Belagda påståenden
- Rusta och matcha finns och ger individuella möten var fjortonde dag (rad 49, 194): Arbetsförmedlingen, se ovan.
- CV-uppladdning i PDF, DOCX och TXT (rad 15, 116, 172): src/components/cv/cv-uploader.tsx (accept=".pdf,.docx,.txt").
- Gratis konto med personligt brev, CV-analys och tester utan kostnad (rad 13, 171, 196): priser-sidan (ett brev och sedan ett i veckan att läsa, en CV-analys med poäng och tyngsta fyndet, Nivåkollen och ett träningspass).
- CV-analys, jobbmatchning, rekryteringstester och Jobbcoachen finns under /verktyg/ (rad 31).
- Premium har en månadskostnad (rad 35): 149 kr i månaden, src/lib/plans/plans.ts.
- framtid.se (rad 49): sidan kunde inte hämtas (403); uppgiften är allmän yrkesbeskrivning och okontroversiell.
- Exemplen (118 % av kvoten, 80+ ärenden, 4,8/5) är märkta som genererat utkast respektive svagt/starkt exempel och är illustrativa.

## Rättning (omgång 1, 2026-11-15)
- Rad 182 (2,6 gånger, 92 %): struket. Stycket ersatt med en mening om tidsvinsten (utkast på några minuter i stället för en kväll); avsnittet börjar sedan med "Vad ligger bakom?".
- Rad 152–154 (kompetensgap, Premium): avsnittet struket inklusive H3. Howto-steg 6 och liststeg 6 ändrade till att jobbmatchningen visar vilka lediga jobb som passar (liststeget fick intern länk /verktyg/jobbmatchning).
- Rad 156–158 (tonlägen): rättat till professionell, entusiastisk, kreativ, självsäker eller balanserad, och att vi med Premium kan välja ton efter annonsen.
- Rad 178 (anpassningsbar tonalitet): ersatt med alla CV-mallar, hela CV-analysen, nedladdning av breven och alla rekryteringstester, 149 kr i månaden utan bindningstid.
- FAQ "Är det dyrt ...?" (frontmatter och FAQ-block): "obegränsad användning ... karriärvägledning" ersatt med innehållet i Premium enligt plans.ts och priset; "skapa personliga brev utan kostnad" preciserat till "ditt första personliga brev".
- Rad 148: rubrik ändrad.
- Rad 57 (mönster från lyckade ansökningar): struket, meningen omskriven.
- Rad 192 (800-1500 kr/timme): omskrivet till "ofta flera hundra kronor i timmen och uppåt".
- Rad 49 (Coachförbundet): källan bytt till Arbetsförmedlingens sida om Rusta och matcha (kontrollerad), "coach" till "handledare", "minst varannan vecka" till "var fjortonde dag".
- Rubriker ändrade: "#### Hjälper dig öva inför rekryteringen (Premium)" blev "#### Hjälper dig öva inför rekryteringen (mer i Premium)"; "#### Stöttar din långsiktiga utveckling (Premium)" struken; "#### Finslipar din kommunikation (Premium)" blev "#### Finslipar din kommunikation".
- updated tillagt. Bilden berördes inte. Inga FAQ-frågor eller description ändrade.

## Andra granskningen (2026-11-15)
GODKÄND. De påhittade siffrorna (2,6 gånger, 92 %) är borta ur artikeln. Kompetensgap-funktionen är struken i H4, howto och liststeg. Tonlägena stämmer med TonalityLanguageStep (professionell, entusiastisk, kreativ, självsäker, balanserad; automatiskt val i Premium). Premium-innehållet i FAQ och brödtext stämmer med plans.ts (tester, CV-mallar, CV-analys, personliga brev, jobbmatchning varje natt, Jobbcoachen, 149 kr i månaden utan bindningstid) och priser-sidan (brev gratis att läsa, nedladdning i Premium). Rusta och matcha bärs av Arbetsförmedlingen: "Var fjortonde dag har du ett individuellt möte med din handledare", länkad i texten. Kvarvarande "analyserar ... ditt CV och den specifika annonsen" (rad 34, 183, 224) gäller brevverktyget, som tar annonsen, inte CV-analysen. Inga talstreck.

## Produktsvep (2026-11-15)
- FAQ "Är det dyrt att använda en digital jobbcoach som jobbcoach.ai?" (frontmatter och FAQ-block): "jobbmatchning varje natt" ändrat till "dina 25 bästa träffar i jobbmatchningen". Frågan oförändrad.
- Avsnittet under H4 "Ger konkret förbättringsfeedback (Premium)": tillagt att första CV-analysen är gratis och visar poängen och det tyngsta fyndet med åtgärd, medan hela genomgången och nya analyser ingår i Premium. Rubriken lämnad oförändrad.
- Bildunderlaget berörs inte.

## Tredje kontrollen (2026-11-15)
UNDERKÄND.
- Rad 135, H4 "#### Ger konkret förbättringsfeedback (Premium)", direkt ovanför rad 137 som efter produktsvepet säger "Den första analysen är gratis och visar poängen och det tyngsta fyndet med åtgärd". Problem: rubriken märker hela CV-analysen som Premium medan stycket under säger att första analysen är gratis, en motsägelse om gratisnivån. Syskonrubriken rad 149 rättades i samma omgång till "(mer i Premium)". Krävs: samma lydelse här, "#### Ger konkret förbättringsfeedback (mer i Premium)". Källa: produktfacit (CV-analys gratis 1 analys per konto med poäng, sammanfattning och tyngsta fyndet).
Övrigt godkänt: FAQ om priset (frontmatter och block identiska) stämmer med facit (149 kr, utan bindningstid, 25 träffar, Jobbcoachen obegränsat i Premium), tonerna rätt, "varje natt" borta, inga talstreck.

## Rättning omgång 4 (samordnaren, 2026-11-15)
Bristen i tredje kontrollen åtgärdad exakt enligt kravet (se kontrollens punkt).

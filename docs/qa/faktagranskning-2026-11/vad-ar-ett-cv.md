# Faktagranskning: content/artiklar/vad-ar-ett-cv.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Artikeln är mest definitioner och råd. Det som behöver rättas är två motstridiga sekundtal, ett historiskt påstående utan källa och ett gratislöfte.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 56, 118 | "Rekryterare ska kunna scanna ditt CV på 30 sekunder" / "kan scanna ditt CV på 30 sekunder" | obelagt | Ingen källa, och det krockar med rad 360 i samma artikel (7 sekunder). Den belagda uppgiften är Ladders eye-tracking 2018: i genomsnitt 7,4 sekunder i första genomläsningen. Använd den genomgående. | Ladders 2018 (verifierad av samordnaren i dag) |
| 360 | "Rekryterare spenderar i genomsnitt 7 sekunder" | obelagt (precision) | Stämmer ungefär. Skriv "7,4 sekunder enligt en eye-tracking-studie från Ladders (2018)" så att siffran har en källa. | Ladders 2018 |
| 22, 409 | "CV-formatet ... började spridas i Sverige på 1970-80-talen" | obelagt | Ingen källa hittad. Stryk årtalen, eller skriv "under andra halvan av 1900-talet" utan att påstå mer. | – |
| 254 | "Resume: Alltid max 1 sida (2 sidor för mycket seniora roller)" | obelagt (överdrivet) | En sida är normen för nyutexaminerade och tidig karriär. Två sidor är vanligt för erfarna. Skriv "oftast en sida". | – |
| 354 | "Vi har färdiga CV-mallar du kan ladda ner gratis" | fel (produkt, ofullständigt) | Gratis: tre av mallarna och en nedladdning. Övriga mallar och fler nedladdningar ingår i Premium (149 kr/mån). Skriv "tre av våra mallar är gratis". | src/lib/cv/template-antal.ts rad 17 och 27 |
| 285 | "Läs vår guide till en stark LinkedIn-profil" (länk /verktyg/linkedin-optimering) | obelagt (produkt) | Länken går till ett verktyg och inte till en guide, och LinkedIn-funktionen är betald (`linkedin` ingår inte i gratisnivån). Byt ordet till "verktyg" och säg att det ingår i Premium, eller länka till en artikel. | src/lib/access/features.ts |

## Belagda påståenden
- Curriculum vitae är latin för "levnadslopp" (curriculum = lopp/bana, vitae = livets). Detta är allmän etymologi.
- I Storbritannien heter det CV, och resume används i USA och Kanada. Detta är allmänt vedertaget.
- 1–2 sidor är en bra längd. Arbetsförmedlingen: "1–2 sidor är en bra längd för ett cv". Källa: https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-cv
- CV-skaparen föreslår formuleringar. Källa: src/components/cv/SuggestionSelector.tsx och RoleBasedSuggestionSelector.tsx.
- Exempel-CV:t med Arla och Pågen är tydligt märkt som exempel och påstås inte vara en verklig person.

## Rättning (omgång 1, 2026-11-15)
- Rad 56, 118 (obelagt): "30 sekunder" struket på båda ställena. Rad 56 säger nu att rekryteraren ska kunna skumma CV:t på några sekunder, med Ladders ögonrörelsestudie (2018, 7,4 sekunder i första genomläsningen) länkad. Rad 118 har "några sekunder"; ett befintligt tankstreck i samma mening ersatt med komma.
- Rad 360 (obelagt, precision): "7 sekunder" ändrat till "7,4 sekunder ... enligt Ladders ögonrörelsestudie som vi nämnde ovan".
- Rad 22, 409 (obelagt): "på 1970-80-talen" ersatt med "under andra halvan av 1900-talet" i både frontmatter-FAQ och FAQItem.
- Rad 254 (obelagt, överdrivet): "Alltid max 1 sida (2 sidor för mycket seniora roller)" ändrat till "Oftast en sida, särskilt tidigt i karriären (två sidor är vanligt för erfarna)".
- Rad 354 (produkt): "du kan ladda ner gratis" ändrat till "och tre av dem är gratis".
- Rad 285 (produkt): länktexten "guide" pekar nu på artikeln /artiklar/optimera-linkedin-profil; verktygslänken /verktyg/linkedin-optimering behållen med rätt benämning och "Verktyget ingår i Jobbcoach Premium." Ingen intern länk försvann, en tillkom.
- `updated: "2026-11-15"` tillagd. Inga rubriker, FAQ-frågor eller description ändrade. Underlaget för artikelbilden citerar inga ändrade meningar, bilden inte omgjord.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rad 23 (frontmatter-FAQ) och rad 410 (FAQItem): "CV-formatet som vi känner det idag blev vanligt i Sverige under andra halvan av 1900-talet, inspirerat av internationella rekryteringsmetoder. Tidigare var jobbansökningar ofta mer informella eller baserade på personliga rekommendationer." Problem: rättningen bytte bara årtalen. Orsaken ("inspirerat av internationella rekryteringsmetoder") och jämförelsen bakåt ("Tidigare var jobbansökningar ofta mer informella") är fortfarande historiska faktapåståenden helt utan källa, och första granskningen bad uttryckligen om "utan att påstå mer". Krävs: antingen en källa som bär dateringen och orsaken (till exempel förstabelägget för "cv" eller "meritförteckning" i Svenska Akademiens ordböcker, svenska.se), eller ett svar som bara säger det som går att belägga, till exempel att ordet kommer från latinets curriculum vitae, att meritförteckning är den svenska motsvarigheten och att CV i dag är det vanliga ordet i svenska jobbannonser. Frontmatter-FAQ och FAQItem ska ändras lika.

Kontrollerat utan anmärkning: "7,4 sekunder" i första genomläsningen stämmer med Ladders 2018 (PDF-länken svarar 403 för automatiska anrop men används på 13 ställen i content och är verifierad av samordnaren); brödtexten säger nu samma sak på rad 57, 118 och 361. "Tre av dem är gratis" stämmer med FREE_TEMPLATE_COUNT = 3. LinkedIn-verktyget kräver betalplan (linkedin: ['cv', 'allt'] i features.ts), så "ingår i Jobbcoach Premium" stämmer; artikeln /artiklar/optimera-linkedin-profil finns. Resume-raden ("oftast en sida ... två sidor är vanligt för erfarna") säger inte mer än allmän praxis. Inga tankstreck i ändrade rader.

Anmärkning: rubriken på rad 107 ("Syftet med ett CV – varför behövs det?") har ett tankstreck i en oändrad rad.

## Svar till samordnaren
vad-ar-ett-cv, UNDERKÄND, FAQ-svaret om när CV började användas i Sverige (rad 23 och 410) påstår fortfarande orsak och föregångare utan källa och ska beläggas eller skrivas om till det som går att belägga.

## Rättning omgång 2 (2026-11-15)
- Frontmatter-FAQ (rad 23) och FAQItem (rad 410), frågan "När började man använda CV i Sverige?" oförändrad. Svaret före: "CV-formatet som vi känner det idag blev vanligt i Sverige under andra halvan av 1900-talet, inspirerat av internationella rekryteringsmetoder. Tidigare var jobbansökningar ofta mer informella eller baserade på personliga rekommendationer." Efter (båda ställena): "Någon säker datering av när ordet slog igenom i Sverige har vi inte hittat. Ordet kommer från latinets Curriculum Vitae, och den svenska motsvarigheten är meritförteckning. I dag är CV det ord de flesta arbetsgivare använder i sina jobbannonser." Datering, orsak och föregångare struket; resten är samma uppgifter som redan står i artikeln (rad 15, 99, 103). Ingen källa för förstabelägg gick att hämta från svenska.se.
- Tankstreck (anmärkning, samordnarens uppdrag): rubriken rad 107 före "## Syftet med ett CV – varför behövs det?", efter "## Syftet med ett CV: varför behövs det?". Ingen intern länk pekar på ankaret.
- Underlaget docs/qa/artikelbilder/underlag/vad-ar-ett-cv.json citerar inga ändrade rader; bilden inte omgjord. Description oförändrad.

## Tredje kontrollen (2026-11-15)
UNDERKÄND.
- Rad 23 (frontmatter-FAQ) och rad 410 (FAQItem): "I dag är CV det ord de flesta arbetsgivare använder i sina jobbannonser." Problem: nytt obelagt mängdpåstående ("de flesta arbetsgivare"), samma typ som underkändes i sociala-kompetenser. Kontroll i Platsbankens öppna API (JobTech, 2026-11-15): ordet CV förekommer i 9 427 av 43 064 annonser (cirka 22 procent), meritförteckning i 94. CV är alltså det klart vanligare ordet, men de flesta annonser nämner inget av dem. Krävs, samma lydelse på båda ställena, till exempel: "I dag är CV det vanliga ordet i svenska jobbannonser, betydligt vanligare än meritförteckning." Källa: https://jobsearch.api.jobtechdev.se/search?q=CV respektive ?q=meritförteckning.

Kontrollerat utan anmärkning: datering, orsak och föregångare är strukna; ursprunget i latinets curriculum vitae och meritförteckning som svensk motsvarighet står redan i brödtexten; rubriken rad 107 har kolon i stället för tankstreck.

Anmärkning: brödtextens rad 103 (oförändrad) har samma påstående, "De flesta arbetsgivare skriver 'Skicka in ditt CV' i sina jobbannonser", och bör rättas likadant.

## Rättning omgång 4 (samordnaren, 2026-11-15)
Bristen i tredje kontrollen åtgärdad exakt enligt kravet (se kontrollens punkt).

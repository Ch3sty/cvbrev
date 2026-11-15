# Faktagranskning: content/artiklar/vanliga-intervjufragor-svar.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Alla Akavia-citat stämmer ordagrant, men ett råd tillskrivs Akavia utan stöd, och påståendet om gratis tester stämmer inte med dagens produkt.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 137 | "[öva på samma typ av tester](/verktyg/rekryteringstester) som arbetsgivare använder, helt gratis och med direkt facit" | fel (produkt) | Gratisnivån ger Nivåkollen med genomgång och ett första träningspass. Resten av testerna ingår i Jobbcoach Premium, 149 kr i månaden. Ersätt med "börja gratis med Nivåkollen och få en genomgång av dina svar". | src/lib/access/features.ts (tests_above_base, test_daily_pass); src/app/(public)/priser/page.tsx rad 200 |
| 129 | "Akavia är tydlig med att du bör 'undvika att ge ett löneanspråk ...', och att du inte ska utgå från din nuvarande lön, eftersom det riskerar att pressa ned budet" | fel (felaktig källhänvisning) | Akavias sida säger bara att du ska undvika löneanspråk innan du har en helhetsbild av villkor och förmåner (tjänstepension, övertidsersättning, rörliga lönedelar). Rådet om nuvarande lön finns inte där. Stryk det ledet, eller skriv det som eget råd och skilj det från Akavia. | https://www.akavia.se/rad-och-stod/soka-jobb/anstallningsintervju/30-vanligaste-intervjufragorna/ |

## Belagda påståenden
- Akavia listar 30 vanliga intervjufrågor (rad 15, 158). Källa: https://www.akavia.se/rad-och-stod/soka-jobb/anstallningsintervju/30-vanligaste-intervjufragorna/
- Akavia-citaten på rad 70 ("Fokusera på vad som känns meningsfullt och inspirerande ..."), rad 76 ("Lyft just dina styrkor och vad du kan tillföra till arbetsgivaren"), rad 107 ("Beskriv hur du vill utvecklas och att du ser den här rollen som ett naturligt steg i din karriär") och rad 129 (första ledet om helhetsbild) stämmer. Källa: samma.
- Psykologtidningen: "Magkänsla medför risker i rekrytering", och strukturerad intervju har högst samband med arbetsprestation (rad 27). Källa: https://psykologtidningen.se/2024/04/23/magkansla-medfor-risker-i-rekrytering/

## Rättning (omgång 1, 2026-11-15)
- Gratis tester (rad 137): rättat. "helt gratis och med direkt facit" ersatt med "Börja gratis med Nivåkollen och få en genomgång av dina svar."
- Akavia och nuvarande lön (rad 129): Akavia-citatet står kvar; rådet om nuvarande lön är skilt från Akavia och skrivet som vårt eget råd ("Vårt eget råd: utgå inte från din nuvarande lön, eftersom den lätt blir ett tak för budet.").
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berördes inte och gjordes inte om. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Akavia-citatet på rad 130 stämmer ordagrant ("Undvik att ge ett löneanspråk innan du fått en helhetsbild av anställningsvillkor och förmåner ...") och sidan säger inget om nuvarande lön, så rådet är nu korrekt skilt från Akavia. Testmeningen på rad 138 stämmer med priser-sidan ("Gratis: Nivåkollen med genomgång, ett första träningspass ..."). Inga talstreck, inga veckopaket eller Dagspass.

## Svar till samordnaren
vanliga-intervjufragor-svar, GODKÄND: inga brister.

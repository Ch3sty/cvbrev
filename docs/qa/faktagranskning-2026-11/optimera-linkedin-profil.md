# Faktagranskning: content/artiklar/optimera-linkedin-profil.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Påståendet om tre till fem meningar tillskrivs Academic Work, men den citerade källan säger det inte. Resten stämmer eller är råd.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 16, 33, 64, 106 | "sikta på tre till fem meningar enligt Academic Works rekryterare" / "rekryterarna på Academic Work ger samma besked som vi: håll den kort, tre till fem meningar" | obelagt (felaktig tillskrivning) | Den källa som anges ("3 saker rekryterare kollar efter i din LinkedIn-profil") säger inget om om-sektionens längd. Den tar upp nyckelord i rubriken, upp till 50 kompetenser, konkreta exempel i stället för "lagspelare" och varningssignaler. Stryk tillskrivningen och låt "tre till fem meningar" stå som vårt eget råd. Ersätt gärna med det Academic Work faktiskt säger: "Nyckelord i din rubrik syns tydligare och är extra viktiga att tänka över." | https://www.academicwork.se/artiklar/soka-jobb/3-saker-rekryterare-kollar-efter-i-din-linkedin-profil |
| 92 | "vår LinkedIn-optimering … analyserar profilen mot principerna ovan och ger konkreta förbättringsförslag per sektion" | obelagt (produkt), smärre | Flödet finns (klistra in sektionerna eller fyll i från CV:t, resultat per sektion), men LinkedIn-verktyget ingår i Premium och inte i gratisnivån. Texten antyder inget pris, så inget behöver ändras. Nämn Premium om pris läggs till. | src/app/dashboard/linkedin-optimizer, src/lib/access/features.ts (linkedin: cv, allt) |

## Belagda påståenden
- TNG: rekryterare "searchar" genom att söka på nyckelord, så profilen ska innehålla relevanta ord (https://www.tng.se/soka-jobb/linkedinprofil-tips/).
- Academic Work: konkreta exempel i stället för "lagspelare", nyckelord i rubriken (academicwork.se, se ovan).
- Akavias LinkedIn-guide finns på angiven länk.
- "Öppen för jobb" kan visas enbart för rekryterare som använder LinkedIns rekryteringsverktyg (LinkedIns hjälpsidor, allmänt känd funktion).
- Interna länkar finns.

## Rättning (omgång 1, 2026-11-15)
- Rad 16, 33, 64, 106 (felaktig tillskrivning): tillskrivningen till Academic Work struken i FAQ (frontmatter och brödtext). "Tre till fem meningar" står nu som vårt eget råd. På rad 64 ersatt med det Academic Work faktiskt säger: konkreta exempel säger mer än ord som "lagspelare". Snabbsvaret (rad 33) hade ingen tillskrivning och är oförändrat. Academic Work-länken i källraden står kvar eftersom den nu stöder det som tillskrivs källan.
- Rad 92 (produkt, smärre): lämnat, texten anger inget pris.
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bildunderlaget ("Tre till fem meningar") finns kvar ordagrant, bilden inte omgjord.

## Andra granskningen (2026-11-15)
GODKÄND. Academic Work säger att ord som "lagspelare" kan missgynna och att konkreta exempel ska användas, men inget om om-textens längd. Tillskrivningen stämmer nu, och "tre till fem meningar" står som vårt eget råd.

# Skissnot: startsidan

Skiss: `sidor/start.html`, byggd till `ut/skiss-start.html`. Bilder: `bilder/start-375-*`, `-412-*`, `-1440-*`.

## Vad som ändras mot i dag

- **Menyn och foten.** Menyn står på väggen i sidans färg i stället för vit på beige. Foten är grafit i stället för beige. Layouten är densamma.
- **Hjälten.** Den beiga ytan och telefonen "Mitt jobbsök" (med steg som inte finns, bland annat Nivåkollen) är borta. I stället fyra kort, ett per del av produkten i sin färg, som visar det man faktiskt får: en matrisuppgift, läsbarhetspoängen, brevet mot annonsens krav och spåret i Jobbsöket. Det är så startsidan knyter ihop allt.
- **Tre verktyg.** Tre stora färgblock i stället för tre band. Varje block visar verktyget i stor skala: testets ram med uppgiften, CV-arket med poängen, träffen i Matchade jobb med handlingarna Skriv brev, Spara till Ska sökas och Markera som sökt.
- **Brevet.** Annonsen och brevet bredvid varandra, med kraven som fått svar utmärkta.
- **Jobbcoachen.** Ett samtal om uppföljning i stället för lönespannet.
- **Medierna.** Fyra kort på en mörk yta, samma länkar.
- **Resten av jobbsöket.** Sökta tjänster får ett eget block med spåret, veckans mål och uppföljningen. Övriga åtta länkar ligger som brickor i sin dels färg.
- **Premium.** En egen mörk yta med priset som huvudtal. Raden om uppföljningsmejl och rapporten till Arbetsförmedlingen är med.

## Oförändrat för SEO

- H1 och alla åtta H2, i samma ordning. H3 Rekryteringstester, CV-analys, Jobbmatchning.
- Styckena under varje verktyg, förkortade bara där de var osanna.
- De fyra medielänkarna, de nio länkarna i "Och resten av jobbsöket", alla fem FAQ-frågor.
- Schematyperna Organization, WebSite och FAQPage.

## Påståenden som bytts för att de var osanna

| I dag | I skissen |
|---|---|
| "poäng 1 till 10 på tydlighet och struktur, innehåll, resultat och nyckelord" | "En läsbarhetspoäng av 100 och vad som saknas, del för del" |
| "Poängen och tyngsta fyndet gratis" | "Poängen och genomgången, för varje CV" |
| "de 25 bästa träffarna varje gång du öppnar sidan" | "Annonserna hämtas tre gånger per dygn, och du söker om med ett tryck" |
| "Svaren känner till ditt CV, dina matchningar och hur testerna gått" | "Jobbcoachen känner till din målroll och de dokument du själv delar i samtalet" |
| "Lön, intervjufrågor, avtal och avslag … och ditt CV" | "Intervjufrågor, uppföljning, avtal och avslag, utifrån svensk arbetsmarknad" |
| "Tio frågor gratis" | "Tio meddelanden gratis" |
| "Ett nivåtest visar var du står" | struket (Nivåkollen ska inte stå i reklam) |
| Bricka "60 sek till första CV-poängen" | "8 testtyper, grundnivån gratis" |
| "Brev som fungerat, yrke för yrke" | "Brev att utgå från, yrke för yrke" (inga påhittade utfall) |
| Telefonen "Mitt jobbsök" med fem steg | de fyra korten |

## Kräver beslut

1. Metatiteln och beskrivningen säger "ATS-anpassade CV:n" och nämner inte testerna först. Textspåret tar det.
2. Talet "543+ har skapat konto" hämtas ur databasen i dag. Det står kvar.
3. Hjältens fyra kort ersätter telefonskärmen `SkarmBana`, som också används på /om-oss.

## Filer som bygget rör

- `src/components/publikt/start/Startsidan.tsx`
- `src/components/publikt/telefon/skarmar/SkarmBana.tsx`, `SkarmMatchning.tsx`, `SkarmCvAnalys.tsx`, `SkarmBrev.tsx`, `SkarmAnnons.tsx`, `SkarmCoach.tsx`, `SkarmMatris.tsx`
- `src/components/landing/LandingNavbar*`, `src/components/Footer.tsx`
- `src/components/publikt/publikt.css` och byggstenarna i `src/components/publikt/`

## SEO:s besked 2026-11-22 (införda i skissen)

- H1, H2 och H3 oförändrade. Metatiteln rörs inte. Beskrivningen får skrivas om om "CV", "personliga brev", "jobbmatchning" och "rekryteringstester" står kvar.
- Meningen om nivåtestet ersätts med en lika lång sann mening, den stryks inte. Skissen: "Efter varje test ser du alla uppgifter med facit och förklaring."
- Sidan har cirka 20 ords marginal mot SEO-grindens gräns på 2 procent.
- I foten står Jobbcoachen under Jobbsöket.

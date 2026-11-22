# Not: /verktyg/jobbmatchning

Skiss: `sidor/jobbmatchning.html`, rum `jobb`. Bilder: `bilder/jobbmatchning-375|412|1440-NN.png`. Ny delfil: `delar/jobbmatchning-skarm.html` (Matchade jobb med en vald träff, också förlagan till telefonskärmen `SkarmMatchning`).

## Vad som ändras mot i dag, sektion för sektion

1. **Hjälten.** Telefonen med "Dina matchningar" och de svävande objekten är borta. I stället står Matchade jobb som i kontot: rubriken, "Senast sökt för 2 timmar sedan. Sök igen", en vald träff med matchgrad i ring, sista ansökningsdag, Därför passar du (roll, kompetenserna en och en, ort) och de tre handlingarna med text: Skriv brev, Spara till Ska sökas, Markera som sökt. Två träffar till ligger under.
2. **Tre träffar gratis, med skälen.** Provkortet blir ett lyft kort med en bild: 25 rutor, tre öppna med matchgrad, 22 med lås. Gränsen syns i stället för att stå i en punkt.
3. **Så fungerar det.** Telefonen `SkarmAktivera` ("CV:t är aktiverat") är borta. Fyra steg som väg, varje steg med en bild ur kontot: kortet Ditt CV med Byt CV, datapunkterna som etiketter, knappen Hitta jobb som passar med Sök igen, och tre ringar i ordning.
4. **Sex datapunkter ur ditt CV.** Sex ikonkort blir Saras CV med sex nålar, och sex kort med samma nummer. Varje kort säger vad som lästes ur just hennes CV.
5. **Sex skäl att låta oss söka åt dig.** Grenarna (undersköterska till tre roller) lyfts upp till ett eget färgblock med matchgrad per gren. De sex skälen blir kort med var sin lilla bild (växeln Nära dig och Hela Sverige, tre prickar per dygn, staplar i ordning).
6. **Från träff till ansökan.** Länklistan får en kedja före sig: träffen i Matchade jobb, den sparade annonsen under Ska sökas med sista ansökningsdag, och den sökta tjänsten, med handlingarnas namn på pilarna. Länkarna står kvar under som brickor.
7. **Premium-avslutet.** Samma rubrik, priset som stort tal och fyra rader.
8. **Frågorna.** Samma åtta frågor.

## Oförändrat för SEO

- H1: Hitta jobb som matchar ditt CV automatiskt.
- H2, samma ordning: Tre träffar gratis, med skälen · Så fungerar det · Sex datapunkter ur ditt CV · Sex skäl att låta oss söka åt dig · Från träff till ansökan · Hitta ditt nästa jobb automatiskt. · Vanliga frågor om att söka jobb. Jag räknar till sju H2 i `_rubriktrad.txt` och i koden, inte åtta.
- H3: alla sex datapunkterna, fem av sex skäl och tre av fyra steg ordagrant. De två som bytts står nedan.
- Löptexten i datapunkterna och i fem av skälen står ordagrant.
- De åtta FAQ-frågorna ordagrant, i samma ordning. Fem svar är ändrade (nedan).
- Schema: WebApplication, HowTo, FAQPage behålls. Title, description, canonical och slug rörs inte.
- Interna länkar: de sex i dag står kvar (personligt brev, Bli upptäckt, CV-exempel, artikeln om AI-jobbmatchning, Byta karriär, Jobbcoachen). Två nya: Rekryteringstester först och Sökta tjänster.

## Bytt för att det var osant

| Var | I dag | I skissen |
|---|---|---|
| Hjältens ingress (1.20) | "Aktivera ditt CV så söker vi bland tusentals lediga jobb från Arbetsförmedlingen." | "Vi läser ditt CV och söker bland tusentals lediga jobb från Arbetsförmedlingen." |
| Hjältens tal (1.8) | "Dagligen: nya annonser in, tillsatta ut" | "25 bästa träffarna i Premium". Tre gånger per dygn står i lyftet och i skäl 5 |
| Provkortet (1.20, 1.5) | "Aktivera ditt CV, så ser du dina tre bästa träffar", "Vilka krav du täcker och vad som saknas, per träff", "tillsatta ut" | "Skapa ett konto och lägg in ditt CV", "Skälen i ord för varje träff: rollen, kompetenserna och orten", "Nya annonser hämtas från Platsbanken tre gånger per dygn" |
| Så fungerar det, ingressen (1.20) | "Fyra steg från aktiverat CV till en lista ..." | "Fyra steg från CV till en lista sorterad efter hur väl du passar." |
| Steg 1, H3 och HowTo (3.4) | "Aktivera ditt CV: Ladda upp ett CV eller välj ett du redan sparat. Aktivering tar några sekunder." | "Ditt CV läses in: Ladda upp ett CV eller bygg ett hos oss. Det senaste läses in av sig självt, och har du flera byter du med Byt CV." |
| Steg 3, texten | "Vi söker direkt mot Arbetsförmedlingens öppna API i hela Sverige." | "Du trycker på Hitta jobb som passar, och vi söker bland Platsbankens annonser i hela Sverige." (sökningen går mot vår hämtade kopia och startar på knappen) |
| Skäl 5, H3 och text (1.8) | "Uppdaterat varje dag: Nya jobb syns i din lista inom timmar efter att de publicerats. Tillsatta tjänster försvinner av sig själva." | "Nya annonser tre gånger per dygn: Annonserna hämtas från Platsbanken tre gånger per dygn. Du söker om med ett tryck när du vill se de senaste." |
| Från träff till ansökan, ingressen (2.12) | "brevet skrivs från träffen, och rekryterare kan hitta dig åt andra hållet" | kedjan träff, sparad, sökt med de tre handlingarna |
| Länken CV-exempel (1.20) | "om du inte har ett att aktivera än" | "om du inte har ett eget än" |
| Premium-avslutet (1.7) | "Aktivera ditt CV och se ... De 25 bästa träffarna, varje gång du öppnar sidan, ingår i Premium" | "Se dina tre bästa träffar ... De 25 bästa träffarna i varje sökning ingår i Premium" |
| FAQ 1 (1.21) | "Aktivera ditt CV i vår jobbmatchningstjänst så söker vi automatiskt ..." | "Ladda upp eller bygg ett CV hos oss, så söker vi ..." |
| FAQ 2 | "Vi söker direkt mot Arbetsförmedlingens öppna API ..." | "Vi hämtar annonserna från Arbetsförmedlingens Platsbank ..." |
| FAQ 5 (1.9) | "Annonserna uppdateras dagligen ... syns den i din lista inom timmar ... försvinner den också automatiskt" | "Annonserna hämtas från Platsbanken tre gånger per dygn. Din lista visar den senaste sökningen, och du söker om med ett tryck ..." |
| FAQ 6 | "Vill du se alla 25 träffar" | "Vill du se de 25 bästa träffarna" |
| FAQ 7 och 8 (1.21) | "ett CV att aktivera", "När CV:t är aktiverat extraheras all data ..." | "att du har ett CV", "Det senaste CV:t läses in av sig självt, och har du flera byter du med Byt CV." |
| `featureList` och HowTo-beskrivningen i schemat (1.8, 3.4) | "daglig uppdatering", "Fyra steg från aktiverat CV" | ska följa sidans nya lydelse. Inte ritat, men måste med i bygget |

"Vad som saknas" står ingenstans i skissen. Det går bara att visa för annonser med utskriven kravprofil.

## Kräver beslut

1. **Två H3 byter lydelse** (steg 1 och skäl 5). Sökorden "aktivera" och "uppdaterat varje dag" bär ingen trafik vad jag kan se, men SEO avgör orden.
2. **"Tillsatta tjänster försvinner av sig själva"** är struket på tre ställen. Jag har inte hittat belägg för hur snabbt en borttagen annons försvinner ur vår kopia. Finns belägget kan meningen tillbaka.
3. **Exemplet i grenarna** är kvar som undersköterska med riktiga arbetsgivarnamn (Region Västra Götaland, Göteborgs stad, Attendo), eftersom texten i skäl 1 bygger på det. Hjälten använder Sara.
4. **Matchgraden som tal.** Ringarna visar 91, 86 och 82. Det är så kontot ser ut, men det är exempel: verkliga träffar ligger ofta lägre (72, 69, 46 i underlagsbilden). Sänk talen om 91 lovar för mycket.
5. **Telefonskärmen `SkarmMatchning` (3.2).** Delen `jobbmatchning-skarm.html` är ritad så att den ryms på 375 px: den valda träffen utan raderna under är skärmen. Den används också på startsidan, `/funktioner`, `/priser` och i artikelreklamen, så den bör godkännas för sig.
6. **Fasta knappraden** längst ned i telefon (`FastKnapprad`) är inte ritad.

## Filer bygget rör

- `src/app/(public)/verktyg/jobbmatchning/page.tsx` (alla sektioner, HowTo-stegen, `featureList`, `VIDARE`).
- `src/app/(public)/verktyg/jobbmatchning/components/jobbmatchning-faq-data.ts` (svar 1, 2, 5, 6, 7, 8).
- `src/components/publikt/telefon/skarmar/SkarmMatchning.tsx` (ritas om) och `SkarmAktivera.tsx` (utgår från sidan; kontrollera att ingen annan sida använder den).
- Nya eller ändrade publika komponenter: träffkortet med ring, kedjan, de 25 rutorna, CV-arket med nålar.
- `layout.tsx` rörs inte.

## Förslag till grunden

- **Ringen (`.mj-ring`)** behövs på startsidan och `/funktioner` också. Flytta den till `kit.css`.
- **`delar/traffar.html`** saknar matchgrad och skriver "sista ansökningsdag 28 november" i underraden. Min del visar hur träffen ser ut i kontot (ring, sista ansökningsdag som egen rad, Därför passar du). Byt gärna startsidans träff mot den.
- **`.traff .gor span`** är 38 px hög. Som bild av knappar är det rätt, men blir de riktiga knappar i bygget ska de vara minst 44 px.

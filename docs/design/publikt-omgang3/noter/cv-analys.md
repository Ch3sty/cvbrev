# Skissnot: /verktyg/cv-analys

Skiss: `sidor/cv-analys.html`, byggd till `ut/skiss-cv-analys.html`. Bilder: `bilder/cv-analys-375-*`, `-412-*`, `-1440-*`.

## Vad som ändras mot i dag

- **Hjälten.** Telefonen med den gamla vyn ("74 av 100", "Förslag per del", "Rätta och kör om") är borta. I stället det riktiga CV-arket med analysens numrerade delar, poängbrickan "93 av 100 i dag", "7 poäng kvar till 100" och delen där poängen tappas. Samma bild som Analys-fliken inloggat.
- **Prova utan konto.** Uppladdningen ligger i ett stort kort som går in över väggen, med vad man får se bredvid. Meningen om inskannade PDF:er står här.
- **Så fungerar det.** Fyra steg som en väg i stället för en lista.
- **Vad vi kontrollerar.** Sex kort om sådant analysen inte längre mäter (nyckelord, kolumner, filstruktur) byts mot de sju delarna, med en stapel som visar hur de hundra poängen fördelas och var exemplet tappar.
- **Vägen till 100.** Ny sektion: i dag, Jobbcoachens förslag och det man gör själv, som en stapel. Gratis och Premium står bredvid varandra.
- **Skrivtips.** Fem kort med före och efter i stället för fem stycken.
- **Premium.** En egen mörk yta med priset som huvudtal.
- **Frågor och svar.** Kort med klack, en fråga öppen.

## Oförändrat för SEO

- URL, canonical, schematyperna WebApplication, HowTo och FAQPage.
- H2 "Analysera ditt CV direkt", "Så fungerar det", "Fem saker som lyfter vilket CV som helst", "Frågor om CV-analysen".
- Brödsmulorna, länken till CV-exempel, alla fem skrivtips.
- Meningen "Inget konto behövs, och vi sparar varken filen eller texten" står ordagrant.
- FAQ-svaret om säkerhet står ordagrant som i dag.

## Rubriker och påståenden som bytts för att de var osanna

| I dag | I skissen | Skäl |
|---|---|---|
| H1 "Få konkret feedback på ditt CV på 60 sekunder" | "Se var ditt CV tappar poäng, del för del", etikett "CV-analys med läsbarhetspoäng" | Poängen visas direkt för ett sparat CV, tiden är inte belagd. "Läsbarhetspoäng" ska vara namnet. |
| "1 analys gratis per konto", "4 delar med förslag" | "7 delar", "100 poäng", "0 kr för poängen, varje CV" | Genomgången är gratis för varje CV, sju delar. |
| "en ATS-poäng och det viktigaste du bör ändra" | "din läsbarhetspoäng och det viktigaste du bör ändra" | Poängen heter läsbarhetspoäng. |
| HowTo-steg 2 till 4 (analyserar i bakgrunden, ATS-poäng och förslag i fyra delar, spara den förbättrade versionen) | Vi går igenom sju delar. Se poängen och vad som saknas. Hämta Jobbcoachens förslag. | Följer vyn som den är nu. |
| H2 "Sex saker rekryteraren och systemet ser först" | "Sju delar, hundra poäng" | Analysen mäter inte nyckelord, kolumner eller filstruktur. |
| H2 "Hela analysen, varje fynd med åtgärd." | "Hela analysen, varje förslag utskrivet." | "Poängen och det tyngsta fyndet är gratis" stämmer inte längre. |
| FAQ "Vad betyder ATS-poängen?", "Hur många analyser får jag göra gratis?", "Kan jag köra analysen igen när jag ändrat i CV:t?" | "Vad betyder läsbarhetspoängen?", "Hur mycket är gratis?", "Kan jag se poängen igen när jag ändrat i CV:t?" | Samma frågor, sanna svar. |
| (saknas) | FAQ "Kan jag ladda upp en inskannad PDF?" | SEO-regeln i uppdraget. |

## Kräver beslut

1. H1. Skissens lydelse är ett förslag. SEO avgör om "CV-analys" ska stå i H1 eller räcker i etiketten och titeln.
2. H2 "Sex saker" blir "Sju delar, hundra poäng". Rubriken byter innehåll, inte bara ord.
3. Skrivtipset "Hoppa över bilden" står kvar, men 15 av mallarna har plats för foto. Textspåret avgör.
4. Tidsangivelsen "60 sekunder" är struken överallt på sidan tills den är belagd.
5. FAQ-frågan "Hur lång tid tar en CV-analys?" är struken i skissen av samma skäl. Vill SEO ha kvar frågan behövs ett sant svar.

## Filer som bygget rör

- `src/app/(public)/verktyg/cv-analys/` (sida, layout, FAQ-data, mini-analysens ruta)
- `src/components/publikt/telefon/skarmar/SkarmCvAnalys.tsx` (ersätts av arket med nålar, används också på startsidan, /priser, /funktioner och i artikelreklamen)
- `src/components/publikt/publikt.css` och byggstenarna i `src/components/publikt/` (Hjalte, Steg, Faq, PremiumBlock, VerktygsMall)
- SEO-diffens baslinje och undantagsfil för sidan

## SEO:s besked 2026-11-22 (införda i skissen)

- H1 blir "CV-analys med läsbarhetspoäng: se var ditt CV tappar, del för del". I skissen står första ledet som etikett inuti H1 (`.h1 .over`), så sökordet finns i rubriken medan ögat läser löftet. SEO behöver säga ja till den lösningen.
- H2 "Sju delar som ger din läsbarhetspoäng" (inte "Sju delar, hundra poäng"). De sju H3 heter som delarna i produkten.
- Ny H2 "Vägen till 100 poäng". Slutblockets H2 "Alla förslag, och nya när du har ändrat."
- HowTo-steg 3 "Se läsbarhetspoängen och vad som saknas".
- FAQ: "Vad är gratis i CV-analysen?", "Räknas poängen om när jag ändrar i CV:t?", "Kan jag ladda upp ett inskannat CV som PDF?". Frågan "Hur lång tid tar en CV-analys?" står kvar med ett sant svar.
- "Hoppa över bilden" står kvar.
- Sidan har cirka 17 ords marginal mot SEO-grindens gräns på 2 procent. Bygget måste hålla längden: de sju delarnas texter ska vara lika långa som dagens sex kategoritexter.

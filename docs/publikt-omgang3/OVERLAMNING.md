# Överlämning: publikt omgång 3

Läget 2026-11-22. Allt ligger på grenen `design/publikt-omgang3` i arbetskopian `C:\Users\chris\cvbrev-publikt3`. Ingenting är pushat. Grenen ligger 0 commits bakom `origin/main` (hämtat efter sista bygget) och innehåller både `feat/jobbsoket-omgang2` och `fix/brev-kvar`, som redan var inne i main.

Bilder av det byggda bredvid skisserna: https://claude.ai/artifact/DLZsLuQPHWe3L4YehxyWra

## Vad som är byggt

- Alla publika sidor i den nya formen: fem färger i stället för beige och svart, ny meny i fyra delar, ny fot, och produktens riktiga vyer i stor skala (testramen, CV-arket med poängen, spåret i Jobbsöket, brevet mot annonsens krav).
- Den nya sidan `/verktyg/sokta-tjanster`, i sajtkartan, menyn och foten.
- Flöden som bär besökarens arbete in i kontot:
  - brevet: mallen från visaren ("Använd som mall"), väljaren med alla 40 mallar, tonvalet och annonsen från säljsidan följer med, och brevet öppnas i den valda mallen;
  - sökt tjänst: arket på den nya sidan är ett riktigt formulär, och den sökta tjänsten skapas i kontot efter registreringen;
  - jobbmatchning: uppladdat CV följer med in i Matchade jobb;
  - Jobbcoachen: frågan står i fältet i kontot;
  - CV-byggaren: yrket och valet från startbladet följer med.
- Texten: det som var osant är rättat enligt `textbeslut.md`, det som är nytt följer `nytt-innehall.md`, och SEO:s besked (`seo-besked-skisser.md`, `seo-slutbesked.md`) är infört. Övrig text står ordagrant som förut.
- Alla 40 mallar har en egen brevbild (`public/mallar/brev/`).

## Grindarna på grenens topp

| Grind | Resultat |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npx vitest run` (hela sviten, körd sist) | 375 filer, 4 718 tester gröna, 13 hoppas över, 0 fel |
| `next build --webpack` med 6 GB heap | exit 0, 804 statiska sidor |
| SEO-grinden mot baslinjen, 498 sidor | Fel 2, se nedan. Inga undantag tillagda utöver dem SEO har sagt ja till. |
| Sajtkartan | 488 adresser: baslinjens 487 plus den nya sidan |
| Webbläsare, 68 sidtyper i 375 och 1440 | ingen sidledsrullning, inga sidfel |

**De två SEO-felen:** `og:image` på `/verktyg/bli-upptackt` och `/verktyg/personlighetstest`. Det lokala bygget ger dem en bild som live inte har, fast varken metadatan eller bildfilen är ändrad mot main. Troligen byggverktyget (lokalt webpack, Vercel bygger på sitt sätt), men det är inte bekräftat.

## Före push

1. **Vercels förhandsvisning:** kontrollera att de två sidorna ovan saknar `og:image` som på live, och läs byggloggen. Det lokala bygget kunde bara köras med `--webpack`, eftersom arbetskopians länkade `node_modules` avvisas av Turbopack.
2. **Klicka med ett riktigt konto** det som inte kördes:
   - CV in i jobbmatchningen (filtolkningen är ett AI-anrop)
   - en riktig PDF på `/cv-mallar`
   - Google-inloggningen för brevet och för Sökta tjänster
   - ett brev i Björk, och att Ladda ner visar Premium-spärren
   - "Jag ska söka" i arket på Sökta tjänster
   - frågan till Jobbcoachen in i kontot efter den sista ändringen (täckt av tester, klickad före ändringen)
   - provet utan konto genom alla fem uppgifterna
3. **Efter push:** revalidera (publika sidor ligger cachade ett dygn), ta ny SEO-baslinje mot live dagen efter, och ta första baslinjen för `/verktyg/sokta-tjanster`.
4. **Städa lokalt:** `.env.local` ligger kopierad i arbetskopian (inte committad).

## Bara ägaren kan avgöra (allt nedan är orört)

1. `/integrationer`: sidan har kort för e-postutskick och koppling till rekryteringssystem. Saas-leads råd: behåll adressen med två sanna kort.
2. Datalagring och säkerhet:
   - fyra FAQ-svar säger "all data lagras i EU" och "det enda som blir kvar är kvitton hos Stripe", medan policyn säger mindre;
   - Glömt lösenordet säger "100% krypterat" och "24 h";
   - samtycket i Bli upptäckt säger "percentiler" där sidan säger "nivå och placering";
   - kontots förifyllning från Matchade jobb har tjänst och arbetsgivare i adressen, som mätningen spelar in;
   - frågorna "Vem kan se mina sökta tjänster?" och "Vad vet Jobbcoachen om mig?" är inte skrivna.
3. Mejl: gratisnivåns kampanjmall och Kom igång-mejlet om Jobbcoachen bär samma fel som de publika sidorna hade. Förnyelsemejlet hoppas över för den som har valt bort kvotmejl. Premiumlistan i `plans.ts` läses av en mejlmall och står därför kvar som förut.
4. Facebook-adressen: foten och startsidans schema pekar på olika adresser.
5. Jobbkartans länsrader är 44 px på pekskärm men 32 px med mus (en konstant, `RH` i `src/components/jobbkartan/app.ts`).

## Beslut agenterna tog som ägaren bör känna till

- Grafit finns inte längre som färg. Sidor utan egen del står i indigo, `/for-rekryterare` och kalkylatorerna i skog, allmänna artiklar i skog.
- Bara ljust läge publikt.
- Menyn är 76 px hög på dator.
- Skapa konto och Logga in står i indigo.
- Brevets Premiummall på gratisnivån: brevet sparas i Linne och öppnas med mallen provad, som brevrummet gör.
- LinkedIn-sidans exempel är statiskt, eftersom verktyget bara är Premium i koden.
- Ny text utan SEO:s uttryckliga ja: felsidans fem rader (sidan svarar 404 och indexeras inte), två rader om att intervjuråden finns i kontot, twitter-beskrivningen för brevsidan (151 tecken).
- Sakfel i skisserna rättade mot koden: talserier har två nivåer, inte tre; 69 yrken har egen mallsida, inte 74; vården har 17 yrken, inte "20+".

## Inte sett i bild

- Bilderna granskades som förminskade blad med urklipp där något såg fel ut. Enskilda textrader är inte lästa i bild.
- Sex sidor är fotograferade och mätta efter färgbytet men inte sedda: priser, om-oss, jobbcoachen, skapa-cv, jobbmatchning och registreringen.
- Mellanbredder, animationer, filmen och inloggat läge.
- Fel lösenord och "kontot finns redan", som kräver anrop mot produktionen.
- Grenen bygger inte vid commit `ac0eb58a` (bara en filborttagning). Toppen bygger.

## Var allt ligger

- `docs/publikt-omgang3/`: kartläggning, textförslag, SEO-krav, textbeslut, SEO:s besked och slutbesked, nytt innehåll, byggbrief, och `bygg/` med en logg per paket (`logg-p0` till `logg-p5b`, `logg-p3b`, `logg-utseende`, `logg-utseende-2`).
- `docs/publikt-omgang3/nya-funktioner.md`: SEO:s lista över nya funktioner med sökord och förslag på artiklar.
- `docs/design/publikt-omgang3/`: skisserna (`sidor/`), grunden (`kit.css`), noterna och bilderna (`bilder/` för skisserna, `bilder-byggt/` för det byggda, ingen av dem i git).
- `scripts/seo-baslinje/publikt-omgang3-*`: sidlistan och undantagsfilen. `docs/qa/seo-diff/publikt-omgang3-fore-live.json`: baslinjen.

# Not: /verktyg/personlighetstest

Skiss: `sidor/personlighetstest.html`, byggd till `ut/skiss-personlighetstest.html`, renderad i 375, 412 och 1440 och granskad i bilderna. Rum `tran`.

## Vad som ändras mot i dag, sektion för sektion

1. **Hjälten.** Väggen i indigo med profilen som bild: ett papper med de fem faktorerna på en femgradig skala och bandordet som chip (Hög, Låg, Mitt emellan), brickan "Ditt tydligaste drag" och en pratbubbla med frågan rekryteraren lär ställa. Tre talbrickor: 20 påståenden, 2 min, 5 faktorer.
2. **Provet är det lyfta kortet** och sidans första handling. Påståendet i stor rubrikstil, raden "Hur väl stämmer det på dig?", fem svarskort i rad (siffran i en bricka, ordet under, som i det inloggade testet) och stapeln med tjugo bitar. Ett tryck svarar, så kortet har ingen egen knapp. Bredvid: vad man får direkt (två bockar) och vad som väntar i gratiskontot (två lås).
3. **Så fungerar det.** De fyra stegen som en väg, vart och ett med en liten bild av sitt innehåll: skalan 1 till 5, profilen med bandord, tre kravprofiler med utfall, talet 50. Telefonen med intervjufrågorna flyttar till sektionen nedan.
4. **De fem faktorerna och vad rekryteraren ser i dem.** Här läses profilen mot en kravprofil. De sex kravprofilerna står som val (Ledarskap och projektledning vald). Varje faktor är ett kort med texten till vänster och en mätare till höger: kravprofilens spann som streckad yta, Saras värde som kopparpunkt och utfallet som chip (Passar kravprofilen, Räkna med en fråga). Faktorn där profilen hamnar utanför spannet har kopparkant. I dag: fem textkort.
5. **Frågor rekryteraren lär ställa** (ny delrubrik på H3-nivå, i samma sektion). En färgplatta med frågorna som pratbubblor och "Så svarar du" som svar: fråga 1 och 2 med svar, fråga 3 märkt Fördjupade testet.
6. **Femtio påståenden, gratis i kontot.** Tre test som tre steg i en trappa: 20 utan konto, 50 gratis i kontot (framlyft på papper, med tre bockar och knappen Skapa konto gratis), 120 i Premium.
7. **Vanliga frågor.** Sex frågor med svaren ordagrant som i dag.

## Oförändrat för SEO

- H1 och de fyra H2 ordagrant och i samma ordning. H3: fyra steg och fem faktorer (Samvetsgrannhet, Utåtriktning, Stabilitet, Vänlighet, Öppenhet) som i dag.
- Alla texter i stegen, faktorerna och FAQ är dagens, ordagrant.
- Schema: WebApplication, Offer, FAQPage. Länkarna Skapa konto gratis och Gör provet först är kvar.
- Provet serverrenderas som i dag (fem svarsalternativ i HTML:en).

## Bytt eller tillagt

- Inget påstående var osant. Tillagt: H3 "Frågor rekryteraren lär ställa" (fanns som rubrik i telefonskärmen), en länk till /verktyg/rekryteringstester i slutet, och raden om att hela tolkningen följer med ett gratiskonto.
- Skalans ord i skissen är de publika provens (Stämmer inte alls, Stämmer dåligt, Varken eller, Stämmer ganska bra, Stämmer helt). Det inloggade testet har andra ord i dag (byggnoterna, omgång 2 B2); frågan ligger redan hos ägaren.

## Kräver beslut

- **Kravprofilernas spann i mätarna är ritade för skissen.** De riktiga kommer ur `KRAVPROFILER` i `src/lib/personlighet/smakprov-tolkning.ts`. Ska mätarna visa ett fast exempel (Sara mot Ledarskap och projektledning) eller gå att växla mellan de sex?
- **Mätarna visar tal 1 till 5** på axeln. FAQ-svaret säger att provet visar bandord i stället för poäng. Exemplet gäller hela testet, men det bör stå tydligt, eller så tas siffrorna bort ur axeln.
- **Svarskorten på 375 px** har 12 px text (grundens minsta), produkten har 11 px i korten. Orden ryms utan avstavning mitt i ord, men marginalen är liten.

## Filer bygget rör, så långt det syns

- `src/app/(public)/verktyg/personlighetstest/page.tsx`.
- `src/components/publikt/VerktygsMall.tsx` (sidan lämnar mallen eller mallen får nya platser), `telefon/skarmar/SkarmIntervjufragor.tsx` (utgår här).
- `src/components/artiklar/personlighetsprov/Personlighetsprov.tsx` och `personlighetsprov-copy.ts` (provets panel flyttar in i det lyfta kortet; delas med två artiklar, så formen måste hålla där också).
- `src/lib/personlighet/smakprov-tolkning.ts` (läses för kravprofilerna, ändras inte).
- SEO-baslinjen för sidan togs om 2026-11-21 (`scripts/seo-baslinje/publika-prov-omgang3-2026-11-21-undantag.json`): ett nytt H3 ger en diff som ska godkännas.

## Förslag till grunden

- Klassen `.svar` i kit (matrisens svarsrad, sex kolumner) krockar lätt med egna klasser som heter svar. Jag döpte om min till `.isvar`. Förslag: `.matris-svar` i grunden.
- Profilens skala (fem segment, kopparsegmentet är värdet) används nu på två sidor. Den kan bli en del i grunden (`.skala`).

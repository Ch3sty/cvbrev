# Säljgranskning A1 till A5, köpvägen på de köpnära sidorna (14 november 2026)

Säljansvarig (inlånad från Begone). Gren `feat/seo-tester-omgang2` (36b920a5), `git diff main..HEAD -- content/artiklar/`. Mot villkoren i `docs/beslut-seo-tester-omgang2-salj-2026-11-14.md`, avgörandena hos saas-lead och avsnitt H i planen. Kontrollerat mot `src/lib/traning/gratisniva.ts`, `src/lib/analytics/provkalla.ts`, `ArtikelKlient.tsx`, `useArtikelProv.ts`, `ProvaFlow.tsx` och `mittTestFranKalla.server.ts`. Inga filer ändrade utom den här.

Inga kampanjord (Black Week, rabatt, 99 kr, 49 kr) och inga tankstreck i de fyra filerna. Inget lovar en viss höjning för en enskild person: logiktest-tips talar om snitt i metaanalyserna och "kan räcka", Alva-sidan säger "sällan mer än ett steg".

## A1 alva-labs-logiktest.mdx: GODKÄND

- Provet ovanför resultattabellen: `<ArtikelProv typ="matris" />` på rad 40, tabellen 1 till 10 på rad 121. Uppfyllt.
- "Kan man göra om" slutar med provet och valet: rad 207 `[Gör vårt matrisprov med Alva som ditt test](/verktyg/rekryteringstester/prova?fran=alva-labs-logiktest&mitt_test=alva)` följt av "Övningsprovet i Alvas format, 20 uppgifter med två minuter var, ingår i Premium." Rätt parametrar, sant om Premium (`provlageGratis: false`). Uppfyllt.
- Titeln: "Alva logiktest: öva gratis och förstå resultatet 1 till 10". Övning före resultat. Uppfyllt.
- Länkarna utan parametrar (rad 227, 267, 272) får ändå `alva-labs-logiktest` och `alva` via `ArtikelKlient` och `ARTIKEL_MITT_TEST`. Inget fel.

Rättas i samma omgång, fäller inte (stod före grenen): FAQ "Går det att öva på Alva Labs logiktest gratis?" (rad 19 och 298) slutar "Du kan öva gratis på samma format hos oss, där du provar fem matrisfrågor utan konto och sedan kan träna på tre nivåer." Gratis är smakprovet, Nivåkollen en gång och ett första pass. Avancerad nivå och pass från dag två ingår i Premium. Förslag: "...där du provar fem matrisfrågor utan konto och med ett gratiskonto gör Nivåkollen och ett första pass. Övningsprovet i Alvas format ingår i Premium." Copy formulerar. Ändringen rör FAQ-schemat, så SEO ser den.

## A3 logiktest-tips.mdx: UNDERKÄND

1. **Ingen väg från "ta reda på vilket test" till valet "Mitt test".** Rad 87: "När du vet testet kan du välja det som "Mitt test" när du skapar ett gratiskonto hos oss. Då läggs träningen upp efter just det formatet." Meningen saknar länk. Tabellen ovanför (rad 61 till 80) länkar bara till artiklarna om formatet, alltså en omväg på en sida till innan provet. Det var villkoret i min granskning: från snabbsvaret till valet utan omväg.
   Rättelse: ge varje rad i tabellen en länk till provet med valet, och låt rad 87 länka till provet.
   - Alva Labs: `/verktyg/rekryteringstester/prova?fran=logiktest-tips&mitt_test=alva`
   - Assessio eller Matrigma: `...?fran=logiktest-tips&mitt_test=matrigma`
   - SHL: `...?fran=logiktest-tips&mitt_test=shl`
   - Aon eller cut-e: `...?fran=logiktest-tips&mitt_test=aon`
   - Polisen, mönstring eller Försvarsmakten: `/verktyg/rekryteringstester/prova?typ=iprov&mitt_test=iprov&fran=logiktest-tips`
   - Rad 87, inget namn i inbjudan: `/verktyg/rekryteringstester/prova?fran=logiktest-tips` (valet görs i ingången).
   Formatartiklarna får stå kvar i samma cell. Ankartexterna är SEO:s och orden copys.
2. **Snabbsvarets sista mening leder till läsning, inte till valet.** Rad 44: "Börja med att ta reda på vilket test du ska göra, så visar vi nedan var du läser om just det formatet." Rättelse i sak: meningen ska säga att du väljer testet och övar på det formatet hos oss, inte att du läser om det. Copy formulerar, ingen länk i snabbsvaret behövs om tabellen bär länkarna.

Godkänt i övrigt: snabbsvaret bär övningseffekten med "samma test" (Hausknecht 2007) och "Ja, men måttligt". Provet står direkt efter snabbsvaret (rad 46). "Övningsprovet med testets antal uppgifter och tider ingår i Premium" (rad 87) är sant.

## A4 stanine-testresultat.mdx: UNDERKÄND (köpvägen, en kodrad)

1. **Det inbäddade I-provsprovet tappar valet "I-prov" och därmed provdatumskärmen.** Rad 64 `<ArtikelProv typ="iprov" />`. `useArtikelProv.ts` rad 116 sätter valet med `mittTestForArtikel(slug)`, och `stanine-testresultat` finns inte i `ARTIKEL_MITT_TEST`. Den som gör I-provets smakprov på sidan och skapar konto får därför inget `mitt_test`, och `fragaProvdatumEfterKonto` frågar aldrig efter datumet. Det är sidans huvudsakliga köpväg för I-provsgruppen, och den gör också mätningen "andel av N8:s konton som väljer I-prov" omöjlig. `/prova` gör rätt via `PROV_MITT_TEST[typ]`, artikelprovet inte.
   Rättelse (kod, inte innehåll): i `src/components/artiklar/prov/useArtikelProv.ts` rad 116, `const mitt = mittTestForArtikel(slug) ?? PROV_MITT_TEST[typ]`. Påverkar bara typen `iprov` på sidor utan eget val. Lägg inte `stanine-testresultat` i `ARTIKEL_MITT_TEST`: då får matrislänken för arbetsgivartest (rad 151) fel val. Det är en ändring i en publik komponent, så saas-lead avgör om den går in i den här omgången eller före publiceringen av sidan.
2. Köpvägen för den som ska göra om ett test (rad 151): rätt. `?typ=iprov&mitt_test=iprov&fran=stanine-testresultat` ger valet och datumfrågan, "Övningsprovet med alla sex deltester i provets ordning ingår i Premium" är sant, och matrislänken `?fran=stanine-testresultat` utan val är rätt för okänd arbetsgivare.
3. Skolgruppen ut tidigt (rad 28): uppfyllt. Den får veta i andra stycket att exemplen gäller arbetstest och I-provet.

Rad 151 "så kan du ange datumet och få en plan fram till provet" är sant men säger inte att passen från dag två ingår i Premium. Se förslag.

## A5 i-prov.mdx: UNDERKÄND

1. **Det nya avsnittet "Är I-provet ett IQ-test?" slutar utan provet.** Sista stycket länkar till stanine-sidan och slutar "Den som letar efter ett IQ-test inför polisprövningen ska alltså öva på I-provet, och ett allmänt IQ-test på nätet säger lite om hur det går." Det är avsnittet som ska fånga "iq test polis", och nästa steg det ger är en trafiksida.
   Rättelse: avsluta med en mening som leder till I-provets smakprov, `/verktyg/rekryteringstester/prova?typ=iprov&mitt_test=iprov&fran=i-prov`. Stanine-länken får stå kvar tidigare i stycket.
2. FAQ "Finns det ett gratis IQ-test för polisen?": godkänd. "Vårt smakprov har en uppgift per deltest i provets ordning och är gratis utan konto" är sant, och svaret har inga kampanjord.

Rättas i samma omgång, fäller inte (stod före grenen men står i snabbsvaret som grenen ändrar): "Grundnivån i övningen inför I-provet är gratis med konto" (rad 42), samma påstående på rad 46, i FAQ "Kan man öva på I-provet gratis?" (rad 19 och 315) och i planens vecka 1 (rad 265). Enligt `gratisniva.ts` (`grundpassVarjeDag: false`) är gratis Nivåkollen en gång per deltest och ett första pass, inte grundnivån över en vecka. Förslag: "Smakprovet är gratis utan konto. Med ett gratiskonto gör du Nivåkollen och ett första pass. Passen därefter och hela övningsprovet i I-provets ordning ingår i Premium." Copy formulerar. FAQ-schemat ändras, så SEO ser det.

## Förslag (fäller inget)

- **logiktest-tips dag 6:** "Ett helt prov med samma antal uppgifter och samma tid som det riktiga" är exakt provläget. En halv mening om att övningsprovet i ditt tests format ingår i Premium gör planen till köpväg. Copy avgör.
- **stanine rad 151:** "få en plan fram till provet" kan kompletteras med att passen från dag två ingår i Premium, så att kontot inte möter väggen oförberett.
- **Länktexten "Rekryteringstester: öva gratis på alla testtyper"** (logiktest-tips rad 178, stanine rad 164, Alva rad 271) säger mer än gratisnivån ger. SEO äger ankartexten. "prova gratis" vore sant.
- **Mätning:** när A4-rättelsen är inne läses andelen av kontona med `acquisition_source.kalla = smakprov:stanine-testresultat` som har `test_planer.mitt_test = iprov`, från publiceringen till 9 feb. Under 20 procent betyder att sidan bedöms som trafiksida. För A3 läses fördelningen av `mitt_test` bland konton med källan `logiktest-tips`. Andelen utan val, eller "annat", visar om tabellen gör sitt jobb.

## Omgång 2 (14 november 2026)

Granskat bara de rättade punkterna, ocommittade ändringar i arbetskopian på `feat/seo-tester-omgang2`.

- **A1: GODKÄND.** FAQ-svaret (frontmatter och synligt) säger nu "fem matrisfrågor utan konto, och med ett gratiskonto Nivåkollen och ett första pass. Avancerad nivå, dagliga pass och övningsprovet i Alvas format ingår i Premium." Stämmer med `gratisniva.ts`. Inga kampanjord.
- **A3: GODKÄND.** Alla fem raderna i leverantörstabellen har en provlänk med `?fran=logiktest-tips&mitt_test=alva|matrigma|shl|aon`, och I-provet `?typ=iprov&mitt_test=iprov&fran=logiktest-tips`. Rad 87 länkar till `/verktyg/rekryteringstester/prova?fran=logiktest-tips`. Snabbsvaret slutar "Känn på formatet i provet nedan, och välj sedan ditt test i tabellen." Vägen från snabbsvaret till valet går utan omväg. "Övningsprovet i samma format som ditt test, så långt formatet är känt, ingår i Premium" är sant.
- **A5: GODKÄND.** "Är I-provet ett IQ-test?" slutar med `[Gör I-provets smakprov](/verktyg/rekryteringstester/prova?typ=iprov&mitt_test=iprov&fran=i-prov)`. Formuleringarna om grundnivån står kvar på testansvarigs bekräftelse att de stämmer med produktens spärr. De fällde inte i omgång 1 och gör det inte nu.
- **A4: Texten är GODKÄND. Kodpunkten är öppen hos saas-lead.** Textlänken på rad 151 bär `?mitt_test=iprov`. Det inbäddade I-provsprovet på rad 64 sparar fortfarande inte valet (`useArtikelProv.ts` rad 116), så den som går via inbäddningen får ingen fråga om provdatum. Sälj vill att rättelsen går in före publiceringen. Om den väntar gäller det här: mätningen av andelen I-prov bland sidans konton räknas tills vidare bara på konton som kommit via textlänken, och tolkas med det förbehållet.

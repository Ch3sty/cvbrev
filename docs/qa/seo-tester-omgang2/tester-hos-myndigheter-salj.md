GODKÄND

Säljgranskning av /artiklar/tester-hos-myndigheter (N9), 2026-11-14. Läst mot säljbeslutet (N9-raden, N9 sälj-tillägg, avsnitt 3), planens N9 och src/lib/traning/gratisniva.ts. Artikeln är inte ändrad.

## Bedömning

- **Ägarens villkor uppfyllda.** Faktarutan om att vi saknar koppling står direkt efter snabbsvaret (rad 32). Ingen testleverantör kopplas till en myndighet: Adda-leverantörerna avgränsas uttryckligen från de statliga myndigheterna (rad 175), och I-provet nämns bara villkorat ("Nämner din kallelse I-provet", rad 153). Inga myndighetsnamn i title, seoTitle, description, tags eller FAQ (Varbi är ingen myndighet).
- **Provet ligger rätt.** Matrisprovet (rad 101) kommer efter tabellen som besvarar sökfrågan och före myndighetsavsnitten, med en saklig brygga (rad 99) utan säljord. Det håller provet högt utan att skjuta undan svaret.
- **Köpvägen är tydlig utan att vara påträngande.** Premium nämns en gång, efter provet och i förberedelseavsnittet (rad 195). I-provsgruppen leds till i-prov och till I-provets smakprov med `mitt_test=iprov&fran=tester-hos-myndigheter` (rad 153). Slutlänken bär `fran=tester-hos-myndigheter&mitt_test=annat`. Inga kampanjord, inga priser.
- **Gratis och Premium stämmer med gratisniva.ts.** "nivåmätning och ett första träningspass samma dag" = matningGratis och grundpass dag 0. "Den dagliga träningen efter det, och övningsprov med tidtagning, ingår i Premium" = grundpassVarjeDag false och provlageGratis false. Annat får vårt provläge (18 på 25, tempo.test.ts), så "övningsprov med tidtagning" är sant även utan leverantör.
- **Inget tappar avsikten.** Varbi- och Adda-avsnitten är förtroendebärande och svarar på frågor besökaren faktiskt har.

## Rättelser

Inga som krävs för godkännande.

## Förslag (copy, SEO eller produkt avgör)

1. **Det inbäddade provet bär inte valet "Annat".** `tester-hos-myndigheter` saknas i `ARTIKEL_MITT_TEST` (src/lib/analytics/provkalla.ts rad 55). Den som gör provet på rad 101 och skapar konto får källan `smakprov:tester-hos-myndigheter` men inget förvalt test, medan slutlänken (rad 195) förväljer `annat`. Två vägar in ger två olika konton. Förslag: lägg till `'tester-hos-myndigheter': 'annat'` i kartan (en rad, produktändring, inte artikeln). Då blir kedjan densamma som säljbeslutets avsnitt 3 förutsätter.
2. **Rad 195: "Välj 'Annat eller vet inte' som ditt test och kryssa i de delar du tror kommer".** När valet är förvalt via länken sparas det på servern och kontot landar på provresultatet (ValkommenClient rad 90 till 108); besökaren ser troligen inget valsteg. Klicktesta som ny användare. Ser hon inget val bör meningen beskriva vad som händer ("Ditt test sparas som Annat eller vet inte, och i inställningarna kryssar du i de delar du tror kommer"). Copy formulerar.
3. **I-provsvägen syns bara långt ner (rad 153).** Den som söker på tullaspirant eller kustbevakare hittar den, övriga med I-provskallelse kanske inte. Förslag: i "Läs inbjudan först" (rad 187) en halv mening om att den som har en kallelse till I-provet har en egen genomgång, med länk till i-prov. Högst en länk per målsida och avsnitt gäller, så det går. SEO prövar ankaret.
4. **Länktexten "Rekryteringstester: öva gratis på alla testtyper" (rad 200)** säger mer än gratisnivån ger, samma anmärkning som i salj-a1-a5.md. "prova gratis" vore sant. SEO äger ankartexten och den är gemensam för flera sidor.

## Mätning

Från publiceringen till 9 feb: konton med `acquisition_source.kalla` som `smakprov:tester-hos-myndigheter` eller `artikel:tester-hos-myndigheter`, fördelade på `test_planer.mitt_test` (annat, iprov, inget val). `article_cta_clicked` per position (hero mot inline) och provstarter per `test_kind` för matris mot iprov. Köp per konto bedöms utanför kampanjveckan, hypotes 5 procent. Omprövning enligt planen: under 50 visningar på 28 dagar till 9 feb.

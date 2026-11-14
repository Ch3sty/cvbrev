# Säljgranskning: cubiks-logiks-test (A8, N11)

Säljansvarig (inlånad från Begone), 2026-11-14. Granskat: `content/artiklar/cubiks-logiks-test.mdx` mot `src/lib/traning/gratisniva.ts`, `src/lib/traning/mittTest.ts`, `src/lib/analytics/provkalla.ts`, `src/lib/traning/hemvy.ts`, `src/lib/nivakoll/motor.server.ts`. Inget ändrat.

## Utlåtande: UNDERKÄND, en rättelse

**Rad 125:** "Avancerad nivå, dagliga pass och övningsprov ingår i Premium."

Fel: på en Cubiks-sida läses "övningsprov" som ett övningsprov i Cubiks format, och det har vi inte (villkoret "inget löfte om ett Cubiks-prov"). Det är dessutom inte belagt för den här vägen: ett konto med "Annat" och delarna siffror, text och figurserier hamnar i hemvyns läge `annat_test` (1t, `hemvy.ts`), som inte visar provdagen eller övningsprovet. Premium ska bara nämnas med det kontot faktiskt får.

**Rättelse:** stryk "och övningsprov", alltså "Avancerad nivå och dagliga pass ingår i Premium." Copy får formulera om, men inget prov i leverantörens format får nämnas.

Efter rättelsen är sidan GODKÄND från sälj utan ny granskning.

## Villkoren i övrigt, uppfyllda

- **Inget löfte om ett Cubiks-prov.** Faktarutan (rad 32) och FAQ (rad 19 och 157) säger uttryckligen att vi inte har något Cubiks-prov.
- **Numeriskt prov inbäddat.** `<ArtikelProv typ="numerisk" />` på rad 40, före tidtabellen. Det är rätt ordning: den som söker tiderna passerar provet på vägen ned.
- **"Mitt test" är "Annat".** Rad 125 säger det. Sidan står inte i `ARTIKEL_MITT_TEST`, så inget val sätts tyst; kontot väljer själv i ingången och bär källan `smakprov:cubiks-logiks-test`, så köp kan läsas per sida.
- **Gratis sant beskrivet.** Fem uppgifter utan konto (rad 19), Nivåkollen och ett första pass med gratiskonto. Nivåkollen är gratis en gång per testtyp (`nivakoll/motor.server.ts`), så "Gör Nivåkollen i varje del" (rad 119) håller.
- **Inga priser, inga kampanjord, inga talstreck.**

## Leder sidan till provet och kontot utan omväg?

Ja. Snabbsvar, faktaruta, ett kort avsnitt och sedan provet. Efter provet tar kontosteget över, och texten på rad 125 säger vad kontot ska välja. Ingen länk lämnar köpvägen före provet.

## Förslag, inte villkor (copy och SEO avgör)

1. **Använd gränssnittets ord på rad 125.** Kortet heter "Annat eller vet inte" och delarna "Siffror och tabeller", "Ord och text" och "Figurserier" (`MITT_TEST_KORT`, `DELTYP_NAMN`). Den som letar efter "Annat" och "numeriskt" hittar annars inte exakt det texten säger.
2. **FAQ rad 19 och 157:** "ett första pass i numeriskt, verbalt och figurserier" kan läsas som ett gratispass i varje del. Säkrare: "Nivåkollen i numeriskt, verbalt och figurserier och ett första pass".
3. **Mät:** konton med källan `smakprov:cubiks-logiks-test` och andelen av dem som väljer "Annat" med minst en kryssad del. Om under hälften väljer delar blir kontot ett matriskonto (Annat utan kryss ger figurer och mönster) och Cubiks-avsikten tappas. Läses fyra veckor efter publicering.

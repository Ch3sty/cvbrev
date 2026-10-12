# Granskning verbalt parti 04

Datum 2026-10-12. Granskare: testansvarig. Underlag: `docs/qa/omgang3-f/verbalt-parti-04.html`, `src/lib/verbalTestV1/underlagParti04.json` (vg-13 till vg-20), `src/lib/verbalTestV2/underlagParti04.json` (va-17 till va-24). Beslut i `beslut.json`. Villkoren ska vara införda innan `UNDERLAG_VERSION = 4` deployas.

Jag har läst alla 16 texter och prövat alla 64 påståenden mot texten på egen hand innan jag läste facit och förklaring. Måltypens två påståenden är kontrollerade mot kravet från parti 03: två av samma typ, olika nog för att ett riktat pass ska mäta två saker.

## 1. Grund, vg-13 till vg-20: 8 av 8 godkända

Alla 32 facit stämmer med texten. Kvantorerna (alltid, alla, samtliga) ställs mot ett uttryckligt "i vissa fall", "några" eller "90 dagar är reserverade", så det falska är falskt i texten och inte i världen. De nio "går inte att avgöra" är rimliga påståenden som texten faktiskt inte rör (årsarbetstid, juli, fullt garage, godare mat, vinst, säsong, hela dagar, pappors uttag). Texterna är korta, konkreta och på grundnivå. Inga talstreck.

Måltypens par:

- **Direkt (13, 14):** ett sant och ett falskt per text, om olika saker. Bra.
- **Slutledning (15, 16):** skåpet tomt på måndag ur "töms varje fredag eftermiddag" och appen ur "avgift som betalas i en app"; förseningsavgift ur "försvinner av sig självt" och fjärde lånet ur "tak tre per vecka". Två tydliga tvåstegsslutsatser var. Bra.
- **Kvantor (17, 18):** vg-18 har ett "går inte att avgöra" (alla hyresgäster har en försäkring) och ett falskt (varje försäkring ersätter mobilen), vilket är den variation ett riktat kvantorpass ska ha. vg-17 har två falska som båda faller på samma grepp, "alla/samtliga" mot "några". Godtas, men se rekommendationen nedan.
- **Utanför (19, 20):** två per text om olika saker (ekonomi och säsong; uttagsform och förändring över tid). Bra.

Rekommendation, inget villkor: byt vg-17 andra kvantorpåstående till ett "går inte att avgöra", till exempel "Svinnet har minskat i samtliga matsalar som väger maten" (texten säger bara att svinnet har minskat, inte var), så att de två kvantorerna inte faller på samma grepp.

## 2. Avancerad, va-17 till va-24: 8 av 8 godkända, två villkor

Alla 32 facit stämmer. Texterna argumenterar åt två håll och påståendena kräver att man håller isär vad regionen, facket, myndigheten eller kritikerna säger. Varje text har minst ett kvantorpåstående. Tolv "går inte att avgöra" av 32. Inga talstreck.

Måltypens par:

- **Direkt (17, 18):** sant och falskt om olika saker. Bra.
- **Slutledning (19, 20):** diabetes ur "medicinska skäl, till exempel för att mäta blodsocker" och egna telefoner ur "skolan lånar ut"; byta leverantör ur "sällan kan byta" och visa kostnader ur prisrådets krav. Bra.
- **Kvantor (21, 22):** va-22 har ett "går inte att avgöra" (aldrig mer, mot "i de flesta regioner") och ett falskt. va-21 har ett falskt och ett "går inte att avgöra" (aldrig begärt vite). Bra variation.
- **Utanför (23, 24):** va-23 bra (vinst och balkonger). va-24: båda påståendena handlar om grannkommunen efter att avgiften togs bort (fler sökande, längre köer), och köer följer av sökande. Den som ser att det ena inte går att avgöra får det andra gratis. Villkor nedan.

Villkor:

- **va-21, texten.** Första meningen säger att arbetsgivare med minst tio anställda ska göra en lönekartläggning. I diskrimineringslagen gäller kravet på årlig lönekartläggning alla arbetsgivare; det är den skriftliga dokumentationen som gäller från tio anställda. Texten ska inte påstå något som är fel i världen även om provet bara mäter läsning. Ny första mening: "Alla arbetsgivare ska varje år göra en lönekartläggning, och arbetsgivare med minst tio anställda ska dokumentera den skriftligt." Påstående 1 blir "Alla arbetsgivare måste dokumentera sin lönekartläggning skriftligt." (falskt, oförändrad typ kvantor). Påstående 4 blir "En arbetsgivare med sex anställda kan få betala vite för att den inte dokumenterar sin lönekartläggning skriftligt." (falskt, typ slutledning). Förklaringarna skrivs om i samma anda. Övriga påståenden orörda.
- **va-24, påstående 2 byts.** Ersätts med ett "utanför" om något annat texten lämnar öppet, till exempel "Lärarbristen är störst inom instrumentundervisningen." (texten säger att kulturskolorna länge haft svårt att rekrytera lärare, inget om vilka ämnen). Facit "går inte att avgöra", typ utanför.

## 3. Utfall

16 av 16 godkända, två villkor på avancerad. Efter deploy: verbalt grund 20 texter typade för riktade pass (kvantor och utanför på grund får nu tre texter var), avancerad 24.

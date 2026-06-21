# Designstandard: artikelbilder jobbcoach.ai — "Modern geometrisk"

Detta är den LÅSTA standarden för seriens sex artikelbilder. Målet: illustrationer i klass med Stripe, Linear, Vercel och Intercoms blogg-grafik. Premium, rent, med djup. INTE clipart, INTE söta gubbar, INTE platta trianglar-som-träd.

## Format (hårda krav)
- Ren SVG. `width="1536" height="1024" viewBox="0 0 1536 1024"`. font-family `Inter, Arial, sans-serif`.
- Läsbar ner till ~360px thumbnail.

## Färg (LÅST — ändra inte)
- Bakgrund: ljus varm DIAGONAL gradient, övre vänster `#F97316` → mitt `#DC2626` → nedre höger `#BE185D`. Ut i alla fyra hörn. INGEN mörk vinjett, INGA mörka/svarta hörn.
- Objektfärger ovanpå: vitt/`#fff7ed` för "ljusa kort", varma djupare toner (`#9a3412`, `#7c2d12`, `#be123c`) för skuggade/bakre lager, `#F59E0B`/`#fbbf24` (amber) som accent, grön `#16a34a` ENDAST för "rätt/klar/mål"-signaler. Slate `#0f172a`/`#334155` bara för text på ljusa kort.

## Stilprinciper — "modern geometrisk" (detta avgör om det ser dyrt eller billigt ut)

1. **Bygg av rena geometriska primitiver med MENING.** Rektanglar, cirklar, rundade kort, linjer, bågar. Varje form ska representera något (ett kort = ett svar, en stapel = en lön). Använd INTE figurativ clipart (gubbar, hus med fönster, granar, kompass-som-skylt).

2. **Djup genom lager och skugga.** Objekt ska överlappa och kasta MJUKA skuggor (feDropShadow med stor stdDeviation, låg opacity ~0.2–0.35, varm skuggfärg som `#7c2d12`). Minst 2–3 z-lager: bakre dämpade element, mellanlager, ett upplyft fokuselement. Platt = billigt.

3. **Inre gradienter på objekt.** Vita kort får en svag topp-till-botten-gradient (`#ffffff`→`#fff7ed`). Accentformer får egna gradienter. Aldrig helt platta enfärgade ytor på stora objekt.

4. **EN tydlig fokuspunkt.** Ett stort tal (t.ex. 10/30/5/45 000) eller en dominant form som ögat landar på först. Den får vara delvis utfallande ur ramen för rörelse. Gör den till seriens blickfång (CTR).

5. **Komposition med rörelse, inte stelt rutnät.** Diagonaler, ett upplyft element som bryter linjen, asymmetri. Lämna medvetet andningsrum. Texten (etikett-pill + rubrik + undertext) i ett hörn, illustrationen balanserar mot motsatt sida.

6. **Subtila detaljer som signalerar kvalitet.** Tunna ljusa kantlinjer (1px `rgba(255,255,255,0.5)`) på kort, små highlight-glimtar, en mjuk glow bakom fokuspunkten (radiell, varm amber), ev. ett finmaskigt rutnät/prickmönster med MYCKET låg opacitet (~0.05) för textur. Aldrig grova synliga mönster.

## Förbjudet (det som gör det till AI-slop)
- Figurativ clipart: gubbar/figurer, hus med fönster, granar/träd som trianglar, clipart-kompass, clipart-mynt.
- Platta enfärgade former utan skugga eller gradient.
- Symmetriskt allt-centrerat, eller "ikon ensam i en rundad ruta".
- Stökiga mönster, hårda svarta skuggor, mörka hörn.
- Pyttig text som blir grötig (under ~22px för innehållstext i illustrationen).

## Text
- Etikett: liten versal i pill. Rubrik: stor, fet, max 2 rader, vit (ev. en rad i amber). Undertext: vit/ljus, god kontrast, mjuk skugga vid behov.
- ALLA svenska tecken korrekt: å ä ö Å Ä Ö. Strippa ALDRIG diakriter ("Varför" ej "Varfor"). Du får använda XML-entiteter (`&#229;`=å, `&#228;`=ä, `&#246;`=ö) om du är osäker på rå UTF-8.
- Watermark nere till höger: `<text x="1460" y="998" font-size="14" font-weight="500" fill="#ffffff" opacity="0.3" text-anchor="end">jobbcoach.ai</text>`

## Tekniskt (annars kraschar renderingen)
- ALDRIG dubblerade attribut på samma tagg (`rx="20" rx="20"`, `r="5" r="5"`).
- radialGradient: deklarera cx/cy/r EN gång; blanda inte %-värden och userSpaceOnUse-värden.
- Inga CSS-properties som SVG-attribut (`text-transform`, `box-shadow`). Skriv versaler direkt.
- Välformad XML, alla taggar stängda.

## Output
Returnera ENBART giltig SVG (börja `<svg`, sluta `</svg>`). Ingen markdown, ingen förklaring.

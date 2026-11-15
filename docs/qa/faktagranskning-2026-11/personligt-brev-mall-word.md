# Faktagranskning: content/artiklar/personligt-brev-mall-word.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Det största felet gäller löftet i titel och beskrivning: sidan har inga nedladdningsbara Word-mallar. Dessutom är ett Word-mått fel och funktionerna i vårt verktyg beskrivs utan att det framgår att de kräver Premium.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 2, 5 | title "Personligt brev mall Word: Gratis mallar 2026", description "Ladda ner gratis personligt brev-mallar för Word. Färdiga och professionella mallar redo att använda direkt" | fel (produkt) | Artikeln har ingen .docx-nedladdning. PersonligtBrevPreview/InteractiveLetterPreview visar exempelbrev utan nedladdningsfunktion, och brevverktygets Word-export kräver Premium. Antingen läggs riktiga gratis .docx-mallar upp, eller så skrivs titel och beskrivning om, t.ex. "Personligt brev mall Word: så väljer och fyller du i rätt mall (2026)" med "Hitta en bra Word-mall för personligt brev, se exempel per yrke och fyll i mallen rätt ...". | src/components/mdx/PersonligtBrevPreview.tsx, src/app/(public)/personligt-brev-exempel/[yrke]/InteractiveLetterPreview.tsx (ingen download/docx), src/app/(public)/verktyg/personligt-brev/components/brev-faq-data.ts |
| 370 | "välj 'Normal' (2,5 cm) eller 'Smal' (1,9 cm)" | fel | I Words förinställningar är "Smal" 1,27 cm på alla sidor. 1,91 cm är vänster- och högermarginalen i förinställningen "Medel" (2,54 cm upptill och nedtill). Ersätt med "välj 'Normal' (2,5 cm) eller 'Medel' (1,91 cm i sidled)". Följ upp varningen på rad 374 ("Gå inte under 1,9 cm") så att den stämmer med det. | Words förinställda marginaler (Layout → Marginaler visar måtten i listan) |
| 445–449 | "Fördelar med online-verktyg (som jobbcoach.ai) ... Skapar automatiskt optimerad PDF" | obelagt (produkt), förtydliga | Brevverktyget läser annonsen och CV:t, men nedladdning som PDF och Word ingår i Jobbcoach Premium (149 kr/mån). På gratisnivån går brevet att läsa och kopiera, inte ladda ner. Lägg till "(nedladdning ingår i Premium)" eller stryk punkten. Samma sak gäller rad 460: "exportera sedan till Word för finlir" kräver Premium. | src/lib/access/features.ts (letter_download), brev-faq-data.ts |
| 76–78, 101 | "Många Word-mallar är byggda för att fungera med ATS" / minimalistisk mall "Fungerar perfekt i alla ATS-system" | obelagt | "Perfekt i alla ATS-system" kan inte beläggas. Skriv "fungerar bäst i rekryteringssystem". | – |

## Belagda påståenden
- Word har inbyggda mallar under Arkiv → Nytt (sök på "brev"), och Microsoft erbjuder fler gratis online (create.microsoft.com): stämmer.
- Arkiv → Spara som → PDF i Word: stämmer.
- Google Docs, LibreOffice Writer och Apple Pages kan öppna .docx: stämmer.
- Brevverktyget läser annonsen och föreslår innehåll, och första brevet är gratis (rad 445, 460, 502): src/app/(public)/verktyg/personligt-brev/layout.tsx.
- Interna exempellänkar (/personligt-brev-exempel/ekonomiassistent, saljare, underskoterska, student och motsvarande /cv-exempel) finns i exempeldatan.

## Rättning (omgång 1, 2026-11-15)
- Rad 2, 5 (fel, produkt): title, seoTitle och description lovade nedladdningsbara gratis Word-mallar från oss. Omskrivna till vad sidan ger (var Words egna mallar finns, malltyp per bransch, hur mallen fylls i):
  - title (H1) före: "Personligt brev mall Word: Gratis mallar 2026" / efter: "Personligt brev mall Word: så väljer och fyller du i rätt mall (2026)"
  - seoTitle före: "Personligt brev mall Word (gratis) | jobbcoach.ai" / efter: "Personligt brev mall Word: hitta och fyll i rätt mall" (53 tecken)
  - description före: "Ladda ner gratis personligt brev-mallar för Word. Färdiga och professionella mallar redo att använda direkt, plus tips på hur du anpassar dem rätt för jobbet." / efter: "Hitta en gratis Word-mall för personligt brev: var Words egna mallar finns, vilken malltyp som passar din bransch och hur du fyller i mallen rätt." (146 tecken)
- Rad 370 (fel): "Smal" (1,9 cm) -> "Medel" (1,91 cm i sidled). Varningen på rad 374 kompletterad med att "Smal" bara ger 1,27 cm runt om.
- Rad 445–449 (obelagt, produkt): "Skapar automatiskt optimerad PDF" -> "Ger en färdig PDF eller Word-fil (nedladdning ingår i Premium)". Rad 460: "exportera sedan till Word" -> "för sedan över texten till Word för finlir. Hos oss kan du alltid kopiera texten gratis, medan nedladdning som Word-fil ingår i Jobbcoach Premium." Intern länk /verktyg/personligt-brev kvar.
- Rad 76–78, 101 (obelagt): fetstilt ledord före: "**4. De flesta fungerar i ATS-system**" / efter: "**4. Enkla mallar fungerar bäst i rekryteringssystem**" (ingen H2/H3, men noterat). Stycket omskrivet utan "byggda för ATS"; "Fungerar perfekt i alla ATS-system" -> "Fungerar bäst i rekryteringssystem."
- updated: "2026-11-15" tillagt. Inga H2/H3 eller FAQ-frågor ändrade. Bilden inte omgjord (underlaget citerar inget ändrat). Inga interna länkar borttagna.
- Obs till samordnaren (annan fil, inte rörd): content/artiklar/fardiga-personliga-brev.mdx rad 117 länkar hit med "Vill du i stället börja från ett färdigt dokument finns våra gratis mallar och en variant för [Word]", vilket antyder att vi erbjuder en Word-mall.

## Andra granskningen (2026-11-15)
UNDERKÄND.

1. **Rad 447–449.** "✓ Guidar dig genom varje stycke / ✓ Visar exempel för ditt yrke / ✓ Föreslår förbättringar på språk och matchning" (oförändrade rader i samma lista som rättningen på rad 450, missade i omgång 1). **Fel (produkt).** Brevverktyget läser CV och annons och skriver ett färdigt brev där du väljer ton och mall (brev-faq-data.ts: "Du laddar upp ditt CV ..., klistrar in jobbannonsen och väljer mall och ton. Vi sätter ihop brevet på några sekunder"). Det finns ingen stegvis guidning per stycke, ingen exempelvisning per yrke i verktyget (exemplen är egna sidor under /personligt-brev-exempel) och ingen funktion som granskar och föreslår förbättringar av en befintlig text (src/app/api/letters har bara generate, preview, download och CRUD). Krav: ersätt de tre punkterna med det verktyget gör, till exempel "✓ Läser ditt CV och annonsen och skriver ett första utkast" och "✓ Du väljer ton och en av sju mallar". Källa: src/app/(public)/verktyg/personligt-brev/components/brev-faq-data.ts, src/app/api/letters/.

Kontrollerat och godtaget: ny title, seoTitle och description stämmer med vad sidan ger. Sidan erbjuder ingen egen nedladdning, och den nya texten lovar inte det: snabbsvaret (rad 54) visar var Words egna mallar finns (Arkiv, Nytt, sök på "brev", fler gratis online hos Microsoft), malltyperna och branschguiden finns (rad 92 och 288) och steg-för-steg för att fylla i mallen finns (rad 178). "Gratis Word-mall" i description syftar på Words egna mallar, vilket stämmer. seoTitle 53 tecken, description 146 tecken. Words förinställningar: "Smal" 1,27 cm runt om, "Medel" 1,91 cm i sidled, rättat. Nedladdning som PDF och Word ingår i Premium (features.ts letter_download, brev-faq-data.ts: "Allt du skrivit ligger kvar att läsa och kopiera, även på gratisnivån"), korrekt beskrivet på rad 450 och 461. ATS-meningarna är mjukade. Inga talstreck i ändrade rader.

## Svar till samordnaren
personligt-brev-mall-word, UNDERKÄND, rad 447–449 beskriver funktioner som brevverktyget inte har (guidning per stycke, exempel per yrke, förslag på förbättringar); title, seoTitle och description är däremot godkända.

## Rättning omgång 2 (2026-11-15)
- Rad 447–449 ersatta efter vad koden gör (src/app/dashboard/skapa-brev/: steg CV, annons, mall, ton och språk, granska; DOCX_TEMPLATES i src/lib/letters/docx-templates.ts har sex mallar, fyra gratis och två Premium; TonalityLanguageStep har svenska och engelska; PreviewStep har "Redigera texten"). Före: "✓ Guidar dig genom varje stycke / ✓ Visar exempel för ditt yrke / ✓ Föreslår förbättringar på språk och matchning". Efter: "✓ Läser ditt CV och annonsen och skriver ett första utkast / ✓ Du väljer ton och en av sex brevmallar, och kan skriva brevet på svenska eller engelska / ✓ Du kan redigera texten direkt i verktyget". Granskningens förslag "sju mallar" stämmer inte med koden (sex), därför sex.
- Inga rubriker, FAQ-frågor eller description ändrade. Underlaget citerar inte raderna; bilden inte omgjord. Inga talstreck.

## Tredje kontrollen (2026-11-15)
GODKÄND. Rad 446-450 beskriver nu det verktyget gör: läser CV och annons och skriver ett utkast, ton, sex brevmallar (facit: sex, fyra gratis, två i Premium), svenska eller engelska, redigering i verktyget, nedladdning som PDF eller Word i Premium (facit). Inga talstreck.

Anmärkning, inget krav: rad 442 i listan över Word-mallens nackdelar, "Inget förslag på förbättringar", antyder i kontrasten att vårt verktyg föreslår förbättringar av en befintlig text, vilket det inte gör. Kan strykas vid nästa revidering.

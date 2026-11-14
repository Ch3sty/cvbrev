GODKÄND (runda 2)

# SEO-granskning: /artiklar/uppsagningsbrev-mall (A12) och tilläggen i /artiklar/saga-upp-sig, runda 2

Granskat 2026-11-14 av SEO-strategen. Bara läst, inget ändrat.

Utlåtande per fil:
- **uppsagningsbrev-mall.mdx: GODKÄND.** Båda kraven är åtgärdade.
- **Tilläggen i saga-upp-sig.mdx: GODKÄNDA.** Diffen mot HEAD innehåller bara förlängda rader.

## Krav från runda 1, uppsagningsbrev-mall

**Krav 1, H2:an om uppsägningstid: åtgärdat.**

> Rad 172: "## Vilken uppsägningstid ska stå i brevet?"
>
> Rad 174: "Den uppsägningstid du skriver i brevet ska vara den som faktiskt gäller för dig. Här är det korta svaret. Mer om uppsägningstiden, vad som gäller under den och hur a-kassan påverkas finns i guiden om att [säga upp sig](/artiklar/saga-upp-sig)."

Rubriken har brevvinkel och tar inte längre navets fråga ordagrant. Länken går utan ankare, vilket var det säkra valet. Tabellen står kvar.

**Krav 2, "uppsägning på egen begäran" och "blankett": åtgärdat.**

> Rad 40: "Beslutet är fattat, och du ska lämna in en uppsägning på egen begäran."
>
> Rad 50: "Någon särskild blankett behövs inte heller. Eftersom lagen inte ställer några formkrav på din uppsägning duger ett vanligt brev eller mejl, så länge det innehåller rätt uppgifter."

Frasen står i ingressen, alltså i det första stycket Google läser. Blankettmeningen vilar på LAS 8 § i stycket före, så ingen ny källa behövs.

## Nya fel efter rättelsen

Inga som stoppar. Kontrollskriptet: seoTitle 50 tecken, description 138, FAQ 6 av 6 synliga, 0 talstreck, 0 tankstreck, 0 mittpunkter, 0 pipes, inga kampanjord, 2 329 ord. Sju H2 som förut.

Liten upprepning, inte krav: rad 48 och rad 50 säger båda att lagen inte ställer formkrav. Rad 50 kan bli "Någon särskild blankett behövs inte heller. Ett vanligt brev eller mejl duger, så länge det innehåller rätt uppgifter." utan att något tappas.

## Tilläggen i saga-upp-sig: GODKÄNDA

Kontrollerat med `git diff content/artiklar/saga-upp-sig.mdx` mot HEAD.

| Ägarens regel | Resultat |
|---|---|
| Bara tillägg | Tre rader ändrade (48, 136, 138). Varje ny rad är den gamla raden ordagrant plus en mening sist. Ingen rad borttagen |
| Inga rubriker borttagna | Inga rubrikrader i diffen |
| Ingen FAQ borttagen | Frontmatter och FAQ-sektionen orörda |
| Inga länkar borttagna | Inga befintliga länkar berörs. Två nya till /artiklar/uppsagningsbrev-mall (0 i HEAD, 2 nu) |
| Metadata orörd | Första ändrade raden är 48 |

Runda 1:s förslag 4 är genomfört: ankaret i snabbsvaret är nu "mall för uppsägningsbrev" (rad 48), och länkmeningen ligger efter mallen (rad 136), så "Så här kan det se ut:" på rad 118 pekar åter på mallen.

Förslag, inte krav: rad 138 slutar "Osäker på hur du räknar fram sista anställningsdagen när månaden är kortare? Det går vi igenom i samma guide." Meningen står i ett eget stycke efter länken och har ingen egen länk, så "samma guide" kan läsas som navet, som inte tar upp månadsslutsregeln. En länk gör hänvisningen entydig och ger en tredje inkommande länk, till exempel "Det går vi igenom i [mallen för uppsägningsbrev](/artiklar/uppsagningsbrev-mall)." Det är en ren förlängning och ryms inom ägarens regel.

## Förslag som står kvar från runda 1

Kopieringsknapp på CVExample, FAQ 2 byts mot "Hur formulerar man en uppsägning?", en H2 nära "hur man skriver ett uppsägningsbrev", "på egen begäran" i description (20 tecken kvar) och avläsning i december av vilken sida Google visar för mallfrågorna.

## Överlämnat till samordnaren

Inga inkommande länkar utanför sidfilerna krävdes för den här sidan. Navet saga-upp-sig länkar hit två gånger. Kalkylatorerna /rakna-ut/uppsagningstid och /rakna-ut/semesterersattning vore naturliga ingångar om samordnaren vill förstärka, men det är inget krav.

GODKÄND (runda 2)

# SEO-granskning: /artiklar/intervjufragor-underskoterska (A11), runda 2

Granskat 2026-11-14 av SEO-strategen. Bara läst, inget ändrat.

## Krav från runda 1

**Krav 1, länk till syskonsidan: åtgärdat.**

> Rad 195: "Siktar du på att läsa vidare till sjuksköterska finns motsvarande genomgång i [intervjufrågor för sjuksköterska](/artiklar/intervjufragor-sjukskoterska)."

Länken står i "Så förbereder du dig kvällen före", direkt efter CV-stycket. Målet finns i content/artiklar. Sjuksköterskesidan länkar hit, så länken går nu åt båda hållen. Ankartexten bär sökordet.

**Krav 2, inkommande länk från indexerad sida:** ligger utanför sidfilen och är överlämnat till samordnaren, se nedan. Det är inget skäl att underkänna sidan.

## Nya fel efter rättelsen

Inga. Kontrollskriptet: seoTitle 49 tecken, description 151, FAQ 6 av 6 synliga, 0 talstreck, 0 tankstreck, 0 mittpunkter, 0 pipes, inga kampanjord, 2 764 ord. Rubriker, intervjuprovet och övriga länkar är oförändrade sedan runda 1.

Förslagen från runda 1 står kvar som förslag, inte krav: alla 15 frågor som H3, en fråga om att hålla sig uppdaterad, kommentaren i mdx-klient.tsx rad 39 och avläsning i Search Console från mitten av december.

## Överlämnat till samordnaren

- **ExempelMall.tsx, "Kommer snart"-korten.** src/components/publikt/innehall/exempel/ExempelMall.tsx rad 265 till 268 ritar `relateradeArtiklar` utan länk. Kortet för den här sidan (src/app/(public)/personligt-brev-exempel/[yrke]/exempel-data.ts rad 539) ska bli en länk till /artiklar/intervjufragor-underskoterska när artikeln finns, och "Kommer snart" visas bara för slugs som saknas. Publik komponent, ska gå genom SEO-diffen.
- **content/artiklar/vanliga-intervjufragor-svar.mdx.** En mening efter undersköterskeexemplet (rad 61, `<CVExample title="Exempel: undersköterska söker ny tjänst">`), till exempel: "Fler frågor och STAR-svar för vården finns i [intervjufrågor för undersköterska](/artiklar/intervjufragor-underskoterska)." Bara tillägg.
- **content/artiklar/kompetensbaserade-intervjufragor.mdx.** Meningen som pekar till båda vårdsidorna, se sjuksköterskesidans utlåtande. Den ger den här sidan en andra kontextuell inkommande länk.

# SEO-diff: /priser, våg 5 (2026-10-11)

Ägarens beslut (spec-rummen 17.3 och 17.4): bara Jobbcoach Premium, 149 kr i månaden (`all_month`), säljs. Före = `360a02bb` (`git show 360a02bb:src/app/(public)/priser/...`), efter = `design/rummen-klar` efter commit a62bcd57, e3d90719 och 2e1262a7. Standard: `reference_onpage_seo_standard` (title högst 60 tecken, description 110 till 158, inga talstreck).

Metadatan bor nu i `src/app/(public)/priser/components/priser-data.ts` (`PRISER_META`) och läser PLANS, så ett prisbyte når titeln, description, OG och schemat samtidigt. Schemat byggs i `priser-schema.ts`.

## Metadata

| Fält | Före | Efter |
|---|---|---|
| title | `Priser: en vecka som bär hela jobbsöket | Jobbcoach.ai` (54 tecken) | `Priser: Jobbcoach Premium, 149 kr i månaden | Jobbcoach.ai` (58 tecken) |
| description | `CV-paketet och Träningspaketet 79 kr i veckan, Hela paketet 99 kr. Allt öppet direkt, ingen bindningstid, säg upp med ett klick. Gratisnivån ligger kvar.` (153 tecken) | `Jobbcoach Premium kostar 149 kr i månaden. CV-analys, personliga brev, rekryteringstester, jobbmatchning och Jobbcoachen ingår. Säg upp när du vill.` (148 tecken) |
| canonical | `https://www.jobbcoach.ai/priser` | oförändrad, `https://www.jobbcoach.ai/priser` |
| robots | index, follow | oförändrad |
| openGraph.title | `En vecka som bär hela jobbsöket.` | `Jobbcoach Premium, 149 kr i månaden` |
| openGraph.description | `CV-paketet och Träningspaketet 79 kr i veckan, Hela paketet 99 kr. Ingen bindningstid, uppsägning med ett klick, och gratisnivån ligger kvar.` | samma som description |
| twitter.title / description | `En vecka som bär hela jobbsöket.` / kortad description med 79 och 99 kr | samma som openGraph |
| OG-bild (opengraph-image.tsx) | titel `En vecka som bär hela jobbsöket.`, underrad `Från 79 kr i veckan, ingen bindningstid, säg upp med ett klick.` | titel `Jobbcoach Premium, 149 kr i månaden`, underrad `CV, personliga brev, tester, jobbmatchning och Jobbcoachen. Säg upp när du vill.` |
| keywords | `jobbcoach pris, cv-analys pris, rekryteringstester pris, personligt brev pris, veckoprenumeration jobbsökning` | `Jobbcoach Premium, jobbcoach pris, cv-analys pris, rekryteringstester pris, personligt brev pris, jobbmatchning` |

Sökordet "Jobbcoach Premium" står först i både title och description; priset står i title, vilket ger CTR-kroken (konkret tal). Inga talstreck.

## Rubriker

| | Före | Efter |
|---|---|---|
| h1 | `En vecka som bär hela jobbsöket.` | `Jobbcoach Premium, 149 kr i månaden` |
| rad under h1 | ingress om sju dagar och veckopris | `CV, personliga brev, tester, jobbmatchning och Jobbcoachen` (PLANS.beskrivning) + ingressen `Allt är öppet från första minuten. Ingen bindningstid, du säger upp med ett klick.` |
| h2 | `Tre paket. Ett för CV:t, ett för träningen, ett för hela jobbsöket.` (bara desktop) | `Allt i Premium` (kortet) |
| h2 | `Vad du faktiskt får, funktion för funktion` | oförändrad |
| h2 | `Allt är öppet från första minuten. Så här guidar vi dig igenom det.` | `Hjälpredan tar dig igenom allt, i rätt ordning` (ingressen säger redan "Allt är öppet från första minuten") |
| h2 | `Vad som ingår, rad för rad` | oförändrad (tabellen har två kolumner, gratis och Premium) |
| h2 | saknades (FAQ hade bara aria-label) | `Fler frågor om priset?` |
| h3 | tre paketnamn i korten, fem funktionsrubriker, tre guidenamn | fem funktionsrubriker (paketkorten och guidens tre namn borta) |

## Strukturerad data

Före: en fristående `AggregateOffer` över alla sex nycklar i PLANS, inklusive Dagspasset 49 kr och kvartalet 299 kr, med namnet "Jobbcoach.ai" och utan Product. Efter: `Product` "Jobbcoach Premium" med `offers` som `AggregateOffer` över `SALJBARA_PLANER` (i dag en rad): offerCount 1, lowPrice = highPrice = 149, priceCurrency SEK, ett `Offer` med `UnitPriceSpecification` per månad (unitCode MON). Inga `aggregateRating`, inga `review`, inga citat (ägarens beslut). FAQPage står kvar och följer de nya frågorna.

### Före (AggregateOffer)

```json
{
  "@context": "https://schema.org",
  "@type": "AggregateOffer",
  "name": "Jobbcoach.ai",
  "url": "https://www.jobbcoach.ai/priser",
  "priceCurrency": "SEK",
  "lowPrice": 49,
  "highPrice": 299,
  "offerCount": 6,
  "availability": "https://schema.org/InStock",
  "offers": [
    {
      "@type": "Offer",
      "name": "CV-paketet",
      "description": "Få CV:t genom rekryteringssystemet och skriv personliga brev som svarar på annonsen.",
      "price": 79,
      "priceCurrency": "SEK",
      "url": "https://www.jobbcoach.ai/priser",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Jobbcoach.ai"
      }
    },
    {
      "@type": "Offer",
      "name": "Träningspaketet",
      "description": "Känn igen varje uppgift på testdagen. Och förstå vad personlighetstestet säger om dig.",
      "price": 79,
      "priceCurrency": "SEK",
      "url": "https://www.jobbcoach.ai/priser",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Jobbcoach.ai"
      }
    },
    {
      "@type": "Offer",
      "name": "Dagspasset",
      "description": "Hela paketet i ett dygn. Ett engångsköp, ingenting dras igen.",
      "price": 49,
      "priceCurrency": "SEK",
      "url": "https://www.jobbcoach.ai/priser",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Jobbcoach.ai"
      }
    },
    {
      "@type": "Offer",
      "name": "Hela paketet, en vecka",
      "description": "Jobbmatchning, Jobbcoachen och Bli upptäckt. Och allt i CV-paketet och Träningspaketet.",
      "price": 99,
      "priceCurrency": "SEK",
      "url": "https://www.jobbcoach.ai/priser",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Jobbcoach.ai"
      }
    },
    {
      "@type": "Offer",
      "name": "Hela paketet, en månad",
      "description": "Hela paketet i en månad, billigare än fyra veckor i rad.",
      "price": 149,
      "priceCurrency": "SEK",
      "url": "https://www.jobbcoach.ai/priser",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Jobbcoach.ai"
      }
    },
    {
      "@type": "Offer",
      "name": "Hela paketet, ett kvartal",
      "description": "Hela paketet i tre månader, för ett sök som du vet tar tid.",
      "price": 299,
      "priceCurrency": "SEK",
      "url": "https://www.jobbcoach.ai/priser",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Jobbcoach.ai"
      }
    }
  ]
}
```

### Efter (Product med AggregateOffer)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Jobbcoach Premium",
  "description": "CV, personliga brev, tester, jobbmatchning och Jobbcoachen",
  "brand": {
    "@type": "Brand",
    "name": "Jobbcoach.ai"
  },
  "url": "https://www.jobbcoach.ai/priser",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "SEK",
    "lowPrice": 149,
    "highPrice": 149,
    "offerCount": 1,
    "availability": "https://schema.org/InStock",
    "offers": [
      {
        "@type": "Offer",
        "name": "Jobbcoach Premium, en månad",
        "description": "149 kr i månaden. Allt ingår. Dras varje månad tills du säger upp.",
        "price": 149,
        "priceCurrency": "SEK",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": 149,
          "priceCurrency": "SEK",
          "referenceQuantity": {
            "@type": "QuantitativeValue",
            "value": 1,
            "unitCode": "MON"
          }
        },
        "url": "https://www.jobbcoach.ai/priser",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Jobbcoach.ai",
          "url": "https://www.jobbcoach.ai"
        }
      }
    ]
  }
}
```

### FAQPage, frågorna

| Före | Efter |
|---|---|
| Varför säljer ni veckor och inte månader? | Vad ingår i Premium? |
| Vad händer när veckan är slut? | Vad händer när månaden är slut? |
| Kan jag byta paket mitt i veckan? (mellanskillnad, sidbyte) | Kan jag börja gratis? |
| Hur säger jag upp? ("Veckan du redan betalat gäller ut") | Hur säger jag upp? ("Månaden du redan betalat gäller ut") |

## Interna länkar ut från sidan

Räknat som `href` i sidans egna komponenter (`src/app/(public)/priser/**`, `PaketKort`, `JamforelseTabell` och copyn de läser). Sidhuvud och sidfot är delade och oförändrade och räknas inte. Köpknapparna är `<button>` med `router.push` både före och efter (inga `href`).

| Länk | Före | Efter | Var |
|---|---|---|---|
| `/register` | 1 | 1 | Gratisraden, "Skapa konto gratis" |
| `#gratis`, `#funktioner`, `#guide` | 3 (bara mobil) | 3 (bara mobil) | Ankarraden under kortet |
| `/verktyg/personlighetstest` | 1 (bara desktop, Träningspaketets kort) | 1 (alla bredder) | Flyttad till funktionskortet Rekryteringstester: "Gör personlighetsprovet utan konto" |
| **Summa unika interna mål** | 2 sidor + 3 ankare | 2 sidor + 3 ankare | |

Ingen intern länk försvann. Länken till personlighetsprovet syns nu även på mobil.

## Övrigt som rör rankning och rendering

- Sidan är fortfarande serverrenderad med `revalidate = 86400`; H1 och kortet står i första HTML-svaret (LCP). Enda klientkomponenterna är köpknappen (`PriserKopKnapp`), FAQ:ns mätning, tabellens synlighetsmätning och `PriserMatning`. Knappen ser likadan ut in- och utloggad, så inget flyttar sig efter hydrering (CLS 0).
- Trådens utseende (publik sida): `bg-panel`, `border-kant`, `rounded-xl`, primärknapp i ink. Inga rum-tokens som bara finns i inloggat.
- Ordantal: sidan tappar de tre paketkortens texter (cirka 400 ord) och får kortets lista och de nya FAQ-svaren. Funktionskorten, hjälpredan, förtroendekorten och tabellen bär fortfarande merparten av texten.
- Att följa upp i Search Console (ägarens): CTR och position på "jobbcoach pris", "jobbcoach premium" och sidans topp-frågor fyra veckor efter deploy.

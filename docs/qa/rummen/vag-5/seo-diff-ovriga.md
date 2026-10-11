# SEO-diff, publika sidor utanför /priser (våg 5)

2026-10-11, branch design/rummen-klar. "Före" är texten i produktion (main). Underlag för seo-agenten. Inga `<title>` har ändrats. En meta description har ändrats; övriga ändringar är OpenGraph/Twitter, strukturerad data, en H1 och synliga FAQ-svar (som också står i FAQPage-schemat).

## Meta description

| Sida | Före | Efter |
|---|---|---|
| /verktyg/bli-upptackt (`verktyg/bli-upptackt/layout.tsx`) | Skapa en profil så kan rekryterare som söker din bakgrund hitta dig. Anonym tills du själv tackar ja. Ingår i Hela paketet, 99 kr i veckan. (139 tecken) | Skapa en profil så kan rekryterare som söker din bakgrund hitta dig. Anonym tills du själv tackar ja. Ingår i Jobbcoach Premium, 149 kr i månaden. (146 tecken) |

## OpenGraph och Twitter

| Sida | Fält | Före | Efter |
|---|---|---|---|
| /verktyg/linkedin-optimering | openGraph.description | Vi optimerar fem sektioner samtidigt och du klistrar tillbaka texten själv. Ingår i CV-paketet och Hela paketet, ingen LinkedIn-inloggning. (139) | Vi optimerar fem sektioner samtidigt och du klistrar tillbaka texten själv. Ingår i Jobbcoach Premium, ingen LinkedIn-inloggning. (129) |
| /verktyg/linkedin-optimering | twitter.description | Vi optimerar fem sektioner samtidigt och du klistrar tillbaka texten själv. Ingår i CV-paketet och Hela paketet. (112) | Samma som openGraph ovan (129) |
| /cv-mallar | opengraph-image, undertext | 25 designer · ATS-säkra · gratis och premium | 25 designer · ATS-säkra · gratis eller i Premium |
| /cv-mallar/[yrke] | opengraph-image, undertext | ATS-säker · gratis och premium · uppdaterad 2026 | ATS-säker · gratis eller i Premium · uppdaterad 2026 |

## Rubriker

| Sida | Före | Efter |
|---|---|---|
| /cv-mallar, H1 (gradientordet i `CvMallarPageContent.tsx`) | ... gratis och premium | ... gratis eller i Premium |

## Strukturerad data

| Sida | Fält | Före | Efter |
|---|---|---|---|
| /verktyg/bli-upptackt | Service.description, sista meningen | Synligheten ingår i Hela paketet, 99 kr i veckan eller 149 kr i månaden. | Synligheten ingår i Jobbcoach Premium, 149 kr i månaden. |
| /verktyg/bli-upptackt | Service.offers.price | 99 | 149 |
| /verktyg/bli-upptackt | Service.offers.description | Ingår i Hela paketet, 99 kr i veckan eller 149 kr i månaden. ... kräver Hela paketet. | Ingår i Jobbcoach Premium, 149 kr i månaden. Profil och tester utan kostnad, synligheten kräver Premium. |
| /verktyg/linkedin-optimering | SoftwareApplication.offers.price | 79 | 149 |
| /verktyg/linkedin-optimering | SoftwareApplication.offers.description | Ingår i CV-paketet, 79 kr i veckan, och i ... | Ingår i Jobbcoach Premium, 149 kr i månaden |
| /verktyg/linkedin-optimering | HowTo.estimatedCost.value | 79 | 149 |
| /verktyg/rekryteringstester | featureList, sista ledet | obegränsat antal försök med Träningspaketet | obegränsat antal försök med Jobbcoach Premium |

## FAQ-svar (synliga och i FAQPage-schemat)

Svaren nedan bytte paketnamn och veckopris mot Premium och 149 kr i månaden ur PLANS. Frågorna är oförändrade utom två.

- /funktioner: "Hur ofta uppdateras jobbmatchningen?", "Hur kommer jag igång gratis?" och frågan **"Vad händer om jag säger upp mitt paket?" som blev "Vad händer om jag säger upp prenumerationen?"**
- /verktyg/bli-upptackt: "Vad kostar det att synas för rekryterare?"
- /verktyg/linkedin-optimering: "Vad kostar LinkedIn-optimeringen?"
- /verktyg/jobbcoachen: "Är det gratis att använda Karriärguiden?", "Vad händer när mina tio meddelanden är slut?"
- /verktyg/jobbmatchning: "Är det gratis att söka jobb online hos er?"
- /verktyg/cv-mallar, /verktyg/personligt-brev, /verktyg/cv-analys, /verktyg/skapa-cv, /verktyg/rekryteringstester, /verktyg/personlighetstest: svaret om vad det kostar
- /cv-mallar: "Är CV-mallarna gratis att ladda ner?"
- /cv-mallar/[yrke] (alla yrkessidor via `yrkesmall-data.ts`): svaret om foto, och frågan **"Vilken är bäst av gratis och premium?" som blev "Vilken är bäst, gratismallen eller mallen i Premium?"**
- Startsidan: "Vad kostar det, och vad får jag utan att betala?"

## Lämnat orört, för seo-agentens beslut

- `/cv-mallar` title och openGraph/twitter title: "CV-mallar 2026 — gratis och premium-mallar att ladda ner | Jobbcoach.ai". Innehåller gement "premium" om produkten och ett talstreck, men är en rankande title; inte ändrad utan seo-agentens beslut.
- `/cv-mallar/[yrke]` meta description: "ATS-säker CV-mall för {yrke}. Gratis och premium-version. Anpassad för svenska arbetsgivare." Samma skäl, gäller alla yrkessidor.

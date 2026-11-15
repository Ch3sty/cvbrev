# Faktagranskning: content/rekryterare/gdpr-rekrytering.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, IMY-uppgifterna stämmer i stort men AI-förordningens datum är inaktuellt och den rättsliga grunden beskrivs annorlunda än IMY gör, i en artikel som säger sig följa IMY.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 74 | "AI i urvalskedjan får från 2 augusti 2026 dessutom ett eget regelverk" | fel | Högriskkraven för rekryterings-AI (bilaga III) sköts upp genom digital omnibus on AI, förordning (EU) 2026/1744 av den 8 juli 2026, publicerad i EUT 24 juli 2026, i kraft 27 juli 2026. De gäller nu från **2 december 2027**. Ersätt med "får från 2 december 2027 dessutom ett eget regelverk (förbuden, till exempel mot känsloigenkänning på arbetsplatsen, gäller redan sedan februari 2025)". | https://www.europarl.europa.eu/legislative-train/theme-a-new-plan-for-europe-s-sustainable-prosperity-and-competitiveness/file-digital-omnibus-on-ai , https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng |
| 13, 42 | "Behandlingen vilar i stället på åtgärder inför avtal (kandidaten har sökt en tjänst) och berättigat intresse" | obelagt (som IMY-uppgift) | IMY skriver: "Rättsliga grunder för att behandla personuppgifter vid rekrytering är normalt intresseavvägning eller ett allmänt intresse" (det senare för offentliga arbetsgivare). Åtgärder inför avtal nämns inte av IMY. Ersätt med "Behandlingen vilar normalt på intresseavvägning (berättigat intresse), för offentliga arbetsgivare på allmänt intresse", eller markera att avtalsgrunden är en egen bedömning. | https://www.imy.se/verksamhet/dataskydd/dataskydd-pa-olika-omraden/arbetsliv/rekryteringssystem-och-kompetensdatabaser/ |
| 11, 54 | "brukar arbetsgivarsidan räkna med upp till två år" | (precisering, ej fel) | Praxisen är belagd i sekundärkällor och har stöd i diskrimineringslagens yttre frist (6 kap. 3 §: talan ska väckas inom två år). IMY anger ingen tidsgräns utan säger att uppgifterna får sparas "så länge den sökande kan vidta rättsliga åtgärder". Gärna ett tillägg: "IMY anger ingen fast tid, utan så länge kandidaten kan vidta rättsliga åtgärder." | IMY som ovan; https://www.do.se/rattsfall-beslut-lagar-stodmaterial/lagar-om-diskriminering/diskrimineringslagen |
| 58 | "IMY pekar särskilt på rekryteringssystem och kompetensdatabaser som ett riskområde" | obelagt (överdrift) | IMY har en egen vägledningssida om rekryteringssystem och kompetensdatabaser, men kallar dem inte ett "riskområde". Skriv "IMY har en egen vägledning för rekryteringssystem och kompetensdatabaser". | IMY som ovan |

## Belagda påståenden
- Behandla bara uppgifter som behövs för den aktuella tjänsten (rad 32): IMY "Behandla bara sådana uppgifter som är nödvändiga för syftet". IMY rekryteringssystem-sidan.
- Känsliga personuppgifter och uppgifter om lagöverträdelser normalt inte tillåtna i rekrytering (rad 17, 36, 38): IMY: "Det är normalt inte tillåtet för en arbetsgivare att i samband med rekrytering behandla känsliga personuppgifter eller uppgifter om lagöverträdelser." Samma sida.
- Gallring när rekryteringen är avslutad (rad 11, 50): IMY: uppgifterna får behandlas så länge de är nödvändiga för rekryteringsförfarandet, "därefter ska de som utgångspunkt raderas". Samma sida.
- Samtycke krävs för att spara till framtida rekryteringar/kompetensdatabas (rad 13, 44): IMY: "Om arbetsgivaren vill spara uppgifterna för att använda vid framtida rekrytering krävs att den sökande samtycker till det." Samtycke olämpligt under processen pga beroendeställning: IMY "Samtycke är sällan lämplig som rättslig grund". Samma sida.
- Offentliga arbetsgivare: allmänna handlingar och arkivregler (rad 78). IMY samma sida.
- Biträdesavtal med extern leverantör (rad 19, 58). IMY samma sida.
- Nya kommunregler om registerkontroll i kraft 1 mars 2026 (rad 70): SFS 2026:44, prop. 2025/26:61 Utökade registerkontroller vid anställning i kommun. https://www.riksdagen.se/sv/dokument-och-lagar/dokument/proposition/utokade-registerkontroller-vid-anstallning-i_hd0361/html/ , https://www.regeringen.se/pressmeddelanden/2025/12/utokade-registerkontroller-for-en-tryggare-kommunal-verksamhet/
- Statlig utredning om bakgrundskontroller redovisas 2027 (rad 70): uppdraget ska redovisas senast 11 mars 2027 (sekundärkälla, nyheter24; direktivet ej hämtat).
- Rätt till meritsammanställning och delad bevisbörda (rad 76): diskrimineringslagen 2 kap. 4 § och 6 kap. 3 §. DO.
- Produkt (rad 46, 72): kandidaten skapar profilen själv, styr synlighet (av/anonym/öppen), godkänner varje kontakt (accept/decline i src/app/api/candidate/interests/respond/route.ts), personlighet som styrkor i ord, kandidaten ser rekryterarvyn (RecruiterPreviewCard i src/app/dashboard/bli-upptackt/components/). Stämmer med koden.

## Rättning (omgång 1, 2026-11-15)
- Rad 74 (fel): AI-förordningens datum rättat. Nu: rekryterings-AI är högriskklassad, högriskkraven på användarna gäller från 2 december 2027, förbuden (till exempel känsloigenkänning på arbetsplatsen) sedan februari 2025. Interna länken till ai-forordningen-rekrytering kvar. EUR-Lex 2026/1744 tillagd i källraden.
- Rad 13, 42 (obelagt som IMY-uppgift): rättslig grund omskriven efter IMY: normalt intresseavvägning (berättigat intresse), för offentliga arbetsgivare allmänt intresse. "Åtgärder inför avtal" struket i både FAQ-svaret och brödtexten.
- Rad 11, 54 (precisering): tillägg i FAQ-svaret och brödtexten att IMY inte anger någon fast tid utan "så länge den sökande kan vidta rättsliga åtgärder". Tvåårspraxisen står kvar som arbetsgivarsidans praxis.
- Rad 58 (överdrift): "pekar särskilt på ... som ett riskområde" ersatt med "IMY har en egen vägledning för rekryteringssystem och kompetensdatabaser". Samma justering i FAQ-svaret om rekryteringssystem ("IMY pekar särskilt ut" blev "IMY har en egen vägledning för").
- updated: "2026-11-15" tillagt.
- Rubriker/FAQ-frågor/description: oförändrade. Bild: ej omgjord (rekryterarbild utan underlag, alt berörs inte). Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Kontrollerat: IMY "Rättsliga grunder för att behandla personuppgifter vid rekrytering är normalt intresseavvägning eller ett allmänt intresse (om arbetsgivaren är en myndighet)" och "så länge den sökande kan vidta rättsliga åtgärder" (IMY:s sida om rekryteringssystem). AI-förordningen: förordning (EU) 2026/1744, högriskkraven för bilaga III från 2 december 2027 (Europaparlamentets legislative train), förbuden sedan 2 februari 2025. Anmärkning utan krav: IMY skriver "myndighet", artikeln "offentliga arbetsgivare".

## Produktsvep (2026-11-15)
- Personlighetsdata i vår pool: "enbart som styrkor i ord, aldrig som råpoäng" kompletterat med att den bara visas om kandidaten valt det, och då som styrkor i ord och arbetsstil som punkt på en skala.
- Inga rubriker, FAQ-frågor eller description ändrade.

## Tredje kontrollen (2026-11-15)
GODKÄND. Inga brister.
- Rad 74 (produktsvep): personlighet visas bara om kandidaten valt det (show_personality i candidateData.ts och RecruiterPreviewCard.tsx), stämmer med produktfacit. "aldrig som automatiskt sorteringsfilter" motsäger inte facit, eftersom filtret på styrka/arbetsstil är rekryterarens eget val.
- Rad 76 (omgång 1): AI-förordningens högriskkrav för bilaga III från 2 december 2027 enligt förordning (EU) 2026/1744 (EUT 24 juli 2026, i kraft 27 juli 2026) bekräftat igen; förbuden sedan februari 2025.
- Rättslig grund (rad 13, 43) och IMY:s "så länge den sökande kan vidta rättsliga åtgärder" (rad 11, 55) stämmer med IMY:s sida om rekryteringssystem och kompetensdatabaser.
- Inga tankstreck i ändrade rader; inget FAQ-block i brödtexten.
- Anmärkning, ej underkännande: rekryterarens profilvy visar arbetsstilen på flera skalor (WorkStyleCard.tsx), artikeln säger "en punkt på en skala". Det säger mindre än koden, inte mer.

## Rättning omgång 3 (samordnaren, 2026-11-15)
Efter tredje kontrollens anmärkning: arbetsstilen visas som punkter på några skalor (profilvyn visar flera).

# Faktagranskning: content/artiklar/skapa-cv-med-ai.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Artikeln är väl källbelagd: TNG, Jobbland, Remote, Realtid och Arbetsförmedlingen stämmer. Ett tal från Remote saknar källa, och ett typografipåstående är obelagt.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 78 | "i deras uppföljande undersökning 2025 uppger mer än var fjärde svensk arbetsgivare att de av misstag gått vidare med en kandidat vars CV var AI-genererat" | obelagt | Finns inte i den länkade TN-artikeln och inte i de andra svenska referaten av Remotes undersökning (TN 43981, HRsvepet, Dagens Infrastruktur). Remote-undersökningen med 82 % (250 svenska chefer) går att belägga. Stryk meningsdelen, eller länka Remotes egen rapport om talet går att hitta där. | https://www.tn.se/naringsliv/40290/80-procent-av-arbetsgivarna-far-in-falska-cvn-skrivna-av-ai/ ; https://www.tn.se/arbetsmarknad/43981/expert-arbetsgivare-borjar-se-igenom-ai-genererade-brev/ |
| 72 | "Svenska skribenter använder sällan tecknet alls, AI-modeller strör det överallt." | obelagt | Källan (Realtid) säger bara att fem tankstreck i en text tyder på AI. Tankstrecket är ett vedertaget skiljetecken i svensk text (Språkrådet). Stryk första ledet, eller skriv "Tankstreck i varannan mening är ovanligt i svensk text". | https://www.realtid.se/karriar-ledarskap/tre-ord-forstor-din-jobbansokan-nu-avslojas-ai-tricken/ |
| 18, 126 | "i vårt CV-verktyg kan du bygga och ladda ner ett komplett CV gratis" | belagt men bör preciseras | Gratisnivån ger 3 CV-mallar och 1 nedladdning. Påståendet stämmer, men skriv gärna "en nedladdning gratis" så att ingen läser det som obegränsat. | src/lib/cv/template-antal.ts (FREE_TEMPLATE_COUNT = 3, FREE_CV_EXPORTS = 1) |
| 89 | "Kundtjänstmedarbetare med tre år på Telenors företagssupport ... kundnöjdhet på 4,6 av 5" | anmärkning (inget fel) | Exemplet är tydligt illustrativt, men det namnger ett verkligt företag och ger mätta resultat. Byt till ett fiktivt företag ("ett telekombolag") så att det inte kan läsas som en verklig person. | – |

## Belagda påståenden
- Jobbland, mars 2024: åtta av tio svenskar hade aldrig använt AI när de sökte jobb (2 683 svarande) (rad 27). Källa: https://jobbland.se/arbetsliv/svenskar-vill-inte-fuska-med-cvt-fler-ratar-ai-nar-de-soker-jobb
- TNG: 45 % av svenska jobbsökare har använt AI i sin ansökan det senaste året (TNG AI Insights Report 2025, artikeln publicerad 24 november 2025) (rad 12, 27, 33). Källa: https://www.tng.se/soka-jobb/ai-i-jobbansokan-dos-and-donts-fran-rekryteraren/
- TNG: "Använd AI som bollplank, inte som avsändare", "Sätt personlig prägel på varje ansökan" och "Granska allt. Varje gång." (rad 38, 46). Källa: samma som ovan.
- Åsa Pettersson, rekryteringskonsult på TNG, citerad med "Vi ser ofta identiska motivationstexter, skrivna i ett generiskt språk" (rad 66). Källa: samma som ovan.
- Remote, Global Workforce Report 2024: 82 % av svenska företag har fått in AI-skrivna CV:n med falsk information (rad 12, 78). Källa: TN 40290 (länk ovan).
- Karriärvägledare på Manpower Matchning (Edvard Danielsson) i Realtid 7 augusti 2025: "driven", "lagspelare" och "många bollar i luften", och citatet om att fem tankstreck avslöjar AI (rad 14, 70, 72). Källa: Realtid-länken ovan.
- Arbetsförmedlingen 2024-08-21: "all information som du laddar upp i AI-tjänsten kan bli synlig för andra", undvik namn, adress och personnummer, "Det är du själv som är avsändare, så ta bara med de ändringar du kan stå för" (rad 22, 96, 98). Källa: https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2024-08-21-sa-kan-du-vassa-ditt-cv-med-ai
- Arbetsförmedlingen 2026-02-10: "Systemet fungerar i grunden som en avancerad sökmotor", och ett generellt CV rankas oftast lägre (rad 20, 42). Källa: https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig

## Rättning (omgång 1, 2026-11-15)
- Remotes "uppföljande undersökning 2025 ... mer än var fjärde svensk arbetsgivare" (rad 78): struket. 82 %-uppgiften med TN som källa står kvar.
- "Svenska skribenter använder sällan tecknet alls" (rad 72): omskrivet till "Tankstreck i varannan mening är ovanligt i svensk text, och just den tätheten är typisk för AI-modeller", i linje med Realtid-citatet om fem tankstreck.
- Gratis CV (rad 18, 126): preciserat i både frontmatter-FAQ och FAQ-blocket till "bygga ett komplett CV och ladda ner det en gång gratis".
- Telenor i efter-exemplet (rad 89): bytt till "ett telekombolags företagssupport". Bildunderlagets profilrad citerar inte företagsnamnet och finns kvar ordagrant, så bilden gjordes inte om.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Det obelagda "var fjärde arbetsgivare" är struket; TN-artikeln bär 82 procent ("82 procent av svenska företag i samband med rekryteringar fått in CV:n skrivna med hjälp av AI och som innehåller falska information", 2024 Global Workforce Report) och nämner inget om var fjärde. Tankstrecksmeningen säger inte längre mer än Realtid-citatet om fem tankstreck. Gratis CV-nedladdning är preciserad lika i frontmatter-FAQ och FAQ-block (FREE_CV_EXPORTS = 1). Telenor är ersatt med ett fiktivt telekombolag. CV-analysen beskrivs bara som att den "pekar på vad som saknas", ingen annonsjämförelse.

## Svar till samordnaren
skapa-cv-med-ai, GODKÄND: inga brister.

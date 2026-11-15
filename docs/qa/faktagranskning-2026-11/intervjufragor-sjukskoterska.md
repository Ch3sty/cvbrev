# Faktagranskning: content/artiklar/intervjufragor-sjukskoterska.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: OK, alla kontrollerbara påståenden håller utom två detaljer från Vårdförbundet som inte gick att läsa i källan i dag.

## Fynd att åtgärda

| Rad | Citat ur texten | Klass | Rätt uppgift eller förslag | Källa |
|---|---|---|---|---|
| 18, 170, 216 | "Vårdförbundet skriver att det normalt tar cirka tre veckor" | obelagt | Vårdförbundets sida returnerar bara navigering (innehållet laddas med skript), så "cirka tre veckor" gick inte att bekräfta. Socialstyrelsen skrev 2023 att handläggningstiden för legitimationsyrken är "omkring fyra veckor" för svenska ansökningar. Förslag: kontrollera i webbläsare; annars stryk tidsuppgiften eller skriv "några veckor". | https://www.vardforbundet.se/rad-och-stod/yrkesansvar/legitimation/ (ej läsbar), https://www.socialstyrelsen.se/om-socialstyrelsen/pressrum/press/kraven-klara-for-underskoterskors-skyddade-yrkestitel/ |
| 174 | "Vårdförbundet påpekar att du till exempel inte får kalla dig distriktssköterska utan examen för det" | obelagt | Samma källa, gick inte att läsa. Sakligt sannolikt riktigt (distriktssköterska är en skyddad specialisttitel), men bör kontrolleras i webbläsare innan den står kvar som Vårdförbundets påstående. | som ovan |

Notering, inget fel: att bara legitimerade sjuksköterskor är behöriga för anställning i region och kommun står i hälso- och sjukvårdsförordningen 5 kap. 1 och 5 §§. Texten säger "Vårdförbundet skriver att förordningen anger", vilket är andrahandsformulering. Hänvisa gärna direkt till förordningen: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/halso-och-sjukvardsforordning-201780_sfs-2017-80/

## Belagda påståenden
- Sjuksköterskor (inkl. specialister) står på listan "Yrken med stora jobbchanser 2025 - 2026" (rad 27): Arbetsförmedlingen 2025-06-26.
- Akademiska sjukhuset: "standardiserad, systematisk, faktabaserad", "intervjun ska vara standardiserad och strukturerad", kravprofilens "formell kompetens, erfarenheter, kunskaper och personliga förmågor", "alltid minst två referenser, varav minst en ska vara från en tidigare chef", legitimationskontroll mot Socialstyrelsens och IVO:s register, belastnings- och misstankeregistret (rad 35, 39): Region Uppsala DocPlusSTYR-13354.
- Region Jönköpings län: "situationsbaserade intervjufrågor utifrån de kompetenser som har valts ut i kravprofilen", en till två timmar (rad 35): rjl.se, Vår rekryteringsprocess.
- Kompetensbeskrivningen reviderad januari 2024, "säker vård utgör en grund för all omvårdnad", fem kärnkompetenser, ledarskap och pedagogiska insatser (rad 45, 162, 166): swenurse.se.
- Delegering: endast läkare, tandläkare och sjuksköterskor får delegera; beslutet personligt, för viss verksamhet, tidsbegränsat, följs upp minst en gång per år; mottagaren ansvarar för hur uppgiften fullgörs (rad 140): Socialstyrelsens handbok 2025-11-9899.
- Patientsäkerhetslagen 6 kap. 4 § rapporteringsplikt, lex Maria-anmälan av vårdgivaren till IVO vid allvarlig vårdskada (3 kap. 5 §) (rad 136): riksdagen.se, SFS 2010:659.
- Behörighet kräver legitimation i region och kommun (rad 18, 170): hälso- och sjukvårdsförordningen 5 kap. 1 och 5 §§.
- Produkt: Intervjuprovet bedömer ett svar utan konto, hela återkopplingen kräver konto, Inför intervjun utan tak i Premium, Jobbcoachen tio meddelanden gratis per konto (rad 194, 196): src/components/artiklar/intervjuprov/intervjuprov-copy.ts, src/app/dashboard/intervju/infor-intervjun-copy.ts, src/lib/access/features.ts (interview_unlimited), src/lib/quota/quotaService.ts (FREE_CHAT_MESSAGES_PER_ACCOUNT = 10).
- STAR-exemplen är uttryckligen märkta "påhittade men typiska" (rad 100). Inga verkliga personer, citat eller fallstudier.

## Rättning (omgång 1, 2026-11-15)
- Rad 18, 170, 216 (legitimationstiden): "Vårdförbundet skriver att det normalt tar cirka tre veckor" struket. Socialstyrelsens 2023-uppgift (omkring fyra veckor) gällde undersköterskor och Socialstyrelsens nuvarande sida för sjuksköterskor utbildade i Sverige anger enligt sökindex cirka tre veckor (sidan svarade 503 vid direkt hämtning), så källorna går isär. Omskrivet till "räkna med några veckor från att ansökan kommit in, och längre om den behöver kompletteras", samma i frontmatter-FAQ, FAQ-blocket och fråga 13. Socialstyrelsens legitimationssida tillagd i källraden.
- Rad 174 (distriktssköterska): attributionen till Vårdförbundet struken. Omskrivet till att distriktssköterska är en specialistbeteckning som kräver specialistsjuksköterskeexamen med den inriktningen (stöds av utbildningsplaner och sökresultat från Vårdförbundets sida).
- Notering om andrahandsformulering: "Vårdförbundet skriver att förordningen anger" ersatt med direkt hänvisning till hälso- och sjukvårdsförordningen; 5 kap. 5 § kontrollerad ordagrant på riksdagen.se ("Behörig för anställning som barnmorska, ... eller sjuksköterska är den som har legitimation för sådant yrke"). SFS 2017:80 tillagd i källraden.
- Inga rubriker, FAQ-frågor eller description ändrade. updated: "2026-11-15" tillagt. Bilden berörs inte, inte omgjord.

## Andra granskningen (2026-11-15)
GODKÄND. Båda fynden åtgärdade. Legitimationstiden: "några veckor ... längre om den behöver kompletteras" bärs av Socialstyrelsens sida för sjuksköterska utbildad i Sverige (enligt sökindex ungefär 3 veckor, längre vid komplettering; sidan svarar 503 vid direkt hämtning). Frontmatter-FAQ, FAQ-block och fråga 13 stämmer överens. Hälso- och sjukvårdsförordningen 5 kap. 5 § kontrollerad ordagrant via data.riksdagen.se; att det gäller även kommuner står i 5 kap. 1 § (källraden anger bara 5 §, kan gärna kompletteras till "5 kap. 1 och 5 §§", inget fel). Distriktssköterska som skyddad specialistbeteckning som kräver specialistsjuksköterskeexamen stöds av Vårdförbundets sida och Wikipedia (sökresultat). Inga talstreck i ändrade rader, produktuppgifterna orörda och riktiga.

## Svar till samordnaren
intervjufragor-sjukskoterska, GODKÄND, inga brister.

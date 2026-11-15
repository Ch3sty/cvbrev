# Faktagranskning: content/artiklar/fardiga-personliga-brev.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, men brådskande: påhittade användarsiffror och ett dataskyddslöfte ("delar aldrig med tredje part") som motsägs av vår egen integritetspolicy.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 195 | "Vår användardata visar att 92% får svar inom 30 dagar och att intervjufrekvensen är 2,6 gånger högre" | påhittat | Ingen sådan mätning finns; tjänsten registrerar inte arbetsgivarsvar (Sökta tjänster-trackern kom september 2026). Samma siffror finns i din-digitala-jobbcoach. Stryk meningen; behåll resonemanget om varför ett anpassat brev fungerar. | Sökning i content/, src/, docs/: inga källor till siffrorna |
| 45, 241 | "Vi delar aldrig din data med tredje part" | fel | Integritetspolicyn säger att CV-text och annonstext skickas till Google (Gemini API), och att Supabase, Stripe, Vercel och PostHog används. Ersätt med: "Vi säljer aldrig din data. CV- och annonstext skickas till vår AI-leverantör (Google Gemini) för att skriva brevet, och för brev byts namn och kontaktuppgifter först ut mot platshållare." | src/app/(public)/integritetspolicy/page.tsx (avsnitten om Gemini API och tredje parter) |
| 45, 241 | "All data du laddar upp och genererar sparas krypterat" | obelagt (produkt) | Integritetspolicyn har bara en platshållare: "[Exempel: SSL/TLS-kryptering, hashade lösenord]". Supabase krypterar lagring som standard, men vi bör inte lova mer än policyn. Skriv "lagras hos Supabase, krypterat vid överföring och lagring" först när policyn säger det, annars stryk "krypterat". OBS: platshållaren i integritetspolicyn bör själv åtgärdas. | Integritetspolicyn rad 198 |
| 79 | "Varken Personligtbrev.se eller CVkungen varnar för vad som händer när du klistrar in ett exempel utan att skriva om det" | fel | CVkungen skriver att "brevet alltid ska anpassas efter det specifika jobbet" och "Varje personligt brev ska vara unikt"; Personligtbrev.se ber läsaren "byt ut informationen till din egen". Stryk meningen eller skriv "Mallsajterna påminner om att anpassa, men visar sällan vad som händer när man inte gör det." | https://www.cvkungen.se/exempel-personliga-brev ; https://www.personligtbrev.se/ |
| 65 | "fördelade på 18 yrkeskategorier" | obelagt | CVkungen anger "Över 100 exempel" men inget antal kategorier på exempelsidan. Stryk "fördelade på 18 yrkeskategorier". | https://www.cvkungen.se/exempel-personliga-brev |
| 95 | "Arbetsförmedlingen och de flesta karriärvägledare rekommenderar att brevet ryms på en sida" | obelagt | Arbetsförmedlingens CV- och brevguide gick inte att nå (404). Länka till en sida där det står, eller skriv "De flesta karriärvägledare rekommenderar ...". | – |
| 47, 245 | "ett starkt och relevant första utkast, ofta 80-90% färdigt" | obelagt (produkt) | Ingen mätning. Stryk procentsatsen. | – |
| 26, 56, 65 | "Fackförbund som Unionen och Akavia har mallar och guider ... Academic Work erbjuder nedladdningsbara exempel" | obelagt (ej verifierat) | Unionens brevsida gav 404 vid kontroll; Akavia och Academic Work hann inte verifieras. Kontrollera länkar innan publicering eller skriv "guider" i stället för "mallar". | – |

## Belagda påståenden
- CVkungen: "Över 100 exempel" på personliga brev (rad 65): https://www.cvkungen.se/exempel-personliga-brev (meta description).
- Utkast på cirka 60 sekunder (rad 56, 61, 125): verktygets egen uppgift, /verktyg/personligt-brev ("Skräddarsydd ansökan på 60 sekunder").
- CV-uppladdning i PDF, DOCX och TXT (rad 43, 121, 237): src/components/cv/cv-uploader.tsx.
- Tonjustering finns (rad 40, 179): fem tonlägen i TonalityLanguageStep.tsx, gratis; "vi väljer ton åt dig" i Premium.
- Breven sparas på kontot (rad 183): /dashboard/mina-brev.
- Brevexemplen per yrke finns (rad 115): /personligt-brev-exempel/saljare, sjukskoterska, student, larare, ekonomiassistent, underskoterska.

## Rättning (omgång 1, 2026-11-15)
- Rad 195 (92 %, 2,6 gånger): struket; ersatt med att vi inte lovar siffror om svar och intervjuer, resonemanget om varför ett anpassat brev fungerar står kvar.
- Rad 45, 241 ("delar aldrig med tredje part", "sparas krypterat"): omskrivet i frontmatter och FAQ-block enligt integritetspolicyn: lagras hos Supabase, kan raderas via kontoinställningarna, vi säljer aldrig uppgifterna, CV- och annonstext skickas till Google (Gemini) efter att namn och kontaktuppgifter bytts mot platshållare, betalningar via Stripe, länk till /integritetspolicy. "Krypterat" struket. Platshållaren i integritetspolicyn (rad 198) är inte åtgärdad här.
- Rad 79 (mallsajterna varnar inte): omskrivet till "Mallsajterna påminner om att brevet ska anpassas, men visar sällan vad som händer när man inte gör det."
- Rad 65 (18 yrkeskategorier): struket.
- Rad 95 (Arbetsförmedlingen, en sida): ersatt med Akavia, som rekommenderar högst en A4-sida (kontrollerat på Akavias brevguide).
- Rad 47, 245 (80-90 % färdigt): struket i båda FAQ-blocken.
- Rad 26, 56, 65 (Unionen/Akavia/Academic Work): kontrollerat; Unionen har brevmallar i Word, Academic Work har en nedladdningsbar mall, Akavia har en guide (ingen mall). Texten ändrad därefter i FAQ, FAQ-block, snabbsvar och brödtext.
- updated tillagt. Bilden berördes inte. Inga rubriker, FAQ-frågor eller description ändrade.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rad 66, 96 och FAQ (rad 27, 208): de nya uppgifterna om Unionen ("brevmallar i Word"), Academic Work ("en mall att ladda ner"), Akavia ("en utförlig guide", "högst en A4-sida") och den kvarvarande siffran "CVkungen uppger själva över 100 exempel" stämmer vid kontroll, men artikeln har ingen källrad och inga länkar till någon av dem. Krävs: källrad sist i artikeln med https://www.unionen.se/filer/ovrigt/mallar-personligt-brev , https://www.academicwork.se/artiklar/soka-jobb/personligt-brev-mall--exempel , https://www.akavia.se/rad-och-stod/soka-jobb/jobbansokan/sa-skriver-du-personligt-brev/ och https://www.cvkungen.se/exempel-personliga-brev .

Övrigt kontrollerat och godkänt: 92 % och 2,6 gånger är borta; dataskyddssvaret stämmer med integritetspolicyn (Supabase, radering via kontot, Gemini med platshållare för namn, e-post, telefon och adress före brev, Stripe) och är identiskt i frontmatter och FAQ-block; 80-90 % och 18 yrkeskategorier är strukna; meningen om mallsajterna säger inte mer än CVkungens och Personligtbrev.se:s egna anpassningsråd. Inga talstreck.

## Rättning omgång 2 (2026-11-15)
- Rad 27, 66, 96, 208 (Unionen, Academic Work, Akavia, CVkungen över 100 exempel): texten oförändrad; källrad tillagd sist i artikeln: *Källor: [Unionens mallar för personligt brev](https://www.unionen.se/filer/ovrigt/mallar-personligt-brev), [Academic Works mall och exempel](https://www.academicwork.se/artiklar/soka-jobb/personligt-brev-mall--exempel), [Akavias guide till personligt brev](https://www.akavia.se/rad-och-stod/soka-jobb/jobbansokan/sa-skriver-du-personligt-brev/) och [CVkungens exempel på personliga brev](https://www.cvkungen.se/exempel-personliga-brev).*
- Inga rubriker, FAQ-frågor eller description ändrade. Underlaget för artikelbilden berörs inte, bilden inte omgjord.

## Tredje kontrollen (2026-11-15)
GODKÄND. Källraden med Unionen, Academic Work, Akavia och CVkungen finns och alla fyra länkar svarar. FAQ i frontmatter och block identiska, inga talstreck.

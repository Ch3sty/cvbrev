# Faktagranskning: content/artiklar/tips-pa-personligt-brev.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, alla fyra källhänvisningar (Randstad, två gånger Akavia, Arbetsförmedlingen) säger mer än källorna, och öppningssiffran saknar källa. Råden i sig håller.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 37 | "Rekryterare skannar ett brev på 20 till 30 sekunder enligt Randstad" | obelagt (källan har inte siffran) | Randstads guide om personligt brev nämner ingen tid i sekunder. Stryk "enligt Randstad" och siffran, eller skriv "Rekryterare läser ofta snabbt, så de första meningarna avgör om resten läses." | https://www.randstad.se/karriartips/hitta-jobb/sa-skriver-du-ett-personligt-brev-som-sticker-ut/ |
| 29 | "Rekryterare läser ett personligt brev på 30 sekunder." | obelagt | Ingen undersökning hittades. Ladders-studien (7,4 s) gäller CV, inte brev. Skriv om utan siffra. | Ingen källa |
| 115 | "Akavia ... lyfter att det vanligaste skälet till att en kandidat sållas bort är att det inte framgår varför personen vill ha just det här jobbet" | obelagt (källan säger mindre) | Akavias guide säger "Arbetsgivare vill se att du är genuint intresserad av tjänsten och företaget ... förklara varför du vill arbeta just där". Den säger inget om "vanligaste skälet att sållas bort". Föreslagen text: "Akavia betonar att arbetsgivare vill se att du är genuint intresserad och kan förklara varför du vill arbeta just där." | https://www.akavia.se/rad-och-stod/soka-jobb/jobbansokan/sa-skriver-du-personligt-brev/ |
| 244 | "Akavia rekommenderar att du undviker opersonliga hälsningar och istället skriver direkt till den som rekryterar, ungefär som att du skakar hand vid ett första möte" | obelagt (källan säger mindre) | Akavia skriver: "Försök att skriva ditt personliga brev som om du talar direkt till den person som kommer att läsa det." Inget om hälsningsfraser eller handslag. Föreslagen text: "Akavia råder dig att skriva som om du talar direkt till den som ska läsa brevet." | Som ovan |
| 193 | "Arbetsförmedlingen påpekar att engagemang och vilja ofta väger upp brist på år i yrket" | obelagt | Arbetsförmedlingens brevguide säger inte detta. Stryk attributionen och behåll rådet som vårt eget. | https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-personligt-brev |
| 313 | "Vi hjälper dig komma igång på 60 sekunder" | obelagt (produkt) | Ingen tidsuppgift för brevverktyget finns i koden. 60 sekunder anges för CV-analysen, inte för brevet. Skriv "på någon minut", eller kontrollera genereringstiden först. | src/app/(public)/verktyg/personligt-brev/page.tsx |

## Belagda påståenden
- Max en A4-sida (rad 14, 92, 175): Arbetsförmedlingen, "Max en A4-sida är en bra längd", och Akavia, "bör inte vara längre än en A4-sida".
- Akavia: skräddarsy varje brev, undvik klichéer som "jag är en lagspelare", konkreta exempel i stället för generella fraser: Akavia-guiden ovan.
- 89 yrken (rad 309): BREV_GALLERI, 89 poster.
- FAQ om verktyget (rad 22, 342): nyckelord ur annonsen och tonaliteter finns enligt src/app/(public)/verktyg/personligt-brev/page.tsx ("sex tonaliteter", "jobbannons-matchning").
- Exempelpersonerna (Maria Lindqvist på Skanska, KAM på Adecco) står i märkta Svagt/Starkt-exempel och framställs inte som verkliga fall.

## Rättning (omgång 1, 2026-11-15)
- Rad 37 (snabbsvaret, Randstad 20 till 30 sekunder): siffran och "enligt Randstad" struket. Ny text: "Många rekryterare läser snabbt, så de första meningarna avgör om resten läses."
- Rad 29 (30 sekunder): siffran struken. Omskrivet till "Rekryterare läser ofta ett personligt brev snabbt. Redan på de första raderna avgörs ..., och många brev förlorar den kampen i första meningen." ("De flesta" mjukat till "många".)
- Rad 115 (Akavia, vanligaste skälet att sållas bort): rättat till "Akavia ... betonar att arbetsgivare vill se att du är genuint intresserad och kan förklara varför du vill arbeta just där."
- Rad 244 (Akavia, hälsningar/handslag): rättat till "Akavia råder dig att skriva som om du talar direkt till den som ska läsa brevet, och då hör en personlig hälsning hemma."
- Rad 193 (Arbetsförmedlingen påpekar ...): attributionen struken, rådet kvar som vårt eget: "Engagemang och vilja kan delvis väga upp att du har få år i yrket ..."
- Rad 313 (60 sekunder): ändrat till "på någon minut".
- Källrad skapad sist i artikeln: Akavias och Arbetsförmedlingens brevguider (båda används för belagda påståenden i texten).
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte, inte omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Rättningarna kontrollerade mot Akavia (https://www.akavia.se/rad-och-stod/soka-jobb/jobbansokan/sa-skriver-du-personligt-brev/): "Arbetsgivare vill se att du är genuint intresserad av tjänsten och företaget ... förklara varför du vill arbeta just där" och "skriva ditt personliga brev som om du talar direkt till den person som kommer att läsa det" bär de nya formuleringarna; tillägget "och då hör en personlig hälsning hemma" är vår slutsats och läses inte som Akavias. Randstad, 30 sekunder och Arbetsförmedlingen-attributionen strukna, Arbetsförmedlingen säger inget om att engagemang väger upp erfarenhet och texten tillskriver dem det inte längre. Källraden finns. Inga talstreck i ändrade rader. Notering utan krav: rad 124 "En rekryterare märker på tio sekunder om brevet hade kunnat skickas till femtio andra företag" är samma typ av osourcad tidsuppgift som struks på rad 29; överväg "märker direkt".

## Svar till samordnaren
tips-pa-personligt-brev, GODKÄND, inga brister (notering: "tio sekunder" på rad 124 bör mjukas till "direkt").

## Rättning omgång 2 (samordnaren, 2026-11-15)
"på tio sekunder" blev "direkt".

## Tredje kontrollen (2026-11-15)
GODKÄND. "på tio sekunder" (rad 124) är nu "direkt". Inga andra tidsuppgifter kvar i ändrade rader, inga talstreck.

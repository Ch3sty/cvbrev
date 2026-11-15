# Faktagranskning: content/artiklar/online-cv-byggare-gratis.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, artikeln varnar för byggare där "nedladdningen kostar" men beskriver vår egen som gratis hela vägen, fast gratisnivån ger en nedladdning och tre av 41 mallar.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 13, 209 | "vår egen där du fyller i CV:t i sju steg och laddar ner det som PDF eller Word utan kostnad" | fel (produkt) | En nedladdning per konto ingår gratis, och 3 av 41 mallar; fler nedladdningar och övriga mallar kräver Jobbcoach Premium (149 kr i månaden, ingen bindningstid). Ersätt med "... och laddar ner det som PDF eller Word. Tre mallar och en nedladdning ingår gratis, utan kortuppgift." | src/lib/cv/template-antal.ts (FREE_TEMPLATE_COUNT = 3, FREE_CV_EXPORTS = 1); src/app/api/cv/generate-formatted/route.ts; priser-sidan |
| 49, 53, 152 | "skapa ett CV gratis i vår CV-byggare, utan kortuppgift och med nedladdning som PDF eller Word" / "Vår byggare är gratis utan kortuppgift" | fel (produkt, ofullständigt) | "Utan kortuppgift" stämmer, men nedladdningen är begränsad till en gratis. Lägg till begränsningen som ovan. | Som ovan |
| 109 | "Det finns byggare som är genuint gratis hela vägen, inklusive nedladdningen, vår egen inräknad" | fel (produkt) | Enligt artikelns egen definition (rad 111–112: "bygget är gratis men nedladdningen kostar", "låses till en enda mall") är vår gratisnivå begränsad. Skriv ärligt: "Hos oss är första nedladdningen och tre mallar gratis, utan kortuppgift och utan vattenstämpel; fler kräver Premium, som du kan säga upp när du vill." | Som ovan |
| 21, 199, 225 | "analysera CV:t mot jobbannonsen och se vad som saknas" / "analysera ditt CV mot annonsen och få tillbaka vilka nyckelord du saknar" | fel (produkt) | CV-analysen tar bara emot CV:t och jämför mot vanliga söktermer i branschen, inte mot en annons. Ersätt med "analysera CV:t och se vilka branschord som saknas", och hänvisa till jobbmatchningen för annonsjämförelse. | src/app/api/cv/analyze/route.ts; /verktyg/cv-analys |
| 107 | "Flera stora internationella byggare har kritiserats för just detta, och för att prenumerationerna är krångliga att säga upp" | obelagt | Ingen källa anges. Ange källa (t.ex. konsumentmyndighet eller recensionsplattform) eller mjuka upp. | – |
| 154 | "Zety, Resume.io och Kickresume ... använder ofta prenumerationsmodeller där gratisversionen är begränsad" | obelagt (ej verifierat) | Hann inte kontrolleras mot respektive prissida. Kontrollera innan påståendet står kvar, eller formulera utan namn. | – |

## Belagda påståenden
- Sju steg, förhandsvisning, ATS-säkra mallar, export till PDF och Word, LinkedIn-import, sparas automatiskt (rad 13, 23, 53, 152, 229): src/app/(public)/verktyg/skapa-cv/page.tsx och layout.tsx.
- Ingen kortuppgift för gratisnivån (rad 13, 49, 53, 152): skapa-cv-sidan "Ingen kortuppgift och inga dolda avgifter".
- CV:t sparas för senare redigering (rad 152): cv-mallar-sidan "Allt sparas i ditt konto".
- LinkedIn kan spara en profil som PDF (rad 154): LinkedIns "Spara som PDF"-funktion på profilen.

## Rättning (omgång 1, 2026-11-15)
- Rad 13, 209 (nedladdning utan kostnad): rättat; tre mallar och en nedladdning gratis, fler nedladdningar och alla 41 mallar i Jobbcoach Premium.
- Rad 49, 53, 152 ("gratis utan kortuppgift"): kompletterat med begränsningen.
- Rad 109 (genuint gratis, vår egen inräknad): omskrivet ärligt: första nedladdningen och tre mallar gratis, utan kortuppgift och utan vattenstämpel (ingen vattenstämpel i koden), resten i Premium, 149 kr i månaden, uppsägningsbar.
- Rad 21, 199, 225 (analys mot annonsen): rättat till branschord som saknas; jobbmatchningen tillagd (intern länk /verktyg/jobbmatchning i rad 199).
- Rad 107 (kritiserats): omskrivet utan påståendet om kritik, till en uppmaning att läsa villkoren eftersom en startad prenumeration kan vara krånglig att säga upp.
- Rad 154 (Zety, Resume.io, Kickresume): kontrollerat; Zety och Resume.io tar betalt för formaterad nedladdning (gratis bara som text), Kickresume har en begränsad gratisnivå. Påståendet står kvar oförändrat.
- updated tillagt. Bilden berördes inte. Inga rubriker, FAQ-frågor eller description ändrade.

## Andra granskningen (2026-11-15)
GODKÄND. Gratisnivån står rätt i FAQ, FAQ-block, ingress, snabbsvar, prenumerationsavsnittet och jämförelsen: tre av 41 mallar och en nedladdning, utan kortuppgift, resten i Jobbcoach Premium 149 kr i månaden (template-antal.ts, priser-sidan). Ingen vattenstämpel i koden. CV-analysen beskrivs utan annons och jobbmatchningen hänvisas till för lediga jobb. Påståendet om kritik är struket. Zety, Resume.io och Kickresume ("gratisversionen är begränsad") är kontrollerat av första granskaren och står oförändrat. Inga talstreck.

## Produktsvep (2026-11-15)
- Word-export av CV finns inte: "PDF eller Word" blev "PDF" på fem ställen (FAQ i frontmatter och FAQItem, ingressen, snabbsvaret, avsnittet Vår byggare och de populära alternativen). Det allmänna rådet om att Word kan vara ett plus hos andra byggare lämnat.
- Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte.

## Tredje kontrollen (2026-11-15)
GODKÄND. Produktsvepet stämmer med facit: CV:t exporteras bara som PDF (frontmatter-FAQ rad 14 och 16, FAQ-block rad 210 och 214, ingressen, snabbsvaret, Vår CV-byggare), tre av 41 mallar och en nedladdning gratis, Premium 149 kr i månaden. Rad 100 om Word som plus är ett allmänt råd om byggare, inget påstående om vår export. FAQ lika. Inga talstreck.

# Faktagranskning: content/artiklar/bli-hittad-av-rekryterare.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, produktbeskrivningen av Bli upptäckt stämmer med koden, men LinkedIns sekretess beskrivs starkare än LinkedIn själv gör och några marknadspåståenden saknar källa.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 78 | "Ser min chef att jag är sökbar? På LinkedIn: inte om du använder rekryterar-riktade Öppen för jobb" | fel (säger mer än källan) | LinkedIn: "we take steps to prevent LinkedIn Recruiter users who work at your current company from seeing your shared career interests, but we can't guarantee complete privacy". Ersätt med: "På LinkedIn: med Öppen för jobb riktat till rekryterare försöker LinkedIn dölja signalen för rekryterare på din nuvarande arbetsgivare, men lovar ingen fullständig sekretess." | https://www.linkedin.com/help/linkedin/answer/a507508 |
| 46 | "LinkedIn är den största ytan för uppsökande rekrytering i Sverige" | obelagt | Ingen källa. Mjuka upp till "en av de största ytorna" eller ange källa. | – |
| 48 | "nästan alla rekryterare finns där" | obelagt | Ingen källa. Stryk "nästan alla" ("de flesta rekryterare använder den"). | – |
| 20, 42, 119 | "undersköterskor, elektriker och redovisningsekonomer kontaktas idag via både LinkedIn och kandidatdatabaser" | obelagt | Rimligt men utan källa. Mjuka upp ("kontaktas allt oftare") eller ange källa, t.ex. Arbetsförmedlingens yrkesprognoser för bristyrkena. | – |

Anmärkning (produkt, inget faktafel): artikeln uppmanar läsaren att sätta upp en Bli upptäckt-profil men nämner inte att synligheten för rekryterare ingår i Premium. Profilen och testerna är gratis, men "Utan Premium visas profilen inte i rekryterarnas sökningar" (src/app/(public)/verktyg/bli-upptackt/page.tsx). Lägg gärna till en mening, så att löftet om "nästan noll tidskostnad" inte läses som gratis synlighet.

## Belagda påståenden
- LinkedIn har en Öppen för jobb-inställning som bara visas för rekryterare (rad 16, 33, 46): LinkedIn Help a507508, "People using LinkedIn Recruiter only".
- TNG: rekryterare söker aktivt dagligen och söker på nyckelord (rad 40): https://www.tng.se/soka-jobb/linkedinprofil-tips/ ("rekryterare dagligen söker efter tänkbara kandidater på exempelvis LinkedIn, Google och andra kandidatdatabaser", "'searchar' genom att söka på nyckelord").
- Academic Work: rubrik och nyckelord viktigast, konkreta bevis före klyschor (rad 64–70): https://www.academicwork.se/artiklar/soka-jobb/3-saker-rekryterare-kollar-efter-i-din-linkedin-profil/
- Bli upptäckt: namn, kontaktuppgifter, CV och arbetsgivare visas inte förrän kandidaten tackat ja; löneanspråket visas aldrig för rekryteraren; styrkor i ord, inte råpoäng (rad 16, 54, 56): src/app/(public)/verktyg/bli-upptackt/page.tsx; foto dolt enligt src/app/(public)/for-rekryterare/page.tsx.
- Verifierade rekryterare söker i poolen (rad 52, 96): for-rekryterare-sidan, konton godkänns manuellt mot organisationsnummer.

## Rättning (omgång 1, 2026-11-15)
- Rad 78 (chefen ser inte): rättat enligt LinkedIn Help: LinkedIn försöker dölja signalen för rekryterare på nuvarande arbetsgivare men lovar ingen fullständig sekretess. Samma förbehåll infört i FAQ-svaret "Kan jag bli hittad ... utan att min arbetsgivare ser det?" (frontmatter och FAQ-block). LinkedIns hjälpsida tillagd i källraden.
- Rad 46 ("den största ytan"): ändrat till "en av de största ytorna".
- Rad 48 ("nästan alla rekryterare"): ändrat till "de flesta rekryterare använder den".
- Rad 20, 42, 119 (undersköterskor m.fl. "kontaktas idag"): mjukat till "allt oftare" i FAQ, FAQ-block och brödtext.
- Produktanmärkningen: ny mening i avslutande avsnittet att profilen i Bli upptäckt kan skapas utan att betala men att synlighet i rekryterarnas sökningar kräver Jobbcoach Premium, 149 kr i månaden utan bindningstid (kontrollerat i bli-upptackt-faq-data.ts).
- updated tillagt. Bilden berördes inte. Inga rubriker, FAQ-frågor eller description ändrade.

## Andra granskningen (2026-11-15)
GODKÄND. LinkedIn-förbehållet stämmer med LinkedIn Help a507508 ("we take steps to prevent LinkedIn Recruiter users who work at your company from seeing your shared career interests, but we can't guarantee complete privacy") och står likadant i frontmatter-FAQ, FAQ-block och brödtext; källan ligger i källraden. Den nya Premium-meningen stämmer med bli-upptackt-faq-data.ts ("Utan Premium kan du skapa din profil och göra testerna, men profilen visas inte i rekryterarnas sökningar"), Jobbcoach Premium 149 kr i månaden, inga paket eller Dagspass. Uppmjukningarna ("en av de största ytorna", "de flesta rekryterare", "allt oftare") säger inte mer än underlaget. Inga talstreck.

## Produktsvep (2026-11-15)
- Avsnittet "Verifierade meriter": "Dina styrkor beskrivs i ord, aldrig som utlämnande siffror" ersatt med korrekt beskrivning: rekryteraren ser ett märke per testtyp, "topp X %" när minst 25 personer gjort testet, annars andel rätt; personlighetsprofilen visas bara om kandidaten väljer det; löneförväntningar visas aldrig utåt (kvar).
- Avsnittet "Helheten": påståendet att Jobbcoach Premium (149 kr/mån) krävs för att profilen ska visas i rekryterarnas sökningar struket. Nu: profilen skapas utan kostnad och kandidaten bestämmer själv när den ska synas.
- Inga rubriker, FAQ-frågor eller description ändrade. Bildunderlaget berörs inte.

## Tredje kontrollen (2026-11-15)
GODKÄND. Produktsvepet stämmer med facit: märke per testtyp med "topp X %" vid minst 25 personer, annars andel rätt; personlighet bara om kandidaten väljer det; lönespann visas aldrig; Premium-kravet för att synas är struket och ingen Premium-uppgift finns kvar i artikeln; inget "aldrig siffror". FAQ identiska, inga talstreck.

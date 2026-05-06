/**
 * FAQ-data for /verktyg/linkedin-optimering landningssidan.
 * 8 fragor med utbildningsfokus optimerade for long-tail-keywords kring
 * "linkedin-optimering", "linkedin headline tips", "linkedin om mig exempel".
 */

export interface FaqItem {
  q: string
  a: string
}

export const LINKEDIN_OPTIMERING_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Varför syns jag inte på LinkedIn idag?',
    a: 'Rekryterare hittar kandidater genom att söka på keywords i LinkedIns sökmotor. Om din rubrik bara säger "Marknadsförare" och din om-mig-text är generisk, så matchar du inte det rekryterare faktiskt söker på, till exempel "B2B SaaS marknadsförare i Stockholm". Det handlar inte om att du är osynlig, utan om att profilen inte är optimerad för det sökspråk rekryterare använder.',
  },
  {
    q: 'Hur skriver man en bra LinkedIn-rubrik?',
    a: 'En bra rubrik utnyttjar de 220 tecken du har och innehåller tre delar: din yrkesroll, dina specialområden och vem du jobbar med. Till exempel "Senior frontend-utvecklare | React, TypeScript, design systems | Bygger produkt för B2B SaaS-bolag" istället för bara "Frontend-utvecklare". Vi skapar förslag baserat på din erfarenhet och målroll, så du slipper stirra på en blank ruta.',
  },
  {
    q: 'Vad är ATS-keywords på LinkedIn?',
    a: 'ATS står för Applicant Tracking System och är de sökverktyg rekryterare använder för att hitta kandidater. På LinkedIn handlar det om att rätt branschord ska finnas på rätt plats: rubrik, om-mig och erfarenhet. Vi identifierar keywords som matchar din erfarenhet och vävs in i texten naturligt, utan att det låter robotaktigt eller forcerat.',
  },
  {
    q: 'Loggar ni in på min LinkedIn?',
    a: 'Nej. Vi rör aldrig din LinkedIn-profil och har inget delat lösenord. Du kopierar din egen profiltext från LinkedIn, klistrar in i vårt verktyg, vi optimerar texten och visar resultatet. Sedan kopierar du tillbaka den nya texten till LinkedIn manuellt. Du behåller full kontroll och vi får aldrig tillgång till ditt konto.',
  },
  {
    q: 'Hur lång tid tar optimeringen?',
    a: 'Själva AI-optimeringen tar 30-60 sekunder. Räkna sedan med 2-3 minuter för att copy-pasta in resultatet i LinkedIn. Totalt cirka fem minuter från att du startar tills din profil är uppdaterad. Har du redan ett sparat CV hos oss går det ännu snabbare eftersom alla fält autofyllt från början.',
  },
  {
    q: 'Behöver jag ladda upp mitt CV?',
    a: 'Nej, men det går snabbare om du har ett sparat CV. Då fyller vi automatiskt i din erfarenhet, utbildning och kompetenser från CV-datan. Annars kopierar du bara texten från din nuvarande LinkedIn-profil och klistrar in i fem fält: Rubrik, Om mig, Erfarenhet, Utbildning och Kompetenser.',
  },
  {
    q: 'Vad är skillnaden mellan "Stå ut i mängden" och "Sikta på en specifik roll"?',
    a: 'Stå ut bygger en bred profil som funkar mot flera arbetsgivare och rekryterare i din bransch, perfekt om du är öppen för olika typer av roller. Sikta på en specifik roll trycker fram exakt de keywords och formuleringar som krävs för en given titel, till exempel Senior Backend Engineer eller Marknadschef B2B. Du väljer läge i steg ett och kan göra om optimeringen i andra läget när som helst.',
  },
  {
    q: 'Är det gratis att optimera sin LinkedIn?',
    a: 'Ja. Du får en gratis optimering i veckan utan att lämna kortuppgifter, och du ser hela resultatet direkt. Behöver du fler optimeringar (till exempel om du tränar flera versioner mot olika roller) uppgraderar du till Premium för 149 kr per månad. Du kan testa Premium gratis i sju dagar.',
  },
]

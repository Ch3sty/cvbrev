/**
 * FAQ-data för /verktyg/linkedin-optimering.
 * Åtta frågor med utbildningsfokus kring "linkedin-optimering",
 * "linkedin headline tips" och "linkedin om mig exempel".
 * Belopp ur PLAN_BY_KEY, aldrig som fasta tal.
 */

import { PLAN_BY_KEY } from '@/lib/plans/plans'

export interface FaqItem {
  q: string
  a: string
}

const CV_VECKA = PLAN_BY_KEY.cv_week
const ALLT_VECKA = PLAN_BY_KEY.all_week
const ALLT_MANAD = PLAN_BY_KEY.all_month

export const LINKEDIN_OPTIMERING_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Varför syns jag inte på LinkedIn idag?',
    a: 'Rekryterare hittar kandidater genom att söka på sökord i LinkedIns sökmotor. Om din rubrik bara säger "Marknadsförare" och din om-mig-text är generisk, så matchar du inte det rekryterare faktiskt söker på, till exempel "B2B SaaS marknadsförare i Stockholm". Det handlar inte om att du är osynlig, utan om att profilen inte är skriven för det sökspråk rekryterare använder.',
  },
  {
    q: 'Hur skriver man en bra LinkedIn-rubrik?',
    a: 'En bra rubrik utnyttjar de 220 tecken du har och innehåller tre delar: din yrkesroll, dina specialområden och vem du jobbar med. Till exempel "Senior frontend-utvecklare | React, TypeScript, designsystem | Bygger produkt för B2B SaaS-bolag" i stället för bara "Frontend-utvecklare". Vi skapar förslag utifrån din erfarenhet och målroll, så du slipper stirra på en tom ruta.',
  },
  {
    q: 'Vilka nyckelord letar rekryteringssystemen (ATS) efter på LinkedIn?',
    a: 'ATS är förkortningen för Applicant Tracking System, alltså de rekryteringssystem och sökverktyg rekryterare använder för att hitta kandidater. På LinkedIn handlar det om att rätt branschord ska finnas på rätt plats: i rubriken, i om-mig-texten och under erfarenhet. Vi hittar de sökord som matchar din erfarenhet och väver in dem i texten så att den fortfarande låter som du.',
  },
  {
    q: 'Loggar ni in på min LinkedIn?',
    a: 'Nej. Vi rör aldrig din LinkedIn-profil och har inget delat lösenord. Du kopierar din egen profiltext från LinkedIn, klistrar in i vårt verktyg, vi optimerar texten och visar resultatet. Sedan kopierar du tillbaka den nya texten till LinkedIn själv. Du behåller full kontroll och vi får aldrig tillgång till ditt konto.',
  },
  {
    q: 'Hur lång tid tar optimeringen?',
    a: 'Optimeringen tar 30 till 60 sekunder. Räkna sedan med två eller tre minuter för att klistra in resultatet på LinkedIn. Totalt cirka fem minuter från att du startar tills din profil är uppdaterad. Har du redan ett sparat CV hos oss går det ännu snabbare, eftersom alla fält då är ifyllda från början.',
  },
  {
    q: 'Behöver jag ladda upp mitt CV?',
    a: 'Nej, men det går snabbare om du har ett sparat CV. Då fyller vi i din erfarenhet, utbildning och kompetenser från ditt CV. Annars kopierar du bara texten från din nuvarande LinkedIn-profil och klistrar in i fem fält: Rubrik, Om mig, Erfarenhet, Utbildning och Kompetenser.',
  },
  {
    q: 'Vad är skillnaden mellan "Stå ut i mängden" och "Sikta på en specifik roll"?',
    a: 'Stå ut bygger en bred profil som fungerar mot flera arbetsgivare och rekryterare i din bransch, bra om du är öppen för olika typer av roller. Sikta på en specifik roll lyfter fram exakt de sökord och formuleringar som krävs för en given titel, till exempel Senior backendutvecklare eller Marknadschef B2B. Du väljer läge i steg ett och kan göra om optimeringen i det andra läget när som helst.',
  },
  {
    q: 'Vad kostar LinkedIn-optimeringen?',
    a: `Optimeringen ingår i ${CV_VECKA.name} för ${CV_VECKA.amount} kr i veckan, tillsammans med alla CV-mallar, hela CV-analysen och personliga brev utan tak. Den ingår också i Allt: ${ALLT_VECKA.name} för ${ALLT_VECKA.amount} kr i veckan eller ${ALLT_MANAD.name} för ${ALLT_MANAD.amount} kr i månaden. Du säger upp när du vill. Utan paket kan du se exemplet här på sidan och skapa ett konto, men inte köra optimeringen på din egen profil.`,
  },
]

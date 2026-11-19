/**
 * FAQ-data for /verktyg/jobbcoachen landningssidan.
 * 8 fragor optimerade for long-tail-keywords kring "karriarradgivning",
 * "lonestatistik", "arbetsratt fragor" och "intervjutips".
 * Priset ur PLANS, aldrig som fast tal.
 */

import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { GRUNDNIVAN_ALLA_DAG } from '@/lib/plans/gratis-copy'
import { FREE_TEMPLATE_COUNT, talSomOrd } from '@/lib/cv/template-antal'

const PREMIUM_PRIS = `${paketKort()}, ${prisPeriod(SALD_PLAN)}`

export interface FaqItem {
  q: string
  a: string
}

export const JOBBCOACHEN_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Hur fungerar Jobbcoachen?',
    a: 'Du ställer en fråga om jobb, lön, intervju eller arbetsrätt och Jobbcoachen söker bland verifierade svenska källor som Arbetsförmedlingen, SCB och fackförbund. Du får ett kort, läsbart svar med klickbara källhänvisningar så du själv kan dubbelkolla. Inget mer googlande och gissa vilken sida som är seriös.',
  },
  {
    q: 'Var hittar jag tillförlitlig löneinformation i Sverige?',
    a: 'Jobbcoachen svarar utifrån en kunskapsbas om svensk arbetsmarknad där SCB:s lönestrukturstatistik och fackförbundens publicerade underlag ingår. Du får en bild av marknadslönen per yrke utan att behöva läsa rapporter på 80 sidor själv. Varje svar anger källa, så du vet var siffrorna kommer ifrån och kan kontrollera dem själv.',
  },
  {
    q: 'Kan jag få juridisk rådgivning här?',
    a: 'Nej. Jobbcoachen förklarar hur svensk arbetsrätt fungerar i praktiken (LAS, uppsägningstider, semesterregler, anställningsformer) och hänvisar till lagtext och officiella källor. Men vi ger inte juridisk rådgivning i enskilda ärenden. Står du inför en konflikt eller uppsägning rekommenderar vi att du kontaktar ditt fackförbund eller en jurist.',
  },
  {
    q: 'Vilka källor använder Jobbcoachen?',
    a: 'Vi använder verifierade svenska källor: Arbetsförmedlingen för regler och program, SCB för lönestatistik och arbetsmarknadsdata, fackförbund (Unionen, Kommunal, IF Metall m.fl.) för avtal och stöd, samt Försäkringskassan, CSN och Skatteverket för ersättningar och regler kring sjukdom, studier och skatt. Varje svar markeras med (Källa N) direkt i texten så du kan klicka dig vidare.',
  },
  {
    q: 'Hur ofta uppdateras informationen?',
    a: 'Kunskapsbasen är ett femtiotal dokument om svensk arbetsmarknad från Arbetsförmedlingen, SCB, fackförbund och myndigheter. Den uppdateras när vi gör en ny genomgång, inte automatiskt när en källa ändras. Därför anger varje svar sin källa, så att du kan kontrollera att siffran eller regeln fortfarande gäller innan du lutar dig mot den.',
  },
  {
    q: 'Är det gratis att använda Jobbcoachen?',
    a: `Ja. Du får tio meddelanden gratis på ditt konto, utan att lämna kortuppgifter, och de kommer inte tillbaka nästa dag. Vill du skriva fler än tio ingår Jobbcoachen utan tak i ${PREMIUM_PRIS}.`,
  },
  {
    q: 'Kan jag dela mitt CV med Jobbcoachen?',
    a: 'Ja. När du är inloggad kan du bifoga ett sparat CV eller personligt brev till en fråga. Jobbcoachen läser då innehållet och kan ge mer specifika råd, till exempel feedback på en formulering, förslag på vilka roller som passar din erfarenhet eller vad du bör ändra inför en specifik tjänst.',
  },
  {
    q: 'Vad händer när mina tio meddelanden är slut?',
    a: `Samtalet ligger kvar. Du kan läsa hela konversationen och kopiera ur den som vanligt, men du kan inte skriva fler meddelanden. Vill du fortsätta ingår Jobbcoachen utan tak i ${PREMIUM_PRIS}, och du plockar upp tråden exakt där du slutade. Väljer du att avstå fungerar resten av gratisnivån som förut: ${talSomOrd(FREE_TEMPLATE_COUNT)} CV-mallar, en CV-analys, ett personligt brev var sjunde dag och ${GRUNDNIVAN_ALLA_DAG}.`,
  },
]

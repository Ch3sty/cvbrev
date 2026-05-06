/**
 * FAQ-data for /verktyg/jobbcoachen landningssidan.
 * 8 fragor optimerade for long-tail-keywords kring "karriarradgivning",
 * "lonestatistik", "arbetsratt fragor" och "intervjutips".
 */

export interface FaqItem {
  q: string
  a: string
}

export const JOBBCOACHEN_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Hur fungerar Karriärguiden?',
    a: 'Du ställer en fråga om jobb, lön, intervju eller arbetsrätt och Karriärguiden söker bland verifierade svenska källor som Arbetsförmedlingen, SCB och fackförbund. Du får ett kort, läsbart svar med klickbara källhänvisningar så du själv kan dubbelkolla. Inget mer googlande och gissa vilken sida som är seriös.',
  },
  {
    q: 'Var hittar jag tillförlitlig löneinformation i Sverige?',
    a: 'Karriärguiden hämtar lönedata direkt från SCB:s officiella lönestrukturstatistik och från fackförbundens publicerade kollektivavtal. Det innebär att du får marknadslön per yrke, region och erfarenhetsnivå utan att behöva läsa rapporter på 80 sidor själv. Allt är källhänvisat så du vet exakt var siffrorna kommer ifrån.',
  },
  {
    q: 'Kan jag få juridisk rådgivning här?',
    a: 'Nej. Karriärguiden förklarar hur svensk arbetsrätt fungerar i praktiken (LAS, uppsägningstider, semesterregler, anställningsformer) och hänvisar till lagtext och officiella källor. Men vi ger inte juridisk rådgivning i enskilda ärenden. Står du inför en konflikt eller uppsägning rekommenderar vi att du kontaktar ditt fackförbund eller en jurist.',
  },
  {
    q: 'Vilka källor använder Karriärguiden?',
    a: 'Vi använder verifierade svenska källor: Arbetsförmedlingen för regler och program, SCB för lönestatistik och arbetsmarknadsdata, fackförbund (Unionen, Kommunal, IF Metall m.fl.) för avtal och stöd, samt Försäkringskassan, CSN och Skatteverket för ersättningar och regler kring sjukdom, studier och skatt. Varje svar markeras med (Källa N) inline så du kan klicka dig vidare.',
  },
  {
    q: 'Hur ofta uppdateras informationen?',
    a: 'Vår kunskapsbas uppdateras löpande när källmaterialet ändras. När SCB släpper ny lönestatistik eller när Arbetsförmedlingen uppdaterar regler för till exempel etableringsstöd så reflekteras det i svaren inom kort. Du ser också svarsdatum för varje konversation så du vet hur färsk informationen är.',
  },
  {
    q: 'Är det gratis att använda Karriärguiden?',
    a: 'Ja, du får 5 frågor gratis utan att lämna kortuppgifter. Vill du ställa fler frågor, spara dina samtal eller bifoga ditt CV uppgraderar du till Premium för 149 kr per månad. Du kan testa Premium gratis i sju dagar.',
  },
  {
    q: 'Kan jag dela mitt CV med Karriärguiden?',
    a: 'Ja. När du är inloggad kan du bifoga ett sparat CV eller personligt brev till en fråga. Karriärguiden läser då innehållet och kan ge mer specifika råd, till exempel feedback på en formulering, förslag på vilka roller som passar din erfarenhet eller vad du bör ändra inför en specifik tjänst.',
  },
  {
    q: 'Vad händer efter mina 5 gratis frågor?',
    a: 'När du nått din gratisgräns visas en uppgraderingsruta där du kan starta en gratis sjudagars provperiod på Premium. Hela din konversation sparas så du kan fortsätta exakt där du slutade. Vill du inte uppgradera kan du fortsätta använda andra gratis-funktioner som CV-byggaren och jobbmatchningen.',
  },
]

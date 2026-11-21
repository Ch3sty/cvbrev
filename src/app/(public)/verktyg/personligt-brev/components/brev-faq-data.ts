import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { BREV_GRATIS_NAMN, BREV_MALL_ANTAL, BREV_PREMIUM_ANTAL, BREV_WORD_ANTAL } from '@/components/publikt/brevmallar'

export const BREV_FAQ_ITEMS = [
  {
    q: 'Hur lång tid tar det att skapa ett brev?',
    a: 'Från start till färdigt brev tar det två till fyra minuter. Du laddar upp ditt CV (eller väljer ett du sparat), klistrar in jobbannonsen och väljer mall och ton. Vi sätter ihop brevet på några sekunder. Vill du justera något efteråt går det när som helst innan du skickar det.',
  },
  {
    q: 'Vad är skillnaden mot att skriva själv eller använda ChatGPT?',
    a: 'ChatGPT skriver generella brev, har ingen koll på svenska arbetsmarknaden och kräver att du skriver bra prompts. Vi är byggda specifikt för svenska jobbansökningar: vår tjänst läser annonsen som rekryterare i Sverige skriver dem, matchar mot ditt CV, och optimerar för ATS-systemen som filtrerar ansökningar.',
  },
  {
    q: 'Kan jag ladda ner brevet som Word-dokument?',
    a: `Ja, i ${BREV_WORD_ANTAL} av våra ${BREV_MALL_ANTAL} mallar. Alla mallar laddas ner som PDF, och ${BREV_WORD_ANTAL} av dem finns också som Word-fil (.docx), gratismallarna ${BREV_GRATIS_NAMN} inräknade. Nedladdningen ingår i ${paketKort()}, både som PDF och Word. Skicka helst PDF, då ser brevet likadant ut hos rekryteraren. Word väljer du när du vill ändra i filen själv eller när annonsen ber om ett redigerbart format.`,
  },
  {
    q: 'Hur många brev kan jag skapa gratis?',
    a: `Det första brevet är gratis, sedan skriver du ett nytt i veckan. Allt du skrivit ligger kvar att läsa och kopiera, även på gratisnivån. Vill du skriva utan tak och ladda ner breven som PDF och Word ingår det i ${paketKort()}, ${prisPeriod(SALD_PLAN)}.`,
  },
  {
    q: 'Kommer brevet att kännas som något vi alla skickat in?',
    a: 'Nej. Vår tjänst läser ditt specifika CV och varje annons separat, så två personer som söker samma jobb får olika brev. Du väljer också ton och mall, vilket ger ytterligare variation. Det är ditt brev, vi hjälper bara till med strukturen och språket.',
  },
  {
    q: 'Är det säkert att lämna mitt CV och era brev?',
    a: 'Ja. Vi följer GDPR, all data lagras i EU, vi säljer aldrig dina uppgifter vidare och tränar inga egna modeller på ditt CV eller dina brev. Du raderar kontot själv under Inställningar, och då tas allt ditt bort. Det enda som blir kvar är kvitton hos Stripe, som bokföringslagen kräver.',
  },
  {
    q: 'Vilken mall ska jag välja?',
    a: `Börja med den mall ditt CV har. Brevet skrivs i samma ${BREV_MALL_ANTAL} mallar som CV:t, och när brev och CV delar huvud, typsnitt och färg ser ansökan genomarbetad ut. ${BREV_GRATIS_NAMN} är gratis och räcker till de flesta ansökningar. Vill du ha det stramt och formellt passar en mall med seriffer. Vill du synas mer finns mallar med färgat huvud eller sidospalt. Du provar alla ${BREV_MALL_ANTAL} med ditt eget brev och byter utan att skriva om texten. De ${BREV_PREMIUM_ANTAL} som inte är gratis ingår i ${paketKort()}.`,
  },
  {
    q: 'Fungerar brevet för alla branscher?',
    a: 'Ja, från vården och offentlig sektor till tech och kreativa yrken. Fem toner och ' + BREV_MALL_ANTAL + ' mallar täcker spannet av svenska arbetsplatser. Med ' + paketKort() + ' väljer vi dessutom tonen åt dig: vi läser annonsens språk och bransch och skriver brevet i den ton arbetsgivaren själv använder.',
  },
]

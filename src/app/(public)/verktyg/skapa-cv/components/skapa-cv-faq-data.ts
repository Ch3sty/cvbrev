/**
 * FAQ-data for /verktyg/skapa-cv landningssidan.
 * 8 fragor optimerade for long-tail-keywords runt "skapa cv":
 * - "hur skapar jag ett cv"
 * - "ar det gratis att skapa cv online"
 * - "hur lang tid tar det att skapa ett cv"
 * - "behover jag ladda upp befintligt cv"
 * - "kan jag importera fran linkedin"
 * - "hur sparas mitt cv"
 * - "vilka format kan jag ladda ner cv i"
 * - "funkar cv-byggaren pa mobil"
 */

export interface FaqItem {
  q: string
  a: string
}

export const SKAPA_CV_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Hur skapar jag ett professionellt CV?',
    a: 'Med vår CV-byggare gör du det i sju enkla steg. Du börjar med kontaktuppgifter, fyller på med en kort sammanfattning, dina arbetslivserfarenheter, utbildningar, kompetenser och språk, och granskar slutligen resultatet. Hela tiden ser du en live-preview av CV:t som uppdateras medan du skriver. När du är nöjd väljer du en mall och laddar ner som PDF eller Word.',
  },
  {
    q: 'Är det gratis att skapa CV online hos er?',
    a: 'Ja. Du kan skapa CV gratis och ladda ner som både PDF och Word utan att lämna kortuppgifter. Två CV-mallar är helt gratis, och de räcker långt för de flesta ansökningar. Premium ger dig tillgång till alla mallar och fler funktioner men är aldrig nödvändigt för att få ett bra CV.',
  },
  {
    q: 'Hur lång tid tar det att skapa ett CV?',
    a: 'Tio till femton minuter om du har dina uppgifter framför dig. Vi guidar dig genom sju steg och alla fält är optionella efter de viktigaste. Vill du gå snabbare kan du importera från LinkedIn eller ladda upp ett befintligt CV som vi extraherar datan från åt dig.',
  },
  {
    q: 'Behöver jag ladda upp ett befintligt CV?',
    a: 'Nej. Du kan börja från ett tomt papper och fylla i allt själv. Men om du redan har ett CV i Word eller PDF kan du ladda upp det och vi extraherar all data automatiskt. Det sparar tid och du slipper skriva om allt manuellt.',
  },
  {
    q: 'Kan jag importera mina uppgifter från LinkedIn?',
    a: 'Ja. Vi har stöd för LinkedIn-import som hämtar din profil, erfarenhet, utbildning och kompetenser direkt. Det är ett snabbt sätt att komma igång om din LinkedIn redan är uppdaterad.',
  },
  {
    q: 'Hur sparas mitt CV medan jag bygger det?',
    a: 'Vi sparar automatiskt allt du fyller i medan du jobbar. Du kan stänga fliken mitt i ett steg och fortsätta senare där du slutade. När du är klar och har laddat ner CV:t finns det också kvar i ditt konto för framtida redigering.',
  },
  {
    q: 'Vilka format kan jag ladda ner CV:t i?',
    a: 'Både PDF och Word (.docx) ingår alltid. PDF är det vanligaste och fungerar perfekt med ATS-system och rekryterares verktyg. Word är användbart om du vill göra egna ändringar i Office, eller om annonsen specifikt frågar efter ett editerbart format.',
  },
  {
    q: 'Funkar CV-byggaren på mobilen?',
    a: 'Ja. Hela byggprocessen är mobile-first och fungerar lika smidigt på telefonen som på datorn. Du kan börja på telefonen i bussen och fortsätta hemma framför datorn, allt syncas mellan enheter.',
  },
]

/**
 * FAQ-data for /verktyg/cv-analys.
 * 9 fragor som tillsammans gor en stark FAQPage-rich-snippet i Google.
 */

import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { FREE_CV_EXPORTS, FREE_TEMPLATE_COUNT, TEMPLATE_COUNT, WORD_TEMPLATE_COUNT, talSomOrd } from '@/lib/cv/template-antal'
import { storForst, talOrd } from '@/components/publikt/talord'

export interface FaqItem {
  q: string
  a: string
}

export const CV_ANALYS_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Hur lång tid tar en CV-analys?',
    a: 'Här på sidan, utan konto, får du läsbarhetspoängen och det viktigaste att ändra inom en halv minut från att du valt filen. I kontot står poängen och genomgången i sju delar klara så snart ditt CV är inläst, och de räknas om varje gång du sparar. Vill du ha Jobbcoachens förslag på nya formuleringar hämtar du dem med ett tryck, och det tar under en minut. Du behöver inte göra något under tiden.',
  },
  {
    q: 'Vad betyder läsbarhetspoängen?',
    a: 'Läsbarhetspoängen är ett tal från 0 till 100 som visar hur lätt ditt CV är att läsa för en rekryterare och för rekryteringssystem (ATS), de system svenska arbetsgivare sorterar ansökningar i. Vi räknar den ur det som står i CV:t, i sju delar: kontaktuppgifter, personbeskrivning, erfarenhet, kompetenser, utbildning, språk och till sist datum, ordning och längd. Bredvid poängen ser du hur många poäng som återstår till 100, i vilka delar de sitter och hur långt Jobbcoachens förslag tar dig.',
  },
  {
    q: 'Vilka förbättringsförslag får jag?',
    a: 'Jobbcoachen skriver förslag på nya formuleringar i de delar där du tappar poäng. Personbeskrivning: din öppning, omskriven så att den säger vilken roll du har och vad du kan. Erfarenhet: rollerna med punkter som börjar med vad du gjorde, och plats för din egen siffra där ett resultat saknas. Kompetenser: termer du kan lägga till om de stämmer. Du ser din nuvarande text och förslaget bredvid varandra, och hur många poäng förslaget ger. Det ingen kan skriva åt dig, som ett telefonnummer, ett årtal eller en språknivå, står i genomgången med var du fyller i det.',
  },
  {
    q: 'Behöver jag ha CV:t på svenska?',
    a: 'Analysen är byggd för svenska CV och svensk arbetsmarknad, och Jobbcoachens förslag kommer på svenska. Har du ett engelskt CV går det att ladda upp som Word eller som PDF med markerbar text, men räkna med att förslagen blir på svenska. Är CV:t inskannat, alltså sparat som bild, läser vi bara av svensk text. Svenska arbetsgivare föredrar oftast ansökningar på svenska om jobbet inte är uttalat internationellt.',
  },
  {
    q: 'Vad är gratis i CV-analysen?',
    a: 'Läsbarhetspoängen och genomgången i sju delar är gratis för varje CV du sparar, utan att du lämnar kortuppgifter. Jobbcoachens förslag hämtar du en gång gratis per konto, och då är det tyngsta förslaget öppet. Alla förslag, och nya förslag när du har ändrat i CV:t, ingår i ' + paketKort() + ', ' + prisPeriod(SALD_PLAN) + '.',
  },
  {
    q: 'Räknas poängen om när jag ändrar i CV:t?',
    a: 'Ja. Poängen räknas om varje gång du sparar CV:t, gratis och utan gräns, så du ser direkt om ändringen gjorde skillnad. Det är användbart när du testar olika formuleringar, lägger till en siffra i en roll eller byter ordning på avsnitten. Med ' + paketKort() + ' kan du dessutom be Jobbcoachen om nya förslag efter ändringen, så ofta du vill.',
  },
  {
    q: 'Kan jag ladda upp ett inskannat CV som PDF?',
    a: 'Ja, när du är inloggad. Då läser vi av bilden och gör om den till text, och det tar ungefär en halv minut. Bildläsningen läser svenska. Här på sidan, utan konto, kan vi inte läsa en inskannad PDF. Ladda då upp en PDF med markerbar text eller en Word-fil, eller skapa ett gratiskonto.',
  },
  {
    q: 'Är mitt CV säkert hos er?',
    a: 'Ja. Vi säljer inte dina uppgifter och tränar inga egna AI-modeller på ditt CV. CV-filen och texten lagras i EU, i Irland, i en lagring som bara ditt konto når. Innan text ur CV:t går till Googles AI-tjänst byter vi ut namn, e-postadress och telefonnummer. Du raderar kontot själv under Inställningar, och då tar vi bort allt du har sparat hos oss, också filerna. Kvitton finns kvar hos Stripe i sju år, som bokföringslagen kräver.',
  },
  {
    q: 'Vad händer efter analysen?',
    a: `Du ser poängen, vad som saknas i varje del och hur många poäng som återstår till 100. Därifrån öppnar du CV:t och fyller i det som saknas, eller hämtar Jobbcoachens förslag och väljer vilka som ska följa med. Poängen räknas om när du sparar. När du är nöjd väljer du en av ${TEMPLATE_COUNT} mallar och laddar ner CV:t som PDF, eller som Word i ${WORD_TEMPLATE_COUNT} av mallarna. ${storForst(talSomOrd(FREE_TEMPLATE_COUNT))} mallar och ${talOrd(FREE_CV_EXPORTS)} nedladdning är gratis.`,
  },
]

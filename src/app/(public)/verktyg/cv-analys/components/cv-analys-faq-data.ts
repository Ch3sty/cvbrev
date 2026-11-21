/**
 * FAQ-data for /verktyg/cv-analys.
 * 8 fragor som tillsammans gor en stark FAQPage-rich-snippet i Google.
 */

import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'

export interface FaqItem {
  q: string
  a: string
}

export const CV_ANALYS_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Hur lång tid tar en CV-analys?',
    a: 'Mellan 30 och 60 sekunder från att du klickat på "Analysera". Vi läser igenom hela CV:t, kontrollerar struktur, språk, nyckelord och kvantifiering, och visar en läsbarhetspoäng plus konkreta förbättringsförslag direkt på skärmen. Du behöver inte göra något under tiden, bara vänta in resultatet.',
  },
  {
    q: 'Vad betyder ATS-poängen?',
    a: 'ATS-poängen är ett mått från 0 till 100 på hur väl ditt CV fungerar med Applicant Tracking Systems, de rekryteringssystem svenska arbetsgivare använder för att sålla bland ansökningar. Poängen är vår samlade bedömning av struktur, läsbarhet, nyckelord och formatering. Bredvid den ser du vad poängen kan bli om du följer förslagen, så du vet hur mycket det finns att hämta.',
  },
  {
    q: 'Vilka förbättringsförslag får jag?',
    a: 'Förslagen kommer i fyra delar. Personbeskrivning: din öppning, omskriven så att den säger vad du kan. Roller: varje erfarenhet med resultat och siffror i stället för bara ansvar. Kompetenser: det som saknas eller borde stå tydligare. Allmänna råd: struktur, formatering, innehåll och nyckelord som rekryteringssystemen letar efter, sådant du ändrar själv. För varje förslag på personbeskrivning och roller ser du den nuvarande texten och en föreslagen omskrivning, och de tyngsta fynden står först.',
  },
  {
    q: 'Behöver jag ha CV:t på svenska?',
    a: 'Analysen är byggd för svenska CV och svensk arbetsmarknad: förslagen, nyckelorden och omskrivningarna kommer på svenska. Har du ett engelskt CV går det att ladda upp, men räkna med att förslagen blir på svenska. Svenska arbetsgivare föredrar oftast ansökningar på svenska om jobbet inte är uttalat internationellt.',
  },
  {
    q: 'Hur många analyser får jag göra gratis?',
    a: 'En analys per konto är gratis, utan att du lämnar kortuppgifter. Du ser läsbarhetspoängen, hur många fynd vi hittade och det tyngsta fyndet i klartext med åtgärd. Vill du se alla fynd och köra om analysen efter en rättning ingår det i ' + paketKort() + ', ' + prisPeriod(SALD_PLAN) + '.',
  },
  {
    q: 'Kan jag köra analysen igen när jag ändrat i CV:t?',
    a: 'Ja. Med ' + paketKort() + ' kör du analysen utan tak, så du kan rätta efter fynden, ladda upp igen och se om poängen rör sig. Det är användbart när du testar olika rubriker, byter ordningsföljd eller skräddarsyr CV:t för en specifik bransch och vill veta om ändringen gjorde skillnad.',
  },
  {
    q: 'Är mitt CV säkert hos er?',
    a: 'Ja. Vi följer GDPR, all data lagras i EU, vi säljer aldrig dina uppgifter vidare och tränar inga egna modeller på ditt CV. CV-filerna ligger i en privat lagring som bara du kommer åt. Du raderar kontot själv under Inställningar, och då tas allt ditt bort. Det enda som blir kvar är kvitton hos Stripe, som bokföringslagen kräver.',
  },
  {
    q: 'Vad händer efter analysen?',
    a: 'Du får upp resultatet direkt och kan välja vilka förslag du vill applicera. Klickar du i en förbättring uppdateras potentialpoängen i realtid så du ser exakt hur mycket bättre CV:t blir. När du är nöjd kan du spara den förbättrade versionen och ladda ner den som PDF.',
  },
]

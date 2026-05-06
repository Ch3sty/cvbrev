/**
 * FAQ-data for /verktyg/cv-analys.
 * 8 fragor som tillsammans gor en stark FAQPage-rich-snippet i Google.
 */

export interface FaqItem {
  q: string
  a: string
}

export const CV_ANALYS_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Hur lång tid tar en CV-analys?',
    a: 'Mellan 30 och 60 sekunder från att du klickat på "Analysera". Vi läser igenom hela CV:t, kontrollerar struktur, språk, nyckelord och kvantifiering, och returnerar en ATS-poäng samt konkreta förbättringsförslag i sex kategorier. Du behöver inte vänta vid skärmen, du får ett mejl när analysen är klar.',
  },
  {
    q: 'Vad betyder ATS-poängen?',
    a: 'ATS-poängen är ett mått från 0 till 100 på hur väl ditt CV fungerar med Applicant Tracking Systems som svenska arbetsgivare använder för att sålla bland ansökningar. 70 och uppåt betyder goda chanser att passera, 80 är mycket bra, 90 är toppnivå. Vi testar mot strukturkrav, läsbarhet, nyckelords-täckning och formatering.',
  },
  {
    q: 'Vilka förbättringsförslag får jag?',
    a: 'Du får förslag inom sex kategorier: ATS-kompatibilitet (rubriker, formatering), Struktur (avsnittslängd, ordningsföljd), Språk och grammatik (aktiva verb, svammelord, tonläge), Nyckelord (branschtermer som saknas), Kvantifiering (siffror och resultat) samt Profil och styrkor (öppningsbeskrivning, personliga styrkor). För varje punkt ser du den nuvarande texten, en föreslagen omskrivning och hur många poäng den ger.',
  },
  {
    q: 'Behöver jag ha CV:t på svenska?',
    a: 'Vi stöder både svenska och engelska CV. Analysen anpassar sig automatiskt till språket och kontrollerar grammatik, vokabulär och stil mot rätt språkmodell. Tänk på att svenska arbetsgivare oftast föredrar ansökningar på svenska om jobbet inte är uttalat internationellt.',
  },
  {
    q: 'Hur många analyser får jag göra gratis?',
    a: 'En CV-analys per vecka är gratis utan att du behöver ange kortuppgifter. Räkningen nollställs sju dagar efter första användningen. Behöver du fler analyser, till exempel för att jämföra olika versioner inför en specifik ansökan, ger Premium dig obegränsade analyser för 149 kr per månad.',
  },
  {
    q: 'Kan jag jämföra olika versioner av mitt CV?',
    a: 'Ja. Premium-användare kan spara obegränsat antal CV-versioner och se ATS-poängen sida vid sida. Det är användbart när du testar olika rubriker, byter ordningsföljd eller skräddarsyr CV:t för en specifik bransch och vill veta vilken version som faktiskt presterar bäst.',
  },
  {
    q: 'Är mitt CV säkert hos er?',
    a: 'Ja. All data lagras i EU enligt GDPR, vi säljer aldrig din information vidare och vi använder inte ditt CV för att träna någon modell. Du kan radera kontot med ett klick och då försvinner allt, även våra kopior.',
  },
  {
    q: 'Vad händer efter analysen?',
    a: 'Du får upp resultatet direkt och kan välja vilka förslag du vill applicera. Klickar du i en förbättring uppdateras potentialpoängen i realtid så du ser exakt hur mycket bättre CV:t blir. När du är nöjd kan du spara den förbättrade versionen och ladda ner den som PDF eller Word.',
  },
]

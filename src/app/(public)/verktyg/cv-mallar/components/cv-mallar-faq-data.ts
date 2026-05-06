/**
 * FAQ-data for /verktyg/cv-mallar.
 * 8 fragor for stark FAQPage-rich-snippet i Google.
 * INGA hardcodade antal mallar - mallarna ar dynamiska.
 */

export interface FaqItem {
  q: string
  a: string
}

export const CV_MALLAR_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Är CV-mallarna ATS-säkra?',
    a: 'Ja. Alla våra mallar är skrivna med svenska Applicant Tracking Systems i åtanke. Vi använder rena rubriker, vanlig text utan komplicerad formattering och ett strukturerat upplägg som ATS-systemen läser utan problem. Det betyder att din ansökan kommer fram till rekryteraren och inte filtreras bort på vägen.',
  },
  {
    q: 'Kan jag ladda ner mitt CV som PDF eller Word?',
    a: 'Ja, både PDF och Word (.docx). PDF är vanligast och fungerar perfekt med ATS-system. Word är användbart om du vill göra egna ändringar i Office, eller om annonsen specifikt frågar efter ett editerbart format.',
  },
  {
    q: 'Vilken mall passar bäst för mitt yrke?',
    a: 'Modern stil passar tech, design, marknadsföring och konsultroller. Traditionell stil passar bank, juridik, vård och offentlig sektor. Kreativ stil passar reklam, media och kreativa yrken. Du kan också byta mall efteråt utan att behöva fylla i din data igen, vi flyttar allt åt dig.',
  },
  {
    q: 'Vad är skillnaden på gratis och premium-mallarna?',
    a: 'Gratis-mallarna räcker långt för de flesta ansökningar och innehåller alla grundfunktioner. Premium-mallar har mer polerad design, fler features som fotosupport och LinkedIn-integration, samt två-kolumns-layout för CV:n med mer innehåll. Premium ingår i månadsabonnemanget.',
  },
  {
    q: 'Kan jag redigera CV:t senare?',
    a: 'Ja. Allt du fyller i sparas i ditt konto och du kan när som helst gå tillbaka, redigera och ladda ner en ny version. Du kan också byta mall utan att förlora din data.',
  },
  {
    q: 'Stödjer mallarna profilbild?',
    a: 'Vissa premium-mallar stödjer foto. Det är en designfråga snarare än något ATS-systemet bryr sig om. I Sverige värderas innehållet alltid mer än utseendet, men en professionell bild kan ge en mänsklig touch i mallar där det är inbyggt.',
  },
  {
    q: 'Kan jag använda mallen för internationella ansökningar?',
    a: 'Ja. Mallarna är språkneutrala, så du kan fylla i dem på engelska och få en professionell layout som fungerar både i Sverige och utomlands. Tänk på att vissa länder har egna konventioner: i USA är ett CV oftast en sida, i Tyskland väntas oftast ett "Lebenslauf" med foto.',
  },
  {
    q: 'Är mallarna mobile-friendly när jag bygger CV:t?',
    a: 'Ja. Hela byggprocessen funkar lika bra på mobil som på dator. Du kan börja på telefonen i bussen och fortsätta hemma framför datorn. Den färdiga PDF:en är formaterad för utskrift och digital läsning oavsett enhet.',
  },
]

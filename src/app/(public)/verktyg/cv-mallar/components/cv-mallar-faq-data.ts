/**
 * FAQ-data for /verktyg/cv-mallar.
 * 8 fragor for stark FAQPage-rich-snippet i Google.
 * INGA hardcodade antal mallar - mallarna ar dynamiska.
 */

import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { WORD_TEMPLATE_COUNT_ORD, wordMallarSomText } from '@/lib/cv/template-antal'

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
    a: `Alla mallar laddas ner som PDF, och ${WORD_TEMPLATE_COUNT_ORD} av dem finns också som Word-fil (.docx). PDF är vanligast och läses rätt av rekryteringssystemen. Word väljer du när du vill ändra i filen själv efteråt, eller när annonsen ber om ett redigerbart format. Word-filen ingår i ${paketKort()}.`,
  },
  {
    q: 'Vilka mallar finns som Word?',
    a: `${wordMallarSomText()}. Alla ${WORD_TEMPLATE_COUNT_ORD} är enspaltiga och läses rätt av rekryteringssystemen, och de är märkta Word i mallväljaren. Övriga mallar laddas ner som PDF.`,
  },
  {
    q: 'Vilken mall passar bäst för mitt yrke?',
    a: 'Modern stil passar tech, design, marknadsföring och konsultroller. Traditionell stil passar bank, juridik, vård och offentlig sektor. Kreativ stil passar reklam, media och kreativa yrken. Du kan också byta mall efteråt utan att behöva fylla i din data igen, vi flyttar allt åt dig.',
  },
  {
    q: 'Vad är skillnaden på gratis och premium-mallarna?',
    a: `De fria mallarna räcker långt för de flesta ansökningar och innehåller alla grundfunktioner. Övriga mallar har mer genomarbetad design, stöd för foto och LinkedIn, och tvåspaltig layout för CV:n med mer innehåll. Alla mallar ingår i ${paketKort()}, ${prisPeriod(SALD_PLAN)}.`,
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
    q: 'Är mallarna mobilanpassade när jag bygger CV:t?',
    a: 'Ja. Hela byggprocessen funkar lika bra på mobil som på dator. Du kan börja på telefonen i bussen och fortsätta hemma framför datorn. Den färdiga PDF:en är formaterad för utskrift och digital läsning oavsett enhet.',
  },
]

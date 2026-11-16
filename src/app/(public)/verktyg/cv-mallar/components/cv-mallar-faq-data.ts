/**
 * FAQ-data for /verktyg/cv-mallar.
 * 9 fragor for stark FAQPage-rich-snippet i Google.
 * INGA hardcodade antal mallar eller mallnamn: allt laser katalogen
 * (src/lib/cv/mallar/katalog.ts). Texterna skrivna om for mallutbudet
 * 2026-11-16 (svensk-ux-copywriter, SEO-strategen).
 */

import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { WORD_TEMPLATE_COUNT_ORD, talSomOrd, wordMallarSomText } from '@/lib/cv/template-antal'
import { MALL_ANTAL, MALL_KATALOG } from '@/lib/cv/mallar/katalog'

export interface FaqItem {
  q: string
  a: string
}

const versal = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
const uppraknat = (n: string[]) => (n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} och ${n[n.length - 1]}`)
const GRATIS_NAMN = uppraknat(MALL_KATALOG.filter((m) => m.niva === 'gratis').map((m) => m.namn))
const FOTO_ANTAL = MALL_KATALOG.filter((m) => m.foto).length
const FOTO_GRATIS = MALL_KATALOG.filter((m) => m.foto && m.niva === 'gratis').length

export const CV_MALLAR_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Är CV-mallarna ATS-säkra?',
    a: 'Ja, och vi har testat det i stället för att bara lova det. Varje mall går genom vår egen CV-läsare, samma slags läsning som rekryteringssystemen (ATS, Applicant Tracking Systems) gör, med korta och långa CV och olika ordning på avsnitten. Namn, kontaktuppgifter, rubriker och ordning ska komma ut rätt, annars tar vi inte med mallen. Det gäller också mallarna med sidospalt. Grundrubrikerna är de svenska standardrubrikerna, och texten är vanlig text utan tabeller eller textrutor, så det du skrev är det rekryteraren ser.',
  },
  {
    q: 'Kan jag ladda ner mitt CV som PDF eller Word?',
    a: `Ja, båda. Alla mallar laddas ner som PDF, och ${WORD_TEMPLATE_COUNT_ORD} av dem finns också som Word-fil (.docx). I gratismallarna ${GRATIS_NAMN} är Word lika gratis som PDF: du väljer format när du hämtar din gratisfil. Word i de övriga Word-mallarna ingår i ${paketKort()}. PDF är vanligast och läses rätt av rekryteringssystemen. Word väljer du när du vill ändra i filen själv efteråt, eller när annonsen ber om ett redigerbart format.`,
  },
  {
    q: 'Vilka mallar finns som Word?',
    a: `${wordMallarSomText()}. De är märkta Word i mallväljaren. Bland dem finns mallar i en spalt, mallar med sidospalt och mallar med rubrikerna eller årtalen i marginalen, och alla ${WORD_TEMPLATE_COUNT_ORD} har gått genom vår läsning av själva Word-filen innan de kom med. ${GRATIS_NAMN} hämtar du som Word gratis, de andra Word-mallarna ingår i ${paketKort()}. Övriga mallar laddas ner som PDF.`,
  },
  {
    q: 'Vilken mall passar bäst för mitt yrke?',
    a: 'Alla. Mallarna heter efter stil, inte efter yrke, och var och en passar vilket yrke som helst. Det som skiljer dem är formen: en spalt, sidospalt, rubriker i marginalen eller en konstnärlig layout. Yrket lägger du i rubrikerna i stället. Välj en rubrikuppsättning för din bransch, som vård och omsorg, bygg och hantverk eller skola och förskola, så får avsnitten namn som "Klinisk erfarenhet" eller "Behörigheter och körkort", och legitimationer får ett eget avsnitt. Du kan också skriva egna rubriker. Byt mall när du vill, innehållet följer med.',
  },
  {
    q: 'Vad är skillnaden mellan gratismallarna och mallarna i Premium?',
    a: `Gratismallarna ${GRATIS_NAMN} laddar du ner som PDF eller Word, en fil per konto, utan kortuppgift. De är fullständiga mallar med samma färger, typsnitt och rubrikuppsättningar som de övriga${FOTO_GRATIS ? `, och ${talSomOrd(FOTO_GRATIS)} av dem har plats för foto` : ''}. I ${paketKort()} får du alla ${MALL_ANTAL} mallar, bland dem sidospalterna och de konstnärliga, nedladdning utan tak och Word-filen i alla ${WORD_TEMPLATE_COUNT_ORD} Word-mallar. Priset är ${prisPeriod(SALD_PLAN)}.`,
  },
  {
    q: 'Kan jag redigera CV:t senare?',
    a: 'Ja. Allt du fyller i sparas i ditt konto och du kan när som helst gå tillbaka, redigera och ladda ner en ny version. Du kan också byta mall utan att förlora din data.',
  },
  {
    q: 'Stödjer mallarna profilbild?',
    a: `Ja, ${talSomOrd(FOTO_ANTAL)} av mallarna har en fotoplats${FOTO_GRATIS ? `, och ${talSomOrd(FOTO_GRATIS)} av dem är gratis` : ''}. Du slår på eller av fotot i mallväljaren, så du kan skicka samma CV med bild till en arbetsgivare och utan till en annan. Rekryteringssystemet läser texten oavsett. I Sverige väger innehållet alltid tyngre än bilden, men i service, vård och pedagogik är ett foto vanligt, i juridik och akademi ovanligt.`,
  },
  {
    q: 'Kan jag använda mallen för internationella ansökningar?',
    a: 'Ja. Mallarna är språkneutrala, så du kan fylla i dem på engelska och få en professionell layout som fungerar både i Sverige och utomlands. Tänk på att vissa länder har egna konventioner: i USA är ett CV oftast en sida, i Tyskland väntas oftast ett "Lebenslauf" med foto.',
  },
  {
    q: 'Är mallarna mobilanpassade när jag bygger CV:t?',
    a: 'Ja. Hela byggprocessen fungerar lika bra på mobil som på dator. Du kan börja på telefonen i bussen och fortsätta hemma framför datorn. Den färdiga PDF:en är formaterad för utskrift och digital läsning oavsett enhet.',
  },
]

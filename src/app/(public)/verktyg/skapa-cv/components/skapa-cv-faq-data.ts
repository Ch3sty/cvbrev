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

import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { TEMPLATE_COUNT, WORD_TEMPLATE_COUNT, WORD_TEMPLATE_COUNT_ORD, talSomOrd } from '@/lib/cv/template-antal'
import { FREE_CV_BYGG_AI_PER_ACCOUNT } from '@/lib/quota/quotaService'
import { GRATIS_MALL_IDS, getMallKort } from '@/lib/cv/mallar/katalog'

/** Gratismallarnas namn ur katalogen: "Linne och Björk". */
const GRATIS_NAMN = (() => {
  const n = GRATIS_MALL_IDS.map((id) => getMallKort(id)?.namn ?? id)
  return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} och ${n[n.length - 1]}`
})()
const GRATIS_ORD = talSomOrd(GRATIS_MALL_IDS.length)

export interface FaqItem {
  q: string
  a: string
}

export const SKAPA_CV_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Hur skapar jag ett professionellt CV?',
    // SEO-svepet 2026-11-17 (B1): svaret beskriver nya byggaren, direkt på arket.
    a: `Skriv vilket jobb du söker, så får avsnitten rubriker och exempeltext för yrket. Ladda sedan upp ett CV du har, så fyller vi i avsnitten, eller skriv från början. Du fyller i direkt på arket i den mall du valt, och när du kommer till ett jobb kan Jobbcoachen föreslå punkterna; ${talSomOrd(FREE_CV_BYGG_AI_PER_ACCOUNT)} förslag ingår gratis på ditt konto. Till sist väljer du mall och laddar ner som PDF, eller som Word i de ${WORD_TEMPLATE_COUNT} Word-mallarna.`,
  },
  {
    q: 'Är det gratis att skapa CV online hos er?',
    a: `Ja. Du bygger ditt CV och laddar ner det en gång, som PDF eller som Word, utan att lämna kortuppgifter. ${GRATIS_ORD.charAt(0).toUpperCase() + GRATIS_ORD.slice(1)} av mallarna, ${GRATIS_NAMN}, är gratis, och de räcker långt för de flesta ansökningar. Vill du ha alla ${TEMPLATE_COUNT} mallar, ladda ner utan tak och hämta Word-filen i ${WORD_TEMPLATE_COUNT_ORD} av mallarna ingår det i ${paketKort()}, ${prisPeriod(SALD_PLAN)}.`,
  },
  {
    q: 'Hur lång tid tar det att skapa ett CV?',
    a: 'Det beror på hur mycket du har att skriva. Har du ett CV sedan tidigare laddar du upp det, så fyller vi i avsnitten och du putsar bara. Börjar du från början leder byggaren dig avsnitt för avsnitt, och Jobbcoachen kan föreslå punkterna.',
  },
  {
    q: 'Behöver jag ladda upp ett befintligt CV?',
    a: 'Nej. Du kan börja från ett tomt papper och fylla i allt själv. Men om du redan har ett CV i Word eller PDF kan du ladda upp det och vi extraherar all data automatiskt. Det sparar tid och du slipper skriva om allt manuellt.',
  },
  {
    q: 'Kan jag importera mina uppgifter från LinkedIn?',
    a: 'Inte direkt från LinkedIn, men nästan. Spara din LinkedIn-profil som PDF (knappen Mer, Spara som PDF på din profilsida) och ladda upp den som vilket CV som helst, så läser vi ut roller, utbildning och kompetenser. Har du ' + paketKort() + ' kan LinkedIn-optimeringen dessutom spara sitt resultat som ett nytt CV.',
  },
  {
    q: 'Hur sparas mitt CV medan jag bygger det?',
    // Lagringsundantaget (ägarens besked 2026-11-17): hur nya byggaren sparar,
    // kontrollerat i ByggareClient.tsx (sparaServer). Inget om var data lagras.
    a: 'CV:t sparas i ditt konto när du har sparat första avsnittet, och därefter efter varje avsnitt du fyller i. Du kan stänga sidan när du vill och fortsätta där du slutade under Ditt CV, på vilken enhet som helst.',
  },
  {
    q: 'Vilka format kan jag ladda ner CV:t i?',
    a: `Alla mallar laddas ner som PDF, och ${WORD_TEMPLATE_COUNT_ORD} av dem finns också som Word-fil (.docx). PDF är det vanligaste och läses rätt av rekryteringssystem och rekryterares verktyg. Word väljer du när du vill ändra i filen själv efteråt, eller när annonsen ber om ett redigerbart format. I gratismallarna ${GRATIS_NAMN} är Word gratis, precis som PDF. Word i de övriga Word-mallarna ingår i ${paketKort()}.`,
  },
  {
    q: 'Funkar CV-byggaren på mobilen?',
    a: 'Ja. Hela byggaren är gjord för mobilen först och fungerar lika smidigt på telefonen som på datorn. Bygg klart och spara i telefonen, så ligger CV:t i ditt konto och går att öppna, redigera och ladda ner från datorn.',
  },
]

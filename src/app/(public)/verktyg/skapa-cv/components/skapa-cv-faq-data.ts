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
import { TEMPLATE_COUNT, WORD_TEMPLATE_COUNT_ORD, talSomOrd } from '@/lib/cv/template-antal'
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
    a: `Med vår CV-byggare gör du det i sju enkla steg. Du börjar med kontaktuppgifter, fyller på med en kort sammanfattning, dina arbetslivserfarenheter, utbildningar, kompetenser och språk, och granskar slutligen resultatet. Hela tiden ser du en förhandsvisning av CV:t som uppdateras medan du skriver. När du är nöjd väljer du en mall och laddar ner som PDF, eller som Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna.`,
  },
  {
    q: 'Är det gratis att skapa CV online hos er?',
    a: `Ja. Du bygger ditt CV och laddar ner det som PDF en gång utan att lämna kortuppgifter. ${GRATIS_ORD.charAt(0).toUpperCase() + GRATIS_ORD.slice(1)} av mallarna, ${GRATIS_NAMN}, är gratis, och de räcker långt för de flesta ansökningar. Vill du ha alla ${TEMPLATE_COUNT} mallar, ladda ner utan tak och hämta Word-filen i ${WORD_TEMPLATE_COUNT_ORD} av mallarna ingår det i ${paketKort()}, ${prisPeriod(SALD_PLAN)}.`,
  },
  {
    q: 'Hur lång tid tar det att skapa ett CV?',
    a: 'Tio till femton minuter om du har dina uppgifter framför dig. Vi guidar dig genom sju steg och alla fält är optionella efter de viktigaste. Vill du gå snabbare laddar du upp ett befintligt CV, eller en PDF av din LinkedIn-profil, så läser vi ut uppgifterna åt dig.',
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
    a: 'Medan du bygger ligger utkastet i din webbläsare. Du kan stänga fliken mitt i ett steg och fortsätta där du slutade, så länge du använder samma webbläsare. I sista steget sparar du CV:t i ditt konto, och då finns det kvar för redigering och nedladdning från vilken enhet du vill.',
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

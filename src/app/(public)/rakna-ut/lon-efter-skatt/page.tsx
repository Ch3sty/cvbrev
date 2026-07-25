import type { Metadata } from 'next'
import RaknaUtSida from '@/components/rakna/RaknaUtSida'
import LonEfterSkatt from '@/components/rakna/LonEfterSkatt'

export const metadata: Metadata = {
  title: 'Räkna ut lön efter skatt 2026: nettolön i din kommun',
  description:
    'Räkna ut din lön efter skatt med Skatteverkets skattetabeller 2026 och din kommuns faktiska skattesats. Jämför två löner eller kommuner och se skillnaden per år.',
  alternates: { canonical: 'https://www.jobbcoach.ai/rakna-ut/lon-efter-skatt' },
  openGraph: { images: ['https://www.jobbcoach.ai/images/rakna-ut.webp'] },
}

const faq = [
  {
    q: 'Hur räknas lön efter skatt ut?',
    a: 'Arbetsgivaren drar preliminärskatt enligt Skatteverkets skattetabell för din kommun. Tabellen bygger på kommunalskatt och regionskatt, begravningsavgift, eventuell kyrkoavgift, samt grundavdrag, jobbskatteavdrag och statlig inkomstskatt över skiktgränsen. Kalkylatorn slår upp din lön direkt i 2026 års tabeller i stället för att approximera med formler.',
  },
  {
    q: 'Vilken skattetabell tillhör jag?',
    a: 'Tabellnumret är summan av skattesatserna där du är folkbokförd, avrundad till hel procent. I Stockholm 2026 är summan 30,69 procent utan kyrkoavgift, vilket ger tabell 31, och cirka 31,6 procent för medlemmar i Svenska kyrkan, vilket ger tabell 32. Kalkylatorn väljer tabell automatiskt när du väljer kommun.',
  },
  {
    q: 'När betalar man statlig inkomstskatt 2026?',
    a: 'Statlig inkomstskatt på 20 procent tas ut på beskattningsbar förvärvsinkomst över skiktgränsen 643 000 kronor. Räknat före grundavdrag motsvarar det en brytpunkt på cirka 660 400 kronor om året, ungefär 55 000 kronor i månaden, för den som inte fyllt 66 år.',
  },
  {
    q: 'Varför skiljer sig lönen efter skatt mellan kommuner?',
    a: 'Kommunalskatten och regionskatten bestäms lokalt och varierar 2026 från 28,93 procent i Österåker till 35,65 procent i Dorotea, med ett riksgenomsnitt på 32,38 procent. På en månadslön runt 35 000 kronor kan skillnaden mellan Sveriges lägsta och högsta skattesats motsvara flera hundralappar i månaden.',
  },
  {
    q: 'Är beloppet min slutliga skatt?',
    a: 'Nej, det är arbetsgivarens preliminärskatteavdrag enligt tabell. Den slutliga skatten avgörs i deklarationen och kan påverkas av avdrag, flera arbetsgivare, ränteinkomster med mera. För de flesta med en anställning och en inkomst ligger tabellavdraget dock mycket nära den slutliga skatten.',
  },
  {
    q: 'Blev skatten lägre 2026?',
    a: 'Ja, för de flesta löntagare. Jobbskatteavdraget förstärktes i 2026 års budget med som mest omkring 400 kronor i månaden, och avtrappningen av avdraget vid höga inkomster slopades. Effekten ligger redan inbakad i 2026 års skattetabeller som kalkylatorn använder.',
  },
]

const kallor = [
  { text: 'Skatteverkets skattetabeller för månadslön 2026', href: 'https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattetabeller' },
  { text: 'Skatteverkets öppna data över kommunala skattesatser', href: 'https://www.skatteverket.se/omoss/apierochoppnadata' },
  { text: 'SCB om kommunalskatterna 2026', href: 'https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/statistiknyhet/kommunalskatterna-2026/' },
]

const relaterade = [
  { text: 'Löneförhandling och lönesamtal: så höjer du lönen', href: '/artiklar/loneforhandling' },
  { text: 'Löneanspråk på intervjun: så svarar du rätt', href: '/artiklar/loneansprak-intervju' },
  { text: 'Vad är en löneförhandling värd över tid?', href: '/rakna-ut/loneforhandling' },
  { text: 'Hur ofta ska man byta jobb?', href: '/artiklar/hur-ofta-byta-jobb' },
]

export default function Page() {
  return (
    <RaknaUtSida
      slug="lon-efter-skatt"
      titel="Räkna ut lön efter skatt 2026"
      intro="Se vad som blir kvar av lönen i din kommun, beräknat med Skatteverkets riktiga skattetabeller för 2026. Jämför gärna två löner eller två kommuner, det är så du ser vad ett jobbyte eller en flytt faktiskt är värd i handen."
      metod={
        <>
          <p>
            Kalkylatorn slår upp din månadslön i Skatteverkets skattetabeller för
            2026, samma tabeller som arbetsgivare använder för skatteavdraget på
            lönebeskedet. Vi använder kolumn 1 för dig som inte fyllt 66 år och
            kolumn 3 för dig som fyllt 66, med förhöjt grundavdrag.
          </p>
          <p>
            Tabellnumret bestäms av den sammanlagda skattesatsen i din kommun:
            kommunalskatt, regionskatt och begravningsavgift, plus kyrkoavgift om
            du är medlem i Svenska kyrkan, avrundat till hel procent.
            Kommundatan kommer från Skatteverkets öppna data för 2026 och
            kyrkoavgiften är kommunens genomsnitt över församlingarna. I
            tabellerna ligger grundavdraget, det förstärkta jobbskatteavdraget
            och den statliga inkomstskatten över skiktgränsen 643 000 kronor
            redan inräknade. För löner över tabellens tak på 80 000 kronor i
            månaden räknar vi vidare med tabellens toppmarginal, som motsvarar
            kommunalskatten plus 20 procent statlig skatt.
          </p>
        </>
      }
      faq={faq}
      kallor={kallor}
      relaterade={relaterade}
    >
      <LonEfterSkatt />
    </RaknaUtSida>
  )
}

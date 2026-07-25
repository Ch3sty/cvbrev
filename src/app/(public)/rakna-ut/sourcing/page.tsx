import type { Metadata } from 'next'
import RaknaUtSida from '@/components/rakna/RaknaUtSida'
import SourcingTratt from '@/components/mdx/SourcingTratt'

export const metadata: Metadata = {
  title: 'Sourcingtratten: räkna ut hur många kontakter som krävs',
  description:
    'Hur många riktade kontakter krävs för en anställning? Räkna baklänges genom svarsfrekvens, intervjuer och erbjudanden med benchmarks från branschdata.',
  alternates: { canonical: 'https://www.jobbcoach.ai/rakna-ut/sourcing' },
  openGraph: { images: ['https://www.jobbcoach.ai/images/rakna-ut.webp'] },
}

const faq = [
  {
    q: 'Hur många kandidater måste man kontakta för en anställning?',
    a: 'Med typiska svarsfrekvenser på 10 till 25 procent för uppsökande meddelanden, och normala konverteringar vidare till intervju, erbjudande och accept, krävs ofta någonstans mellan 30 och 100 riktade kontakter per anställning beroende på roll och hantverk. Tratten räknar på era egna antaganden åt båda hållen.',
  },
  {
    q: 'Vad är en bra svarsfrekvens på uppsökande meddelanden?',
    a: 'LinkedIns egna data pekar på att korta meddelanden under 400 tecken får omkring 22 procent bättre svarsfrekvens och individuellt skickade meddelanden cirka 15 procent högre än massutskick. Branschbenchmarks för svarsfrekvens ligger ofta i spannet 10 till 25 procent, hantverket avgör var i spannet ni hamnar.',
  },
  {
    q: 'Hur gör man tratten mindre?',
    a: 'Två sätt: höj konverteringen i varje steg med bättre meddelanden och snabbare process, eller börja med kandidater som redan visat intresse. En kandidatpool där kandidaterna själva registrerat sig och angett villkor vänder på tratten, ni kontaktar bara personer som redan är öppna för rätt erbjudande.',
  },
]

const kallor = [
  { text: 'Insikten om sourcing, med samtliga källor och benchmarks', href: 'https://www.jobbcoach.ai/for-rekryterare/insikter/hitta-kandidater-sourcing' },
]

const relaterade = [
  { text: 'Hitta kandidater: hela sourcinginsikten', href: '/for-rekryterare/insikter/hitta-kandidater-sourcing' },
  { text: 'Uppsökande rekrytering: meddelanden som får svar', href: '/for-rekryterare/insikter/uppsokande-rekrytering' },
  { text: 'Vad kostar en rekrytering?', href: '/for-rekryterare/insikter/vad-kostar-en-rekrytering' },
]

export default function Page() {
  return (
    <RaknaUtSida
      slug="sourcing"
      titel="Sourcingtratten: från kontakter till anställning"
      intro="Ange hur många ni ska anställa och er kanalkvalitet, så visar tratten hur många kontakter, svar och intervjuer som krävs, eller vänd på den och se vad era kontakter räcker till."
      metod={
        <>
          <p>
            Tratten räknar med konverteringssteg från riktad kontakt till svar,
            intervju, erbjudande och accept. Utgångsvärdena bygger på
            branschbenchmarks för uppsökande rekrytering, bland annat LinkedIns
            data om svarsfrekvenser, och varje steg kan justeras efter era
            egna utfall. Hela resonemanget med källor finns i vår
            sourcinginsikt som länkas nedan.
          </p>
        </>
      }
      faq={faq}
      kallor={kallor}
      relaterade={relaterade}
    >
      <SourcingTratt />
    </RaknaUtSida>
  )
}

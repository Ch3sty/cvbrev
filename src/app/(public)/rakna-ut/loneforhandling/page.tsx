import type { Metadata } from 'next'
import RaknaUtSida from '@/components/rakna/RaknaUtSida'
import LoneforhandlingsKalkylator from '@/components/rakna/LoneforhandlingsKalkylator'

export const metadata: Metadata = {
  title: 'Vad är en löneförhandling värd? Räkna på höjningen',
  description:
    'Räkna ut vad en löneökning är värd över 5, 10 och 20 år. En höjning på 2 000 kr i månaden växer med varje revision, se den ackumulerade skillnaden.',
  alternates: { canonical: 'https://www.jobbcoach.ai/rakna-ut/loneforhandling' },
  openGraph: { images: ['https://www.jobbcoach.ai/images/rakna-ut.webp'] },
}

const faq = [
  {
    q: 'Varför är en löneförhandling värd mer än höjningen?',
    a: 'Därför att varje framtida revision räknas i procent av din nuvarande lön. En förhandlad höjning följer med i basen och växer med varje års revision, och tjänstepensionen, för de flesta 4,5 procent av lönen, betalas in på den högre nivån varje månad. Skillnaden mellan att förhandla och att avstå ackumuleras därför år efter år.',
  },
  {
    q: 'Hur mycket är 2 000 kr mer i månaden värt på tio år?',
    a: 'Med en årlig revision på 2,5 procent blir den ackumulerade bruttoskillnaden ungefär 270 000 kronor över tio år, eftersom höjningen räknas upp varje år tillsammans med resten av lönen. Prova själv i räknaren med dina egna siffror.',
  },
  {
    q: 'När är rätt läge att förhandla lön?',
    a: 'De två starkaste lägena är vid nytt jobb, innan du tackat ja, och när ditt ansvar förändrats påtagligt. Det årliga lönesamtalet är i praktiken en justering inom en given pott, medan ingångslönen sätter basen som alla framtida revisioner räknas på. Det är därför löneanspråket vid jobbyte väger tyngst av allt.',
  },
  {
    q: 'Påverkar lönen min pension?',
    a: 'Ja, dubbelt. Den allmänna pensionen baseras på din pensionsgrundande inkomst, och tjänstepensionen betalas som en procentsats av lönen, vanligen 4,5 procent upp till 7,5 inkomstbasbelopp och 30 procent på lönedelar däröver. En högre lön i dag är alltså också en högre pensionsavsättning varje månad framöver.',
  },
]

const kallor = [
  { text: 'Avtalat om tjänstepensionspremier', href: 'https://www.avtalat.se/arbetsgivare/kostnader-och-premier/premier-tjansteman-itp1/' },
]

const relaterade = [
  { text: 'Löneförhandling och lönesamtal: så höjer du lönen', href: '/artiklar/loneforhandling' },
  { text: 'Löneanspråk på intervjun: så svarar du rätt', href: '/artiklar/loneansprak-intervju' },
  { text: 'Räkna ut lön efter skatt', href: '/rakna-ut/lon-efter-skatt' },
  { text: 'Hur ofta ska man byta jobb?', href: '/artiklar/hur-ofta-byta-jobb' },
]

export default function Page() {
  return (
    <RaknaUtSida
      slug="loneforhandling"
      titel="Vad är en löneförhandling värd?"
      intro="En höjning du förhandlar fram i dag följer med i basen för varje framtida revision. Räkna på vad skillnaden blir över 5, 10 och 20 år, med dina egna antaganden."
      metod={
        <>
          <p>
            Räknaren jämför två scenarier: din nuvarande lön med och utan den
            förhandlade höjningen, där båda räknas upp med samma årliga
            revision. Skillnaden per år summeras till en ackumulerad
            bruttoskillnad efter 5, 10 och 20 år. Revisionstakten är ditt eget
            antagande, förvalet 2,5 procent ligger i närheten av senare års
            centralt avtalade nivåer men ersätter dem inte. Skatt och
            pensionsavsättningar ingår inte i beloppen, pensionseffekten
            beskrivs kvalitativt eftersom den beror på ditt avtal.
          </p>
        </>
      }
      faq={faq}
      kallor={kallor}
      relaterade={relaterade}
    >
      <LoneforhandlingsKalkylator />
    </RaknaUtSida>
  )
}

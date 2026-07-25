import type { Metadata } from 'next'
import RaknaUtSida from '@/components/rakna/RaknaUtSida'
import UppsagningstidRaknare from '@/components/rakna/UppsagningstidRaknare'

export const metadata: Metadata = {
  title: 'Räkna ut din uppsägningstid enligt LAS',
  description:
    'Hur lång uppsägningstid har du? Räkna ut den enligt LAS utifrån anställningstid och vem som säger upp, och få din sista anställningsdag som datum.',
  alternates: { canonical: 'https://www.jobbcoach.ai/rakna-ut/uppsagningstid' },
  openGraph: { images: ['https://www.jobbcoach.ai/images/rakna-ut.webp'] },
}

const faq = [
  {
    q: 'Hur lång uppsägningstid har jag om jag säger upp mig själv?',
    a: 'En månad enligt 11 § LAS, oavsett hur länge du varit anställd, om inte ditt anställningsavtal eller kollektivavtal anger längre tid. Många tjänstemannaavtal förlänger den egna uppsägningstiden till två eller tre månader efter några års anställning, så kontrollera alltid avtalet.',
  },
  {
    q: 'Hur lång uppsägningstid gäller när arbetsgivaren säger upp?',
    a: 'Minst en månad, och därefter en trappa efter sammanlagd anställningstid: två månader efter två år, tre efter fyra år, fyra efter sex år, fem efter åtta år och sex månader efter tio års anställning, allt enligt 11 § LAS. Kollektivavtal kan ge längre tider, bland annat för äldre arbetstagare.',
  },
  {
    q: 'Vad gäller vid provanställning?',
    a: 'En provanställning får avbrytas i förtid av båda parter utan uppsägningstid, om inget annat avtalats (6 § LAS). Arbetsgivaren ska dock underrätta dig minst två veckor i förväg (31 § LAS), och i många kollektivavtal gäller en månads ömsesidig uppsägningstid även under provanställning.',
  },
  {
    q: 'Räknas all anställningstid hos arbetsgivaren?',
    a: 'Ja, trappan i LAS utgår från den sammanlagda anställningstiden hos arbetsgivaren, även om den är uppdelad på flera perioder eller olika anställningsformer. Tidigare vikariat och visstidsanställningar hos samma arbetsgivare räknas alltså med.',
  },
  {
    q: 'Kan jag förhandla bort eller förkorta uppsägningstiden?',
    a: 'Du och arbetsgivaren kan alltid komma överens om ett tidigare slutdatum när du säger upp dig, det kallas ofta att bli arbetsbefriad eller att förkorta tiden i samförstånd. Däremot kan arbetsgivaren inte ensidigt korta din lagstadgade uppsägningstid, och du kan inte tvingas gå tidigare än avtalat.',
  },
]

const kallor = [
  { text: 'Lagen om anställningsskydd (1982:80), 6, 11 och 31 §§', href: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-198280-om-anstallningsskydd_sfs-1982-80/' },
]

const relaterade = [
  { text: 'Säga upp sig: uppsägningstid, mall och så gör du det snyggt', href: '/artiklar/saga-upp-sig' },
  { text: 'Provanställning: regler, uppsägningstid och dina rättigheter', href: '/artiklar/provanstallning' },
  { text: 'Byta jobb smidigt: process, tips och fallgropar', href: '/artiklar/byta-jobb-praktiska-tips' },
  { text: 'Räkna ut semesterersättning', href: '/rakna-ut/semesterersattning' },
]

export default function Page() {
  return (
    <RaknaUtSida
      slug="uppsagningstid"
      titel="Räkna ut din uppsägningstid"
      intro="Ange när anställningen började och vem som säger upp, så får du uppsägningstiden enligt LAS och din sista anställningsdag som konkret datum."
      metod={
        <>
          <p>
            Beräkningen följer 11 § lagen om anställningsskydd. Vid egen
            uppsägning gäller en månads uppsägningstid. När arbetsgivaren säger
            upp har du rätt till två månader efter två års sammanlagd
            anställningstid, tre efter fyra år, fyra efter sex år, fem efter
            åtta år och sex månader efter tio år. Sista anställningsdag räknas
            som uppsägningsdatumet plus uppsägningstiden i månader.
          </p>
          <p>
            Viktigt: LAS är en lägstanivå. Kollektivavtal och enskilda avtal
            ger ofta längre uppsägningstider, särskilt vid egen uppsägning
            efter några års anställning, och vissa avtal har särskilda regler
            för äldre arbetstagare. Räknaren visar lagens golv, ditt avtal kan
            visa något annat.
          </p>
        </>
      }
      faq={faq}
      kallor={kallor}
      relaterade={relaterade}
    >
      <UppsagningstidRaknare />
    </RaknaUtSida>
  )
}

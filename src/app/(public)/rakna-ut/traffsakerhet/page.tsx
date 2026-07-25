import type { Metadata } from 'next'
import RaknaUtSida from '@/components/rakna/RaknaUtSida'
import TraffsakerhetsSimulator from '@/components/mdx/TraffsakerhetsSimulator'

export const metadata: Metadata = {
  title: 'Träffsäkerhetssimulatorn: jämför urvalsmetoder',
  description:
    'Hur många rekryteringar lyckas med CV-granskning jämfört med strukturerad intervju och test? Simulera urvalsmetodernas träffsäkerhet på forskningens siffror.',
  alternates: { canonical: 'https://www.jobbcoach.ai/rakna-ut/traffsakerhet' },
  openGraph: { images: ['https://www.jobbcoach.ai/images/rakna-ut.webp'] },
}

const faq = [
  {
    q: 'Vilken urvalsmetod är mest träffsäker?',
    a: 'Enligt den senaste stora forskningsgenomgången (Sackett med kollegor, 2022) ligger strukturerade intervjuer och kunskaps- eller arbetsprovstest i toppen, medan ostrukturerade intervjuer och CV-bedömningar hamnar långt efter. Kombinationen strukturerad intervju plus test höjer träffsäkerheten ytterligare, det är den kombinationen simulatorn låter dig jämföra mot.',
  },
  {
    q: 'Hur fungerar simuleringen?',
    a: 'Simulatorn använder Taylor-Russell-logik: givet metodens validitet, andelen kandidater som skulle lyckas i rollen och hur selektivt ni väljer, beräknas hur stor andel av de valda som faktiskt lyckas. Valideringssiffrorna kommer från Sackett med kollegors metaanalys från 2022.',
  },
  {
    q: 'Spelar metodvalet verkligen så stor roll?',
    a: 'Ja, och mer ju fler rekryteringar ni gör. Skillnaden mellan en svag och en stark urvalsmetod kan motsvara flera lyckade rekryteringar per tio anställda, och varje undviken felrekrytering är värd hundratusentals kronor. Räkna gärna vidare i felrekryteringskalkylatorn.',
  },
]

const kallor = [
  { text: 'Pillarinsikten om urvalsforskningen, med samtliga källor', href: 'https://www.jobbcoach.ai/for-rekryterare/insikter/kognitiva-tester-rekrytering-forskning' },
]

const relaterade = [
  { text: 'Kognitiva tester i urval: vad forskningen visar', href: '/for-rekryterare/insikter/kognitiva-tester-rekrytering-forskning' },
  { text: 'Strukturerad intervju + test: kombinationen', href: '/for-rekryterare/insikter/strukturerad-intervju-och-test' },
  { text: 'Räkna på felrekryteringens kostnad', href: '/rakna-ut/felrekrytering' },
]

export default function Page() {
  return (
    <RaknaUtSida
      slug="traffsakerhet"
      titel="Träffsäkerhetssimulatorn: jämför urvalsmetoder"
      intro="Välj urvalsmetod och se hur stor andel av rekryteringarna som förväntas lyckas, byggt på urvalsforskningens validitetssiffror. Samma simulator som i vår forskningsinsikt."
      metod={
        <>
          <p>
            Simulatorn bygger på Taylor-Russell-logik och validitetssiffrorna i
            Sackett med kollegors metaanalys av urvalsmetoder (Journal of
            Applied Psychology, 2022). Givet metodens validitet, basandelen
            lyckade rekryteringar och er selektionskvot beräknas andelen
            lyckade bland dem ni väljer. Hela resonemanget, inklusive varför
            strukturen slår magkänslan, finns i pillarinsikten som länkas
            nedan.
          </p>
        </>
      }
      faq={faq}
      kallor={kallor}
      relaterade={relaterade}
    >
      <TraffsakerhetsSimulator />
    </RaknaUtSida>
  )
}

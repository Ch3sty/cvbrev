import type { Metadata } from 'next'
import RaknaUtSida from '@/components/rakna/RaknaUtSida'
import AnstalldKostnad from '@/components/rakna/AnstalldKostnad'

export const metadata: Metadata = {
  title: 'Vad kostar en anställd 2026? Räkna ut totalkostnaden',
  description:
    'Räkna ut vad en anställd kostar per månad och år 2026: arbetsgivaravgift, tjänstepension, försäkringar, särskild löneskatt och semester, post för post.',
  alternates: { canonical: 'https://www.jobbcoach.ai/rakna-ut/vad-kostar-en-anstalld' },
  openGraph: { images: ['https://www.jobbcoach.ai/images/rakna-ut.webp'] },
}

const faq = [
  {
    q: 'Vad kostar en anställd utöver lönen?',
    a: 'Arbetsgivaravgiften på 31,42 procent är den största posten. Med kollektivavtal tillkommer tjänstepension, för tjänstemän med ITP1 4,5 procent av lönen upp till 52 125 kronor i månaden och 30 procent däröver, avtalsförsäkringar på några tiondels procent, särskild löneskatt på 24,26 procent av pensionspremierna samt semestertillägg. Tumregeln är att totalkostnaden landar på cirka 1,4 till 1,5 gånger bruttolönen.',
  },
  {
    q: 'Hur hög är arbetsgivaravgiften 2026?',
    a: 'Den fulla arbetsgivaravgiften är 31,42 procent av bruttolönen. För anställda som fyllt 18 men inte 23 år är avgiften tillfälligt nedsatt till 20,81 procent på lönedelar upp till 25 000 kronor i månaden, för ersättningar som betalas ut mellan april 2026 och september 2027.',
  },
  {
    q: 'Vad är särskild löneskatt?',
    a: 'En skatt på 24,26 procent som arbetsgivaren betalar på pensionskostnader, till exempel ITP-premier. Den glöms ofta bort i snabbkalkyler men gör att varje pensionskrona i praktiken kostar 1,24 kronor, vilket märks tydligt på lönedelar över 52 125 kronor i månaden där premien är 30 procent.',
  },
  {
    q: 'Vad kostar en anställd utan kollektivavtal?',
    a: 'Lagkraven är då bruttolön, arbetsgivaravgift och semesterlön. Men de flesta seriösa arbetsgivare utan kollektivavtal tecknar ändå tjänstepension och försäkringar på liknande nivåer, både för att kunna rekrytera och för att villkoren annars blir en varningsflagga för erfarna kandidater. Räkna med att marknaden, inte lagen, sätter golvet.',
  },
  {
    q: 'Vad kostar rekryteringen innan den anställda ens börjat?',
    a: 'Annonsering, urval, intervjutid och eventuellt byråarvode kommer ovanpå lönekostnaden, och en tom stol under rekryteringstiden har en egen vakanskostnad. Vi har räknat på båda i våra insikter för rekryterare, se länkarna nedan.',
  },
]

const kallor = [
  { text: 'Skatteverket om arbetsgivaravgifter', href: 'https://www.skatteverket.se/foretag/arbetsgivare/arbetsgivaravgifterochskatteavdrag/arbetsgivaravgifter.4.233f91f71260075abe8800020817.html' },
  { text: 'Avtalat om premier för tjänstemän med ITP1', href: 'https://www.avtalat.se/arbetsgivare/kostnader-och-premier/premier-tjansteman-itp1/' },
  { text: 'Semesterlagen (1977:480)', href: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/semesterlag-1977480_sfs-1977-480/' },
]

const relaterade = [
  { text: 'Vad kostar en rekrytering? Byrå, annons eller egen sourcing', href: '/for-rekryterare/insikter/vad-kostar-en-rekrytering' },
  { text: 'Vakanskostnaden: så räknar ni på en tom stol', href: '/for-rekryterare/insikter/vakanskostnad' },
  { text: 'Räkna på felrekryteringens kostnad', href: '/rakna-ut/felrekrytering' },
]

export default function Page() {
  return (
    <RaknaUtSida
      slug="vad-kostar-en-anstalld"
      titel="Vad kostar en anställd?"
      intro="Bruttolönen är bara början. Här är hela månadskostnaden 2026, post för post: arbetsgivaravgift, tjänstepension, särskild löneskatt, försäkringar och semester."
      metod={
        <>
          <p>
            Kalkylen utgår från bruttolönen och lägger semestertillägget (0,43
            procent av månadslönen per semesterdag enligt semesterlagen,
            utslaget per månad) till lönebasen. På den betalas
            arbetsgivaravgift med 31,42 procent, eller 20,81 procent på
            lönedelar upp till 25 000 kronor för anställda som fyllt 18 men
            inte 23 år, en tillfällig nedsättning som gäller utbetalningar
            april 2026 till september 2027.
          </p>
          <p>
            Med kollektivavtal räknar vi tjänstemannapremierna enligt Avtalat:
            ITP1-pension med 4,5 procent av lön upp till 52 125 kronor i
            månaden (7,5 inkomstbasbelopp 2026) och 30 procent däröver,
            avtalsförsäkringar (TGL, TFA, TRR och sjukförsäkring) schablonerade
            till 0,4 procent, samt särskild löneskatt med 24,26 procent på
            pensionspremierna. Kostnader för utrustning, lokal, utbildning och
            själva rekryteringen ligger utanför kalkylen.
          </p>
        </>
      }
      faq={faq}
      kallor={kallor}
      relaterade={relaterade}
    >
      <AnstalldKostnad />
    </RaknaUtSida>
  )
}

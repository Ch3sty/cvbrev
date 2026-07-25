import type { Metadata } from 'next'
import RaknaUtSida from '@/components/rakna/RaknaUtSida'
import FelrekryteringsKalkylator from '@/components/mdx/FelrekryteringsKalkylator'

export const metadata: Metadata = {
  title: 'Räkna ut vad en felrekrytering kostar',
  description:
    'Ange månadslönen och se felrekryteringens kostnad post för post: rekrytering, lön under anställningen, produktionsbortfall och omstarten. Källbelagd kalkyl.',
  alternates: { canonical: 'https://www.jobbcoach.ai/rakna-ut/felrekrytering' },
  openGraph: { images: ['https://www.jobbcoach.ai/images/rakna-ut.webp'] },
}

const faq = [
  {
    q: 'Vad kostar en felrekrytering?',
    a: 'Vanliga svenska uppskattningar landar kring 700 000 kronor för en tjänstemannaroll när allt räknas in: rekryteringskostnaden, lön och arbetsgivaravgifter under den misslyckade anställningen, produktionsbortfall, chefstid och omstarten med en ny rekrytering. Beloppet skalar med lönenivån, kalkylatorn låter dig räkna på er faktiska situation.',
  },
  {
    q: 'Vilka poster ingår i kalkylen?',
    a: 'Rekryteringskostnaden för den första processen, lönekostnad inklusive arbetsgivaravgift under anställningsmånaderna, ett produktionsbortfall som speglar att rollen inte levererar som tänkt, kringkostnader som chefstid och introduktion, samt omstartskostnaden när processen måste göras om. Varje post kan justeras efter era förhållanden.',
  },
  {
    q: 'Hur undviker man felrekryteringar?',
    a: 'Forskningen är entydig: strukturerat urval slår magkänsla. Kravprofil som styr processen, strukturerade intervjuer med samma frågor och ankarskalor, arbetsprov eller validerade tester, och referenstagning med struktur. Vi har skrivit igenom hela kedjan i våra insikter för rekryterare.',
  },
]

const kallor = [
  { text: 'Insikten om felrekryteringens kostnad, med samtliga källor', href: 'https://www.jobbcoach.ai/for-rekryterare/insikter/vad-kostar-en-felrekrytering' },
]

const relaterade = [
  { text: 'Vad kostar en felrekrytering? Hela genomgången', href: '/for-rekryterare/insikter/vad-kostar-en-felrekrytering' },
  { text: 'Vad kostar en anställd? Räkna ut totalkostnaden', href: '/rakna-ut/vad-kostar-en-anstalld' },
  { text: 'Vakanskostnaden: så räknar ni på en tom stol', href: '/for-rekryterare/insikter/vakanskostnad' },
]

export default function Page() {
  return (
    <RaknaUtSida
      slug="felrekrytering"
      titel="Räkna ut vad en felrekrytering kostar"
      intro="Ange månadslönen för rollen och se kostnaden post för post, från första annonsen till omstarten. Samma kalkylator som i vår insikt om felrekryteringens kostnad."
      metod={
        <>
          <p>
            Kalkylatorn bygger på samma antaganden som vår källbelagda insikt
            om felrekryteringens kostnad: rekryteringskostnad, lönekostnad med
            arbetsgivaravgift under den misslyckade anställningen,
            produktionsbortfall, kringkostnader och omstart. Utgångsvärdena
            speglar en typisk tjänstemannarekrytering och varje post går att
            justera. Hela resonemanget, med källor, finns i insikten som
            länkas nedan.
          </p>
        </>
      }
      faq={faq}
      kallor={kallor}
      relaterade={relaterade}
    >
      <FelrekryteringsKalkylator />
    </RaknaUtSida>
  )
}

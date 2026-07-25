import type { Metadata } from 'next'
import RaknaUtSida from '@/components/rakna/RaknaUtSida'
import SemesterersattningRaknare from '@/components/rakna/SemesterersattningRaknare'

export const metadata: Metadata = {
  title: 'Räkna ut semesterersättning och semestertillägg',
  description:
    'Räkna ut semesterersättning enligt semesterlagen: 12 procent med procentregeln eller 5,03 procent av månadslönen per sparad dag vid slutlön. Med källor.',
  alternates: { canonical: 'https://www.jobbcoach.ai/rakna-ut/semesterersattning' },
  openGraph: { images: ['https://www.jobbcoach.ai/images/rakna-ut.webp'] },
}

const faq = [
  {
    q: 'Hur mycket är semesterersättningen?',
    a: 'Med procentregeln är semesterlönen tolv procent av din sammanlagda förfallna lön under intjänandeåret, enligt 16 b § semesterlagen. Regeln används framför allt vid timlön, kortare anställningar och lön som varierar. Semesterersättning när anställningen tar slut beräknas enligt samma grunder.',
  },
  {
    q: 'Hur räknas semesterersättning ut för månadslön?',
    a: 'Med sammalöneregeln behåller du ordinarie lön under semestern och får ett semestertillägg på 0,43 procent av månadslönen per betald semesterdag, enligt 16 a § semesterlagen. När sparade dagar ska betalas ut i pengar vid slutlön används dagslönen, i praktiken 4,6 procent av månadslönen, plus tillägget, alltså 5,03 procent av månadslönen per dag.',
  },
  {
    q: 'När betalas semesterersättningen ut?',
    a: 'Semestertillägget betalas normalt ut i samband med semestern. Semesterersättning för intjänade och sparade dagar när du slutar en anställning ska betalas ut utan oskäligt dröjsmål, senast en månad efter anställningens slut, enligt 30 § semesterlagen.',
  },
  {
    q: 'Får man baka in semesterersättning i lönen?',
    a: 'Som huvudregel nej. Semesterlagen kräver att semesterlön och semesterersättning går att särskilja från lönen, och en klumpsumma där allt påstås ingå håller sällan vid en tvist. Vid mycket korta anställningar kan ersättningen dock betalas ut löpande, men den ska redovisas separat på lönebeskedet.',
  },
  {
    q: 'Gäller andra procentsatser med kollektivavtal?',
    a: 'Ofta, och då till din fördel. Många tjänstemannaavtal ger ett semestertillägg på 0,8 procent av månadslönen per dag i stället för lagens 0,43, och vissa avtal räknar med 13 procent i stället för 12. Lagens procentsatser är golvet, kollektivavtalet kan bara förbättra dem.',
  },
]

const kallor = [
  { text: 'Semesterlagen (1977:480), 16 a, 16 b och 28-30 §§', href: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/semesterlag-1977480_sfs-1977-480/' },
]

const relaterade = [
  { text: 'Räkna ut din uppsägningstid', href: '/rakna-ut/uppsagningstid' },
  { text: 'Säga upp sig: så gör du det snyggt', href: '/artiklar/saga-upp-sig' },
  { text: 'Arbetsgivarintyg och tjänstgöringsbetyg: så får du dina papper', href: '/artiklar/arbetsgivarintyg-tjanstgoringsbetyg' },
]

export default function Page() {
  return (
    <RaknaUtSida
      slug="semesterersattning"
      titel="Räkna ut semesterersättning"
      intro="Semestertillägg per dag, ersättning för sparade dagar vid slutlön eller tolv procent enligt procentregeln, beroende på hur du får din lön."
      metod={
        <>
          <p>
            Räknaren följer semesterlagens två beräkningssätt. Sammalöneregeln
            (16 a §) gäller fast månadslön: ordinarie lön under semestern plus
            ett tillägg på 0,43 procent av månadslönen per betald dag. Vid
            slutlön ersätts varje kvarvarande dag med dagslön, i praktiken 4,6
            procent av månadslönen, plus tillägget: sammanlagt 5,03 procent per
            dag. Procentregeln (16 b §) gäller timlön och rörlig lön:
            semesterlönen är tolv procent av den förfallna lönen under
            intjänandeåret. Semesterersättning när anställningen upphör
            beräknas enligt samma grunder (28-29 §§).
          </p>
        </>
      }
      faq={faq}
      kallor={kallor}
      relaterade={relaterade}
    >
      <SemesterersattningRaknare />
    </RaknaUtSida>
  )
}

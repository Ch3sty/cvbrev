import type { Metadata } from 'next'
import RaknaUtSida from '@/components/rakna/RaknaUtSida'
import TimlonManadslon from '@/components/rakna/TimlonManadslon'

export const metadata: Metadata = {
  title: 'Räkna om timlön till månadslön (och tvärtom)',
  description:
    'Konvertera timlön till månadslön eller månadslön till timlön med 174-timmarsschablonen. Justera timmarna för deltid och se årslönen direkt.',
  alternates: { canonical: 'https://www.jobbcoach.ai/rakna-ut/timlon-till-manadslon' },
  openGraph: { images: ['https://www.jobbcoach.ai/images/rakna-ut.webp'] },
}

const faq = [
  {
    q: 'Hur räknar man om timlön till månadslön?',
    a: 'Multiplicera timlönen med 174, schablonen för antalet arbetstimmar per månad vid heltid med 40-timmarsvecka. En timlön på 180 kronor motsvarar alltså ungefär 31 300 kronor i månadslön. Schablonen kommer av att 40 timmar i veckan gånger 52 veckor delat på 12 månader blir 173,33 timmar, som i löneadministration avrundas till 174.',
  },
  {
    q: 'Hur räknar man om månadslön till timlön?',
    a: 'Dela månadslönen med 174. En månadslön på 31 000 kronor motsvarar ungefär 178 kronor i timmen vid heltid. Arbetar du deltid är timlönen densamma, det är antalet timmar som skiljer, så dela alltid heltidslönen med heltidsmåttet.',
  },
  {
    q: 'Ingår semesterersättning i timlönen?',
    a: 'Inte automatiskt. Semesterersättningen på 12 procent enligt semesterlagen ska normalt redovisas separat och får inte utan tydlig överenskommelse bakas in i timlönen. Om en annons anger timlön inklusive semesterersättning är den jämförbara lönen alltså cirka 10,7 procent lägre.',
  },
  {
    q: 'Varför använder vissa 165 eller 160 timmar i stället?',
    a: 'Månadens faktiska arbetstid varierar mellan cirka 160 och 184 timmar beroende på hur helgdagarna faller, och vissa branscher med annan veckoarbetstid använder andra delningstal, till exempel inom vård och skift. 174 är den vanligaste schablonen för 40-timmarsvecka, men du kan ändra timtalet i räknaren efter din arbetstid.',
  },
]

const kallor = [
  { text: 'Arbetstidslagen (1982:673) om ordinarie arbetstid 40 timmar per vecka', href: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/arbetstidslag-1982673_sfs-1982-673/' },
]

const relaterade = [
  { text: 'Räkna ut lön efter skatt', href: '/rakna-ut/lon-efter-skatt' },
  { text: 'Räkna ut semesterersättning', href: '/rakna-ut/semesterersattning' },
  { text: 'Löneanspråk på intervjun: så svarar du rätt', href: '/artiklar/loneansprak-intervju' },
]

export default function Page() {
  return (
    <RaknaUtSida
      slug="timlon-till-manadslon"
      titel="Räkna om timlön till månadslön"
      intro="Konvertera åt båda hållen med 174-timmarsschablonen för heltid, eller ändra timtalet efter din faktiska arbetstid. Årslönen får du på köpet."
      metod={
        <>
          <p>
            Vi använder schablonen 174 arbetstimmar per månad, som motsvarar
            heltid med 40-timmarsvecka: 40 timmar gånger 52 veckor delat på 12
            månader. Timlön till månadslön är timlönen gånger timtalet,
            månadslön till timlön är månadslönen delat med timtalet, och
            årslönen är månadslönen gånger tolv. Semesterlön, ob-tillägg och
            övertidsersättning ligger utanför konverteringen.
          </p>
        </>
      }
      faq={faq}
      kallor={kallor}
      relaterade={relaterade}
    >
      <TimlonManadslon />
    </RaknaUtSida>
  )
}

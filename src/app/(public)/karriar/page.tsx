/**
 * /karriar, publikt omgång 3: sidan utan egen skiss får grundens skal
 * (BYGGBRIEF beslut 10). Hjälten på väggen med "Kommer snart" som eget led
 * i rubriken (samma h1-text som förut), de två korten och knappen till
 * kontakt. Texterna och länken är desamma som förut. Serverkomponent,
 * utan framer-motion.
 */
import { Heart, Lightbulb } from 'lucide-react'
import { Sida, Hjalte, Sektion, Kort, Rutnat, Knapp, Knapprad } from '@/components/publikt/v3'
import './karriar.css'

export default function KarriarPage() {
  return (
    <Sida farg="neutral">
      <main>
        <Hjalte
          h1={
            <>
              Karriärmöjligheter
              <span className="ka-snart">Kommer snart</span>
            </>
          }
          varde={
            <>
              Vi bygger ett fantastiskt team för att revolutionera karriärvägledning i Sverige. Håll utkik efter spännande roller inom AI,
              UX-design och produktutveckling.
            </>
          }
        />
        <Sektion>
          <Rutnat kolumner={2}>
            <Kort>
              <Lightbulb className="ka-ikon" aria-hidden="true" />
              <h3 className="p3-h3">Innovation</h3>
              <p>Arbeta med cutting-edge AI-teknologi för karriärutveckling</p>
            </Kort>
            <Kort>
              <Heart className="ka-ikon" aria-hidden="true" />
              <h3 className="p3-h3">Påverkan</h3>
              <p>Hjälp tusentals svenskar att nå sina karriärmål</p>
            </Kort>
          </Rutnat>
          <div className="ka-slut">
            <Knapprad>
              <Knapp href="/kontakt">Kontakta oss för framtida möjligheter</Knapp>
            </Knapprad>
            <p className="p3-liten">Följ oss på LinkedIn för uppdateringar om lediga tjänster</p>
          </div>
        </Sektion>
      </main>
    </Sida>
  )
}

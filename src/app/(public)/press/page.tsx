/**
 * /press, publikt omgång 3: sidan utan egen skiss får grundens skal
 * (BYGGBRIEF beslut 10). Hjälten på väggen, snabbfakta som kort, presskit
 * och pressmeddelanden som två kort och presskontakten som tonad sektion.
 * Texterna och länken är desamma som förut. Priset läses ur plans.ts i
 * stället för att stå för hand (samma text). Serverkomponent, utan
 * framer-motion.
 */
import { Download, ExternalLink, Newspaper } from 'lucide-react'
import { Sida, Hjalte, Sektion, SektionHuvud, Kort, Rutnat, Knapp, Knapprad } from '@/components/publikt/v3'
import { PLAN_BY_KEY, SALD_PLAN } from '@/lib/plans/plans'
import './press.css'

const FAKTA = [
  { rubrik: 'Grundat', text: '2024' },
  { rubrik: 'Marknad', text: 'Sverige' },
  { rubrik: 'Fokus', text: 'Karriärvägledning som gör skillnad' },
  { rubrik: 'Pris', text: `${PLAN_BY_KEY[SALD_PLAN].amount} SEK/månad` },
]

export default function PressPage() {
  return (
    <Sida farg="neutral">
      <main>
        <Hjalte h1="Pressrum" varde="Pressmeddelanden, logotyper och information för journalister" />

        <Sektion>
          <Kort>
            <h2 className="p3-h2">Snabbfakta om Jobbcoach.ai</h2>
            <div className="pr-fakta">
              {FAKTA.map((f) => (
                <div key={f.rubrik}>
                  <h3 className="p3-h3">{f.rubrik}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </Kort>

          <Rutnat kolumner={2} className="pr-kit">
            <Kort ton>
              <Download className="pr-ikon" aria-hidden="true" />
              <h3 className="p3-h3">Presskit</h3>
              <p>Ladda ner logotyper, produktbilder och företagsinformation</p>
              <Knapp som="knapp" variant="vit" liten>
                Kommer snart <ExternalLink className="pr-liten-ikon" aria-hidden="true" />
              </Knapp>
            </Kort>
            <Kort ton>
              <Newspaper className="pr-ikon" aria-hidden="true" />
              <h3 className="p3-h3">Pressmeddelanden</h3>
              <p>Senaste nyheterna och uppdateringar från Jobbcoach.ai</p>
              <Knapp som="knapp" variant="vit" liten>
                Kommer snart <ExternalLink className="pr-liten-ikon" aria-hidden="true" />
              </Knapp>
            </Kort>
          </Rutnat>
        </Sektion>

        <Sektion botten="ton">
          <SektionHuvud mitt rubrik="Presskontakt" varde="För intervjuer, kommentarer eller ytterligare information">
            <Knapprad className="pr-mitt">
              <Knapp href="/kontakt">Kontakta oss</Knapp>
            </Knapprad>
          </SektionHuvud>
        </Sektion>
      </main>
    </Sida>
  )
}

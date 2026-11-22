/**
 * /press, publikt omgång 3: sidan utan egen skiss får grundens skal
 * (BYGGBRIEF beslut 10). Texterna och länken är desamma som förut. Priset
 * läses ur plans.ts i stället för att stå för hand (samma text).
 * Serverkomponent, utan framer-motion.
 *
 * Utseendegranskning 2 (2026-11-22): sidan var platt. Hjälten bär nu
 * märket på ljus och mörk botten (aria-hidden), snabbfakta är det lyfta
 * kortet med fyra stora värden, presskit och pressmeddelanden har var sin
 * färg och ikonplatta, och presskontakten är en ö. Rubrikerna (h1, två h2,
 * sex h3) står kvar med samma text och nivå.
 */
import { Download, ExternalLink, Newspaper } from 'lucide-react'
import { Sida, Hjalte, Lyft, Sektion, Kort, Rutnat, Knapp, O } from '@/components/publikt/v3'
import { PLAN_BY_KEY, SALD_PLAN } from '@/lib/plans/plans'
import './press.css'

const FAKTA = [
  { rubrik: 'Grundat', text: '2024' },
  { rubrik: 'Marknad', text: 'Sverige' },
  { rubrik: 'Fokus', text: 'Karriärvägledning som gör skillnad' },
  { rubrik: 'Pris', text: `${PLAN_BY_KEY[SALD_PLAN].amount} SEK/månad` },
]

/** Märket på ljus och mörk botten och som ensam symbol. Dekor. */
function Market() {
  return (
    <div className="ps-marke" aria-hidden="true">
      <span className="ps-blad ps-ljus">
        <i>J</i>
        <b>
          Jobbcoach<span>.ai</span>
        </b>
      </span>
      <span className="ps-blad ps-mork">
        <i>J</i>
        <b>
          Jobbcoach<span>.ai</span>
        </b>
      </span>
      <span className="ps-symbol">
        <i>J</i>
      </span>
    </div>
  )
}

export default function PressPage() {
  return (
    <Sida>
      <main>
        <Hjalte h1="Pressrum" varde="Pressmeddelanden, logotyper och information för journalister" bild={<Market />} lyft />

        <Lyft>
          <h2 className="p3-h2">Snabbfakta om Jobbcoach.ai</h2>
          <div className="ps-fakta">
            {FAKTA.map((f) => (
              <div key={f.rubrik}>
                <h3 className="p3-h3">{f.rubrik}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </Lyft>

        <Sektion>
          <Rutnat kolumner={2}>
            <Kort farg="cv" className="ps-kort">
              <span className="ps-platta" aria-hidden="true">
                <Download className="ps-ikon" />
              </span>
              <h3 className="p3-h3">Presskit</h3>
              <p>Ladda ner logotyper, produktbilder och företagsinformation</p>
              <Knapp som="knapp" variant="vit" liten>
                Kommer snart <ExternalLink className="ps-liten-ikon" aria-hidden="true" />
              </Knapp>
            </Kort>
            <Kort farg="brev" className="ps-kort">
              <span className="ps-platta" aria-hidden="true">
                <Newspaper className="ps-ikon" />
              </span>
              <h3 className="p3-h3">Pressmeddelanden</h3>
              <p>Senaste nyheterna och uppdateringar från Jobbcoach.ai</p>
              <Knapp som="knapp" variant="vit" liten>
                Kommer snart <ExternalLink className="ps-liten-ikon" aria-hidden="true" />
              </Knapp>
            </Kort>
          </Rutnat>
        </Sektion>

        <Sektion luft="utan-topp">
          <O
            farg="jobb"
            ikon={false}
            som="div"
            rubrikNiva="h2"
            rubrik="Presskontakt"
            varde="För intervjuer, kommentarer eller ytterligare information"
            knappar={
              <Knapp href="/kontakt" pil>
                Kontakta oss
              </Knapp>
            }
          />
        </Sektion>
      </main>
    </Sida>
  )
}

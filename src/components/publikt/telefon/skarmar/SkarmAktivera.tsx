/**
 * Matchade jobb innan första sökningen: CV:t är inläst och sökningen väntar
 * på ett tryck. Vyn visar roller, kompetenser, utbildningar och ort ur CV:t.
 * DATAPUNKTER exporteras till sidans "Sex datapunkter ur ditt CV", så att
 * rubrikerna där står kvar med samma namn.
 */

import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

/** Datapunkternas namn, i samma ordning som sidans H3. */
export const DATAPUNKTER = ['Yrkesroller', 'Kompetenser', 'Utbildning', 'Plats', 'Språk', 'Erfarenhetsnivå'] as const

export default function SkarmAktivera({ glid, className }: { glid?: boolean; className?: string }) {
  return (
    <Telefon rum="jobb" glid={glid} className={className}>
      <SkarmVagg kick="Matchade jobb" rubrik="Jobb som passar ditt CV" />
      <SkarmGolv>
        <div className="s-kort">
          <div className="s-rad">
            <div className="s-kick2">Ditt CV</div>
            <span className="s-dim" style={{ fontSize: 10 }}>
              <u>Byt CV</u> <u>Rätta</u>
            </span>
          </div>
          <b style={{ fontSize: 12 }}>projektledare-cv.pdf</b>
          <div className="s-chips" style={{ marginTop: 6 }}>
            {['3 roller', '14 kompetenser', '2 utbildningar'].map((k) => (
              <span className="s-chip" key={k}>
                {k}
              </span>
            ))}
          </div>
          <p className="s-dim" style={{ marginTop: 6 }}>
            Ort i CV:t: Göteborg
          </p>
        </div>
        <div className="s-kort">
          <div className="s-rad">
            <div className="s-kick2">Så söker vi åt dig</div>
            <span className="s-dim" style={{ fontSize: 10 }}>
              <u>Ändra</u>
            </span>
          </div>
          <div className="s-chips">
            {['Göteborg', 'Distans: nej', 'Heltid'].map((k) => (
              <span className="s-chip s-saknas" key={k}>
                {k}
              </span>
            ))}
          </div>
        </div>
        <div className="s-kort">
          <b style={{ fontSize: 12 }}>Vi har inte letat än</b>
          <p className="s-dim" style={{ marginTop: 4 }}>
            Tryck här så läser vi igenom Arbetsförmedlingens annonser mot ditt CV.
          </p>
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Hitta jobb som passar" />
    </Telefon>
  )
}

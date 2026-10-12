/**
 * CV-analysens resultat: poängringen 74 (räknar upp i CSS, talet står i
 * HTML från start), poäng per område och det tyngsta fyndet. Områdena är
 * desamma som i analysens resultat.
 */

import type { CSSProperties } from 'react'
import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmMatare, SkarmVagg } from '../delar'

const POANG = 74

const OMRADEN = [
  { namn: 'Tydlighet och struktur', poang: 8 },
  { namn: 'Innehåll', poang: 7 },
  { namn: 'Resultat', poang: 5 },
  { namn: 'Nyckelord', poang: 9 },
]

export default function SkarmCvAnalys({ glid, className }: { glid?: boolean; className?: string }) {
  const ringStil = { '--mal-p': POANG / 100, '--mal-n': POANG } as CSSProperties
  return (
    <Telefon rum="cv" glid={glid} className={className}>
      <SkarmVagg kick="CV-analysen">
        <div className="s-rad" style={{ marginTop: 8, alignItems: 'center' }}>
          <div className="s-ring" style={ringStil}>
            <svg viewBox="0 0 96 96" focusable="false">
              <circle className="s-bak" cx="48" cy="48" r="42" />
              <circle className="s-fram" cx="48" cy="48" r="42" />
            </svg>
            <div className="s-siffra">
              <span className="s-tal">{POANG}</span>
              <small>AV 100</small>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingLeft: 12 }}>
            <div className="s-rub" style={{ fontSize: 17 }}>
              Läsbart för systemen
            </div>
            <div className="s-sub">Tre fynd drar ned poängen. Det tyngsta står först.</div>
          </div>
        </div>
      </SkarmVagg>
      <SkarmGolv>
        <div className="s-kort">
          <div className="s-kick2">Poäng per område</div>
          {OMRADEN.map((o, i) => (
            <SkarmMatare key={o.namn} etikett={o.namn} varde={<b>{o.poang}</b>} andel={o.poang / 10} forsta={i === 0} />
          ))}
        </div>
        <div className="s-kort">
          <div className="s-kick2">Tyngsta fyndet</div>
          <b style={{ fontSize: 13 }}>Resultaten saknar siffror</b>
          <p className="s-dim" style={{ marginTop: 3 }}>
            Tre av fyra roller beskriver ansvar, inte utfall. Lägg till en siffra per roll: budget, antal, procent.
          </p>
          <span className="s-pill" style={{ display: 'inline-block', marginTop: 8 }}>
            Åtgärd: 4 minuter
          </span>
        </div>
      </SkarmGolv>
      <SkarmFot knapp="Rätta och kör om" />
    </Telefon>
  )
}

/**
 * Varför det fungerar (spec-publikt-v2 del B 3.3, rad 3): en rad per punkt
 * med h3. Punkter med ankare visar sitt notnummer, de andra en tom ruta.
 */

import Rik from './Rik'
import type { Punkt } from './exempel-data'

export default function VarforLista({ punkter }: { punkter: Punkt[] }) {
  return (
    <ul className="ib-varfor">
      {punkter.map((p, i) => (
        <li key={i}>
          {p.nr ? <i aria-label={`Not ${p.nr}`}>{p.nr}</i> : <i className="tom" aria-hidden="true" />}
          <div>
            <h3>{p.titel}</h3>
            <Rik text={p.text} />
          </div>
        </li>
      ))}
    </ul>
  )
}

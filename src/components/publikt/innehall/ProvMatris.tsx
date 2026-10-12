/**
 * Expertfrågan i provkortets storlek (spec-publikt-v2 del B 3.1, rad 2b):
 * rutnätet och de sex alternativen ur samma data som telefonens SkarmMatris
 * (MatrisExpert.tsx). Statisk SVG, aria-hidden; frågan står i kortets text.
 */

import { MATRIS_EXPERT_ALTERNATIV, MATRIS_EXPERT_RUTOR, MatrisFigur, MatrisLucka } from '../MatrisExpert'

export default function ProvMatris() {
  return (
    <div className="ib-prova-matris" aria-hidden="true">
      <div className="ib-pm-g">
        {MATRIS_EXPERT_RUTOR.map((r, i) => (
          <div key={i}>
            <svg viewBox="0 0 100 100" focusable="false">
              <MatrisFigur ruta={r} streck={3.6} />
            </svg>
          </div>
        ))}
        <div>
          <svg viewBox="0 0 100 100" focusable="false">
            <MatrisLucka streck={3.6} />
          </svg>
        </div>
      </div>
      <div className="ib-pm-alt">
        {MATRIS_EXPERT_ALTERNATIV.map((a) => (
          <div key={a.bokstav}>
            <b>{a.bokstav}</b>
            <svg viewBox="0 0 100 100" focusable="false">
              <MatrisFigur ruta={a.ruta} streck={4.2} />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

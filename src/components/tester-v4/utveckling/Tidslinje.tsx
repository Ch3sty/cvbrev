/**
 * Tidslinjen under nivåytan i grafen: övningsprov (fyrkant), träning utan
 * nivå (punkt) och nivåkoller som inte räknas (streckad ring) står här,
 * aldrig på nivåaxeln. Provets resultat räknas aldrig om till en nivå.
 * Markörerna själva ritas av Graf med samma träffytor som på linjen; här
 * står spåret och dess etikett.
 */

import type { Matt } from './geometri'

export default function Tidslinje({ matt }: { matt: Matt }) {
  return (
    <g aria-hidden="true" data-tidslinje>
      <line x1={matt.L} x2={matt.W - matt.R} y1={matt.yTid} y2={matt.yTid} style={{ stroke: 'var(--kant)' }} strokeWidth={1} />
    </g>
  )
}

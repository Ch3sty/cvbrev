/**
 * Rubriken över övriga testtyper: med plan "Används i andra
 * rekryteringstest, inte i <provet>", utan plan "Alla testtyper". Alltid
 * hela frasen med provets namn.
 */

import { TESTER } from './copy'

export default function OvrigaRubrik({ planNamn }: { planNamn: string | null }) {
  return (
    <h2 className="mx-0.5 text-ey text-ink-3" data-ovriga>
      {planNamn ? TESTER.ovriga(planNamn) : TESTER.allaTyper}
    </h2>
  )
}

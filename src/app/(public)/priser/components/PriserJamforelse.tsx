/**
 * "Vad som ingår, rad för rad" (docs/design/spec-prissida-2026-09-22.html,
 * .jamf). Rubriken är serverrenderad, tabellen ligger i JamforelseTabell,
 * som mäter sin egen synlighet så vi får veta om tabellen läses.
 */

import JamforelseTabell from '@/components/pricing/JamforelseTabell'
import { JAMFORELSE_RUBRIK } from './priser-data'

export default function PriserJamforelse() {
  return (
    <section aria-labelledby="priser-jamforelse" className="mt-12 lg:mt-14">
      <h2
        id="priser-jamforelse"
        className="font-display text-[28px] font-bold leading-[34px] tracking-[-0.025em] text-ink-1"
      >
        {JAMFORELSE_RUBRIK}
      </h2>
      <JamforelseTabell className="mt-4" matSynlighet />
    </section>
  )
}

/**
 * Jämförelsesektionen på prissidan.
 *
 * Rubrik och ingress är serverrenderade. Själva tabellen ligger i
 * JamforelseTabell, delad med den inloggade vyn, och mäter sin egen
 * synlighet så vi får veta om tabellen läses eller om folk köper på korten.
 */

import JamforelseTabell from '@/components/pricing/JamforelseTabell'
import { PR_JAMFORELSE_INGRESS, PR_SEKTIONER } from '@/components/pricing/paket-copy'

export default function PriserJamforelse() {
  return (
    <section aria-labelledby="priser-jamforelse">
      <h2 id="priser-jamforelse" className="text-sm font-medium text-ink-3">
        {PR_SEKTIONER.jamforelse}
      </h2>
      <p className="mt-2 text-sm leading-[22px] text-ink-2">{PR_JAMFORELSE_INGRESS}</p>

      <JamforelseTabell className="mt-3" matSynlighet />
    </section>
  )
}

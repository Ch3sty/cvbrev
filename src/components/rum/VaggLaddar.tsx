/**
 * Väggen medan sidan laddar (konceptets L1): toppraden står som den ska,
 * rubriken och raden under som skelett i väggens eget ljus, i samma höjd
 * som det som kommer. Används av loading.tsx och av sidornas egna
 * laddvyer, så väggen aldrig hoppar när innehållet landar.
 *
 * Server component (Topprad är klient).
 */

import Vagg from './Vagg'
import Topprad from './Topprad'
import LoadingSkeleton from '@/components/shell/LoadingSkeleton'

export default function VaggLaddar({ label = 'Laddar' }: { label?: string }) {
  return (
    <Vagg tat>
      <Topprad />
      <LoadingSkeleton variant="vagg" label={label} />
    </Vagg>
  )
}

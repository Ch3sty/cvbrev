import Vagg from '@/components/rum/Vagg'
import Topprad from '@/components/rum/Topprad'
import Rubrik from '@/components/rum/Rubrik'
import LoadingSkeleton from '@/components/shell/LoadingSkeleton'
import { TESTER } from '@/components/tester-v4/tester/copy'

/** Tester laddar: väggen står med rubriken, inget hoppar. */
export default function Loading() {
  return (
    <Vagg tat>
      <Topprad />
      <p className="mt-4 text-ey text-vagg-mjuk lg:mt-2">{TESTER.vagg.eyebrow}</p>
      <Rubrik titel={TESTER.vagg.rubrik} className="!mt-1.5" />
      <LoadingSkeleton variant="vagg" label="Laddar" />
    </Vagg>
  )
}

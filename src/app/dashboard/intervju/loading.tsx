import LoadingSkeleton from '@/components/shell/LoadingSkeleton'
import VaggLaddar from '@/components/rum/VaggLaddar'
import Golv from '@/components/rum/Golv'

/** Skelett för Inför intervjun: väggen och det lyfta kortet, samma minsta höjd som sidan. */
export default function Loading() {
  return (
    <>
      <VaggLaddar label="Laddar Inför intervjun" />
      <Golv>
        <div className="min-h-[520px] w-full max-w-3xl space-y-6 sm:space-y-8" aria-busy="true">
          <LoadingSkeleton variant="card" label="Laddar Inför intervjun" />
        </div>
      </Golv>
    </>
  )
}

import LoadingSkeleton from '@/components/shell/LoadingSkeleton'
import VaggLaddar from '@/components/rum/VaggLaddar'
import Golv from '@/components/rum/Golv'

// Inställningar: väggen, raden Hoppa till och två kort. Skelettet står
// stilla, bara tråden rör sig.
export default function InstallningarLoading() {
  return (
    <>
      <VaggLaddar label="Laddar inställningarna" />
      <Golv>
        <div className="w-full max-w-[768px] space-y-4 sm:space-y-6" aria-label="Laddar inställningarna">
          <LoadingSkeleton variant="statusRow" />
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
        </div>
      </Golv>
    </>
  )
}

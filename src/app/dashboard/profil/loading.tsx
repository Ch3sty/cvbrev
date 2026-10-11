import LoadingSkeleton from '@/components/shell/LoadingSkeleton'
import VaggLaddar from '@/components/rum/VaggLaddar'
import Golv from '@/components/rum/Golv'

// Profilsidan: väggen, statusrad och två sektionskort. Skelettet står
// stilla, bara tråden rör sig.
export default function ProfilLoading() {
  return (
    <>
      <VaggLaddar label="Laddar profilen" />
      <Golv>
        <div className="space-y-4 sm:space-y-6" aria-label="Laddar profilen">
          <LoadingSkeleton variant="statusRow" />
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
        </div>
      </Golv>
    </>
  )
}

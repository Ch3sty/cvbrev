import LoadingSkeleton from '@/components/shell/LoadingSkeleton'

// Profilsidan: sidhuvud, statusrad och två sektionskort. Skelettet står
// stilla i insunken, bara tråden rör sig.
export default function ProfilLoading() {
  return (
    <div className="space-y-4 sm:space-y-6" aria-label="Laddar profilen">
      <LoadingSkeleton variant="text" count={2} label="Laddar profilen" />
      <LoadingSkeleton variant="statusRow" />
      <LoadingSkeleton variant="card" />
      <LoadingSkeleton variant="card" />
    </div>
  )
}

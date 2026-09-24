import LoadingSkeleton from '@/components/shell/LoadingSkeleton'

/** Skelett för Inför intervjun: sidhuvud och kort, samma minsta höjd som sidan. */
export default function Loading() {
  return (
    <div className="mx-auto min-h-[640px] max-w-3xl space-y-6 sm:space-y-8" aria-busy="true">
      <div className="space-y-3">
        <div className="h-4 w-16 rounded bg-insunken" />
        <div className="h-9 w-64 rounded bg-insunken" />
        <div className="h-5 w-full max-w-[420px] rounded bg-insunken" />
      </div>
      <LoadingSkeleton variant="card" label="Laddar Inför intervjun" />
    </div>
  )
}

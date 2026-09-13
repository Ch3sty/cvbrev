import { SkeletonPage, SkeletonBlock } from '@/components/dashboard/skeletons/PageSkeleton'

// Mina brev: sidhuvud, statusrad, sökrad och brevkort i två kolumner.
// Samma former som sidan, så bytet flyttar ingenting.
export default function MinaBrevLoading() {
  return (
    <SkeletonPage>
      <SkeletonBlock height={72} thread />
      <SkeletonBlock height={44} rounded="rounded-lg" />
      <SkeletonBlock height={44} rounded="rounded-lg" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} height={248} />
        ))}
      </div>
    </SkeletonPage>
  )
}

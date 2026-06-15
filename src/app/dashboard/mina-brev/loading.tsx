import { SkeletonPage, SkeletonHero, SkeletonBlock } from '@/components/dashboard/skeletons/PageSkeleton'

// Mina brev: hero + lista med brev-kort.
export default function MinaBrevLoading() {
  return (
    <SkeletonPage>
      <SkeletonHero />
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} height={150} rounded="rounded-2xl" />
        ))}
      </div>
    </SkeletonPage>
  )
}

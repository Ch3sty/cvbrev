import { SkeletonPage, SkeletonHero, SkeletonBlock } from '@/components/dashboard/skeletons/PageSkeleton'

// Jobbmatchning: hero + lista med matchnings-kort.
export default function JobbmatchningLoading() {
  return (
    <SkeletonPage>
      <SkeletonHero />
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} height={130} rounded="rounded-2xl" />
        ))}
      </div>
    </SkeletonPage>
  )
}

import { SkeletonPage, SkeletonHero, SkeletonBlock } from '@/components/dashboard/skeletons/PageSkeleton'

// Visas omedelbart vid navigering till dashboard, innan sidans JS laddats.
export default function DashboardLoading() {
  return (
    <SkeletonPage>
      <SkeletonHero />
      <SkeletonBlock height={180} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SkeletonBlock height={120} rounded="rounded-2xl" />
        <SkeletonBlock height={120} rounded="rounded-2xl" />
        <SkeletonBlock height={120} rounded="rounded-2xl" />
        <SkeletonBlock height={120} rounded="rounded-2xl" />
      </div>
    </SkeletonPage>
  )
}

import { SkeletonPage, SkeletonHero, SkeletonBlock } from '@/components/dashboard/skeletons/PageSkeleton'

// Visas omedelbart vid navigering till dashboard, innan sidans JS laddats.
// Speglar den faktiska layouten: hero/nudge, sex snabbåtgärdskort i
// 3-kolumnsgrid, statusrad, streak + status, aktivitet.
export default function DashboardLoading() {
  return (
    <SkeletonPage>
      <SkeletonHero />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <SkeletonBlock height={160} rounded="rounded-3xl" />
        <SkeletonBlock height={160} rounded="rounded-3xl" />
        <SkeletonBlock height={160} rounded="rounded-3xl" />
        <SkeletonBlock height={160} rounded="rounded-3xl" />
        <SkeletonBlock height={160} rounded="rounded-3xl" />
        <SkeletonBlock height={160} rounded="rounded-3xl" />
      </div>
      <SkeletonBlock height={64} rounded="rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4">
        <SkeletonBlock height={128} rounded="rounded-3xl" />
        <SkeletonBlock height={128} rounded="rounded-3xl" />
      </div>
      <SkeletonBlock height={240} rounded="rounded-3xl" />
    </SkeletonPage>
  )
}

import { SkeletonPage, SkeletonHero, SkeletonBlock } from '@/components/dashboard/skeletons/PageSkeleton'

// Visas omedelbart vid navigering till dashboard, innan sidans JS laddats.
// Speglar tillstånd C: statusrad, jobbsöksöversikt, nästa handling, pågår nu.
// Skelettet står stilla, tråden löper längs den första panelens överkant.
export default function DashboardLoading() {
  return (
    <SkeletonPage>
      <SkeletonBlock height={44} rounded="rounded-lg" />
      <SkeletonHero />
      <SkeletonBlock height={128} />
      <SkeletonBlock height={180} />
    </SkeletonPage>
  )
}

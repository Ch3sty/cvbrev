import { SkeletonPage, SkeletonHero, SkeletonBlock } from '@/components/dashboard/skeletons/PageSkeleton'

/**
 * Skelettet medan serverkomponenten läser CV-listan och kvotläget. Höjderna
 * speglar introts herokort plus de tre stegkorten under, alltså samma yta som
 * den färdiga sidan, så bytet inte flyttar något.
 */
export default function CvAnalysLoading() {
  return (
    <SkeletonPage>
      <SkeletonHero />
      <SkeletonBlock height={220} rounded="rounded-xl" />
      <SkeletonBlock height={160} rounded="rounded-xl" />
    </SkeletonPage>
  )
}

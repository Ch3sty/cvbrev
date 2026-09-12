import { SkeletonPage, SkeletonHero, SkeletonBlock } from '@/components/dashboard/skeletons/PageSkeleton'

/**
 * Skelettet medan serverkomponenten läser CV-listan och namnet. Höjderna
 * speglar steg 1: rubrikraden plus de två lägeskorten, alltså samma yta som
 * den färdiga sidan, så bytet inte flyttar något.
 */
export default function LinkedInOptimizerLoading() {
  return (
    <SkeletonPage>
      <SkeletonHero />
      <SkeletonBlock height={200} rounded="rounded-xl" />
      <SkeletonBlock height={200} rounded="rounded-xl" />
    </SkeletonPage>
  )
}

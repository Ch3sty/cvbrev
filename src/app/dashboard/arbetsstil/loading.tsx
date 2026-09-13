import { SkeletonPage, SkeletonHero, SkeletonBlock } from '@/components/dashboard/skeletons/PageSkeleton'

/**
 * Skelettet medan serverkomponenten läser personlighetsprofilen. Höjderna
 * speglar hero plus två sektionskort, alltså samma yta som den färdiga sidan
 * börjar med, så bytet inte flyttar något.
 */
export default function ArbetsstilLoading() {
  return (
    <SkeletonPage>
      <SkeletonHero />
      <SkeletonBlock height={224} rounded="rounded-xl" />
      <SkeletonBlock height={224} rounded="rounded-xl" />
    </SkeletonPage>
  )
}

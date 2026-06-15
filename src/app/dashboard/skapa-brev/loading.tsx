import { SkeletonPage, SkeletonHero, SkeletonBlock } from '@/components/dashboard/skeletons/PageSkeleton'

// Skapa brev: hero + steg-wizard-yta.
export default function SkapaBrevLoading() {
  return (
    <SkeletonPage>
      <SkeletonHero />
      <SkeletonBlock height={64} rounded="rounded-2xl" />
      <SkeletonBlock height={360} />
    </SkeletonPage>
  )
}

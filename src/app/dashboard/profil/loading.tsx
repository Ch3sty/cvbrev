import { SkeletonPage, SkeletonHero, SkeletonBlock } from '@/components/dashboard/skeletons/PageSkeleton'

// Profilsidan: hero + sektionskort med formulärfält.
export default function ProfilLoading() {
  return (
    <SkeletonPage>
      <SkeletonHero />
      <SkeletonBlock height={420} />
      <SkeletonBlock height={220} />
    </SkeletonPage>
  )
}

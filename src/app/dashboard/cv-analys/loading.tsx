import { SkeletonIntro } from '@/components/dashboard/skeletons/PageSkeleton'

/**
 * Skelettet medan serverkomponenten läser CV-listan och kvotläget. Sidan öppnar
 * i CVAnalysisIntro, så skelettet speglar dess fyra delar: sidhuvud, kvotrad,
 * handlingskortet med plattan och panelen "Så fungerar analysen". Wrappern är
 * introts egen (max-w-3xl, space-y-6, p-4), så bytet inte flyttar något.
 */
export default function CvAnalysLoading() {
  return (
    <div
      className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6"
      role="status"
      aria-busy="true"
      aria-label="Laddar sida"
    >
      <SkeletonIntro />
    </div>
  )
}

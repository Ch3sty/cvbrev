import { SkeletonIntro } from '@/components/dashboard/skeletons/PageSkeleton'
import VaggLaddar from '@/components/rum/VaggLaddar'
import Golv from '@/components/rum/Golv'

/**
 * Skelettet medan serverkomponenten läser CV-listan och kvotläget. Sidan öppnar
 * i CVAnalysisIntro, så skelettet speglar dess delar: väggen med rubriken,
 * kvotraden, handlingskortet med plattan och panelen "Så fungerar analysen".
 * Golvets kolumn är introts egen (max-w-3xl, space-y-6), så bytet inte flyttar
 * något.
 */
export default function CvAnalysLoading() {
  return (
    <>
      <VaggLaddar label="Laddar sida" />
      <Golv>
        <div className="w-full max-w-3xl space-y-6" role="status" aria-busy="true" aria-label="Laddar sida">
          <SkeletonIntro />
        </div>
      </Golv>
    </>
  )
}

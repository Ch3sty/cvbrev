import OgFrame from '@/components/og-preview/OgFrame'
import { ogBild } from '@/components/og-preview/ogBild'
import { OgPersonligtBrevIllustration } from '@/components/og-preview/OgIllustrations'
import { BREV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'

// Rubriken följer sidans h1, med antalet ur samma data som sidan.
const ANTAL = BREV_GALLERI.length

export const alt = `Personligt brev-exempel för ${ANTAL} yrken`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="Personligt brev-exempel"
        title={`Personligt brev-exempel för ${ANTAL} yrken`}
        subtitle="Börja med ditt."
        illustration={<OgPersonligtBrevIllustration />}
      />
    )
  )
}

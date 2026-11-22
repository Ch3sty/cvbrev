import OgFrame from '@/components/og-preview/OgFrame'
import { ogBild } from '@/components/og-preview/ogBild'
import { OgSkapaCvIllustration } from '@/components/og-preview/OgIllustrations'
import { CV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'

// Rubriken följer sidans h1, med antalet ur samma data som sidan.
const ANTAL = CV_GALLERI.length

export const alt = `CV-exempel för ${ANTAL} yrken`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="CV-exempel"
        title={`CV-exempel för ${ANTAL} yrken`}
        subtitle="Börja med ditt."
        illustration={<OgSkapaCvIllustration />}
      />
    )
  )
}

import OgFrame from '@/components/og-preview/OgFrame'
import { ogBild } from '@/components/og-preview/ogBild'
import { OgRekryteringstesterIllustration } from '@/components/og-preview/OgIllustrations'

// Rubriken är sidans h1, underraden sammanfattar hjältens första mening.
export const alt = 'Kandidater med bevisade färdigheter'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="För rekryterare"
        title="Kandidater med bevisade färdigheter"
        subtitle="Sök på kravprofilen och se verifierade testresultat"
        illustration={<OgRekryteringstesterIllustration />}
      />
    )
  )
}

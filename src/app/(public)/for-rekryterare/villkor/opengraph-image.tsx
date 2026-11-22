import OgFrame from '@/components/og-preview/OgFrame'
import { ogBild } from '@/components/og-preview/ogBild'
import { OgBliUpptacktIllustration } from '@/components/og-preview/OgIllustrations'

// Sidans egna openGraph-fält skriver annars över bilden som ärvs uppifrån,
// så att villkoren delades utan bild (SEO:s besked 2026-11-22). Rubriken är
// sidans h1.
export const alt = 'Villkor för rekryterare'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="För rekryterare"
        title="Villkor för rekryterare"
        subtitle="Så får kandidatpoolen användas"
        illustration={<OgBliUpptacktIllustration />}
      />
    )
  )
}

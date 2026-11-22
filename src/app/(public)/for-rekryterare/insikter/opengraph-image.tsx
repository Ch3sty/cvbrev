import { ImageResponse } from 'next/og'
import OgFrame from '@/components/og-preview/OgFrame'
import { OgArticlesListIllustration } from '@/components/og-preview/OgIllustrations'

// Rubriken är sidans h1, underraden sidans ingress i kort form.
export const alt = 'Insikter för rekryterare'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="För rekryterare"
        title="Insikter"
        subtitle="Urvalsforskning, kostnadskalkyler och regelverk"
        illustration={<OgArticlesListIllustration />}
      />
    ),
    { ...size }
  )
}

import { ImageResponse } from 'next/og'
import OgFrame from '@/components/og-preview/OgFrame'
import { OgCvMallarIllustration } from '@/components/og-preview/OgIllustrations'

export const alt = 'CV-mallar: professionella designs för svenska arbetsgivare'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="CV-mallar"
        title="Professionella CV-mallar"
        subtitle="Modern, traditionell och kreativ stil"
        illustration={<OgCvMallarIllustration />}
      />
    ),
    { ...size }
  )
}

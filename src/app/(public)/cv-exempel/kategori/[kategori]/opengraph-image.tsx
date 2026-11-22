import { ImageResponse } from 'next/og'
import OgFrame from '@/components/og-preview/OgFrame'
import { OgSkapaCvIllustration } from '@/components/og-preview/OgIllustrations'
import { KATEGORIER } from '@/app/(public)/exempel/components/exempel-data'

export const alt = 'CV-exempel per bransch'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Rubriken följer sidans h1, "CV-exempel för <bransch>".
export default async function Image({ params }: { params: Promise<{ kategori: string }> }) {
  const { kategori } = await params
  const kat = KATEGORIER.find((k) => k.slug === kategori)

  return new ImageResponse(
    (
      <OgFrame
        eyebrow="CV-exempel"
        title={kat ? `CV-exempel för ${kat.namn.toLowerCase()}` : 'CV-exempel per bransch'}
        illustration={<OgSkapaCvIllustration />}
      />
    ),
    { ...size }
  )
}

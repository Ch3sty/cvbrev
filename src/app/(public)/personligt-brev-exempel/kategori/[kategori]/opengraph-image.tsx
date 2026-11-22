import { ImageResponse } from 'next/og'
import OgFrame from '@/components/og-preview/OgFrame'
import { OgPersonligtBrevIllustration } from '@/components/og-preview/OgIllustrations'
import { KATEGORIER } from '@/app/(public)/exempel/components/exempel-data'

export const alt = 'Personligt brev-exempel per bransch'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Rubriken följer sidans h1, "Personligt brev-exempel för <bransch>".
export default async function Image({ params }: { params: Promise<{ kategori: string }> }) {
  const { kategori } = await params
  const kat = KATEGORIER.find((k) => k.slug === kategori)

  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Personligt brev-exempel"
        title={kat ? `Personligt brev-exempel för ${kat.namn.toLowerCase()}` : 'Personligt brev-exempel per bransch'}
        illustration={<OgPersonligtBrevIllustration />}
      />
    ),
    { ...size }
  )
}

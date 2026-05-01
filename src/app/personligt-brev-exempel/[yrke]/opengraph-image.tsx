import { ImageResponse } from 'next/og'
import OgFrame from '@/components/og-preview/OgFrame'
import { SLUG_TO_YRKE } from './og-yrke-map'

export const alt = 'Personligt brev exempel'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: { yrke: string }
}) {
  const yrke = SLUG_TO_YRKE[params.yrke] || 'Personligt brev'

  return new ImageResponse(<OgFrame variant="letter" yrke={yrke} />, {
    ...size,
  })
}

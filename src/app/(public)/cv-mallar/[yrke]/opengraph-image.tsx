import { ImageResponse } from 'next/og'
import OgFrame from '@/components/og-preview/OgFrame'
import OgCvMockup from '@/components/og-preview/OgCvMockup'
import { YRKESMALL_LIST } from '../yrkesmall-data'

export const alt = 'CV-mall för svenska yrken'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ yrke: string }>
}) {
  const { yrke } = await params
  const data = YRKESMALL_LIST.find(y => y.slug === yrke)
  const yrkesNamn = data?.namn || 'CV-mall'

  return new ImageResponse(
    (
      <OgFrame
        eyebrow="CV-mall för svenskt yrke"
        title={yrkesNamn}
        subtitle="ATS-säker · gratis och premium · uppdaterad 2026"
        illustration={<OgCvMockup />}
      />
    ),
    { ...size }
  )
}

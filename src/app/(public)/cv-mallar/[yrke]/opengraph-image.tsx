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
  const freeMallNamn = data?.freeMallNamn || 'Gratis'
  const premiumMallNamn = data?.premiumMallNamn || 'Premium'

  return new ImageResponse(
    (
      <OgFrame
        eyebrow="CV-mall"
        title={yrkesNamn}
        subtitle={`${freeMallNamn} (gratis) eller ${premiumMallNamn} (premium)`}
        illustration={<OgCvMockup />}
      />
    ),
    { ...size }
  )
}

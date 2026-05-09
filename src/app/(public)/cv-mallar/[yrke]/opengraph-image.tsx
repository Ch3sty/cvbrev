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
  const mallNamn = data?.mallNamn || 'Mall'

  return new ImageResponse(
    (
      <OgFrame
        eyebrow="CV-mall"
        title={yrkesNamn}
        subtitle={`${mallNamn}-design · ATS-säker · gratis`}
        illustration={<OgCvMockup />}
      />
    ),
    { ...size }
  )
}

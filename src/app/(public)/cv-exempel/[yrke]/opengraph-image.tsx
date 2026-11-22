import OgFrame from '@/components/og-preview/OgFrame'
import { ogBild } from '@/components/og-preview/ogBild'
import { SLUG_TO_YRKE } from './og-yrke-map'

export const alt = 'CV-exempel'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  // Next 16 ger params som ett löfte. Utan await blev slugen undefined och
  // varje yrkessida fick reservrubriken i stället för sitt yrke.
  params: Promise<{ yrke: string }>
}) {
  const { yrke: slug } = await params
  const yrke = SLUG_TO_YRKE[slug] || 'CV-exempel'

  return ogBild(<OgFrame variant="cv" yrke={yrke} />)
}

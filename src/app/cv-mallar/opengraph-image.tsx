import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgCvMallarIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = '8+ professionella CV-mallar för alla branscher';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="CV-mallar"
        title="Mallar för alla branscher"
        subtitle="8+ designer · ATS-optimerat"
        illustration={<OgCvMallarIllustration />}
      />
    ),
    { ...size }
  );
}

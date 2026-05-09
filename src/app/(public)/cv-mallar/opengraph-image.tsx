import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgCvMallarIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = '25 professionella CV-mallar för svenska yrken';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="CV-mallar"
        title="Mallar för alla yrken"
        subtitle="25 designer · ATS-säkra · gratis och premium"
        illustration={<OgCvMallarIllustration />}
      />
    ),
    { ...size }
  );
}

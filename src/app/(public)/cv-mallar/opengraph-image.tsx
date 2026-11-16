import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgCvMallarIllustration } from '@/components/og-preview/OgIllustrations';
import { GRATIS_ANTAL, MALL_ANTAL } from '@/lib/cv/mallar/katalog';

export const alt = `${MALL_ANTAL} CV-mallar som passar alla yrken, ${GRATIS_ANTAL} gratis`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="CV-mallar"
        title="Mallar för alla yrken"
        subtitle={`${MALL_ANTAL} designer · ATS-testade · ${GRATIS_ANTAL} gratis, alla i Premium`}
        illustration={<OgCvMallarIllustration />}
      />
    ),
    { ...size }
  );
}

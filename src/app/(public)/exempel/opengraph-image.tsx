import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgExempelIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Färdiga CV- och brev-exempel för 150+ yrken';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Inspiration"
        title="Färdiga exempel för 150+ yrken"
        subtitle="CV och personliga brev som imponerar"
        illustration={<OgExempelIllustration />}
      />
    ),
    { ...size }
  );
}

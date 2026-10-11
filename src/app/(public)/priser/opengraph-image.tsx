import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgJobbcoachenIllustration } from '@/components/og-preview/OgIllustrations';
import { PRISER_META } from './components/priser-data';

export const alt = PRISER_META.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow={PRISER_META.ogEyebrow}
        title={PRISER_META.ogTitle}
        subtitle={PRISER_META.ogSubtitle}
        illustration={<OgJobbcoachenIllustration />}
      />
    ),
    { ...size }
  );
}

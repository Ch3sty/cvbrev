import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgJobbcoachenIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Jobbcoachen — karriärråd när du behöver det';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Jobbcoachen"
        title="Karriärråd när du behöver det"
        subtitle="Lön · Intervju · Arbetsrätt · Tips"
        illustration={<OgJobbcoachenIllustration />}
      />
    ),
    { ...size }
  );
}

import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgJobbcoachenIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Karriärguiden: karriärrådgivning med svenska källor';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Karriärguiden"
        title="Karriärrådgivning med svenska källor"
        subtitle="Lön · Arbetsrätt · Intervju · Karriärbyte"
        illustration={<OgJobbcoachenIllustration />}
      />
    ),
    { ...size }
  );
}

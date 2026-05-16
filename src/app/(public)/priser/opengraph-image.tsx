import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgJobbcoachenIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Priser för Jobbcoach.ai Premium: börja gratis, uppgradera när du vill';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Priser"
        title="Börja gratis. Uppgradera när du vill."
        subtitle="7 dagars provperiod utan krav på kortuppgifter"
        illustration={<OgJobbcoachenIllustration />}
      />
    ),
    { ...size }
  );
}

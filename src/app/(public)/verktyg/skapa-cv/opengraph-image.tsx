import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgSkapaCvIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Skapa CV — ditt CV på 60 sekunder';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Skapa CV"
        title="Ditt CV på 60 sekunder"
        subtitle="Ladda upp eller börja från noll"
        illustration={<OgSkapaCvIllustration />}
      />
    ),
    { ...size }
  );
}

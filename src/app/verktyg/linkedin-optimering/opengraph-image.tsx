import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgLinkedinIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'LinkedIn-optimering — profilen som rekryterare hittar';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="LinkedIn-optimering"
        title="Profilen rekryterare hittar"
        subtitle="Headline · About · Sökord"
        illustration={<OgLinkedinIllustration />}
      />
    ),
    { ...size }
  );
}

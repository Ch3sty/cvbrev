import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgJobbcoachenIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Om Jobbcoach.ai: svenska jobbverktyg byggda för svensk arbetsmarknad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Om Jobbcoach.ai"
        title="Svenska jobbverktyg, byggda för Sverige"
        subtitle="Möt teamet och plattformen bakom"
        illustration={<OgJobbcoachenIllustration />}
      />
    ),
    { ...size }
  );
}

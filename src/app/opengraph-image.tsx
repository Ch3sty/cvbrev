import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgHomeIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Jobbcoach.ai — ta dig förbi rekryteringssystemen';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Jobbcoach.ai"
        title="Ta dig förbi rekryteringssystemen"
        subtitle="CV · Brev · LinkedIn · Matchning · Tester"
        illustration={<OgHomeIllustration />}
      />
    ),
    { ...size }
  );
}

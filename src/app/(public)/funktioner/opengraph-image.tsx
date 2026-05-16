import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgHomeIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Funktioner i Jobbcoach.ai: CV, personligt brev, jobbmatchning och mer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Funktioner"
        title="Allt du behöver för jobbet"
        subtitle="CV, personligt brev, jobbmatchning & rekryteringstester"
        illustration={<OgHomeIllustration />}
      />
    ),
    { ...size }
  );
}

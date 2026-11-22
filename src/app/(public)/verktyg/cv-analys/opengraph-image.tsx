import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgCvAnalysisIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'CV-analys: se var ditt CV tappar poäng';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="CV-analys"
        title="CV-analys: se var ditt CV tappar poäng"
        subtitle="Konkret feedback, ingen gissning"
        illustration={<OgCvAnalysisIllustration />}
      />
    ),
    { ...size }
  );
}

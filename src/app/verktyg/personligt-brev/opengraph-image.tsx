import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgPersonligtBrevIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Personligt brev — skräddarsydd ansökan på 60 sekunder';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Personligt brev"
        title="Brev som matchar varje jobb"
        subtitle="Skräddarsydd ansökan på 60 sek"
        illustration={<OgPersonligtBrevIllustration />}
      />
    ),
    { ...size }
  );
}

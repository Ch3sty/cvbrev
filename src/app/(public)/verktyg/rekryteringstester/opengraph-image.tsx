import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgRekryteringstesterIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Rekryteringstester: träna inför provet';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Rekryteringstester"
        title="Träna inför provet"
        subtitle="Matrislogik · Verbal · Numerisk · Personlighet"
        illustration={<OgRekryteringstesterIllustration />}
      />
    ),
    { ...size }
  );
}

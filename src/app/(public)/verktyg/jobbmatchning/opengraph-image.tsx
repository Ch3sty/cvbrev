import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgJobbmatchningIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Jobbmatchning: hitta jobb som matchar dig';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Jobbmatchning"
        title="Hitta jobb som matchar dig"
        subtitle="Vi matchar din profil mot tusentals annonser"
        illustration={<OgJobbmatchningIllustration />}
      />
    ),
    { ...size }
  );
}

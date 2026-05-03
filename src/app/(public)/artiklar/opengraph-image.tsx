import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgArticlesListIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Karriärbiblioteket — artiklar som tar dig vidare';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Karriärbiblioteket"
        title="Artiklar som tar dig vidare"
        subtitle="Tips, guider och insikter för din karriär"
        illustration={<OgArticlesListIllustration />}
      />
    ),
    { ...size }
  );
}

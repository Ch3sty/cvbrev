import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgJobbcoachenIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Priser för Jobbcoach.ai: en vecka som bär hela jobbsöket';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Priser"
        title="En vecka som bär hela jobbsöket."
        subtitle="Från 79 kr i veckan, ingen bindningstid, säg upp med ett klick."
        illustration={<OgJobbcoachenIllustration />}
      />
    ),
    { ...size }
  );
}

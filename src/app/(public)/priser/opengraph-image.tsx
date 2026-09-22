import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgJobbcoachenIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Priser för Jobbcoach.ai: välj spåret du söker på, börja med en vecka';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Priser"
        title="Välj spåret du söker på."
        subtitle="Börja med en vecka. Från 79 kr, säg upp när du vill."
        illustration={<OgJobbcoachenIllustration />}
      />
    ),
    { ...size }
  );
}

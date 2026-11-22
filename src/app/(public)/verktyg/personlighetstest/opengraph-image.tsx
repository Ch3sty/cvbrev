import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgPersonlighetstestIllustration } from '@/components/og-preview/OgIllustrations';

// Egen bild i segmentet. Bilden i /verktyg (mapp utan sida) ärvdes i det
// lokala webpack-bygget men inte i Vercels Turbopack-bygge, så sidan saknade
// og:image på live (SEO:s uppföljning 7.2, 2026-11-22).
export const alt = 'Personlighetstest: vad rekryteraren läser ut av dig';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Personlighetstest"
        title="Vad rekryteraren läser ut av dig"
        subtitle="Femfaktormodellen, din profil direkt"
        illustration={<OgPersonlighetstestIllustration />}
      />
    ),
    { ...size }
  );
}

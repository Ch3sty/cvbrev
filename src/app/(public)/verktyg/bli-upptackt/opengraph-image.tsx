import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgJobbmatchningIllustration } from '@/components/og-preview/OgIllustrations';

// Egen bild i segmentet. Bilden i /verktyg (mapp utan sida) ärvdes i det
// lokala webpack-bygget men inte i Vercels Turbopack-bygge, så sidan saknade
// og:image på live (SEO:s uppföljning 7.2, 2026-11-22).
export const alt = 'Bli upptäckt: låt rekryterare hitta dig';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Bli upptäckt"
        title="Låt rekryterare hitta dig"
        subtitle="Anonym tills du själv tackar ja"
        illustration={<OgJobbmatchningIllustration />}
      />
    ),
    { ...size }
  );
}

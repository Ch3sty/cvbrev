import OgFrame from '@/components/og-preview/OgFrame';
import { ogBild } from '@/components/og-preview/ogBild';
import { OgSkapaCvIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Skapa CV gratis: bygg ditt CV på minuter';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="Skapa CV"
        title="Skapa ditt CV gratis på minuter"
        subtitle="Ladda upp eller börja från noll"
        illustration={<OgSkapaCvIllustration />}
      />
    )
  );
}

import OgFrame from '@/components/og-preview/OgFrame';
import { ogBild } from '@/components/og-preview/ogBild';
import { OgJobbmatchningIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Jobbmatchning: hitta jobb som matchar ditt CV';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="Jobbmatchning"
        title="Hitta jobb som matchar ditt CV"
        subtitle="Vi söker bland tusentals lediga jobb från Arbetsförmedlingen"
        illustration={<OgJobbmatchningIllustration />}
      />
    )
  );
}

import OgFrame from '@/components/og-preview/OgFrame';
import { ogBild } from '@/components/og-preview/ogBild';
import { OgExempelIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Exempel för din jobbansökan: CV, personligt brev och mallar';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="Inspiration"
        title="Exempel för din jobbansökan"
        subtitle="CV, personligt brev och mallar"
        illustration={<OgExempelIllustration />}
      />
    )
  );
}

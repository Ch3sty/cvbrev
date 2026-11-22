import OgFrame from '@/components/og-preview/OgFrame';
import { ogBild } from '@/components/og-preview/ogBild';
import { OgPersonligtBrevIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Personligt brev: skräddarsy ditt brev till varje annons';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="Personligt brev"
        title="Skräddarsy ditt brev till varje annons"
        subtitle="Vi läser annonsen och ditt CV"
        illustration={<OgPersonligtBrevIllustration />}
      />
    )
  );
}

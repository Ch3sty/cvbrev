import OgFrame from '@/components/og-preview/OgFrame';
import { ogBild } from '@/components/og-preview/ogBild';
import { OgLinkedinIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'LinkedIn-optimering: profilen som rekryterare hittar';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="LinkedIn-optimering"
        title="Hamna i rekryterarnas sökresultat"
        subtitle="Rubrik · Om mig · Erfarenhet · Kompetenser"
        illustration={<OgLinkedinIllustration />}
      />
    )
  );
}

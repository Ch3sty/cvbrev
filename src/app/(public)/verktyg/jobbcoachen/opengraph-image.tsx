import OgFrame from '@/components/og-preview/OgFrame';
import { ogBild } from '@/components/og-preview/ogBild';
import { OgJobbcoachenIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Jobbcoachen: karriärrådgivning med svenska källor';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="Jobbcoachen"
        title="Karriärrådgivning med svenska källor"
        subtitle="Lön · Arbetsrätt · Intervju · Karriärbyte"
        illustration={<OgJobbcoachenIllustration />}
      />
    )
  );
}

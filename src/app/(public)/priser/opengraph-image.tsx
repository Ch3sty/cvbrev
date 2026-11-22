import OgFrame from '@/components/og-preview/OgFrame';
import { ogBild } from '@/components/og-preview/ogBild';
import { OgHomeIllustration } from '@/components/og-preview/OgIllustrations';
import { PRISER_META } from './components/priser-data';

export const alt = PRISER_META.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow={PRISER_META.ogEyebrow}
        title={PRISER_META.ogTitle}
        subtitle={PRISER_META.ogSubtitle}
        illustration={<OgHomeIllustration />}
      />
    )
  );
}

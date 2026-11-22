import OgFrame from '@/components/og-preview/OgFrame';
import { ogBild } from '@/components/og-preview/ogBild';
import { OgHomeIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Om Jobbcoach.ai: svenska jobbverktyg byggda för svensk arbetsmarknad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="Om Jobbcoach.ai"
        title="Svenska jobbverktyg, byggda för Sverige"
        subtitle="Från cvbrev.se till Jobbcoach.ai"
        illustration={<OgHomeIllustration />}
      />
    )
  );
}

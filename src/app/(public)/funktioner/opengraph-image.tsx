import OgFrame from '@/components/og-preview/OgFrame';
import { ogBild } from '@/components/og-preview/ogBild';
import { OgHomeIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Funktioner i Jobbcoach.ai: rekryteringstester, CV, personliga brev och Jobbsöket';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="Funktioner"
        title="Allt du behöver för att landa nästa jobb"
        subtitle="Rekryteringstester, CV, personliga brev och Jobbsöket"
        illustration={<OgHomeIllustration />}
      />
    )
  );
}

import OgFrame from '@/components/og-preview/OgFrame';
import { ogBild } from '@/components/og-preview/ogBild';
import { OgArticlesListIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Karriärbiblioteket: artiklar som förbättrar din jobbsökning';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="Karriärbiblioteket"
        title="Artiklar som förbättrar din jobbsökning"
        subtitle="Guider om rekryteringstester, CV och personliga brev"
        illustration={<OgArticlesListIllustration />}
      />
    )
  );
}

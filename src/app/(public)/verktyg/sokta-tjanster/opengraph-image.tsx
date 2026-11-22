import OgFrame from '@/components/og-preview/OgFrame';
import { ogBild } from '@/components/og-preview/ogBild';
import { OgSoktaTjansterIllustration } from '@/components/og-preview/OgIllustrations';

export const alt = 'Sökta tjänster: håll koll på varje jobb du har sökt';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        eyebrow="Sökta tjänster"
        title="Håll koll på varje jobb du har sökt"
        illustration={<OgSoktaTjansterIllustration />}
      />
    )
  );
}

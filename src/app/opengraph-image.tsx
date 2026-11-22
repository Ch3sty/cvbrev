import OgFrame from '@/components/og-preview/OgFrame';
import { ogBild } from '@/components/og-preview/ogBild';
import { OgHomeIllustration } from '@/components/og-preview/OgIllustrations';

// Startsidans delningsbild, och bilden för alla sidor utan egen. Rubriken är
// startsidans h1 (Startsidan.tsx) och underraden dess löfte i kort form:
// träning inför testet, CV:t och brevet som svarar på annonsen. Till höger
// hjältens fyra kort, ett per del.
export const alt =
  'Jobbcoach.ai: därför får du inte svar på dina ansökningar. Fyra kort visar rekryteringstester, CV-analys, personliga brev och Jobbsöket.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return ogBild(
    (
      <OgFrame
        title={'Därför får du\ninte svar på dina\nansökningar'}
        subtitle="Träna inför testet, vässa CV:t och skriv ett brev som svarar på annonsen."
        illustration={<OgHomeIllustration />}
      />
    )
  );
}

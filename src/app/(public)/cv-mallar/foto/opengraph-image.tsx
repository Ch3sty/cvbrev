import { ImageResponse } from 'next/og';
import OgFrame from '@/components/og-preview/OgFrame';
import { OgCvMallarIllustration } from '@/components/og-preview/OgIllustrations';
import { STIL_SIDOR, stilMallar } from '@/lib/seo/cv-kluster';

// Delningsbilden för stilsidan (B5), efter /cv-mallar:s mönster. Talen ur katalogen.
const SIDA = STIL_SIDOR.foto;
const ANTAL = stilMallar('foto').length;
const GRATIS = stilMallar('foto').filter((m) => m.niva === 'gratis').map((m) => m.namn).join(' och ');

export const alt = `${SIDA.h1}: ${ANTAL} mallar, ${GRATIS} gratis`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="CV-mallar"
        title={SIDA.kort}
        subtitle={`${ANTAL} mallar · ATS-testade · ${GRATIS} gratis`}
        illustration={<OgCvMallarIllustration />}
      />
    ),
    { ...size }
  );
}

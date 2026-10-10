'use client';

import RumHuvud from '@/components/rum/RumHuvud';
import { RUBRIK } from '@/lib/rum/copy';
import { TEMPLATE_COUNT } from '@/lib/cv/template-antal';

/**
 * Sidhuvudet för CV-mallar, på CV-rummets vägg (Rummen våg 1b). Sidans enda
 * h1 är undersidans namn (spec 16.3.2); den publika sidans rubrik "Samma
 * innehåll, en mall rekryteraren läser." hör inte hemma här. Väggen har
 * fast form, så inget hoppar när Inter landar. Scenen faller
 * bort i rummen: instrumenten är bilden.
 */
export default function CvMallarHero() {
  return (
    <RumHuvud
      title={RUBRIK.cvMallar}
      description={`Välj ett CV, välj en av ${TEMPLATE_COUNT} mallar, ladda ner som PDF. Alla klarar rekryteringssystemens läsning.`}
    />
  );
}

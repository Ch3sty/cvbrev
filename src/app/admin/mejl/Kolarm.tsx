'use client';

/**
 * Klientgränsen för Mejl-sidans köstatus.
 *
 * StatusRow i src/components/shell/ är en klientkomponent. Att rendera den
 * direkt ur en server component byggde igenom men föll i produktion med
 * "Expected clientReferenceManifest to be defined": sidan är force-dynamic
 * och Turbopack hade ingen klientreferens att slå upp för modulen. Drift
 * löste samma sak med Larmrader.tsx, alltså en tunn 'use client'-fil mellan
 * sidan och komponenten.
 *
 * Filen hämtar ingenting och avgör ingenting. Sidan vet om kön har fel, den
 * här ritar bara raden.
 */

import StatusRow from '@/components/shell/StatusRow';

export default function Kolarm({ antal }: { antal: number }) {
  return (
    <StatusRow tone="warm" showDot>
      {`${antal} schemalagda mejl har försökt och inte gått iväg`}
    </StatusRow>
  );
}

'use client';

/**
 * Klientgränsen för Drift-sidans larmrader.
 *
 * StatusRow i src/components/shell/ är en klientkomponent. Att rendera den
 * direkt ur en server component byggde igenom men föll i produktion med
 * "Expected clientReferenceManifest to be defined": sidan är
 * force-dynamic och Turbopack hade ingen klientreferens att slå upp för
 * modulen. Samma mönster som Funnel använder för AdminChart, alltså en tunn
 * 'use client'-fil mellan sidan och komponenten, löser det.
 *
 * Filen hämtar ingenting och räknar ingenting. Sidan avgör vilket larm som
 * är allvarligast, den här ritar bara raderna.
 */

import StatusRow from '@/components/shell/StatusRow';

export interface Larmrad {
  text: string;
  allvarligt: boolean;
}

export default function Larmrader({ larm }: { larm: Larmrad[] }) {
  return (
    <>
      {larm.map((l, i) => (
        <StatusRow
          key={l.text}
          showDot
          // Högst en warm per vy: bara det allvarligaste larmet tänds.
          tone={i === 0 ? (l.allvarligt ? 'warm' : 'positive') : 'neutral'}
        >
          {l.text}
        </StatusRow>
      ))}
    </>
  );
}

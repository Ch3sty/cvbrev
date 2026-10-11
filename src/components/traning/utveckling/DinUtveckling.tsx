'use client';

/**
 * PLATSHÅLLARE för fliken Din utveckling på Alla tester.
 *
 * Den riktiga vyn byggs i en egen gren (design/tester-lyft-utveckling) och
 * ersätter den här filen. Till dess står den gamla utvecklingsvyn kvar
 * bakom samma import, så att sidan fungerar som förut.
 *
 * Kontraktet som sidan (src/app/dashboard/tester/TesterHubClient.tsx)
 * håller:
 *
 * - Vyn ritar hela fliken: väggen (RumHuvud eller egen Vagg med Topprad)
 *   och golvet. Skissen Provbladet avsnitt 2 har kurvan på väggen och ett
 *   eget lyft kort ("Var du står") först på golvet.
 * - `flikar` är sidans flikar (Tester | Din utveckling). Vyn ställer dem
 *   direkt efter sitt lyfta kort, eller först på golvet om det inte finns
 *   något lyft kort, som i skissen.
 * - `data` är samma serverhämtade TesterHubData som fliken Tester får.
 * - Sidan lägger HjalpProvider runt båda flikarna; HjalpRad och HjalpKnapp
 *   fungerar alltså direkt i vyn.
 * - Komponenten laddas med next/dynamic, så den får gärna vara tung.
 */

import type { ReactNode } from 'react';
import RumHuvud from '@/components/rum/RumHuvud';
import Golv from '@/components/rum/Golv';
import { UNDERSIDA } from '@/lib/rum/copy';
import DevelopmentView from '@/app/dashboard/tester/components/DevelopmentView';
import type { TesterHubData } from '@/app/dashboard/tester/getHubData';

export interface DinUtvecklingProps {
  data: TesterHubData;
  /** Sidans flikar. Står efter vyns lyfta kort, eller först på golvet. */
  flikar: ReactNode;
}

export default function DinUtveckling({ data, flikar }: DinUtvecklingProps) {
  return (
    <>
      <RumHuvud title={UNDERSIDA.allaTester} />
      <Golv>
        <div className="w-full max-w-3xl space-y-4 sm:space-y-6">
          {flikar}
          <DevelopmentView perTest={data.perTest} hasHistory={data.hasHistory} scope={data.scope} />
        </div>
      </Golv>
    </>
  );
}

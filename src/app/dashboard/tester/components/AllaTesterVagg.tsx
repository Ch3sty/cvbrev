'use client';

/**
 * Väggen på Alla tester (skiss Provbladet, version 3, avsnitt 1).
 *
 * Väggen säger var du är. För den som är ny förklarar den formatet i tre
 * glasrutor ("Så går det till") med rummets 48-symboler, och på dator står
 * scenen IlluScenVagen till höger. Rutorna och scenen försvinner när
 * minst ett test är gjort, samma villkor som hjälpens första gång, så att
 * den vana får en lägre vägg.
 *
 * Väggen bär aldrig KNAPP_PRIMAR (spec 16.3.1); den står i det lyfta kortet.
 */

import type { ReactNode } from 'react';
import Vagg from '@/components/rum/Vagg';
import Topprad from '@/components/rum/Topprad';
import Lagesrad from '@/components/rum/Lagesrad';
import Rubrik from '@/components/rum/Rubrik';
import { SymMatris, SymPlan } from '@/components/illustrations/RumSymboler';
import { IlluScenVagen } from '@/components/traning/illu';
import SymProv from './SymProv';

export interface SaGarDetTillSteg {
  rubrik: string;
  text: string;
}

export const SA_GAR_DET_TILL_ETIKETT = 'Så går det till';

export function saGarDetTillSteg(fragorSpann: string): SaGarDetTillSteg[] {
  return [
    { rubrik: '1. Du får frågor', text: `${fragorSpann} per test, i provets format.` },
    { rubrik: '2. Mot klockan', text: 'Tiden visas, men räknar aldrig ner.' },
    { rubrik: '3. Nivå och genomgång', text: 'Facit, regeln och var du tappar.' },
  ];
}

const SYMBOLER = [SymMatris, SymProv, SymPlan] as const;

export default function AllaTesterVagg({
  titel,
  beskrivning,
  steg,
  tat,
}: {
  titel: ReactNode;
  beskrivning: ReactNode;
  /** Så går det till. null döljer rutorna och scenen. */
  steg: SaGarDetTillSteg[] | null;
  /** Inget lyft kort under väggen. */
  tat?: boolean;
}) {
  return (
    <Vagg tat={tat}>
      <Topprad />
      <Lagesrad aktiv="alla" />
      <div className={steg ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end lg:gap-8' : undefined}>
        <div className="min-w-0">
          <Rubrik titel={titel} rad={beskrivning} />
          {steg ? (
            <ol
              aria-label={SA_GAR_DET_TILL_ETIKETT}
              className="mt-4 grid list-none grid-cols-3 gap-2.5 p-0 lg:grid-cols-[repeat(3,minmax(0,220px))] lg:gap-3"
              data-sa-gar-det-till
            >
              {steg.map((s, i) => {
                const Sym = SYMBOLER[i] ?? SymMatris;
                return (
                  <li
                    key={s.rubrik}
                    className="min-w-0 rounded-[14px] border border-vagg-kant bg-white/[.05] px-3 pb-2 pt-2.5 lg:px-3.5 lg:pb-3 lg:pt-3.5"
                  >
                    <Sym size={32} className="mb-1 h-8 w-8 text-vagg-ink lg:mb-2 lg:h-10 lg:w-10" />
                    <b className="block text-[13px] font-semibold leading-[17px] text-vagg-ink lg:text-sm lg:leading-[18px]">
                      {s.rubrik}
                    </b>
                    <span className="mt-[3px] block text-[12px] leading-4 text-vagg-mjuk lg:text-[13px] lg:leading-[18px]">
                      {s.text}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </div>
        {steg ? (
          <div className="illu-vagg hidden lg:block" aria-hidden="true">
            <IlluScenVagen size={240} />
          </div>
        ) : null}
      </div>
    </Vagg>
  );
}

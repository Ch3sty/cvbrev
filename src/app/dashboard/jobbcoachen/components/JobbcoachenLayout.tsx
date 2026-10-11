'use client';

import { ReactNode } from 'react';
import Vagg from '@/components/rum/Vagg';
import Topprad from '@/components/rum/Topprad';
import Rubrik from '@/components/rum/Rubrik';
import Golv from '@/components/rum/Golv';

interface JobbcoachenLayoutProps {
  /** Scrollbart innehåll (välkomst eller meddelanden) */
  children: ReactNode;
  /** Inmatningsdelen längst ner i panelen */
  inputArea: ReactNode;
}

/**
 * Chatten i Jobbsöket (Rummen våg 1b): väggen med toppraden och rubriken,
 * sedan panelen på golvet. Chatten är ett läge som fyller resten av
 * skärmen: en panel med scroll inuti, så inmatningen står i bild utan att
 * sidan rullar.
 *
 * Panelens höjd räknas mot väggen, som här har fast höjd: topprad (60 px,
 * 72 på dator), rubriken på en rad (36 px, 46 på dator), 8 px luft och 24 px
 * botten. Därtill golvets 16 px överluft och skalets bottenluft (24 px över
 * navet på mobil, 40 px på dator). 100dvh, inte 100vh: på iOS Safari krymper
 * inte 100vh när adressfältet fälls in.
 *
 * Ingen animate-thread-enter här: LCP kan inte registreras på ett helt
 * genomskinligt element. Sidbytet tonas redan in en gång i DashboardShell.
 */
export default function JobbcoachenLayout({
  children,
  inputArea,
}: JobbcoachenLayoutProps) {
  return (
    <>
      <Vagg tat>
        <Topprad />
        <Rubrik titel="Jobbcoachen" />
      </Vagg>
      <Golv>
        <div className="flex h-[calc(100dvh-var(--bottom-nav-h)-168px)] min-h-[360px] flex-col overflow-hidden rounded-2xl border border-kant bg-papper lg:h-[calc(100dvh-206px)]">
          {/* Scrollbar mitt */}
          <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
            <div className="mx-auto flex min-h-full max-w-3xl flex-col space-y-4 sm:space-y-6">
              {children}
            </div>
          </div>

          {/* Inmatning i botten */}
          <div className="border-t border-kant bg-papper">
            <div className="mx-auto max-w-3xl">
              {inputArea}
            </div>
          </div>
        </div>
      </Golv>
    </>
  );
}

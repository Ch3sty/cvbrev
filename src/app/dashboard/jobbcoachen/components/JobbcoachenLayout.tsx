'use client';

import { ReactNode } from 'react';
import Vagg from '@/components/rum/Vagg';
import Topprad from '@/components/rum/Topprad';
import Rubrik from '@/components/rum/Rubrik';

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
 * Höjden följer golvets kolumn (spec 16.2 fråga 16): sidan står i en
 * kolumn med main:s höjd (globals.css, [data-jobbcoachen]) och panelen är
 * flex-1 min-h-0, så den fyller det som blir kvar under väggen utan att
 * väggen mäts. Under 360 px höjd rullar sidan i stället.
 *
 * Ingen animate-thread-enter här: LCP kan inte registreras på ett helt
 * genomskinligt element. Sidbytet tonas redan in en gång i DashboardShell.
 */
export default function JobbcoachenLayout({
  children,
  inputArea,
}: JobbcoachenLayoutProps) {
  return (
    <div data-jobbcoachen className="flex min-h-0 flex-1 flex-col">
      <Vagg tat>
        <Topprad />
        <Rubrik titel="Jobbcoachen" />
      </Vagg>
      <div className="flex min-h-0 flex-1 flex-col px-4 pt-4 lg:px-10 lg:pt-6">
        <div className="mx-auto flex min-h-[360px] w-full max-w-[1120px] flex-1 flex-col overflow-hidden rounded-2xl border border-kant bg-papper">
          {/* Scrollbar mitt */}
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
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
      </div>
    </div>
  );
}

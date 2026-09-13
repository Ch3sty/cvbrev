'use client';

import { ReactNode } from 'react';

interface JobbcoachenLayoutProps {
  /** Scrollbart innehåll (välkomst eller meddelanden) */
  children: ReactNode;
  /** Inmatningsdelen längst ner i panelen */
  inputArea: ReactNode;
}

export default function JobbcoachenLayout({
  children,
  inputArea,
}: JobbcoachenLayoutProps) {
  return (
    /* Chatten är ett läge som fyller main-ytan: en panel med scroll inuti.
       100dvh, inte 100vh: på iOS Safari krymper inte 100vh när adressfältet
       fälls in, så inmatningsfältet hamnade bakom browserchromet precis när
       tangentbordet var uppe. Bottennavets höjd kommer från --bottom-nav-h
       i stället för en gissad rem-siffra. Kvar att dra av: header 4rem plus
       mainens vertikala padding 1.5rem.

       Ingen animate-thread-enter här: den börjar på opacity 0, och LCP kan
       inte registreras på ett helt genomskinligt element, så hela chatten
       mätte flera hundra millisekunder senare än den faktiskt målades.
       Sidbytet tonas redan in en gång i DashboardShell. */
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-kant bg-panel"
      style={{
        height: 'calc(100dvh - 4rem - 1.5rem - var(--bottom-nav-h))',
      }}
    >
      {/* Scrollbar mitt */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col space-y-4 sm:space-y-6">
          {children}
        </div>
      </div>

      {/* Inmatning i botten */}
      <div className="border-t border-kant bg-panel">
        <div className="mx-auto max-w-3xl">
          {inputArea}
        </div>
      </div>
    </div>
  );
}

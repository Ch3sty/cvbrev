'use client';

import { ReactNode } from 'react';

interface JobbcoachenLayoutProps {
  /** Scrollbart innehåll (welcome eller meddelanden) */
  children: ReactNode;
  /** Sticky input-area längst ner i chatt-kortet */
  inputArea: ReactNode;
}

export default function JobbcoachenLayout({
  children,
  inputArea,
}: JobbcoachenLayoutProps) {
  return (
    <>
      {/* Sidspecifik bakgrund: läcker ut på hela dashboard-main-arean så att
          dashboard-gradienten inte syns någonstans i Jobbcoachen-vyn. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            '#FFFFFF',
        }}
      />

      {/* Chatt-kortet: fyller hela main-ytan med en enhetlig border, scroll inuti.
          100dvh, inte 100dvh: på iOS Safari krymper inte 100dvh när adressfältet
          fälls in, så inmatningsfältet hamnade bakom browserchromet precis när
          tangentbordet var uppe. Bottennavets höjd kommer från --bottom-nav-h
          i stället för en gissad rem-siffra. Kvar att dra av: header 4rem plus
          mainens vertikala padding 1.5rem. */}
      <div
        className="flex flex-col bg-white/70 backdrop-blur-sm rounded-xl border border-orange-200/60 overflow-hidden"
        style={{
          height: 'calc(100dvh - 4rem - 1.5rem - var(--bottom-nav-h))',
        }}
      >
        {/* Scrollbart meddelande-område */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-8">
          <div className="max-w-3xl mx-auto min-h-full flex flex-col space-y-6 sm:space-y-8">
            {children}
          </div>
        </div>

        {/* Input-area längst ner i kortet */}
        <div className="border-t border-orange-100/70 bg-white/90 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            {inputArea}
          </div>
        </div>
      </div>
    </>
  );
}

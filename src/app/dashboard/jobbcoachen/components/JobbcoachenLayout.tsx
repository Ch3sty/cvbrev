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
            'linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 40%, #FFFFFF 100%)',
        }}
      />

      {/* Chatt-kortet: fyller hela main-ytan med en enhetlig border, scroll inuti.
          Höjd matchar dashboard-mainens tillgängliga utrymme:
          - Mobile: 100vh − header (~4rem) − mobile bottom-nav padding (~6rem) − main top-padding (~0.75rem) ≈ 100vh − 11rem
          - Desktop (lg+): 100vh − header (~4rem) − main vertical padding (~3rem) ≈ 100vh − 7rem */}
      <div className="h-[calc(100vh-11rem)] sm:h-[calc(100vh-10rem)] lg:h-[calc(100vh-7rem)] flex flex-col bg-white/70 backdrop-blur-sm rounded-3xl border border-orange-200/60 overflow-hidden"
        style={{ boxShadow: '0 12px 40px -16px rgba(249, 115, 22, 0.18)' }}
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

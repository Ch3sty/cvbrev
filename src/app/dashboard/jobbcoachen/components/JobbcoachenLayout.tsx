'use client';

import { ReactNode } from 'react';

interface JobbcoachenLayoutProps {
  children: ReactNode;
}

export default function JobbcoachenLayout({ children }: JobbcoachenLayoutProps) {
  return (
    <div className="relative">
      {/* Sidspecifik bakgrund: enhetlig varm-vit yta som överrider dashboard-gradienten
          så att hela Jobbcoachen-vyn (hero, dokument-rad, chatt, input) ligger på en yta. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-3 -my-3 sm:-mx-4 sm:-my-4 md:-mx-6 md:-my-6 -z-10"
        style={{
          background:
            'linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 30%, #FFFFFF 100%)',
        }}
      />

      <div className="max-w-3xl mx-auto py-2 sm:py-6 pb-32 sm:pb-20 space-y-6 sm:space-y-8">
        {children}
      </div>
    </div>
  );
}

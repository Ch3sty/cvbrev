'use client';

import { ReactNode } from 'react';

interface LetterFlowLayoutProps {
  children: ReactNode;
}

export default function LetterFlowLayout({ children }: LetterFlowLayoutProps) {
  return (
    <div className="bg-gradient-to-b from-orange-50/30 via-white to-white min-h-screen">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-32 sm:pb-20 space-y-6 sm:space-y-8">
        {children}
      </main>
    </div>
  );
}

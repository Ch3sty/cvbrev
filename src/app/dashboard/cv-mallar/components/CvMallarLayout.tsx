'use client';

import { ReactNode } from 'react';

interface CvMallarLayoutProps {
  children: ReactNode;
}

/**
 * Kolumnen för CV-mallar. Skalet äger marken och toppraden, så sidan sätter
 * ingen egen bakgrund och ingen egen tillbakalänk. Bort: radial-glowen,
 * breadcrumben i versaler och orange streck.
 */
export default function CvMallarLayout({ children }: CvMallarLayoutProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 sm:pb-20">
      {children}
    </div>
  );
}

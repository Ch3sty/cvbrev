'use client';

/**
 * Kolumnen för de vyer i skapa brev som inte ligger i FlowShell, i dag bara
 * kvotspärren. Marken kommer från DashboardShell.
 */

import { ReactNode } from 'react';

interface LetterFlowLayoutProps {
  children: ReactNode;
}

export default function LetterFlowLayout({ children }: LetterFlowLayoutProps) {
  return <div className="mx-auto w-full max-w-3xl space-y-4 pb-16 sm:space-y-6">{children}</div>;
}

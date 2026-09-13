'use client';

import { ReactNode } from 'react';

/**
 * Kolumnen i CV-analysens flöde. FlowShell äger mark, topprad och fot;
 * det här är bara bredden och luften.
 */
export default function AnalysisFlowLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-3xl space-y-4 pb-4 sm:space-y-6">{children}</div>;
}

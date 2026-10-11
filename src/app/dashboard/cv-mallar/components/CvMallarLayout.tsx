'use client';

import { ReactNode } from 'react';
import Golv from '@/components/rum/Golv';

interface CvMallarLayoutProps {
  children: ReactNode;
}

/**
 * Kolumnen för CV-mallar, på golvet under väggen. Skalet äger bakgrunden
 * och avståndet till navet, så sidan sätter ingen egen bakgrund och ingen
 * egen bottenluft.
 */
export default function CvMallarLayout({ children }: CvMallarLayoutProps) {
  return (
    <Golv>
      <div className="w-full max-w-6xl space-y-6">{children}</div>
    </Golv>
  );
}

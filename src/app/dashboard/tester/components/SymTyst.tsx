'use client';

/**
 * Den tystade symbolen (#s-tyst i skissen Testerna v2): ett blad med rader
 * och ett snett streck över. Står i personlighetskortets rad "Inga rätta
 * svar, ingen klocka." där de kognitiva korten har provraden.
 */

import { IlluSvg, type IlluProps } from '@/components/illustrations/primitives';

export default function SymTyst(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <rect x="10" y="10" width="28" height="28" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 18h16M16 25h10M16 32h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      <path d="M12 38L36 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </IlluSvg>
  );
}

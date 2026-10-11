'use client';

/**
 * Provläget i 48 (#s-prov i skissen Provbladet): bladet med rader, en
 * klocka och kopparpunkten på "här är du". Står i "Så går det till" på
 * väggen och i provraden på testkortet.
 */

import { ILLU, IlluSvg, type IlluProps } from '@/components/illustrations/primitives';

export default function SymProv(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <rect x="8" y="6" width="32" height="36" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M15 15h18M15 22h12M15 29h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      <circle cx="33" cy="34" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M33 30.5V34l2.2 1.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12.5" cy="15" r="2.4" fill={ILLU.accent} />
    </IlluSvg>
  );
}

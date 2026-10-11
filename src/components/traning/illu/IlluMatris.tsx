'use client'

/**
 * Logik, matris (illu-matris, 160 × 120). Säger: du ska hitta regeln och
 * fylla luckan. Latinsk kvadrat, nionde rutan streckad, tre svar till höger.
 * Kopparn: det rätta svaret, kvadraten i mittenalternativet.
 */

import { A, DIM, FILL, IlluRam, type IlluProvbladProps } from './Provbladet'

export default function IlluMatris(p: IlluProvbladProps) {
  return (
    <IlluRam w={160} h={120} {...p}>
      <rect x="16" y="16" width="72" height="72" rx="8" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <path d="M40 16v72M64 16v72M16 40h72M16 64h72" stroke={DIM} strokeWidth="2.5" />
      <circle cx="28" cy="28" r="5" fill="currentColor" />
      <rect x="47" y="23" width="10" height="10" rx="2" fill="currentColor" />
      <path d="M76 22.5l5.5 10h-11z" fill="currentColor" />
      <rect x="23" y="47" width="10" height="10" rx="2" fill="currentColor" />
      <path d="M52 46.5l5.5 10h-11z" fill="currentColor" />
      <circle cx="76" cy="52" r="5" fill="currentColor" />
      <path d="M28 70.5l5.5 10h-11z" fill="currentColor" />
      <circle cx="52" cy="76" r="5" fill="currentColor" />
      <rect x="67" y="67" width="18" height="18" rx="4" stroke={DIM} strokeWidth="2.5" strokeDasharray="4 3" />
      <rect x="104" y="16" width="40" height="24" rx="8" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <rect x="104" y="48" width="40" height="24" rx="8" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <rect x="104" y="80" width="40" height="24" rx="8" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <circle cx="124" cy="28" r="5" fill="currentColor" />
      <rect x="118" y="54" width="12" height="12" rx="2.5" fill={A} />
      <path d="M124 86.5l5.5 10h-11z" fill="currentColor" />
    </IlluRam>
  )
}

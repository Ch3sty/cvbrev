'use client'

/**
 * Personlighet (illu-personlighet, 160 × 120). Säger: här finns inget rätt
 * svar, bara ditt. Två påståenderader över en skala med fem punkter.
 * Kopparn: din punkt på skalan.
 */

import { A, DIM, FILL, IlluRam, type IlluProvbladProps } from './Provbladet'

export default function IlluPersonlighet(p: IlluProvbladProps) {
  return (
    <IlluRam w={160} h={120} {...p}>
      <path d="M24 28h96" stroke="currentColor" strokeWidth="3" />
      <path d="M24 44h64" stroke={DIM} strokeWidth="3" />
      <path d="M24 80h112" stroke={DIM} strokeWidth="3" />
      <circle cx="24" cy="80" r="6" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <circle cx="52" cy="80" r="6" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <circle cx="80" cy="80" r="6" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <circle cx="136" cy="80" r="6" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <circle cx="108" cy="80" r="8" fill={A} />
      <path d="M16 100h20M124 100h20" stroke={DIM} strokeWidth="3" />
    </IlluRam>
  )
}

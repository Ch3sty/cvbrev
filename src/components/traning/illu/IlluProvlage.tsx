'use client'

/**
 * Provläge (illu-provlage, 160 × 120). Säger: som på riktigt, mot klockan,
 * facit efteråt. Tio frågor i rad, tre gjorda på mjuk yta, tidslinje nertill.
 * Kopparn: frågan du står på.
 */

import { A, DIM, FILL, MJUK, IlluRam, type IlluProvbladProps } from './Provbladet'

const GJORDA = [24, 48, 72]
const RAD2 = [24, 48, 72, 96, 120]

export default function IlluProvlage(p: IlluProvbladProps) {
  return (
    <IlluRam w={160} h={120} {...p}>
      <rect x="16" y="8" width="128" height="80" rx="8" fill={FILL} stroke="currentColor" strokeWidth="3" />
      {GJORDA.map((x) => (
        <rect key={x} x={x} y="24" width="16" height="16" rx="4" fill={MJUK} stroke={DIM} strokeWidth="2.5" />
      ))}
      <rect x="96" y="24" width="16" height="16" rx="4" fill={A} />
      <rect x="120" y="24" width="16" height="16" rx="4" stroke={DIM} strokeWidth="2.5" />
      {RAD2.map((x) => (
        <rect key={x} x={x} y="52" width="16" height="16" rx="4" stroke={DIM} strokeWidth="2.5" />
      ))}
      <path d="M16 104h128" stroke={DIM} strokeWidth="3" />
      <path d="M16 104h64" stroke="currentColor" strokeWidth="3" />
      <path d="M16 98v12M144 98v12" stroke="currentColor" strokeWidth="3" />
    </IlluRam>
  )
}

'use client'

/**
 * Tomt tillstånd på Din utveckling (illu-tomt-utveckling, 160 × 120). Säger:
 * kurvan ritas när du gjort ditt första test. Axlar, streckad kurva, tomma
 * ringar där försöken kommer. Kopparn: punkten där du börjar.
 */

import { A, DIM, FILL, IlluRam, type IlluProvbladProps } from './Provbladet'

export default function IlluTomtUtveckling(p: IlluProvbladProps) {
  return (
    <IlluRam w={160} h={120} {...p}>
      <path d="M24 16v80h120" stroke={DIM} strokeWidth="3" />
      <path d="M32 88C56 84 72 62 96 50S124 36 136 30" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" />
      <circle cx="64" cy="71" r="5" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <circle cx="96" cy="50" r="5" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <circle cx="128" cy="33" r="5" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <circle cx="32" cy="88" r="7" fill={A} />
    </IlluRam>
  )
}

'use client'

/**
 * Numeriskt (illu-numeriskt, 160 × 120). Säger: läs av, räkna, under tid.
 * Tabell 3 × 3 med tal som streck, en cell på mjuk yta, klocka i hörnet.
 * Kopparn: svarsrutan.
 */

import { A, DIM, FILL, MJUK, IlluRam, type IlluProvbladProps } from './Provbladet'

export default function IlluNumeriskt(p: IlluProvbladProps) {
  return (
    <IlluRam w={160} h={120} {...p}>
      <rect x="8" y="16" width="96" height="72" rx="8" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <rect x="74" y="42" width="28" height="20" rx="4" fill={MJUK} />
      <path d="M40 16v72M72 16v72M8 40h96M8 64h96" stroke={DIM} strokeWidth="2.5" />
      <path d="M16 28h14M48 28h12M80 28h14M16 52h10M48 52h16M16 76h16M48 76h10M80 76h16" stroke={DIM} strokeWidth="3" />
      <path d="M80 52h12" stroke="currentColor" strokeWidth="3" />
      <circle cx="136" cy="28" r="12" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <path d="M136 28v-7M136 28l5 3.5" stroke="currentColor" strokeWidth="3" />
      <rect x="112" y="64" width="40" height="24" rx="8" fill={A} />
    </IlluRam>
  )
}

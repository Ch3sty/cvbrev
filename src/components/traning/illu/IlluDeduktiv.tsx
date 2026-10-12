'use client'

/**
 * Deduktiv slutledning (deduktiv-spec.md 4.1, 160 × 120). Säger: ur några
 * rader följer vad som står på en plats. Bladet med tre premissrader, en
 * remsa med fem platser under. Kopparn: platsen svaret fyller, den tredje.
 */

import { A, DIM, FILL, IlluRam, type IlluProvbladProps } from './Provbladet'

const PLATSER = [28.5, 51.7, 74.9, 98.1, 121.3]

export default function IlluDeduktiv(p: IlluProvbladProps) {
  return (
    <IlluRam w={160} h={120} {...p}>
      <rect x="8" y="8" width="144" height="104" rx="8" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <path d="M22 28h58M22 42h44M22 56h66" stroke={DIM} strokeWidth="3" />
      <rect x="22" y="72" width="116" height="26" rx="6" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <path d="M45.2 72v26M68.4 72v26M91.6 72v26M114.8 72v26" stroke={DIM} strokeWidth="2.5" />
      {PLATSER.map((x, i) => (
        <rect key={x} x={x} y="80" width="10" height="10" rx="2" fill={i === 2 ? A : 'currentColor'} />
      ))}
    </IlluRam>
  )
}

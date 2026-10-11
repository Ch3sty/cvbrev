'use client'

/**
 * Verbalt (illu-verbalt, 160 × 120). Säger: läs texten, ta ställning till
 * påståendet. Textblock med en rad på mjuk yta, tre svar bredvid.
 * Kopparn: den valda svarscirkeln.
 */

import { A, DIM, FILL, MJUK, IlluRam, type IlluProvbladProps } from './Provbladet'

export default function IlluVerbalt(p: IlluProvbladProps) {
  return (
    <IlluRam w={160} h={120} {...p}>
      <rect x="8" y="8" width="88" height="104" rx="8" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <rect x="16" y="52" width="72" height="16" rx="4" fill={MJUK} />
      <path d="M20 28h64M20 44h52M20 60h64M20 76h44M20 92h64" stroke={DIM} strokeWidth="3" />
      <circle cx="120" cy="36" r="7" fill={A} />
      <path d="M136 36h16" stroke={DIM} strokeWidth="3" />
      <circle cx="120" cy="60" r="6" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <path d="M136 60h16" stroke={DIM} strokeWidth="3" />
      <circle cx="120" cy="84" r="6" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <path d="M136 84h16" stroke={DIM} strokeWidth="3" />
    </IlluRam>
  )
}
